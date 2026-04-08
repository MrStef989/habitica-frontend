import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refreshToken')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: refresh })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
}

export const userApi = {
  me: () => api.get('/user').then((r) => r.data),
  update: (data: { username: string }) => api.patch('/user', data).then((r) => r.data),
}

export const tasksApi = {
  list: (type?: string) =>
    api.get('/tasks', { params: type ? { type } : {} }).then((r) => r.data),
  create: (data: CreateTaskPayload) => api.post('/tasks', data).then((r) => r.data),
  update: (id: string, data: Partial<CreateTaskPayload>) =>
    api.patch(`/tasks/${id}`, data).then((r) => r.data),
  complete: (id: string, direction?: 'positive' | 'negative') =>
    api.patch(`/tasks/${id}/complete`, direction ? { direction } : {}).then((r) => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
}

export const shopApi = {
  items: () => api.get('/shop').then((r) => r.data),
  inventory: () => api.get('/shop/inventory').then((r) => r.data),
  buy: (itemId: string) => api.post(`/shop/${itemId}/buy`).then((r) => r.data),
  equip: (invId: string) => api.patch(`/shop/inventory/${invId}/equip`).then((r) => r.data),
}

export const achievementsApi = {
  list: () => api.get('/achievements').then((r) => r.data),
}

export interface CreateTaskPayload {
  title: string
  type: 'habit' | 'daily' | 'todo'
  difficulty?: 'trivial' | 'easy' | 'medium' | 'hard'
  notes?: string
  dueDate?: string
  habitPositive?: boolean
  habitNegative?: boolean
}
