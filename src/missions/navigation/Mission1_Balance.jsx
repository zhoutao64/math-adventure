import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const BALANCE_TASKS = [
  {
    equation: 'x = ?',
    leftLabel: 'x', rightLabel: '5',
    answer: 5, min: 0, max: 10,
    hint: 'The left thruster shows x. What value balances with 5?',
    ahaId: 'equation_concept',
    ahaTitle: 'The Equation',
    ahaDesc: 'An equation means two sides are equal. When x = 5, both thrusters output the same power. That\'s what "=" means — perfect balance!',
  },
  {
    equation: 'x + 2 = 7',
    leftLabel: 'x + 2', rightLabel: '7',
    answer: 5, min: 0, max: 10,
    hint: 'x plus 2 must equal 7. What number plus 2 gives 7?',
    ahaId: null,
  },
  {
    equation: '3 = x − 1',
    leftLabel: '3', rightLabel: 'x − 1',
    answer: 4, min: 0, max: 10,
    hint: 'x minus 1 must equal 3. What minus 1 gives 3?',
    ahaId: 'variable',
    ahaTitle: 'The Unknown Variable',
    ahaDesc: 'x is not a scary symbol — it\'s just a number we haven\'t found yet. Every equation is a puzzle: find the value of x that makes both sides equal.',
  },
  {
    equation: 'x + 4 = 10',
    leftLabel: 'x + 4', rightLabel: '10',
    answer: 6, min: 0, max: 15,
    hint: 'What number plus 4 equals 10? Think: 10 minus 4.',
    ahaId: 'inverse_add',
    ahaTitle: 'Inverse Operations — Addition',
    ahaDesc: 'To undo addition, use subtraction! If x + 4 = 10, then x = 10 − 4. Every operation has an opposite that cancels it out.',
  },
  {
    equation: '2x = 8',
    leftLabel: '2x', rightLabel: '8',
    answer: 4, min: 0, max: 10,
    hint: '2 times what equals 8? Think: 8 divided by 2.',
    ahaId: null,
  },
  {
    equation: '3x = 12',
    leftLabel: '3x', rightLabel: '12',
    answer: 4, min: 0, max: 10,
    hint: '3 times what equals 12?',
    ahaId: 'inverse_mult',
    ahaTitle: 'Inverse Operations — Multiplication',
    ahaDesc: 'To undo multiplication, use division! If 3x = 12, then x = 12 ÷ 3. Addition ↔ Subtraction, Multiplication ↔ Division — always in pairs.',
  },
]

