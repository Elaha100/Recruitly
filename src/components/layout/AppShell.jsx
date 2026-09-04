import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { IconGrid, IconBriefcase, IconColumns, IconSparkle, IconUsers, IconLogout } from '../ui/icons'

function getInitials(profile) {
  const source = profile?.full_name?.trim() || profile?.email || ''
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function AppShell() {
  const { profile, isAdmin, signOut } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">R</div>
          <span>Recruitly</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconGrid size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/jobs" className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconBriefcase size={18} />
            Jobs
          </NavLink>
          <NavLink to="/candidates" className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconColumns size={18} />
            Candidate Pipeline
          </NavLink>
          <NavLink to="/cv-evaluation" className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconSparkle size={18} />
            AI CV Evaluation
          </NavLink>
          {isAdmin && (
            <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
              <IconUsers size={18} />
              Users / Customers
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{getInitials(profile)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.full_name || profile?.email}</div>
              <div className="sidebar-user-role">{profile?.role}</div>
            </div>
          </div>
          <button type="button" className="sidebar-logout" onClick={signOut}>
            <IconLogout size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
