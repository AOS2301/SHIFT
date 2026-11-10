import { defineStore } from 'pinia'
import { authService, type Usuario } from '../services/auth.service'
import { useCartStore } from './cart'

interface AuthState {
  usuario: Usuario | null
  token: string | null
}

function lerUsuarioSalvo(): Usuario | null {
  try {
    return JSON.parse(localStorage.getItem('shift_usuario') || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    usuario: lerUsuarioSalvo(),
    token: localStorage.getItem('shift_token'),
  }),

  getters: {
    estaLogado: (state) => !!state.token,
    primeiroNome: (state) => state.usuario?.nome.trim().split(/\s+/)[0] ?? '',
  },

  actions: {
    async login(email: string, senha: string) {
      const { usuario, token } = await authService.login(email, senha)
      this.setSessao(usuario, token)
      await this.aposEntrar()
    },

    async register(nome: string, email: string, senha: string) {
      const { usuario, token } = await authService.register(nome, email, senha)
      this.setSessao(usuario, token)
      await this.aposEntrar()
    },

    // O login em si já deu certo; se a sincronização do carrinho falhar,
    // não faz sentido mostrar erro de login — só segue sem o carrinho.
    async aposEntrar() {
      try {
        await useCartStore().sincronizarAposLogin()
      } catch {
        /* carrinho será recarregado na próxima visita */
      }
    },

    /**
     * Roda uma vez quando o app abre: confirma com a API que o token salvo
     * ainda vale (e atualiza os dados do usuário). Token inválido → o
     * interceptor do axios chama logout(). API fora do ar → mantém a sessão.
     */
    async restaurarSessao() {
      if (!this.token) return

      try {
        this.usuario = await authService.me()
        localStorage.setItem('shift_usuario', JSON.stringify(this.usuario))
        await useCartStore().carregar()
      } catch {
        /* tratado pelo interceptor (401) ou ignorado (rede) */
      }
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
      useCartStore().limparLocal()
    },
  },
})
