import './App.css'

function App() {
  return (
    <div className="page">
      <div className="login-wrapper">

        {/* Vänster sida */}
        <section className="left-panel">
          <div className="brand">
            <div className="brand-logo">R</div>
            <span>Recruitly</span>
          </div>

          <div className="tag">
            ✦ Smart Recruitment Platform
          </div>

          <h1>
            Hire better.
            <span>Together.</span>
          </h1>

          <p className="intro-text">
            Recruitly helps teams attract, evaluate and hire
            the right people — faster and smarter.
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

        {/* Höger sida */}
        <section className="right-panel">
          <div className="login-card">

            <div className="login-heading">
              <h2>Welcome back</h2>
              <p>Sign in to your Recruitly account and continue hiring.</p>
            </div>

            <form>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                />
              </div>

              <div className="login-options">
                <label className="remember">
                  <input type="checkbox" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="sign-in-button"
              >
                Sign in
                <span>→</span>
              </button>

            </form>

          </div>
        </section>

      </div>
    </div>
  )
}

export default App