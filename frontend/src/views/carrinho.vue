<script setup lang="ts">
import { ref, computed } from 'vue'
import navBar from '../components/navBar.vue'

interface CartItem {
  id: number
  produto: string
  marca: string
  tamanho: number
  cor: string
  preco: number
  quantidade: number
}

// TODO: substituir por dados reais vindos de GET /cart
const itens = ref<CartItem[]>([
  { id: 1, produto: 'Air Max Pulse', marca: 'Nike', tamanho: 40, cor: 'Preto', preco: 899, quantidade: 1 },
  { id: 2, produto: 'Old Skool', marca: 'Vans', tamanho: 39, cor: 'Preto/Branco', preco: 429, quantidade: 2 },
])

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function alterarQuantidade(id: number, delta: number) {
  const item = itens.value.find((i) => i.id === id)
  if (!item) return
  item.quantidade = Math.max(1, item.quantidade + delta)
  // TODO: chamar API real (PUT /cart/:itemId)
}

function removerItem(id: number) {
  itens.value = itens.value.filter((i) => i.id !== id)
  // TODO: chamar API real (DELETE /cart/:itemId)
}

const subtotal = computed(() =>
  itens.value.reduce((acc, item) => acc + item.preco * item.quantidade, 0)
)

const frete = computed(() => (subtotal.value > 0 && subtotal.value < 300 ? 29.9 : 0))
const total = computed(() => subtotal.value + frete.value)
</script>

<template>
  <div class="bg-bg text-ink-text min-h-screen">
    <navBar />

    <div class="max-w-6xl mx-auto px-6 py-10">
      <h1 class="font-display uppercase text-4xl mb-8">Seu carrinho</h1>

      <!-- CARRINHO VAZIO -->
      <div v-if="itens.length === 0" class="text-center py-20">
        <p class="text-ink-secondary mb-6">Seu carrinho está vazio.</p>
        <router-link
          to="/produtos"
          class="inline-block bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide px-8 py-3 rounded hover:opacity-90 transition-opacity"
        >
          Ver produtos
        </router-link>
      </div>

      <!-- CARRINHO COM ITENS -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <!-- LISTA DE ITENS -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in itens"
            :key="item.id"
            class="flex gap-4 bg-bg-elevated border border-line rounded p-4"
          >
            <div class="w-24 h-24 bg-bg-elevated-2 border border-line rounded flex items-center justify-center shrink-0">
              <span class="font-mono text-[10px] text-ink-secondary">[ Foto ]</span>
            </div>

            <div class="flex-1">
              <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-wide">{{ item.marca }}</p>
              <p class="font-bold text-sm mb-1">{{ item.produto }}</p>
              <p class="text-xs text-ink-secondary mb-3">Tamanho {{ item.tamanho }} · {{ item.cor }}</p>

              <div class="flex items-center gap-3">
                <button
                  @click="alterarQuantidade(item.id, -1)"
                  class="w-7 h-7 rounded border border-line flex items-center justify-center text-sm hover:border-court-orange transition-colors"
                >
                  −
                </button>
                <span class="w-6 text-center text-sm font-bold">{{ item.quantidade }}</span>
                <button
                  @click="alterarQuantidade(item.id, 1)"
                  class="w-7 h-7 rounded border border-line flex items-center justify-center text-sm hover:border-court-orange transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div class="flex flex-col items-end justify-between">
              <button
                @click="removerItem(item.id)"
                class="text-ink-secondary hover:text-court-orange transition-colors text-xs font-mono"
              >
                remover
              </button>
              <span class="font-display text-lg">{{ formatPrice(item.preco * item.quantidade) }}</span>
            </div>
          </div>
        </div>

        <!-- RESUMO -->
        <div class="bg-bg-elevated border border-line rounded p-6 h-fit">
          <h2 class="font-display uppercase text-xl mb-5">Resumo</h2>

          <div class="space-y-3 text-sm mb-5">
            <div class="flex justify-between text-ink-secondary">
              <span>Subtotal</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-ink-secondary">
              <span>Frete</span>
              <span>{{ frete === 0 ? 'Grátis' : formatPrice(frete) }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center border-t border-dashed border-line pt-4 mb-6">
            <span class="font-bold">Total</span>
            <span class="font-display text-2xl">{{ formatPrice(total) }}</span>
          </div>

          <button
            class="w-full bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide h-12 rounded hover:opacity-90 transition-opacity"
          >
            Finalizar compra
          </button>

          <p v-if="frete > 0" class="text-xs text-ink-secondary mt-3 text-center">
            Faltam {{ formatPrice(300 - subtotal) }} pro frete grátis
          </p>
        </div>

      </div>
    </div>
  </div>
</template>