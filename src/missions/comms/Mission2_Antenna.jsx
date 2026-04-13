import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import NeonButton from '../../components/NeonButton'
import NeonText from '../../components/NeonText'
import Modal from '../../components/Modal'
import ProgressBar from '../../components/ProgressBar'

// âââ Task Data âââââââââââââââââââââââââââââââââââââââââââââââ
const ANTENNA_TASKS = [
  {
    point1: [0, 1], point2: [2, 5],
    answer: 2,
    rise: 4, run: 2,
    hint: 'Rise = 5 â 1 = 4, Run = 2 â 0 = 2. Slope = Rise Ã· Run.',
    ahaId: 'slope_ratio',
    ahaTitle: 'Slope is a Ratio',
    ahaDesc: 'Slope = Rise Ã· Run. It measures how steep a line is â how much y changes per unit of x. Here: 4 Ã· 2 = 2, so the line rises 2 units for every 1 unit across!',
  },
  {
    point1: [1, 6], point2: [3, 2],
    answer: -2,
    rise: -4, run: 2,
    hint: 'Rise = 2 â 6 = â4 (going DOWN). Run = 3 â 1 = 2. A negative rise means negative slope.',
    ahaId: 'negative_slope',
    ahaTitle: 'Negative Slope',
    ahaDesc: 'A negative slope means the line goes DOWN from left to right. Rise = â4, Run = 2, so slope = â4 Ã· 2 = â2. The signal is descending!',
  },
  {
    point1: [0, 3], point2: [4, 3],
    answer: 0,
    rise: 0, run: 4,
    hint: 'Rise = 3 â 3 = 0. When there is no rise, the line is flat.',
    ahaId: 'zero_slope',
    ahaTitle: 'Zero Slope',
    ahaDesc: 'When rise = 0, slope = 0 and the line is perfectly horizontal. No change in signal! A flat line means the output stays the same no matter the input.',
  },
  {
    point1: [1, 0], point2: [3, 3],
    answer: 1.5,
    rise: 3, run: 2,
    hint: 'Rise = 3, Run = 2. Slope = 3 Ã· 2 = 1.5. Slopes don\'t have to be whole numbers!',
    ahaId: 'fractional_slope',
    ahaTitle: 'Fractional Slope',
    ahaDesc: 'Slopes can be fractions like 3/2 = 1.5. This means the line rises 3 units for every 2 units across. Not every slope is a nice whole number â and that\'s okay!',
  },
  {
    point1: [0, 4], point2: [2, 1],
    answer: -1.5,
    rise: -3, run: 2,
    hint: 'Rise = 1 â 4 = â3, Run = 2 â 0 = 2. Slope = â3 Ã· 2 = â1.5.',
    ahaId: null,
  },
]

// âââ Slope Visual ââââââââââââââââââââââââââââââââââââââââââââ
function SlopeGrid({ point1, point2, rise, run, userSlope, solved }) {
  // Grid bounds: x: -1 to 6, y: -2 to 8
  const gx1 = -1, gx2 = 6, gy1 = -2, gy2 = 8
  const W = 320, H = 260
  const px = (x) => ((x - gx1) / (gx2 - gx1)) * W
  const py = (y) => H - ((y - gy1) / (gy2 - gy1)) * H

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 360, display: 'block', margin: '0 auto' }}>
      {/* Grid lines */}
      {Array.from({ length: gx2 - gx1 + 1 }, (_, i) => i + gx1).map(x => (
        <line key={`gx${x}`} x1={px(x)} y1={0} x2={px(x)} y2={H}
          stroke={x === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}
          strokeWidth={x === 0 ? 1.5 : 0.5} />
      ))}
      {Array.from({ length: gy2 - gy1 + 1 }, (_, i) => i + gy1).map(y => (
        <line key={`gy${y}`} x1={0} y1={py(y)} x2={W} y2={py(y)}
          stroke={y === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}
          strokeWidth={y === 0 ? 1.5 : 0.5} />
      ))}

      {/* Target line (dashed) */}
      <line
        x1={px(gx1)} y1={py(point1[1] + ((gx1 - point1[0]) / (point2[0] - point1[0])) * (point2[1] - point1[1]))}
        x2={px(gx2)} y2={py(point1[1] + ((gx2 - point1[0]) / (point2[0] - point1[0])) * (point2[1] - point1[1]))}
        stroke="rgba(255,45,149,0.3)" strokeWidth={1.5} strokeDasharray="6,4"
      />

      {/* Rise/Run indicators */}
      {solved && (
        <>
          {/* Vertical rise */}
          <line x1={px(point2[0])} y1={py(point1[1])} x2={px(point2[0])} y2={py(point2[1])}
            stroke="var(--neon-cyan)" strokeWidth={2} strokeDasharray="4,3" />
          <text x={px(point2[0]) + 8} y={(py(point1[1]) + py(point2[1])) / 2}
            fill="var(--neon-cyan)" fontSize={13} fontFamily="var(--font-display)">
            rise={rise}
          </text>
          {/* Horizontal run */}
          <line x1={px(point1[0])} y1={py(point1[1])} x2={px(point2[0])} y2={py(point1[1])}
            stroke="var(--neon-yellow)" strokeWidth={2} strokeDasharray="4,3" />
          <text x={(px(point1[0]) + px(point2[0])) / 2} y={py(point1[1]) + 14}
            fill="var(--neon-yellow)" fontSize={13} fontFamily="var(--font-display)" textAnchor="middle">
            run={run}
          </text>
        </>
      )}

      {/* Points */}
      <circle cx={px(point1[0])} cy={py(point1[1])} r={6}
        fill="var(--neon-pink)" stroke="#fff" strokeWidth={1.5} />
      <text x={px(point1[0])} y={py(point1[1]) - 10}
        fill="var(--neon-pink)" fontSize={13} textAnchor="middle" fontFamily="var(--font-display)">
        ({point1[0]},{point1[1]})
      </text>

      <circle cx={px(point2[0])} cy={py(point2[1])} r={6}
        fill="var(--neon-pink)" stroke="#fff" strokeWidth={1.5} />
      <text x={px(point2[0])} y={py(point2[1]) - 10}
        fill="var(--neon-pink)" fontSize={13} textAnchor="middle" fontFamily="var(--font-display)">
        ({point2[0]},{point2[1]})
      </text>
    </svg>
  )
}

