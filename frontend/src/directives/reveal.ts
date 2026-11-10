import type { Directive } from 'vue'

// v-reveal: o elemento entra com fade + leve subida quando aparece na tela.
// O visual fica em style.css (.reveal / .reveal-visible).
const observer =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible')
              observer?.unobserve(entry.target)
            }
          }
        },
        { threshold: 0.1 },
      )
    : null

export const vReveal: Directive<HTMLElement> = {
  mounted(el) {
    if (!observer) return
    el.classList.add('reveal')
    observer.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
