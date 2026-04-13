import { useState, useCallback, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const SEQUENCE_TASKS = [
  {
    tokens: [2, '+', 3, '×', 4],
    correctResult: 14,
    ahaId: null,
    title: 'BOOT ALPHA',
    hint: 'Which operation has higher priority: + or ×?',
  },
  {
    tokens: [5, '×', 2, '+', 3],
    correctResult: 13,
    ahaId: 'mult_before_add',
    ahaTitle: 'Priority Protocol',
    ahaDesc: 'Multiplication and division execute before addition and subtraction. The reactor doesn\'t just go left to right — there\'s a priority hierarchy!',
    hint: 'The × command has higher priority. Execute it first.',
  },
  {
    tokens: [3, '+', 4, '×', 2, '-', 1],
    correctResult: 10,
    ahaId: 'left_to_right',
    ahaTitle: 'Sequential Rule',
    ahaDesc: 'When operations share the same priority level (like + and −), the reactor processes them left to right. Order still matters within a tier!',
    hint: 'After handling ×, the remaining + and − are same-priority. Go left to right.',
  },
  {
    tokens: [10, '-', 6, '÷', 2, '+', 1],
    correctResult: 8,
    ahaId: 'div_equals_mult',
    ahaTitle: 'Division Equivalence',
    ahaDesc: 'Division and multiplication share the same priority tier. Both outrank addition and subtraction equally.',
    hint: 'The ÷ command ranks equally with ×. Both outrank + and −.',
  },
  {
    tokens: ['(', 2, '+', 3, ')', '×', 4],
    correctResult: 20,
    ahaId: 'parens_override',
    ahaTitle: 'Override Command',
    ahaDesc: 'Parentheses are priority overrides! Any operation enclosed in ( ) executes first, regardless of operator type. They are the ultimate command.',
    hint: 'The ( ) override marks force the enclosed command to execute first.',
  },
  {
    tokens: ['(', 4, '+', 6, ')', '÷', 2, '-', 1],
    correctResult: 4,
    ahaId: 'full_pemdas',
    ahaTitle: 'PEMDAS Mastery',
    ahaDesc: 'P-E-MD-AS: Parentheses first, then Exponents, then Multiplication/Division (left to right), then Addition/Subtraction (left to right). Full protocol mastered!',
    hint: 'Parentheses first, then division, then subtraction.',
  },
]

// ─── Expression Engine ───────────────────────────────────────
function getOperators(tokens) {
  const ops = []
  let depth = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === '(') { depth++; continue }
    if (t === ')') { depth--; continue }
    if (typeof t === 'string' && ['+', '-', '×', '÷'].includes(t)) {
      const base = (t === '×' || t === '÷') ? 2 : 1
      ops.push({ tokenIndex: i, symbol: t, priority: base + depth * 10 })
    }
  }
  return ops
}

function getNextCorrect(tokens) {
  const ops = getOperators(tokens)
  if (ops.length === 0) return null
  ops.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.tokenIndex - b.tokenIndex
  })
  return ops[0]
}

function evalStep(tokens, opTokenIndex) {
  const op = tokens[opTokenIndex]
  // Find adjacent numbers (skip parens)
  let li = opTokenIndex - 1
  while (li >= 0 && (tokens[li] === '(' || tokens[li] === ')')) li--
  let ri = opTokenIndex + 1
  while (ri < tokens.length && (tokens[ri] === '(' || tokens[ri] === ')')) ri++

  const left = tokens[li]
  const right = tokens[ri]
  let result
  switch (op) {
    case '+': result = left + right; break
    case '-': result = left - right; break
    case '×': result = left * right; break
    case '÷': result = left / right; break
  }

  // Determine removal range
  let removeStart = li
  let removeEnd = ri

  // If this was the last op inside parens, remove the parens too
  if (removeStart > 0 && tokens[removeStart - 1] === '(') {
    const closeParen = removeEnd + 1 < tokens.length && tokens[removeEnd + 1] === ')'
    if (closeParen) {
      // Check no other ops remain between these parens
      let hasOtherOps = false
      for (let k = removeStart; k <= removeEnd; k++) {
        if (k !== opTokenIndex && typeof tokens[k] === 'string' && ['+', '-', '×', '÷'].includes(tokens[k])) {
          hasOtherOps = true
          break
        }
      }
      if (!hasOtherOps) {
        removeStart--
        removeEnd++
      }
    }
  }

  const newTokens = []
  for (let i = 0; i < tokens.length; i++) {
    if (i === removeStart) {
      newTokens.push(result)
      i = removeEnd
    } else {
      newTokens.push(tokens[i])
    }
  }
  return { newTokens, result }
}

