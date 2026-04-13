import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// ─── Task Data ───────────────────────────────────────────────
const GRID_TASKS = [
  // ── Commutative ──
  {
    type: 'commutative', label: 'GRID SECTOR A', ahaId: null,
    left: { expr: '3 + 5', result: 8 },
    right: { expr: '5 + 3', result: 8 },
    choices: [8, 2, 15, 6],
  },
  {
    type: 'commutative', label: 'GRID SECTOR B',
    ahaId: 'commutative',
    ahaTitle: 'Commutative Law',
    ahaDesc: 'The order of numbers doesn\'t matter for addition or multiplication. a + b = b + a, a × b = b × a. The circuit works either way!',
    left: { expr: '4 × 7', result: 28 },
    right: { expr: '7 × 4', result: 28 },
    choices: [28, 11, 47, 21],
  },
  // ── Associative ──
  {
    type: 'associative', label: 'GRID SECTOR C', ahaId: null,
    numbers: [2, 3, 4], op: '+',
    pathA: { groupExpr: '2 + 3', step1: 5, finalExpr: '5 + 4', step2: 9 },
    pathB: { groupExpr: '3 + 4', step1: 7, finalExpr: '2 + 7', step2: 9 },
    chips: [5, 7, 9, 6, 4, 12],
  },
  {
    type: 'associative', label: 'GRID SECTOR D',
    ahaId: 'associative',
    ahaTitle: 'Associative Law',
    ahaDesc: 'How you group numbers doesn\'t change the result. (a + b) + c = a + (b + c). The power flows the same regardless of grouping!',
    numbers: [2, 3, 5], op: '×',
    pathA: { groupExpr: '2 × 3', step1: 6, finalExpr: '6 × 5', step2: 30 },
    pathB: { groupExpr: '3 × 5', step1: 15, finalExpr: '2 × 15', step2: 30 },
    chips: [6, 15, 30, 10, 8, 25],
  },
  // ── Distributive ──
  {
    type: 'distributive', label: 'GRID SECTOR E',
    ahaId: 'distributive',
    ahaTitle: 'Distributive Law',
    ahaDesc: 'Multiplication distributes over addition: a × (b + c) = a × b + a × c. One big circuit equals two smaller ones combined!',
    whole: { expr: '3 × (4 + 2)', result: 18 },
    parts: { a: 12, b: 6, result: 18 },
    dims: { w: 3, h1: 4, h2: 2 },
    slots: [3, 4, 3, 2, 18],
    chips: [3, 4, 2, 12, 6, 18, 8, 5],
  },
  {
    type: 'distributive', label: 'GRID SECTOR F',
    ahaId: 'area_model',
    ahaTitle: 'Area Model',
    ahaDesc: 'The distributive law IS area! A rectangle of width w and height (a + b) has the same area as two rectangles: w × a + w × b. Math is geometry!',
    whole: { expr: '5 × (3 + 1)', result: 20 },
    parts: { a: 15, b: 5, result: 20 },
    dims: { w: 5, h1: 3, h2: 1 },
    slots: [5, 3, 5, 1, 20],
    chips: [5, 3, 1, 15, 20, 4, 8, 10],
  },
]

// ─── Shared Styles & Components ─────────────────────────────
const panelStyle = {
  background: 'var(--glass)', border: '1px solid var(--glass-border)',
  borderRadius: 12, padding: 'clamp(14px, 3vw, 20px)', textAlign: 'center',
  transition: 'all 0.3s',
}

const exprStyle = {
  fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700,
  fontFamily: 'var(--font-display)', color: '#fff', marginBottom: 8,
}

const resultStyle = {
  fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900,
  fontFamily: 'var(--font-display)',
  transition: 'all 0.3s',
}

const meterLabel = {
  fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 4,
}

