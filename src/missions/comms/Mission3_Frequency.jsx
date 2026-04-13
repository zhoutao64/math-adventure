import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const FREQ_TASKS = [
  {
    equation: 'y = x + 2',
    targetM: 1, targetB: 2,
    tablePairs: [[0, 2], [1, 3], [2, 4]],
    hint: 'The line crosses the y-axis at 2 (that\'s b). It rises 1 for every 1 across (m = 1).',
    ahaId: 'ymxb_formula',
    ahaTitle: 'The y = mx + b Formula',
    ahaDesc: 'Every linear function can be written as y = mx + b, where m is the slope (steepness) and b is the y-intercept (where the line crosses the y-axis). Here: m = 1, b = 2, so y = x + 2!',
  },
  {
    equation: 'y = 2x − 1',
    targetM: 2, targetB: -1,
    tablePairs: [[0, -1], [1, 1], [2, 3]],
    hint: 'b is negative — the line starts below the x-axis at y = −1. The slope m = 2 makes it steep.',
    ahaId: 'intercept_meaning',
    ahaTitle: 'Meaning of Intercept',
    ahaDesc: 'b is where the line crosses the y-axis — the output when x = 0. A negative b means it starts below the x-axis. For y = 2x − 1: when x = 0, y = −1.',
  },
  {
    equation: 'y = −x + 3',
    targetM: -1, targetB: 3,
    tablePairs: [[0, 3], [1, 2], [3, 0]],
    hint: 'Negative slope means the line goes down. It crosses the y-axis at 3.',
    ahaId: null,
  },
  {
    equation: 'y = 0.5x',
    targetM: 0.5, targetB: 0,
    tablePairs: [[0, 0], [2, 1], [4, 2]],
    hint: 'This line passes through the origin (b = 0). Gentle slope of 0.5.',
    ahaId: 'zero_intercept',
    ahaTitle: 'Through the Origin',
    ahaDesc: 'When b = 0, the line passes through the origin (0, 0). The equation simplifies to y = mx — no constant term needed. Every proportional relationship goes through the origin!',
  },
  {
    equation: 'y = −2x + 4',
    targetM: -2, targetB: 4,
    tablePairs: [[0, 4], [1, 2], [2, 0]],
    hint: 'Steep negative slope (−2). Crosses y-axis at 4. Falls 2 units per 1 unit of x.',
    ahaId: null,
  },
  {
    equation: 'y = 1.5x − 2',
    targetM: 1.5, targetB: -2,
    tablePairs: null, // No table — graph only!
    hint: 'No table this time! Read the graph: where does it cross the y-axis? How steep is it?',
    ahaId: 'graph_reading',
    ahaTitle: 'Reading Graphs',
    ahaDesc: 'You can determine m and b directly from a graph: b is where it crosses the y-axis, m is the steepness (rise ÷ run between any two points). Master this skill and you can read any linear function!',
  },
]

