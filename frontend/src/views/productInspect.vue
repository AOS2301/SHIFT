<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductGrid from '../components/productGrid.vue'
import ProductImage from '../components/productImage.vue'
import { produtoService, type Produto } from '../services/produto.service'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { formatPrice, mensagemDeErro, slugify } from '../utils/format'

const route = useRoute()
const cartStore = useCartStore()
const toastStore = useToastStore()

const produto = ref<Produto | null>(null)
const relacionados = ref<Produto[]>([])
const carregando = ref(true)
const erro = ref<'' | 'nao-encontrado' | 'falha'>('')

const corSelecionada = ref('')
const tamanhoSelecionado = ref<number | null>(null)
const quantidade = ref(1)
const imagemAtiva = ref(0)
const adicionando = ref(false)
const mensagem = ref('')

// Galeria: imagem principal + imagens extras (sem repetir URL)
const galeria = computed(() => {
  if (!produto.value) return []
  const urls = [produto.value.imagemPrincipal, ...(produto.value.imagens ?? []).map((i) => i.url)]
  return [...new Set(urls.filter((url): url is string => !!url))]
})

const cores = computed(() => [...new Set(produto.value?.variantes.map((v) => v.cor) ?? [])])

// Tamanhos da cor escolhida, em ordem crescente
const variantesDaCor = computed(() =>
  (produto.value?.variantes ?? [])
    .filter((v) => v.cor === corSelecionada.value)
    .sort((a, b) => a.tamanho - b.tamanho),
)

const varianteAtual = computed(() =>
  variantesDaCor.value.find((v) => v.tamanho === tamanhoSelecionado.value),
)

// Quanto dessa variante já está no carrinho — limita o que ainda dá pra adicionar
const noCarrinho = computed(
  () => cartStore.itens.find((i) => i.variantId === varianteAtual.value?.id)?.quantidade ?? 0,
)
const maximo = computed(() =>
  varianteAtual.value ? Math.max(0, varianteAtual.value.estoque - noCarrinho.value) : 1,
)

const esgotado = computed(() => !!produto.value && produto.value.variantes.every((v) => v.estoque === 0))

const desconto = computed(() => {
  const p = produto.value
  return p?.precoPromocional ? Math.round((1 - p.precoPromocional / p.precoBase) * 100) : 0
})

async function carregar(id: number) {
  carregando.value = true
  erro.value = ''
  produto.value = null
  relacionados.value = []
  tamanhoSelecionado.value = null
  quantidade.value = 1
  imagemAtiva.value = 0
  mensagem.value = ''

  try {
    const resultado = await produtoService.buscarPorId(id)
    // A pessoa pode ter navegado pra outro produto enquanto este carregava
    if (Number(route.params.id) !== id) return

    produto.value = resultado
    // Já abre na primeira cor que tem estoque
    corSelecionada.value =
      resultado.variantes.find((v) => v.estoque > 0)?.cor ?? resultado.variantes[0]?.cor ?? ''
    document.title = `${resultado.nome} · SHIFT`

    carregarRelacionados(resultado)
  } catch (e) {
    const status = (e as { response?: { status?: number } })?.response?.status
    erro.value = status === 404 || status === 400 ? 'nao-encontrado' : 'falha'
  } finally {
    carregando.value = false
  }
}

// "Você também pode gostar": mesma categoria; se não tiver, mesma marca
async function carregarRelacionados(base: Produto) {
  try {
    let { data } = await produtoService.listar({ category: base.categoria.nome, limit: 5 })
    data = data.filter((p) => p.id !== base.id)

    if (data.length === 0) {
      const porMarca = await produtoService.listar({ brand: base.marca.nome, limit: 5 })
      data = porMarca.data.filter((p) => p.id !== base.id)
    }

    if (produto.value?.id === base.id) relacionados.value = data.slice(0, 4)
  } catch {
    /* seção opcional: sem relacionados, a página segue normal */
  }
}

function selecionarCor(cor: string) {
  corSelecionada.value = cor
  tamanhoSelecionado.value = null
  quantidade.value = 1
  mensagem.value = ''
}

function selecionarTamanho(tamanho: number, estoque: number) {
  if (estoque === 0) return
  tamanhoSelecionado.value = tamanho
  quantidade.value = 1
  mensagem.value = ''
}

async function adicionarAoCarrinho() {
  if (!produto.value) return

  if (!varianteAtual.value) {
    mensagem.value = 'Escolha um tamanho antes de continuar.'
    return
  }

  if (maximo.value === 0) {
    mensagem.value = 'Você já colocou no carrinho todas as unidades disponíveis desse tamanho.'
    return
  }

  adicionando.value = true
  mensagem.value = ''
  try {
    await cartStore.adicionar({
      variantId: varianteAtual.value.id,
      quantidade: quantidade.value,
      tamanho: varianteAtual.value.tamanho,
      cor: varianteAtual.value.cor,
      estoque: varianteAtual.value.estoque,
      produto: {
        id: produto.value.id,
        nome: produto.value.nome,
        marca: produto.value.marca.nome,
        imagemPrincipal: produto.value.imagemPrincipal,
        preco: produto.value.precoFinal,
      },
    })
    toastStore.sucesso(`${produto.value.nome} (tam. ${varianteAtual.value.tamanho}) adicionado ao carrinho.`)
    quantidade.value = 1
  } catch (e) {
    mensagem.value = mensagemDeErro(e, e instanceof Error ? e.message : 'Não foi possível adicionar ao carrinho.')
  } finally {
    adicionando.value = false
  }
}

