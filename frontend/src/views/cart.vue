<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProductImage from '../components/productImage.vue'
import { useAuthStore } from '../stores/auth'
import { useCartStore, FRETE_GRATIS_A_PARTIR_DE } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { pedidoService } from '../services/pedido.service'
import { formatPrice, mensagemDeErro } from '../utils/format'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

const finalizando = ref(false)
// Item com requisição em andamento (desabilita os botões só daquela linha)
const ocupado = ref<number | null>(null)

// Barra de progresso até o frete grátis
const progressoFrete = computed(() =>
  Math.min(100, Math.round((cartStore.subtotal / FRETE_GRATIS_A_PARTIR_DE) * 100)),
)

async function executar(variantId: number, acao: () => Promise<void>) {
  if (ocupado.value !== null) return
  ocupado.value = variantId
  try {
    await acao()
  } catch (e) {
    toastStore.erro(mensagemDeErro(e, 'Não foi possível atualizar o carrinho.'))
    // O carrinho pode ter mudado no servidor (estoque etc.) — busca o estado real
    cartStore.carregar().catch(() => {})
  } finally {
    ocupado.value = null
  }
}

function alterarQuantidade(variantId: number, quantidade: number) {
  executar(variantId, () => cartStore.alterarQuantidade(variantId, quantidade))
}

function removerItem(variantId: number) {
  executar(variantId, () => cartStore.remover(variantId))
}

