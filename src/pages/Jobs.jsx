import { useMemo, useState } from 'react'
import { useCompanyScope } from '../context/CompanyScopeContext'
import { useJobs } from '../hooks/useJobs'
import { useCandidates } from '../hooks/useCandidates'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import JobForm from '../components/jobs/JobForm'
import JobCard from '../components/jobs/JobCard'
import CompanyScopeBanner from '../components/layout/CompanyScopeBanner'
import {
  IconBriefcase,
  IconCheckCircle,
  IconPauseCircle,
  IconUsers,
  IconSearch,
  IconSort,
} from '../components/ui/icons'

export default function Jobs() {
  const { companyId, loading: scopeLoading } = useCompanyScope()
  const { jobs, loading, error, createJob, updateJob } = useJobs(companyId)
  // Reusing the existing candidates hook, unmodified, purely to derive a
  // per-job candidate count on the client - no new Supabase queries.
  const { candidates } = useCandidates(companyId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  const openCreate = () => {
    setEditingJob(null)
    setModalOpen(true)
  }

  const openEdit = (job) => {
    setEditingJob(job)
    setModalOpen(true)
  }

  const handleSubmit = async (values) => {
    const result = editingJob ? await updateJob(editingJob.id, values) : await createJob(values)
    if (!result.error) setModalOpen(false)
    return result
  }

  const candidateCountByJob = useMemo(() => {
    const counts = {}
    candidates.forEach((candidate) => {
      const key = String(candidate.job_id ?? '')
      if (!key) return
      counts[key] = (counts[key] ?? 0) + 1
    })
    return counts
  }, [candidates])

  const stats = useMemo(
    () => ({
      total: jobs.length,
      active: jobs.filter((j) => j.status === 'active').length,
      closed: jobs.filter((j) => j.status === 'closed').length,
      totalCandidates: candidates.length,
    }),
    [jobs, candidates]
  )

  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        (job.description ?? '').toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      return matchesSearch && matchesStatus
    })

    return [...filtered].sort((a, b) => {
      const diff = new Date(a.created_at) - new Date(b.created_at)
      return sortOrder === 'newest' ? -diff : diff
    })
  }, [jobs, search, statusFilter, sortOrder])

  return (
    <div className="jobs-page">
      <div className="page-header">
        <div>
          <h1>Jobs</h1>
          <p>Open roles you're recruiting candidates for.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={openCreate} disabled={!companyId}>
            + New job
          </button>
        </div>
      </div>

      <CompanyScopeBanner />

      {error && <p className="banner-error">{error}</p>}

      {(loading || scopeLoading) && <Spinner fullPage />}

      {!loading && !scopeLoading && jobs.length === 0 && (
        <EmptyState
          title="No jobs created yet"
          description="Create your first job to start tracking candidates against it."
          action={
            <button type="button" className="btn btn-primary" onClick={openCreate} disabled={!companyId}>
              + New job
            </button>
          }
        />
      )}

      {!loading && jobs.length > 0 && (
        <>
          <div className="job-stat-grid">
            <JobStatCard icon={<IconBriefcase size={18} />} tone="tile-purple" label="Total Jobs" value={stats.total} />
            <JobStatCard icon={<IconCheckCircle size={18} />} tone="tile-green" label="Active Jobs" value={stats.active} />
            <JobStatCard icon={<IconPauseCircle size={18} />} tone="tile-orange" label="Closed Jobs" value={stats.closed} />
            <JobStatCard icon={<IconUsers size={18} />} tone="tile-purple" label="Total Candidates" value={stats.totalCandidates} />
          </div>

          <div className="jobs-toolbar">
            <div className="toolbar-search">
              <IconSearch className="toolbar-icon" />
              <input
                type="search"
                placeholder="Search jobs by title or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
            <div className="toolbar-select">
              <IconSort className="toolbar-icon" />
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {visibleJobs.length === 0 ? (
            <EmptyState title="No jobs match your filters" description="Try a different search term or status." />
          ) : (
            <div className="job-grid">
              {visibleJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  candidateCount={candidateCountByJob[String(job.id)] ?? 0}
                  onEdit={openEdit}
                />
              ))}
            </div>
          )}

          <button type="button" className="jobs-cta-card" onClick={openCreate}>
            <span className="jobs-cta-icon">+</span>
            <span className="jobs-cta-text">
              <span className="jobs-cta-title">Create a new job</span>
              <span className="jobs-cta-subtitle">Add a new open role and start receiving candidates.</span>
            </span>
            <span className="btn btn-primary jobs-cta-button">+ New job</span>
          </button>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingJob ? 'Edit job' : 'New job'}>
        <JobForm initial={editingJob} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

function JobStatCard({ icon, tone, label, value }) {
  return (
    <div className="job-stat-card">
      <div className={`job-stat-icon ${tone}`}>{icon}</div>
      <div>
        <div className="job-stat-value">{value}</div>
        <div className="job-stat-label">{label}</div>
      </div>
    </div>
  )
}