function NumberChip({ value, onClick, disabled, flash }) {
  return (
    <button
      onClick={() => !disabled && onClick(value)}
      style={{
        minWidth: 48, minHeight: 48, padding: '8px 14px',
        fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 700,
        fontFamily: 'var(--font-display)',
        background: disabled ? 'rgba(255,255,255,0.03)' : 'var(--glass)',
        border: flash ? '2px solid var(--neon-pink)' : '2px solid rgba(0,240,255,0.3)',
        borderRadius: 10, cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'rgba(255,255,255,0.15)' : 'var(--neon-cyan)',
        transition: 'all 0.2s',
        animation: flash ? 'shake 0.4s' : 'none',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {value}
    </button>
  )
}

function BlankSlot({ value, active, correct, onClick }) {
  const filled = value !== null
  return (
    <button
      onClick={onClick}
      style={{
        minWidth: 44, minHeight: 44, padding: '6px 12px',
        fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 700,
        fontFamily: 'var(--font-display)',
        background: active ? 'rgba(0,240,255,0.1)' : filled ? 'rgba(57,255,20,0.08)' : 'transparent',
        border: active ? '2px solid var(--neon-cyan)' : filled ? '2px solid var(--neon-green)' : '2px dashed rgba(255,255,255,0.25)',
        borderRadius: 8, cursor: filled && !active ? 'default' : 'pointer',
        color: filled ? 'var(--neon-green)' : 'rgba(255,255,255,0.3)',
        transition: 'all 0.2s',
        boxShadow: active ? '0 0 12px rgba(0,240,255,0.3)' : 'none',
      }}
    >
      {filled ? value : '?'}
    </button>
  )
}

// ─── Commutative Puzzle: Predict + Verify ────────────────────
function CommutativeTask({ task, onComplete }) {
  const [prediction, setPrediction] = useState(null) // 'same' | 'different'
  const [predCorrect, setPredCorrect] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [wrongPred, setWrongPred] = useState(0)
  const [wrongChip, setWrongChip] = useState(null)
  const [done, setDone] = useState(false)

  function handlePredict(guess) {
    const correct = guess === 'same'
    setPrediction(guess)
    if (correct) {
      setPredCorrect(true)
    } else {
      setPredCorrect(false)
      setWrongPred(p => p + 1)
      setTimeout(() => { setPrediction(null); setPredCorrect(null) }, 800)
    }
  }

  function handleChoose(val) {
    if (val === task.right.result) {
      setSelectedAnswer(val)
      setDone(true)
      setTimeout(() => onComplete(), 600)
    } else {
      setWrongChip(val)
      setTimeout(() => setWrongChip(null), 600)
    }
  }

  return (
    <div>
      {/* Two circuit panels */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 2vw, 16px)',
        maxWidth: 500, margin: '0 auto 20px',
      }}>
        <div style={{ ...panelStyle, borderColor: 'var(--neon-green)' }}>
          <div style={meterLabel}>CIRCUIT A</div>
          <div style={exprStyle}>{task.left.expr}</div>
          <div style={{ ...resultStyle, color: 'var(--neon-green)' }}>= {task.left.result}</div>
        </div>
        <div style={{
          ...panelStyle,
          borderColor: done ? 'var(--neon-green)' : predCorrect ? 'var(--neon-cyan)' : undefined,
        }}>
          <div style={meterLabel}>CIRCUIT B</div>
          <div style={exprStyle}>{task.right.expr}</div>
          {done ? (
            <div style={{ ...resultStyle, color: 'var(--neon-green)' }}>= {task.right.result}</div>
          ) : (
            <div style={{ ...resultStyle, color: 'rgba(255,255,255,0.2)' }}>= ?</div>
          )}
        </div>
      </div>

      {/* Phase 1: Prediction */}
      {!predCorrect && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)', color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--font-body)', marginBottom: 14,
          }}>
            Will Circuit B produce the same output?
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={() => handlePredict('same')}
              style={{
                padding: '12px 28px', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-display)', borderRadius: 10, cursor: 'pointer',
                background: prediction === 'same' && !predCorrect ? 'rgba(255,45,149,0.15)' : 'var(--glass)',
                border: prediction === 'same' && predCorrect === false
                  ? '2px solid var(--neon-pink)' : '2px solid rgba(57,255,20,0.4)',
                color: 'var(--neon-green)',
                animation: prediction === 'same' && predCorrect === false ? 'shake 0.4s' : 'none',
              }}
            >
              SAME
            </button>
            <button
              onClick={() => handlePredict('different')}
              style={{
                padding: '12px 28px', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-display)', borderRadius: 10, cursor: 'pointer',
                background: prediction === 'different' && !predCorrect ? 'rgba(255,45,149,0.15)' : 'var(--glass)',
                border: prediction === 'different' && predCorrect === false
                  ? '2px solid var(--neon-pink)' : '2px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                animation: prediction === 'different' && predCorrect === false ? 'shake 0.4s' : 'none',
              }}
            >
              DIFFERENT
            </button>
          </div>
          {wrongPred >= 2 && (
            <div style={{
              marginTop: 10, fontSize: 13, color: 'var(--neon-cyan)', opacity: 0.7,
              fontFamily: 'var(--font-body)',
            }}>
              Hint: Does swapping the order of addition or multiplication change the result?
            </div>
          )}
        </div>
      )}

      {/* Phase 2: Pick the value */}
      {predCorrect && !done && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 14, color: 'var(--neon-green)', letterSpacing: 2, marginBottom: 14,
            fontFamily: 'var(--font-body)',
          }}>
            Correct! Now compute the output of Circuit B:
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            {task.choices.map(c => (
              <NumberChip
                key={c} value={c}
                onClick={handleChoose}
                flash={wrongChip === c}
                disabled={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Done feedback */}
      {done && (
        <div style={{
          textAlign: 'center', marginTop: 16,
          color: 'var(--neon-green)', fontSize: 15, fontWeight: 700,
          fontFamily: 'var(--font-display)', letterSpacing: 2,
        }}>
          Both circuits output {task.left.result}!
        </div>
      )}
    </div>
  )
}

// ─── Associative Puzzle: Fill Computation Paths ──────────────
function AssociativeTask({ task, onComplete }) {
  const [activeSlot, setActiveSlot] = useState(0)
  const [filled, setFilled] = useState([null, null, null, null])
  const [wrongChip, setWrongChip] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [done, setDone] = useState(false)

  const correctValues = [task.pathA.step1, task.pathA.step2, task.pathB.step1, task.pathB.step2]
  const usedChips = filled.filter(v => v !== null)

  function handleChipClick(val) {
    if (done) return
    if (val === correctValues[activeSlot]) {
      const newFilled = [...filled]
      newFilled[activeSlot] = val
      setFilled(newFilled)
      setWrongCount(0)

      if (activeSlot < 3) {
        setActiveSlot(activeSlot + 1)
      } else {
        setDone(true)
        setTimeout(() => onComplete(), 800)
      }
    } else {
      setWrongChip(val)
      setWrongCount(p => p + 1)
      setTimeout(() => setWrongChip(null), 600)
    }
  }

  const { numbers, op } = task
  const slotLabels = [
    { path: 'A', desc: `${task.pathA.groupExpr} = ?` },
    { path: 'A', desc: filled[0] !== null ? `${task.pathA.finalExpr.replace(String(task.pathA.step1), String(filled[0]))} = ?` : '? = ?' },
    { path: 'B', desc: `${task.pathB.groupExpr} = ?` },
    { path: 'B', desc: filled[2] !== null ? `${task.pathB.finalExpr.replace(String(task.pathB.step1), String(filled[2]))} = ?` : '? = ?' },
  ]

  const hintTexts = [
    `Compute the parentheses first: ${task.pathA.groupExpr} = ?`,
    `Now compute: ${task.pathA.finalExpr} = ?`,
    `Compute the other grouping: ${task.pathB.groupExpr} = ?`,
    `Now compute: ${task.pathB.finalExpr} = ?`,
  ]

  return (
    <div>
      {/* Header: the three numbers */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={meterLabel}>ROUTE THE POWER</div>
        <div style={{
          fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900,
          fontFamily: 'var(--font-display)', color: '#fff',
        }}>
          {numbers[0]} {op} {numbers[1]} {op} {numbers[2]}
        </div>
      </div>

      {/* Two paths side by side */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 2vw, 16px)',
        maxWidth: 500, margin: '0 auto 20px',
      }}>
        {/* Path A */}
        <div style={{
          ...panelStyle,
          borderColor: filled[1] !== null ? 'var(--neon-green)' : activeSlot <= 1 ? 'var(--neon-cyan)' : undefined,
        }}>
          <div style={meterLabel}>PATH A</div>
          <div style={{
            fontSize: 'clamp(13px, 2.5vw, 15px)', color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-display)', marginBottom: 10,
          }}>
            ({numbers[0]} {op} {numbers[1]}) {op} {numbers[2]}
          </div>

          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{task.pathA.groupExpr} =</span>
            <BlankSlot value={filled[0]} active={activeSlot === 0} onClick={() => filled[0] === null && setActiveSlot(0)} />
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {filled[0] !== null ? filled[0] : '?'} {op} {numbers[2]} =
            </span>
            <BlankSlot value={filled[1]} active={activeSlot === 1} onClick={() => filled[0] !== null && filled[1] === null && setActiveSlot(1)} />
          </div>
        </div>

        {/* Path B */}
        <div style={{
          ...panelStyle,
          borderColor: filled[3] !== null ? 'var(--neon-green)' : activeSlot >= 2 ? 'var(--neon-cyan)' : undefined,
        }}>
          <div style={meterLabel}>PATH B</div>
          <div style={{
            fontSize: 'clamp(13px, 2.5vw, 15px)', color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-display)', marginBottom: 10,
          }}>
            {numbers[0]} {op} ({numbers[1]} {op} {numbers[2]})
          </div>

          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{task.pathB.groupExpr} =</span>
            <BlankSlot value={filled[2]} active={activeSlot === 2} onClick={() => filled[1] !== null && filled[2] === null && setActiveSlot(2)} />
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {numbers[0]} {op} {filled[2] !== null ? filled[2] : '?'} =
            </span>
            <BlankSlot value={filled[3]} active={activeSlot === 3} onClick={() => filled[2] !== null && filled[3] === null && setActiveSlot(3)} />
          </div>
        </div>
      </div>

      {/* Chips */}
      {!done && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {task.chips.map((c, i) => (
            <NumberChip
              key={`${c}-${i}`} value={c}
              onClick={handleChipClick}
              flash={wrongChip === c}
              disabled={false}
            />
          ))}
        </div>
      )}

      {/* Hint on repeated wrong */}
      {!done && wrongCount >= 2 && (
        <div style={{
          textAlign: 'center', fontSize: 13, color: 'var(--neon-cyan)', opacity: 0.7,
          fontFamily: 'var(--font-body)', marginTop: 4,
        }}>
          Hint: {hintTexts[activeSlot]}
        </div>
      )}

      {/* Done: both paths equal */}
      {done && (
        <div style={{
          textAlign: 'center', marginTop: 8,
          fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 700,
          fontFamily: 'var(--font-display)', color: 'var(--neon-green)', letterSpacing: 2,
        }}>
          Both paths → {filled[1]}! Same result!
        </div>
      )}
    </div>
  )
}

