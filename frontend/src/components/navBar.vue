<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')

const primaryLinks = ['Feminino', 'Masculino', 'Infantil']
const brandLinks = ['Nike', 'Adidas', 'Vans', 'New Balance', 'Puma']

function handleSearch() {
  console.log('Buscando por:', searchQuery.value)
}
</script>

<template>
  <header class="bg-bg text-ink-text border-b border-line">

    <!-- ROW 1: logo, busca, conta, carrinho -->
    <div class="flex items-center gap-8 px-6 md:px-12 py-4 border-b border-line">
      <router-link to="/" class="font-display uppercase text-2xl tracking-wide whitespace-nowrap">
        SHIFT<span class="text-court-orange">.</span>
      </router-link>

      <div class="flex-1 max-w-lg flex">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar"
          class="flex-1 border border-line border-r-0 rounded-l bg-bg-elevated text-ink-text placeholder:text-ink-secondary px-4 h-11 text-sm focus:outline-none focus:border-court-orange"
          @keyup.enter="handleSearch"
        />
        <button
          class="bg-court-orange text-bg-dark border border-court-orange rounded-r px-5 font-bold text-sm uppercase tracking-wide"
          @click="handleSearch"
        >
          Buscar
        </button>
      </div>

      <div class="flex items-center gap-7 ml-auto">
        <button class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-full border border-line bg-bg-elevated flex items-center justify-center text-ink-secondary">
            <i class="ti ti-user" aria-hidden="true"></i>
          </span>
          <span class="text-sm font-bold">Minha conta</span>
          <i class="ti ti-chevron-down text-xs text-ink-secondary" aria-hidden="true"></i>
        </button>

        <router-link to="/carrinho" class="flex items-center gap-2">
          <span class="relative w-7 h-7 rounded-md border border-line bg-bg-elevated flex items-center justify-center">
            <i class="ti ti-shopping-bag text-sm" aria-hidden="true"></i>
            <span class="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-court-orange text-bg-dark text-[10px] font-bold flex items-center justify-center">
              0
            </span>
          </span>
          <span class="text-sm leading-tight text-left">
            <span class="block text-ink-secondary text-[11px]">Seu carrinho</span>
            <span class="block font-bold">R$ 0,00</span>
          </span>
        </router-link>
      </div>
    </div>

    <!-- ROW 2: categorias, marcas, promoção -->
    <div class="flex items-center gap-7 px-6 md:px-12 h-13 bg-bg-elevated">
      <nav class="flex gap-6">
        <router-link
          v-for="link in primaryLinks"
          :key="link"
          :to="`/${link.toLowerCase()}`"
          class="font-bold text-sm uppercase hover:text-court-orange transition-colors"
        >
          {{ link }}
        </router-link>
      </nav>

      <div class="w-px h-5 bg-line"></div>

      <nav class="flex gap-5">
        <router-link
          v-for="brand in brandLinks"
          :key="brand"
          :to="`/marca/${brand.toLowerCase().replace(' ', '-')}`"
          class="text-sm text-ink-secondary hover:text-ink-text transition-colors"
        >
          {{ brand }}
        </router-link>
      </nav>

      <button class="border border-line rounded-full px-4 py-1 text-sm font-bold hover:border-court-orange hover:text-court-orange transition-colors">
        Roupas
      </button>

      <router-link
        to="/promocao"
        class="ml-auto bg-court-orange text-bg-dark font-mono font-bold text-xs uppercase tracking-wide px-4 py-2 rounded"
      >
        Promoção
      </router-link>
    </div>

  </header>
</template>