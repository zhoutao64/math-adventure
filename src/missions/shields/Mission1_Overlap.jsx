import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const OVERLAP_TASKS = [
  {
    line1: { m: 1, b: 1, label: 'y = x + 1' },
    line2: { m: -1, b: 5, label: 'y = −x + 5' },
    answerX: 2, answerY: 3,
    hint: 'One line goes up (slope 1), the other goes down (slope −1). Where do they cross?',
    ahaId: 'intersection_point',
    ahaTitle: 'Intersection Point',
    ahaDesc: 'The intersection point is the one (x, y) that satisfies BOTH equations at the same time. At (2, 3): y = 2+1 = 3 and y = −2+5 = 3. Both equations agree!',
  },
  {
    line1: { m: 2, b: 0, label: 'y = 2x' },
    line2: { m: -1, b: 6, label: 'y = −x + 6' },
    answerX: 2, answerY: 4,
    hint: 'y = 2x rises steeply from the origin. y = −x + 6 falls from y = 6. Find where they meet.',
    ahaId: 'graphical_solve',
    ahaTitle: 'Graphical Method',
    ahaDesc: 'You just solved a system of equations by graphing! Drawing two lines and finding their intersection point gives you the solution to both equations simultaneously.',
  },
  {
    line1: { m: 0.5, b: 1, label: 'y = 0.5x + 1' },
    line2: { m: -1, b: 4, label: 'y = −x + 4' },
    answerX: 2, answerY: 2,
    hint: 'The first line has a gentle positive slope. The second falls from y = 4. Look for the crossing point.',
    ahaId: 'unique_solution',
    ahaTitle: 'One Unique Solution',
    ahaDesc: 'Two lines with different slopes always cross at exactly ONE point. That single point is the unique solution to the system. No more, no less!',
  },
  {
    line1: { m: 1, b: -1, label: 'y = x − 1' },
    line2: { m: -2, b: 8, label: 'y = −2x + 8' },
    answerX: 3, answerY: 2,
    hint: 'y = x − 1 passes through (1, 0). y = −2x + 8 is steep and falling. Where do they intersect?',
    ahaId: 'system_concept',
    ahaTitle: 'System of Equations',
    ahaDesc: 'A "system of equations" means two or more equations that must be true at the same time. The solution must satisfy ALL equations — that\'s what makes it a system!',
  },
  {
    line1: { m: 2, b: -3, label: 'y = 2x − 3' },
    line2: { m: -1, b: 6, label: 'y = −x + 6' },
    answerX: 3, answerY: 3,
    hint: 'One line rises 2 per 1, starting at −3. The other falls from 6. Find the crossing.',
    ahaId: null,
  },
]

