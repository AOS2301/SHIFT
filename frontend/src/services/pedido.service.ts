import { api } from './api'

export type StatusPedido = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED'

export interface Pedido {
  id: number
  status: StatusPedido
  total: number
  criadoEm: string
  itens: {
    id: number
    quantidade: number
    precoUnitario: number
    tamanho: number
    cor: string
    produto: {
      id: number
      nome: string
      marca: string
      imagemPrincipal: string | null
    }
  }[]
}

export const pedidoService = {
  /** Fecha o pedido a partir do carrinho salvo na conta */
  async finalizar(): Promise<Pedido> {
    const { data } = await api.post<Pedido>('/orders')
    return data
  },

  async listar(): Promise<Pedido[]> {
    const { data } = await api.get<Pedido[]>('/orders')
    return data
  },
}
