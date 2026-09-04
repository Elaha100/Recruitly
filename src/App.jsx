import { Routes, Route } from 'react-router-dom'
import { CompanyScopeProvider } from './context/CompanyScopeContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Candidates from './pages/Candidates'
import Users from './pages/Users'
import CvEvaluation from './pages/CvEvaluation'

function AppLayout() {
  return (
    <CompanyScopeProvider>
      <AppShell />
    </CompanyScopeProvider>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/cv-evaluation" element={<CvEvaluation />} />

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
