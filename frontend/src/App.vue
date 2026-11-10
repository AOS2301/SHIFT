<script setup lang="ts">
import { useRoute } from 'vue-router'
import navBar from './components/navBar.vue'
import siteFooter from './components/siteFooter.vue'
import toastContainer from './components/toastContainer.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg text-ink-text">
    <!-- Login e cadastro usam tela cheia, sem navbar/rodapé (meta.semLayout) -->
    <navBar v-if="!route.meta.semLayout" />

    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <!-- A key é o nome da rota: trocar só filtros/parâmetros da mesma
               tela não refaz a animação nem remonta o componente -->
          <component :is="Component" :key="route.name" />
        </Transition>
      </router-view>
    </main>

    <siteFooter v-if="!route.meta.semLayout" />
    <toastContainer />
  </div>
</template>
