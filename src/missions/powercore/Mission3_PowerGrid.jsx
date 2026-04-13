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
    original: { expr: '3 + 5', result: 8 },
    swapped: { expr: '5 + 3', result: 8 },
    sameResult: true,
    choices: [8, 2, 15, 6],
  },
  {
    type: 'commutative', label: 'GRID SECTOR B',
    ahaId: 'commutative',
    ahaTitle: 'Commutative Law',
    ahaDesc: 'The order of numbers doesn\'t matter for addition or multiplication. a + b = b + a, a × b = b × a. The circuit works either way!',
    original: { expr: '4 × 7', result: 28 },
    swapped: { expr: '7 × 4', result: 28 },
    sameResult: true,
    choices: [28, 11, 3, 47],
  },
  // ── Associative ──
  {
    type: 'associative', label: 'GRID SECTOR C', ahaId: null,
    numbers: [2, 3, 4], op: '+',
    pathA: { groupExpr: '(2 + 3)', step1: 5, step2Expr: '5 + 4', step2: 9 },
    pathB: { groupExpr: '(3 + 4)', step1: 7, step2Expr: '2 + 7', step2: 9 },
    chips: [5, 7, 9, 6, 4, 12],
  },
  {
    type: 'associative', label: 'GRID SECTOR D',
    ahaId: 'associative',
    ahaTitle: 'Associative Law',
    ahaDesc: 'How you group numbers doesn\'t change the result. (a + b) + c = a + (b + c). The power flows the same regardless of grouping!',
    numbers: [2, 3, 5], op: '×',
    pathA: { groupExpr: '(2 × 3)', step1: 6, step2Expr: '6 × 5', step2: 30 },
    pathB: { groupExpr: '(3 × 5)', step1: 15, step2Expr: '2 × 15', step2: 30 },
    chips: [6, 15, 30, 10, 8, 25],
  },
  // ── Distributive ──
  {
    type: 'distributive', label: 'GRID SECTOR E',
    ahaId: 'distributive',
    ahaTitle: 'Distributive Law',
    ahaDesc: 'Multiplication distributes over addition: a × (b + c) = a × b + a × c. One big circuit equals two smaller ones combined!',
    whole: { expr: '3 × (4 + 2)', result: 18 },
    dims: { w: 3, h1: 4, h2: 2 },
    slots: [3, 4, 3, 2, 18],
    parts: { a: 12, b: 6 },
    chips: [3, 4, 2, 12, 6, 18, 5, 8],
  },
  {
    type: 'distributive', label: 'GRID SECTOR F',
    ahaId: 'area_model',
    ahaTitle: 'Area Model',
    ahaDesc: 'The distributive law IS area! A rectangle of width w and height (a + b) has the same area as two rectangles: w × a + w × b. Math is geometry!',
    whole: { expr: '5 × (3 + 1)', result: 20 },
    dims: { w: 5, h1: 3, h2: 1 },
    slots: [5, 3, 5, 1, 20],
    parts: { a: 15, b: 5 },
    chips: [5, 3, 1, 15, 20, 4, 8, 10],
  },
]

// ─── Shared Styles ───────────────────────────────────────────
const meterLabel = {
  fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 4,
}

const chipStyle = (active, wrong) => ({
  minWidth: 44, minHeight: 44, padding: '8px 14px',
  fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700,
  fontFamily: 'var(--font-display)',
  background: wrong ? 'rgba(255,45,149,0.15)' : active ? 'rgba(0,240,255,0.15)' : 'var(--glass)',
  border: `2px solid ${wrong ? 'var(--neon-pink)' : active ? 'var(--neon-cyan)' : 'var(--glass-border)'}`,
  borderRadius: 10, cursor: 'pointer',
  color: wrong ? 'var(--neon-pink)' : '#fff',
  transition: 'all 0.2s',
  animation: wrong ? 'shake 0.4s' : 'none',
})

const slotStyle = (filled, active, correct) => ({
  minWidth: 44, minHeight: 44, padding: '6px 12px',
  fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700,
  fontFamily: 'var(--font-display)',
  background: correct ? 'rgba(57,255,20,0.1)' : active ? 'rgba(0,240,255,0.08)' : 'var(--glass)',
  border: `2px ${filled ? 'solid' : 'dashed'} ${correct ? 'var(--neon-green)' : active ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.2)'}`,
  borderRadius: 8, cursor: filled ? 'default' : 'pointer',
  color: correct ? 'var(--neon-green)' : filled ? '#fff' : 'rgba(255,255,255,0.3)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.2s',
})

