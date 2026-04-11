import { Outlet } from 'react-router-dom'
import StarField from './StarField'

export default function Layout() {
  return (
    <>
      <StarField />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Outlet />
      </div>
    </>
  )
}
