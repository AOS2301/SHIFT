export function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// "New Balance" -> "new-balance" (formato usado nas URLs de marca)
export function slugify(texto: string) {
  return texto.trim().toLowerCase().replace(/\s+/g, '-')
}

// Extrai a mensagem de erro enviada pela API ({ error: "..." }), com fallback
export function mensagemDeErro(e: unknown, fallback: string) {
  const data = (e as { response?: { data?: { error?: unknown } } })?.response?.data
  return typeof data?.error === 'string' ? data.error : fallback
}