const opSymbol = {
  fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700,
  color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)',
  display: 'inline-flex', alignItems: 'center', padding: '0 4px',
}

// ─── Commutative Puzzle: Predict + Verify ────────────────────
function CommutativeTask({ task, onComplete }) {
  const [prediction, setPrediction] = useState(null)
  const [predCorrect, setPredCorrect] = useState(null)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [choiceCorrect, setChoiceCorrect] = useState(false)
  const [wrongPredFlash, setWrongPredFlash] = useState(false)
  const [wrongChipIdx, setWrongChipIdx] = useState(null)
  const [wrongPredCount, setWrongPredCount] = useState(0)

  function handlePredict(guess) {
    const correct = (guess === 'same') === task.sameResult
    if (correct) {
      setPrediction(guess)
      setPredCorrect(true)
    } else {
      setWrongPredFlash(true)
      setWrongPredCount(prev => prev + 1)
      setTimeout(() => setWrongPredFlash(false), 600)
    }
  }

  function handleChoiceSelect(val, idx) {
    if (val === task.swapped.result) {
      setSelectedChoice(val)
      setChoiceCorrect(true)
    } else {
      setWrongChipIdx(idx)
      setTimeout(() => setWrongChipIdx(null), 500)
    }
  }

  const panelBase = {
    background: 'var(--glass)', border: '1px solid var(--glass-border)',
    borderRadius: 12, padding: 'clamp(14px, 3vw, 20px)', textAlign: 'center',
  }

  return (
    <div>
      <div style={{ ...meterLabel, marginBottom: 12, textAlign: 'center' }}>
        COMPARE CIRCUITS
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 2vw, 16px)',
        maxWidth: 500, margin: '0 auto 20px',
      }}>
        {/* Original circuit */}
        <div style={{ ...panelBase, borderColor: 'var(--neon-green)' }}>
          <div style={{ ...meterLabel }}>CIRCUIT A</div>
          <div style={{
            fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700,
            fontFamily: 'var(--font-display)', color: '#fff', marginBottom: 8,
          }}>
            {task.original.expr}
          </div>
          <div style={{
            fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900,
            fontFamily: 'var(--font-display)', color: 'var(--neon-green)',
          }}>
            = {task.original.result}
          </div>
        </div>

        {/* Swapped circuit */}
        <div style={{
          ...panelBase,
          borderColor: choiceCorrect ? 'var(--neon-green)' : 'var(--neon-cyan)',
        }}>
          <div style={{ ...meterLabel }}>CIRCUIT B</div>
          <div style={{
            fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700,
            fontFamily: 'var(--font-display)', color: '#fff', marginBottom: 8,
          }}>
            {task.swapped.expr}
          </div>
          <div style={{
            fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900,
            fontFamily: 'var(--font-display)',
            color: choiceCorrect ? 'var(--neon-green)' : 'rgba(0,240,255,0.6)',
          }}>
            {choiceCorrect ? `= ${task.swapped.result}` : '= ?'}
          </div>
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
                ...chipStyle(false, false),
                minWidth: 90,
                background: wrongPredFlash ? 'rgba(255,45,149,0.15)' : 'rgba(57,255,20,0.08)',
                borderColor: wrongPredFlash ? 'var(--neon-pink)' : 'rgba(57,255,20,0.4)',
                color: wrongPredFlash ? 'var(--neon-pink)' : 'var(--neon-green)',
                animation: wrongPredFlash ? 'shake 0.4s' : 'none',
              }}
            >
              SAME
            </button>
            <button
              onClick={() => handlePredict('different')}
              style={{
                ...chipStyle(false, false),
                minWidth: 90,
                background: 'rgba(255,45,149,0.08)',
                borderColor: 'rgba(255,45,149,0.4)',
                color: 'var(--neon-pink)',
              }}
            >
              DIFF
            </button>
          </div>
          {wrongPredFlash && (
            <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginTop: 10 }}>
              ⚠ ROUTING ERROR — reconsider
            </div>
          )}
          {wrongPredCount >= 2 && !wrongPredFlash && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10, fontFamily: 'var(--font-body)' }}>
              Hint: Does changing the order of addition or multiplication affect the result?
            </div>
          )}
        </div>
      )}

      {/* Phase 2: Pick the value */}
      {predCorrect && !choiceCorrect && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: 'var(--neon-green)', fontSize: 13, letterSpacing: 2, marginBottom: 12,
          }}>
            ✓ PREDICTION CORRECT
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)', color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--font-body)', marginBottom: 14,
          }}>
            Now compute: {task.swapped.expr} = ?
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            {task.choices.map((val, idx) => (
              <button
                key={idx}
                onClick={() => handleChoiceSelect(val, idx)}
                style={chipStyle(false, wrongChipIdx === idx)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Both phases done */}
      {choiceCorrect && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{
            color: 'var(--neon-green)', fontSize: 'clamp(14px, 3vw, 16px)',
            letterSpacing: 2, marginBottom: 6, fontFamily: 'var(--font-display)',
          }}>
            {task.original.result} = {task.swapped.result}
          </div>
          <div style={{
            color: 'var(--neon-green)', fontSize: 13, letterSpacing: 2, marginBottom: 14,
            fontFamily: 'var(--font-body)',
          }}>
            Same output — order doesn't matter!
          </div>
          <NeonButton onClick={onComplete} color="green" size="small">
            Confirm →
          </NeonButton>
        </div>
      )}
    </div>
  )
}

