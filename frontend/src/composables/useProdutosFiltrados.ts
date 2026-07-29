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
  const carregando = ref(true)
  const erro = ref('')

  async function buscar() {
    carregando.value = true
    erro.value = ''

    try {
      const resultado = await produtoService.listar(filtros.value)
      produtos.value = resultado.data
    } catch (e) {
      erro.value = 'Não foi possível carregar os produtos. Tente novamente.'
      produtos.value = []
    } finally {
      carregando.value = false
    }
  }

  watch(filtros, buscar, { immediate: true, deep: true })

  return { produtos, carregando, erro, recarregar: buscar }
}