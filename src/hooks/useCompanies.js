import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('companies').select('id, name').order('name')
    if (!error) setCompanies(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  return { companies, loading, refetch: fetchCompanies }
}