// ─── Styles ──────────────────────────────────────────────────
const tokenBase = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  minWidth: 44, minHeight: 44, padding: '6px 10px',
  fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700,
  borderRadius: 8, transition: 'all 0.3s',
  fontFamily: 'var(--font-display)', userSelect: 'none',
}

const numberStyle = {
  ...tokenBase,
  background: 'var(--glass)', border: '1px solid var(--glass-border)', color: '#fff',
}

const operatorStyle = {
  ...tokenBase,
  background: 'rgba(255,230,0,0.06)', border: '2px solid rgba(255,230,0,0.4)',
  color: 'var(--neon-yellow)', cursor: 'pointer', position: 'relative',
}

const parenStyle = {
  ...tokenBase,
  fontSize: 'clamp(24px, 5vw, 32px)', color: 'var(--neon-yellow)',
  opacity: 0.6, minWidth: 20, padding: '0 2px',
  border: 'none', background: 'none',
}

// ─── Component ───────────────────────────────────────────────
export default function Mission2_Sequence({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [tokens, setTokens] = useState(() => [...SEQUENCE_TASKS[0].tokens])
  const [wrongCount, setWrongCount] = useState(0)
  const [showAnomaly, setShowAnomaly] = useState(false)
  const [correctFlash, setCorrectFlash] = useState(null) // tokenIndex of correct op
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const animating = useRef(false)

  const mState = state.systems.powercore.missions['2']
  const task = SEQUENCE_TASKS[taskIndex]
  const ops = getOperators(tokens)
  const isExprDone = ops.length === 0

  const handleOpClick = useCallback((opTokenIndex) => {
    if (animating.current || isExprDone || completed) return

    const correct = getNextCorrect(tokens)
    if (!correct) return

    if (opTokenIndex === correct.tokenIndex) {
      // Correct!
      animating.current = true
      setCorrectFlash(opTokenIndex)
      setWrongCount(0)

      setTimeout(() => {
        const { newTokens } = evalStep(tokens, opTokenIndex)
        setTokens(newTokens)
        setCorrectFlash(null)
        animating.current = false

        // Check if expression is fully evaluated
        const remainingOps = getOperators(newTokens)
        if (remainingOps.length === 0) {
          handleTaskComplete()
        }
      }, 400)
    } else {
      // Wrong
      setShowAnomaly(true)
      setWrongCount(prev => prev + 1)
      setTimeout(() => setShowAnomaly(false), 1500)
    }
  }, [tokens, isExprDone, completed])

  function handleTaskComplete() {
    const t = SEQUENCE_TASKS[taskIndex]
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)

    if (t.ahaId && !mState.ahaMoments.includes(t.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'powercore', missionId: '2', ahaId: t.ahaId })
      setAhaModal(t)
    } else if (taskIndex < SEQUENCE_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < SEQUENCE_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    const next = taskIndex + 1
    setTaskIndex(next)
    setTokens([...SEQUENCE_TASKS[next].tokens])
    setWrongCount(0)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'powercore', missionId: '2' })
  }

  // Render token
  function renderToken(t, i) {
    if (t === '(' || t === ')') {
      return <div key={i} style={parenStyle}>{t}</div>
    }
    if (typeof t === 'string' && ['+', '-', '×', '÷'].includes(t)) {
      const isCorrectFlash = correctFlash === i
      const isHinted = wrongCount >= 3 && getNextCorrect(tokens)?.tokenIndex === i
      return (
        <div
          key={i}
          onClick={() => handleOpClick(i)}
          style={{
            ...operatorStyle,
            ...(isCorrectFlash ? {
              borderColor: 'var(--neon-green)', background: 'rgba(57,255,20,0.15)',
              color: 'var(--neon-green)', transform: 'scale(1.1)',
              boxShadow: '0 0 20px rgba(57,255,20,0.4)',
            } : {}),
            ...(isHinted ? {
              boxShadow: '0 0 15px rgba(255,230,0,0.5)',
              animation: 'glow-pulse 1.5s infinite',
            } : {}),
          }}
        >
          {t}
        </div>
      )
    }
    // Number
    const isPartOfCorrect = correctFlash !== null && (i === correctFlash - 1 || i === correctFlash + 1)
    return (
      <div
        key={i}
        style={{
          ...numberStyle,
          ...(isPartOfCorrect ? {
            borderColor: 'var(--neon-green)', background: 'rgba(57,255,20,0.1)',
          } : {}),
          // Wider for larger numbers
          ...(String(t).length > 2 ? { minWidth: 56 } : {}),
        }}
      >
        {t}
      </div>
    )
  }

  // Format expression as text
  const exprText = tokens.filter(t => typeof t === 'number' || ['+', '-', '×', '÷'].includes(t))
    .map(t => typeof t === 'number' ? t : ` ${t} `).join('')

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
        ⚡ MISSION 2
      </div>

      <NeonText as="h2" color="cyan" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        启动序列
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
            ? '🎉 Boot sequence complete! Reactor at full power.'
            : isExprDone
              ? `✓ Output: ${tokens[0]} — Correct!`
              : 'Tap the operation that should execute first.'
          }
        </p>
      </div>

      {/* Task title */}
      {!completed && (
        <div style={{
          fontSize: 12, letterSpacing: 3, color: 'var(--neon-yellow)',
          marginBottom: 12, opacity: 0.7,
        }}>
          {task?.title} — SEQUENCE {taskIndex + 1}/{SEQUENCE_TASKS.length}
        </div>
      )}

      {/* Expression area */}
      <div className="glass-panel" style={{
        padding: 'clamp(16px, 3vw, 24px)', marginBottom: 20,
        maxWidth: 600, width: '100%', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', gap: 'clamp(4px, 1.5vw, 8px)',
          alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap',
          minHeight: 60,
        }}>
          {tokens.map((t, i) => renderToken(t, i))}
        </div>

        {/* Anomaly flash overlay */}
        {showAnomaly && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 12,
            background: 'rgba(255,45,149,0.08)', pointerEvents: 'none',
            animation: 'pulse 0.5s',
          }} />
        )}
      </div>

      {/* Anomaly message */}
      {showAnomaly && (
        <div style={{
          color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2,
          marginBottom: 12, textAlign: 'center',
          animation: 'pulse 1.5s',
        }}>
          ⚠ ANOMALY — command priority error
        </div>
      )}

      {/* Reactor readout */}
      {!completed && (
        <div className="glass-panel" style={{
          padding: 'clamp(14px, 2vw, 16px)', maxWidth: 400, width: '100%',
          marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
            TARGET OUTPUT
          </div>
          <div style={{
            fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900,
            color: 'var(--neon-yellow)',
            textShadow: '0 0 10px var(--neon-yellow), 0 0 30px rgba(255,230,0,0.3)',
          }}>
            {task?.correctResult}
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Boot Progress</span>
          <span>{tasksCompleted}/{SEQUENCE_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={SEQUENCE_TASKS.length} color="cyan" />
      </div>

      {/* Guide */}
      {!completed && !isExprDone && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-cyan)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {wrongCount >= 2 ? task?.hint : 'Select the operator with the highest priority. The reactor will execute that command first.'}
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
