import { Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

export const routes = [
  { path: '/', element: <Navigate to="/search" replace /> },
  { path: '/search', element: <ProtectedRoute>Search</ProtectedRoute> },
]