// ─── Coordinate Grid with Lines ──────────────────────────────
function LineGrid({ targetM, targetB, userM, userB, tablePairs, solved }) {
  const W = 320, H = 280
  // Grid: x from -4 to 6, y from -5 to 7
  const gx1 = -4, gx2 = 6, gy1 = -5, gy2 = 7
  const px = (x) => ((x - gx1) / (gx2 - gx1)) * W
  const py = (y) => H - ((y - gy1) / (gy2 - gy1)) * H

  // Clamp line to viewport
  function lineEndpoints(m, b) {
    const y1 = m * gx1 + b
    const y2 = m * gx2 + b
    return { x1: px(gx1), y1: py(y1), x2: px(gx2), y2: py(y2) }
  }

  const target = lineEndpoints(targetM, targetB)
  const user = lineEndpoints(userM, userB)

  // Signal strength (0-100): how close user is to target
  const mDiff = Math.abs(userM - targetM)
  const bDiff = Math.abs(userB - targetB)
  const strength = Math.max(0, 100 - (mDiff * 25 + bDiff * 15))

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 360, display: 'block', margin: '0 auto' }}>
        {/* Grid lines */}
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

        {/* Target line (dashed pink) */}
        <line {...target}
          stroke="rgba(255,45,149,0.4)" strokeWidth={2} strokeDasharray="8,5" />

        {/* User line (solid bright) */}
        <line {...user}
          stroke={solved ? 'var(--neon-green)' : 'var(--neon-pink)'}
          strokeWidth={2.5}
          style={{ transition: 'all 0.2s' }} />

        {/* Target y-intercept marker */}
        <circle cx={px(0)} cy={py(targetB)} r={5}
          fill="none" stroke="rgba(255,45,149,0.5)" strokeWidth={1.5} strokeDasharray="3,2" />

        {/* User y-intercept marker */}
        <circle cx={px(0)} cy={py(userB)} r={5}
          fill={solved ? 'var(--neon-green)' : 'var(--neon-pink)'} stroke="#fff" strokeWidth={1} />

        {/* Table points if available */}
        {tablePairs && tablePairs.map(([x, y], i) => (
          <circle key={i} cx={px(x)} cy={py(y)} r={4}
            fill="rgba(255,45,149,0.6)" stroke="#fff" strokeWidth={1} />
        ))}

        {/* Equation label on target */}
        {solved && (
          <text x={px(gx2) - 10} y={py(targetM * gx2 + targetB) - 10}
            fill="var(--neon-green)" fontSize={14} textAnchor="end" fontFamily="var(--font-display)">
            {`y = ${targetM === 1 ? '' : targetM === -1 ? '−' : targetM}x${targetB > 0 ? ` + ${targetB}` : targetB < 0 ? ` − ${Math.abs(targetB)}` : ''}`}
          </text>
        )}
      </svg>

      {/* Signal Strength Bar */}
      <div style={{
        maxWidth: 360, margin: '8px auto 0', padding: '0 4px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: 12,
          color: 'rgba(255,255,255,0.4)', marginBottom: 4,
        }}>
          <span>Signal Strength</span>
          <span>{Math.round(strength)}%</span>
        </div>
        <div style={{
          height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${strength}%`,
            background: strength > 80 ? 'var(--neon-green)' : strength > 50 ? 'var(--neon-yellow)' : 'var(--neon-pink)',
            transition: 'all 0.3s',
            boxShadow: strength > 80 ? '0 0 8px var(--neon-green)' : 'none',
          }} />
        </div>
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────
export default function Mission3_Frequency({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [userM, setUserM] = useState(0)
  const [userB, setUserB] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.comms.missions['3']
  const task = FREQ_TASKS[taskIndex]

  function handleSubmit() {
    if (solved) return
    const mOk = Math.abs(userM - task.targetM) <= 0.25
    const bOk = Math.abs(userB - task.targetB) <= 0.5
    if (mOk && bOk) {
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
      dispatch({ type: 'RECORD_AHA', systemId: 'comms', missionId: '3', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < FREQ_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < FREQ_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
    setUserM(0)
    setUserB(0)
    setSolved(false)
    setWrongFlash(false)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'comms', missionId: '3' })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 12px', minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 10 }}>
        <NeonButton onClick={onBack} size="small">
          ← Exit
        </NeonButton>
      </div>

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-pink)', marginBottom: 6 }}>
        📡 MISSION 3
      </div>

      <NeonText as="h2" color="pink" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        频率调谐
      </NeonText>

      <p style={{
        fontSize: 'clamp(14px, 2.5vw, 13px)', color: 'rgba(255,255,255,0.5)', marginBottom: 16,
        fontFamily: 'var(--font-body)', textAlign: 'center', maxWidth: 500, padding: '0 8px',
      }}>
        {completed
          ? '🎉 All frequencies tuned! Comms array fully online.'
          : 'Set slope (m) and intercept (b) to match the target frequency.'
        }
      </p>

      {!completed && (
        <>
          {/* Coordinate Grid + Lines */}
          <div className="glass-panel" style={{
            padding: 'clamp(14px, 3vw, 20px)', maxWidth: 500, width: '100%',
            marginBottom: 16,
          }}>
            <div style={{ ...meterLabel, marginBottom: 8 }}>
              CHANNEL {taskIndex + 1}/{FREQ_TASKS.length} — TUNING
            </div>

            {/* Reference table (if available) */}
            {task.tablePairs && (
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12,
                flexWrap: 'wrap',
              }}>
                {task.tablePairs.map(([x, y], i) => (
                  <div key={i} style={{
                    padding: '4px 10px', background: 'rgba(255,45,149,0.1)',
                    borderRadius: 6, fontSize: 14, fontFamily: 'var(--font-display)',
                    color: 'var(--neon-pink)',
                  }}>
                    ({x}, {y})
                  </div>
                ))}
              </div>
            )}

            <LineGrid
              targetM={task.targetM}
              targetB={task.targetB}
              userM={userM}
              userB={userB}
              tablePairs={task.tablePairs}
              solved={solved}
            />

            {solved && (
              <div style={{
                marginTop: 12, textAlign: 'center',
                fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 700,
                color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                letterSpacing: 1,
              }}>
                {task.equation}
              </div>
            )}
          </div>

          {/* Dual sliders for m and b */}
          {!solved && (
            <div style={{ maxWidth: 400, width: '100%', padding: '0 16px', marginBottom: 16 }}>
              {/* Slope slider */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                    m (slope) =
                  </span>
                  <span style={{
                    fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
                    color: 'var(--neon-pink)', fontFamily: 'var(--font-display)',
                  }}>
                    {userM}
                  </span>
                </div>
                <input
                  type="range" min={-3} max={3} step={0.5} value={userM}
                  onChange={e => setUserM(parseFloat(e.target.value))}
                  style={{
                    width: '100%', height: 8, appearance: 'none',
                    background: 'rgba(255,255,255,0.1)', borderRadius: 4,
                    outline: 'none', cursor: 'pointer', accentColor: 'var(--neon-pink)',
                  }}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2,
                }}>
                  <span>−3</span><span>0</span><span>3</span>
                </div>
              </div>

              {/* Intercept slider */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                    b (intercept) =
                  </span>
                  <span style={{
                    fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
                    color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)',
                  }}>
                    {userB}
                  </span>
                </div>
                <input
                  type="range" min={-5} max={5} step={1} value={userB}
                  onChange={e => setUserB(parseInt(e.target.value))}
                  style={{
                    width: '100%', height: 8, appearance: 'none',
                    background: 'rgba(255,255,255,0.1)', borderRadius: 4,
                    outline: 'none', cursor: 'pointer', accentColor: 'var(--neon-cyan)',
                  }}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2,
                }}>
                  <span>−5</span><span>0</span><span>5</span>
                </div>
              </div>

              {/* y = mx + b display */}
              <div style={{
                textAlign: 'center', marginBottom: 12,
                fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 700,
                color: 'var(--neon-pink)', fontFamily: 'var(--font-display)',
                letterSpacing: 1,
                animation: wrongFlash ? 'shake 0.4s' : 'none',
              }}>
                y = {userM === 0 ? '' : userM === 1 ? '' : userM === -1 ? '−' : userM}{userM !== 0 ? 'x' : ''}{userB > 0 ? ` + ${userB}` : userB < 0 ? ` − ${Math.abs(userB)}` : (userM === 0 ? '0' : '')}
              </div>

              <div style={{ textAlign: 'center' }}>
                <NeonButton onClick={handleSubmit} color="pink" size="small">
                  Lock Frequency
                </NeonButton>
              </div>
            </div>
          )}

          {/* Wrong feedback */}
          {wrongFlash && (
            <div style={{
              color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2,
              marginBottom: 8, textAlign: 'center',
            }}>
              ⚠ FREQUENCY MISMATCH — adjust m and b
            </div>
          )}

          {/* Next button */}
          {solved && (
            <NeonButton onClick={handleNext} color="green" size="small">
              {taskIndex < FREQ_TASKS.length - 1 ? 'Next Channel →' : 'Complete →'}
            </NeonButton>
          )}
        </>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Frequencies Tuned</span>
          <span>{tasksCompleted}/{FREQ_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={FREQ_TASKS.length} color="pink" />
      </div>

      {/* Guide */}
      {!completed && !solved && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.hint || 'Adjust slope (m) and intercept (b) so your line matches the target.'}
        </div>
      )}

      {completed && (
        <NeonButton onClick={onBack} color="green" style={{ marginTop: 30 }}>
          Mission Complete →
        </NeonButton>
      )}

      <Modal isOpen={!!ahaModal} onClose={handleAhaClose} title={ahaModal?.ahaTitle || ''}>
        <p style={{ lineHeight: 2 }}>{ahaModal?.ahaDesc}</p>
      </Modal>
    </div>
  )
}

const meterLabel = {
  fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)',
}
