import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const ARC_TASKS = [
  {
    label: 'y = x\u00B2',
    a: 1, h: 0, k: 0,
    hint: 'The simplest parabola! a = 1, no shifts. Try centering everything at zero.',
    ahaId: 'parabola_shape',
    ahaTitle: 'The Parabola',
    ahaDesc: 'A quadratic function y=ax\u00B2 makes a U-shaped curve called a parabola. It\u2019s symmetric around its vertex!',
  },
  {
    label: 'y = \u2212x\u00B2 + 4',
    a: -1, h: 0, k: 4,
    hint: 'This parabola opens downward and the vertex is above the x-axis. Try a negative "a" value.',
    ahaId: 'a_direction',
    ahaTitle: 'The Sign of a',
    ahaDesc: 'When a>0 the parabola opens UP, when a<0 it opens DOWN. The sign of \u2018a\u2019 flips the whole curve!',
  },
  {
    label: 'y = (x\u22122)\u00B2',
    a: 1, h: 2, k: 0,
    hint: 'The parabola has shifted horizontally. Which slider controls left/right movement?',
    ahaId: 'vertex_form',
    ahaTitle: 'Vertex Form',
    ahaDesc: 'y=a(x\u2212h)\u00B2+k is the vertex form. h shifts the parabola left/right, k shifts it up/down.',
  },
  {
    label: 'y = \u2212(x\u22121)\u00B2 + 3',
    a: -1, h: 1, k: 3,
    hint: 'Opens downward with a shifted vertex. Combine what you learned about "a", "h", and "k".',
    ahaId: 'vertex_meaning',
    ahaTitle: 'Vertex Meaning',
    ahaDesc: 'The vertex (h,k) is the highest or lowest point of the parabola. For a>0 it\u2019s the minimum, for a<0 it\u2019s the maximum.',
  },
  {
    label: 'y = 0.5x\u00B2 \u2212 2',
    a: 0.5, h: 0, k: -2,
    hint: 'A wider parabola shifted downward. Smaller |a| means wider. Try a = 0.5.',
    ahaId: null,
  },
]

// ─── SVG Coordinate Grid ─────────────────────────────────────
const GX1 = -5, GX2 = 7, GY1 = -5, GY2 = 7
const SVG_W = 480, SVG_H = 480
const PAD = 32

function toSvgX(x) {
  return PAD + ((x - GX1) / (GX2 - GX1)) * (SVG_W - 2 * PAD)
}
function toSvgY(y) {
  return (SVG_H - PAD) - ((y - GY1) / (GY2 - GY1)) * (SVG_H - 2 * PAD)
}

