import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'

export default function Mission2_Sequence({ system, mission, onBack }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: 20, padding: 40,
    }}>
      <NeonButton onClick={onBack} size="small"
        style={{ position: 'absolute', top: 20, left: 20 }}>
        ← Exit
      </NeonButton>
      <NeonText as="h2" color="cyan" style={{ fontSize: 24 }}>
        启动序列
      </NeonText>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
        Order of Operations — Coming in Sprint 3
      </p>
      <NeonButton onClick={onBack} size="small">Back to System</NeonButton>
    </div>
  )
}
