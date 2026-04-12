import { createContext, useContext, useReducer, useEffect } from 'react'
import { SYSTEMS } from '../data/station'

const STORAGE_KEY = 'math-odyssey-progress'

function createInitialState() {
  const systems = {}
  SYSTEMS.forEach(sys => {
    const missions = {}
    sys.missions.forEach(m => {
      missions[m.id] = { completed: false, ahaMoments: [] }
    })
    systems[sys.id] = {
      status: sys.id === 'powercore' ? 'available' : 'locked',
      missions,
    }
  })
  return { version: 1, systems }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.version === 1) {
        // Merge any new missions from SYSTEMS into saved state
        const fresh = createInitialState()
        for (const sysId of Object.keys(fresh.systems)) {
          if (!parsed.systems[sysId]) {
            parsed.systems[sysId] = fresh.systems[sysId]
          } else {
            const freshMissions = fresh.systems[sysId].missions
            for (const mId of Object.keys(freshMissions)) {
              if (!parsed.systems[sysId].missions[mId]) {
                parsed.systems[sysId].missions[mId] = freshMissions[mId]
              }
            }
          }
        }
        return parsed
      }
    }
  } catch {}
  return createInitialState()
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'RECORD_AHA': {
      const { systemId, missionId, ahaId } = action
      const sys = state.systems[systemId]
      if (!sys) return state
      const mission = sys.missions[missionId]
      if (!mission || mission.ahaMoments.includes(ahaId)) return state
      return {
        ...state,
        systems: {
          ...state.systems,
          [systemId]: {
            ...sys,
            missions: {
              ...sys.missions,
              [missionId]: {
                ...mission,
                ahaMoments: [...mission.ahaMoments, ahaId],
              },
            },
          },
        },
      }
    }
    case 'COMPLETE_MISSION': {
      const { systemId, missionId } = action
      const sys = state.systems[systemId]
      if (!sys) return state
      const mission = sys.missions[missionId]
      if (!mission) return state
      const newMissions = {
        ...sys.missions,
        [missionId]: { ...mission, completed: true },
      }
      const allDone = Object.values(newMissions).every(m => m.completed)
      const newSystems = {
        ...state.systems,
        [systemId]: {
          ...sys,
          status: allDone ? 'complete' : sys.status,
          missions: newMissions,
        },
      }
      // Unlock next system if current is complete
      if (allDone) {
        const order = ['powercore', 'navigation', 'comms', 'shields', 'launch']
        const idx = order.indexOf(systemId)
        if (idx >= 0 && idx < order.length - 1) {
          const nextId = order[idx + 1]
          if (newSystems[nextId] && newSystems[nextId].status === 'locked') {
            newSystems[nextId] = { ...newSystems[nextId], status: 'available' }
          }
        }
      }
      return { ...state, systems: newSystems }
    }
    case 'RESET':
      return createInitialState()
    default:
      return state
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
