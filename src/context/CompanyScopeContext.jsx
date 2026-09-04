import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from './AuthContext'

// For a customer, the "scope" is always their own company.
// For an admin, the scope is whichever company they choose to act on
// behalf of via the company switcher (see CompanyScopeBanner).
const CompanyScopeContext = createContext(null)

export function CompanyScopeProvider({ children }) {
  const { isAdmin, companyId } = useAuth()
  const [companies, setCompanies] = useState([])
  const [scopeCompanyId, setScopeCompanyId] = useState(null)
  const [loading, setLoading] = useState(isAdmin)

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    supabase
      .from('companies')
      .select('id, name')
      .order('name')
      .then(({ data, error }) => {
        if (!active) return
        if (!error && data) {
          setCompanies(data)
          setScopeCompanyId((prev) => prev ?? data[0]?.id ?? null)
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isAdmin])

  const effectiveCompanyId = isAdmin ? scopeCompanyId : companyId

  const value = {
    isAdmin,
    companies,
    companyId: effectiveCompanyId,
    scopeCompanyId,
    setScopeCompanyId,
    loading,
  }

  return <CompanyScopeContext.Provider value={value}>{children}</CompanyScopeContext.Provider>
}

export function useCompanyScope() {
  const ctx = useContext(CompanyScopeContext)
  if (!ctx) throw new Error('useCompanyScope must be used within CompanyScopeProvider')
  return ctx
}
