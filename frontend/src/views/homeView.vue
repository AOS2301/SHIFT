<script setup lang="ts">
import navBar from '../components/navBar.vue'
import { ref } from 'vue'


interface Product {
  id: number
  brand: string
  name: string
  price: number
  sizes: number[]
  ref: string
  stock: 'em_estoque' | 'ultimas_unidades'
}

const categories = [
  { name: 'Corrida', count: 42 },
  { name: 'Basquete', count: 28 },
  { name: 'Skate', count: 19 },
  { name: 'Lifestyle', count: 65 },
]

const products = ref<Product[]>([
  { id: 1, brand: 'Nike', name: 'Air Max Pulse', price: 899, sizes: [38, 40, 42], ref: 'REF. 004-BLK', stock: 'em_estoque' },
  { id: 2, brand: 'Adidas', name: 'Ultraboost Light', price: 1049, sizes: [39, 41, 43], ref: 'REF. 011-WHT', stock: 'em_estoque' },
  { id: 3, brand: 'New Balance', name: '550', price: 759, sizes: [37, 38, 40], ref: 'REF. 022-GRN', stock: 'ultimas_unidades' },
  { id: 4, brand: 'Vans', name: 'Old Skool', price: 429, sizes: [36, 39, 42], ref: 'REF. 007-BLK', stock: 'em_estoque' },
])

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: value % 1 === 0 ? 0 : 2 })
}
</script>

<template>
  <div class="bg-bg text-ink-text">
    <navBar />
    <!-- HERO -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-10 px-6 md:px-12 py-16 md:py-20 border-b border-line">
      <div>
        <p class="font-mono text-xs text-ink-secondary tracking-widest mb-4">// COLEÇÃO INVERNO 2026</p>
        <h1 class="font-display uppercase text-6xl md:text-8xl leading-[0.92] mb-6">
          CADA<br />PASSO<br /><span class="text-court-orange">CONTA.</span>
        </h1>
        <p class="text-ink-secondary max-w-md mb-8 leading-relaxed">
          Tênis selecionados pra quem entende de detalhe. Da quadra ao asfalto, sem enrolação.
        </p>
        <router-link
          to="/produtos"
          class="inline-block bg-court-orange text-bg-dark border border-court-orange px-8 py-4 font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          Ver coleção
        </router-link>
      </div>

      <div class="relative bg-bg-elevated border border-line rounded aspect-[4/3] flex items-center justify-center">
        <span class="absolute top-4 left-4 bg-court-orange text-bg-dark font-mono text-xs font-bold px-2.5 py-1 rounded">
          DESTAQUE
        </span>
        <span class="font-mono text-xs text-ink-secondary uppercase tracking-widest">[ Foto do produto ]</span>
      </div>
    </section>

    <!-- CATEGORIAS -->
    <section class="grid grid-cols-2 md:grid-cols-4 border-b border-line bg-bg-elevated">
      <button
        v-for="cat in categories"
        :key="cat.name"
        class="text-left px-6 py-7 border-r border-line last:border-r-0 hover:bg-bg-elevated-2 transition-colors"
      >
        <span class="font-display uppercase text-xl block">{{ cat.name }}</span>
        <span class="font-mono text-xs text-ink-secondary block mt-1">{{ cat.count }} produtos</span>
      </button>
    </section>

    <!-- PRODUTOS -->
    <section class="px-6 md:px-12 py-16">
      <div class="flex justify-between items-baseline mb-8">
        <h2 class="font-display uppercase text-3xl md:text-4xl">Mais vendidos</h2>
        <router-link to="/produtos" class="text-sm font-bold border-b-2 border-court-orange pb-0.5">
          Ver todos →
        </router-link>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <article
          v-for="product in products"
          :key="product.id"
          class="bg-bg-elevated border border-line rounded overflow-hidden"
        >
          <div class="relative aspect-square bg-bg-elevated-2 border-b border-line flex items-center justify-center">
            <span
              class="absolute top-2.5 right-2.5 font-mono text-[10px] px-2 py-1 rounded"
              :class="product.stock === 'em_estoque' ? 'bg-bg text-ink-text border border-line' : 'bg-court-orange text-bg-dark'"
            >
              {{ product.stock === 'em_estoque' ? 'EM ESTOQUE' : 'ÚLT. UNID.' }}
            </span>
            <span class="font-mono text-xs text-ink-secondary">[ Foto ]</span>
          </div>

          <div class="p-4">
            <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-wide mb-1">{{ product.brand }}</p>
            <p class="font-bold text-sm mb-3">{{ product.name }}</p>

            <div class="flex gap-1.5 mb-3">
              <span
                v-for="size in product.sizes"
                :key="size"
                class="font-mono text-[10px] border border-line text-ink-secondary px-1.5 py-0.5 rounded"
              >
                {{ size }}
              </span>
            </div>

            <div class="flex justify-between items-center border-t border-dashed border-line pt-2.5">
              <span class="font-display text-lg">{{ formatPrice(product.price) }}</span>
              <span class="font-mono text-[10px] text-ink-secondary">{{ product.ref }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

  </div>
</template>