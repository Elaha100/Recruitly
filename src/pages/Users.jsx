import { useState } from 'react'
import { useProfiles } from '../hooks/useProfiles'
import { useCompanies } from '../hooks/useCompanies'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import UserForm from '../components/admin/UserForm'

export default function Users() {
  const { profiles, loading, error, refetch } = useProfiles()
  const { companies, refetch: refetchCompanies } = useCompanies()
  const [modalOpen, setModalOpen] = useState(false)

  const handleCreated = () => {
    setModalOpen(false)
    refetch()
    refetchCompanies()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users / Customers</h1>
          <p>Create and manage admin and customer accounts across Recruitly.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + New account
          </button>
        </div>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {loading && <Spinner fullPage />}

      {!loading && profiles.length === 0 && (
        <EmptyState title="No accounts yet" description="Create the first customer or admin account." />
      )}

      {!loading && profiles.length > 0 && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td>{p.email}</td>
                  <td>
                    <Badge tone={p.role === 'admin' ? 'accent' : 'default'}>{p.role}</Badge>
                  </td>
                  <td>{p.companies?.name ?? '—'}</td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New account">
        <UserForm companies={companies} onCreated={handleCreated} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
