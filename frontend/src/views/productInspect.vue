<script setup lang="ts">
import { ref, computed } from 'vue'
import navBar from '../components/navBar.vue'

// TODO: substituir por dados reais vindos de GET /products/:id
const produto = ref({
  id: 1,
  nome: 'Air Max Pulse',
  marca: 'Nike',
  descricao:
    'Amortecimento leve pro dia a dia, com solado responsivo e cabedal respirável. Feito pra quem não para.',
  precoBase: 899.0,
  variantes: [
    { id: 1, tamanho: 38, cor: 'Preto', estoque: 5 },
    { id: 2, tamanho: 40, cor: 'Preto', estoque: 3 },
    { id: 3, tamanho: 42, cor: 'Preto', estoque: 0 },
  ],
})

const tamanhoSelecionado = ref<number | null>(null)
const quantidade = ref(1)
const mensagem = ref('')

const variantesDisponiveis = computed(() => produto.value.variantes)

const varianteAtual = computed(() =>
  variantesDisponiveis.value.find((v) => v.tamanho === tamanhoSelecionado.value)
)

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function selecionarTamanho(tamanho: number, estoque: number) {
  if (estoque === 0) return
  tamanhoSelecionado.value = tamanho
  mensagem.value = ''
}

function adicionarAoCarrinho() {
  if (!tamanhoSelecionado.value) {
    mensagem.value = 'Escolha um tamanho antes de continuar.'
    return
  }

  // TODO: chamar API real (POST /cart) com variantId + quantidade
  console.log('Adicionar ao carrinho:', varianteAtual.value, 'qtd:', quantidade.value)
  mensagem.value = 'Adicionado ao carrinho!'
}
</script>

<template>
  <div class="bg-bg text-ink-text min-h-screen">
    <navBar />

    <div class="max-w-6xl mx-auto px-6 py-10">
      <router-link to="/produtos" class="text-sm text-ink-secondary hover:text-ink-text transition-colors">
        ← Voltar pra listagem
      </router-link>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">

        <!-- GALERIA -->
        <div>
          <div class="bg-bg-elevated border border-line rounded aspect-square flex items-center justify-center mb-4">
            <span class="font-mono text-xs text-ink-secondary uppercase tracking-widest">[ Foto do produto ]</span>
          </div>
          <div class="grid grid-cols-4 gap-3">
            <div
              v-for="i in 4"
              :key="i"
              class="bg-bg-elevated border border-line rounded aspect-square flex items-center justify-center cursor-pointer hover:border-court-orange transition-colors"
            >
              <span class="font-mono text-[10px] text-ink-secondary">{{ i }}</span>
            </div>
          </div>
        </div>

        <!-- INFO -->
        <div>
          <p class="font-mono text-xs text-ink-secondary uppercase tracking-wide mb-2">{{ produto.marca }}</p>
          <h1 class="font-display uppercase text-4xl mb-4">{{ produto.nome }}</h1>
          <p class="font-display text-3xl text-court-orange mb-6">{{ formatPrice(produto.precoBase) }}</p>

          <p class="text-ink-secondary leading-relaxed mb-8">{{ produto.descricao }}</p>

          <!-- SELETOR DE TAMANHO -->
          <div class="mb-6">
            <p class="text-xs font-mono text-ink-secondary uppercase tracking-wide mb-3">Tamanho</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="variante in variantesDisponiveis"
                :key="variante.id"
                :disabled="variante.estoque === 0"
                @click="selecionarTamanho(variante.tamanho, variante.estoque)"
                class="w-12 h-12 rounded border text-sm font-bold transition-colors"
                :class="[
                  tamanhoSelecionado === variante.tamanho
                    ? 'border-court-orange bg-court-orange text-bg-dark'
                    : 'border-line bg-bg-elevated text-ink-text hover:border-ink-secondary',
                  variante.estoque === 0 ? 'opacity-30 cursor-not-allowed line-through' : '',
                ]"
              >
                {{ variante.tamanho }}
              </button>
            </div>
          </div>

          <!-- QUANTIDADE -->
          <div class="mb-6">
            <p class="text-xs font-mono text-ink-secondary uppercase tracking-wide mb-3">Quantidade</p>
            <div class="flex items-center gap-3">
              <button
                @click="quantidade = Math.max(1, quantidade - 1)"
                class="w-10 h-10 rounded border border-line flex items-center justify-center hover:border-court-orange transition-colors"
              >
                −
              </button>
              <span class="w-10 text-center font-bold">{{ quantidade }}</span>
              <button
                @click="quantidade++"
                class="w-10 h-10 rounded border border-line flex items-center justify-center hover:border-court-orange transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            @click="adicionarAoCarrinho"
            class="w-full bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide h-12 rounded hover:opacity-90 transition-opacity"
          >
            Adicionar ao carrinho
          </button>

          <p v-if="mensagem" class="text-sm mt-3 text-ink-secondary">{{ mensagem }}</p>
        </div>

      </div>
    </div>
  </div>
</template>