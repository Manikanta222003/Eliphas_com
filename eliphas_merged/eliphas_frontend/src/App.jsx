import { Routes, Route, Navigate } from 'react-router-dom'
import Home        from './pages/Home'
import LoginPage   from './pages/LoginPage'
import Dashboard   from './pages/Dashboard'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  )
}
 
