import EmptyState from '../ui/EmptyState'

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateString).toLocaleDateString()
}

// Built entirely from data the dashboard already has (job/candidate creation
// timestamps) - no extra Supabase queries and no new tables. We don't track
// stage-change history yet, so this only ever shows real creation events.
export default function RecentActivity({ jobs, candidates }) {
  const events = [
    ...jobs.map((job) => ({
      id: `job-${job.id}`,
      type: 'job',
      text: `New job created: ${job.title}`,
      date: job.created_at,
    })),
    ...candidates.map((candidate) => ({
      id: `candidate-${candidate.id}`,
      type: 'candidate',
      text: `New candidate added: ${candidate.name}`,
      date: candidate.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  if (events.length === 0) {
    return <EmptyState title="No recent activity yet" description="Activity will show up here once you create jobs and add candidates." />
  }

  return (
    <div className="activity-list">
      {events.map((event) => (
        <div className="activity-item" key={event.id}>
          <span className={`activity-dot${event.type === 'job' ? ' activity-dot-job' : ''}`} />
          <span className="activity-text">{event.text}</span>
          <span className="activity-time">{timeAgo(event.date)}</span>
        </div>
      ))}
    </div>
  )
}