// ─── Associative Puzzle: Fill computation paths ──────────────
function AssociativeTask({ task, onComplete }) {
  const answers = [task.pathA.step1, task.pathA.step2, task.pathB.step1, task.pathB.step2]
  const [filled, setFilled] = useState([null, null, null, null])
  const [activeSlot, setActiveSlot] = useState(0)
  const [wrongChip, setWrongChip] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const allFilled = filled.every(v => v !== null)

  function handleChipClick(val) {
    if (allFilled) return
    if (val === answers[activeSlot]) {
      const next = [...filled]
      next[activeSlot] = val
      setFilled(next)
      setWrongCount(0)
      const nextSlot = next.findIndex((v, i) => i > activeSlot && v === null)
      if (nextSlot !== -1) setActiveSlot(nextSlot)
    } else {
      setWrongChip(val)
      setWrongCount(prev => prev + 1)
      setTimeout(() => setWrongChip(null), 500)
    }
  }

  const [a, b, c] = task.numbers

  const slotBox = (idx) => (
    <span
      onClick={() => !allFilled && filled[idx] === null && setActiveSlot(idx)}
      style={slotStyle(filled[idx] !== null, activeSlot === idx && !allFilled, filled[idx] !== null)}
    >
      {filled[idx] ?? '?'}
    </span>
  )

  return (
    <div>
      <div style={{ ...meterLabel, marginBottom: 12, textAlign: 'center' }}>
        COMPUTE BOTH PATHS
      </div>

      {/* Numbers display */}
      <div style={{
        textAlign: 'center', marginBottom: 16,
        fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900,
        fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', letterSpacing: 4,
      }}>
        {a} {task.op} {b} {task.op} {c}
      </div>

      {/* Two paths */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 2vw, 16px)',
        maxWidth: 500, margin: '0 auto 20px',
      }}>
        {/* Path A */}
        <div className="glass-panel" style={{
          padding: 'clamp(12px, 2vw, 16px)',
          borderColor: filled[1] !== null ? 'var(--neon-green)' : activeSlot <= 1 ? 'var(--neon-cyan)' : undefined,
        }}>
          <div style={{ ...meterLabel, marginBottom: 10 }}>PATH A</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Step 1</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={opSymbol}>{task.pathA.groupExpr} =</span>
              {slotBox(0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Step 2</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={opSymbol}>{filled[0] ?? '?'} {task.op} {c} =</span>
              {slotBox(1)}
            </div>
          </div>
        </div>

        {/* Path B */}
        <div className="glass-panel" style={{
          padding: 'clamp(12px, 2vw, 16px)',
          borderColor: filled[3] !== null ? 'var(--neon-green)' : activeSlot >= 2 ? 'var(--neon-cyan)' : undefined,
        }}>
          <div style={{ ...meterLabel, marginBottom: 10 }}>PATH B</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Step 1</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={opSymbol}>{task.pathB.groupExpr} =</span>
              {slotBox(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Step 2</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={opSymbol}>{a} {task.op} {filled[2] ?? '?'} =</span>
              {slotBox(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Chip row */}
      {!allFilled && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 8 }}>
            SELECT VALUE
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            {task.chips.map((val, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(val)}
                style={chipStyle(false, wrongChip === val)}
              >
                {val}
              </button>
            ))}
          </div>
          {wrongChip !== null && (
            <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginTop: 10 }}>
              ⚠ GROUPING ERROR
            </div>
          )}
          {wrongCount >= 2 && wrongChip === null && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10, fontFamily: 'var(--font-body)' }}>
              Hint: Compute the expression inside the parentheses first
            </div>
          )}
        </div>
      )}

      {/* Result comparison */}
      {allFilled && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900,
            fontFamily: 'var(--font-display)', color: 'var(--neon-green)',
            marginBottom: 6, letterSpacing: 2,
          }}>
            {filled[1]} = {filled[3]}
          </div>
          <div style={{
            color: 'var(--neon-green)', fontSize: 13, letterSpacing: 2, marginBottom: 14,
            fontFamily: 'var(--font-body)',
          }}>
            Both paths converge — grouping doesn't matter!
          </div>
          <NeonButton onClick={onComplete} color="green" size="small">
            Confirm →
          </NeonButton>
        </div>
      )}
    </div>
  )
}

