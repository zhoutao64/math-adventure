import { useState, useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const PATTERN_TASKS = [
  {
    rule: 'f(x) = 2x + 1',
    givenPairs: [[1, 3], [2, 5], [3, 7]],
    ruleSteps: [
      { label: '×2', op: (x) => x * 2 },
      { label: '+1', op: (x) => x + 1 },
    ],
    ruleChips: ['×2', '+1', '×3', '−2', '+3'],
    queryX: 4,
    answer: 9,
    predictChips: [9, 8, 10, 5],
    predictExpr: '2 × 4 + 1',
    predictHint: '2 × 4 = 8, then 8 + 1 = ?',
    hint: 'Each time x goes up by 1, output goes up by 2. Double the input and add 1.',
    ahaId: 'pattern_rule',
    ahaTitle: 'Function Rule',
    ahaDesc: 'A function is a rule: every input has exactly one output. Once you know the rule, you can predict ANY output! f(x) = 2x + 1 means "double the input and add 1."',
  },
  {
    rule: 'f(x) = 3x − 2',
    givenPairs: [[0, -2], [1, 1], [2, 4]],
    ruleSteps: [
      { label: '×3', op: (x) => x * 3 },
      { label: '−2', op: (x) => x - 2 },
    ],
    ruleChips: ['×3', '−2', '×2', '+1', '−3'],
    queryX: 3,
    answer: 7,
    predictChips: [7, 6, 9, 1],
    predictExpr: '3 × 3 − 2',
    predictHint: '3 × 3 = 9, then 9 − 2 = ?',
    hint: 'Output goes up by 3 each time. Triple the input and subtract 2.',
    ahaId: 'constant_change',
    ahaTitle: 'Constant Change',
    ahaDesc: 'When the output changes by the same amount for each unit increase in input, the function is LINEAR. Here the output always increases by 3 — that constant rate of change is what makes it a straight line!',
  },
  {
    rule: 'f(x) = −x + 5',
    givenPairs: [[0, 5], [2, 3], [4, 1]],
    ruleSteps: [
      { label: '×(−1)', op: (x) => x * -1 },
      { label: '+5', op: (x) => x + 5 },
    ],
    ruleChips: ['×(−1)', '+5', '−1', '×2', '+3'],
    queryX: 6,
    answer: -1,
    predictChips: [-1, 1, -6, 11],
    predictExpr: '(−1) × 6 + 5',
    predictHint: '(−1) × 6 = −6, then −6 + 5 = ?',
    hint: 'Output goes down by 1 for every 1 increase in x. Negate the input and add 5.',
    ahaId: 'negative_output',
    ahaTitle: 'Negative Outputs',
    ahaDesc: 'Functions can output negative numbers — the pattern continues past zero! If f(x) = −x + 5, then f(6) = −6 + 5 = −1. The rule doesn\'t stop just because the answer is negative.',
  },
  {
    rule: 'f(x) = x + 3',
    givenPairs: [[1, 4], [3, 6], [5, 8]],
    ruleSteps: [
      { label: '+3', op: (x) => x + 3 },
    ],
    ruleChips: ['+3', '×2', '+1', '−3', '×3'],
    queryX: 0,
    answer: 3,
    predictChips: [3, 0, 4, -3],
    predictExpr: '0 + 3',
    predictHint: '0 + 3 = ?',
    hint: 'The output is always 3 more than the input.',
    ahaId: 'input_zero',
    ahaTitle: 'The x = 0 Input',
    ahaDesc: 'When x = 0, the output equals the constant in the rule. For f(x) = x + 3, f(0) = 0 + 3 = 3. This special value is called the y-intercept — it\'s where the line crosses the y-axis!',
  },
  {
    rule: 'f(x) = 2x',
    givenPairs: [[0, 0], [1, 2], [3, 6]],
    ruleSteps: [
      { label: '×2', op: (x) => x * 2 },
    ],
    ruleChips: ['×2', '+1', '×3', '−2', '+0'],
    queryX: 5,
    answer: 10,
    predictChips: [10, 7, 12, 5],
    predictExpr: '2 × 5',
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
  minWidth: 48, minHeight: 44, padding: '6px 12px',
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
function FunctionMachine({ inputVal, outputVal, ruleDisplay, phase, highlightInput, highlightOutput }) {
  const boxBase = {
    padding: 'clamp(10px, 2vw, 16px) clamp(12px, 3vw, 20px)',
    borderRadius: 10, textAlign: 'center', flex: '1 1 0',
    minWidth: 70, transition: 'all 0.3s',
  }
  const arrow = {
    fontSize: 'clamp(14px, 3vw, 20px)', color: 'rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', padding: '0 4px',
    fontFamily: 'var(--font-display)',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 'clamp(4px, 1vw, 8px)', flexWrap: 'wrap', marginBottom: 16,
    }}>
      {/* INPUT */}
      <div style={{
        ...boxBase, background: 'var(--glass)',
        border: `2px solid ${highlightInput ? 'var(--neon-pink)' : 'rgba(255,45,149,0.3)'}`,
        boxShadow: highlightInput ? '0 0 12px rgba(255,45,149,0.3)' : 'none',
      }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>INPUT</div>
        <div style={{
          fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
          fontFamily: 'var(--font-display)', color: 'var(--neon-pink)',
        }}>
          {inputVal ?? '—'}
        </div>
      </div>

      <div style={arrow}>→</div>

      {/* PROCESSING */}
      <div style={{
        ...boxBase, background: 'var(--glass)',
        border: `2px solid ${ruleDisplay ? 'rgba(0,240,255,0.6)' : 'rgba(0,240,255,0.2)'}`,
        boxShadow: ruleDisplay && phase !== 'observe' ? '0 0 12px rgba(0,240,255,0.2)' : 'none',
      }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>RULE</div>
        <div style={{
          fontSize: 'clamp(16px, 3.5vw, 22px)', fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: ruleDisplay ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.3)',
        }}>
          {ruleDisplay || '???'}
        </div>
      </div>

      <div style={arrow}>→</div>

      {/* OUTPUT */}
      <div style={{
        ...boxBase, background: 'var(--glass)',
        border: `2px solid ${highlightOutput ? 'var(--neon-green)' : 'rgba(57,255,20,0.2)'}`,
        boxShadow: highlightOutput ? '0 0 12px rgba(57,255,20,0.3)' : 'none',
      }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>OUTPUT</div>
        <div style={{
          fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
          fontFamily: 'var(--font-display)',
          color: highlightOutput ? 'var(--neon-green)' : 'rgba(255,255,255,0.5)',
        }}>
          {outputVal ?? '?'}
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

  // Compute deltas
  const deltas = givenPairs.map((pair, i) => {
    if (i === 0) return null
    return pair[1] - givenPairs[i - 1][1]
  })

  return (
    <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr 50px', gap: 0, marginBottom: 4 }}>
        <div style={{ ...cellBase, background: 'rgba(255,45,149,0.12)', color: 'var(--neon-pink)', fontWeight: 700, fontSize: 13 }}>
          Input x
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>→</div>
        <div style={{ ...cellBase, background: 'rgba(255,45,149,0.12)', color: 'var(--neon-pink)', fontWeight: 700, fontSize: 13 }}>
          Output f(x)
        </div>
        <div style={{ ...cellBase, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 11 }}>
          Δ
        </div>
      </div>

      {/* Given rows */}
      {givenPairs.map(([x, y], i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 24px 1fr 50px', gap: 0, marginBottom: 2,
          opacity: highlightRow !== null ? (highlightRow === i ? 1 : 0.4) : 1,
          transition: 'opacity 0.3s',
        }}>
          <div style={{ ...cellBase, color: highlightRow === i ? 'var(--neon-pink)' : '#fff' }}>{x}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>→</div>
          <div style={{ ...cellBase, color: highlightRow === i ? 'var(--neon-green)' : '#fff' }}>{y}</div>
          <div style={{ ...cellBase, color: 'var(--neon-yellow)', fontSize: 13 }}>
            {deltas[i] !== null ? (deltas[i] >= 0 ? `+${deltas[i]}` : deltas[i]) : ''}
          </div>
        </div>
      ))}

      {/* Query row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr 50px', gap: 0, marginBottom: 2, marginTop: 6 }}>
        <div style={{ ...cellBase, color: 'var(--neon-pink)', fontWeight: 900, border: '1px dashed rgba(255,45,149,0.3)' }}>{queryX}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>→</div>
        <div style={{
          ...cellBase, fontWeight: 900,
          color: solved ? 'var(--neon-green)' : 'var(--neon-pink)',
          border: `1px dashed ${solved ? 'rgba(57,255,20,0.3)' : 'rgba(255,45,149,0.3)'}`,
          textShadow: solved ? '0 0 10px var(--neon-green)' : 'none',
        }}>
          {solved ? queryAnswer : '?'}
        </div>
        <div style={{ ...cellBase }}></div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function Mission1_Pattern({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [phase, setPhase] = useState('observe') // observe | build | predict | solved
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  // Observe phase
  const [animRow, setAnimRow] = useState(null)
  const [animDone, setAnimDone] = useState(false)

  // Build phase
  const [ruleSlots, setRuleSlots] = useState([])
  const [activeRuleSlot, setActiveRuleSlot] = useState(0)
  const [wrongChip, setWrongChip] = useState(null)
  const [buildWrongCount, setBuildWrongCount] = useState(0)
  const [ruleBuilt, setRuleBuilt] = useState(false)

  // Predict phase
  const [wrongPredChip, setWrongPredChip] = useState(null)
  const [predWrongCount, setPredWrongCount] = useState(0)

  const mState = state.systems.comms.missions['1']
  const task = PATTERN_TASKS[taskIndex]
  const animTimer = useRef(null)

  // Observe animation
  useEffect(() => {
    if (phase !== 'observe') return
    setAnimRow(null)
    setAnimDone(false)

    const delays = task.givenPairs.map((_, i) => setTimeout(() => setAnimRow(i), 600 + i * 900))
    const doneTimer = setTimeout(() => {
      setAnimRow(null)
      setAnimDone(true)
    }, 600 + task.givenPairs.length * 900)

    return () => {
      delays.forEach(clearTimeout)
      clearTimeout(doneTimer)
    }
  }, [phase, taskIndex])

  // Init rule slots when entering build phase
  useEffect(() => {
    if (phase === 'build') {
      setRuleSlots(new Array(task.ruleSteps.length).fill(null))
      setActiveRuleSlot(0)
      setBuildWrongCount(0)
      setRuleBuilt(false)
    }
  }, [phase, taskIndex])

  // Machine display values
  const machineInput = phase === 'observe' && animRow !== null ? task.givenPairs[animRow][0]
    : phase === 'predict' || phase === 'solved' ? task.queryX
    : null
  const machineOutput = phase === 'observe' && animRow !== null ? task.givenPairs[animRow][1]
    : phase === 'solved' ? task.answer
    : null
  const machineRule = ruleBuilt || phase === 'predict' || phase === 'solved'
    ? task.ruleSteps.map(s => s.label).join(', ')
    : null

  function handleRuleChipClick(chipLabel) {
    if (ruleBuilt) return
    if (chipLabel === task.ruleSteps[activeRuleSlot].label) {
      const next = [...ruleSlots]
      next[activeRuleSlot] = chipLabel
      setRuleSlots(next)
      setBuildWrongCount(0)

      const nextSlotIdx = next.findIndex((v, i) => i > activeRuleSlot && v === null)
      if (nextSlotIdx !== -1) {
        setActiveRuleSlot(nextSlotIdx)
      } else {
        // All slots filled — rule built
        setRuleBuilt(true)
        setTimeout(() => setPhase('predict'), 1200)
      }
    } else {
      setWrongChip(chipLabel)
      setBuildWrongCount(prev => prev + 1)
      setTimeout(() => setWrongChip(null), 500)
    }
  }

  function handlePredictChipClick(val) {
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
    setRuleSlots([])
    setActiveRuleSlot(0)
    setWrongChip(null)
    setBuildWrongCount(0)
    setRuleBuilt(false)
    setWrongPredChip(null)
    setPredWrongCount(0)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'comms', missionId: '1' })
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
            : phase === 'build' ? 'Assemble the function rule by selecting operations.'
            : phase === 'predict' ? 'Apply the rule to predict the missing output.'
            : `f(${task.queryX}) = ${task.answer} — Signal decoded!`
          }
        </p>
      </div>

      {!completed && (
        <>
          {/* Phase indicator */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center',
          }}>
            {['OBSERVE', 'BUILD', 'PREDICT'].map((label, i) => {
              const phases = ['observe', 'build', 'predict']
              const current = phases.indexOf(phase === 'solved' ? 'predict' : phase)
              const isActive = i === current
              const isDone = i < current || phase === 'solved'
              return (
                <div key={label} style={{
                  fontSize: 11, letterSpacing: 2, padding: '4px 10px', borderRadius: 6,
                  background: isDone ? 'rgba(57,255,20,0.1)' : isActive ? 'rgba(255,45,149,0.1)' : 'transparent',
                  border: `1px solid ${isDone ? 'rgba(57,255,20,0.3)' : isActive ? 'rgba(255,45,149,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: isDone ? 'var(--neon-green)' : isActive ? 'var(--neon-pink)' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.3s',
                }}>
                  {isDone ? '✓ ' : ''}{label}
                </div>
              )
            })}
          </div>

          {/* Function Machine */}
          <div className="glass-panel" style={{
            padding: 'clamp(14px, 3vw, 20px)', maxWidth: 520, width: '100%', marginBottom: 16,
          }}>
            <div style={{ ...meterLabel, marginBottom: 10, textAlign: 'center' }}>
              SIGNAL {taskIndex + 1}/{PATTERN_TASKS.length} — DECODER
            </div>

            <FunctionMachine
              inputVal={machineInput}
              outputVal={machineOutput}
              ruleDisplay={machineRule}
              phase={phase}
              highlightInput={animRow !== null || phase === 'predict'}
              highlightOutput={animRow !== null || phase === 'solved'}
            />

            {/* Build phase: rule slots */}
            {phase === 'build' && !ruleBuilt && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 10 }}>
                  ASSEMBLE THE RULE
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                  {ruleSlots.map((val, idx) => (
                    <span
                      key={idx}
                      onClick={() => !ruleBuilt && val === null && setActiveRuleSlot(idx)}
                      style={slotStyle(val !== null, activeRuleSlot === idx, val !== null)}
                    >
                      {val ?? '?'}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {task.ruleChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRuleChipClick(chip)}
                      style={chipStyle(false, wrongChip === chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                {wrongChip !== null && (
                  <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginTop: 10 }}>
                    ⚠ DECODING ERROR
                  </div>
                )}
                {buildWrongCount >= 2 && wrongChip === null && (
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10, fontFamily: 'var(--font-body)' }}>
                    Hint: {task.hint}
                  </div>
                )}
              </div>
            )}

            {/* Build phase: rule complete */}
            {phase === 'build' && ruleBuilt && (
              <div style={{
                textAlign: 'center', marginTop: 12,
                color: 'var(--neon-green)', fontSize: 14, letterSpacing: 2,
              }}>
                ✓ RULE DECODED — {task.rule}
              </div>
            )}

            {/* Predict phase */}
            {phase === 'predict' && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <div style={{
                  fontSize: 'clamp(15px, 3vw, 18px)', color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'var(--font-display)', marginBottom: 6,
                }}>
                  f({task.queryX}) = {task.predictExpr} = <span style={{ color: 'var(--neon-pink)', fontWeight: 900 }}>?</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {task.predictChips.map((val, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePredictChipClick(val)}
                      style={chipStyle(false, wrongPredChip === val)}
                    >
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
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <div style={{
                  fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900,
                  fontFamily: 'var(--font-display)', color: 'var(--neon-green)',
                  marginBottom: 4,
                }}>
                  f({task.queryX}) = {task.answer}
                </div>
                <div style={{
                  color: 'var(--neon-green)', fontSize: 13, letterSpacing: 2, marginBottom: 14,
                  fontFamily: 'var(--font-body)',
                }}>
                  SIGNAL DECODED
                </div>
                <NeonButton onClick={handleNext} color="green" size="small">
                  {taskIndex < PATTERN_TASKS.length - 1 ? 'Next Signal →' : 'Complete →'}
                </NeonButton>
              </div>
            )}
          </div>

          {/* Signal Table */}
          <div className="glass-panel" style={{
            padding: 'clamp(12px, 2vw, 16px)', maxWidth: 520, width: '100%', marginBottom: 16,
          }}>
            <SignalTable
              givenPairs={task.givenPairs}
              queryX={task.queryX}
              queryAnswer={task.answer}
              solved={phase === 'solved'}
              highlightRow={animRow}
            />
          </div>

          {/* Observe → Build button */}
          {phase === 'observe' && animDone && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <NeonButton onClick={() => setPhase('build')} color="pink" size="small">
                Decode Rule →
              </NeonButton>
            </div>
          )}
        </>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Signals Decoded</span>
          <span>{tasksCompleted}/{PATTERN_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={PATTERN_TASKS.length} color="pink" />
      </div>

      {/* Guide */}
      {!completed && phase !== 'solved' && (
        <div className="glass-panel" style={{
          marginTop: 16, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {phase === 'observe' && 'Watch the signal flow through the decoder. Study the input→output pattern and the change (Δ) column.'}
          {phase === 'build' && 'Select operations to build the function rule. Each operation transforms the input step by step.'}
          {phase === 'predict' && 'Apply the rule you built to the new input. Calculate step by step and pick the answer.'}
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
