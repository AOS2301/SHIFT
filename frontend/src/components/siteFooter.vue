<template>
  <footer class="border-t border-line bg-bg-elevated mt-16">
    <div class="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
      <div class="col-span-2">
        <p class="font-display uppercase text-2xl tracking-wide">
          SHIFT<span class="text-court-orange">.</span>
        </p>
        <p class="text-ink-secondary mt-3 max-w-xs leading-relaxed">
          Tênis selecionados pra quem entende de detalhe. Da quadra ao asfalto, sem enrolação.
        </p>
      </div>

      <nav class="space-y-2">
        <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-widest mb-3">Loja</p>
        <router-link to="/produtos" class="block hover:text-court-orange transition-colors">Todos os produtos</router-link>
        <router-link to="/promocao" class="block hover:text-court-orange transition-colors">Promoções</router-link>
        <router-link to="/masculino" class="block hover:text-court-orange transition-colors">Masculino</router-link>
        <router-link to="/feminino" class="block hover:text-court-orange transition-colors">Feminino</router-link>
        <router-link to="/infantil" class="block hover:text-court-orange transition-colors">Infantil</router-link>
      </nav>

      <nav class="space-y-2">
        <p class="font-mono text-[10px] text-ink-secondary uppercase tracking-widest mb-3">Conta</p>
        <router-link to="/carrinho" class="block hover:text-court-orange transition-colors">Carrinho</router-link>
        <router-link to="/pedidos" class="block hover:text-court-orange transition-colors">Meus pedidos</router-link>
      </nav>
    </div>

    <p class="border-t border-line text-center font-mono text-[10px] text-ink-secondary uppercase tracking-widest py-4">
      Frete grátis acima de R$ 300 · Projeto de estudo — sem vendas reais
    </p>
  </footer>
</template>
