export default function NeonButton({ children, onClick, color = 'cyan', size = 'normal', style, disabled }) {
  const cls = `btn ${color !== 'cyan' ? `btn-${color}` : ''} ${size === 'small' ? 'btn-small' : ''}`
  return (
    <button
      className={cls}
      onClick={onClick}
      style={{ opacity: disabled ? 0.35 : 1, pointerEvents: disabled ? 'none' : 'auto', ...style }}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
