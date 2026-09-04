import { useState } from 'react'
import { supabase } from '../../supabase'

export default function UserForm({ companies, onCreated, onCancel }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '')
  const [newCompanyName, setNewCompanyName] = useState('')
  const [useNewCompany, setUseNewCompany] = useState(companies.length === 0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (role === 'customer' && !useNewCompany && !companyId) {
      setError('Select a company or create a new one.')
      return
    }
    if (role === 'customer' && useNewCompany && !newCompanyName.trim()) {
      setError('Enter a name for the new company.')
      return
    }

    setSubmitting(true)
    const { data, error: invokeError } = await supabase.functions.invoke('create-user', {
      body: {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        companyId: role === 'customer' && !useNewCompany ? companyId : undefined,
        newCompanyName: role === 'customer' && useNewCompany ? newCompanyName.trim() : undefined,
      },
    })
    setSubmitting(false)

    if (invokeError || data?.error) {
      setError(data?.error || invokeError.message)
      return
    }

    onCreated()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="user-name">Full name</label>
        <input id="user-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="user-email">Email</label>
          <input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field-group">
          <label htmlFor="user-password">Temporary password</label>
          <input
            id="user-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="user-role">Role</label>
        <select id="user-role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <span className="field-hint">
          {role === 'admin'
            ? 'Admins have platform-wide access and are not tied to a single company.'
            : 'Customers belong to a company and manage that company\'s jobs and candidates.'}
        </span>
      </div>

      {role === 'customer' && (
        <div className="field-group">
          <label>Company</label>
          {!useNewCompany ? (
            <>
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => setUseNewCompany(true)}>
                + Create new company instead
              </button>
            </>
          ) : (
            <>
              <input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Company name"
              />
              {companies.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => setUseNewCompany(false)}>
                  Use an existing company instead
                </button>
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </div>
    </form>
  )
}
