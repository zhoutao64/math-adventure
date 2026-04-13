import { useState, useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Helper: apply a rule step to a value ────────────────────
function applyRule(x, steps) {
  return steps.reduce((v, s) => {
    if (s.op === 'multiply') return v * s.by
    if (s.op === 'add') return v + s.by
    if (s.op === 'subtract') return v - s.by
    return v
  }, x)
}

// ─── Task Data ───────────────────────────────────────────────
const PATTERN_TASKS = [
  {
    rule: 'f(x) = 2x + 1',
    givenPairs: [[1, 3], [2, 5], [3, 7]],
    ruleSteps: [
      { op: 'multiply', by: 2, label: '×2' },
      { op: 'add', by: 1, label: '+1' },
    ],
    ruleChips: ['×2', '+1', '×3', '−2', '+3'],
    queryX: 4,
    answer: 9,
    predictChips: [9, 8, 10, 5],
    predictHint: '2 × 4 = 8, then 8 + 1 = ?',
    hint: 'Each time x goes up by 1, the output goes up by 2. Double the input and add 1.',
    ahaId: 'pattern_rule',
    ahaTitle: 'Function Rule',
    ahaDesc: 'A function is a rule: every input has exactly one output. Once you know the rule, you can predict ANY output! f(x) = 2x + 1 means "double the input and add 1."',
  },
  {
    rule: 'f(x) = 3x − 2',
    givenPairs: [[0, -2], [1, 1], [2, 4]],
    ruleSteps: [
      { op: 'multiply', by: 3, label: '×3' },
      { op: 'subtract', by: 2, label: '−2' },
    ],
    ruleChips: ['×3', '−2', '×2', '+1', '−3'],
    queryX: 3,
    answer: 7,
    predictChips: [7, 9, 6, 1],
    predictHint: '3 × 3 = 9, then 9 − 2 = ?',
    hint: 'The output goes up by 3 each time x increases by 1. Starting from −2 when x = 0.',
    ahaId: 'constant_change',
    ahaTitle: 'Constant Change',
    ahaDesc: 'When the output changes by the same amount for each unit increase in input, the function is LINEAR. Here the output always increases by 3 — that constant rate of change is what makes it a straight line!',
  },
  {
    rule: 'f(x) = −x + 5',
    givenPairs: [[0, 5], [2, 3], [4, 1]],
    ruleSteps: [
      { op: 'multiply', by: -1, label: '×(−1)' },
      { op: 'add', by: 5, label: '+5' },
    ],
    ruleChips: ['×(−1)', '+5', '−1', '×2', '+3'],
    queryX: 6,
    answer: -1,
    predictChips: [-1, 1, -6, 11],
    predictHint: '(−1) × 6 = −6, then −6 + 5 = ?',
    hint: 'Output goes down by 1 for every 1 increase in x. Flip the sign and add 5.',
    ahaId: 'negative_output',
    ahaTitle: 'Negative Outputs',
    ahaDesc: 'Functions can output negative numbers — the pattern continues past zero! If f(x) = −x + 5, then f(6) = −6 + 5 = −1. The rule doesn\'t stop just because the answer is negative.',
  },
  {
    rule: 'f(x) = x + 3',
    givenPairs: [[1, 4], [3, 6], [5, 8]],
    ruleSteps: [
      { op: 'add', by: 3, label: '+3' },
    ],
    ruleChips: ['+3', '×2', '+1', '−3', '×3'],
    queryX: 0,
    answer: 3,
    predictChips: [3, 0, 1, 6],
    predictHint: '0 + 3 = ?',
    hint: 'The output is always 3 more than the input. What happens when x = 0?',
    ahaId: 'input_zero',
    ahaTitle: 'The x = 0 Input',
    ahaDesc: 'When x = 0, the output equals the constant in the rule. For f(x) = x + 3, f(0) = 0 + 3 = 3. This special value is called the y-intercept — it\'s where the line crosses the y-axis!',
  },
  {
    rule: 'f(x) = 2x',
    givenPairs: [[0, 0], [1, 2], [3, 6]],
    ruleSteps: [
      { op: 'multiply', by: 2, label: '×2' },
    ],
    ruleChips: ['×2', '+1', '×3', '−2', '+0'],
    queryX: 5,
    answer: 10,
    predictChips: [10, 7, 12, 5],
    predictHint: '2 × 5 = ?',
    hint: 'The output is always double the input. No constant is added.',
    ahaId: 'origin_line',
    ahaTitle: 'Through the Origin',
    ahaDesc: 'When there\'s no added constant, f(0) = 0 and the line passes through the origin (0, 0). The equation f(x) = 2x is the simplest form of a linear function!',
  },
]

// ─── Shared Styles ───────────────────────────────────────────
const meterLabel = {
  fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)',
}

