import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const FACTOR_TASKS = [
  {
    b: 5, c: 6,
    display: 'x\u00B2 + 5x + 6',
    p: 2, q: 3,
    factored: '(x + 2)(x + 3)',
    hint: 'Find two numbers that add to 5 and multiply to 6. Try small positive numbers.',
    ahaId: 'factor_concept',
    ahaTitle: 'What Is Factoring?',
    ahaDesc: 'Factoring means finding (x+p)(x+q) that multiplies out to x\u00B2+bx+c. It\u2019s like reverse multiplication!',
  },
  {
    b: 7, c: 12,
    display: 'x\u00B2 + 7x + 12',
    p: 3, q: 4,
    factored: '(x + 3)(x + 4)',
    hint: 'Two numbers that add to 7 and multiply to 12. Think of factor pairs of 12.',
    ahaId: 'sum_product',
    ahaTitle: 'The Sum-Product Trick',
    ahaDesc: 'The trick: find two numbers whose SUM equals b and whose PRODUCT equals c. For x\u00B2+7x+12: 3+4=7 and 3\u00D74=12!',
  },
  {
    b: -5, c: 6,
    display: 'x\u00B2 \u2212 5x + 6',
    p: -2, q: -3,
    factored: '(x \u2212 2)(x \u2212 3)',
    hint: 'The product is positive but the sum is negative. Both numbers must be negative!',
    ahaId: null,
  },
  {
    b: 1, c: -6,
    display: 'x\u00B2 + x \u2212 6',
    p: 3, q: -2,
    factored: '(x + 3)(x \u2212 2)',
    hint: 'The product is negative, so one number is positive and one is negative. Their sum is 1.',
    ahaId: 'negative_factors',
    ahaTitle: 'Mixed-Sign Factors',
    ahaDesc: 'When c is negative, one factor is positive and the other is negative. Their product is negative but their sum determines b.',
  },
  {
    b: -1, c: -12,
    display: 'x\u00B2 \u2212 x \u2212 12',
    p: -4, q: 3,
    factored: '(x \u2212 4)(x + 3)',
    hint: 'Product is \u221212 (mixed signs). The sum is \u22121, so the negative number has greater magnitude.',
    ahaId: null,
  },
  {
    b: 0, c: -9,
    display: 'x\u00B2 \u2212 9',
    p: 3, q: -3,
    factored: '(x + 3)(x \u2212 3)',
    hint: 'There is no middle term! Two numbers that multiply to \u22129 and add to 0 must be opposites.',
    ahaId: 'difference_of_squares',
    ahaTitle: 'Difference of Squares',
    ahaDesc: 'x\u00B2\u22129 = x\u00B2\u22123\u00B2 = (x+3)(x\u22123). This is the difference of squares pattern \u2014 no middle term because +3 and \u22123 cancel!',
  },
]

// ─── Number Picker ──────────────────────────────────────────
function NumberPicker({ label, value, onChange, disabled }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <div style={{
        fontSize: 13, letterSpacing: 2, color: 'rgba(255,255,255,0.4)',
        fontFamily: 'var(--font-display)',
      }}>
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button
          onClick={() => onChange(Math.max(-10, value - 1))}
          disabled={disabled || value <= -10}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--glass)', border: '2px solid rgba(57,255,20,0.3)',
            color: 'var(--neon-green)', fontSize: 20, fontWeight: 900,
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: 'var(--font-display)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: disabled || value <= -10 ? 0.3 : 1,
            transition: 'all 0.2s',
          }}
        >
          -
        </button>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: 'var(--glass)', border: '2px solid rgba(57,255,20,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900,
          color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
          textShadow: '0 0 8px rgba(57,255,20,0.4)',
          transition: 'all 0.2s',
        }}>
          {value}
        </div>
        <button
          onClick={() => onChange(Math.min(10, value + 1))}
          disabled={disabled || value >= 10}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--glass)', border: '2px solid rgba(57,255,20,0.3)',
            color: 'var(--neon-green)', fontSize: 20, fontWeight: 900,
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: 'var(--font-display)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: disabled || value >= 10 ? 0.3 : 1,
            transition: 'all 0.2s',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────
