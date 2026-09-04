import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../App.css'

export default function Login() {
  const { user, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setError(error.message)
  }

  return (
    <div className="page">
      <div className="login-wrapper">
        <section className="left-panel">
          <div className="brand">
            <div className="brand-logo">R</div>
            <span>Recruitly</span>
          </div>

          <div className="tag">✦ Smart Recruitment Platform</div>

          <h1>
            Hire better.
            <span>Together.</span>
          </h1>

          <p className="intro-text">
            Recruitly helps teams attract, evaluate and hire the right people
            — faster and smarter.
          </p>

          <div className="feature-list">
            <div className="feature">
              <div className="feature-icon">◎</div>
              <div>
                <h3>All-in-one hiring</h3>
                <p>Manage jobs, candidates and interviews in one place.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">↗</div>
              <div>
                <h3>Data-driven decisions</h3>
                <p>Keep your recruitment process clear and organized.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">◇</div>
              <div>
                <h3>Secure & reliable</h3>
                <p>Your recruitment data stays protected and organized.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="right-panel">
          <div className="login-card">
            <div className="login-heading">
              <h2>Welcome back</h2>
              <p>Sign in to your Recruitly account and continue hiring.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="sign-in-button" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
                <span>→</span>
              </button>

              <p className="no-account-note">Don't have an account? Contact your administrator.</p>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