const chipStyle = (active, wrong) => ({
  minWidth: 44, minHeight: 44, padding: '8px 14px',
  fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 700,
  fontFamily: 'var(--font-display)',
  background: wrong ? 'rgba(255,45,149,0.15)' : active ? 'rgba(255,45,149,0.15)' : 'var(--glass)',
  border: `2px solid ${wrong ? 'var(--neon-pink)' : active ? 'var(--neon-pink)' : 'var(--glass-border)'}`,
  borderRadius: 10, cursor: 'pointer',
  color: wrong ? 'var(--neon-pink)' : '#fff',
  transition: 'all 0.2s',
  animation: wrong ? 'shake 0.4s' : 'none',
})

const slotStyle = (filled, active, correct) => ({
  minWidth: 44, minHeight: 44, padding: '6px 10px',
  fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 700,
  fontFamily: 'var(--font-display)',
  background: correct ? 'rgba(57,255,20,0.1)' : active ? 'rgba(255,45,149,0.08)' : 'var(--glass)',
  border: `2px ${filled ? 'solid' : 'dashed'} ${correct ? 'var(--neon-green)' : active ? 'var(--neon-pink)' : 'rgba(255,255,255,0.2)'}`,
  borderRadius: 8, cursor: filled ? 'default' : 'pointer',
  color: correct ? 'var(--neon-green)' : filled ? '#fff' : 'rgba(255,255,255,0.3)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.2s',
})

// ─── Function Machine Visual ─────────────────────────────────
function FunctionMachine({ inputVal, outputVal, ruleDisplay, showOutput }) {
  const boxBase = {
    background: 'var(--glass)', borderRadius: 10,
    padding: 'clamp(10px, 2vw, 16px) clamp(12px, 3vw, 20px)',
    textAlign: 'center', minWidth: 60, flex: '1 1 0',
  }
  const arrow = {
    fontSize: 'clamp(14px, 3vw, 20px)', color: 'rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', padding: '0 4px',
    fontFamily: 'var(--font-display)',
  }
  const labelSt = {
    fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', marginBottom: 4,
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 2, marginBottom: 16, flexWrap: 'wrap',
    }}>
      <div style={{ ...boxBase, border: '2px solid var(--neon-pink)' }}>
        <div style={labelSt}>INPUT</div>
        <div style={{
          fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
          fontFamily: 'var(--font-display)', color: 'var(--neon-pink)',
        }}>
          {inputVal !== null ? inputVal : '—'}
        </div>
      </div>

      <div style={arrow}>▸▸</div>

      <div style={{
        ...boxBase,
        border: `2px ${ruleDisplay ? 'solid' : 'dashed'} var(--neon-cyan)`,
        minWidth: 80,
      }}>
        <div style={labelSt}>RULE</div>
        <div style={{
          fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: ruleDisplay ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.3)',
        }}>
          {ruleDisplay || '???'}
        </div>
      </div>

      <div style={arrow}>▸▸</div>

      <div style={{
        ...boxBase,
        border: `2px ${showOutput ? 'solid' : 'dashed'} ${showOutput ? 'var(--neon-green)' : 'rgba(255,255,255,0.2)'}`,
      }}>
        <div style={labelSt}>OUTPUT</div>
        <div style={{
          fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
          fontFamily: 'var(--font-display)',
          color: showOutput ? 'var(--neon-green)' : 'rgba(255,255,255,0.3)',
        }}>
          {showOutput && outputVal !== null ? outputVal : '?'}
        </div>
      </div>
    </div>
  )
}

