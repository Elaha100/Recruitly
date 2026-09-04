import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useJobs(companyId) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchJobs = useCallback(async () => {
    if (!companyId) {
      setJobs([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else {
      setJobs(data)
      setError('')
    }
    setLoading(false)
  }, [companyId])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const createJob = async (job) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert({ ...job, company_id: companyId })
      .select()
      .single()
    if (!error) setJobs((prev) => [data, ...prev])
    return { data, error }
  }

  const updateJob = async (id, updates) => {
    const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single()
    if (!error) setJobs((prev) => prev.map((job) => (job.id === id ? data : job)))
    return { data, error }
  }

  return { jobs, loading, error, createJob, updateJob, refetch: fetchJobs }
}
