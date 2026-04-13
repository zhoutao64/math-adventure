import { useState, useRef, useEffect, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

const FUEL_TASKS = [
  { target: 0, startX: -4, label: '0', discovery: 'origin', title: 'The Origin', desc: 'Zero is the center of the number line — the reference point from which all numbers are measured. Every positive number has a negative mirror on the other side.' },
  { target: -3, startX: 3, label: '-3', discovery: 'negatives', title: 'Negative Numbers', desc: 'Numbers to the left of zero are negative. They represent opposites — if +3 means 3 steps right, -3 means 3 steps left.' },
  { target: 0.5, startX: -3, label: '1/2', discovery: 'fractions', title: 'Between Integers', desc: 'Between any two integers, there are infinitely many fractions. 1/2 sits exactly halfway between 0 and 1.' },
  { target: Math.PI, startX: -2, label: 'π', discovery: 'pi', title: 'Pi Lives Here!', desc: 'π ≈ 3.14159... is an irrational number — its decimals never end and never repeat. It appears whenever circles are involved.' },
  { target: Math.SQRT2, startX: -3, label: '√2', discovery: 'sqrt2', title: 'The Root of 2', desc: '√2 ≈ 1.414... is irrational. The ancient Greeks proved this — it cannot be written as a fraction. It is the diagonal of a unit square.' },
  { target: -2.5, startX: 3, label: '-2.5', discovery: 'decimals', title: 'Decimal Negatives', desc: 'Negative decimals exist too! -2.5 is halfway between -2 and -3. Every point on the number line represents a real number.' },
]

function useCanvasSize() {
  const [size, setSize] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 700
    return {
      canvasW: Math.min(700, w - 40),
      canvasH: w < 480 ? 150 : 200,
      dpr: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
    }
  })

  useEffect(() => {
    function onResize() {
      const w = window.innerWidth
      setSize({
        canvasW: Math.min(700, w - 40),
        canvasH: w < 480 ? 150 : 200,
        dpr: window.devicePixelRatio || 1,
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}

export default function Mission1_Calibrate({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const canvasRef = useRef(null)
  const [viewRange, setViewRange] = useState({ min: -6, max: 6 })
  const [currentTask, setCurrentTask] = useState(0)
  const [fuelRodX, setFuelRodX] = useState(FUEL_TASKS[0].startX)
  const [isDragging, setIsDragging] = useState(false)
  const [placed, setPlaced] = useState([])
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.powercore.missions['1']
  const ahaCount = mState.ahaMoments.length

  const task = FUEL_TASKS[currentTask]
  const { canvasW, canvasH, dpr } = useCanvasSize()

  // Responsive metrics scaled by canvas width
  const scale = canvasW / 700
  const m = {
    tickFont: `${Math.max(12, Math.round(15 * scale))}px Orbitron`,
    slotFont: `bold ${Math.max(11, Math.round(14 * scale))}px Orbitron`,
    rodFont: `bold ${Math.max(12, Math.round(15 * scale))}px Orbitron`,
    dragFont: `bold ${Math.max(13, Math.round(17 * scale))}px Orbitron`,
    tickH: Math.max(10, Math.round(12 * scale)),
    halfTickH: Math.max(5, Math.round(6 * scale)),
    rodHW: Math.max(6, Math.round(4 / scale > 8 ? 8 : 4 + 4 * scale)),
    rodHH: Math.max(16, Math.round(18 * scale)),
    slotW: Math.max(36, Math.round(30 * scale)),
    slotH: Math.max(40, Math.round(40 * scale)),
    glowR: Math.max(16, Math.round(20 * scale)),
    labelY: Math.max(22, Math.round(28 * scale)),
    rodLabelY: Math.max(20, Math.round(24 * scale)),
    snapThreshold: Math.max(0.3, (20 / canvasW) * (viewRange.max - viewRange.min)),
  }

  const xToCanvas = useCallback((val) => {
    const { min, max } = viewRange
    return ((val - min) / (max - min)) * canvasW
  }, [viewRange, canvasW])

  const canvasToX = useCallback((px) => {
    const { min, max } = viewRange
    return min + (px / canvasW) * (max - min)
  }, [viewRange, canvasW])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // DPI-aware canvas sizing
    canvas.width = canvasW * dpr
    canvas.height = canvasH * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const w = canvasW, h = canvasH
    ctx.clearRect(0, 0, w, h)

    const cy = h / 2
    const { min, max } = viewRange

    // Number line
    ctx.strokeStyle = 'rgba(0,240,255,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, cy)
    ctx.lineTo(w, cy)
    ctx.stroke()

    // Tick marks and labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = m.tickFont
    ctx.textAlign = 'center'
    const step = max - min <= 4 ? 0.5 : 1
    for (let v = Math.ceil(min); v <= Math.floor(max); v += step) {
      const x = xToCanvas(v)
      const isInt = Number.isInteger(v)
      ctx.strokeStyle = isInt ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'
      ctx.lineWidth = isInt ? 1.5 : 1
      ctx.beginPath()
      ctx.moveTo(x, cy - (isInt ? m.tickH : m.halfTickH))
      ctx.lineTo(x, cy + (isInt ? m.tickH : m.halfTickH))
      ctx.stroke()
      if (isInt) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillText(v.toString(), x, cy + m.labelY)
      }
    }

    // Target slot (highlighted dashed box)
    if (!placed.includes(currentTask) && task) {
      const tx = xToCanvas(task.target)
      const slotW = m.slotW * 1.3
      const slotH = m.slotH * 1.3

      // Soft glow behind slot
      const slotGlow = ctx.createRadialGradient(tx, cy, 0, tx, cy, slotH)
      slotGlow.addColorStop(0, 'rgba(57,255,20,0.1)')
      slotGlow.addColorStop(1, 'rgba(57,255,20,0)')
      ctx.fillStyle = slotGlow
      ctx.fillRect(tx - slotH, cy - slotH, slotH * 2, slotH * 2)

      ctx.setLineDash([6, 4])
      ctx.strokeStyle = 'rgba(57,255,20,0.6)'
      ctx.lineWidth = 2
      ctx.strokeRect(tx - slotW / 2, cy - slotH / 2, slotW, slotH)
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(57,255,20,0.7)'
      ctx.font = m.slotFont
      ctx.fillText('?', tx, cy + 5)
    }

    // Placed fuel rods
    placed.forEach(idx => {
      const t = FUEL_TASKS[idx]
      const fx = xToCanvas(t.target)
      // Glow
      const grad = ctx.createRadialGradient(fx, cy, 0, fx, cy, m.glowR)
      grad.addColorStop(0, 'rgba(57,255,20,0.2)')
      grad.addColorStop(1, 'rgba(57,255,20,0)')
      ctx.fillStyle = grad
      ctx.fillRect(fx - m.glowR, cy - m.glowR, m.glowR * 2, m.glowR * 2)
      // Rod
      ctx.fillStyle = 'rgba(57,255,20,0.8)'
      ctx.fillRect(fx - m.rodHW, cy - m.rodHH, m.rodHW * 2, m.rodHH * 2)
      ctx.strokeStyle = 'rgba(57,255,20,0.9)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(fx - m.rodHW, cy - m.rodHH, m.rodHW * 2, m.rodHH * 2)
      // Label
      ctx.fillStyle = 'rgba(57,255,20,0.9)'
      ctx.font = m.rodFont
      ctx.textAlign = 'center'
      ctx.fillText(t.label, fx, cy - m.rodLabelY)
    })

    // Active fuel rod (always visible when task not placed)
    if (!placed.includes(currentTask) && fuelRodX !== null) {
      const fx = xToCanvas(fuelRodX)
      const rodW = m.rodHW * 2.5
      const rodH = m.rodHH * 1.8

      // Glow behind rod
      const glow = ctx.createRadialGradient(fx, cy, 0, fx, cy, rodH * 1.5)
      glow.addColorStop(0, 'rgba(0,240,255,0.15)')
      glow.addColorStop(1, 'rgba(0,240,255,0)')
      ctx.fillStyle = glow
      ctx.fillRect(fx - rodH * 1.5, cy - rodH * 1.5, rodH * 3, rodH * 3)

      // Rod body
      ctx.fillStyle = isDragging ? 'rgba(0,240,255,0.85)' : 'rgba(0,240,255,0.6)'
      ctx.fillRect(fx - rodW, cy - rodH, rodW * 2, rodH * 2)
      ctx.strokeStyle = 'rgba(0,240,255,1)'
      ctx.lineWidth = 2
      ctx.strokeRect(fx - rodW, cy - rodH, rodW * 2, rodH * 2)

      // Label on top
      ctx.fillStyle = '#fff'
      ctx.font = m.dragFont
      ctx.textAlign = 'center'
      ctx.fillText(task.label, fx, cy - rodH - 8)

      // Position value below
      ctx.fillStyle = 'rgba(0,240,255,0.9)'
      ctx.font = m.slotFont
      ctx.fillText(fuelRodX.toFixed(2), fx, cy + rodH + 16)

      // "← DRAG →" hint when not dragging
      if (!isDragging) {
        ctx.fillStyle = 'rgba(0,240,255,0.5)'
        ctx.font = `${Math.max(9, Math.round(10 * scale))}px Orbitron`
        ctx.fillText('← DRAG →', fx, cy + 4)
      }
    }
  }, [viewRange, canvasW, canvasH, dpr, currentTask, placed, isDragging, fuelRodX, xToCanvas, task, m])

  function handlePointerDown(e) {
    if (completed || placed.includes(currentTask)) return
    setIsDragging(true)
    canvasRef.current.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    if (!isDragging) return
    const rect = canvasRef.current.getBoundingClientRect()
    const px = Math.max(0, Math.min(canvasW, (e.clientX - rect.left) * (canvasW / rect.width)))
    let val = canvasToX(px)
    if (task && Math.abs(val - task.target) < m.snapThreshold) val = task.target
    setFuelRodX(val)
  }

  function handlePointerUp() {
    if (!isDragging || fuelRodX === null) return
    setIsDragging(false)
    if (task && Math.abs(fuelRodX - task.target) < m.snapThreshold) {
      setFuelRodX(task.target)
      setPlaced(prev => [...prev, currentTask])
      if (!mState.ahaMoments.includes(task.discovery)) {
        dispatch({ type: 'RECORD_AHA', systemId: 'powercore', missionId: '1', ahaId: task.discovery })
        setAhaModal(task)
      } else if (currentTask < FUEL_TASKS.length - 1) {
        advanceToNextTask(currentTask + 1)
      } else {
        handleComplete()
      }
    }
  }

  function advanceToNextTask(nextIdx) {
    setCurrentTask(nextIdx)
    setFuelRodX(FUEL_TASKS[nextIdx].startX)
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (currentTask < FUEL_TASKS.length - 1) {
      advanceToNextTask(currentTask + 1)
    } else {
      handleComplete()
    }
  }

  function handleComplete() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'powercore', missionId: '1' })
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

      <div style={{
        fontSize: 13, letterSpacing: 3, color: 'var(--neon-cyan)',
        marginBottom: 6,
      }}>
        ⚡ MISSION 1
      </div>

      <NeonText as="h2" color="cyan" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        校准反应堆
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
            ? '🎉 Reactor online! All fuel rods calibrated.'
            : `Drag the fuel rod to coordinate ${task?.label || '?'} to activate this cell.`
          }
        </p>
      </div>

      {/* Canvas */}
      <div className="glass-panel" style={{ padding: 'clamp(8px, 2vw, 16px)', marginBottom: 20, maxWidth: '100%' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: canvasW, height: canvasH,
            cursor: completed ? 'default' : 'crosshair',
            display: 'block', touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { setIsDragging(false) }}
        />
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Reactor Power</span>
          <span>{placed.length}/{FUEL_TASKS.length}</span>
        </div>
        <ProgressBar value={placed.length} max={FUEL_TASKS.length} color="cyan" />
      </div>

      {/* Hint */}
      {!completed && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-cyan)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            💡 GUIDE
          </div>
          Click and drag on the number line to position the fuel rod.
          Find the position marked <strong style={{ color: 'var(--neon-cyan)' }}>{task?.label}</strong> on the number line.
        </div>
      )}

      {completed && (
        <NeonButton onClick={onBack} color="green" style={{ marginTop: 30 }}>
          Mission Complete →
        </NeonButton>
      )}

      {/* Aha moment modal */}
      <Modal isOpen={!!ahaModal} onClose={handleAhaClose} title={ahaModal?.title || ''}>
        <p style={{ lineHeight: 2 }}>{ahaModal?.desc}</p>
      </Modal>
    </div>
  )
}
