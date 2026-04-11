export default function GlassPanel({ children, className = '', glowColor, style, onClick }) {
  const glowStyles = glowColor ? {
    borderColor: `var(--neon-${glowColor})`,
    boxShadow: `0 0 15px rgba(var(--neon-${glowColor}), 0.1)`,
  } : {}

  return (
    <div
      className={`glass-panel ${className}`}
      style={{ ...glowStyles, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
