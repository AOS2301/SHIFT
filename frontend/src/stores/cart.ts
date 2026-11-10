import { defineStore } from 'pinia'
import { cartService, type CartItem } from '../services/cart.service'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'shift_carrinho'

// Mesma regra do backend (backend/src/lib/frete.ts)
export const FRETE_GRATIS_A_PARTIR_DE = 300
const VALOR_FRETE = 29.9

function lerCarrinhoLocal(): CartItem[] {
  try {
    const itens = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(itens) ? itens : []
  } catch {
    return []
  }
}

/**
 * Carrinho com dois modos:
 * - Visitante: os itens vivem no localStorage do navegador.
 * - Logado: os itens vivem na API (/cart) e acompanham a conta.
 * Ao fazer login, o carrinho de visitante é enviado pra conta (sincronizar).
 */
export const useCartStore = defineStore('cart', {
  state: () => ({
    itens: lerCarrinhoLocal(),
    carregando: false,
  }),

  getters: {
    quantidadeTotal: (state) => state.itens.reduce((acc, item) => acc + item.quantidade, 0),

    subtotal: (state) =>
      state.itens.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0),

    frete(): number {
      return this.subtotal > 0 && this.subtotal < FRETE_GRATIS_A_PARTIR_DE ? VALOR_FRETE : 0
    },

    total(): number {
      return this.subtotal + this.frete
    },
  },

  actions: {
    salvarLocal() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.itens))
    },

    /** Busca o carrinho da conta (se logado). Visitante já foi lido do localStorage. */
    async carregar() {
      if (!useAuthStore().estaLogado) return

      this.carregando = true
      try {
        this.itens = (await cartService.buscar()).itens
      } finally {
        this.carregando = false
      }
    },

    /** Chamado logo após login/cadastro: leva os itens de visitante pra conta. */
    async sincronizarAposLogin() {
      const locais = lerCarrinhoLocal().map(({ variantId, quantidade }) => ({
        variantId,
        quantidade,
      }))

      const cart = locais.length
        ? await cartService.sincronizar(locais)
        : await cartService.buscar()

      this.itens = cart.itens
      localStorage.removeItem(STORAGE_KEY)
    },

    async adicionar(item: CartItem) {
      if (useAuthStore().estaLogado) {
        this.itens = (await cartService.adicionar(item.variantId, item.quantidade)).itens
        return
      }

      const existente = this.itens.find((i) => i.variantId === item.variantId)
      const novaQuantidade = (existente?.quantidade ?? 0) + item.quantidade

      if (novaQuantidade > item.estoque) {
        throw new Error(`Só temos ${item.estoque} unidade(s) desse tamanho em estoque`)
      }

      if (existente) {
        existente.quantidade = novaQuantidade
      } else {
        this.itens.push({ ...item })
      }
      this.salvarLocal()
    },

    async alterarQuantidade(variantId: number, quantidade: number) {
      const item = this.itens.find((i) => i.variantId === variantId)
      if (!item || quantidade < 1 || quantidade > item.estoque) return

      if (useAuthStore().estaLogado) {
        this.itens = (await cartService.alterarQuantidade(variantId, quantidade)).itens
        return
      }

      item.quantidade = quantidade
      this.salvarLocal()
    },

    async remover(variantId: number) {
      if (useAuthStore().estaLogado) {
        this.itens = (await cartService.remover(variantId)).itens
        return
      }

      this.itens = this.itens.filter((i) => i.variantId !== variantId)
      this.salvarLocal()
    },

    /** Zera só a tela (logout, pedido finalizado) — não mexe no carrinho salvo na conta. */
    limparLocal() {
      this.itens = []
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
