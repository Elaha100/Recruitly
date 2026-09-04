import { useCompanyScope } from '../../context/CompanyScopeContext'

export default function CompanyScopeBanner() {
  const { isAdmin, companies, scopeCompanyId, setScopeCompanyId } = useCompanyScope()

  if (!isAdmin || companies.length === 0) return null

  return (
    <div className="acting-as-banner">
      <span>Acting on behalf of:</span>
      <select value={scopeCompanyId ?? ''} onChange={(e) => setScopeCompanyId(e.target.value)}>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  )
}
