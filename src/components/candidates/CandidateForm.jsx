import { useState } from 'react'
import { STAGES } from '../kanban/stages'

export default function CandidateForm({ jobs, initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedin_url ?? '')
  const [jobId, setJobId] = useState(initial?.job_id ?? jobs[0]?.id ?? '')
  const [stage, setStage] = useState(initial?.stage ?? 'new')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Candidate name is required.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error } = await onSubmit({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      job_id: jobId || null,
      stage,
      notes: notes.trim() || null,
    })
    setSubmitting(false)
    if (error) setError(error.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="candidate-name">Full name</label>
        <input id="candidate-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="candidate-email">Email</label>
          <input id="candidate-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
        <div className="field-group">
          <label htmlFor="candidate-phone">Phone</label>
          <input id="candidate-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="candidate-linkedin">LinkedIn URL</label>
        <input
          id="candidate-linkedin"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/jane-doe"
        />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="candidate-job">Job</label>
          <select id="candidate-job" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            <option value="">Not linked to a job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="candidate-stage">Stage</label>
          <select id="candidate-stage" value={stage} onChange={(e) => setStage(e.target.value)}>
            {STAGES.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="candidate-notes">Notes</label>
        <textarea id="candidate-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes about this candidate" />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add candidate'}
        </button>
      </div>
    </form>
  )
}
