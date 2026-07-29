import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Login from '../views/login.vue'
import Register from '../views/register.vue'
import ProductInspect from '../views/productInspect.vue'
import ProductBrand from '../views/productBrand.vue'
import ProductGender from '../views/productGender.vue'
import Cart from '../views/cart.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/login', name: 'login', component: Login },
    { path: '/cadastro', name: 'register', component: Register },
    { path: '/produtos/:id', name: 'product-inspect', component: ProductInspect },
    { path: '/marca/:marca', name: 'product-brand', component: ProductBrand },
    { path: '/:genero(feminino|masculino|infantil)', name: 'product-gender', component: ProductGender },
    { path: '/carrinho', name: 'cart', component: Cart },
  ],
})

export default router