async function finalizarCompra() {
  // O pedido fica ligado à conta: visitante faz login e volta pra cá com o
  // carrinho já sincronizado.
  if (!authStore.estaLogado) {
    toastStore.sucesso('Entre na sua conta pra finalizar a compra.')
    router.push({ path: '/login', query: { redirect: '/carrinho' } })
    return
  }

  finalizando.value = true
  try {
    const pedido = await pedidoService.finalizar()
    cartStore.limparLocal()
    toastStore.sucesso(`Pedido #${pedido.id} realizado!`)
    router.push('/pedidos')
  } catch (e) {
    toastStore.erro(mensagemDeErro(e, 'Não foi possível finalizar a compra.'))
    cartStore.carregar().catch(() => {})
  } finally {
    finalizando.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <h1 class="font-display uppercase text-4xl mb-8">
      Seu carrinho
      <span v-if="cartStore.quantidadeTotal" class="font-mono text-xs text-ink-secondary align-middle ml-2 normal-case">
        {{ cartStore.quantidadeTotal }} {{ cartStore.quantidadeTotal === 1 ? 'item' : 'itens' }}
      </span>
    </h1>

    <!-- CARREGANDO (primeira busca do carrinho da conta) -->
    <div v-if="cartStore.carregando && cartStore.itens.length === 0" class="space-y-4 animate-pulse">
      <div v-for="i in 2" :key="i" class="h-32 bg-bg-elevated border border-line rounded"></div>
    </div>

    <!-- CARRINHO VAZIO -->
    <div v-else-if="cartStore.itens.length === 0" class="text-center py-20">
      <i class="ti ti-shopping-bag text-5xl text-ink-secondary" aria-hidden="true"></i>
      <p class="text-ink-secondary mt-4 mb-6">Seu carrinho está vazio.</p>
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
      <TransitionGroup name="list" tag="div" class="lg:col-span-2 space-y-4 relative">
        <div
          v-for="item in cartStore.itens"
          :key="item.variantId"
          class="flex gap-4 bg-bg-elevated border border-line rounded p-4 transition-opacity"
          :class="{ 'opacity-60': ocupado === item.variantId }"
        >
          <router-link
            :to="`/produtos/${item.produto.id}`"
            class="w-24 h-24 bg-bg-elevated-2 border border-line rounded overflow-hidden shrink-0 hover:border-court-orange transition-colors"
          >
            <ProductImage :src="item.produto.imagemPrincipal" :alt="item.produto.nome" />
          </router-link>

          <div class="flex-1 min-w-0">
            <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-wide">{{ item.produto.marca }}</p>
            <router-link
              :to="`/produtos/${item.produto.id}`"
              class="font-bold text-sm mb-1 block hover:text-court-orange transition-colors truncate"
            >
              {{ item.produto.nome }}
            </router-link>
            <p class="text-xs text-ink-secondary mb-3">
              Tamanho {{ item.tamanho }} · {{ item.cor }} · {{ formatPrice(item.produto.preco) }} cada
            </p>

            <div class="flex items-center gap-3">
              <button
                :disabled="item.quantidade <= 1 || ocupado !== null"
                aria-label="Diminuir quantidade"
                @click="alterarQuantidade(item.variantId, item.quantidade - 1)"
                class="w-7 h-7 rounded border border-line flex items-center justify-center text-sm hover:border-court-orange transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                −
              </button>
              <span class="w-6 text-center text-sm font-bold" aria-live="polite">{{ item.quantidade }}</span>
              <button
                :disabled="item.quantidade >= item.estoque || ocupado !== null"
                aria-label="Aumentar quantidade"
                @click="alterarQuantidade(item.variantId, item.quantidade + 1)"
                class="w-7 h-7 rounded border border-line flex items-center justify-center text-sm hover:border-court-orange transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                +
              </button>
              <span v-if="item.quantidade >= item.estoque" class="text-[11px] text-ink-secondary">
                máx. em estoque
              </span>
            </div>
          </div>

          <div class="flex flex-col items-end justify-between">
            <button
              :disabled="ocupado !== null"
              @click="removerItem(item.variantId)"
              class="text-ink-secondary hover:text-court-orange transition-colors text-xs font-mono"
            >
              remover
            </button>
            <span class="font-display text-lg">{{ formatPrice(item.produto.preco * item.quantidade) }}</span>
          </div>
        </div>
      </TransitionGroup>

      <!-- RESUMO -->
      <div class="bg-bg-elevated border border-line rounded p-6 h-fit lg:sticky lg:top-36">
        <h2 class="font-display uppercase text-xl mb-5">Resumo</h2>

        <!-- Progresso até o frete grátis -->
        <div class="mb-5">
          <p class="text-xs text-ink-secondary mb-2">
            <template v-if="cartStore.frete > 0">
              Faltam <span class="text-ink-text font-bold">{{ formatPrice(FRETE_GRATIS_A_PARTIR_DE - cartStore.subtotal) }}</span> pro frete grátis
            </template>
            <template v-else>
              <i class="ti ti-truck-delivery text-court-orange" aria-hidden="true"></i> Você ganhou frete grátis!
            </template>
          </p>
          <div class="h-1.5 bg-bg rounded-full overflow-hidden">
            <div
              class="h-full bg-court-orange rounded-full transition-all duration-500"
              :style="{ width: `${progressoFrete}%` }"
            ></div>
          </div>
        </div>

        <div class="space-y-3 text-sm mb-5">
          <div class="flex justify-between text-ink-secondary">
            <span>Subtotal</span>
            <span>{{ formatPrice(cartStore.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-ink-secondary">
            <span>Frete</span>
            <span>{{ cartStore.frete === 0 ? 'Grátis' : formatPrice(cartStore.frete) }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center border-t border-dashed border-line pt-4 mb-6">
          <span class="font-bold">Total</span>
          <span class="font-display text-2xl">{{ formatPrice(cartStore.total) }}</span>
        </div>

        <button
          :disabled="finalizando || ocupado !== null"
          @click="finalizarCompra"
          class="w-full bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide h-12 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {{ finalizando ? 'Finalizando...' : authStore.estaLogado ? 'Finalizar compra' : 'Entrar e finalizar' }}
        </button>

        <router-link
          to="/produtos"
          class="block text-center text-xs text-ink-secondary hover:text-ink-text transition-colors mt-4"
        >
          ← Continuar comprando
        </router-link>
      </div>

    </div>
  </div>
</template>
