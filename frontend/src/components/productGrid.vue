<script setup lang="ts">
import type { Produto } from '../services/produto.service'
import ProductImage from './productImage.vue'
import { formatPrice } from '../utils/format'

defineProps<{
  produtos: Produto[]
  carregando: boolean
  erro: string
  mensagemVazio?: string
  /** Quantos "esqueletos" mostrar enquanto carrega (padrão 8) */
  esqueletos?: number
  /** No máximo 3 colunas — pra telas que dividem espaço com uma barra lateral */
  tresColunas?: boolean
}>()

const emit = defineEmits<{ tentarNovamente: [] }>()

function tamanhosDisponiveis(produto: Produto) {
  const tamanhos = produto.variantes.filter((v) => v.estoque > 0).map((v) => v.tamanho)
  return [...new Set(tamanhos)].sort((a, b) => a - b)
}

function estoqueTotal(produto: Produto) {
  return produto.variantes.reduce((acc, v) => acc + v.estoque, 0)
}

function selo(produto: Produto) {
  const estoque = estoqueTotal(produto)
  if (estoque === 0) return { texto: 'ESGOTADO', destaque: true }
  if (estoque <= 6) return { texto: 'ÚLT. UNID.', destaque: true }
  return { texto: 'EM ESTOQUE', destaque: false }
}

function desconto(produto: Produto) {
  if (!produto.precoPromocional) return 0
  return Math.round((1 - produto.precoPromocional / produto.precoBase) * 100)
}
</script>

<template>
  <!-- CARREGANDO -->
  <div v-if="carregando" class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" :class="{ 'lg:grid-cols-4': !tresColunas }">
    <div
      v-for="i in esqueletos ?? 8"
      :key="i"
      class="bg-bg-elevated border border-line rounded overflow-hidden animate-pulse"
    >
      <div class="aspect-square bg-bg-elevated-2"></div>
      <div class="p-4 space-y-2">
        <div class="h-3 bg-bg-elevated-2 rounded w-1/3"></div>
        <div class="h-4 bg-bg-elevated-2 rounded w-2/3"></div>
        <div class="h-5 bg-bg-elevated-2 rounded w-1/2 mt-4"></div>
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
    <i class="ti ti-mood-empty text-4xl text-ink-secondary" aria-hidden="true"></i>
    <p class="text-ink-secondary mt-3 mb-2">{{ mensagemVazio || 'Nenhum produto encontrado.' }}</p>
    <slot name="vazio">
      <router-link
        to="/produtos"
        class="inline-block bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide px-8 py-3 rounded hover:opacity-90 transition-opacity mt-4"
      >
        Ver todos os produtos
      </router-link>
    </slot>
  </div>

  <!-- GRID DE PRODUTOS -->
  <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" :class="{ 'lg:grid-cols-4': !tresColunas }">
    <router-link
      v-for="(produto, indice) in produtos"
      :key="produto.id"
      :to="`/produtos/${produto.id}`"
      class="product-card group bg-bg-elevated border border-line rounded overflow-hidden"
      :style="{ animationDelay: `${Math.min(indice, 11) * 45}ms` }"
    >
      <div class="relative aspect-square bg-bg-elevated-2 border-b border-line overflow-hidden">
        <div class="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <ProductImage :src="produto.imagemPrincipal" :alt="`${produto.marca.nome} ${produto.nome}`" />
        </div>

        <span
          v-if="desconto(produto) > 0"
          class="absolute top-2.5 left-2.5 font-mono text-[10px] font-bold px-2 py-1 rounded bg-court-orange text-bg-dark"
        >
          −{{ desconto(produto) }}%
        </span>

        <span
          class="absolute top-2.5 right-2.5 font-mono text-[10px] px-2 py-1 rounded"
          :class="selo(produto).destaque ? 'bg-court-orange text-bg-dark' : 'bg-bg text-ink-text border border-line'"
        >
          {{ selo(produto).texto }}
        </span>
      </div>

      <div class="p-4">
        <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-wide mb-1">
          {{ produto.marca.nome }}
        </p>
        <p class="font-bold text-sm mb-3 group-hover:text-court-orange transition-colors">
          {{ produto.nome }}
        </p>

        <div class="flex gap-1.5 mb-3 flex-wrap min-h-[22px]">
          <span
            v-for="tamanho in tamanhosDisponiveis(produto)"
            :key="tamanho"
            class="font-mono text-[10px] border border-line text-ink-secondary px-1.5 py-0.5 rounded"
          >
            {{ tamanho }}
          </span>
        </div>

        <div class="flex justify-between items-center border-t border-dashed border-line pt-2.5">
          <span class="flex items-baseline gap-2 flex-wrap">
            <span class="font-display text-lg" :class="{ 'text-court-orange': produto.precoPromocional }">
              {{ formatPrice(produto.precoFinal) }}
            </span>
            <span v-if="produto.precoPromocional" class="text-xs text-ink-secondary line-through">
              {{ formatPrice(produto.precoBase) }}
            </span>
          </span>
          <i
            class="ti ti-arrow-right text-ink-secondary transition-transform group-hover:translate-x-1 group-hover:text-court-orange"
            aria-hidden="true"
          ></i>
        </div>
      </div>
    </router-link>
  </div>
</template>
