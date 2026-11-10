<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { produtoService } from '../services/produto.service'
import { formatPrice, slugify } from '../utils/format'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

const searchQuery = ref(String(route.query.search ?? ''))
const contaAberta = ref(false)
const menuAberto = ref(false)
const contaRef = ref<HTMLElement | null>(null)
const carrinhoPulsando = ref(false)

const primaryLinks = ['Feminino', 'Masculino', 'Infantil']
// Lista padrão; é substituída pelas marcas reais da API assim que carregam
const brandLinks = ref(['Nike', 'Adidas', 'Vans', 'New Balance', 'Puma'])

function handleSearch() {
  const termo = searchQuery.value.trim()
  router.push({ path: '/produtos', query: termo ? { search: termo } : {} })
}

function toggleConta() {
  contaAberta.value = !contaAberta.value
}

function sair() {
  authStore.logout()
  contaAberta.value = false
  toastStore.sucesso('Você saiu da sua conta.')
  if (route.meta.requiresAuth) router.push('/')
}

// Fecha o dropdown se clicar fora dele
function handleClickOutside(event: MouseEvent) {
  if (contaRef.value && !contaRef.value.contains(event.target as Node)) {
    contaAberta.value = false
  }
}

// Mantém o campo de busca em sincronia com a URL e fecha os menus ao navegar
watch(
  () => route.fullPath,
  () => {
    searchQuery.value = String(route.query.search ?? '')
    contaAberta.value = false
    menuAberto.value = false
  },
)