function parabolaPolyline(a, h, k) {
  const pts = []
  // ~20 visible sample points across the x range
  const steps = 60
  const dx = (GX2 - GX1) / steps
  for (let i = 0; i <= steps; i++) {
    const x = GX1 + i * dx
    const y = a * (x - h) * (x - h) + k
    if (y >= GY1 - 1 && y <= GY2 + 1) {
      pts.push(`${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
    }
  }
  return pts.join(' ')
}

function CoordinateGraph({ task, userA, userH, userK }) {
  const gridLines = []
  for (let x = Math.ceil(GX1); x <= Math.floor(GX2); x++) {
    gridLines.push(
      <line key={`vx${x}`} x1={toSvgX(x)} y1={toSvgY(GY1)} x2={toSvgX(x)} y2={toSvgY(GY2)}
        stroke={x === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)'}
        strokeWidth={x === 0 ? 1.5 : 0.5} />
    )
  }
  for (let y = Math.ceil(GY1); y <= Math.floor(GY2); y++) {
    gridLines.push(
      <line key={`hy${y}`} x1={toSvgX(GX1)} y1={toSvgY(y)} x2={toSvgX(GX2)} y2={toSvgY(y)}
        stroke={y === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)'}
        strokeWidth={y === 0 ? 1.5 : 0.5} />
    )
  }

  const axisLabels = []
  for (let x = Math.ceil(GX1); x <= Math.floor(GX2); x++) {
    if (x === 0) continue
    axisLabels.push(
      <text key={`lx${x}`} x={toSvgX(x)} y={toSvgY(0) + 16}
        textAnchor="middle" fill="rgba(255,255,255,0.3)"
        fontSize="12" fontFamily="var(--font-display)">{x}</text>
    )
  }
  for (let y = Math.ceil(GY1); y <= Math.floor(GY2); y++) {
    if (y === 0) continue
    axisLabels.push(
      <text key={`ly${y}`} x={toSvgX(0) - 10} y={toSvgY(y) + 4}
        textAnchor="end" fill="rgba(255,255,255,0.3)"
        fontSize="12" fontFamily="var(--font-display)">{y}</text>
    )
  }

  const targetPts = parabolaPolyline(task.a, task.h, task.k)
  const userPts = parabolaPolyline(userA, userH, userK)

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', maxWidth: 420, height: 'auto', display: 'block', margin: '0 auto' }}>
      {gridLines}
      {axisLabels}

      {/* Target parabola - dashed green */}
      <polyline points={targetPts} fill="none"
        stroke="var(--neon-green)" strokeWidth="2"
        strokeDasharray="6 4" opacity="0.45" />
      {/* Target vertex marker */}
      <circle cx={toSvgX(task.h)} cy={toSvgY(task.k)} r="5"
        fill="none" stroke="var(--neon-green)" strokeWidth="1.5"
        strokeDasharray="3 2" opacity="0.45" />

      {/* User parabola - solid green */}
      <polyline points={userPts} fill="none"
        stroke="var(--neon-green)" strokeWidth="2.5" opacity="0.9" />
      {/* User vertex marker */}
      <circle cx={toSvgX(userH)} cy={toSvgY(userK)} r="5"
        fill="var(--neon-green)" opacity="0.9" />
      <text x={toSvgX(userH) + 10} y={toSvgY(userK) - 10}
        fill="var(--neon-green)" fontSize="13" fontFamily="var(--font-display)"
        opacity="0.7">({userH},{userK})</text>
    </svg>
  )
}

// ─── Format formula string ───────────────────────────────────
function formatFormula(a, h, k) {
  const aStr = a === 1 ? '' : a === -1 ? '\u2212' : `${a}`
  const hStr = h === 0 ? 'x' : h > 0 ? `(x\u2212${h})` : `(x+${Math.abs(h)})`
  const kStr = k === 0 ? '' : k > 0 ? ` + ${k}` : ` \u2212 ${Math.abs(k)}`
  return `y = ${aStr}${hStr}\u00B2${kStr}`
}

// ─── Component ───────────────────────────────────────────────
export default function Mission1_Arc({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [sliderA, setSliderA] = useState(1)
  const [sliderH, setSliderH] = useState(0)
  const [sliderK, setSliderK] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.launch.missions['1']
  const task = ARC_TASKS[taskIndex]

  function handleSubmit() {
    if (solved) return
    const aMatch = Math.abs(sliderA - task.a) <= 0.25
    const hMatch = sliderH === task.h
    const kMatch = sliderK === task.k
    if (aMatch && hMatch && kMatch) {
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
      dispatch({ type: 'RECORD_AHA', systemId: 'launch', missionId: '1', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < ARC_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < ARC_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    const next = taskIndex + 1
    setTaskIndex(next)
    setSliderA(1)
    setSliderH(0)
    setSliderK(0)
    setSolved(false)
    setWrongFlash(false)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'launch', missionId: '1' })
  }

  const formulaPreview = formatFormula(sliderA, sliderH, sliderK)

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

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-green)', marginBottom: 6 }}>
        🚀 MISSION 1
      </div>

      <NeonText as="h2" color="green" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        发射弧线
      </NeonText>

      <p style={{
        fontSize: 'clamp(14px, 2.5vw, 13px)', color: 'rgba(255,255,255,0.5)', marginBottom: 16,
        fontFamily: 'var(--font-body)', textAlign: 'center', maxWidth: 500, padding: '0 8px',
      }}>
        {completed
          ? '🎉 Launch trajectory locked! All arcs calibrated.'
          : `Adjust the sliders to match the target curve: ${task?.label || '?'}`
        }
      </p>

      {!completed && (
        <>
          {/* SVG Graph */}
          <div className="glass-panel" style={{
            padding: 'clamp(8px, 2vw, 16px)', maxWidth: 500, width: '100%',
            marginBottom: 20,
          }}>
            <div style={{ ...meterLabel, marginBottom: 8 }}>
              ARC {taskIndex + 1}/{ARC_TASKS.length} — TARGET: {task?.label}
            </div>

            <CoordinateGraph
              task={task}
              userA={sliderA} userH={sliderH} userK={sliderK}
            />

            {/* Legend */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8,
              fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)',
            }}>
              <span>
                <span style={{ color: 'var(--neon-green)', opacity: 0.45 }}>- -</span> Target
              </span>
              <span>
                <span style={{ color: 'var(--neon-green)', opacity: 0.9 }}>——</span> Yours
              </span>
            </div>
          </div>

          {/* Live formula preview */}
          <div style={{
            fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 900,
            color: solved ? 'var(--neon-green)' : '#fff',
            fontFamily: 'var(--font-display)', letterSpacing: 1,
            marginBottom: 16, textAlign: 'center',
            textShadow: solved ? '0 0 10px var(--neon-green), 0 0 30px rgba(57,255,20,0.3)' : 'none',
            animation: wrongFlash ? 'shake 0.4s' : 'none',
          }}>
            {formulaPreview}
          </div>

          {/* Sliders */}
          {!solved && (
            <div style={{ maxWidth: 400, width: '100%', padding: '0 16px', marginBottom: 20 }}>
              {/* Slider a */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                    a (direction / width)
                  </span>
                  <span style={{
                    fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 900,
                    color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                  }}>
                    {sliderA}
                  </span>
                </div>
                <input
                  type="range" min="-2" max="2" step="0.5"
                  value={sliderA}
                  onChange={e => setSliderA(parseFloat(e.target.value))}
                  style={{
                    width: '100%', height: 8, appearance: 'none', background: 'rgba(255,255,255,0.1)',
                    borderRadius: 4, outline: 'none', cursor: 'pointer',
                    accentColor: 'var(--neon-green)',
                  }}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4,
                }}>
                  <span>-2</span><span>2</span>
                </div>
              </div>

              {/* Slider h */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                    h (horizontal shift)
                  </span>
                  <span style={{
                    fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 900,
                    color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                  }}>
                    {sliderH}
                  </span>
                </div>
                <input
                  type="range" min="-3" max="4" step="1"
                  value={sliderH}
                  onChange={e => setSliderH(parseInt(e.target.value))}
                  style={{
                    width: '100%', height: 8, appearance: 'none', background: 'rgba(255,255,255,0.1)',
                    borderRadius: 4, outline: 'none', cursor: 'pointer',
                    accentColor: 'var(--neon-green)',
                  }}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4,
                }}>
                  <span>-3</span><span>4</span>
                </div>
              </div>

              {/* Slider k */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                    k (vertical shift)
                  </span>
                  <span style={{
                    fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 900,
                    color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                  }}>
                    {sliderK}
                  </span>
                </div>
                <input
                  type="range" min="-4" max="5" step="1"
                  value={sliderK}
                  onChange={e => setSliderK(parseInt(e.target.value))}
                  style={{
                    width: '100%', height: 8, appearance: 'none', background: 'rgba(255,255,255,0.1)',
                    borderRadius: 4, outline: 'none', cursor: 'pointer',
                    accentColor: 'var(--neon-green)',
                  }}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4,
                }}>
                  <span>-4</span><span>5</span>
                </div>
              </div>

              {/* Submit */}
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <NeonButton onClick={handleSubmit} color="green" size="small">
                  Lock Trajectory
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
              ⚠ TRAJECTORY MISMATCH — adjust the sliders
            </div>
          )}

          {/* Next button after solving */}
          {solved && (
            <NeonButton onClick={handleNext} color="green" size="small">
              {taskIndex < ARC_TASKS.length - 1 ? 'Next Arc →' : 'Complete →'}
            </NeonButton>
          )}
        </>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Arcs Calibrated</span>
          <span>{tasksCompleted}/{ARC_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={ARC_TASKS.length} color="green" />
      </div>

      {/* Guide */}
      {!completed && !solved && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-green)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.hint || 'Adjust a, h, and k to match the dashed target curve.'}
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
