import { useState } from 'react'

const STATUS_OPTIONS = [
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'closed', label: 'Closed' },
]

export default function JobForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'active')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Job title is required.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error } = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || null,
      status,
    })
    setSubmitting(false)
    if (error) setError(error.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="job-title">Job title</label>
        <input
          id="job-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Frontend Developer"
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="job-description">Description</label>
        <textarea
          id="job-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Responsibilities, requirements, etc."
        />
      </div>

      <div className="field-group">
        <label htmlFor="job-location">Location</label>
        <input
          id="job-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Remote, Stockholm"
        />
      </div>

      <div className="field-group">
        <label htmlFor="job-status">Status</label>
        <select id="job-status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create job'}
        </button>
      </div>
    </form>
  )
}
