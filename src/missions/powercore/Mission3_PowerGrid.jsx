import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const GRID_TASKS = [
  // ── Commutative ──
  {
    type: 'commutative', label: 'GRID SECTOR A', ahaId: null,
    left: { expr: '3 + 5', result: 8 },
    right: { expr: '5 + 3', result: 8 },
  },
  {
    type: 'commutative', label: 'GRID SECTOR B',
    ahaId: 'commutative',
    ahaTitle: 'Commutative Law',
    ahaDesc: 'The order of numbers doesn\'t matter for addition or multiplication. a + b = b + a, a × b = b × a. The circuit works either way!',
    left: { expr: '4 × 7', result: 28 },
    right: { expr: '7 × 4', result: 28 },
  },
  // ── Associative ──
  {
    type: 'associative', label: 'GRID SECTOR C', ahaId: null,
    formA: { expr: '(2 + 3) + 4', result: 9 },
    formB: { expr: '2 + (3 + 4)', result: 9 },
  },
  {
    type: 'associative', label: 'GRID SECTOR D',
    ahaId: 'associative',
    ahaTitle: 'Associative Law',
    ahaDesc: 'How you group numbers doesn\'t change the result. (a + b) + c = a + (b + c). The power flows the same regardless of grouping!',
    formA: { expr: '(2 × 3) × 5', result: 30 },
    formB: { expr: '2 × (3 × 5)', result: 30 },
  },
  // ── Distributive ──
  {
    type: 'distributive', label: 'GRID SECTOR E',
    ahaId: 'distributive',
    ahaTitle: 'Distributive Law',
    ahaDesc: 'Multiplication distributes over addition: a × (b + c) = a × b + a × c. One big circuit equals two smaller ones combined!',
    whole: { expr: '3 × (4 + 2)', result: 18 },
    parts: { expr: '3 × 4 + 3 × 2', a: 12, b: 6, result: 18 },
    dims: { w: 3, h1: 4, h2: 2 },
  },
  {
    type: 'distributive', label: 'GRID SECTOR F',
    ahaId: 'area_model',
    ahaTitle: 'Area Model',
    ahaDesc: 'The distributive law IS area! A rectangle of width w and height (a + b) has the same area as two rectangles: w × a + w × b. Math is geometry!',
    whole: { expr: '5 × (3 + 1)', result: 20 },
    parts: { expr: '5 × 3 + 5 × 1', a: 15, b: 5, result: 20 },
    dims: { w: 5, h1: 3, h2: 1 },
  },
]

// ─── Shared Styles ───────────────────────────────────────────
const panelStyle = {
  background: 'var(--glass)', border: '1px solid var(--glass-border)',
  borderRadius: 12, padding: 'clamp(14px, 3vw, 20px)', textAlign: 'center',
  transition: 'all 0.3s',
}

const exprStyle = {
  fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700,
  fontFamily: 'var(--font-display)', color: '#fff', marginBottom: 8,
}

const resultStyle = {
  fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900,
  fontFamily: 'var(--font-display)',
  transition: 'all 0.3s',
}

const meterLabel = {
  fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 4,
}