// Dá um "pulinho" no ícone do carrinho quando a quantidade muda
watch(
  () => cartStore.quantidadeTotal,
  (nova, antiga) => {
    if (nova <= antiga) return
    carrinhoPulsando.value = true
    setTimeout(() => (carrinhoPulsando.value = false), 400)
  },
)

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  try {
    const marcas = await produtoService.listarMarcas()
    if (marcas.length) brandLinks.value = marcas.map((m) => m.nome)
  } catch {
    /* mantém a lista padrão */
  }
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <header class="bg-bg text-ink-text border-b border-line sticky top-0 z-40">

    <!-- ROW 1: logo, busca, conta, carrinho -->
    <div class="flex items-center gap-3 md:gap-8 px-4 md:px-12 py-3 md:py-4 border-b border-line">
      <button
        class="md:hidden w-9 h-9 rounded border border-line bg-bg-elevated flex items-center justify-center"
        :aria-label="menuAberto ? 'Fechar menu' : 'Abrir menu'"
        :aria-expanded="menuAberto"
        @click="menuAberto = !menuAberto"
      >
        <i class="ti" :class="menuAberto ? 'ti-x' : 'ti-menu-2'" aria-hidden="true"></i>
      </button>

      <router-link to="/" class="font-display uppercase text-2xl tracking-wide whitespace-nowrap">
        SHIFT<span class="text-court-orange">.</span>
      </router-link>

      <form class="hidden md:flex flex-1 max-w-lg" role="search" @submit.prevent="handleSearch">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Buscar por modelo ou marca"
          aria-label="Buscar produtos"
          class="flex-1 min-w-0 border border-line border-r-0 rounded-l bg-bg-elevated text-ink-text placeholder:text-ink-secondary px-4 h-11 text-sm focus:outline-none focus:border-court-orange"
        />
        <button
          type="submit"
          class="bg-court-orange text-bg-dark border border-court-orange rounded-r px-5 font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          Buscar
        </button>
      </form>

      <div class="flex items-center gap-4 md:gap-7 ml-auto">

        <!-- MINHA CONTA (com dropdown) -->
        <div ref="contaRef" class="relative">
          <button class="flex items-center gap-2" :aria-expanded="contaAberta" @click="toggleConta">
            <span
              class="w-8 h-8 rounded-full border flex items-center justify-center"
              :class="authStore.estaLogado
                ? 'border-court-orange bg-court-orange text-bg-dark font-bold text-sm'
                : 'border-line bg-bg-elevated text-ink-secondary'"
            >
              <template v-if="authStore.estaLogado">{{ authStore.primeiroNome.charAt(0).toUpperCase() }}</template>
              <i v-else class="ti ti-user" aria-hidden="true"></i>
            </span>
            <span class="hidden sm:block text-sm font-bold max-w-32 truncate">
              {{ authStore.estaLogado ? `Olá, ${authStore.primeiroNome}` : 'Minha conta' }}
            </span>
            <i
              class="ti ti-chevron-down text-xs text-ink-secondary transition-transform"
              :class="{ 'rotate-180': contaAberta }"
              aria-hidden="true"
            ></i>
          </button>

          <Transition name="dropdown">
            <div
              v-if="contaAberta"
              class="absolute right-0 top-full mt-2 w-52 bg-bg-elevated border border-line rounded shadow-lg overflow-hidden z-10"
            >
              <template v-if="authStore.estaLogado">
                <p class="px-4 py-3 text-xs text-ink-secondary truncate border-b border-line">
                  {{ authStore.usuario?.email }}
                </p>
                <router-link to="/pedidos" class="block px-4 py-3 text-sm hover:bg-bg-elevated-2 transition-colors">
                  <i class="ti ti-package mr-2" aria-hidden="true"></i>Meus pedidos
                </router-link>
                <button
                  class="w-full text-left px-4 py-3 text-sm border-t border-line hover:bg-bg-elevated-2 hover:text-court-orange transition-colors"
                  @click="sair"
                >
                  <i class="ti ti-logout mr-2" aria-hidden="true"></i>Sair
                </button>
              </template>
              <template v-else>
                <router-link to="/login" class="block px-4 py-3 text-sm hover:bg-bg-elevated-2 transition-colors">
                  Entrar
                </router-link>
                <router-link
                  to="/cadastro"
                  class="block px-4 py-3 text-sm border-t border-line hover:bg-bg-elevated-2 transition-colors"
                >
                  Criar conta
                </router-link>
              </template>
            </div>
          </Transition>
        </div>

        <!-- CARRINHO -->
        <router-link to="/carrinho" class="flex items-center gap-2" aria-label="Ver carrinho">
          <span
            class="relative w-8 h-8 rounded-md border border-line bg-bg-elevated flex items-center justify-center"
            :class="{ 'cart-bump': carrinhoPulsando }"
          >
            <i class="ti ti-shopping-bag text-sm" aria-hidden="true"></i>
            <span
              v-if="cartStore.quantidadeTotal > 0"
              class="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-court-orange text-bg-dark text-[10px] font-bold flex items-center justify-center"
            >
              {{ cartStore.quantidadeTotal }}
            </span>
          </span>
          <span class="hidden sm:block text-sm leading-tight text-left">
            <span class="block text-ink-secondary text-[11px]">Seu carrinho</span>
            <span class="block font-bold">{{ formatPrice(cartStore.subtotal) }}</span>
          </span>
        </router-link>
      </div>
    </div>

    <!-- ROW 2 (desktop): gêneros, marcas, promoção -->
    <div class="hidden md:flex items-center gap-7 px-12 h-13 bg-bg-elevated">
      <nav class="flex gap-6">
        <router-link
          v-for="link in primaryLinks"
          :key="link"
          :to="`/${link.toLowerCase()}`"
          class="nav-link font-bold text-sm uppercase hover:text-court-orange transition-colors"
        >
          {{ link }}
        </router-link>
      </nav>

      <div class="w-px h-5 bg-line"></div>

      <nav class="flex gap-5 overflow-x-auto">
        <router-link
          v-for="brand in brandLinks"
          :key="brand"
          :to="`/marca/${slugify(brand)}`"
          class="nav-link text-sm text-ink-secondary hover:text-ink-text transition-colors whitespace-nowrap"
        >
          {{ brand }}
        </router-link>
      </nav>

      <router-link
        to="/produtos"
        class="border border-line rounded-full px-4 py-1 text-sm font-bold hover:border-court-orange hover:text-court-orange transition-colors whitespace-nowrap"
      >
        Ver tudo
      </router-link>

      <router-link
        to="/promocao"
        class="ml-auto bg-court-orange text-bg-dark font-mono font-bold text-xs uppercase tracking-wide px-4 py-2 rounded hover:opacity-90 transition-opacity"
      >
        Promoção
      </router-link>
    </div>

    <!-- MENU MOBILE -->
    <Transition name="dropdown">
      <div v-if="menuAberto" class="md:hidden bg-bg-elevated border-t border-line px-4 py-4 space-y-5">
        <form class="flex" role="search" @submit.prevent="handleSearch">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar por modelo ou marca"
            aria-label="Buscar produtos"
            class="flex-1 min-w-0 border border-line border-r-0 rounded-l bg-bg text-ink-text placeholder:text-ink-secondary px-4 h-11 text-sm focus:outline-none focus:border-court-orange"
          />
          <button type="submit" class="bg-court-orange text-bg-dark rounded-r px-4" aria-label="Buscar">
            <i class="ti ti-search" aria-hidden="true"></i>
          </button>
        </form>

        <nav class="flex flex-wrap gap-x-6 gap-y-3">
          <router-link
            v-for="link in primaryLinks"
            :key="link"
            :to="`/${link.toLowerCase()}`"
            class="nav-link font-bold text-sm uppercase"
          >
            {{ link }}
          </router-link>
          <router-link to="/produtos" class="nav-link font-bold text-sm uppercase">Ver tudo</router-link>
          <router-link to="/promocao" class="font-bold text-sm uppercase text-court-orange">Promoção</router-link>
        </nav>

        <nav class="flex flex-wrap gap-x-5 gap-y-3 border-t border-line pt-4">
          <router-link
            v-for="brand in brandLinks"
            :key="brand"
            :to="`/marca/${slugify(brand)}`"
            class="nav-link text-sm text-ink-secondary"
          >
            {{ brand }}
          </router-link>
        </nav>
      </div>
    </Transition>

  </header>
</template>
