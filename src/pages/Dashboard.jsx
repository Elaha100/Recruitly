import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCompanyScope } from '../context/CompanyScopeContext'
import { useJobs } from '../hooks/useJobs'
import { useCandidates } from '../hooks/useCandidates'
import Spinner from '../components/ui/Spinner'
import CompanyScopeBanner from '../components/layout/CompanyScopeBanner'
import RecentActivity from '../components/dashboard/RecentActivity'

export default function Dashboard() {
  const { profile } = useAuth()
  const { companyId, loading: scopeLoading } = useCompanyScope()
  const { jobs, loading: jobsLoading } = useJobs(companyId)
  const { candidates, loading: candidatesLoading } = useCandidates(companyId)

  const stats = useMemo(() => {
    const stageCount = (stage) => candidates.filter((c) => c.stage === stage).length
    return {
      activeJobs: jobs.filter((j) => j.status === 'active').length,
      totalCandidates: candidates.length,
      interviews: stageCount('interview'),
      offers: stageCount('offer'),
      hired: stageCount('hired'),
    }
  }, [jobs, candidates])

  const loading = scopeLoading || jobsLoading || candidatesLoading

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1>
          <p>Here's what's happening with your hiring right now.</p>
        </div>
      </div>

      <CompanyScopeBanner />

      {loading ? (
        <Spinner fullPage />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Active Jobs" value={stats.activeJobs} />
            <StatCard label="Total Candidates" value={stats.totalCandidates} />
            <StatCard label="Interviews" value={stats.interviews} />
            <StatCard label="Offers" value={stats.offers} />
            <StatCard label="Hired" value={stats.hired} />
          </div>

          <div className="dashboard-section-title">Quick actions</div>
          <div className="quick-actions">
            <Link className="quick-action-card" to="/jobs">
              <span className="quick-action-icon">◎</span>
              <div>
                <div className="quick-action-title">Manage jobs</div>
                <div className="quick-action-subtitle">Create and review open roles</div>
              </div>
            </Link>
            <Link className="quick-action-card" to="/candidates">
              <span className="quick-action-icon">↗</span>
              <div>
                <div className="quick-action-title">Open pipeline</div>
                <div className="quick-action-subtitle">View and manage your Kanban board</div>
              </div>
            </Link>
          </div>

          <div className="dashboard-section-title">Recent activity</div>
          <div className="card">
            <RecentActivity jobs={jobs} candidates={candidates} />
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
