import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// âââ Task Data âââââââââââââââââââââââââââââââââââââââââââââââ
const COURSE_TASKS = [
  {
    equation: '2x + 3 = 11',
    steps: [
      {
        current: '2x + 3 = 11',
        correctOp: { label: 'â 3', desc: 'Subtract 3 from both sides' },
        wrongOps: [
          { label: 'Ã· 2', desc: 'Divide both sides by 2' },
          { label: 'â 11', desc: 'Subtract 11 from both sides' },
          { label: '+ 3', desc: 'Add 3 to both sides' },
        ],
        result: '2x = 8',
      },
      {
        current: '2x = 8',
        correctOp: { label: 'Ã· 2', desc: 'Divide both sides by 2' },
        wrongOps: [
          { label: 'Ã 2', desc: 'Multiply both sides by 2' },
          { label: 'â 2', desc: 'Subtract 2 from both sides' },
          { label: '+ 2', desc: 'Add 2 to both sides' },
        ],
        result: 'x = 4',
      },
    ],
    answer: 4,
    check: '2(4) + 3 = 8 + 3 = 11 â',
    hint: 'First, remove the constant (+3) from the x side. Then deal with the coefficient.',
    ahaId: 'multi_step',
    ahaTitle: 'Multi-Step Strategy',
    ahaDesc: 'For equations like 2x + 3 = 11, work in reverse order: first undo addition/subtraction to isolate the term with x, then undo multiplication/division to solve for x. Like peeling layers off an onion!',
  },
  {
    equation: '3x â 4 = 8',
    steps: [
      {
        current: '3x â 4 = 8',
        correctOp: { label: '+ 4', desc: 'Add 4 to both sides' },
        wrongOps: [
          { label: 'Ã· 3', desc: 'Divide both sides by 3' },
          { label: 'â 4', desc: 'Subtract 4 from both sides' },
          { label: 'â 8', desc: 'Subtract 8 from both sides' },
        ],
        result: '3x = 12',
      },
      {
        current: '3x = 12',
        correctOp: { label: 'Ã· 3', desc: 'Divide both sides by 3' },
        wrongOps: [
          { label: 'Ã 3', desc: 'Multiply both sides by 3' },
          { label: 'â 3', desc: 'Subtract 3 from both sides' },
          { label: '+ 3', desc: 'Add 3 to both sides' },
        ],
        result: 'x = 4',
      },
    ],
    answer: 4,
    check: '3(4) â 4 = 12 â 4 = 8 â',
    hint: 'Undo the subtraction first (+4), then undo the multiplication (Ã·3).',
    ahaId: null,
  },
  {
    equation: '5x + 2 = 17',
    steps: [
      {
        current: '5x + 2 = 17',
        correctOp: { label: 'â 2', desc: 'Subtract 2 from both sides' },
        wrongOps: [
          { label: 'Ã· 5', desc: 'Divide both sides by 5' },
          { label: '+ 2', desc: 'Add 2 to both sides' },
          { label: 'â 17', desc: 'Subtract 17 from both sides' },
        ],
        result: '5x = 15',
      },
      {
        current: '5x = 15',
        correctOp: { label: 'Ã· 5', desc: 'Divide both sides by 5' },
        wrongOps: [
          { label: 'Ã 5', desc: 'Multiply both sides by 5' },
          { label: 'â 5', desc: 'Subtract 5 from both sides' },
          { label: '+ 5', desc: 'Add 5 to both sides' },
        ],
        result: 'x = 3',
      },
    ],
    answer: 3,
    check: '5(3) + 2 = 15 + 2 = 17 â',
    hint: 'Remove the +2 first, then divide by the coefficient of x.',
    ahaId: 'check_answer',
    ahaTitle: 'Check Your Answer',
    ahaDesc: 'Always verify! Substitute your answer back into the original equation. If 5x + 2 = 17 and x = 3, then 5(3) + 2 = 15 + 2 = 17 â. Both sides match â you got it right!',
  },
  {
    equation: '4x â 7 = 13',
    steps: [
      {
        current: '4x â 7 = 13',
        correctOp: { label: '+ 7', desc: 'Add 7 to both sides' },
        wrongOps: [
          { label: 'Ã· 4', desc: 'Divide both sides by 4' },
          { label: 'â 7', desc: 'Subtract 7 from both sides' },
          { label: 'â 13', desc: 'Subtract 13 from both sides' },
        ],
        result: '4x = 20',
      },
      {
        current: '4x = 20',
        correctOp: { label: 'Ã· 4', desc: 'Divide both sides by 4' },
        wrongOps: [
          { label: 'Ã 4', desc: 'Multiply both sides by 4' },
          { label: 'â 4', desc: 'Subtract 4 from both sides' },
          { label: '+ 4', desc: 'Add 4 to both sides' },
        ],
        result: 'x = 5',
      },
    ],
    answer: 5,
    check: '4(5) â 7 = 20 â 7 = 13 â',
    hint: 'Add 7 to both sides first, then divide by 4.',
    ahaId: null,
  },
  {
    equation: '2(x + 3) = 16',
    steps: [
      {
        current: '2(x + 3) = 16',
        correctOp: { label: 'Ã· 2', desc: 'Divide both sides by 2' },
        wrongOps: [
          { label: 'â 3', desc: 'Subtract 3 from both sides' },
          { label: 'Ã 2', desc: 'Multiply both sides by 2' },
          { label: 'â 2', desc: 'Subtract 2 from both sides' },
        ],
        result: 'x + 3 = 8',
      },
      {
        current: 'x + 3 = 8',
        correctOp: { label: 'â 3', desc: 'Subtract 3 from both sides' },
        wrongOps: [
          { label: '+ 3', desc: 'Add 3 to both sides' },
          { label: 'Ã 3', desc: 'Multiply both sides by 3' },
          { label: 'Ã· 3', desc: 'Divide both sides by 3' },
        ],
        result: 'x = 5',
      },
    ],
    answer: 5,
    check: '2(5 + 3) = 2(8) = 16 â',
    hint: 'When parentheses wrap the x-term, divide to remove the outer coefficient first!',
    ahaId: 'distribute_first',
    ahaTitle: 'Dealing with Parentheses',
    ahaDesc: 'When you see 2(x + 3) = 16, you can divide both sides by 2 first to get x + 3 = 8, then solve normally. Alternatively, distribute: 2x + 6 = 16. Either way works â choose the path that feels simpler!',
  },
]

