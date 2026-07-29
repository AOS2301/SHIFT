import { api } from './api'

export interface ProdutoVariante {
  id: number
  tamanho: number
  cor: string
  estoque: number
  sku: string
}

export interface Produto {
  id: number
  nome: string
  descricao: string | null
  precoBase: number
  imagemPrincipal: string | null
  marca: { id: number; nome: string; logoUrl: string | null }
  categoria: { id: number; nome: string; tipo: string }
  variantes: ProdutoVariante[]
}

export interface ProdutosPaginados {
  data: Produto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ListarProdutosParams {
  page?: number
  limit?: number
  brand?: string
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
}

export const produtoService = {
  async listar(params: ListarProdutosParams = {}): Promise<ProdutosPaginados> {
    const { data } = await api.get<ProdutosPaginados>('/products', { params })
    return data
  },

  async buscarPorId(id: number): Promise<Produto> {
    const { data } = await api.get<Produto>(`/products/${id}`)
    return data
  },
}