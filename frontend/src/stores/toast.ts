import { defineStore } from 'pinia'

export interface Toast {
  id: number
  mensagem: string
  tipo: 'sucesso' | 'erro'
}

let proximoId = 1

// Avisos rápidos no canto da tela ("Adicionado ao carrinho", erros da API...)
export const useToastStore = defineStore('toast', {
  state: () => ({ toasts: [] as Toast[] }),

  actions: {
    mostrar(mensagem: string, tipo: Toast['tipo'] = 'sucesso') {
      const id = proximoId++
      this.toasts.push({ id, mensagem, tipo })
      setTimeout(() => this.fechar(id), 3500)
    },

    sucesso(mensagem: string) {
      this.mostrar(mensagem, 'sucesso')
    },

    erro(mensagem: string) {
      this.mostrar(mensagem, 'erro')
    },

    fechar(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})
