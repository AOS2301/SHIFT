<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductGrid from '../components/productGrid.vue'
import { useProdutosFiltrados } from '../composables/useProdutosFiltrados'
import {
  produtoService,
  type Categoria,
  type Marca,
  type ListarProdutosParams,
  type OrdenacaoProdutos,
} from '../services/produto.service'

/**
 * Catálogo com filtros. Todo o estado dos filtros mora na URL
 * (/produtos?brand=Nike&sort=preco_asc&page=2), então dá pra compartilhar o
 * link, usar o botão voltar e recarregar a página sem perder nada.
 * A rota /promocao reaproveita esta tela com a prop `promocao`.
 */
const props = defineProps<{ promocao?: boolean }>()

const route = useRoute()
const router = useRouter()

const POR_PAGINA = 12

const ordenacoes: { valor: OrdenacaoProdutos; rotulo: string }[] = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'preco_asc', rotulo: 'Menor preço' },
  { valor: 'preco_desc', rotulo: 'Maior preço' },
  { valor: 'nome', rotulo: 'Nome (A–Z)' },
]

const marcas = ref<Marca[]>([])
const categorias = ref<Categoria[]>([])
const generos = ref<Categoria[]>([])
const filtrosAbertos = ref(false) // painel de filtros no mobile
const topoLista = ref<HTMLElement | null>(null)

function texto(valor: unknown) {
  return typeof valor === 'string' ? valor : ''
}

function numero(valor: unknown) {
  const n = Number(texto(valor))
  return texto(valor) !== '' && Number.isFinite(n) && n >= 0 ? n : undefined
}

// ---- Filtros lidos da URL ----
const q = computed(() => ({
  search: texto(route.query.search),
  brand: texto(route.query.brand),
  category: texto(route.query.category),
  gender: texto(route.query.gender),
  min: numero(route.query.min),
  max: numero(route.query.max),
  sort: (ordenacoes.find((o) => o.valor === route.query.sort)?.valor ?? 'recentes') as OrdenacaoProdutos,
  page: Math.max(1, Math.floor(numero(route.query.page) ?? 1)),
}))

const filtros = computed<ListarProdutosParams>(() => ({
  page: q.value.page,
  limit: POR_PAGINA,
  sort: q.value.sort,
  search: q.value.search || undefined,
  brand: q.value.brand || undefined,
  category: q.value.category || undefined,
  gender: q.value.gender || undefined,
  minPrice: q.value.min,
  maxPrice: q.value.max,
  promo: props.promocao || undefined,
}))

const { produtos, total, totalPaginas, carregando, erro, recarregar } = useProdutosFiltrados(filtros)

// Campos de preço: digitados livremente e aplicados no Enter / ao sair do campo
const precoMin = ref('')
const precoMax = ref('')
watch(
  q,
  (valor) => {
    precoMin.value = valor.min?.toString() ?? ''
    precoMax.value = valor.max?.toString() ?? ''
  },
  { immediate: true },
)

/** Atualiza um ou mais filtros na URL. Trocar filtro sempre volta pra página 1. */
function aplicar(mudancas: Record<string, string | number | undefined>) {
  const query: Record<string, string> = {}
  const atual = { ...route.query, page: undefined, ...mudancas }

  for (const [chave, valor] of Object.entries(atual)) {
    if (valor !== undefined && valor !== null && valor !== '' && typeof valor !== 'object') {
      query[chave] = String(valor)
    }
  }
  if (query.sort === 'recentes') delete query.sort
  if (query.page === '1') delete query.page

  router.push({ path: route.path, query })
}

function alternar(chave: 'brand' | 'category' | 'gender', valor: string) {
  aplicar({ [chave]: q.value[chave].toLowerCase() === valor.toLowerCase() ? undefined : valor })
}

function aplicarPreco() {
  aplicar({ min: numero(precoMin.value), max: numero(precoMax.value) })
}

