export function StatCard({ label, value, detail, icon: Icon, tone = "purple" }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-icon"><Icon size={21} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </article>
  );
}

