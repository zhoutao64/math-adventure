import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const ELIM_TASKS = [
  {
    eq1: 'x + y = 5', eq2: 'x − y = 1',
    steps: [
      { current: 'x + y = 5  &  x − y = 1',
        instruction: 'Choose an operation to eliminate a variable',
        correctOp: { label: 'Add equations', desc: 'Add eq1 + eq2 to eliminate y' },
        wrongOps: [
          { label: 'Subtract equations', desc: 'Subtract eq2 from eq1' },
          { label: 'Multiply eq1 by 2', desc: 'Double the first equation' },
          { label: 'Divide eq2 by 2', desc: 'Halve the second equation' },
        ],
        result: '(x+y) + (x−y) = 5+1 → 2x = 6' },
      { current: '2x = 6',
        correctOp: { label: '÷ 2', desc: 'Divide both sides by 2' },
        wrongOps: [
          { label: '× 2', desc: 'Multiply both sides by 2' },
          { label: '− 2', desc: 'Subtract 2 from both sides' },
          { label: '− 6', desc: 'Subtract 6 from both sides' },
        ],
        result: 'x = 3' },
      { current: 'x = 3, find y from x + y = 5',
        correctOp: { label: 'y = 5 − 3', desc: 'Substitute x = 3 into eq1' },
        wrongOps: [
          { label: 'y = 3 − 1', desc: 'Compute 3 − 1' },
          { label: 'y = 3', desc: 'Set y equal to x' },
          { label: 'y = 5', desc: 'Set y equal to 5' },
        ],
        result: 'y = 2' },
    ],
    answer: 'x = 3, y = 2',
    hint: 'Look at the y terms: +y and −y. Adding the equations will cancel y out!',
    ahaId: 'elimination_idea',
    ahaTitle: 'The Elimination Method',
    ahaDesc: 'Adding the equations makes y disappear! When coefficients are opposite (+y and −y), adding eliminates that variable. This turns two equations into one — much easier to solve!',
  },
  {
    eq1: '2x + y = 7', eq2: 'x + y = 4',
    steps: [
      { current: '2x + y = 7  &  x + y = 4',
        instruction: 'Both equations have +y. How do you eliminate y?',
        correctOp: { label: 'Subtract eq2 from eq1', desc: '(2x+y) − (x+y) eliminates y' },
        wrongOps: [
          { label: 'Add equations', desc: 'Add eq1 + eq2' },
          { label: 'Multiply eq1 by 2', desc: 'Double the first equation' },
          { label: 'Divide eq1 by 2', desc: 'Halve the first equation' },
        ],
        result: '(2x+y) − (x+y) = 7−4 → x = 3' },
      { current: 'x = 3, find y from x + y = 4',
        correctOp: { label: 'y = 4 − 3', desc: 'Substitute x = 3 into eq2' },
        wrongOps: [
          { label: 'y = 7 − 3', desc: 'Compute 7 − 3' },
          { label: 'y = 3', desc: 'Set y equal to x' },
          { label: 'y = 4', desc: 'Set y equal to 4' },
        ],
        result: 'y = 1' },
    ],
    answer: 'x = 3, y = 1',
    hint: 'Both equations have +y. Subtracting one from the other cancels y.',
    ahaId: null,
  },
  {
    eq1: 'x + 2y = 8', eq2: 'x + y = 5',
    steps: [
      { current: 'x + 2y = 8  &  x + y = 5',
        instruction: 'Both have +x. How do you eliminate x?',
        correctOp: { label: 'Subtract eq2 from eq1', desc: '(x+2y) − (x+y) eliminates x' },
        wrongOps: [
          { label: 'Add equations', desc: 'Add eq1 + eq2' },
          { label: 'Multiply eq2 by 2', desc: 'Double the second equation' },
          { label: 'Subtract eq1 from eq2', desc: 'Subtract in wrong order' },
        ],
        result: '(x+2y) − (x+y) = 8−5 → y = 3' },
      { current: 'y = 3, find x from x + y = 5',
        correctOp: { label: 'x = 5 − 3', desc: 'Substitute y = 3 into eq2' },
        wrongOps: [
          { label: 'x = 8 − 3', desc: 'Compute 8 − 3' },
          { label: 'x = 3', desc: 'Set x equal to y' },
          { label: 'x = 5', desc: 'Set x equal to 5' },
        ],
        result: 'x = 2' },
    ],
    answer: 'x = 2, y = 3',
    hint: 'Both have +x with the same coefficient. Subtract to cancel x.',
    ahaId: null,
  },
  {
    eq1: '3x + y = 10', eq2: 'x + 2y = 5',
    steps: [
      { current: '3x + y = 10  &  x + 2y = 5',
        instruction: 'Coefficients don\'t match yet. What should you do first?',
        correctOp: { label: 'Multiply eq1 by 2', desc: 'Make y-coefficient 2 to match eq2' },
        wrongOps: [
          { label: 'Add equations', desc: 'Add eq1 + eq2 directly' },
          { label: 'Subtract eq2 from eq1', desc: 'Subtract directly' },
          { label: 'Multiply eq2 by 3', desc: 'Triple the second equation' },
        ],
        result: '6x + 2y = 20  &  x + 2y = 5' },
      { current: '6x + 2y = 20  &  x + 2y = 5',
        instruction: 'Now both have +2y. Eliminate y.',
        correctOp: { label: 'Subtract eq2 from new eq1', desc: '(6x+2y) − (x+2y) eliminates y' },
        wrongOps: [
          { label: 'Add equations', desc: 'Add the two equations' },
          { label: 'Divide eq1 by 2', desc: 'Halve the first equation' },
          { label: 'Multiply eq2 by 6', desc: 'Multiply eq2 by 6' },
        ],
        result: '5x = 15' },
      { current: '5x = 15',
        correctOp: { label: '÷ 5', desc: 'Divide both sides by 5' },
        wrongOps: [
          { label: '× 5', desc: 'Multiply both sides by 5' },
          { label: '− 5', desc: 'Subtract 5 from both sides' },
          { label: '− 15', desc: 'Subtract 15 from both sides' },
        ],
        result: 'x = 3' },
      { current: 'x = 3, find y from x + 2y = 5',
        correctOp: { label: '2y = 5−3 → y = 1', desc: 'Substitute x = 3 into eq2' },
        wrongOps: [
          { label: 'y = 10 − 3', desc: 'Compute 10 − 3' },
          { label: 'y = 3', desc: 'Set y equal to x' },
          { label: 'y = 5', desc: 'Set y equal to 5' },
        ],
        result: 'y = 1' },
    ],
    answer: 'x = 3, y = 1',
    hint: 'The y-coefficients are 1 and 2. Multiply the first equation by 2 so both have 2y, then subtract.',
    ahaId: 'multiply_to_match',
    ahaTitle: 'Multiply to Match',
    ahaDesc: 'When coefficients don\'t match, multiply one equation to make them match, then add or subtract to eliminate. Here we multiplied eq1 by 2 to get matching y-coefficients (2y), then subtracted!',
  },
  {
    eq1: '2x + 3y = 12', eq2: 'x + y = 5',
    steps: [
      { current: '2x + 3y = 12  &  x + y = 5',
        instruction: 'How can you make the x-coefficients match?',
        correctOp: { label: 'Multiply eq2 by 2', desc: 'Make x-coefficient 2 to match eq1' },
        wrongOps: [
          { label: 'Add equations', desc: 'Add eq1 + eq2 directly' },
          { label: 'Subtract eq2 from eq1', desc: 'Subtract directly' },
          { label: 'Multiply eq1 by 3', desc: 'Triple the first equation' },
        ],
        result: '2x + 3y = 12  &  2x + 2y = 10' },
      { current: '2x + 3y = 12  &  2x + 2y = 10',
        instruction: 'Now both have 2x. Eliminate x.',
        correctOp: { label: 'Subtract new eq2 from eq1', desc: '(2x+3y) − (2x+2y) eliminates x' },
        wrongOps: [
          { label: 'Add equations', desc: 'Add the two equations' },
          { label: 'Divide eq1 by 2', desc: 'Halve the first equation' },
          { label: 'Subtract eq1 from new eq2', desc: 'Subtract in wrong order' },
        ],
        result: 'y = 2' },
      { current: 'y = 2, find x from x + y = 5',
        correctOp: { label: 'x = 5 − 2', desc: 'Substitute y = 2 into eq2' },
        wrongOps: [
          { label: 'x = 12 − 2', desc: 'Compute 12 − 2' },
          { label: 'x = 2', desc: 'Set x equal to y' },
          { label: 'x = 5', desc: 'Set x equal to 5' },
        ],
        result: 'x = 3' },
    ],
    answer: 'x = 3, y = 2',
    hint: 'Multiply eq2 by 2 so both equations have 2x, then subtract to eliminate x.',
    ahaId: 'verify_both',
    ahaTitle: 'Verify Both Equations',
    ahaDesc: 'Always check: plug your answer back into BOTH original equations. If both are satisfied, you\'ve got it right! Here: 2(3)+3(2)=12 ✓ and 3+2=5 ✓',
  },
]

const opBtnStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minWidth: 80, minHeight: 54, padding: '8px 12px',
  background: 'var(--glass)', border: '2px solid rgba(128,0,255,0.3)',
  borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s',
  fontFamily: 'var(--font-display)',
}

// ─── Component ───────────────────────────────────────────────
export default function Mission3_Elimination({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [wrongFlash, setWrongFlash] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.shields.missions['3']
  const task = ELIM_TASKS[taskIndex]
  const step = task?.steps[stepIndex]
  const isLastStep = stepIndex === (task?.steps.length || 0) - 1

  const options = (() => {
    if (!step) return []
    const all = [
      { ...step.correctOp, isCorrect: true },
      ...step.wrongOps.map(w => ({ ...w, isCorrect: false })),
    ]
    const seed = taskIndex * 11 + stepIndex * 7 + 3
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
        const newHistory = [...history, { current: step.current, op: step.correctOp.label, result: step.result }]
        setHistory(newHistory)
        if (isLastStep) {
          setShowResult(true)
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
      dispatch({ type: 'RECORD_AHA', systemId: 'shields', missionId: '3', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < ELIM_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < ELIM_TASKS.length - 1) advanceTask()
    else finishMission()
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
    setStepIndex(0); setHistory([]); setSelected(null)
    setShowResult(false); setWrongFlash(null)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'shields', missionId: '3' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 10 }}>
        <NeonButton onClick={onBack} size="small">← Exit</NeonButton>
      </div>

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-purple)', marginBottom: 6 }}>🛡️ MISSION 3</div>
      <NeonText as="h2" color="purple" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>消元对决</NeonText>

      <div style={{ textAlign: 'center', marginBottom: 20, maxWidth: 500, padding: '0 8px' }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
          🎯 OBJECTIVE
        </div>
        <p style={{
          fontSize: 'clamp(15px, 3vw, 17px)', color: 'rgba(255,255,255,0.85)',
          fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0,
        }}>
          {completed ? '🎉 Elimination mastered! Shield layer 3 fully online.' : 'Use the elimination method to solve systems of equations.'}
        </p>
      </div>

      {!completed && !showResult && (
        <>
          <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: 500, width: '100%', marginBottom: 20 }}>
            <div style={{ ...meterLabel, marginBottom: 8 }}>SYSTEM {taskIndex + 1}/{ELIM_TASKS.length} — STEP {stepIndex + 1}/{task?.steps.length}</div>

            {/* Equations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: 'var(--neon-purple)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{task.eq1}</span>
              <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{task.eq2}</span>
            </div>

            {/* Step history */}
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, opacity: 0.5 }}>
                <span style={{ fontSize: 'clamp(14px, 2.5vw, 14px)', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', textDecoration: 'line-through' }}>{h.current}</span>
                <span style={{ fontSize: 13, color: 'var(--neon-green)', fontFamily: 'var(--font-display)' }}>{h.op}</span>
              </div>
            ))}

            {/* Current step */}
            <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: selected === 'correct' ? 'var(--neon-green)' : 'var(--neon-purple)', fontFamily: 'var(--font-display)', textAlign: 'center', letterSpacing: 1, transition: 'color 0.3s' }}>
              {step?.current}
            </div>
            {step?.instruction && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 4, fontFamily: 'var(--font-body)' }}>{step.instruction}</div>
            )}
            {selected === 'correct' && (
              <div style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700, color: 'var(--neon-green)', fontFamily: 'var(--font-display)', textAlign: 'center', marginTop: 8 }}>→ {step?.result}</div>
            )}
          </div>

          {selected === null && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 400, width: '100%', marginBottom: 20 }}>
              {options.map((opt, i) => (
                <div key={i} onClick={() => handleSelect(opt, i)} style={{
                  ...opBtnStyle,
                  ...(wrongFlash === i ? { borderColor: 'var(--neon-pink)', background: 'rgba(255,45,149,0.1)', animation: 'shake 0.4s' } : {}),
                }}>
                  <div style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 900, color: wrongFlash === i ? 'var(--neon-pink)' : 'var(--neon-purple)' }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'var(--font-body)', textAlign: 'center' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          )}

          {wrongFlash !== null && (
            <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>⚠ SHIELD ERROR — try another operation</div>
          )}
        </>
      )}

      {!completed && showResult && (
        <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 32px)', maxWidth: 500, width: '100%', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ ...meterLabel, marginBottom: 16 }}>SOLUTION</div>
          {history.map((h, i) => (
            <div key={i} style={{ fontSize: 'clamp(14px, 2.5vw, 14px)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              {h.current} → <span style={{ color: 'var(--neon-cyan)' }}>{h.op}</span> → {h.result}
            </div>
          ))}
          <div style={{ fontSize: 'clamp(20px, 4.5vw, 28px)', fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'var(--font-display)', margin: '16px 0', letterSpacing: 2 }}>{task?.answer}</div>
          <NeonButton onClick={handleNext} color="green" size="small">{taskIndex < ELIM_TASKS.length - 1 ? 'Next System →' : 'Complete →'}</NeonButton>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Systems Solved</span><span>{tasksCompleted}/{ELIM_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={ELIM_TASKS.length} color="purple" />
      </div>

      {!completed && !showResult && selected === null && (
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
