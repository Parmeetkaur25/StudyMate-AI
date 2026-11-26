import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/useAuth'

// roles diye hon to sirf wahi role andar ja sakta hai (frontend check sirf UX ke liye, asli security backend ka authorize() hai)
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-violet-600">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}