// âââ Component âââââââââââââââââââââââââââââââââââââââââââââââ
export default function Mission2_Antenna({ system, mission, onBack }) {
  const { state, dispatch } = useGame()
  const [taskIndex, setTaskIndex] = useState(0)
  const [slope, setSlope] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [ahaModal, setAhaModal] = useState(null)
  const [completed, setCompleted] = useState(false)

  const mState = state.systems.comms.missions['2']
  const task = ANTENNA_TASKS[taskIndex]

  function handleSubmit() {
    if (solved) return
    if (Math.abs(slope - task.answer) <= 0.25) {
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
      dispatch({ type: 'RECORD_AHA', systemId: 'comms', missionId: '2', ahaId: task.ahaId })
      setAhaModal(task)
    } else if (taskIndex < ANTENNA_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function handleAhaClose() {
    setAhaModal(null)
    if (taskIndex < ANTENNA_TASKS.length - 1) {
      advanceTask()
    } else {
      finishMission()
    }
  }

  function advanceTask() {
    setTaskIndex(prev => prev + 1)
    setSlope(0)
    setSolved(false)
    setWrongFlash(false)
  }

  function finishMission() {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_MISSION', systemId: 'comms', missionId: '2' })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 12px', minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 10 }}>
        <NeonButton onClick={onBack} size="small">
          â Exit
        </NeonButton>
      </div>

      <div style={{ fontSize: 13, letterSpacing: 3, color: 'var(--neon-pink)', marginBottom: 6 }}>
        ð¡ MISSION 2
      </div>

      <NeonText as="h2" color="pink" style={{ fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
        å¤©çº¿å¯¹å
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
            ? 'ð All antennas aligned! Signal reception optimal.'
            : 'Calculate the slope between two points to align the antenna.'
          }
        </p>
      </div>

      {!completed && (
        <>
          {/* Coordinate Grid */}
          <div className="glass-panel" style={{
            padding: 'clamp(14px, 3vw, 20px)', maxWidth: 500, width: '100%',
            marginBottom: 20,
          }}>
            <div style={{ ...meterLabel, marginBottom: 8 }}>
              ANTENNA {taskIndex + 1}/{ANTENNA_TASKS.length} â ALIGNING
            </div>

            <SlopeGrid
              point1={task.point1}
              point2={task.point2}
              rise={task.rise}
              run={task.run}
              userSlope={slope}
              solved={solved}
            />

            {/* Show formula after solving */}
            {solved && (
              <div style={{
                marginTop: 12, textAlign: 'center',
                fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700,
                color: 'var(--neon-green)', fontFamily: 'var(--font-display)',
                letterSpacing: 1,
              }}>
                Slope = {task.rise} Ã· {task.run} = {task.answer}
              </div>
            )}
          </div>

          {/* Slope slider */}
          {!solved && (
            <div style={{ maxWidth: 400, width: '100%', padding: '0 16px', marginBottom: 20 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                  Slope =
                </span>
                <span style={{
                  fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900,
                  color: 'var(--neon-pink)',
                  fontFamily: 'var(--font-display)',
                  animation: wrongFlash ? 'shake 0.4s' : 'none',
                }}>
                  {slope}
                </span>
              </div>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.5}
                value={slope}
                onChange={e => setSlope(parseFloat(e.target.value))}
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
                <span>â3</span>
                <span>0</span>
                <span>3</span>
              </div>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <NeonButton onClick={handleSubmit} color="pink" size="small">
                  Lock Antenna
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
              â  ANTENNA MISALIGNED â adjust slope
            </div>
          )}

          {/* Next button */}
          {solved && (
            <NeonButton onClick={handleNext} color="green" size="small">
              {taskIndex < ANTENNA_TASKS.length - 1 ? 'Next Antenna â' : 'Complete â'}
            </NeonButton>
          )}
        </>
      )}

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 400, padding: '0 8px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          <span>Antennas Aligned</span>
          <span>{tasksCompleted}/{ANTENNA_TASKS.length}</span>
        </div>
        <ProgressBar value={tasksCompleted} max={ANTENNA_TASKS.length} color="pink" />
      </div>

      {/* Guide */}
      {!completed && !solved && (
        <div className="glass-panel" style={{
          marginTop: 20, padding: 'clamp(14px, 2vw, 16px)', maxWidth: 500, width: '100%',
          fontSize: 'clamp(13px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ color: 'var(--neon-pink)', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            ð¡ GUIDE
          </div>
          {task?.hint || 'Calculate Rise Ã· Run between the two points to find the slope.'}
        </div>
      )}

      {completed && (
        <NeonButton onClick={onBack} color="green" style={{ marginTop: 30 }}>
          Mission Complete â
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
