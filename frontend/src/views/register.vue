<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const nome = ref('')
const email = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const erro = ref('')
const carregando = ref(false)

async function handleSubmit() {
  erro.value = ''

  if (!nome.value || !email.value || !senha.value || !confirmarSenha.value) {
    erro.value = 'Preencha todos os campos.'
    return
  }

  if (senha.value.length < 6) {
    erro.value = 'A senha precisa ter pelo menos 6 caracteres.'
    return
  }

  if (senha.value !== confirmarSenha.value) {
    erro.value = 'As senhas não coincidem.'
    return
  }

  carregando.value = true
  try {
    await authStore.register(nome.value, email.value, senha.value)
    router.push('/')
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.error) {
      erro.value = e.response.data.error
    } else {
      erro.value = 'Não foi possível criar sua conta. Tente novamente.'
    }
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg text-ink-text flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-sm">

      <router-link to="/" class="block text-center font-display uppercase text-3xl tracking-wide mb-10">
        SHIFT<span class="text-court-orange">.</span>
      </router-link>

      <div class="bg-bg-elevated border border-line rounded p-8">
        <h1 class="font-display uppercase text-2xl mb-1">Criar conta</h1>
        <p class="text-ink-secondary text-sm mb-6">Leva menos de um minuto</p>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-xs font-mono text-ink-secondary uppercase tracking-wide mb-2">
              Nome
            </label>
            <input
              v-model="nome"
              type="text"
              placeholder="Seu nome completo"
              class="w-full bg-bg border border-line rounded px-4 h-11 text-sm focus:outline-none focus:border-court-orange"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              class="w-full bg-bg border border-line rounded px-4 h-11 text-sm focus:outline-none focus:border-court-orange"
            />
          </div>

          <div>
            <label class="block text-xs font-mono text-ink-secondary uppercase tracking-wide mb-2">
              Confirmar senha
            </label>
            <input
              v-model="confirmarSenha"
              type="password"
              placeholder="Repita a senha"
              class="w-full bg-bg border border-line rounded px-4 h-11 text-sm focus:outline-none focus:border-court-orange"
            />
          </div>

          <p v-if="erro" class="text-court-orange text-sm">{{ erro }}</p>

          <button
            type="submit"
            :disabled="carregando"
            class="w-full bg-court-orange text-bg-dark font-bold text-sm uppercase tracking-wide h-11 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ carregando ? 'Criando conta...' : 'Criar conta' }}
          </button>
        </form>

        <p class="text-center text-sm text-ink-secondary mt-6">
          Já tem conta?
          <router-link to="/login" class="text-ink-text font-bold hover:text-court-orange transition-colors">
            Entrar
          </router-link>
        </p>
      </div>

    </div>
  </div>
</template>