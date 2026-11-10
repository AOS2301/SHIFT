<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProductImage from '../components/productImage.vue'
import { pedidoService, type Pedido, type StatusPedido } from '../services/pedido.service'
import { formatDate, formatPrice } from '../utils/format'

const pedidos = ref<Pedido[]>([])
const carregando = ref(true)
const erro = ref('')

const statusInfo: Record<StatusPedido, { rotulo: string; icone: string; destaque: boolean }> = {
  PENDING: { rotulo: 'Aguardando pagamento', icone: 'ti-clock', destaque: true },
  PAID: { rotulo: 'Pago', icone: 'ti-circle-check', destaque: false },
  SHIPPED: { rotulo: 'Enviado', icone: 'ti-truck-delivery', destaque: false },
  DELIVERED: { rotulo: 'Entregue', icone: 'ti-home-check', destaque: false },
  CANCELED: { rotulo: 'Cancelado', icone: 'ti-x', destaque: false },
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    pedidos.value = await pedidoService.listar()
  } catch {
    erro.value = 'Não foi possível carregar seus pedidos. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <h1 class="font-display uppercase text-4xl mb-8">Meus pedidos</h1>

    <div v-if="carregando" class="space-y-4 animate-pulse" aria-busy="true">
      <div v-for="i in 2" :key="i" class="h-40 bg-bg-elevated border border-line rounded"></div>
    </div>

    <div v-else-if="erro" class="text-center py-20">
      <p class="text-court-orange mb-4">{{ erro }}</p>
      <button
        class="border border-line rounded px-6 py-2 text-sm font-bold hover:border-court-orange hover:text-court-orange transition-colors"
        @click="carregar"
      >
        Tentar de novo
      </button>
    </div>

    <div v-else-if="pedidos.length === 0" class="text-center py-20">
      <i class="ti ti-package text-5xl text-ink-secondary" aria-hidden="true"></i>
      <p class="text-ink-secondary mt-4 mb-6">Você ainda não fez nenhum pedido.</p>
      <router-link
        to="/produtos"
        class="inline-block bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide px-8 py-3 rounded hover:opacity-90 transition-opacity"
      >
        Ver produtos
      </router-link>
    </div>

    <div v-else class="space-y-5">
      <article
        v-for="pedido in pedidos"
        :key="pedido.id"
        class="bg-bg-elevated border border-line rounded overflow-hidden"
      >
        <header class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line bg-bg-elevated-2">
          <div>
            <p class="font-display uppercase text-xl">Pedido #{{ pedido.id }}</p>
            <p class="font-mono text-[11px] text-ink-secondary">{{ formatDate(pedido.criadoEm) }}</p>
          </div>
          <span
            class="font-mono text-[11px] font-bold uppercase px-2.5 py-1 rounded flex items-center gap-1.5"
            :class="statusInfo[pedido.status].destaque ? 'bg-court-orange text-bg-dark' : 'border border-line text-ink-text'"
          >
            <i class="ti" :class="statusInfo[pedido.status].icone" aria-hidden="true"></i>
            {{ statusInfo[pedido.status].rotulo }}
          </span>
        </header>

        <ul class="divide-y divide-line">
          <li v-for="item in pedido.itens" :key="item.id" class="flex items-center gap-4 px-5 py-3">
            <router-link
              :to="`/produtos/${item.produto.id}`"
              class="w-14 h-14 bg-bg-elevated-2 border border-line rounded overflow-hidden shrink-0"
            >
              <ProductImage :src="item.produto.imagemPrincipal" :alt="item.produto.nome" />
            </router-link>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm truncate">{{ item.produto.marca }} {{ item.produto.nome }}</p>
              <p class="text-xs text-ink-secondary">
                Tamanho {{ item.tamanho }} · {{ item.cor }} · {{ item.quantidade }}×
              </p>
            </div>
            <span class="text-sm font-bold">{{ formatPrice(item.precoUnitario * item.quantidade) }}</span>
          </li>
        </ul>

        <footer class="flex justify-between items-center px-5 py-4 border-t border-dashed border-line">
          <span class="text-sm text-ink-secondary">Total (com frete)</span>
          <span class="font-display text-2xl">{{ formatPrice(pedido.total) }}</span>
        </footer>
      </article>
    </div>
  </div>
</template>
