import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at, companies(name)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else {
      setProfiles(data)
      setError('')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  return { profiles, loading, error, refetch: fetchProfiles }
}
