<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ProductGrid from '../components/productGrid.vue'
import { useProdutosFiltrados } from '../composables/useProdutosFiltrados'

const route = useRoute()

// A URL já vem certinha da navbar ("feminino", "masculino", "infantil"),
// só precisamos deixar com a primeira letra maiúscula pra bater com o
// nome do gênero salvo no banco ("Feminino", "Masculino"...)
const generoSlug = computed(() => String(route.params.genero || ''))
const generoTitulo = computed(
  () => generoSlug.value.charAt(0).toUpperCase() + generoSlug.value.slice(1)
)

// O backend filtra pelo gênero do produto (e inclui os Unissex em
// Masculino/Feminino)
const filtros = computed(() => ({ gender: generoTitulo.value, limit: 24 }))

watchEffect(() => (document.title = `${generoTitulo.value} · SHIFT`))

const { produtos, total, carregando, erro, recarregar } = useProdutosFiltrados(filtros)
</script>

<template>
    <div class="max-w-6xl mx-auto px-6 py-10">
      <router-link to="/" class="text-sm text-ink-secondary hover:text-ink-text transition-colors">
        ← Voltar pra home
      </router-link>

      <div class="flex items-baseline justify-between mt-4 mb-8">
        <h1 class="font-display uppercase text-4xl md:text-5xl">{{ generoTitulo }}</h1>
        <span v-if="!carregando" class="font-mono text-xs text-ink-secondary">
          {{ total }} {{ total === 1 ? 'produto' : 'produtos' }}
        </span>
      </div>

      <ProductGrid
        :produtos="produtos"
        :carregando="carregando"
        :erro="erro"
        :mensagem-vazio="`Ainda não temos produtos na seção ${generoTitulo}.`"
        @tentar-novamente="recarregar"
      />
    </div>
</template>