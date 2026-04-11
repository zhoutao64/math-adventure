import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { SYSTEMS } from '../data/station'
import NeonText from '../components/NeonText'
import NeonButton from '../components/NeonButton'
import StationView from '../components/StationView'
import ProgressBar from '../components/ProgressBar'

export default function StationMap() {
  const navigate = useNavigate()
  const { state } = useGame()

  const totalMissions = SYSTEMS.reduce((sum, s) => sum + s.missions.length, 0)
  const completedMissions = SYSTEMS.reduce((sum, s) => {
    return sum + s.missions.filter(m => state.systems[s.id]?.missions[m.id]?.completed).length
  }, 0)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 12px', minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 10 }}>
        <NeonButton onClick={() => navigate('/')} size="small">
          ← Back
        </NeonButton>
      </div>

      <NeonText as="h2" color="cyan" style={{
        fontSize: 'clamp(20px, 4vw, 32px)', letterSpacing: 4, marginBottom: 8,
      }}>
        Odyssey Station
      </NeonText>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: 2, marginBottom: 30 }}>
        Restore all systems to escape
      </p>

      <div style={{ width: '100%', maxWidth: 300, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: 1 }}>
          <span>Station Repair</span>
          <span>{completedMissions}/{totalMissions}</span>
        </div>
        <ProgressBar value={completedMissions} max={totalMissions} />
      </div>

      <StationView size={Math.min(380, window.innerWidth - 40)} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, calc(50% - 8px)), 1fr))',
        gap: 12,
        maxWidth: 700, width: '100%', marginTop: 30, padding: '0 4px',
      }}>
        {SYSTEMS.map(sys => {
          const sysState = state.systems[sys.id]
          const isLocked = sysState?.status === 'locked'
          const isComplete = sysState?.status === 'complete'
          const completedCount = sys.missions.filter(m => sysState?.missions[m.id]?.completed).length

          return (
            <div
              key={sys.id}
              className="glass-panel"
              onClick={() => !isLocked && navigate(`/station/${sys.id}`)}
              style={{
                padding: '20px 16px', cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.25 : 1, transition: 'all 0.3s', textAlign: 'center',
                borderColor: isComplete ? `var(--neon-${sys.color})` : undefined,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{sys.icon}</div>
              <div style={{
                fontSize: 14, fontWeight: 700, marginBottom: 4,
                color: isComplete ? `var(--neon-${sys.color})` : '#fff',
              }}>
                {sys.name}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                {sys.nameCN}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
                {isLocked ? 'LOCKED' : isComplete ? '✓ COMPLETE' : `${completedCount}/${sys.missions.length} missions`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
