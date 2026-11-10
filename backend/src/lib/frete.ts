// Regra de frete da loja: grátis a partir de R$ 300, senão valor fixo.
// O frontend usa os mesmos números pra mostrar a estimativa no carrinho
// (frontend/src/stores/cart.ts) — se mudar aqui, mude lá.
export const FRETE_GRATIS_A_PARTIR_DE = 300;
export const VALOR_FRETE = 29.9;

export function calcularFrete(subtotal: number): number {
  if (subtotal <= 0 || subtotal >= FRETE_GRATIS_A_PARTIR_DE) return 0;
  return VALOR_FRETE;
}

// Evita lixo de ponto flutuante (ex: 0.1 + 0.2) em valores monetários
export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}