// ─── Commutative Puzzle ──────────────────────────────────────
function CommutativeTask({ task, onComplete }) {
  const [revealedLeft, setRevealedLeft] = useState(false)
  const [revealedRight, setRevealedRight] = useState(false)
  const bothRevealed = revealedLeft && revealedRight

  return (
    <div>
      <div style={{ ...meterLabel, marginBottom: 12, textAlign: 'center' }}>
        COMPARE CIRCUITS
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 2vw, 16px)',
        maxWidth: 500, margin: '0 auto',
      }}>
        {/* Left circuit */}
        <div style={{
          ...panelStyle,
          borderColor: revealedLeft ? 'var(--neon-green)' : undefined,
        }}>
          <div style={{ ...meterLabel }}>CIRCUIT A</div>
          <div style={exprStyle}>{task.left.expr}</div>
          {!revealedLeft ? (
            <NeonButton onClick={() => setRevealedLeft(true)} size="small" color="cyan">
              Compute
            </NeonButton>
          ) : (
            <div style={{ ...resultStyle, color: 'var(--neon-green)' }}>
              = {task.left.result}
            </div>
          )}
        </div>
        {/* Right circuit */}
        <div style={{
          ...panelStyle,
          borderColor: revealedRight ? 'var(--neon-green)' : undefined,
        }}>
          <div style={{ ...meterLabel }}>CIRCUIT B</div>
          <div style={exprStyle}>{task.right.expr}</div>
          {!revealedRight ? (
            <NeonButton onClick={() => setRevealedRight(true)} size="small" color="cyan">
              Compute
            </NeonButton>
          ) : (
            <div style={{ ...resultStyle, color: 'var(--neon-green)' }}>
              = {task.right.result}
            </div>
          )}
        </div>
      </div>

      {bothRevealed && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{
            color: 'var(--neon-green)', fontSize: 14, letterSpacing: 2, marginBottom: 12,
            fontFamily: 'var(--font-body)',
          }}>
            Both circuits output the same power!
          </div>
          <NeonButton onClick={onComplete} color="green" size="small">
            Confirm →
          </NeonButton>
        </div>
      )}
    </div>
  )
}

// ─── Associative Puzzle ──────────────────────────────────────
function AssociativeTask({ task, onComplete }) {
  const [activeForm, setActiveForm] = useState(null) // 'A' | 'B'
  const [revealedA, setRevealedA] = useState(false)
  const [revealedB, setRevealedB] = useState(false)
  const bothRevealed = revealedA && revealedB

  function selectForm(form) {
    setActiveForm(form)
    if (form === 'A') setRevealedA(true)
    else setRevealedB(true)
  }

  return (
    <div>
      <div style={{ ...meterLabel, marginBottom: 12, textAlign: 'center' }}>
        TRY BOTH GROUPINGS
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 2vw, 16px)',
        maxWidth: 500, margin: '0 auto',
      }}>
        {/* Grouping A */}
        <div
          onClick={() => selectForm('A')}
          style={{
            ...panelStyle, cursor: revealedA ? 'default' : 'pointer',
            borderColor: activeForm === 'A' ? 'var(--neon-cyan)' : revealedA ? 'var(--neon-green)' : undefined,
            transform: activeForm === 'A' ? 'scale(1.02)' : undefined,
          }}
        >
          <div style={{ ...meterLabel }}>GROUPING A</div>
          <div style={exprStyle}>{task.formA.expr}</div>
          {revealedA && (
            <div style={{ ...resultStyle, color: 'var(--neon-green)' }}>
              = {task.formA.result}
            </div>
          )}
        </div>
        {/* Grouping B */}
        <div
          onClick={() => selectForm('B')}
          style={{
            ...panelStyle, cursor: revealedB ? 'default' : 'pointer',
            borderColor: activeForm === 'B' ? 'var(--neon-cyan)' : revealedB ? 'var(--neon-green)' : undefined,
            transform: activeForm === 'B' ? 'scale(1.02)' : undefined,
          }}
        >
          <div style={{ ...meterLabel }}>GROUPING B</div>
          <div style={exprStyle}>{task.formB.expr}</div>
          {revealedB && (
            <div style={{ ...resultStyle, color: 'var(--neon-green)' }}>
              = {task.formB.result}
            </div>
          )}
        </div>
      </div>

      {bothRevealed && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{
            color: 'var(--neon-green)', fontSize: 14, letterSpacing: 2, marginBottom: 12,
            fontFamily: 'var(--font-body)',
          }}>
            Regrouping doesn't change the output!
          </div>
          <NeonButton onClick={onComplete} color="green" size="small">
            Confirm →
          </NeonButton>
        </div>
      )}
    </div>
  )
}

