import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', withCredentials: true })
const csrfToken = () => document.cookie.split('; ').find((item) => item.startsWith('csrftoken='))?.split('=')[1]

api.interceptors.request.use((config) => {
  if (!['get', 'head', 'options'].includes(config.method?.toLowerCase())) {
    const token = csrfToken()
    if (token) config.headers['X-CSRFToken'] = decodeURIComponent(token)
  }
  return config
})

let refreshPromise = null
api.interceptors.response.use((response) => response, async (error) => {
  const request = error.config
  const noRefresh = ['/auth/login/', '/auth/register/', '/auth/refresh/'].some((path) => request?.url?.includes(path))
  if (error.response?.status !== 401 || request?._retried || noRefresh) return Promise.reject(error)
  request._retried = true
  try {
    refreshPromise ??= api.post('/auth/refresh/')
    await refreshPromise
    return api(request)
  } catch (refreshError) { return Promise.reject(refreshError) } finally { refreshPromise = null }
})

export const initialiseCsrf = () => api.get('/auth/csrf/')
export default api