// ─── Two-Line Grid ──────────────────────────────────────────
function TwoLineGrid({ line1, line2, guessX, guessY, solved }) {
  const W = 320, H = 280
  const gx1 = -2, gx2 = 8, gy1 = -3, gy2 = 9
  const px = (x) => ((x - gx1) / (gx2 - gx1)) * W
  const py = (y) => H - ((y - gy1) / (gy2 - gy1)) * H

  function lineEndpoints(m, b) {
    return { x1: px(gx1), y1: py(m * gx1 + b), x2: px(gx2), y2: py(m * gx2 + b) }
  }

  const l1 = lineEndpoints(line1.m, line1.b)
  const l2 = lineEndpoints(line2.m, line2.b)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 380, display: 'block', margin: '0 auto' }}>
      {/* Grid */}
      {Array.from({ length: gx2 - gx1 + 1 }, (_, i) => i + gx1).map(x => (
        <line key={`gx${x}`} x1={px(x)} y1={0} x2={px(x)} y2={H}
          stroke={x === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}
          strokeWidth={x === 0 ? 1.5 : 0.5} />
      ))}
      {Array.from({ length: gy2 - gy1 + 1 }, (_, i) => i + gy1).map(y => (
        <line key={`gy${y}`} x1={0} y1={py(y)} x2={W} y2={py(y)}
          stroke={y === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}
          strokeWidth={y === 0 ? 1.5 : 0.5} />
      ))}

      {/* Line 1 (purple) */}
      <line {...l1} stroke="var(--neon-purple)" strokeWidth={2.5} />
      {/* Line 2 (cyan) */}
      <line {...l2} stroke="var(--neon-cyan)" strokeWidth={2.5} />

      {/* Labels */}
      <text x={px(gx2) - 5} y={py(line1.m * gx2 + line1.b) - 8}
        fill="var(--neon-purple)" fontSize={13} textAnchor="end" fontFamily="var(--font-display)">
        {line1.label}
      </text>
      <text x={px(gx2) - 5} y={py(line2.m * gx2 + line2.b) - 8}
        fill="var(--neon-cyan)" fontSize={13} textAnchor="end" fontFamily="var(--font-display)">
        {line2.label}
      </text>

      {/* User guess marker */}
      {!solved && (
        <circle cx={px(guessX)} cy={py(guessY)} r={7}
          fill="none" stroke="var(--neon-yellow)" strokeWidth={2} strokeDasharray="3,2" />
      )}

      {/* Solved intersection */}
      {solved && (
        <>
          <circle cx={px(guessX)} cy={py(guessY)} r={8}
            fill="var(--neon-green)" opacity={0.3} />
          <circle cx={px(guessX)} cy={py(guessY)} r={5}
            fill="var(--neon-green)" />
          <text x={px(guessX) + 12} y={py(guessY) - 8}
            fill="var(--neon-green)" fontSize={14} fontFamily="var(--font-display)">
            ({guessX}, {guessY})
          </text>
        </>
      )}
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────────
export default function Mission1_Overlap({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [guessX, setGuessX] = useState(0)
  const [guessY, setGuessY] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.shields.missions['1']
  const task = OVERLAP_TASKS[taskIndex]

  function handleSubmit() {
    if (solved) return
    if (guessX === task.answerX && guessY === task.answerY) {
      setSolved(true)
    } else {
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 800)
    }
  }

  function handleNext() {
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)
    if (task.ahaId && !mState.ahaMoments.includes(task.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'shields', missionId: '1', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < OVERLAP_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < OVERLAP_TASKS.length - 1) advanceTask()
    else finishMission()
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
    setGuessX(0); setGuessY(0)
    setSolved(false); setWrongFlash(false)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'shields', missionId: '1' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 10 }}>
        <NeonButton onClick={onBack} size="small">← Exit</NeonButton>
      </div>

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-purple)', marginBottom: 6 }}>🛡️ MISSION 1</div>
      <NeonText as="h2" color="purple" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>护盾重叠区</NeonText>

      <p style={{ fontSize: 'clamp(14px, 2.5vw, 13px)', color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontFamily: 'var(--font-body)', textAlign: 'center', maxWidth: 500, padding: '0 8px' }}>
        {completed ? '🎉 Shield overlap zones identified! Layer 1 online.' : 'Find the intersection point of the two shield lines.'}
      </p>

      {!completed && (
        <>
          <div className="glass-panel" style={{ padding: 'clamp(14px, 3vw, 20px)', maxWidth: 500, width: '100%', marginBottom: 16 }}>
            <div style={{ ...meterLabel, marginBottom: 8 }}>OVERLAP {taskIndex + 1}/{OVERLAP_TASKS.length}</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: 'var(--neon-purple)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{task.line1.label}</span>
              <span style={{ fontSize: 14, color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{task.line2.label}</span>
            </div>

            <TwoLineGrid line1={task.line1} line2={task.line2} guessX={guessX} guessY={guessY} solved={solved} />
          </div>

          {!solved && (
            <div style={{ maxWidth: 400, width: '100%', padding: '0 16px', marginBottom: 16 }}>
              {/* X slider */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>x =</span>
                  <span style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: 'var(--neon-purple)', fontFamily: 'var(--font-display)' }}>{guessX}</span>
                </div>
                <input type="range" min={-2} max={8} step={1} value={guessX}
                  onChange={e => setGuessX(parseInt(e.target.value))}
                  style={{ width: '100%', height: 8, appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 4, outline: 'none', cursor: 'pointer', accentColor: 'var(--neon-purple)' }} />
              </div>
              {/* Y slider */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>y =</span>
                  <span style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)' }}>{guessY}</span>
                </div>
                <input type="range" min={-3} max={9} step={1} value={guessY}
                  onChange={e => setGuessY(parseInt(e.target.value))}
                  style={{ width: '100%', height: 8, appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 4, outline: 'none', cursor: 'pointer', accentColor: 'var(--neon-cyan)' }} />
              </div>

              <div style={{ textAlign: 'center', fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700, color: 'var(--neon-purple)', fontFamily: 'var(--font-display)', marginBottom: 12, animation: wrongFlash ? 'shake 0.4s' : 'none' }}>
                Intersection: ({guessX}, {guessY})
              </div>
              <div style={{ textAlign: 'center' }}>
                <NeonButton onClick={handleSubmit} color="purple" size="small">Lock Overlap</NeonButton>
              </div>
            </div>
          )}

          {wrongFlash && (
            <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>
              ⚠ SHIELD MISALIGNED — wrong intersection
            </div>
          )}

          {solved && <NeonButton onClick={handleNext} color="green" size="small">{taskIndex < OVERLAP_TASKS.length - 1 ? 'Next Overlap →' : 'Complete →'}</NeonButton>}
        </>
      )}

      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Overlaps Found</span><span>{tasksCompleted}/{OVERLAP_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={OVERLAP_TASKS.length} color="purple" />
      </div>

      {!completed && !solved && (
        <div className="glass-panel" style={{ marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%', fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontFamily: 'var(--font-body)' }}>
          <div style={{ color: 'var(--neon-purple)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>💡 GUIDE</div>
          {task?.hint}
        </div>
      )}

      {completed && <NeonButton onClick={onBack} color="green" style={{ marginTop: 30 }}>Mission Complete →</NeonButton>}

      <Modal isOpen={!!ahaModal} onClose={handleAhaClose} title={ahaModal?.ahaTitle || ''}>
        <p style={{ lineHeight: 2 }}>{ahaModal?.ahaDesc}</p>
      </Modal>
    </div>
  )
}

const meterLabel = { fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)' }