function irParaPagina(pagina: number) {
  aplicar({ page: pagina })
  topoLista.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function limparFiltros() {
  router.push({ path: route.path })
}

// "Chips" dos filtros ativos, cada um com seu botão de remover
const filtrosAtivos = computed(() => {
  const chips: { rotulo: string; remover: () => void }[] = []
  if (q.value.search) chips.push({ rotulo: `"${q.value.search}"`, remover: () => aplicar({ search: undefined }) })
  if (q.value.brand) chips.push({ rotulo: q.value.brand, remover: () => aplicar({ brand: undefined }) })
  if (q.value.category) chips.push({ rotulo: q.value.category, remover: () => aplicar({ category: undefined }) })
  if (q.value.gender) chips.push({ rotulo: q.value.gender, remover: () => aplicar({ gender: undefined }) })
  if (q.value.min !== undefined) chips.push({ rotulo: `A partir de R$ ${q.value.min}`, remover: () => aplicar({ min: undefined }) })
  if (q.value.max !== undefined) chips.push({ rotulo: `Até R$ ${q.value.max}`, remover: () => aplicar({ max: undefined }) })
  return chips
})

const titulo = computed(() => {
  if (props.promocao) return 'Promoções'
  if (q.value.search) return `Busca: ${q.value.search}`
  return 'Todos os produtos'
})

function ehAtivo(chave: 'brand' | 'category' | 'gender', valor: string) {
  return q.value[chave].toLowerCase() === valor.toLowerCase()
}

onMounted(async () => {
  // Se as listas de filtro falharem, o catálogo continua funcionando sem elas
  const [resMarcas, resCategorias] = await Promise.allSettled([
    produtoService.listarMarcas(),
    produtoService.listarCategorias(),
  ])

  if (resMarcas.status === 'fulfilled') marcas.value = resMarcas.value
  if (resCategorias.status === 'fulfilled') {
    categorias.value = resCategorias.value.filter((c) => c.tipo === 'CATEGORIA')
    generos.value = resCategorias.value.filter((c) => c.tipo === 'GENERO')
  }
})
</script>

<template>
  <div ref="topoLista" class="max-w-7xl mx-auto px-6 py-10 scroll-mt-32">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <p v-if="promocao" class="font-mono text-xs text-court-orange tracking-widest mb-2">// PREÇOS REDUZIDOS</p>
        <h1 class="font-display uppercase text-4xl md:text-5xl break-words">{{ titulo }}</h1>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="!carregando" class="font-mono text-xs text-ink-secondary">
          {{ total }} {{ total === 1 ? 'produto' : 'produtos' }}
        </span>

        <button
          class="lg:hidden border border-line rounded h-10 px-4 text-sm font-bold flex items-center gap-2"
          :aria-expanded="filtrosAbertos"
          @click="filtrosAbertos = !filtrosAbertos"
        >
          <i class="ti ti-adjustments-horizontal" aria-hidden="true"></i>
          Filtros
          <span v-if="filtrosAtivos.length" class="bg-court-orange text-bg-dark text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {{ filtrosAtivos.length }}
          </span>
        </button>

        <label class="sr-only" for="ordenacao">Ordenar por</label>
        <select
          id="ordenacao"
          :value="q.sort"
          class="bg-bg-elevated border border-line rounded h-10 px-3 text-sm focus:outline-none focus:border-court-orange"
          @change="aplicar({ sort: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="o in ordenacoes" :key="o.valor" :value="o.valor">{{ o.rotulo }}</option>
        </select>
      </div>
    </div>

    <!-- FILTROS ATIVOS -->
    <div v-if="filtrosAtivos.length" class="flex flex-wrap items-center gap-2 mb-6">
      <button
        v-for="chip in filtrosAtivos"
        :key="chip.rotulo"
        class="flex items-center gap-1.5 border border-court-orange text-court-orange rounded-full pl-3 pr-2 py-1 text-xs font-bold hover:bg-court-orange hover:text-bg-dark transition-colors"
        :aria-label="`Remover filtro ${chip.rotulo}`"
        @click="chip.remover"
      >
        {{ chip.rotulo }} <i class="ti ti-x" aria-hidden="true"></i>
      </button>
      <button class="text-xs text-ink-secondary underline hover:text-ink-text ml-1" @click="limparFiltros">
        Limpar tudo
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">

      <!-- BARRA DE FILTROS -->
      <aside
        class="lg:block lg:sticky lg:top-36 h-fit bg-bg-elevated border border-line rounded p-5 space-y-6"
        :class="filtrosAbertos ? 'block' : 'hidden'"
      >
        <div v-if="generos.length">
          <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-widest mb-3">Gênero</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="g in generos"
              :key="g.id"
              class="border rounded-full px-3 py-1 text-xs font-bold transition-colors"
              :class="ehAtivo('gender', g.nome) ? 'border-court-orange bg-court-orange text-bg-dark' : 'border-line hover:border-ink-secondary'"
              :aria-pressed="ehAtivo('gender', g.nome)"
              @click="alternar('gender', g.nome)"
            >
              {{ g.nome }}
            </button>
          </div>
        </div>

        <div v-if="categorias.length">
          <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-widest mb-3">Categoria</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in categorias"
              :key="c.id"
              class="border rounded-full px-3 py-1 text-xs font-bold transition-colors"
              :class="ehAtivo('category', c.nome) ? 'border-court-orange bg-court-orange text-bg-dark' : 'border-line hover:border-ink-secondary'"
              :aria-pressed="ehAtivo('category', c.nome)"
              @click="alternar('category', c.nome)"
            >
              {{ c.nome }}
            </button>
          </div>
        </div>

        <div v-if="marcas.length">
          <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-widest mb-3">Marca</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="m in marcas"
              :key="m.id"
              class="border rounded-full px-3 py-1 text-xs font-bold transition-colors"
              :class="ehAtivo('brand', m.nome) ? 'border-court-orange bg-court-orange text-bg-dark' : 'border-line hover:border-ink-secondary'"
              :aria-pressed="ehAtivo('brand', m.nome)"
              @click="alternar('brand', m.nome)"
            >
              {{ m.nome }}
            </button>
          </div>
        </div>

        <form @submit.prevent="aplicarPreco">
          <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-widest mb-3">Preço (R$)</p>
          <div class="flex items-center gap-2">
            <input
              v-model="precoMin"
              type="number"
              min="0"
              inputmode="numeric"
              placeholder="Mín"
              aria-label="Preço mínimo"
              class="w-full min-w-0 bg-bg border border-line rounded px-2 h-9 text-sm focus:outline-none focus:border-court-orange"
              @change="aplicarPreco"
            />
            <span class="text-ink-secondary">–</span>
            <input
              v-model="precoMax"
              type="number"
              min="0"
              inputmode="numeric"
              placeholder="Máx"
              aria-label="Preço máximo"
              class="w-full min-w-0 bg-bg border border-line rounded px-2 h-9 text-sm focus:outline-none focus:border-court-orange"
              @change="aplicarPreco"
            />
          </div>
          <button type="submit" class="sr-only">Aplicar preço</button>
        </form>
      </aside>

      <!-- RESULTADOS -->
      <div>
        <ProductGrid
          tres-colunas
          :produtos="produtos"
          :carregando="carregando"
          :erro="erro"
          :esqueletos="6"
          :mensagem-vazio="promocao && !filtrosAtivos.length
            ? 'Nenhuma promoção no momento. Volte em breve!'
            : 'Nenhum produto encontrado com esses filtros.'"
          @tentar-novamente="recarregar"
        >
          <template #vazio>
            <button
              v-if="filtrosAtivos.length"
              class="inline-block bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide px-8 py-3 rounded hover:opacity-90 transition-opacity mt-4"
              @click="limparFiltros"
            >
              Limpar filtros
            </button>
            <router-link
              v-else-if="promocao"
              to="/produtos"
              class="inline-block bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide px-8 py-3 rounded hover:opacity-90 transition-opacity mt-4"
            >
              Ver todos os produtos
            </router-link>
          </template>
        </ProductGrid>

        <!-- PAGINAÇÃO -->
        <nav
          v-if="!carregando && !erro && totalPaginas > 1"
          class="flex items-center justify-center gap-2 mt-10"
          aria-label="Paginação"
        >
          <button
            :disabled="q.page <= 1"
            class="w-10 h-10 rounded border border-line flex items-center justify-center hover:border-court-orange transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Página anterior"
            @click="irParaPagina(q.page - 1)"
          >
            <i class="ti ti-chevron-left" aria-hidden="true"></i>
          </button>

          <button
            v-for="pagina in totalPaginas"
            :key="pagina"
            class="w-10 h-10 rounded border text-sm font-bold transition-colors"
            :class="pagina === q.page ? 'border-court-orange bg-court-orange text-bg-dark' : 'border-line hover:border-court-orange'"
            :aria-current="pagina === q.page ? 'page' : undefined"
            @click="irParaPagina(pagina)"
          >
            {{ pagina }}
          </button>

          <button
            :disabled="q.page >= totalPaginas"
            class="w-10 h-10 rounded border border-line flex items-center justify-center hover:border-court-orange transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Próxima página"
            @click="irParaPagina(q.page + 1)"
          >
            <i class="ti ti-chevron-right" aria-hidden="true"></i>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
