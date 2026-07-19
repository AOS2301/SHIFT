import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/homeView.vue'
import LoginView from '../views/login.vue'
import CadastroView from '../views/register.vue'
import ProdutoDetalheView from '../views/productInspect.vue'
import CarrinhoView from '../views/carrinho.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/cadastro', name: 'cadastro', component: CadastroView },
    { path: '/produtos/:id', name: 'produto-detalhe', component: ProdutoDetalheView },
    { path: '/carrinho', name: 'carrinho', component: CarrinhoView },
  ],
})

export default router