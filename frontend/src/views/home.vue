<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ProductGrid from '../components/productGrid.vue'
import ProductImage from '../components/productImage.vue'
import { useProdutosFiltrados } from '../composables/useProdutosFiltrados'
import { produtoService, type Categoria, type ListarProdutosParams } from '../services/produto.service'
import { formatPrice, slugify } from '../utils/format'

// Vitrines da home — cada uma é só um conjunto de filtros da API
const filtrosLancamentos = ref<ListarProdutosParams>({ limit: 8, sort: 'recentes' })
const filtrosPromocao = ref<ListarProdutosParams>({ limit: 4, promo: true })

const lancamentos = useProdutosFiltrados(filtrosLancamentos)
const promocoes = useProdutosFiltrados(filtrosPromocao)

const categorias = ref<Categoria[]>([])
const marcas = ref<string[]>(['Nike', 'Adidas', 'Vans', 'New Balance', 'Puma'])

// Destaque do hero: a primeira promoção, ou o lançamento mais recente
const destaque = computed(() => promocoes.produtos.value[0] ?? lancamentos.produtos.value[0] ?? null)

onMounted(async () => {
  // Falhas aqui não derrubam a home: as seções só não aparecem
  const [resCategorias, resMarcas] = await Promise.allSettled([
    produtoService.listarCategorias('CATEGORIA'),
    produtoService.listarMarcas(),
  ])

  if (resCategorias.status === 'fulfilled') categorias.value = resCategorias.value
  if (resMarcas.status === 'fulfilled' && resMarcas.value.length) {
    marcas.value = resMarcas.value.map((m) => m.nome)
  }
})
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-10 px-6 md:px-12 py-12 md:py-20 border-b border-line overflow-hidden">
      <div class="hero-texto">
        <p class="font-mono text-xs text-ink-secondary tracking-widest mb-4">// COLEÇÃO INVERNO 2026</p>
        <h1 class="font-display uppercase text-6xl md:text-8xl leading-[0.92] mb-6">
          CADA<br />PASSO<br /><span class="text-court-orange">CONTA.</span>
        </h1>
        <p class="text-ink-secondary max-w-md mb-8 leading-relaxed">
          Tênis selecionados pra quem entende de detalhe. Da quadra ao asfalto, sem enrolação.
        </p>
        <div class="flex flex-wrap gap-3">
          <router-link
            to="/produtos"
            class="inline-flex items-center gap-2 bg-court-orange text-bg-dark border border-court-orange px-8 py-4 font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
          >
            Ver coleção <i class="ti ti-arrow-right" aria-hidden="true"></i>
          </router-link>
          <router-link
            to="/promocao"
            class="inline-block border border-line px-8 py-4 font-bold text-sm uppercase tracking-wide hover:border-court-orange hover:text-court-orange transition-colors"
          >
            Promoções
          </router-link>
        </div>
      </div>

      <!-- Card de destaque: produto real vindo da API -->
      <component
        :is="destaque ? 'router-link' : 'div'"
        :to="destaque ? `/produtos/${destaque.id}` : undefined"
        class="hero-card group relative bg-bg-elevated border border-line rounded aspect-[4/3] overflow-hidden block"
        :class="{ 'animate-pulse': !destaque && lancamentos.carregando.value }"
      >
        <span class="absolute top-4 left-4 z-10 bg-court-orange text-bg-dark font-mono text-xs font-bold px-2.5 py-1 rounded">
          DESTAQUE
        </span>

        <template v-if="destaque">
          <div class="w-full h-full transition-transform duration-700 group-hover:scale-105">
            <ProductImage :src="destaque.imagemPrincipal" :alt="`${destaque.marca.nome} ${destaque.nome}`" />
          </div>
          <div class="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-bg via-bg/80 to-transparent flex items-end justify-between gap-4">
            <div>
              <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-widest">{{ destaque.marca.nome }}</p>
              <p class="font-display uppercase text-2xl md:text-3xl">{{ destaque.nome }}</p>
            </div>
            <div class="text-right">
              <p v-if="destaque.precoPromocional" class="text-xs text-ink-secondary line-through">
                {{ formatPrice(destaque.precoBase) }}
              </p>
              <p class="font-display text-2xl text-court-orange">{{ formatPrice(destaque.precoFinal) }}</p>
            </div>
          </div>
        </template>
      </component>
    </section>

    <!-- FAIXA DE MARCAS (a lista é duplicada pra rolagem ficar contínua) -->
    <section class="marquee border-b border-line py-4" aria-label="Marcas">
      <div class="marquee-track">
        <div v-for="copia in 2" :key="copia" class="flex shrink-0" :aria-hidden="copia === 2">
          <template v-for="repeticao in 3" :key="repeticao">
            <router-link
              v-for="marca in marcas"
              :key="marca"
              :to="`/marca/${slugify(marca)}`"
              :tabindex="copia === 2 || repeticao > 1 ? -1 : 0"
              class="font-display uppercase text-2xl text-ink-secondary hover:text-court-orange transition-colors px-8 whitespace-nowrap"
            >
              {{ marca }} <span class="text-court-orange ml-12">/</span>
            </router-link>
          </template>
        </div>
      </div>
    </section>

    <!-- CATEGORIAS (contagem real de produtos) -->
    <section v-if="categorias.length" class="grid grid-cols-2 md:grid-cols-4 border-b border-line bg-bg-elevated">
      <router-link
        v-for="cat in categorias"
        :key="cat.id"
        :to="{ path: '/produtos', query: { category: cat.nome } }"
        class="group text-left px-6 py-7 border-r border-b md:border-b-0 border-line last:border-r-0 hover:bg-bg-elevated-2 transition-colors"
      >
        <span class="font-display uppercase text-xl flex items-center justify-between">
          {{ cat.nome }}
          <i class="ti ti-arrow-up-right text-base text-ink-secondary transition-transform group-hover:text-court-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true"></i>
        </span>
        <span class="font-mono text-xs text-ink-secondary block mt-1">
          {{ cat.totalProdutos }} {{ cat.totalProdutos === 1 ? 'produto' : 'produtos' }}
        </span>
      </router-link>
    </section>

    <!-- LANÇAMENTOS -->
    <section v-reveal class="px-6 md:px-12 pt-16">
      <div class="flex justify-between items-baseline mb-8">
        <h2 class="font-display uppercase text-3xl md:text-4xl">Lançamentos</h2>
        <router-link to="/produtos" class="text-sm font-bold border-b-2 border-court-orange pb-0.5 hover:text-court-orange transition-colors">
          Ver todos →
        </router-link>
      </div>

      <ProductGrid
        :produtos="lancamentos.produtos.value"
        :carregando="lancamentos.carregando.value"
        :erro="lancamentos.erro.value"
        mensagem-vazio="O catálogo ainda está vazio. Volte em breve!"
        @tentar-novamente="lancamentos.recarregar"
      >
        <template #vazio><span></span></template>
      </ProductGrid>
    </section>

    <!-- PROMOÇÕES (só aparece se houver produto em promoção) -->
    <section v-if="promocoes.produtos.value.length" v-reveal class="px-6 md:px-12 pt-16">
      <div class="flex justify-between items-baseline mb-8">
        <h2 class="font-display uppercase text-3xl md:text-4xl">
          Em <span class="text-court-orange">promoção</span>
        </h2>
        <router-link to="/promocao" class="text-sm font-bold border-b-2 border-court-orange pb-0.5 hover:text-court-orange transition-colors">
          Ver todas →
        </router-link>
      </div>

      <ProductGrid :produtos="promocoes.produtos.value" :carregando="false" erro="" />
    </section>

    <!-- VANTAGENS -->
    <section v-reveal class="px-6 md:px-12 pt-16">
      <div class="grid grid-cols-1 md:grid-cols-3 border border-line rounded divide-y md:divide-y-0 md:divide-x divide-line bg-bg-elevated">
        <div class="flex items-center gap-4 p-6">
          <i class="ti ti-truck-delivery text-3xl text-court-orange" aria-hidden="true"></i>
          <div>
            <p class="font-bold text-sm">Frete grátis</p>
            <p class="text-xs text-ink-secondary">Em compras acima de R$ 300</p>
          </div>
        </div>
        <div class="flex items-center gap-4 p-6">
          <i class="ti ti-rosette-discount-check text-3xl text-court-orange" aria-hidden="true"></i>
          <div>
            <p class="font-bold text-sm">Curadoria de verdade</p>
            <p class="text-xs text-ink-secondary">Só modelos que a gente usaria</p>
          </div>
        </div>
        <div class="flex items-center gap-4 p-6">
          <i class="ti ti-ruler-measure text-3xl text-court-orange" aria-hidden="true"></i>
          <div>
            <p class="font-bold text-sm">Estoque em tempo real</p>
            <p class="text-xs text-ink-secondary">Você vê os tamanhos disponíveis na hora</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-texto {
  animation: hero-in 0.6s ease both;
}
.hero-card {
  animation: hero-in 0.6s ease 0.15s both;
}
@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}
</style>