// Recarrega quando o :id muda (ex: clique num produto relacionado)
watch(
  () => route.params.id,
  (id) => {
    if (route.name === 'product-inspect') carregar(Number(id))
  },
  { immediate: true },
)
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-10">

    <!-- CARREGANDO -->
    <div v-if="carregando" class="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse" aria-busy="true">
      <div class="bg-bg-elevated border border-line rounded aspect-square"></div>
      <div class="space-y-4 pt-2">
        <div class="h-3 bg-bg-elevated rounded w-1/4"></div>
        <div class="h-10 bg-bg-elevated rounded w-3/4"></div>
        <div class="h-8 bg-bg-elevated rounded w-1/3"></div>
        <div class="h-20 bg-bg-elevated rounded"></div>
        <div class="h-12 bg-bg-elevated rounded w-2/3"></div>
      </div>
    </div>

    <!-- NÃO ENCONTRADO / FALHA -->
    <div v-else-if="erro || !produto" class="text-center py-24">
      <p class="font-display uppercase text-4xl mb-3">
        {{ erro === 'nao-encontrado' ? 'Produto não encontrado' : 'Algo deu errado' }}
      </p>
      <p class="text-ink-secondary mb-8">
        {{ erro === 'nao-encontrado'
          ? 'Esse produto não existe ou saiu do catálogo.'
          : 'Não foi possível carregar o produto. Verifique sua conexão.' }}
      </p>
      <button
        v-if="erro === 'falha'"
        class="border border-line rounded px-6 py-3 text-sm font-bold hover:border-court-orange hover:text-court-orange transition-colors mr-3"
        @click="carregar(Number(route.params.id))"
      >
        Tentar de novo
      </button>
      <router-link
        to="/produtos"
        class="inline-block bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide px-8 py-3 rounded hover:opacity-90 transition-opacity"
      >
        Ver catálogo
      </router-link>
    </div>

    <!-- PRODUTO -->
    <template v-else>
      <nav class="text-sm text-ink-secondary flex flex-wrap items-center gap-2" aria-label="Você está em">
        <router-link to="/produtos" class="hover:text-ink-text transition-colors">Produtos</router-link>
        <span>/</span>
        <router-link :to="`/marca/${slugify(produto.marca.nome)}`" class="hover:text-ink-text transition-colors">
          {{ produto.marca.nome }}
        </router-link>
        <span>/</span>
        <span class="text-ink-text">{{ produto.nome }}</span>
      </nav>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-6">

        <!-- GALERIA -->
        <div>
          <div class="relative bg-bg-elevated border border-line rounded aspect-square overflow-hidden mb-4">
            <Transition name="page" mode="out-in">
              <ProductImage
                :key="galeria[imagemAtiva] ?? 'sem-foto'"
                :src="galeria[imagemAtiva]"
                :alt="`${produto.marca.nome} ${produto.nome}`"
              />
            </Transition>
            <span
              v-if="desconto > 0"
              class="absolute top-4 left-4 bg-court-orange text-bg-dark font-mono text-xs font-bold px-2.5 py-1 rounded"
            >
              −{{ desconto }}%
            </span>
          </div>

          <!-- Miniaturas só aparecem quando há mais de uma foto -->
          <div v-if="galeria.length > 1" class="grid grid-cols-5 gap-3">
            <button
              v-for="(url, indice) in galeria"
              :key="url"
              class="bg-bg-elevated border rounded aspect-square overflow-hidden transition-colors"
              :class="indice === imagemAtiva ? 'border-court-orange' : 'border-line hover:border-ink-secondary'"
              :aria-label="`Ver foto ${indice + 1}`"
              :aria-current="indice === imagemAtiva"
              @click="imagemAtiva = indice"
            >
              <ProductImage :src="url" :alt="`${produto.nome} — foto ${indice + 1}`" />
            </button>
          </div>
        </div>

        <!-- INFO -->
        <div>
          <p class="font-mono text-xs text-ink-secondary uppercase tracking-wide mb-2">
            {{ produto.marca.nome }} · {{ produto.categoria.nome }}<template v-if="produto.genero"> · {{ produto.genero.nome }}</template>
          </p>
          <h1 class="font-display uppercase text-4xl md:text-5xl mb-4">{{ produto.nome }}</h1>

          <div class="flex items-baseline gap-3 mb-6">
            <p class="font-display text-3xl text-court-orange">{{ formatPrice(produto.precoFinal) }}</p>
            <p v-if="produto.precoPromocional" class="text-ink-secondary line-through">
              {{ formatPrice(produto.precoBase) }}
            </p>
          </div>

          <p v-if="produto.descricao" class="text-ink-secondary leading-relaxed mb-8">{{ produto.descricao }}</p>

          <p v-if="esgotado" class="border border-court-orange text-court-orange rounded px-4 py-3 text-sm font-bold mb-6">
            Produto esgotado no momento.
          </p>

          <!-- SELETOR DE COR (só quando há mais de uma) -->
          <div v-if="cores.length > 1" class="mb-6">
            <p class="text-xs font-mono text-ink-secondary uppercase tracking-wide mb-3">Cor</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cor in cores"
                :key="cor"
                class="h-10 px-4 rounded border text-sm font-bold transition-colors"
                :class="corSelecionada === cor
                  ? 'border-court-orange bg-court-orange text-bg-dark'
                  : 'border-line bg-bg-elevated hover:border-ink-secondary'"
                :aria-pressed="corSelecionada === cor"
                @click="selecionarCor(cor)"
              >
                {{ cor }}
              </button>
            </div>
          </div>
          <p v-else-if="cores.length === 1" class="text-sm text-ink-secondary mb-6">
            Cor: <span class="text-ink-text font-bold">{{ cores[0] }}</span>
          </p>

          <!-- SELETOR DE TAMANHO -->
          <div class="mb-6">
            <p class="text-xs font-mono text-ink-secondary uppercase tracking-wide mb-3">Tamanho</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="variante in variantesDaCor"
                :key="variante.id"
                :disabled="variante.estoque === 0"
                :aria-pressed="tamanhoSelecionado === variante.tamanho"
                :title="variante.estoque === 0 ? 'Esgotado' : undefined"
                @click="selecionarTamanho(variante.tamanho, variante.estoque)"
                class="w-12 h-12 rounded border text-sm font-bold transition-all"
                :class="[
                  tamanhoSelecionado === variante.tamanho
                    ? 'border-court-orange bg-court-orange text-bg-dark scale-105'
                    : 'border-line bg-bg-elevated text-ink-text hover:border-ink-secondary',
                  variante.estoque === 0 ? 'opacity-30 cursor-not-allowed line-through' : '',
                ]"
              >
                {{ variante.tamanho }}
              </button>
            </div>
            <p v-if="varianteAtual && varianteAtual.estoque <= 3" class="text-xs text-court-orange mt-3">
              <i class="ti ti-flame" aria-hidden="true"></i>
              {{ varianteAtual.estoque === 1 ? 'Última unidade' : `Últimas ${varianteAtual.estoque} unidades` }} nesse tamanho
            </p>
          </div>

          <!-- QUANTIDADE -->
          <div class="mb-6">
            <p class="text-xs font-mono text-ink-secondary uppercase tracking-wide mb-3">Quantidade</p>
            <div class="flex items-center gap-3">
              <button
                :disabled="quantidade <= 1"
                aria-label="Diminuir quantidade"
                @click="quantidade = Math.max(1, quantidade - 1)"
                class="w-10 h-10 rounded border border-line flex items-center justify-center hover:border-court-orange transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                −
              </button>
              <span class="w-10 text-center font-bold" aria-live="polite">{{ quantidade }}</span>
              <button
                :disabled="quantidade >= maximo"
                aria-label="Aumentar quantidade"
                @click="quantidade = Math.min(maximo, quantidade + 1)"
                class="w-10 h-10 rounded border border-line flex items-center justify-center hover:border-court-orange transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                +
              </button>
              <span v-if="noCarrinho > 0" class="text-xs text-ink-secondary">{{ noCarrinho }} já no carrinho</span>
            </div>
          </div>

          <button
            :disabled="esgotado || adicionando"
            @click="adicionarAoCarrinho"
            class="w-full bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide h-12 rounded hover:opacity-90 active:scale-[0.99] transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <i class="ti ti-shopping-bag mr-1" aria-hidden="true"></i>
            {{ esgotado ? 'Esgotado' : adicionando ? 'Adicionando...' : 'Adicionar ao carrinho' }}
          </button>

          <p v-if="mensagem" class="text-sm mt-3 text-court-orange" role="alert">{{ mensagem }}</p>

          <ul class="mt-8 border-t border-dashed border-line pt-5 space-y-2 text-sm text-ink-secondary">
            <li><i class="ti ti-truck-delivery text-court-orange mr-2" aria-hidden="true"></i>Frete grátis acima de R$ 300</li>
            <li v-if="varianteAtual"><i class="ti ti-barcode text-court-orange mr-2" aria-hidden="true"></i>SKU <span class="font-mono">{{ varianteAtual.sku }}</span></li>
          </ul>
        </div>
      </div>

      <!-- RELACIONADOS -->
      <section v-if="relacionados.length" v-reveal class="mt-20">
        <h2 class="font-display uppercase text-3xl mb-8">Você também pode gostar</h2>
        <ProductGrid :produtos="relacionados" :carregando="false" erro="" />
      </section>
    </template>
  </div>
</template>
