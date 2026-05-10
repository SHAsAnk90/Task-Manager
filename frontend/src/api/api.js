import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If 401 received, clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data)
export const login    = (data) => api.post('/auth/login', data)
export const getMe    = ()     => api.get('/auth/me')

// ── Projects ──────────────────────────────────────────────────
export const getProjects      = ()           => api.get('/projects')
export const getProject       = (id)         => api.get(`/projects/${id}`)
export const createProject    = (data)       => api.post('/projects', data)
export const updateProject    = (id, data)   => api.put(`/projects/${id}`, data)
export const deleteProject    = (id)         => api.delete(`/projects/${id}`)
export const addMember        = (id, data)   => api.post(`/projects/${id}/members`, data)
export const removeMember     = (id, userId) => api.delete(`/projects/${id}/members/${userId}`)

// ── Tasks ─────────────────────────────────────────────────────
export const getTasksByProject = (projectId)       => api.get(`/tasks/project/${projectId}`)
export const createTask        = (projectId, data) => api.post(`/tasks/project/${projectId}`, data)
export const updateTask        = (id, data)        => api.put(`/tasks/${id}`, data)
export const updateTaskStatus  = (id, data)        => api.patch(`/tasks/${id}/status`, data)
export const deleteTask        = (id)              => api.delete(`/tasks/${id}`)

// ── Dashboard ─────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard')

export default api