// ─── Distributive Puzzle: Equation Builder + Area Model ──────
function DistributiveTask({ task, onComplete }) {
  const [activeSlot, setActiveSlot] = useState(0)
  const [filled, setFilled] = useState([null, null, null, null, null])
  const [wrongChip, setWrongChip] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [done, setDone] = useState(false)

  const { w, h1, h2 } = task.dims
  const cellSize = 'clamp(24px, 5vw, 36px)'

  // Which area sections are "lit up"
  const topLit = filled[0] !== null && filled[1] !== null
  const bottomLit = filled[2] !== null && filled[3] !== null

  function handleChipClick(val) {
    if (done) return
    if (val === task.slots[activeSlot]) {
      const newFilled = [...filled]
      newFilled[activeSlot] = val
      setFilled(newFilled)
      setWrongCount(0)

      if (activeSlot < 4) {
        setActiveSlot(activeSlot + 1)
      }
      if (activeSlot === 4) {
        setDone(true)
        setTimeout(() => onComplete(), 800)
      }
    } else {
      setWrongChip(val)
      setWrongCount(p => p + 1)
      setTimeout(() => setWrongChip(null), 600)
    }
  }

  const hintTexts = [
    `The width of the whole rectangle is ${w}`,
    `The top section has height ${h1}`,
    `The width stays the same: ${w}`,
    `The bottom section has height ${h2}`,
    `Add the two areas: ${task.parts.a} + ${task.parts.b} = ?`,
  ]

  return (
    <div>
      {/* Expression at top */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={meterLabel}>SPLIT THE POWER GRID</div>
        <div style={exprStyle}>{task.whole.expr} = {task.whole.result}</div>
      </div>

      {/* Area model rectangle */}
      <div style={{
        maxWidth: 'clamp(200px, 55vw, 340px)', margin: '0 auto 20px',
      }}>
        {/* Top section */}
        <div style={{
          ...panelStyle, padding: 0, overflow: 'hidden', borderRadius: '12px 12px 0 0',
          borderColor: topLit ? 'var(--neon-green)' : 'var(--glass-border)',
          background: topLit ? 'rgba(57,255,20,0.04)' : 'var(--glass)',
          borderBottom: 'none',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${w}, ${cellSize})`,
            gridTemplateRows: `repeat(${h1}, ${cellSize})`,
            gap: 1, justifyContent: 'center', padding: 8,
          }}>
            {Array.from({ length: w * h1 }).map((_, i) => (
              <div key={i} style={{
                background: topLit ? 'rgba(57,255,20,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${topLit ? 'rgba(57,255,20,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 3,
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          {topLit && (
            <div style={{
              padding: '6px', textAlign: 'center',
              fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 700,
              color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
            }}>
              {w} × {h1} = {task.parts.a}
            </div>
          )}
        </div>

        {/* Dividing line */}
        <div style={{
          borderTop: '2px dashed rgba(255,230,0,0.4)',
          margin: '0',
        }} />

        {/* Bottom section */}
        <div style={{
          ...panelStyle, padding: 0, overflow: 'hidden', borderRadius: '0 0 12px 12px',
          borderColor: bottomLit ? 'var(--neon-yellow)' : 'var(--glass-border)',
          background: bottomLit ? 'rgba(255,230,0,0.04)' : 'var(--glass)',
          borderTop: 'none',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${w}, ${cellSize})`,
            gridTemplateRows: `repeat(${h2}, ${cellSize})`,
            gap: 1, justifyContent: 'center', padding: 8,
          }}>
            {Array.from({ length: w * h2 }).map((_, i) => (
              <div key={i} style={{
                background: bottomLit ? 'rgba(255,230,0,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${bottomLit ? 'rgba(255,230,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 3,
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          {bottomLit && (
            <div style={{
              padding: '6px', textAlign: 'center',
              fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 700,
              color: 'var(--neon-yellow)', fontFamily: 'var(--font-display)',
            }}>
              {w} × {h2} = {task.parts.b}
            </div>
          )}
        </div>
      </div>

      {/* Equation builder */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(3px, 1vw, 6px)', flexWrap: 'wrap', marginBottom: 16,
        fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700,
        fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.5)',
      }}>
        <BlankSlot value={filled[0]} active={activeSlot === 0} onClick={() => filled[0] === null && setActiveSlot(0)} />
        <span>×</span>
        <BlankSlot value={filled[1]} active={activeSlot === 1} onClick={() => filled[0] !== null && filled[1] === null && setActiveSlot(1)} />
        <span>+</span>
        <BlankSlot value={filled[2]} active={activeSlot === 2} onClick={() => filled[1] !== null && filled[2] === null && setActiveSlot(2)} />
        <span>×</span>
        <BlankSlot value={filled[3]} active={activeSlot === 3} onClick={() => filled[2] !== null && filled[3] === null && setActiveSlot(3)} />
        <span>=</span>
        <BlankSlot value={filled[4]} active={activeSlot === 4} onClick={() => filled[3] !== null && filled[4] === null && setActiveSlot(4)} />
      </div>

      {/* Chips */}
      {!done && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {task.chips.map((c, i) => (
            <NumberChip
              key={`${c}-${i}`} value={c}
              onClick={handleChipClick}
              flash={wrongChip === c}
              disabled={false}
            />
          ))}
        </div>
      )}

      {/* Hint on repeated wrong */}
      {!done && wrongCount >= 2 && (
        <div style={{
          textAlign: 'center', fontSize: 13, color: 'var(--neon-cyan)', opacity: 0.7,
          fontFamily: 'var(--font-body)', marginTop: 4,
        }}>
          Hint: {hintTexts[activeSlot]}
        </div>
      )}

      {/* Done */}
      {done && (
        <div style={{
          textAlign: 'center',
          fontSize: 'clamp(14px, 3vw, 17px)', fontWeight: 700,
          fontFamily: 'var(--font-display)', color: 'var(--neon-green)', letterSpacing: 2,
        }}>
          {task.parts.a} + {task.parts.b} = {task.parts.result} — Same area!
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function Mission3_PowerGrid({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.powercore.missions['3']
  const task = GRID_TASKS[taskIndex]

  function handleTaskComplete() {
    const t = GRID_TASKS[taskIndex]
    const newCompleted = tasksCompleted + 1
    setTasksCompleted(newCompleted)

    if (t.ahaId && !mState.ahaMoments.includes(t.ahaId)) {
      dispatch({ type: 'RECORD_AHA', systemId: 'powercore', missionId: '3', ahaId: t.ahaId })
      setAhaModal(t)
    } else if (taskIndex < GRID_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < GRID_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'powercore', missionId: '3' })
  }

  // Efficiency percentage
  const efficiency = Math.round((tasksCompleted / GRID_TASKS.length) * 100)

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
        ⚡ MISSION 3
      </div>

      <NeonText as="h2" color="cyan" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        配电优化
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
            ? '🎉 Power grid optimized! Station fully powered.'
            : 'Discover the algebraic properties that optimize the power grid.'
          }
        </p>
      </div>

      {/* Task label */}
      {!completed && (
        <div style={{
          fontSize: 12, letterSpacing: 3, color: 'var(--neon-yellow)',
          marginBottom: 16, opacity: 0.7,
        }}>
          {task?.label} — SECTOR {taskIndex + 1}/{GRID_TASKS.length}
        </div>
      )}

      {/* Task area */}
      {!completed && (
        <div style={{ maxWidth: 600, width: '100%', marginBottom: 20 }}>
          {task?.type === 'commutative' && (
            <CommutativeTask key={taskIndex} task={task} onComplete={handleTaskComplete} />
          )}
          {task?.type === 'associative' && (
            <AssociativeTask key={taskIndex} task={task} onComplete={handleTaskComplete} />
          )}
          {task?.type === 'distributive' && (
            <DistributiveTask key={taskIndex} task={task} onComplete={handleTaskComplete} />
          )}
        </div>
      )}

      {/* Efficiency meter */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Grid Efficiency</span>
          <span>{efficiency}%</span>
        </div>
        <ProgressBar value={tasksCompleted} max={GRID_TASKS.length} color="cyan" />
      </div>

      {/* Guide */}
      {!completed && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-cyan)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          {task?.type === 'commutative' && 'Predict whether swapping the order changes the output, then verify by computing.'}
          {task?.type === 'associative' && 'Fill in both computation paths step by step. Pick the correct value for each blank from the chips below.'}
          {task?.type === 'distributive' && 'Build the expanded equation by filling each blank. Watch the area model light up as you go!'}
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
