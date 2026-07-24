<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

async function handleSubmit() {
  erro.value = ''

  if (!email.value || !senha.value) {
    erro.value = 'Preencha email e senha.'
    return
  }

  carregando.value = true
  try {
    await authStore.login(email.value, senha.value)
    router.push('/')
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.error) {
      erro.value = e.response.data.error
    } else {
      erro.value = 'Não foi possível entrar. Tente novamente.'
    }
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg text-ink-text flex items-center justify-center px-6">
    <div class="w-full max-w-sm">

      <router-link to="/" class="block text-center font-display uppercase text-3xl tracking-wide mb-10">
        SHIFT<span class="text-court-orange">.</span>
      </router-link>

      <div class="bg-bg-elevated border border-line rounded p-8">
        <h1 class="font-display uppercase text-2xl mb-1">Entrar</h1>
        <p class="text-ink-secondary text-sm mb-6">Acesse sua conta pra continuar</p>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-xs font-mono text-ink-secondary uppercase tracking-wide mb-2">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              class="w-full bg-bg border border-line rounded px-4 h-11 text-sm focus:outline-none focus:border-court-orange"
            />
          </div>

          <div>
            <label class="block text-xs font-mono text-ink-secondary uppercase tracking-wide mb-2">
              Senha
            </label>
            <input
              v-model="senha"
              type="password"
              placeholder="••••••••"
              class="w-full bg-bg border border-line rounded px-4 h-11 text-sm focus:outline-none focus:border-court-orange"
            />
          </div>

          <p v-if="erro" class="text-court-orange text-sm">{{ erro }}</p>

          <button
            type="submit"
            :disabled="carregando"
            class="w-full bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide h-11 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ carregando ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="text-center text-sm text-ink-secondary mt-6">
          Não tem conta?
          <router-link to="/cadastro" class="text-ink-text font-bold hover:text-court-orange transition-colors">
            Criar conta
          </router-link>
        </p>
      </div>

    </div>
  </div>
</template>