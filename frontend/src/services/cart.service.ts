import { api } from './api'

export interface CartItem {
  variantId: number
  quantidade: number
  tamanho: number
  cor: string
  estoque: number
  produto: {
    id: number
    nome: string
    marca: string
    imagemPrincipal: string | null
    preco: number
  }
}

export interface Cart {
  itens: CartItem[]
  subtotal: number
  frete: number
  total: number
}

export const cartService = {
  async buscar(): Promise<Cart> {
    const { data } = await api.get<Cart>('/cart')
    return data
  },

  async adicionar(variantId: number, quantidade: number): Promise<Cart> {
    const { data } = await api.post<Cart>('/cart', { variantId, quantidade })
    return data
  },

  async alterarQuantidade(variantId: number, quantidade: number): Promise<Cart> {
    const { data } = await api.put<Cart>(`/cart/${variantId}`, { quantidade })
    return data
  },

  async remover(variantId: number): Promise<Cart> {
    const { data } = await api.delete<Cart>(`/cart/${variantId}`)
    return data
  },

  /** Junta o carrinho de visitante ao carrinho da conta (logo após o login) */
  async sincronizar(itens: { variantId: number; quantidade: number }[]): Promise<Cart> {
    const { data } = await api.post<Cart>('/cart/sync', { itens })
    return data
  },
}
