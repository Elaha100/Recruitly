export default function Spinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="full-page-spinner">
        <div className="spinner" />
      </div>
    )
  }
  return <div className="spinner" />
}