// ─── Balance Beam Visual ─────────────────────────────────────
function BalanceBeam({ leftLabel, rightLabel, leftValue, rightValue, guess }) {
  // Calculate tilt: negative = left heavy, positive = right heavy
  const diff = leftValue - rightValue
  const tiltDeg = Math.max(-15, Math.min(15, diff * 3))
  const isBalanced = diff === 0
  const color = isBalanced ? 'var(--neon-green)' : 'var(--neon-yellow)'

  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      {/* Beam */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 360,
        margin: '0 auto', height: 120,
      }}>
        {/* Fulcrum triangle */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '16px solid transparent', borderRight: '16px solid transparent',
          borderBottom: `24px solid ${color}`,
          transition: 'border-bottom-color 0.3s',
        }} />

        {/* Bar */}
        <div style={{
          position: 'absolute', bottom: 24, left: '10%', width: '80%', height: 4,
          background: color, borderRadius: 2,
          transform: `rotate(${tiltDeg}deg)`,
          transformOrigin: 'center center',
          transition: 'all 0.4s ease',
          boxShadow: isBalanced ? `0 0 15px ${color}` : 'none',
        }}>
          {/* Left pan */}
          <div style={{
            position: 'absolute', left: 0, top: -50,
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}>
            <div style={{
              background: 'var(--glass)', border: `2px solid ${color}`,
              borderRadius: 10, padding: '8px 14px', minWidth: 60,
              fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
              fontFamily: 'var(--font-display)', color: '#fff',
              transition: 'all 0.3s',
            }}>
              {leftLabel}
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4,
              fontFamily: 'var(--font-display)',
            }}>
              = {leftValue}
            </div>
          </div>

          {/* Right pan */}
          <div style={{
            position: 'absolute', right: 0, top: -50,
            transform: 'translateX(50%)',
            textAlign: 'center',
          }}>
            <div style={{
              background: 'var(--glass)', border: `2px solid ${color}`,
              borderRadius: 10, padding: '8px 14px', minWidth: 60,
              fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
              fontFamily: 'var(--font-display)', color: '#fff',
              transition: 'all 0.3s',
            }}>
              {rightLabel}
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4,
              fontFamily: 'var(--font-display)',
            }}>
              = {rightValue}
            </div>
          </div>
        </div>
      </div>

      {/* Balance status */}
      <div style={{
        fontSize: 14, letterSpacing: 2, marginTop: 8,
        color: isBalanced ? 'var(--neon-green)' : 'var(--neon-yellow)',
        transition: 'color 0.3s',
      }}>
        {isBalanced ? '✓ BALANCED' : diff > 0 ? '← LEFT HEAVY' : '→ RIGHT HEAVY'}
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────
export default function Mission1_Balance({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [guess, setGuess] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.navigation.missions['1']
  const task = BALANCE_TASKS[taskIndex]

  // Compute left and right values based on guess
  function computeValues(t, g) {
    // Parse simple patterns
    const eq = t.equation
    if (eq === 'x = ?') return { left: g, right: t.answer }
    if (eq.startsWith('x + ')) {
      const n = parseInt(eq.match(/x \+ (\d+)/)[1])
      return { left: g + n, right: t.answer + n }
    }
    if (eq.startsWith('x − ') || eq.match(/x − \d+/)) {
      const n = parseInt(eq.match(/x − (\d+)/)[1])
      return { left: g - n, right: t.answer - n }
    }
    if (eq.match(/^\d+ = x − \d+$/)) {
      const parts = eq.match(/^(\d+) = x − (\d+)$/)
      return { left: parseInt(parts[1]), right: g - parseInt(parts[2]) }
    }
    if (eq.match(/^\d+x = \d+$/)) {
      const coeff = parseInt(eq.match(/^(\d+)x/)[1])
      return { left: coeff * g, right: parseInt(eq.match(/= (\d+)$/)[1]) }
    }
    return { left: g, right: t.answer }
  }

  const { left: leftVal, right: rightVal } = computeValues(task, guess)
  const isBalanced = leftVal === rightVal

  function handleConfirm() {
    if (!isBalanced) return
    setConfirmed(true)
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)

    if (task.ahaId && !mState.ahaMoments.includes(task.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'navigation', missionId: '1', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < BALANCE_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < BALANCE_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    const next = taskIndex + 1
    setTaskIndex(next)
    setGuess(0)
    setConfirmed(false)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'navigation', missionId: '1' })
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
        🧭 MISSION 1
      </div>

      <NeonText as="h2" color="yellow" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        平衡推进器
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
            ? '🎉 All thrusters balanced! Navigation online.'
            : `Find the value of x that balances the equation.`
          }
        </p>
      </div>

      {!completed && (
        <>
          {/* Equation display */}
          <div style={{
            fontSize: 'clamp(18px, 4.5vw, 26px)', fontWeight: 900,
            color: 'var(--neon-yellow)', marginBottom: 16,
            textShadow: '0 0 10px var(--neon-yellow), 0 0 30px rgba(255,230,0,0.3)',
            fontFamily: 'var(--font-display)', letterSpacing: 2,
          }}>
            {task?.equation}
          </div>

          {/* Balance beam */}
          <div className="glass-panel" style={{
            padding: 'clamp(14px, 3vw, 20px)', maxWidth: 500, width: '100%', marginBottom: 20,
          }}>
            <BalanceBeam
              leftLabel={task?.leftLabel}
              rightLabel={task?.rightLabel}
              leftValue={leftVal}
              rightValue={rightVal}
              guess={guess}
            />
          </div>

          {/* Slider for x */}
          <div style={{ maxWidth: 400, width: '100%', padding: '0 16px', marginBottom: 20 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                x =
              </span>
              <span style={{
                fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900,
                color: isBalanced ? 'var(--neon-green)' : 'var(--neon-yellow)',
                fontFamily: 'var(--font-display)',
                transition: 'color 0.3s',
              }}>
                {guess}
              </span>
            </div>
            <input
              type="range"
              min={task?.min || 0}
              max={task?.max || 10}
              value={guess}
              onChange={e => { if (!confirmed) setGuess(parseInt(e.target.value)) }}
              disabled={confirmed}
              style={{
                width: '100%', height: 8, appearance: 'none', background: 'rgba(255,255,255,0.1)',
                borderRadius: 4, outline: 'none', cursor: confirmed ? 'default' : 'pointer',
                accentColor: 'var(--neon-yellow)',
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4,
            }}>
              <span>{task?.min || 0}</span>
              <span>{task?.max || 10}</span>
            </div>
          </div>

          {/* Confirm button */}
          {isBalanced && !confirmed && (
            <NeonButton onClick={handleConfirm} color="green" size="small">
              Confirm Balance ✓
            </NeonButton>
          )}
        </>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: completed ? 0 : 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Thruster Calibration</span>
          <span>{tasksCompleted}/{BALANCE_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={BALANCE_TASKS.length} color="yellow" />
      </div>

      {/* Guide */}
      {!completed && !confirmed && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-yellow)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.hint || 'Drag the slider to adjust x until the thrusters balance.'}
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
