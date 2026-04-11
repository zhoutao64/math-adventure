import { useNavigate } from 'react-router-dom'
import NeonText from '../components/NeonText'
import NeonButton from '../components/NeonButton'

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: '40px 20px', gap: '20px',
    }}>
      {/* Station silhouette */}
      <div style={{ position: 'relative', width: 120, height: 160, marginBottom: 10 }}>
        <svg width="120" height="160" viewBox="0 0 120 160">
          {/* Station body */}
          <rect x="35" y="40" width="50" height="80" rx="6"
            fill="none" stroke="rgba(0,240,255,0.3)" strokeWidth="2" />
          {/* Antenna */}
          <line x1="60" y1="40" x2="60" y2="10"
            stroke="rgba(0,240,255,0.4)" strokeWidth="2" />
          <circle cx="60" cy="8" r="4"
            fill="none" stroke="rgba(0,240,255,0.5)" strokeWidth="1.5">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Wings */}
          <rect x="10" y="60" width="25" height="40" rx="3"
            fill="none" stroke="rgba(0,240,255,0.2)" strokeWidth="1.5" />
          <rect x="85" y="60" width="25" height="40" rx="3"
            fill="none" stroke="rgba(0,240,255,0.2)" strokeWidth="1.5" />
          {/* Engine glow */}
          <ellipse cx="60" cy="130" rx="20" ry="6"
            fill="rgba(0,240,255,0.15)" stroke="rgba(0,240,255,0.3)" strokeWidth="1">
            <animate attributeName="ry" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Windows - dark initially */}
          <rect x="48" y="55" width="8" height="8" rx="1"
            fill="rgba(0,240,255,0.1)" stroke="rgba(0,240,255,0.2)" strokeWidth="1" />
          <rect x="48" y="70" width="8" height="8" rx="1"
            fill="rgba(0,240,255,0.05)" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
          <rect x="48" y="85" width="8" height="8" rx="1"
            fill="rgba(0,240,255,0.05)" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
          <rect x="63" y="55" width="8" height="8" rx="1"
            fill="rgba(0,240,255,0.05)" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
          <rect x="63" y="70" width="8" height="8" rx="1"
            fill="rgba(0,240,255,0.05)" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
          <rect x="63" y="85" width="8" height="8" rx="1"
            fill="rgba(0,240,255,0.05)" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
        </svg>
      </div>

      <NeonText as="h1" color="cyan" style={{
        fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 900, letterSpacing: 8,
      }}>
        MATH ODYSSEY
      </NeonText>

      <p style={{
        fontSize: 'clamp(14px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.5)',
        letterSpacing: 4, fontWeight: 400,
      }}>
        数学奥德赛
      </p>

      <p style={{
        fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: 2,
        maxWidth: 400, textAlign: 'center', lineHeight: 1.8, marginTop: 10,
        fontFamily: 'var(--font-body)',
      }}>
        Your ship crashed on an abandoned space station.
        Use math to restore its systems and escape.
      </p>

      <NeonButton onClick={() => navigate('/station')} style={{ marginTop: 20 }}>
        Enter Station
      </NeonButton>

      <p style={{
        marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: 2,
      }}>
        进入太空站
      </p>
    </div>
  )
}
