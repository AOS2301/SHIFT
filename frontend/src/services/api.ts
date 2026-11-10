import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
})

// Anexa o token JWT (se existir) em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shift_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Quando a API responde 401 numa requisição autenticada, o token expirou ou
// é inválido. Quem cuida de deslogar é o store de auth, registrado aqui via
// callback pra evitar import circular (store -> service -> api -> store).
let aoExpirarSessao: (() => void) | null = null

export function registrarSessaoExpirada(callback: () => void) {
  aoExpirarSessao = callback
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const enviouToken = Boolean(error.config?.headers?.Authorization)
    if (error.response?.status === 401 && enviouToken) {
      aoExpirarSessao?.()
    }
    return Promise.reject(error)
  },
)
