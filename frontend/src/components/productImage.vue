<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Imagem de produto com fallback. Enquanto o produto não tiver foto
 * cadastrada (imagemPrincipal = null) ou se a URL falhar, mostra um
 * placeholder no lugar — então basta preencher as URLs no banco que as
 * fotos passam a aparecer em todas as telas.
 */
const props = defineProps<{
  src?: string | null
  alt: string
}>()

const falhou = ref(false)

watch(
  () => props.src,
  () => (falhou.value = false),
)
</script>

<template>
  <img
    v-if="src && !falhou"
    :src="src"
    :alt="alt"
    loading="lazy"
    class="w-full h-full object-cover"
    @error="falhou = true"
  />
  <div
    v-else
    class="w-full h-full flex flex-col items-center justify-center gap-2 text-ink-secondary placeholder-foto"
    role="img"
    :aria-label="alt"
  >
    <i class="ti ti-shoe text-3xl opacity-60" aria-hidden="true"></i>
    <span class="font-mono text-[10px] uppercase tracking-widest opacity-60">Foto em breve</span>
  </div>
</template>
