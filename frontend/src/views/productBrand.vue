<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import navBar from '../components/navBar.vue'
import ProductGrid from '../components/productGrid.vue'
import { useProdutosFiltrados } from '../composables/useProdutosFiltrados'

const route = useRoute()

// Converte o slug da URL ("new-balance") no valor esperado pelo filtro da API
// ("new balance" — a busca no backend já ignora maiúscula/minúscula)
const marcaSlug = computed(() => String(route.params.marca || ''))
const marcaFiltro = computed(() => marcaSlug.value.replace(/-/g, ' '))

// Título bonito pra exibir na página ("new-balance" -> "New Balance")
const marcaTitulo = computed(() =>
  marcaSlug.value
    .split('-')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
)

const filtros = computed(() => ({ brand: marcaFiltro.value, limit: 24 }))

const { produtos, carregando, erro, recarregar } = useProdutosFiltrados(filtros)
</script>

<template>
  <div class="bg-bg text-ink-text min-h-screen">
    <navBar />

    <div class="max-w-6xl mx-auto px-6 py-10">
      <router-link to="/" class="text-sm text-ink-secondary hover:text-ink-text transition-colors">
        ← Voltar pra home
      </router-link>

      <div class="flex items-baseline justify-between mt-4 mb-8">
        <h1 class="font-display uppercase text-4xl md:text-5xl">{{ marcaTitulo }}</h1>
        <span v-if="!carregando" class="font-mono text-xs text-ink-secondary">
          {{ produtos.length }} {{ produtos.length === 1 ? 'produto' : 'produtos' }}
        </span>
      </div>

      <ProductGrid
        :produtos="produtos"
        :carregando="carregando"
        :erro="erro"
        :mensagem-vazio="`Ainda não temos produtos ${marcaTitulo} no catálogo.`"
        @tentar-novamente="recarregar"
      />
    </div>
  </div>
</template>