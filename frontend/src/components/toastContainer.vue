<script setup lang="ts">
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <div class="fixed bottom-5 right-5 left-5 sm:left-auto z-50 flex flex-col items-end gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        role="status"
        class="pointer-events-auto flex items-center gap-3 bg-bg-elevated border rounded px-4 py-3 text-sm shadow-lg max-w-sm"
        :class="toast.tipo === 'erro' ? 'border-court-orange' : 'border-line'"
      >
        <i
          class="ti text-lg text-court-orange"
          :class="toast.tipo === 'erro' ? 'ti-alert-circle' : 'ti-circle-check'"
          aria-hidden="true"
        ></i>
        <span>{{ toast.mensagem }}</span>
        <button
          class="text-ink-secondary hover:text-ink-text ml-2"
          aria-label="Fechar aviso"
          @click="toastStore.fechar(toast.id)"
        >
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