// âââ Styles ââââââââââââââââââââââââââââââââââââââââââââââââââ
const opBtnStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minWidth: 80, minHeight: 54, padding: '8px 12px',
  background: 'var(--glass)', border: '2px solid rgba(255,230,0,0.3)',
  borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s',
  fontFamily: 'var(--font-display)',
}

// âââ Component âââââââââââââââââââââââââââââââââââââââââââââââ
export default function Mission3_Course({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [history, setHistory] = useState([])      // completed step results
  const [selected, setSelected] = useState(null)   // 'correct' when right choice made
  const [wrongFlash, setWrongFlash] = useState(null)
  const [showCheck, setShowCheck] = useState(false) // show verification after last step
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.navigation.missions['3']
  const task = COURSE_TASKS[taskIndex]
  const step = task?.steps[stepIndex]
  const isLastStep = stepIndex === (task?.steps.length || 0) - 1

  // Shuffle options (correct + wrong), stable per task+step
  const options = (() => {
    if (!step) return []
    const all = [
      { ...step.correctOp, isCorrect: true },
      ...step.wrongOps.map(w => ({ ...w, isCorrect: false })),
    ]
    const seed = taskIndex * 13 + stepIndex * 7 + 5
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
        const newHistory = [...history, { equation: step.current, op: step.correctOp.label, result: step.result }]
        setHistory(newHistory)

        if (isLastStep) {
          // Show verification
          setShowCheck(true)
        } else {
          // Advance to next step
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
      dispatch({ type: 'RECORD_AHA', systemId: 'navigation', missionId: '3', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < COURSE_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < COURSE_TASKS.length - 1) {
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
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'navigation', missionId: '3' })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 12px', minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 10 }}>
        <NeonButton onClick={onBack} size="small">
          â Exit
        </NeonButton>
      </div>

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-yellow)', marginBottom: 6 }}>
        ð§­ MISSION 3
      </div>

      <NeonText as="h2" color="yellow" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        èªçº¿ä¿®æ­£
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
            ? 'ð Course plotted! Navigation system fully online.'
            : 'Solve multi-step equations â choose the right operation at each step.'
          }
        </p>
      </div>

      {!completed && !showCheck && (
        <>
          {/* Equation + Step History */}
          <div className="glass-panel" style={{
            padding: 'clamp(16px, 3vw, 24px)', maxWidth: 500, width: '100%',
            marginBottom: 20,
          }}>
            <div style={{ ...meterLabel, marginBottom: 12 }}>
              EQUATION {taskIndex + 1}/{COURSE_TASKS.length} â STEP {stepIndex + 1}/{task?.steps.length}
            </div>

            {/* Step history */}
            {history.map((h, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 8, opacity: 0.5,
              }}>
                <div style={{
                  fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
                  color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)',
                  letterSpacing: 1, textDecoration: 'line-through',
                }}>
                  {h.equation}
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 2vw, 13px)',
                  color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                }}>
                  {h.op}
                </div>
              </div>
            ))}

            {/* Current equation */}
            <div style={{
              fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900,
              color: selected === 'correct' ? 'var(--neon-green)' : 'var(--neon-yellow)',
              fontFamily: 'var(--font-display)',
              textShadow: '0 0 10px var(--neon-yellow), 0 0 30px rgba(255,230,0,0.3)',
              letterSpacing: 2, textAlign: 'center',
              transition: 'color 0.3s',
            }}>
              {step?.current}
            </div>

            {/* Show result preview when correct is selected */}
            {selected === 'correct' && (
              <div style={{
                fontSize: 'clamp(16px, 3.5vw, 22px)', fontWeight: 700,
                color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                textAlign: 'center', marginTop: 12, letterSpacing: 1,
              }}>
                â {step?.result}
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
                    fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900,
                    color: wrongFlash === i ? 'var(--neon-pink)' : 'var(--neon-yellow)',
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
              â  COURSE DEVIATION â try another operation
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
                fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
                color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)',
                letterSpacing: 1,
              }}>
                {h.equation}
              </span>
              <span style={{
                fontSize: 'clamp(14px, 2.5vw, 14px)',
                color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)',
                padding: '2px 8px', background: 'rgba(0,255,255,0.1)',
                borderRadius: 6,
              }}>
                {h.op}
              </span>
            </div>
          ))}

          {/* Final answer */}
          <div style={{
            fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900,
            color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
            textShadow: '0 0 15px var(--neon-green), 0 0 40px rgba(57,255,20,0.3)',
            letterSpacing: 2, margin: '16px 0',
          }}>
            x = {task?.answer}
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
              {taskIndex < COURSE_TASKS.length - 1 ? 'Next Course â' : 'Complete â'}
            </NeonButton>
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Course Corrections</span>
          <span>{tasksCompleted}/{COURSE_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={COURSE_TASKS.length} color="yellow" />
      </div>

      {/* Guide */}
      {!completed && !showCheck && selected === null && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-yellow)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            ð¡ GUIDE
          </div>
          {task?.hint || 'Choose the operation that simplifies the equation one step closer to solving for x.'}
        </div>
      )}

      {completed && (
        <NeonButton onClick={onBack} color="green" style={{ marginTop: 30 }}>
          Mission Complete â
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
