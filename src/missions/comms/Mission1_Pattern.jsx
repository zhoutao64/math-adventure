import { useState } from 'react'
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
    queryX: 4,
    answer: 9,
    min: -5, max: 20,
    hint: 'Each time x goes up by 1, the output goes up by 2. Double the input and add 1.',
    ahaId: 'pattern_rule',
    ahaTitle: 'Function Rule',
    ahaDesc: 'A function is a rule: every input has exactly one output. Once you know the rule, you can predict ANY output! f(x) = 2x + 1 means "double the input and add 1."',
  },
  {
    rule: 'f(x) = 3x − 2',
    givenPairs: [[0, -2], [1, 1], [2, 4]],
    queryX: 3,
    answer: 7,
    min: -5, max: 20,
    hint: 'The output goes up by 3 each time x increases by 1. Starting from −2 when x = 0.',
    ahaId: 'constant_change',
    ahaTitle: 'Constant Change',
    ahaDesc: 'When the output changes by the same amount for each unit increase in input, the function is LINEAR. Here the output always increases by 3 — that constant rate of change is what makes it a straight line!',
  },
  {
    rule: 'f(x) = −x + 5',
    givenPairs: [[0, 5], [2, 3], [4, 1]],
    queryX: 6,
    answer: -1,
    min: -10, max: 10,
    hint: 'Output goes down by 1 for every 1 increase in x. Continue the pattern past zero!',
    ahaId: 'negative_output',
    ahaTitle: 'Negative Outputs',
    ahaDesc: 'Functions can output negative numbers — the pattern continues past zero! If f(x) = −x + 5, then f(6) = −6 + 5 = −1. The rule doesn\'t stop just because the answer is negative.',
  },
  {
    rule: 'f(x) = x + 3',
    givenPairs: [[1, 4], [3, 6], [5, 8]],
    queryX: 0,
    answer: 3,
    min: -5, max: 15,
    hint: 'The output is always 3 more than the input. What happens when x = 0?',
    ahaId: 'input_zero',
    ahaTitle: 'The x = 0 Input',
    ahaDesc: 'When x = 0, the output equals the constant in the rule. For f(x) = x + 3, f(0) = 0 + 3 = 3. This special value is called the y-intercept — it\'s where the line crosses the y-axis!',
  },
  {
    rule: 'f(x) = 2x',
    givenPairs: [[0, 0], [1, 2], [3, 6]],
    queryX: 5,
    answer: 10,
    min: -5, max: 20,
    hint: 'The output is always double the input. No constant is added.',
    ahaId: 'origin_line',
    ahaTitle: 'Through the Origin',
    ahaDesc: 'When there\'s no added constant, f(0) = 0 and the line passes through the origin (0, 0). The equation f(x) = 2x is the simplest form of a linear function!',
  },
]

// ─── Signal Table Visual ─────────────────────────────────────
function SignalTable({ givenPairs, queryX, queryAnswer, solved }) {
  const rows = [
    ...givenPairs.map(([x, y]) => ({ x, y, known: true })),
    { x: queryX, y: queryAnswer, known: false },
  ]

  return (
    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 24px 1fr',
        gap: 0, marginBottom: 4,
      }}>
        <div style={{ ...cellStyle, background: 'rgba(255,45,149,0.15)', color: 'var(--neon-pink)', fontWeight: 700 }}>
          Input (x)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          →
        </div>
        <div style={{ ...cellStyle, background: 'rgba(255,45,149,0.15)', color: 'var(--neon-pink)', fontWeight: 700 }}>
          Output f(x)
        </div>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 24px 1fr',
          gap: 0, marginBottom: 2,
        }}>
          <div style={{
            ...cellStyle,
            color: !row.known ? 'var(--neon-pink)' : '#fff',
            fontWeight: !row.known ? 900 : 400,
          }}>
            {row.x}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
            →
          </div>
          <div style={{
            ...cellStyle,
            color: !row.known
              ? (solved ? 'var(--neon-green)' : 'var(--neon-pink)')
              : '#fff',
            fontWeight: !row.known ? 900 : 400,
            textShadow: !row.known && solved ? '0 0 10px var(--neon-green)' : 'none',
          }}>
            {row.known ? row.y : (solved ? row.y : '?')}
          </div>
        </div>
      ))}
    </div>
  )
}

