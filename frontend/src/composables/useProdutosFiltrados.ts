import { ref, watch, type Ref } from 'vue'
import { produtoService, type Produto, type ListarProdutosParams } from '../services/produto.service'

/**
 * Composable genérico pra listar produtos filtrados por qualquer critério
 * (marca, categoria, gênero, busca...). Qualquer página de listagem nova
 * (tipo, faixa de preço, "mais vendidos") pode reaproveitar isso sem duplicar
 * a lógica de loading/erro/refetch.
 *
 * @param filtros - ref reativo com os parâmetros de busca; sempre que mudar,
 *                  a busca é refeita automaticamente.
 */
export function useProdutosFiltrados(filtros: Ref<ListarProdutosParams>) {
  const produtos = ref<Produto[]>([])
  const total = ref(0)
  const totalPaginas = ref(1)
  const carregando = ref(true)
  const erro = ref('')

  // Cada busca ganha um número; se uma resposta antiga chegar depois de uma
  // mais nova (digitação rápida na busca), ela é descartada.
  let buscaAtual = 0

  async function buscar() {
    const estaBusca = ++buscaAtual
    carregando.value = true
    erro.value = ''

    try {
      const resultado = await produtoService.listar(filtros.value)
      if (estaBusca !== buscaAtual) return
      produtos.value = resultado.data
      total.value = resultado.pagination.total
      totalPaginas.value = Math.max(1, resultado.pagination.totalPages)
    } catch (e) {
      if (estaBusca !== buscaAtual) return
      erro.value = 'Não foi possível carregar os produtos. Tente novamente.'
      produtos.value = []
      total.value = 0
    } finally {
      if (estaBusca === buscaAtual) carregando.value = false
    }
  }

  watch(filtros, buscar, { immediate: true, deep: true })

  return { produtos, total, totalPaginas, carregando, erro, recarregar: buscar }
}
