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
  precoPromocional: number | null
  /** Preço efetivamente cobrado (promocional se houver, senão o base) */
  precoFinal: number
  imagemPrincipal: string | null
  marca: { id: number; nome: string; logoUrl: string | null }
  categoria: { id: number; nome: string; tipo: string }
  genero: { id: number; nome: string } | null
  variantes: ProdutoVariante[]
  /** Galeria — só vem em GET /products/:id */
  imagens?: { id: number; url: string; ordem: number }[]
}

export type OrdenacaoProdutos = 'recentes' | 'preco_asc' | 'preco_desc' | 'nome'

export interface Marca {
  id: number
  nome: string
  logoUrl: string | null
}

export interface Categoria {
  id: number
  nome: string
  tipo: 'CATEGORIA' | 'GENERO'
  totalProdutos: number
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
  gender?: string
  promo?: boolean
  sort?: OrdenacaoProdutos
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

  async listarMarcas(): Promise<Marca[]> {
    const { data } = await api.get<Marca[]>('/brands')
    return data
  },

  async listarCategorias(tipo?: Categoria['tipo']): Promise<Categoria[]> {
    const { data } = await api.get<Categoria[]>('/categories', { params: { tipo } })
    return data
  },
}