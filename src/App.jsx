import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomeScreen from './screens/HomeScreen'
import StationMap from './screens/StationMap'
import SystemView from './screens/SystemView'
import MissionView from './screens/MissionView'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeScreen />} />
        <Route path="station" element={<StationMap />} />
        <Route path="station/:systemId" element={<SystemView />} />
        <Route path="station/:systemId/:missionId" element={<MissionView />} />
      </Route>
    </Routes>
  )
}
