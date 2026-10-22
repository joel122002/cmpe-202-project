import { Navigate } from 'react-router-dom'
import { readSession } from './api'

export default function ProtectedRoute({ children }) {
  return readSession() ? children : <Navigate to="/login" replace />
}