// ─── Signal Table ────────────────────────────────────────────
function SignalTable({ givenPairs, queryX, queryAnswer, solved, highlightRow }) {
  const cellBase = {
    padding: '8px 12px', background: 'var(--glass)', borderRadius: 6,
    textAlign: 'center', fontSize: 'clamp(14px, 3vw, 17px)',
    fontFamily: 'var(--font-display)', letterSpacing: 1,
  }

  const changes = givenPairs.slice(1).map(([, y], i) => y - givenPairs[i][1])

  const rows = [
    ...givenPairs.map(([x, y], i) => ({ x, y, known: true, idx: i })),
    { x: queryX, y: queryAnswer, known: false, idx: givenPairs.length },
  ]

  return (
    <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 24px 1fr 1fr',
        gap: 2, marginBottom: 4,
      }}>
        <div style={{ ...cellBase, background: 'rgba(255,45,149,0.15)', color: 'var(--neon-pink)', fontWeight: 700, fontSize: 'clamp(11px, 2.5vw, 13px)' }}>
          Input (x)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>→</div>
        <div style={{ ...cellBase, background: 'rgba(255,45,149,0.15)', color: 'var(--neon-pink)', fontWeight: 700, fontSize: 'clamp(11px, 2.5vw, 13px)' }}>
          Output
        </div>
        <div style={{ ...cellBase, background: 'rgba(0,240,255,0.08)', color: 'var(--neon-cyan)', fontWeight: 700, fontSize: 'clamp(11px, 2.5vw, 13px)' }}>
          Δ
        </div>
      </div>

      {rows.map((row, i) => {
        const isHL = highlightRow === i
        const isQ = !row.known
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 24px 1fr 1fr',
            gap: 2, marginBottom: 2,
            transition: 'all 0.3s',
          }}>
            <div style={{
              ...cellBase,
              color: isQ ? 'var(--neon-pink)' : isHL ? '#fff' : 'rgba(255,255,255,0.8)',
              fontWeight: isQ || isHL ? 900 : 400,
              background: isHL ? 'rgba(255,45,149,0.1)' : cellBase.background,
            }}>
              {row.x}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>→</div>
            <div style={{
              ...cellBase,
              color: isQ ? (solved ? 'var(--neon-green)' : 'var(--neon-pink)') : isHL ? '#fff' : 'rgba(255,255,255,0.8)',
              fontWeight: isQ || isHL ? 900 : 400,
              textShadow: isQ && solved ? '0 0 10px var(--neon-green)' : 'none',
              background: isHL ? 'rgba(255,45,149,0.1)' : cellBase.background,
            }}>
              {row.known ? row.y : (solved ? row.y : '?')}
            </div>
            <div style={{
              ...cellBase, fontSize: 'clamp(12px, 2.5vw, 14px)',
              color: 'var(--neon-cyan)', fontWeight: 600,
            }}>
              {i > 0 && i < givenPairs.length ? (changes[i - 1] >= 0 ? '+' : '') + changes[i - 1] : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function Mission1_Pattern({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [phase, setPhase] = useState('observe')
  const [animRow, setAnimRow] = useState(-1)

  const [ruleSlots, setRuleSlots] = useState([])
  const [activeRuleSlot, setActiveRuleSlot] = useState(0)
  const [wrongRuleChip, setWrongRuleChip] = useState(null)
  const [ruleWrongCount, setRuleWrongCount] = useState(0)

  const [wrongPredChip, setWrongPredChip] = useState(null)
  const [predWrongCount, setPredWrongCount] = useState(0)

  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.comms.missions['1']
  const task = PATTERN_TASKS[taskIndex]
  const animTimers = useRef([])

  // Observe animation
  useEffect(() => {
    if (phase !== 'observe') return
    animTimers.current.forEach(t => clearTimeout(t))
    animTimers.current = []
    setAnimRow(-1)
    task.givenPairs.forEach((_, i) => {
      const t = setTimeout(() => setAnimRow(i), (i + 1) * 900)
      animTimers.current.push(t)
    })
    return () => animTimers.current.forEach(t => clearTimeout(t))
  }, [phase, taskIndex])

  // Init build phase
  useEffect(() => {
    if (phase === 'build') {
      setRuleSlots(new Array(task.ruleSteps.length).fill(null))
      setActiveRuleSlot(0)
      setRuleWrongCount(0)
    }
  }, [phase])

  const ruleBuilt = phase === 'build' && ruleSlots.every(s => s !== null)

  // Auto-advance build → predict
  useEffect(() => {
    if (ruleBuilt && phase === 'build') {
      const t = setTimeout(() => setPhase('predict'), 1200)
      return () => clearTimeout(t)
    }
  }, [ruleBuilt, phase])

  // Machine display values
  const machineInput = phase === 'observe' && animRow >= 0 && animRow < task.givenPairs.length
    ? task.givenPairs[animRow][0]
    : (phase === 'predict' || phase === 'solved') ? task.queryX : null

  const machineOutput = phase === 'observe' && animRow >= 0 && animRow < task.givenPairs.length
    ? task.givenPairs[animRow][1]
    : phase === 'solved' ? task.answer : null

  const ruleDisplay = (ruleBuilt || phase === 'predict' || phase === 'solved')
    ? task.ruleSteps.map(s => s.label).join(', ')
    : phase === 'build' ? ruleSlots.map(s => s ?? '?').join(', ') : null

  function handleRuleChipClick(chipLabel) {
    if (phase !== 'build' || ruleBuilt) return
    if (chipLabel === task.ruleSteps[activeRuleSlot].label) {
      const next = [...ruleSlots]
      next[activeRuleSlot] = chipLabel
      setRuleSlots(next)
      setRuleWrongCount(0)
      const nextSlot = next.findIndex((v, i) => i > activeRuleSlot && v === null)
      if (nextSlot !== -1) setActiveRuleSlot(nextSlot)
    } else {
      setWrongRuleChip(chipLabel)
      setRuleWrongCount(prev => prev + 1)
      setTimeout(() => setWrongRuleChip(null), 500)
    }
  }

  function handlePredictChipClick(val) {
    if (phase !== 'predict') return
    if (val === task.answer) {
      setPhase('solved')
    } else {
      setWrongPredChip(val)
      setPredWrongCount(prev => prev + 1)
      setTimeout(() => setWrongPredChip(null), 500)
    }
  }

  function handleNext() {
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)
    if (task.ahaId && !mState.ahaMoments.includes(task.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'comms', missionId: '1', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < PATTERN_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < PATTERN_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
    setPhase('observe')
    setAnimRow(-1)
    setRuleSlots([])
    setActiveRuleSlot(0)
    setRuleWrongCount(0)
    setWrongRuleChip(null)
    setWrongPredChip(null)
    setPredWrongCount(0)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'comms', missionId: '1' })
  }

  // Build computation display string for predict phase
  function buildComputeDisplay() {
    const x = task.queryX
    const steps = task.ruleSteps
    let parts = `f(${x}) = `
    if (steps[0].op === 'multiply') parts += `${steps[0].by} × ${x}`
    else if (steps[0].op === 'add') parts += `${x} + ${steps[0].by}`
    else if (steps[0].op === 'subtract') parts += `${x} − ${steps[0].by}`

    if (steps.length > 1) {
      const s = steps[1]
      if (s.op === 'add') parts += ` + ${s.by}`
      else if (s.op === 'subtract') parts += ` − ${s.by}`
    }
    return parts + ' = '
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 12px', minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 10 }}>
        <NeonButton onClick={onBack} size="small">← Exit</NeonButton>
      </div>

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-pink)', marginBottom: 6 }}>
        📡 MISSION 1
      </div>

      <NeonText as="h2" color="pink" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        信号模式识别
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
            ? '🎉 Signal decoder restored! All patterns decoded.'
            : phase === 'observe' ? 'Observe the signal pattern flowing through the decoder.'
            : phase === 'build' ? 'Assemble the function rule from the operation chips.'
            : phase === 'predict' ? 'Use the rule to predict the missing output.'
            : `Signal decoded! ${task.rule}`
          }
        </p>
      </div>

      {!completed && (
        <>
          {/* Phase indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
            {['OBSERVE', 'BUILD', 'PREDICT'].map((label, i) => {
              const phases = ['observe', 'build', 'predict']
              const current = phases.indexOf(phase === 'solved' ? 'predict' : phase)
              const isDone = i < current || phase === 'solved'
              const isActive = i === current
              return (
                <div key={label} style={{
                  fontSize: 11, letterSpacing: 2, padding: '4px 10px', borderRadius: 20,
                  background: isDone ? 'rgba(57,255,20,0.1)' : isActive ? 'rgba(255,45,149,0.1)' : 'transparent',
                  border: `1px solid ${isDone ? 'var(--neon-green)' : isActive ? 'var(--neon-pink)' : 'rgba(255,255,255,0.1)'}`,
                  color: isDone ? 'var(--neon-green)' : isActive ? 'var(--neon-pink)' : 'rgba(255,255,255,0.25)',
                  fontFamily: 'var(--font-display)', transition: 'all 0.3s',
                }}>
                  {isDone ? '✓' : (i + 1)} {label}
                </div>
              )
            })}
          </div>

          {/* Function Machine + Signal Table */}
          <div className="glass-panel" style={{
            padding: 'clamp(14px, 3vw, 20px)', maxWidth: 520, width: '100%', marginBottom: 16,
          }}>
            <div style={{ ...meterLabel, marginBottom: 10 }}>
              SIGNAL {taskIndex + 1}/{PATTERN_TASKS.length} — {phase === 'observe' ? 'SCANNING' : phase === 'build' ? 'DECODING' : phase === 'predict' ? 'PREDICTING' : 'DECODED'}
            </div>

            <FunctionMachine
              inputVal={machineInput}
              outputVal={machineOutput}
              ruleDisplay={ruleDisplay}
              showOutput={phase === 'observe' ? animRow >= 0 : phase === 'solved'}
            />

            <SignalTable
              givenPairs={task.givenPairs}
              queryX={task.queryX}
              queryAnswer={task.answer}
              solved={phase === 'solved'}
              highlightRow={phase === 'observe' ? animRow : -1}
            />
          </div>

          {/* Phase 1: Observe */}
          {phase === 'observe' && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <NeonButton onClick={() => setPhase('build')} color="pink" size="small">
                Decode Rule →
              </NeonButton>
            </div>
          )}

          {/* Phase 2: Build rule */}
          {phase === 'build' && !ruleBuilt && (
            <div style={{ maxWidth: 500, width: '100%', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
                What operations transform input → output?
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginBottom: 16, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)' }}>
                  x →
                </span>
                {ruleSlots.map((val, idx) => (
                  <span
                    key={idx}
                    onClick={() => val === null && setActiveRuleSlot(idx)}
                    style={slotStyle(val !== null, activeRuleSlot === idx, val !== null)}
                  >
                    {val ?? '?'}
                  </span>
                ))}
                <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)' }}>
                  → f(x)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                {task.ruleChips.map((chip, idx) => (
                  <button key={idx} onClick={() => handleRuleChipClick(chip)} style={chipStyle(false, wrongRuleChip === chip)}>
                    {chip}
                  </button>
                ))}
              </div>

              {wrongRuleChip !== null && (
                <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginTop: 10 }}>
                  ⚠ DECODING ERROR
                </div>
              )}
              {ruleWrongCount >= 2 && wrongRuleChip === null && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10, fontFamily: 'var(--font-body)' }}>
                  Hint: {task.hint}
                </div>
              )}
            </div>
          )}

          {/* Build complete flash */}
          {phase === 'build' && ruleBuilt && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
                color: 'var(--neon-green)', letterSpacing: 2, fontFamily: 'var(--font-display)',
              }}>
                ✓ RULE DECODED: {task.ruleSteps.map(s => s.label).join(', ')}
              </div>
            </div>
          )}

          {/* Phase 3: Predict */}
          {phase === 'predict' && (
            <div style={{ maxWidth: 500, width: '100%', marginBottom: 16, textAlign: 'center' }}>
              <div style={{
                fontSize: 'clamp(14px, 3vw, 16px)', color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-body)', marginBottom: 6,
              }}>
                Apply the rule to a new input:
              </div>

              <div style={{
                fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700,
                fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)',
                marginBottom: 16, lineHeight: 1.8,
              }}>
                {buildComputeDisplay()}
                <span style={{ color: 'var(--neon-pink)' }}>?</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                {task.predictChips.map((val, idx) => (
                  <button key={idx} onClick={() => handlePredictChipClick(val)} style={chipStyle(false, wrongPredChip === val)}>
                    {val}
                  </button>
                ))}
              </div>

              {wrongPredChip !== null && (
                <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginTop: 10 }}>
                  ⚠ SIGNAL INTERFERENCE
                </div>
              )}
              {predWrongCount >= 2 && wrongPredChip === null && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10, fontFamily: 'var(--font-body)' }}>
                  Hint: {task.predictHint}
                </div>
              )}
            </div>
          )}

          {/* Solved */}
          {phase === 'solved' && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 900,
                fontFamily: 'var(--font-display)', color: 'var(--neon-green)', marginBottom: 6,
              }}>
                f({task.queryX}) = {task.answer}
              </div>
              <div style={{
                fontSize: 'clamp(13px, 3vw, 15px)', color: 'var(--neon-green)',
                fontFamily: 'var(--font-display)', letterSpacing: 2, marginBottom: 14,
              }}>
                {task.rule}
              </div>
              <NeonButton onClick={handleNext} color="green" size="small">
                {taskIndex < PATTERN_TASKS.length - 1 ? 'Next Signal →' : 'Complete →'}
              </NeonButton>
            </div>
          )}
        </>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Signals Decoded</span>
          <span>{tasksCompleted}/{PATTERN_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={PATTERN_TASKS.length} color="pink" />
      </div>

      {/* Guide */}
      {!completed && phase !== 'solved' && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {phase === 'observe' && 'Study how inputs transform into outputs. Look at the Δ column — is there a constant pattern?'}
          {phase === 'build' && 'Pick the operations that turn each input into its output. Start with multiplication, then addition/subtraction.'}
          {phase === 'predict' && 'Apply the decoded rule step by step to the new input. Compute carefully!'}
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
