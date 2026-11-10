import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vReveal } from './directives/reveal'
import { registrarSessaoExpirada } from './services/api'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)

// Pinia antes do router: os guards de rota já usam o store de auth
app.use(createPinia())
app.use(router)
app.directive('reveal', vReveal)

const authStore = useAuthStore()

// Token expirado/inválido (401 da API) → encerra a sessão local
registrarSessaoExpirada(() => {
  if (authStore.estaLogado) authStore.logout()
})

// Valida o token salvo e carrega o carrinho da conta (sem bloquear a tela)
authStore.restaurarSessao()

app.mount('#app')
