import { useMemo, useState } from 'react'
import { useCompanyScope } from '../context/CompanyScopeContext'
import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'
import CompanyScopeBanner from '../components/layout/CompanyScopeBanner'
import { IconSparkle } from '../components/ui/icons'

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'a', 'an', 'to', 'of', 'in', 'on', 'is', 'are',
  'we', 'you', 'our', 'as', 'be', 'or', 'at', 'this', 'that', 'will', 'have',
])

function extractKeywords(text) {
  return [...new Set(
    (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
  )]
}

// Deterministic, heuristic-only "evaluation" so the demo has something to
// show without pretending to call a real AI model. See the "Technical
// details" section below for how this would be swapped for a real one.
function runHeuristicEvaluation(cvText, jobDescription) {
  const jobKeywords = extractKeywords(jobDescription)
  const cvKeywords = new Set(extractKeywords(cvText))

  const matched = jobKeywords.filter((word) => cvKeywords.has(word))
  const missing = jobKeywords.filter((word) => !cvKeywords.has(word))

  const overlapRatio = jobKeywords.length ? matched.length / jobKeywords.length : 0
  const score = Math.round(35 + overlapRatio * 60)

  return {
    score,
    strengths: matched.slice(0, 6),
    gaps: missing.slice(0, 5),
    recommendation:
      score >= 70 ? 'Proceed to interview.' : score >= 45 ? 'Possible fit — review manually.' : 'Likely not a strong match.',
  }
}

export default function CvEvaluation() {
  const { companyId } = useCompanyScope()
  const { candidates } = useCandidates(companyId)
  const { jobs } = useJobs(companyId)

  const [candidateId, setCandidateId] = useState('')
  const [cvText, setCvText] = useState('')
  const [result, setResult] = useState(null)

  const selectedCandidate = candidates.find((c) => String(c.id) === candidateId)
  const linkedJob = useMemo(
    () => jobs.find((j) => j.id === selectedCandidate?.job_id),
    [jobs, selectedCandidate]
  )

  const handleEvaluate = (e) => {
    e.preventDefault()

    if (!linkedJob) {
      setResult({ status: 'no-job' })
      return
    }

    const text = cvText.trim() || selectedCandidate?.notes?.trim() || ''
    if (!text) {
      setResult({ status: 'no-text' })
      return
    }

    setResult({ status: 'ok', ...runHeuristicEvaluation(text, linkedJob.description || '') })
  }

  return (
    <div className="cv-eval-page">
      <div className="page-header">
        <div>
          <h1>AI CV Evaluation</h1>
          <p>Match a candidate against a job description in three simple steps.</p>
        </div>
      </div>

      <CompanyScopeBanner />

      <div className="prototype-banner">
        <span className="prototype-banner-icon">
          <IconSparkle size={16} />
        </span>
        <div>
          <div className="prototype-banner-title">Prototype evaluation</div>
          <div className="prototype-banner-text">This demo uses a local matching method rather than a live AI model.</div>
        </div>
      </div>

      <form onSubmit={handleEvaluate}>
        <div className="card step-card">
          <div className="step-card-header">
            <span className="step-badge">1</span>
            <span className="step-title">Select candidate</span>
          </div>
          <p className="step-helper">Choose the candidate you want to evaluate.</p>

          <div className="step-body">
            <div className="field-group">
              <label htmlFor="cv-candidate">Candidate</label>
              <select
                id="cv-candidate"
                value={candidateId}
                onChange={(e) => {
                  setCandidateId(e.target.value)
                  setResult(null)
                }}
                required
              >
                <option value="">Select a candidate…</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                {linkedJob ? `Linked job: ${linkedJob.title}` : 'This candidate is not linked to a job yet.'}
              </span>
            </div>
          </div>
        </div>

        <div className="card step-card">
          <div className="step-card-header">
            <span className="step-badge">2</span>
            <span className="step-title">Add CV text</span>
          </div>
          <p className="step-helper">Paste the candidate's CV text, or leave it empty to use the candidate's existing notes.</p>

          <div className="step-body">
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label htmlFor="cv-text">CV text / summary (optional)</label>
              <textarea
                id="cv-text"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste CV text, or leave empty to use the candidate's notes."
              />
            </div>
          </div>
        </div>

        <div className="evaluate-action">
          <button type="submit" className="btn btn-primary" disabled={!candidateId}>
            <IconSparkle size={16} />
            Evaluate candidate
          </button>
        </div>
      </form>

      {result && (
        <>
          <h2 className="result-section-title">Evaluation result</h2>
          <p className="field-hint" style={{ marginBottom: 16 }}>
            {selectedCandidate?.name} vs. {linkedJob ? linkedJob.title : 'no linked job'}
          </p>

          {result.status === 'no-job' && (
            <div className="card">
              <p className="field-hint">
                This candidate isn't linked to a job, so there's nothing to compare the CV
                against. Link this candidate to a job before running an evaluation.
              </p>
            </div>
          )}

          {result.status === 'no-text' && (
            <div className="card">
              <p className="field-hint">
                No CV text was provided and this candidate has no notes to fall back on. Paste
                CV text above, or add notes to the candidate, then try again.
              </p>
            </div>
          )}

          {result.status === 'ok' && (
            <div className="result-grid">
              <div className="result-card">
                <div className="result-card-label">Match Score</div>
                <div className="result-score-value">{result.score}/100</div>
              </div>

              <div className="result-card">
                <div className="result-card-label">Recommendation</div>
                <p className="result-recommendation">{result.recommendation}</p>
              </div>

              <div className="result-card">
                <div className="result-card-label">Strengths</div>
                {result.strengths.length ? (
                  <ul className="result-list">
                    {result.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="field-hint">No strong keyword overlap detected.</p>
                )}
              </div>

              <div className="result-card">
                <div className="result-card-label">Potential Gaps</div>
                {result.gaps.length ? (
                  <ul className="result-list">
                    {result.gaps.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="field-hint">No obvious gaps detected.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <details className="card tech-details">
        <summary>Technical details — how this would work in production</summary>
        <p className="field-hint" style={{ marginBottom: 12 }}>
          A real implementation would replace the local heuristic above with a secure,
          server-side AI call:
        </p>
        <ol>
          <li>Recruiter uploads the candidate's CV (PDF/DOCX) to Supabase Storage.</li>
          <li>A Supabase Edge Function extracts text from the file.</li>
          <li>The function retrieves the relevant job description from the database.</li>
          <li>
            CV text + job description are sent to an AI provider (e.g. Claude) from the Edge
            Function — never from the browser, so the API key is never exposed.
          </li>
          <li>The AI is asked to return structured JSON: score, strengths, gaps, recommendation.</li>
          <li>The response is validated against a schema before being stored.</li>
          <li>The result is saved to an `evaluations` table and displayed here.</li>
        </ol>
      </details>
    </div>
  )
}
