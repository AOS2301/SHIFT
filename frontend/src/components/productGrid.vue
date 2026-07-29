<script setup lang="ts">
import type { Produto } from '../services/produto.service'

defineProps<{
  produtos: Produto[]
  carregando: boolean
  erro: string
  mensagemVazio?: string
}>()

const emit = defineEmits<{ tentarNovamente: [] }>()

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function tamanhosDisponiveis(produto: Produto) {
  return produto.variantes.filter((v) => v.estoque > 0).map((v) => v.tamanho)
}

function temEstoque(produto: Produto) {
  return produto.variantes.some((v) => v.estoque > 0)
}
</script>

<template>
  <!-- CARREGANDO -->
  <div v-if="carregando" class="grid grid-cols-2 md:grid-cols-4 gap-6">
    <div v-for="i in 8" :key="i" class="bg-bg-elevated border border-line rounded overflow-hidden animate-pulse">
      <div class="aspect-square bg-bg-elevated-2"></div>
      <div class="p-4 space-y-2">
        <div class="h-3 bg-bg-elevated-2 rounded w-1/3"></div>
        <div class="h-4 bg-bg-elevated-2 rounded w-2/3"></div>
      </div>
    </div>
  </div>

  <!-- ERRO -->
  <div v-else-if="erro" class="text-center py-20">
    <p class="text-court-orange mb-4">{{ erro }}</p>
    <button
      @click="emit('tentarNovamente')"
      class="border border-line rounded px-6 py-2 text-sm font-bold hover:border-court-orange hover:text-court-orange transition-colors"
    >
      Tentar de novo
    </button>
  </div>

  <!-- SEM RESULTADOS -->
  <div v-else-if="produtos.length === 0" class="text-center py-20">
    <p class="text-ink-secondary mb-2">{{ mensagemVazio || 'Nenhum produto encontrado.' }}</p>
    <router-link
      to="/"
      class="inline-block bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide px-8 py-3 rounded hover:opacity-90 transition-opacity mt-4"
    >
      Ver todos os produtos
    </router-link>
  </div>

  <!-- GRID DE PRODUTOS -->
  <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
    <router-link
      v-for="produto in produtos"
      :key="produto.id"
      :to="`/produtos/${produto.id}`"
      class="bg-bg-elevated border border-line rounded overflow-hidden hover:border-court-orange transition-colors"
    >
      <div class="relative aspect-square bg-bg-elevated-2 border-b border-line flex items-center justify-center">
        <span
          class="absolute top-2.5 right-2.5 font-mono text-[10px] px-2 py-1 rounded"
          :class="temEstoque(produto) ? 'bg-bg text-ink-text border border-line' : 'bg-court-orange text-bg-dark'"
        >
          {{ temEstoque(produto) ? 'EM ESTOQUE' : 'ESGOTADO' }}
        </span>
        <span class="font-mono text-xs text-ink-secondary">[ Foto ]</span>
      </div>

      <div class="p-4">
        <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-wide mb-1">
          {{ produto.marca.nome }}
        </p>
        <p class="font-bold text-sm mb-3">{{ produto.nome }}</p>

        <div class="flex gap-1.5 mb-3 flex-wrap">
          <span
            v-for="tamanho in tamanhosDisponiveis(produto)"
            :key="tamanho"
            class="font-mono text-[10px] border border-line text-ink-secondary px-1.5 py-0.5 rounded"
          >
            {{ tamanho }}
          </span>
        </div>

        <div class="flex justify-between items-center border-t border-dashed border-line pt-2.5">
          <span class="font-display text-lg">{{ formatPrice(produto.precoBase) }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>