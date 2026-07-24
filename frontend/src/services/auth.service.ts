import { api } from './api'

export interface Usuario {
  id: number
  nome: string
  email: string
  role: string
}

interface AuthResponse {
  usuario: Usuario
  token: string
}

export const authService = {
  async register(nome: string, email: string, senha: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', { nome, email, senha })
    return data
  },

  async login(email: string, senha: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, senha })
    return data
  },
}