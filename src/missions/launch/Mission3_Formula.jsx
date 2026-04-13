import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const FORMULA_TASKS = [
  {
    equation: 'x² − 5x + 6 = 0',
    steps: [
      {
        prompt: 'Identify the coefficients a, b, c',
        correctOp: { label: 'a=1, b=−5, c=6', desc: 'Read coefficients from ax²+bx+c' },
        wrongOps: [
          { label: 'a=1, b=5, c=6', desc: 'b should include its sign' },
          { label: 'a=5, b=1, c=6', desc: 'a is the x² coefficient' },
          { label: 'a=1, b=−5, c=−6', desc: 'c is the constant term' },
        ],
      },
      {
        prompt: 'Compute the discriminant b²−4ac',
        correctOp: { label: 'Δ = 1', desc: '(−5)²−4(1)(6) = 25−24 = 1' },
        wrongOps: [
          { label: 'Δ = 49', desc: '25+24 = 49' },
          { label: 'Δ = −1', desc: '24−25 = −1' },
          { label: 'Δ = 25', desc: 'That is just b²' },
        ],
      },
      {
        prompt: 'Compute the roots',
        correctOp: { label: 'x = 3, x = 2', desc: '(5±1)/2 → 6/2, 4/2' },
        wrongOps: [
          { label: 'x = 5, x = 1', desc: 'Don\'t forget to divide by 2a' },
          { label: 'x = 3, x = −2', desc: 'Check the signs carefully' },
          { label: 'x = 6, x = 4', desc: 'You must divide by 2a = 2' },
        ],
      },
    ],
    roots: 'x = 3, x = 2',
    check: '3² − 5(3) + 6 = 9 − 15 + 6 = 0 ✓',
    hint: 'Start by reading coefficients: the equation is in the form ax²+bx+c = 0. Watch the signs!',
    ahaId: 'quadratic_formula',
    ahaTitle: 'The Universal Solver',
    ahaDesc: 'The quadratic formula x = (−b ± √(b²−4ac)) / 2a works for ANY quadratic equation. It\'s the universal solver!',
  },
  {
    equation: 'x² − 4x + 4 = 0',
    steps: [
      {
        prompt: 'Identify the coefficients a, b, c',
        correctOp: { label: 'a=1, b=−4, c=4', desc: 'Read coefficients from ax²+bx+c' },
        wrongOps: [
          { label: 'a=1, b=4, c=4', desc: 'b should include its sign' },
          { label: 'a=4, b=−1, c=4', desc: 'a is the x² coefficient' },
          { label: 'a=1, b=−4, c=−4', desc: 'c is the constant term (+4)' },
        ],
      },
      {
        prompt: 'Compute the discriminant b²−4ac',
        correctOp: { label: 'Δ = 0', desc: '(−4)²−4(1)(4) = 16−16 = 0' },
        wrongOps: [
          { label: 'Δ = 32', desc: '16+16 = 32' },
          { label: 'Δ = 16', desc: 'That is just b²' },
          { label: 'Δ = −16', desc: 'Check: (−4)² is positive' },
        ],
      },
      {
        prompt: 'Compute the root(s)',
        correctOp: { label: 'x = 2 (one root)', desc: '4/2 = 2, discriminant is 0' },
        wrongOps: [
          { label: 'x = 4', desc: 'Don\'t forget to divide by 2a' },
          { label: 'x = 2, x = −2', desc: 'Δ=0 means only one root' },
          { label: 'x = 0', desc: '(4±0)/2 = 2, not 0' },
        ],
      },
    ],
    roots: 'x = 2',
    check: '2² − 4(2) + 4 = 4 − 8 + 4 = 0 ✓',
    hint: 'When the discriminant equals zero, the quadratic has exactly one repeated root.',
    ahaId: 'discriminant',
    ahaTitle: 'The Discriminant Detector',
    ahaDesc: 'The discriminant b²−4ac tells you how many solutions exist: positive → 2 roots, zero → 1 root, negative → no real roots.',
  },
  {
    equation: 'x² + 2x − 8 = 0',
    steps: [
      {
        prompt: 'Identify the coefficients a, b, c',
        correctOp: { label: 'a=1, b=2, c=−8', desc: 'Read coefficients from ax²+bx+c' },
        wrongOps: [
          { label: 'a=1, b=2, c=8', desc: 'c is −8, not 8' },
          { label: 'a=2, b=1, c=−8', desc: 'a is the x² coefficient (1)' },
          { label: 'a=1, b=−2, c=−8', desc: 'b is +2 here' },
        ],
      },
      {
        prompt: 'Compute the discriminant b²−4ac',
        correctOp: { label: 'Δ = 36', desc: '(2)²−4(1)(−8) = 4+32 = 36' },
        wrongOps: [
          { label: 'Δ = −28', desc: '4−32 = −28 (sign error on 4ac)' },
          { label: 'Δ = 4', desc: 'That is just b²' },
          { label: 'Δ = 28', desc: '4ac = 4·1·(−8) = −32, so minus a negative' },
        ],
      },
      {
        prompt: 'Compute the roots',
        correctOp: { label: 'x = 2, x = −4', desc: '(−2±6)/2 → 4/2, −8/2' },
        wrongOps: [
          { label: 'x = 4, x = −2', desc: 'Check: (−2+6)/2 = 2, not 4' },
          { label: 'x = 2, x = 4', desc: 'One root should be negative' },
          { label: 'x = −2, x = 4', desc: '(−2+6)/2 = 2, (−2−6)/2 = −4' },
        ],
      },
    ],
    roots: 'x = 2, x = −4',
    check: '2² + 2(2) − 8 = 4 + 4 − 8 = 0 ✓',
    hint: 'Careful with signs: when c is negative, 4ac is negative, so −4ac becomes positive.',
    ahaId: null,
  },
  {
    equation: '2x² − 3x − 2 = 0',
    steps: [
      {
        prompt: 'Identify the coefficients a, b, c',
        correctOp: { label: 'a=2, b=−3, c=−2', desc: 'Read coefficients from ax²+bx+c' },
        wrongOps: [
          { label: 'a=2, b=3, c=−2', desc: 'b is −3, include the sign' },
          { label: 'a=2, b=−3, c=2', desc: 'c is −2, not +2' },
          { label: 'a=−3, b=2, c=−2', desc: 'a is the x² coefficient' },
        ],
      },
      {
        prompt: 'Compute the discriminant b²−4ac',
        correctOp: { label: 'Δ = 25', desc: '(−3)²−4(2)(−2) = 9+16 = 25' },
        wrongOps: [
          { label: 'Δ = −7', desc: '9−16 = −7 (sign error on 4ac)' },
          { label: 'Δ = 9', desc: 'That is just b²' },
          { label: 'Δ = 7', desc: '4ac = 4·2·(−2) = −16, so 9−(−16) = 25' },
        ],
      },
      {
        prompt: 'Compute the roots',
        correctOp: { label: 'x = 2, x = −0.5', desc: '(3±5)/4 → 8/4, −2/4' },
        wrongOps: [
          { label: 'x = 4, x = −1', desc: 'Divide by 2a = 4, not 2' },
          { label: 'x = 2, x = 0.5', desc: '(3−5)/4 = −2/4 = −0.5' },
          { label: 'x = 8, x = −2', desc: 'Don\'t forget to divide by 2a' },
        ],
      },
    ],
    roots: 'x = 2, x = −0.5',
    check: '2(2)² − 3(2) − 2 = 8 − 6 − 2 = 0 ✓',
    hint: 'When a ≠ 1, remember to divide by 2a (not just 2). Here 2a = 4.',
    ahaId: null,
  },
  {
    equation: 'x² + x − 1 = 0',
    steps: [
      {
        prompt: 'Identify the coefficients a, b, c',
        correctOp: { label: 'a=1, b=1, c=−1', desc: 'Read coefficients from ax²+bx+c' },
        wrongOps: [
          { label: 'a=1, b=1, c=1', desc: 'c is −1, not +1' },
          { label: 'a=1, b=−1, c=−1', desc: 'b is +1 here' },
          { label: 'a=0, b=1, c=−1', desc: 'a is the x² coefficient (1)' },
        ],
      },
      {
        prompt: 'Compute the discriminant b²−4ac',
        correctOp: { label: 'Δ = 5', desc: '(1)²−4(1)(−1) = 1+4 = 5' },
        wrongOps: [
          { label: 'Δ = −3', desc: '1−4 = −3 (sign error on 4ac)' },
          { label: 'Δ = 3', desc: '4ac = 4·1·(−1) = −4, so 1−(−4) = 5' },
          { label: 'Δ = 1', desc: 'That is just b²' },
        ],
      },
      {
        prompt: 'Compute the roots',
        correctOp: { label: 'x = (−1±√5)/2', desc: '√5 is irrational — exact form' },
        wrongOps: [
          { label: 'x = (1±√5)/2', desc: 'Formula uses −b, so −(1) = −1' },
          { label: 'x = (−1±5)/2', desc: '√5 ≠ 5, don\'t drop the radical' },
          { label: 'x = −1, x = 1', desc: 'These don\'t satisfy the equation' },
        ],
      },
    ],
    roots: 'x = (−1+√5)/2, x = (−1−√5)/2',
    check: 'x ≈ 0.618 → (0.618)² + 0.618 − 1 ≈ 0 ✓',
    hint: 'When the discriminant is not a perfect square, the roots involve √. Leave them in exact form.',
    ahaId: 'irrational_roots',
    ahaTitle: 'Beyond Integers',
    ahaDesc: 'Some quadratic equations have irrational roots like (−1+√5)/2. These are exact — decimals would only be approximations!',
  },
]

