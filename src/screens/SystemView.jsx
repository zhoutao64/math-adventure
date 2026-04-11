import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { SYSTEMS } from '../data/station'
import NeonText from '../components/NeonText'
import NeonButton from '../components/NeonButton'
import ProgressBar from '../components/ProgressBar'

export default function SystemView() {
  const { systemId } = useParams()
  const navigate = useNavigate()
  const { state } = useGame()

  const system = SYSTEMS.find(s => s.id === systemId)
  if (!system) return <div style={{ padding: 40, textAlign: 'center' }}>System not found</div>

  const sysState = state.systems[systemId]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 20px', minHeight: '100vh',
    }}>
      <NeonButton onClick={() => navigate('/station')} size="small"
        style={{ position: 'absolute', top: 20, left: 20 }}>
        ← Back
      </NeonButton>

      <div style={{
        display: 'inline-block', padding: '6px 16px',
        border: `1px solid var(--neon-${system.color})`,
        borderRadius: 20, fontSize: 11, letterSpacing: 3,
        color: `var(--neon-${system.color})`, marginBottom: 16,
      }}>
        {system.icon} {system.name.toUpperCase()}
      </div>

      <NeonText as="h2" color={system.color} style={{
        fontSize: 'clamp(20px, 4vw, 28px)', letterSpacing: 3, marginBottom: 6,
      }}>
        {system.nameCN}
      </NeonText>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 40, fontFamily: 'var(--font-body)' }}>
        {system.descCN}
      </p>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500, width: '100%',
      }}>
        {system.missions.map((mission, idx) => {
          const mState = sysState?.missions[mission.id]
          const isCompleted = mState?.completed
          const prevCompleted = idx === 0 || sysState?.missions[system.missions[idx - 1].id]?.completed
          const isLocked = !prevCompleted && !isCompleted
          const ahaCount = mState?.ahaMoments.length || 0

          return (
            <div
              key={mission.id}
              className="glass-panel"
              onClick={() => !isLocked && navigate(`/station/${systemId}/${mission.id}`)}
              style={{
                padding: '24px', cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.3 : 1, transition: 'all 0.3s',
                borderColor: isCompleted ? `var(--neon-${system.color})` : undefined,
                position: 'relative',
              }}
            >
              {isCompleted && (
                <span style={{
                  position: 'absolute', top: 16, right: 16,
                  color: 'var(--neon-green)', fontSize: 18,
                }}>✓</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900,
                  border: `2px solid ${isCompleted ? `var(--neon-${system.color})` : 'rgba(255,255,255,0.15)'}`,
                  color: isCompleted ? `var(--neon-${system.color})` : 'rgba(255,255,255,0.5)',
                  background: isCompleted ? `var(--neon-${system.color})10` : 'transparent',
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    {mission.nameCN}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 2 }}>
                    {mission.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                    {mission.descCN}
                  </div>
                </div>
              </div>
              {!isLocked && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                    <span>Discoveries</span>
                    <span>{ahaCount}/{mission.ahaCount}</span>
                  </div>
                  <ProgressBar value={ahaCount} max={mission.ahaCount} color={system.color} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
