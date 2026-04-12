import { lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SYSTEMS } from '../data/station'
import NeonButton from '../components/NeonButton'

const missionComponents = {
  'powercore-1': lazy(() => import('../missions/powercore/Mission1_Calibrate.jsx')),
  'powercore-2': lazy(() => import('../missions/powercore/Mission2_Sequence.jsx')),
  'powercore-3': lazy(() => import('../missions/powercore/Mission3_PowerGrid.jsx')),
  'navigation-1': lazy(() => import('../missions/navigation/Mission1_Balance.jsx')),
  'navigation-2': lazy(() => import('../missions/navigation/Mission2_Orbit.jsx')),
  'navigation-3': lazy(() => import('../missions/navigation/Mission3_Course.jsx')),
  'comms-1': lazy(() => import('../missions/comms/Mission1_Pattern.jsx')),
  'comms-2': lazy(() => import('../missions/comms/Mission2_Antenna.jsx')),
  'comms-3': lazy(() => import('../missions/comms/Mission3_Frequency.jsx')),
}

export default function MissionView() {
  const { systemId, missionId } = useParams()
  const navigate = useNavigate()

  const system = SYSTEMS.find(s => s.id === systemId)
  const mission = system?.missions.find(m => m.id === missionId)

  if (!system || !mission) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Mission not found</div>
  }

  const Component = missionComponents[`${systemId}-${missionId}`]

  if (!Component) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 20,
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          Mission coming soon...
        </p>
        <NeonButton onClick={() => navigate(`/station/${systemId}`)} size="small">
          ← Back
        </NeonButton>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'var(--neon-cyan)', fontSize: 14, letterSpacing: 3,
        animation: 'pulse 1.5s infinite',
      }}>
        LOADING...
      </div>
    }>
      <Component
        system={system}
        mission={mission}
        onBack={() => navigate(`/station/${systemId}`)}
      />
    </Suspense>
  )
}
