import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || ''
    const selfHandled = ['/auth/login', '/auth/register', '/auth/me'].some((p) => url.includes(p))
    if (error.response?.status === 401 && !selfHandled && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong'

export default api