const cellStyle = {
  padding: '10px 16px',
  background: 'var(--glass)',
  borderRadius: 6,
  textAlign: 'center',
  fontSize: 'clamp(14px, 3vw, 18px)',
  fontFamily: 'var(--font-display)',
  letterSpacing: 1,
}

// ─── Component ───────────────────────────────────────────────
export default function Mission1_Pattern({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [guess, setGuess] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.comms.missions['1']
  const task = PATTERN_TASKS[taskIndex]

  function handleSubmit() {
    if (solved) return
    if (guess === task.answer) {
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
    const next = taskIndex + 1
    setTaskIndex(next)
    setGuess(0)
    setSolved(false)
    setWrongFlash(false)
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
        <div style={{ fontSize: 12, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          🎯 OBJECTIVE
        </div>
        <p style={{
          fontSize: 'clamp(15px, 3vw, 17px)', color: 'rgba(255,255,255,0.85)',
          fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0,
        }}>
          {completed
            ? '🎉 Signal decoder restored! All patterns decoded.'
            : 'Decode the signal pattern — predict the missing output.'
          }
        </p>
      </div>

      {!completed && (
        <>
          {/* Signal Table */}
          <div className="glass-panel" style={{
            padding: 'clamp(16px, 3vw, 24px)', maxWidth: 500, width: '100%',
            marginBottom: 20,
          }}>
            <div style={{ ...meterLabel, marginBottom: 12 }}>
              SIGNAL {taskIndex + 1}/{PATTERN_TASKS.length} — DECODING
            </div>

            <SignalTable
              givenPairs={task.givenPairs}
              queryX={task.queryX}
              queryAnswer={task.answer}
              solved={solved}
            />

            {/* Reveal rule after solving */}
            {solved && (
              <div style={{
                marginTop: 16, textAlign: 'center',
                fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
                color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                letterSpacing: 1,
              }}>
                Rule: {task.rule}
              </div>
            )}
          </div>

          {/* Slider input */}
          {!solved && (
            <div style={{ maxWidth: 400, width: '100%', padding: '0 16px', marginBottom: 20 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                  f({task.queryX}) =
                </span>
                <span style={{
                  fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900,
                  color: wrongFlash ? 'var(--neon-pink)' : 'var(--neon-pink)',
                  fontFamily: 'var(--font-display)',
                  animation: wrongFlash ? 'shake 0.4s' : 'none',
                }}>
                  {guess}
                </span>
              </div>
              <input
                type="range"
                min={task.min}
                max={task.max}
                value={guess}
                onChange={e => setGuess(parseInt(e.target.value))}
                style={{
                  width: '100%', height: 8, appearance: 'none', background: 'rgba(255,255,255,0.1)',
                  borderRadius: 4, outline: 'none', cursor: 'pointer',
                  accentColor: 'var(--neon-pink)',
                }}
              />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4,
              }}>
                <span>{task.min}</span>
                <span>{task.max}</span>
              </div>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <NeonButton onClick={handleSubmit} color="pink" size="small">
                  Submit Prediction
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
              ⚠ SIGNAL INTERFERENCE — wrong prediction
            </div>
          )}

          {/* Next button after solving */}
          {solved && (
            <NeonButton onClick={handleNext} color="green" size="small">
              {taskIndex < PATTERN_TASKS.length - 1 ? 'Next Signal →' : 'Complete →'}
            </NeonButton>
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
      {!completed && !solved && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.hint || 'Study the pattern in the signal table and predict the missing output.'}
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