// ─── Distributive Puzzle: Equation Builder + Area ────────────
function DistributiveTask({ task, onComplete }) {
  const [filled, setFilled] = useState([null, null, null, null, null])
  const [activeSlot, setActiveSlot] = useState(0)
  const [wrongChip, setWrongChip] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const allFilled = filled.every(v => v !== null)

  const part1Done = filled[0] !== null && filled[1] !== null
  const part2Done = filled[2] !== null && filled[3] !== null

  function handleChipClick(val) {
    if (allFilled) return
    if (val === task.slots[activeSlot]) {
      const next = [...filled]
      next[activeSlot] = val
      setFilled(next)
      setWrongCount(0)
      const nextSlot = next.findIndex((v, i) => i > activeSlot && v === null)
      if (nextSlot !== -1) setActiveSlot(nextSlot)
    } else {
      setWrongChip(val)
      setWrongCount(prev => prev + 1)
      setTimeout(() => setWrongChip(null), 500)
    }
  }

  const { w, h1, h2 } = task.dims
  const cellSize = 'clamp(24px, 5vw, 34px)'

  return (
    <div>
      <div style={{ ...meterLabel, marginBottom: 8, textAlign: 'center' }}>
        BUILD THE EXPANSION
      </div>

      {/* Original expression */}
      <div style={{
        textAlign: 'center', marginBottom: 14,
        fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700,
        fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)',
      }}>
        {task.whole.expr} = {task.whole.result}
      </div>

      {/* Area rectangle */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: 20,
      }}>
        {/* Top area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${w}, ${cellSize})`,
          gridTemplateRows: `repeat(${h1}, ${cellSize})`,
          gap: 1, padding: 4,
          background: part1Done ? 'rgba(57,255,20,0.06)' : 'transparent',
          border: `1px solid ${part1Done ? 'var(--neon-green)' : 'rgba(57,255,20,0.2)'}`,
          borderBottom: 'none', borderRadius: '8px 8px 0 0',
          transition: 'all 0.3s', position: 'relative',
        }}>
          {Array.from({ length: w * h1 }).map((_, i) => (
            <div key={i} style={{
              background: part1Done ? 'rgba(57,255,20,0.2)' : 'rgba(57,255,20,0.08)',
              border: '1px solid rgba(57,255,20,0.15)',
              borderRadius: 2, transition: 'all 0.3s',
            }} />
          ))}
          {part1Done && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 900, color: 'var(--neon-green)',
              fontFamily: 'var(--font-display)', pointerEvents: 'none',
            }}>
              {task.parts.a}
            </div>
          )}
        </div>

        {/* Bottom area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${w}, ${cellSize})`,
          gridTemplateRows: `repeat(${h2}, ${cellSize})`,
          gap: 1, padding: 4,
          background: part2Done ? 'rgba(255,230,0,0.06)' : 'transparent',
          border: `1px solid ${part2Done ? 'var(--neon-yellow)' : 'rgba(255,230,0,0.2)'}`,
          borderTop: '2px dashed rgba(255,230,0,0.4)',
          borderRadius: '0 0 8px 8px',
          transition: 'all 0.3s', position: 'relative',
        }}>
          {Array.from({ length: w * h2 }).map((_, i) => (
            <div key={i} style={{
              background: part2Done ? 'rgba(255,230,0,0.2)' : 'rgba(255,230,0,0.08)',
              border: '1px solid rgba(255,230,0,0.15)',
              borderRadius: 2, transition: 'all 0.3s',
            }} />
          ))}
          {part2Done && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 900, color: 'var(--neon-yellow)',
              fontFamily: 'var(--font-display)', pointerEvents: 'none',
            }}>
              {task.parts.b}
            </div>
          )}
        </div>

        {/* Dimension labels */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', width: '100%',
          maxWidth: `calc(${w} * ${cellSize} + 16px)`,
          fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4,
          fontFamily: 'var(--font-display)',
        }}>
          <span>w={w}</span>
          <span>h={h1}+{h2}</span>
        </div>
      </div>

      {/* Equation builder */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(2px, 1vw, 6px)', flexWrap: 'wrap', marginBottom: 16,
      }}>
        <span
          onClick={() => !allFilled && filled[0] === null && setActiveSlot(0)}
          style={slotStyle(filled[0] !== null, activeSlot === 0 && !allFilled, filled[0] !== null)}
        >
          {filled[0] ?? '?'}
        </span>
        <span style={opSymbol}>×</span>
        <span
          onClick={() => !allFilled && filled[1] === null && setActiveSlot(1)}
          style={slotStyle(filled[1] !== null, activeSlot === 1 && !allFilled, filled[1] !== null)}
        >
          {filled[1] ?? '?'}
        </span>
        <span style={opSymbol}>+</span>
        <span
          onClick={() => !allFilled && filled[2] === null && setActiveSlot(2)}
          style={slotStyle(filled[2] !== null, activeSlot === 2 && !allFilled, filled[2] !== null)}
        >
          {filled[2] ?? '?'}
        </span>
        <span style={opSymbol}>×</span>
        <span
          onClick={() => !allFilled && filled[3] === null && setActiveSlot(3)}
          style={slotStyle(filled[3] !== null, activeSlot === 3 && !allFilled, filled[3] !== null)}
        >
          {filled[3] ?? '?'}
        </span>
        <span style={opSymbol}>=</span>
        <span
          onClick={() => !allFilled && filled[4] === null && setActiveSlot(4)}
          style={slotStyle(filled[4] !== null, activeSlot === 4 && !allFilled, filled[4] !== null)}
        >
          {filled[4] ?? '?'}
        </span>
      </div>

      {/* Chip row */}
      {!allFilled && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 8 }}>
            SELECT VALUE
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {task.chips.map((val, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(val)}
                style={chipStyle(false, wrongChip === val)}
              >
                {val}
              </button>
            ))}
          </div>
          {wrongChip !== null && (
            <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginTop: 10 }}>
              ⚠ GRID MISMATCH
            </div>
          )}
          {wrongCount >= 2 && wrongChip === null && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10, fontFamily: 'var(--font-body)' }}>
              Hint: Look at the rectangle dimensions — width × height for each colored section
            </div>
          )}
        </div>
      )}

      {/* Complete */}
      {allFilled && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
            fontFamily: 'var(--font-display)', color: 'var(--neon-green)',
            marginBottom: 6,
          }}>
            {filled[0]}×{filled[1]} + {filled[2]}×{filled[3]} = {task.parts.a} + {task.parts.b} = {filled[4]}
          </div>
          <div style={{
            color: 'var(--neon-green)', fontSize: 13, letterSpacing: 2, marginBottom: 14,
            fontFamily: 'var(--font-body)',
          }}>
            Split area = total area!
          </div>
          <NeonButton onClick={onComplete} color="green" size="small">
            Confirm →
          </NeonButton>
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
          {task?.type === 'commutative' && 'Predict whether swapping the numbers changes the result, then verify by computing.'}
          {task?.type === 'associative' && 'Fill in both computation paths step by step. Select a blank slot, then tap the correct number.'}
          {task?.type === 'distributive' && 'Build the expanded equation by filling in each blank. The colored rectangle shows the area split.'}
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
