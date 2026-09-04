import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { normalizeStage } from '../components/kanban/stages'

// The `candidates` table (pre-existing, defined outside this app) uses
// `full_name` and `status` as its column names. The rest of the app works
// with `name` and `stage` for readability - these two functions translate
// between the two shapes so only this file needs to know the real column
// names.
function fromRow(row) {
  if (!row) return row
  const { full_name, status, ...rest } = row
  return { ...rest, name: full_name, stage: normalizeStage(status) }
}

function toRow(candidate) {
  const { name, stage, ...rest } = candidate
  const row = { ...rest }
  if (name !== undefined) row.full_name = name
  if (stage !== undefined) row.status = stage
  if (row.job_id !== undefined) row.job_id = row.job_id ? Number(row.job_id) : null
  return row
}

export function useCandidates(companyId) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCandidates = useCallback(async () => {
    if (!companyId) {
      setCandidates([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('candidates')
      .select('*, jobs(id, title)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else {
      setCandidates(data.map(fromRow))
      setError('')
    }
    setLoading(false)
  }, [companyId])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const createCandidate = async (candidate) => {
    const { data, error } = await supabase
      .from('candidates')
      .insert({ ...toRow(candidate), company_id: companyId })
      .select('*, jobs(id, title)')
      .single()
    const mapped = fromRow(data)
    if (!error) setCandidates((prev) => [mapped, ...prev])
    return { data: mapped, error }
  }

  const updateCandidateStage = async (id, stage) => {
    const { data, error } = await supabase
      .from('candidates')
      .update({ status: stage })
      .eq('id', id)
      .select('*, jobs(id, title)')
      .single()
    const mapped = fromRow(data)
    if (!error) setCandidates((prev) => prev.map((c) => (c.id === id ? mapped : c)))
    return { data: mapped, error }
  }

  const updateCandidate = async (id, updates) => {
    const { data, error } = await supabase
      .from('candidates')
      .update(toRow(updates))
      .eq('id', id)
      .select('*, jobs(id, title)')
      .single()
    const mapped = fromRow(data)
    if (!error) setCandidates((prev) => prev.map((c) => (c.id === id ? mapped : c)))
    return { data: mapped, error }
  }

  return {
    candidates,
    loading,
    error,
    createCandidate,
    updateCandidateStage,
    updateCandidate,
    refetch: fetchCandidates,
  }
}
