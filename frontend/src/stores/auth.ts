import { defineStore } from 'pinia'
import { authService, type Usuario } from '../services/auth.service'

interface AuthState {
  usuario: Usuario | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    usuario: JSON.parse(localStorage.getItem('shift_usuario') || 'null'),
    token: localStorage.getItem('shift_token'),
  }),

  getters: {
    estaLogado: (state) => !!state.token,
  },

  actions: {
    async login(email: string, senha: string) {
      const { usuario, token } = await authService.login(email, senha)
      this.setSessao(usuario, token)
    },

    async register(nome: string, email: string, senha: string) {
      const { usuario, token } = await authService.register(nome, email, senha)
      this.setSessao(usuario, token)
    },

    setSessao(usuario: Usuario, token: string) {
      this.usuario = usuario
      this.token = token
      localStorage.setItem('shift_usuario', JSON.stringify(usuario))
      localStorage.setItem('shift_token', token)
    },

    logout() {
      this.usuario = null
      this.token = null
      localStorage.removeItem('shift_usuario')
      localStorage.removeItem('shift_token')
    },
  },
})