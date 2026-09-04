import { useMemo, useState } from 'react'
import { useCompanyScope } from '../context/CompanyScopeContext'
import { useJobs } from '../hooks/useJobs'
import { useCandidates } from '../hooks/useCandidates'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import CandidateForm from '../components/candidates/CandidateForm'
import CandidateDetail from '../components/candidates/CandidateDetail'
import KanbanBoard from '../components/kanban/KanbanBoard'
import CompanyScopeBanner from '../components/layout/CompanyScopeBanner'

export default function Candidates() {
  const { companyId, loading: scopeLoading } = useCompanyScope()
  const { jobs } = useJobs(companyId)
  const { candidates, loading, error, createCandidate, updateCandidateStage, updateCandidate } =
    useCandidates(companyId)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewingCandidate, setViewingCandidate] = useState(null)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [search, setSearch] = useState('')
  const [jobFilter, setJobFilter] = useState('all')

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch = candidate.name.toLowerCase().includes(search.trim().toLowerCase())
      const matchesJob = jobFilter === 'all' || String(candidate.job_id ?? '') === jobFilter
      return matchesSearch && matchesJob
    })
  }, [candidates, search, jobFilter])

  const handleSubmit = async (values) => {
    const result = await createCandidate(values)
    if (!result.error) setModalOpen(false)
    return result
  }

  const handleUpdate = async (values) => {
    const result = await updateCandidate(editingCandidate.id, values)
    if (!result.error) {
      setEditingCandidate(null)
      setViewingCandidate(null)
    }
    return result
  }

  return (
    <div className="pipeline-page">
      <div className="page-header">
        <div>
          <h1>Candidate Pipeline</h1>
          <p>Track every candidate through your recruitment stages.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={!companyId}>
            + Add candidate
          </button>
        </div>
      </div>

      <CompanyScopeBanner />

      <div className="filters-bar">
        <input
          type="search"
          placeholder="Search candidate by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
          <option value="all">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {(loading || scopeLoading) && <Spinner fullPage />}

      {!loading && !scopeLoading && candidates.length === 0 && (
        <EmptyState
          title="No candidates yet"
          description="Add your first candidate to start building your pipeline."
          action={
            <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={!companyId}>
              + Add candidate
            </button>
          }
        />
      )}

      {!loading && candidates.length > 0 && filteredCandidates.length === 0 && (
        <EmptyState title="No candidates match your filters" description="Try a different name or job." />
      )}

      {!loading && filteredCandidates.length > 0 && (
        <KanbanBoard
          candidates={filteredCandidates}
          onStageChange={updateCandidateStage}
          onView={setViewingCandidate}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add candidate">
        <CandidateForm jobs={jobs} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal
        open={!!viewingCandidate && !editingCandidate}
        onClose={() => setViewingCandidate(null)}
        title="Candidate details"
      >
        {viewingCandidate && (
          <CandidateDetail
            candidate={viewingCandidate}
            onEdit={() => setEditingCandidate(viewingCandidate)}
            onClose={() => setViewingCandidate(null)}
          />
        )}
      </Modal>

      <Modal open={!!editingCandidate} onClose={() => setEditingCandidate(null)} title="Edit candidate">
        {editingCandidate && (
          <CandidateForm
            jobs={jobs}
            initial={editingCandidate}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCandidate(null)}
          />
        )}
      </Modal>
    </div>
  )
}
