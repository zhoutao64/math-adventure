import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const SUB_TASKS = [
  {
    eq1: 'y = x + 1', eq2: 'x + y = 5',
    steps: [
      { current: 'x + y = 5', instruction: 'Substitute y = x + 1 into the second equation',
        correctOp: { label: 'y → x+1', desc: 'Replace y with (x + 1)' },
        wrongOps: [
          { label: 'x → y+1', desc: 'Replace x with y + 1' },
          { label: 'y → 5', desc: 'Replace y with 5' },
          { label: 'x → 5', desc: 'Replace x with 5' },
        ],
        result: 'x + (x + 1) = 5 → 2x + 1 = 5' },
      { current: '2x + 1 = 5',
        correctOp: { label: '− 1', desc: 'Subtract 1 from both sides' },
        wrongOps: [
          { label: '÷ 2', desc: 'Divide both sides by 2' },
          { label: '+ 1', desc: 'Add 1 to both sides' },
          { label: '− 5', desc: 'Subtract 5 from both sides' },
        ],
        result: '2x = 4 → x = 2' },
      { current: 'x = 2, find y',
        correctOp: { label: 'y = 2+1', desc: 'Substitute x = 2 back into y = x + 1' },
        wrongOps: [
          { label: 'y = 5−1', desc: 'Compute 5 − 1' },
          { label: 'y = 2', desc: 'Set y equal to x' },
          { label: 'y = 5', desc: 'Set y equal to 5' },
        ],
        result: 'y = 3' },
    ],
    answer: 'x = 2, y = 3',
    hint: 'Since y = x + 1, replace every y in the second equation with (x + 1).',
    ahaId: 'substitution_idea',
    ahaTitle: 'Substitution Method',
    ahaDesc: 'When one equation is already solved for a variable (like y = x + 1), plug that expression into the other equation. This turns two equations with two unknowns into ONE equation with ONE unknown!',
  },
  {
    eq1: 'y = 2x', eq2: 'x + y = 9',
    steps: [
      { current: 'x + y = 9',
        correctOp: { label: 'y → 2x', desc: 'Replace y with 2x' },
        wrongOps: [
          { label: 'x → 2y', desc: 'Replace x with 2y' },
          { label: 'y → 9', desc: 'Replace y with 9' },
          { label: 'x → 9', desc: 'Replace x with 9' },
        ],
        result: 'x + 2x = 9 → 3x = 9' },
      { current: '3x = 9',
        correctOp: { label: '÷ 3', desc: 'Divide both sides by 3' },
        wrongOps: [
          { label: '× 3', desc: 'Multiply both sides by 3' },
          { label: '− 3', desc: 'Subtract 3 from both sides' },
          { label: '− 9', desc: 'Subtract 9 from both sides' },
        ],
        result: 'x = 3' },
      { current: 'x = 3, find y',
        correctOp: { label: 'y = 2(3)', desc: 'Substitute x = 3 into y = 2x' },
        wrongOps: [
          { label: 'y = 9−2', desc: 'Compute 9 − 2' },
          { label: 'y = 3', desc: 'Set y equal to x' },
          { label: 'y = 9', desc: 'Set y equal to 9' },
        ],
        result: 'y = 6' },
    ],
    answer: 'x = 3, y = 6',
    hint: 'y is already isolated as 2x. Plug that into the second equation.',
    ahaId: 'back_substitute',
    ahaTitle: 'Back-Substitution',
    ahaDesc: 'After finding one variable (x = 3), substitute it back into either original equation to find the other. y = 2(3) = 6. Always verify: 3 + 6 = 9 ✓',
  },
  {
    eq1: 'y = 3x − 1', eq2: '2x + y = 9',
    steps: [
      { current: '2x + y = 9',
        correctOp: { label: 'y → 3x−1', desc: 'Replace y with (3x − 1)' },
        wrongOps: [
          { label: 'x → 3y−1', desc: 'Replace x with 3y − 1' },
          { label: 'y → 9', desc: 'Replace y with 9' },
          { label: '2x → y', desc: 'Replace 2x with y' },
        ],
        result: '2x + (3x − 1) = 9 → 5x − 1 = 9' },
      { current: '5x − 1 = 9',
        correctOp: { label: '+ 1', desc: 'Add 1 to both sides' },
        wrongOps: [
          { label: '÷ 5', desc: 'Divide both sides by 5' },
          { label: '− 1', desc: 'Subtract 1' },
          { label: '− 9', desc: 'Subtract 9' },
        ],
        result: '5x = 10 → x = 2' },
      { current: 'x = 2, find y',
        correctOp: { label: 'y = 3(2)−1', desc: 'Substitute x = 2 into y = 3x − 1' },
        wrongOps: [
          { label: 'y = 9−2', desc: 'Compute 9 − 2' },
          { label: 'y = 2', desc: 'Set y equal to x' },
          { label: 'y = 3(2)', desc: 'Forget the −1' },
        ],
        result: 'y = 5' },
    ],
    answer: 'x = 2, y = 5',
    hint: 'Replace y in the second equation with the expression 3x − 1.',
    ahaId: 'two_unknowns',
    ahaTitle: 'Two Unknowns Need Two Equations',
    ahaDesc: 'One equation with two unknowns has infinitely many solutions. You need a SECOND equation to pin down both variables. That\'s why we use systems — two equations working together!',
  },
  {
    eq1: 'x = y + 2', eq2: '3x + 2y = 16',
    steps: [
      { current: '3x + 2y = 16',
        correctOp: { label: 'x → y+2', desc: 'Replace x with (y + 2)' },
        wrongOps: [
          { label: 'y → x+2', desc: 'Replace y with x + 2' },
          { label: 'x → 16', desc: 'Replace x with 16' },
          { label: '3x → 2y', desc: 'Replace 3x with 2y' },
        ],
        result: '3(y + 2) + 2y = 16 → 5y + 6 = 16' },
      { current: '5y + 6 = 16',
        correctOp: { label: '− 6', desc: 'Subtract 6 from both sides' },
        wrongOps: [
          { label: '÷ 5', desc: 'Divide both sides by 5' },
          { label: '+ 6', desc: 'Add 6' },
          { label: '− 16', desc: 'Subtract 16' },
        ],
        result: '5y = 10 → y = 2' },
      { current: 'y = 2, find x',
        correctOp: { label: 'x = 2+2', desc: 'Substitute y = 2 into x = y + 2' },
        wrongOps: [
          { label: 'x = 2', desc: 'Set x equal to y' },
          { label: 'x = 16−2', desc: 'Compute 16 − 2' },
          { label: 'x = 3(2)', desc: 'Compute 3 times 2' },
        ],
        result: 'x = 4' },
    ],
    answer: 'x = 4, y = 2',
    hint: 'This time x is isolated. Substitute x = y + 2 into the second equation.',
    ahaId: null,
  },
  {
    eq1: 'y = −x + 7', eq2: '2x + y = 10',
    steps: [
      { current: '2x + y = 10',
        correctOp: { label: 'y → −x+7', desc: 'Replace y with (−x + 7)' },
        wrongOps: [
          { label: 'x → −y+7', desc: 'Replace x with −y + 7' },
          { label: 'y → 10', desc: 'Replace y with 10' },
          { label: '2x → y', desc: 'Replace 2x with y' },
        ],
        result: '2x + (−x + 7) = 10 → x + 7 = 10' },
      { current: 'x + 7 = 10',
        correctOp: { label: '− 7', desc: 'Subtract 7 from both sides' },
        wrongOps: [
          { label: '+ 7', desc: 'Add 7' },
          { label: '÷ 7', desc: 'Divide by 7' },
          { label: '− 10', desc: 'Subtract 10' },
        ],
        result: 'x = 3' },
      { current: 'x = 3, find y',
        correctOp: { label: 'y = −3+7', desc: 'Substitute x = 3 into y = −x + 7' },
        wrongOps: [
          { label: 'y = 3+7', desc: 'Compute 3 + 7' },
          { label: 'y = 10−3', desc: 'Compute 10 − 3' },
          { label: 'y = 3', desc: 'Set y equal to x' },
        ],
        result: 'y = 4' },
    ],
    answer: 'x = 3, y = 4',
    hint: 'Substitute y = −x + 7 into the second equation. Watch the negative sign!',
    ahaId: null,
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
export default function Mission2_Substitution({ system, mission, onBack }) {
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

  const mState = state.systems.shields.missions['2']
  const task = SUB_TASKS[taskIndex]
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
      dispatch({ type: 'RECORD_AHA', systemId: 'shields', missionId: '2', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < SUB_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < SUB_TASKS.length - 1) advanceTask()
    else finishMission()
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
    setStepIndex(0); setHistory([]); setSelected(null)
    setShowResult(false); setWrongFlash(null)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'shields', missionId: '2' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 10 }}>
        <NeonButton onClick={onBack} size="small">← Exit</NeonButton>
      </div>

      <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--neon-purple)', marginBottom: 6 }}>🛡️ MISSION 2</div>
      <NeonText as="h2" color="purple" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>频率替换</NeonText>

      <p style={{ fontSize: 'clamp(14px, 2.5vw, 13px)', color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontFamily: 'var(--font-body)', textAlign: 'center', maxWidth: 500, padding: '0 8px' }}>
        {completed ? '🎉 Substitution mastered! Shield layer 2 online.' : 'Use substitution to solve the system of equations.'}
      </p>

      {!completed && !showResult && (
        <>
          <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: 500, width: '100%', marginBottom: 20 }}>
            <div style={{ ...meterLabel, marginBottom: 8 }}>SYSTEM {taskIndex + 1}/{SUB_TASKS.length} — STEP {stepIndex + 1}/{task?.steps.length}</div>

            {/* Equations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: 'var(--neon-purple)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{task.eq1}</span>
              <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{task.eq2}</span>
            </div>

            {/* Step history */}
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, opacity: 0.5 }}>
                <span style={{ fontSize: 'clamp(14px, 2.5vw, 14px)', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', textDecoration: 'line-through' }}>{h.current}</span>
                <span style={{ fontSize: 11, color: 'var(--neon-green)', fontFamily: 'var(--font-display)' }}>{h.op}</span>
              </div>
            ))}

            {/* Current step */}
            <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: selected === 'correct' ? 'var(--neon-green)' : 'var(--neon-purple)', fontFamily: 'var(--font-display)', textAlign: 'center', letterSpacing: 1, transition: 'color 0.3s' }}>
              {step?.current}
            </div>
            {step?.instruction && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 4, fontFamily: 'var(--font-body)' }}>{step.instruction}</div>
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
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'var(--font-body)', textAlign: 'center' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          )}

          {wrongFlash !== null && (
            <div style={{ color: 'var(--neon-pink)', fontSize: 11, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>⚠ SHIELD ERROR — try another operation</div>
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
          <NeonButton onClick={handleNext} color="green" size="small">{taskIndex < SUB_TASKS.length - 1 ? 'Next System →' : 'Complete →'}</NeonButton>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Systems Solved</span><span>{tasksCompleted}/{SUB_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={SUB_TASKS.length} color="purple" />
      </div>

      {!completed && !showResult && selected === null && (
        <div className="glass-panel" style={{ marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%', fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontFamily: 'var(--font-body)' }}>
          <div style={{ color: 'var(--neon-purple)', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>💡 GUIDE</div>
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

const meterLabel = { fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.3)' }
