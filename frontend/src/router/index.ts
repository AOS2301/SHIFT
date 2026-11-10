import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import { useAuthStore } from '../stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    /** Aba do navegador: "<titulo> · SHIFT" */
    titulo?: string
    /** Só acessível logado; visitante vai pro login e volta depois */
    requiresAuth?: boolean
    /** Tela cheia, sem navbar e rodapé (login/cadastro) */
    semLayout?: boolean
  }
}

// A home vem no bundle inicial; as demais telas são carregadas sob demanda
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue'),
      meta: { titulo: 'Entrar', semLayout: true },
    },
    {
      path: '/cadastro',
      name: 'register',
      component: () => import('../views/register.vue'),
      meta: { titulo: 'Criar conta', semLayout: true },
    },
    {
      path: '/produtos',
      name: 'products',
      component: () => import('../views/products.vue'),
      meta: { titulo: 'Todos os produtos' },
    },
    {
      path: '/promocao',
      name: 'promo',
      component: () => import('../views/products.vue'),
      props: { promocao: true },
      meta: { titulo: 'Promoções' },
    },
    {
      // (\\d+) evita que "/produtos/qualquer-coisa" caia na tela de produto
      path: '/produtos/:id(\\d+)',
      name: 'product-inspect',
      component: () => import('../views/productInspect.vue'),
    },
    {
      path: '/marca/:marca',
      name: 'product-brand',
      component: () => import('../views/productBrand.vue'),
    },
    {
      path: '/:genero(feminino|masculino|infantil)',
      name: 'product-gender',
      component: () => import('../views/productGender.vue'),
    },
    {
      path: '/carrinho',
      name: 'cart',
      component: () => import('../views/cart.vue'),
      meta: { titulo: 'Carrinho' },
    },
    {
      path: '/pedidos',
      name: 'orders',
      component: () => import('../views/orders.vue'),
      meta: { titulo: 'Meus pedidos', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/notFound.vue'),
      meta: { titulo: 'Página não encontrada' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Mudar só filtros (query) da mesma página não joga a tela pro topo
    if (to.path === from.path) return
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.estaLogado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Quem já está logado não precisa ver login/cadastro
  if ((to.name === 'login' || to.name === 'register') && authStore.estaLogado) {
    return { name: 'home' }
  }
})

router.afterEach((to) => {
  // Telas com título dinâmico (produto, marca, gênero) definem o próprio
  document.title = to.meta.titulo ? `${to.meta.titulo} · SHIFT` : 'SHIFT'
})

export default router