export default function Mission2_Factor({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [p, setP] = useState(0)
  const [q, setQ] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.launch.missions['2']
  const task = FACTOR_TASKS[taskIndex]

  const currentSum = p + q
  const currentProduct = p * q
  const sumMatch = currentSum === task.b
  const productMatch = currentProduct === task.c
  const isSolved = sumMatch && productMatch

  // Format a factor term for display: (x+p) or (x-|p|)
  function formatFactor(val) {
    if (val === 0) return 'x'
    if (val > 0) return `x + ${val}`
    return `x \u2212 ${Math.abs(val)}`
  }

  function handleSubmit() {
    if (confirmed) return
    if (!isSolved) {
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      return
    }

    setConfirmed(true)
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)

    if (task.ahaId && !mState.ahaMoments.includes(task.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'launch', missionId: '2', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < FACTOR_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < FACTOR_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    const next = taskIndex + 1
    setTaskIndex(next)
    setP(0)
    setQ(0)
    setConfirmed(false)
    setShaking(false)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'launch', missionId: '2' })
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
        🚀 MISSION 2
      </div>

      <NeonText as="h2" color="green" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        结构完整性
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
            ? '🎉 Hull integrity restored! All quadratics factored.'
            : 'Factor the quadratic by finding p and q such that (x+p)(x+q) matches.'
          }
        </p>
      </div>

      {!completed && (
        <>
          {/* Expression display */}
          <div
            className="glass-panel"
            style={{
              padding: 'clamp(16px, 3vw, 24px)', maxWidth: 500, width: '100%',
              marginBottom: 20, textAlign: 'center',
              animation: shaking ? 'shake 0.4s' : 'none',
            }}
          >
            <div style={{ ...meterLabel, marginBottom: 8 }}>
              STRUCTURAL SCAN {taskIndex + 1}/{FACTOR_TASKS.length}
            </div>
            <div style={{
              fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900,
              color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
              textShadow: '0 0 10px var(--neon-green), 0 0 30px rgba(57,255,20,0.3)',
              letterSpacing: 2,
            }}>
              {task?.display}
            </div>

            {/* Factored form preview */}
            <div style={{
              fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
              color: isSolved ? 'var(--neon-green)' : 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-display)', marginTop: 12,
              letterSpacing: 1, transition: 'color 0.3s',
            }}>
              = ({formatFactor(p)})({formatFactor(q)})
            </div>

            {/* Solved flash */}
            {confirmed && (
              <div style={{
                marginTop: 12, fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900,
                color: 'var(--neon-green)',
                textShadow: '0 0 15px var(--neon-green)',
                fontFamily: 'var(--font-display)',
              }}>
                {task?.factored}
              </div>
            )}
          </div>

          {/* Number pickers */}
          <div style={{
            display: 'flex', gap: 'clamp(20px, 5vw, 40px)',
            marginBottom: 20, justifyContent: 'center',
          }}>
            <NumberPicker label="p" value={p} onChange={setP} disabled={confirmed} />
            <NumberPicker label="q" value={q} onChange={setQ} disabled={confirmed} />
          </div>

          {/* Live sum/product display */}
          <div className="glass-panel" style={{
            padding: 'clamp(14px, 2vw, 16px)', maxWidth: 400, width: '100%',
            marginBottom: 20,
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
            }}>
              {/* Sum check */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...meterLabel, marginBottom: 6 }}>SUM (p + q)</div>
                <div style={{
                  fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: sumMatch ? 'var(--neon-green)' : 'var(--neon-pink)',
                  transition: 'color 0.3s',
                }}>
                  {currentSum}
                </div>
                <div style={{
                  fontSize: 13, color: sumMatch ? 'var(--neon-green)' : 'rgba(255,255,255,0.3)',
                  marginTop: 4, letterSpacing: 1, transition: 'color 0.3s',
                }}>
                  need {task.b}
                  {sumMatch ? ' \u2713' : ''}
                </div>
              </div>

              {/* Product check */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...meterLabel, marginBottom: 6 }}>PRODUCT (p \u00D7 q)</div>
                <div style={{
                  fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: productMatch ? 'var(--neon-green)' : 'var(--neon-pink)',
                  transition: 'color 0.3s',
                }}>
                  {currentProduct}
                </div>
                <div style={{
                  fontSize: 13, color: productMatch ? 'var(--neon-green)' : 'rgba(255,255,255,0.3)',
                  marginTop: 4, letterSpacing: 1, transition: 'color 0.3s',
                }}>
                  need {task.c}
                  {productMatch ? ' \u2713' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          {!confirmed && (
            <NeonButton
              onClick={handleSubmit}
              color={isSolved ? 'green' : 'green'}
              size="small"
              style={{ opacity: isSolved ? 1 : 0.6 }}
            >
              {isSolved ? 'Confirm Factor \u2713' : 'Check Factor'}
            </NeonButton>
          )}

          {/* Shake feedback text */}
          {shaking && (
            <div style={{
              color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2,
              marginTop: 8, textAlign: 'center',
            }}>
              \u26A0 STRUCTURAL MISMATCH \u2014 sum or product incorrect
            </div>
          )}
        </>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: completed ? 0 : 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Hull Integrity</span>
          <span>{tasksCompleted}/{FACTOR_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={FACTOR_TASKS.length} color="green" />
      </div>

      {/* Guide / hint */}
      {!completed && !confirmed && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-green)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.hint || 'Adjust p and q until the sum and product match the targets.'}
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
