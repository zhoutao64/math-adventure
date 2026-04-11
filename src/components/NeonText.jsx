const colorMap = {
  cyan: 'neon-text',
  pink: 'neon-pink-text',
  green: 'neon-green-text',
  purple: 'neon-purple-text',
  yellow: 'neon-yellow-text',
}

export default function NeonText({ children, as: Tag = 'h1', color = 'cyan', style, className = '' }) {
  return (
    <Tag className={`${colorMap[color] || 'neon-text'} ${className}`} style={style}>
      {children}
    </Tag>
  )
}
