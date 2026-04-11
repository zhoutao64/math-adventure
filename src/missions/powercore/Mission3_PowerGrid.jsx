import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'

export default function Mission3_PowerGrid({ system, mission, onBack }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: 20, padding: '20px 12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
        <NeonButton onClick={onBack} size="small">
          ← Exit
        </NeonButton>
      </div>
      <NeonText as="h2" color="cyan" style={{ fontSize: 24 }}>
        配电优化
      </NeonText>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
        Properties of Operations — Coming in Sprint 4
      </p>
      <NeonButton onClick={onBack} size="small">Back to System</NeonButton>
    </div>
  )
}