// ─── Distributive Puzzle (Area Model) ────────────────────────
function DistributiveTask({ task, onComplete }) {
  const [split, setSplit] = useState(false)
  const { w, h1, h2 } = task.dims
  const totalH = h1 + h2
  const maxW = 'clamp(200px, 55vw, 360px)'
  const scale = 1 // visual scale for the grid cells
  const cellSize = `clamp(28px, 6vw, 40px)`

  return (
    <div>
      <div style={{ ...meterLabel, marginBottom: 12, textAlign: 'center' }}>
        {split ? 'SPLIT VIEW' : 'COMBINED VIEW'} — TAP TO TOGGLE
      </div>

      {/* Area rectangle */}
      <div
        onClick={() => setSplit(!split)}
        style={{
          margin: '0 auto', cursor: 'pointer',
          maxWidth: maxW, transition: 'all 0.4s',
        }}
      >
        {!split ? (
          /* Combined rectangle */
          <div style={{
            ...panelStyle,
            borderColor: 'var(--neon-cyan)',
            background: 'rgba(0,240,255,0.06)',
            padding: 0, overflow: 'hidden',
          }}>
            {/* Grid cells */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${w}, ${cellSize})`,
              gridTemplateRows: `repeat(${totalH}, ${cellSize})`,
              gap: 1, justifyContent: 'center', padding: 8,
            }}>
              {Array.from({ length: w * totalH }).map((_, i) => (
                <div key={i} style={{
                  background: 'rgba(0,240,255,0.15)',
                  border: '1px solid rgba(0,240,255,0.25)',
                  borderRadius: 3,
                }} />
              ))}
            </div>
            {/* Label */}
            <div style={{
              padding: '12px 8px', textAlign: 'center',
              borderTop: '1px solid rgba(0,240,255,0.2)',
            }}>
              <div style={exprStyle}>{task.whole.expr}</div>
              <div style={{ ...resultStyle, color: 'var(--neon-cyan)' }}>
                = {task.whole.result}
              </div>
            </div>
          </div>
        ) : (
          /* Split into two rectangles */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Top rectangle (w × h1) */}
            <div style={{
              ...panelStyle, padding: 0, overflow: 'hidden',
              borderColor: 'var(--neon-green)',
              background: 'rgba(57,255,20,0.04)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${w}, ${cellSize})`,
                gridTemplateRows: `repeat(${h1}, ${cellSize})`,
                gap: 1, justifyContent: 'center', padding: 8,
              }}>
                {Array.from({ length: w * h1 }).map((_, i) => (
                  <div key={i} style={{
                    background: 'rgba(57,255,20,0.15)',
                    border: '1px solid rgba(57,255,20,0.25)',
                    borderRadius: 3,
                  }} />
                ))}
              </div>
              <div style={{
                padding: '8px', textAlign: 'center',
                borderTop: '1px solid rgba(57,255,20,0.2)',
                fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 700,
                color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
              }}>
                {w} × {h1} = {task.parts.a}
              </div>
            </div>
            {/* Bottom rectangle (w × h2) */}
            <div style={{
              ...panelStyle, padding: 0, overflow: 'hidden',
              borderColor: 'var(--neon-yellow)',
              background: 'rgba(255,230,0,0.04)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${w}, ${cellSize})`,
                gridTemplateRows: `repeat(${h2}, ${cellSize})`,
                gap: 1, justifyContent: 'center', padding: 8,
              }}>
                {Array.from({ length: w * h2 }).map((_, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,230,0,0.15)',
                    border: '1px solid rgba(255,230,0,0.25)',
                    borderRadius: 3,
                  }} />
                ))}
              </div>
              <div style={{
                padding: '8px', textAlign: 'center',
                borderTop: '1px solid rgba(255,230,0,0.2)',
                fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 700,
                color: 'var(--neon-yellow)', fontFamily: 'var(--font-display)',
              }}>
                {w} × {h2} = {task.parts.b}
              </div>
            </div>
            {/* Sum */}
            <div style={{
              textAlign: 'center', padding: '8px 0',
              fontSize: 'clamp(14px, 3vw, 16px)', fontFamily: 'var(--font-display)',
              color: 'rgba(255,255,255,0.6)',
            }}>
              {task.parts.a} + {task.parts.b} = <span style={{ color: 'var(--neon-green)', fontWeight: 900, fontSize: 'clamp(18px, 4vw, 24px)' }}>{task.parts.result}</span>
            </div>
          </div>
        )}
      </div>

      {/* Equation comparison */}
      <div style={{
        textAlign: 'center', marginTop: 16,
        fontSize: 'clamp(14px, 2.5vw, 14px)', fontFamily: 'var(--font-body)',
        color: 'rgba(255,255,255,0.5)', lineHeight: 2,
      }}>
        {split
          ? <>{task.parts.expr} = <strong style={{ color: 'var(--neon-green)' }}>{task.parts.result}</strong></>
          : <>{task.whole.expr} = <strong style={{ color: 'var(--neon-cyan)' }}>{task.whole.result}</strong></>
        }
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <div style={{
          color: 'var(--neon-green)', fontSize: 14, letterSpacing: 2, marginBottom: 12,
          fontFamily: 'var(--font-body)', opacity: split ? 1 : 0.4,
          transition: 'opacity 0.3s',
        }}>
          {split ? 'Same area — same value!' : 'Tap the rectangle to split it'}
        </div>
        {split && (
          <NeonButton onClick={onComplete} color="green" size="small">
            Confirm →
          </NeonButton>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function Mission3_PowerGrid({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.powercore.missions['3']
  const task = GRID_TASKS[taskIndex]

  function handleTaskComplete() {
    const t = GRID_TASKS[taskIndex]
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)

    if (t.ahaId && !mState.ahaMoments.includes(t.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'powercore', missionId: '3', ahaId: t.ahaId })
      setAhaModal(t)
    } else if (taskIndex < GRID_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < GRID_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'powercore', missionId: '3' })
  }

  // Efficiency percentage
  const efficiency = Math.round((tasksCompleted / GRID_TASKS.length) * 100)

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

      <div style={{
        fontSize: 13, letterSpacing: 3, color: 'var(--neon-cyan)',
        marginBottom: 6,
      }}>
        ⚡ MISSION 3
      </div>

      <NeonText as="h2" color="cyan" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        配电优化
      </NeonText>

      <div style={{ textAlign: 'center', marginBottom: 20, maxWidth: 500, padding: '0 8px' }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          🎯 OBJECTIVE
        </div>
        <p style={{
          fontSize: 'clamp(15px, 3vw, 17px)', color: 'rgba(255,255,255,0.85)',
          fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0,
        }}>
          {completed
            ? '🎉 Power grid optimized! Station fully powered.'
            : 'Discover the algebraic properties that optimize the power grid.'
          }
        </p>
      </div>

      {/* Task label */}
      {!completed && (
        <div style={{
          fontSize: 12, letterSpacing: 3, color: 'var(--neon-yellow)',
          marginBottom: 16, opacity: 0.7,
        }}>
          {task?.label} — SECTOR {taskIndex + 1}/{GRID_TASKS.length}
        </div>
      )}

      {/* Task area */}
      {!completed && (
        <div style={{ maxWidth: 600, width: '100%', marginBottom: 20 }}>
          {task?.type === 'commutative' && (
            <CommutativeTask key={taskIndex} task={task} onComplete={handleTaskComplete} />
          )}
          {task?.type === 'associative' && (
            <AssociativeTask key={taskIndex} task={task} onComplete={handleTaskComplete} />
          )}
          {task?.type === 'distributive' && (
            <DistributiveTask key={taskIndex} task={task} onComplete={handleTaskComplete} />
          )}
        </div>
      )}

      {/* Efficiency meter */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Grid Efficiency</span>
          <span>{efficiency}%</span>
        </div>
        <ProgressBar value={tasksCompleted} max={GRID_TASKS.length} color="cyan" />
      </div>

      {/* Guide */}
      {!completed && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-cyan)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.type === 'commutative' && 'Compute both circuits and compare their outputs. Does the order matter?'}
          {task?.type === 'associative' && 'Click each grouping to see its result. Does regrouping change anything?'}
          {task?.type === 'distributive' && 'Tap the rectangle to split it into two parts. Compare the total area.'}
        </div>
      )}

      {completed && (
        <NeonButton onClick={onBack} color="green" style={{ marginTop: 30 }}>
          Mission Complete →
        </NeonButton>
      )}

      {/* Aha modal */}
      <Modal isOpen={!!ahaModal} onClose={handleAhaClose} title={ahaModal?.ahaTitle || ''}>
        <p style={{ lineHeight: 2 }}>{ahaModal?.ahaDesc}</p>
      </Modal>
    </div>
  )
}
