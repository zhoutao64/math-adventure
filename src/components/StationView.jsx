import { useGame } from '../context/GameContext'

const SYSTEM_POSITIONS = {
  powercore: { x: 200, y: 320, label: '⚡', color: '#00f0ff' },
  navigation: { x: 80, y: 200, label: '🧭', color: '#ffe600' },
  comms: { x: 200, y: 80, label: '📡', color: '#ff2d95' },
  shields: { x: 320, y: 200, label: '🛡️', color: '#b44dff' },
  launch: { x: 200, y: 200, label: '🚀', color: '#39ff14' },
}

export default function StationView({ size = 400 }) {
  const { state } = useGame()
  const scale = size / 400

  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{ display: 'block', margin: '0 auto' }}>
      {/* Station body */}
      <ellipse cx="200" cy="200" rx="160" ry="160"
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      <ellipse cx="200" cy="200" rx="100" ry="100"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

      {/* Connection lines */}
      {Object.entries(SYSTEM_POSITIONS).map(([id, pos]) => (
        <line key={`line-${id}`}
          x1="200" y1="200" x2={pos.x} y2={pos.y}
          stroke={state.systems[id]?.status === 'complete' ? pos.color : 'rgba(255,255,255,0.06)'}
          strokeWidth={state.systems[id]?.status === 'complete' ? 2 : 1}
          strokeDasharray={state.systems[id]?.status === 'complete' ? 'none' : '4 4'}
        />
      ))}

      {/* System nodes */}
      {Object.entries(SYSTEM_POSITIONS).map(([id, pos]) => {
        const sys = state.systems[id]
        const isComplete = sys?.status === 'complete'
        const isAvailable = sys?.status === 'available'
        const isLocked = false // DEBUG: unlock all systems
        const opacity = isComplete ? 1 : 0.7

        return (
          <g key={id} opacity={opacity}>
            {/* Glow */}
            {isComplete && (
              <circle cx={pos.x} cy={pos.y} r="28"
                fill="none" stroke={pos.color} strokeWidth="1" opacity="0.3">
                <animate attributeName="r" values="28;34;28" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {isAvailable && !isComplete && (
              <circle cx={pos.x} cy={pos.y} r="26"
                fill="none" stroke={pos.color} strokeWidth="1" opacity="0.4">
                <animate attributeName="opacity" values="0.4;0.15;0.4" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Node circle */}
            <circle cx={pos.x} cy={pos.y} r="22"
              fill={isComplete ? `${pos.color}15` : 'rgba(255,255,255,0.03)'}
              stroke={isComplete ? pos.color : isAvailable ? `${pos.color}80` : 'rgba(255,255,255,0.1)'}
              strokeWidth={isComplete ? 2 : 1}
            />
            {/* Icon */}
            <text x={pos.x} y={pos.y + 6} textAnchor="middle" fontSize="18">
              {pos.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
