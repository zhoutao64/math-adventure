export default function ProgressBar({ value, max, color = 'cyan' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const colorVar = `var(--neon-${color})`
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${colorVar}, ${colorVar})`,
          boxShadow: `0 0 10px ${colorVar}40`,
        }}
      />
    </div>
  )
}
