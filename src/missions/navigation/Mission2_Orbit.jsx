import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const ORBIT_TASKS = [
  {
    equation: 'x + 5 = 12',
    answer: 7,
    correctOp: { label: '− 5', desc: 'Subtract 5 from both sides' },
    wrongOps: [
      { label: '+ 5', desc: 'Add 5 to both sides' },
      { label: '× 5', desc: 'Multiply both sides by 5' },
      { label: '÷ 5', desc: 'Divide both sides by 5' },
    ],
    solveSteps: ['x + 5 − 5 = 12 − 5', 'x = 7'],
    hint: 'To isolate x, undo the +5. What is the opposite of adding 5?',
    ahaId: 'solve_add',
    ahaTitle: 'Solving Addition',
    ahaDesc: 'When x has something added to it, subtract that number from both sides. x + 5 = 12 → subtract 5 → x = 7. The equation stays balanced!',
  },
  {
    equation: 'x − 3 = 8',
    answer: 11,
    correctOp: { label: '+ 3', desc: 'Add 3 to both sides' },
    wrongOps: [
      { label: '− 3', desc: 'Subtract 3 from both sides' },
      { label: '× 3', desc: 'Multiply both sides by 3' },
      { label: '÷ 3', desc: 'Divide both sides by 3' },
    ],
    solveSteps: ['x − 3 + 3 = 8 + 3', 'x = 11'],
    hint: 'x has 3 subtracted. What operation undoes subtraction?',
    ahaId: 'solve_sub',
    ahaTitle: 'Solving Subtraction',
    ahaDesc: 'When x has something subtracted, add it back to both sides. x − 3 = 8 → add 3 → x = 11. Subtraction and addition are inverse operations!',
  },
  {
    equation: '4x = 20',
    answer: 5,
    correctOp: { label: '÷ 4', desc: 'Divide both sides by 4' },
    wrongOps: [
      { label: '× 4', desc: 'Multiply both sides by 4' },
      { label: '− 4', desc: 'Subtract 4 from both sides' },
      { label: '+ 4', desc: 'Add 4 to both sides' },
    ],
    solveSteps: ['4x ÷ 4 = 20 ÷ 4', 'x = 5'],
    hint: 'x is multiplied by 4. What undoes multiplication?',
    ahaId: 'solve_mult',
    ahaTitle: 'Solving Multiplication',
    ahaDesc: 'When x is multiplied by a number, divide both sides by that number. 4x = 20 → divide by 4 → x = 5. Division cancels multiplication!',
  },
  {
    equation: 'x / 3 = 6',
    answer: 18,
    correctOp: { label: '× 3', desc: 'Multiply both sides by 3' },
    wrongOps: [
      { label: '÷ 3', desc: 'Divide both sides by 3' },
      { label: '+ 3', desc: 'Add 3 to both sides' },
      { label: '− 3', desc: 'Subtract 3 from both sides' },
    ],
    solveSteps: ['(x / 3) × 3 = 6 × 3', 'x = 18'],
    hint: 'x is divided by 3. What undoes division?',
    ahaId: 'solve_div',
    ahaTitle: 'Solving Division',
    ahaDesc: 'When x is divided by a number, multiply both sides by it. x/3 = 6 → multiply by 3 → x = 18. Every operation has its inverse!',
  },
  {
    equation: 'x + 7 = 7',
    answer: 0,
    correctOp: { label: '− 7', desc: 'Subtract 7 from both sides' },
    wrongOps: [
      { label: '+ 7', desc: 'Add 7 to both sides' },
      { label: '÷ 7', desc: 'Divide both sides by 7' },
      { label: '× 7', desc: 'Multiply both sides by 7' },
    ],
    solveSteps: ['x + 7 − 7 = 7 − 7', 'x = 0'],
    hint: 'Subtract 7 from both sides. Zero is a valid answer!',
    ahaId: null,
  },
  {
    equation: '2x = −6',
    answer: -3,
    correctOp: { label: '÷ 2', desc: 'Divide both sides by 2' },
    wrongOps: [
      { label: '× 2', desc: 'Multiply both sides by 2' },
      { label: '− 2', desc: 'Subtract 2 from both sides' },
      { label: '+ 2', desc: 'Add 2 to both sides' },
    ],
    solveSteps: ['2x ÷ 2 = −6 ÷ 2', 'x = −3'],
    hint: 'Divide both sides by 2. Negative answers are okay!',
    ahaId: null,
  },
]

// ─── Styles ──────────────────────────────────────────────────
const opBtnStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minWidth: 80, minHeight: 54, padding: '8px 12px',
  background: 'var(--glass)', border: '2px solid rgba(255,230,0,0.3)',
  borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s',
  fontFamily: 'var(--font-display)',
}

