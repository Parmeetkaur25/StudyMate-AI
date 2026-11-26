import { useEffect, useState } from 'react'
import api from '../services/api'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const handleAuth = (data) => {
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const login = async (email, password) =>
    handleAuth((await api.post('/auth/login', { email, password })).data)

  const register = async (form) =>
    handleAuth((await api.post('/auth/register', form)).data)

  const updateProfile = async (form) =>
    setUser((await api.put('/auth/profile', form)).data.user)

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
