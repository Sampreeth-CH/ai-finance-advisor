import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

const ProtectedRoute = ({ children }) => {
  const token = useAppStore((state) => state.token)

  if (!token) {
    return <Navigate to='/login' replace />
  }

  return children
}

export default ProtectedRoute