const STEP_LABELS = ['Step 1: Identify a, b, c', 'Step 2: Discriminant', 'Step 3: Roots']

// ─── Styles ──────────────────────────────────────────────────
const opBtnStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minWidth: 80, minHeight: 54, padding: '8px 12px',
  background: 'var(--glass)', border: '2px solid rgba(57,255,20,0.3)',
  borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s',
  fontFamily: 'var(--font-display)',
}

const formulaDisplayStyle = {
  fontSize: 'clamp(13px, 2.8vw, 16px)',
  color: 'rgba(57,255,20,0.6)',
  fontFamily: 'var(--font-display)',
  textAlign: 'center',
  padding: '8px 12px',
  background: 'rgba(57,255,20,0.04)',
  borderRadius: 8,
  border: '1px solid rgba(57,255,20,0.15)',
  letterSpacing: 1,
  marginBottom: 16,
}

// ─── Component ───────────────────────────────────────────────
export default function Mission3_Formula({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [wrongFlash, setWrongFlash] = useState(null)
  const [showCheck, setShowCheck] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.launch.missions['3']
  const task = FORMULA_TASKS[taskIndex]
  const step = task?.steps[stepIndex]
  const isLastStep = stepIndex === (task?.steps.length || 0) - 1

  // Shuffle options (correct + wrong), stable per task+step
  const options = (() => {
    if (!step) return []
    const all = [
      { ...step.correctOp, isCorrect: true },
      ...step.wrongOps.map(w => ({ ...w, isCorrect: false })),
    ]
    const seed = taskIndex * 13 + stepIndex * 7 + 3
    return all.sort((a, b) => {
      const ha = (a.label.charCodeAt(0) * seed) % 19
      const hb = (b.label.charCodeAt(0) * seed) % 19
      return ha - hb
    })
  })()

  function handleSelect(opt, idx) {
    if (selected !== null) return
    if (opt.isCorrect) {
      setSelected('correct')
      setTimeout(() => {
        const newHistory = [...history, { stepLabel: STEP_LABELS[stepIndex], choice: step.correctOp.label, detail: step.correctOp.desc }]
        setHistory(newHistory)

        if (isLastStep) {
          setShowCheck(true)
        } else {
          setStepIndex(prev => prev + 1)
          setSelected(null)
          setWrongFlash(null)
        }
      }, 600)
    } else {
      setWrongFlash(idx)
      setTimeout(() => setWrongFlash(null), 800)
    }
  }

  function handleNext() {
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)

    if (task.ahaId && !mState.ahaMoments.includes(task.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'launch', missionId: '3', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < FORMULA_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < FORMULA_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
    setStepIndex(0)
    setHistory([])
    setSelected(null)
    setShowCheck(false)
    setWrongFlash(null)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'launch', missionId: '3' })
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

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-green)', marginBottom: 6 }}>
        🚀 MISSION 3
      </div>

      <NeonText as="h2" color="green" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        逃逸速度
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
            ? '🎉🚀 ESCAPE VELOCITY ACHIEVED! Odyssey Station fully operational!'
            : 'Solve quadratic equations using the quadratic formula — step by step.'
          }
        </p>
      </div>

      {!completed && !showCheck && (
        <>
          {/* Equation + Quadratic Formula Display + Step History */}
          <div className="glass-panel" style={{
            padding: 'clamp(16px, 3vw, 24px)', maxWidth: 500, width: '100%',
            marginBottom: 20,
          }}>
            <div style={{ ...meterLabel, marginBottom: 12 }}>
              EQUATION {taskIndex + 1}/{FORMULA_TASKS.length} — {STEP_LABELS[stepIndex] || `STEP ${stepIndex + 1}`}
            </div>

            {/* Current equation */}
            <div style={{
              fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900,
              color: selected === 'correct' ? 'var(--neon-green)' : '#fff',
              fontFamily: 'var(--font-display)',
              textShadow: selected === 'correct'
                ? '0 0 10px var(--neon-green), 0 0 30px rgba(57,255,20,0.3)'
                : '0 0 10px rgba(255,255,255,0.2)',
              letterSpacing: 2, textAlign: 'center',
              transition: 'color 0.3s',
              marginBottom: 12,
            }}>
              {task?.equation}
            </div>

            {/* Quadratic formula reference */}
            <div style={formulaDisplayStyle}>
              x = (−b ± √(b²−4ac)) / 2a
            </div>

            {/* Step prompt */}
            <div style={{
              fontSize: 'clamp(13px, 2.8vw, 15px)', fontWeight: 700,
              color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
              textAlign: 'center', letterSpacing: 1,
            }}>
              {step?.prompt}
            </div>

            {/* Step history */}
            {history.length > 0 && (
              <div style={{ marginTop: 14, borderTop: '1px solid rgba(57,255,20,0.1)', paddingTop: 10 }}>
                {history.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 6, opacity: 0.6,
                  }}>
                    <span style={{
                      fontSize: 12, color: 'rgba(255,255,255,0.4)',
                      fontFamily: 'var(--font-body)', minWidth: 50,
                    }}>
                      {h.stepLabel.split(':')[0]}
                    </span>
                    <span style={{
                      fontSize: 'clamp(14px, 2.5vw, 14px)',
                      color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                      padding: '2px 8px', background: 'rgba(57,255,20,0.08)',
                      borderRadius: 6,
                    }}>
                      {h.choice}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Show selected answer preview */}
            {selected === 'correct' && (
              <div style={{
                fontSize: 'clamp(16px, 3.5vw, 22px)', fontWeight: 700,
                color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                textAlign: 'center', marginTop: 12, letterSpacing: 1,
              }}>
                ✓ {step?.correctOp.label}
              </div>
            )}
          </div>

          {/* Operation choices */}
          {selected === null && (
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
                    ...(wrongFlash === i ? {
                      borderColor: 'var(--neon-pink)', background: 'rgba(255,45,149,0.1)',
                      animation: 'shake 0.4s',
                    } : {}),
                  }}
                >
                  <div style={{
                    fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 900,
                    color: wrongFlash === i ? 'var(--neon-pink)' : 'var(--neon-green)',
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

          {/* Wrong feedback */}
          {wrongFlash !== null && (
            <div style={{
              color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2,
              marginBottom: 8, textAlign: 'center',
            }}>
              ⚠ CALCULATION ERROR — try another choice
            </div>
          )}
        </>
      )}

      {/* Verification screen */}
      {!completed && showCheck && (
        <div className="glass-panel" style={{
          padding: 'clamp(20px, 4vw, 32px)', maxWidth: 500, width: '100%',
          marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ ...meterLabel, marginBottom: 16 }}>
            SOLUTION VERIFIED
          </div>

          {/* Full step history */}
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginBottom: 6,
            }}>
              <span style={{
                fontSize: 'clamp(13px, 2vw, 12px)', fontWeight: 700,
                color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)',
                minWidth: 60,
              }}>
                {h.stepLabel.split(':')[0]}
              </span>
              <span style={{
                fontSize: 'clamp(14px, 2.5vw, 14px)',
                color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                padding: '2px 8px', background: 'rgba(57,255,20,0.08)',
                borderRadius: 6,
              }}>
                {h.choice}
              </span>
            </div>
          ))}

          {/* Final roots */}
          <div style={{
            fontSize: 'clamp(20px, 4.5vw, 28px)', fontWeight: 900,
            color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
            textShadow: '0 0 15px var(--neon-green), 0 0 40px rgba(57,255,20,0.3)',
            letterSpacing: 2, margin: '16px 0',
          }}>
            {task?.roots}
          </div>

          {/* Verification */}
          <div style={{
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
            padding: '8px 16px', background: 'rgba(57,255,20,0.08)',
            borderRadius: 8, display: 'inline-block',
          }}>
            {task?.check}
          </div>

          <div style={{ marginTop: 20 }}>
            <NeonButton onClick={handleNext} color="green" size="small">
              {taskIndex < FORMULA_TASKS.length - 1 ? 'Next Equation →' : 'Complete Mission →'}
            </NeonButton>
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Escape Velocity</span>
          <span>{tasksCompleted}/{FORMULA_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={FORMULA_TASKS.length} color="green" />
      </div>

      {/* Guide */}
      {!completed && !showCheck && selected === null && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-green)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.hint || 'Use the quadratic formula: identify a, b, c → compute discriminant → find roots.'}
        </div>
      )}

      {completed && (
        <NeonButton onClick={onBack} color="green" style={{ marginTop: 30 }}>
          Mission Complete →
        </NeonButton>
      )}

      <Modal isOpen={!!ahaModal} onClose={handleAhaClose} title={ahaModal?.ahaTitle || ''} titleColor="green">
        <p style={{ lineHeight: 2 }}>{ahaModal?.ahaDesc}</p>
      </Modal>
    </div>
  )
}

const meterLabel = {
  fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)',
}