// ─── Component ───────────────────────────────────────────────
export default function Mission2_Orbit({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [selected, setSelected] = useState(null) // 'correct' | index of wrong
  const [showSteps, setShowSteps] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(null)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.navigation.missions['2']
  const task = ORBIT_TASKS[taskIndex]

  // Shuffle options (correct + wrong), but keep stable per task
  const options = (() => {
    if (!task) return []
    const all = [
      { ...task.correctOp, isCorrect: true },
      ...task.wrongOps.map(w => ({ ...w, isCorrect: false })),
    ]
    // Simple deterministic shuffle based on taskIndex
    const seed = taskIndex * 7 + 3
    return all.sort((a, b) => {
      const ha = (a.label.charCodeAt(0) * seed) % 17
      const hb = (b.label.charCodeAt(0) * seed) % 17
      return ha - hb
    })
  })()

  function handleSelect(opt, idx) {
    if (selected !== null || showSteps) return
    if (opt.isCorrect) {
      setSelected('correct')
      setTimeout(() => {
        setShowSteps(true)
      }, 500)
    } else {
      setWrongFlash(idx)
      setTimeout(() => setWrongFlash(null), 800)
    }
  }

  function handleNext() {
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)

    if (task.ahaId && !mState.ahaMoments.includes(task.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'navigation', missionId: '2', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < ORBIT_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < ORBIT_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
    setSelected(null)
    setShowSteps(false)
    setWrongFlash(null)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'navigation', missionId: '2' })
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

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-yellow)', marginBottom: 6 }}>
        🧭 MISSION 2
      </div>

      <NeonText as="h2" color="yellow" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        轨道修正
      </NeonText>

      <div style={{ textAlign: 'center', marginBottom: 20, maxWidth: 500, padding: '0 8px' }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
          🎯 OBJECTIVE
        </div>
        <p style={{
          fontSize: 'clamp(15px, 3vw, 17px)', color: 'rgba(255,255,255,0.85)',
          fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0,
        }}>
          {completed
            ? '🎉 Orbit stabilized! Navigation calibrated.'
            : 'Choose the correct operation to isolate x.'
          }
        </p>
      </div>

      {!completed && (
        <>
          {/* Equation */}
          <div className="glass-panel" style={{
            padding: 'clamp(16px, 3vw, 24px)', maxWidth: 500, width: '100%',
            marginBottom: 20, textAlign: 'center',
          }}>
            <div style={{ ...meterLabel, marginBottom: 8 }}>
              EQUATION — CORRECTION {taskIndex + 1}/{ORBIT_TASKS.length}
            </div>
            <div style={{
              fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900,
              color: 'var(--neon-yellow)', fontFamily: 'var(--font-display)',
              textShadow: '0 0 10px var(--neon-yellow), 0 0 30px rgba(255,230,0,0.3)',
              letterSpacing: 2,
            }}>
              {task?.equation}
            </div>

            {/* Solve steps */}
            {showSteps && (
              <div style={{ marginTop: 16 }}>
                {task?.solveSteps.map((step, i) => (
                  <div key={i} style={{
                    fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
                    color: i === task.solveSteps.length - 1 ? 'var(--neon-green)' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-display)', marginTop: 8,
                    letterSpacing: 1,
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operation choices */}
          {!showSteps && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10, maxWidth: 400, width: '100%', marginBottom: 20,
            }}>
              {options.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(opt, i)}
                  style={{
                    ...opBtnStyle,
                    ...(selected === 'correct' && opt.isCorrect ? {
                      borderColor: 'var(--neon-green)', background: 'rgba(57,255,20,0.1)',
                    } : {}),
                    ...(wrongFlash === i ? {
                      borderColor: 'var(--neon-pink)', background: 'rgba(255,45,149,0.1)',
                      animation: 'shake 0.4s',
                    } : {}),
                  }}
                >
                  <div style={{
                    fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900,
                    color: selected === 'correct' && opt.isCorrect ? 'var(--neon-green)'
                      : wrongFlash === i ? 'var(--neon-pink)' : 'var(--neon-yellow)',
                  }}>
                    {opt.label}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4,
                    fontFamily: 'var(--font-body)', textAlign: 'center',
                  }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Next button after solving */}
          {showSteps && (
            <NeonButton onClick={handleNext} color="green" size="small">
              {taskIndex < ORBIT_TASKS.length - 1 ? 'Next Correction →' : 'Complete →'}
            </NeonButton>
          )}

          {/* Wrong feedback */}
          {wrongFlash !== null && (
            <div style={{
              color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2,
              marginBottom: 8, textAlign: 'center',
            }}>
              ⚠ ORBIT DRIFT — wrong operation
            </div>
          )}
        </>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Orbit Corrections</span>
          <span>{tasksCompleted}/{ORBIT_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={ORBIT_TASKS.length} color="yellow" />
      </div>

      {/* Guide */}
      {!completed && !showSteps && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-yellow)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.hint || 'Pick the operation that isolates x on one side of the equation.'}
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
