# 👟 SHIFT

> Uma loja virtual moderna de sneakers e tênis, desenvolvida com foco em performance, experiência do usuário e design responsivo.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)
![Vue](https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 Sobre o projeto

O **SHIFT** é um e-commerce de tênis criado para oferecer uma experiência de compra moderna, intuitiva e rápida.

O projeto simula uma loja virtual completa, permitindo que usuários naveguem pelo catálogo de produtos, pesquisem modelos, adicionem itens ao carrinho e finalizem suas compras através de uma interface elegante e responsiva.

Além do lado do cliente, o sistema conta com um painel administrativo para gerenciamento de produtos, categorias, pedidos e usuários.

---

## ✨ Funcionalidades

### Prontas

- 🛒 Catálogo de produtos vindo da API, com paginação
- 🔍 Busca por nome do modelo ou marca
- 🎯 Filtros por marca, categoria, gênero e faixa de preço + ordenação (tudo refletido na URL)
- 🏷️ Promoções (preço promocional, selo de desconto e página `/promocao`)
- 👟 Página de produto com seleção de cor/tamanho, estoque em tempo real e relacionados
- 🛍️ Carrinho: no navegador para visitantes e salvo na conta para quem está logado (os dois se juntam no login)
- 💳 Fechamento de pedido com baixa de estoque em transação
- 📦 Histórico de pedidos (`/pedidos`)
- 👤 Login e cadastro com JWT, sessão restaurada ao recarregar
- 🔐 Rotas de escrita (produtos, marcas, categorias) restritas a administradores
- 📱 Layout responsivo com menu mobile, transições de página e avisos (toasts)

### O que ainda falta

- 🖼️ **Imagens dos produtos** — as telas já exibem `imagemPrincipal` e a galeria (`product_images`); basta preencher as URLs no banco. Enquanto isso aparece um placeholder.
- 💰 Pagamento (Stripe / Mercado Pago) — hoje o pedido nasce como `PENDING` e não há cobrança
- 🏠 Endereço de entrega e cálculo de frete por CEP (o frete atual é fixo: grátis acima de R$ 300)
- 🧑‍💼 Painel administrativo (a API de produtos/marcas/categorias já existe; falta a interface e o CRUD de variantes/imagens)
- 🔄 Atualização de status do pedido (pago, enviado, entregue) e cancelamento
- ❤️ Lista de favoritos e ⭐ avaliações de produtos (precisam de novas tabelas)
- 🧪 Testes no frontend e CI rodando build + testes

---

## ▶️ Como rodar

**Backend** (`backend/`)

```bash
cp .env.example .env        # preencha DATABASE_URL, DIRECT_URL e JWT_SECRET
npm install
npx prisma migrate deploy   # cria/atualiza as tabelas
psql "$DIRECT_URL" -f prisma/seed.sql   # dados de exemplo (opcional)
npm run dev                 # http://localhost:3333
npm test
```

**Frontend** (`frontend/`)

```bash
cp .env.example .env        # VITE_API_URL, se a API não estiver em localhost:3333
npm install
npm run dev                 # http://localhost:5173
```

Para criar um administrador, cadastre-se normalmente e rode no banco:
`UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';`

### Principais rotas da API

| Rota | Descrição |
| --- | --- |
| `GET /products` | Lista com `page`, `limit`, `search`, `brand`, `category`, `gender`, `promo`, `minPrice`, `maxPrice`, `sort` |
| `GET /products/:id` | Detalhe com variantes e galeria |
| `GET /brands`, `GET /categories` | Marcas e categorias (com `totalProdutos`) |
| `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Autenticação |
| `GET/POST /cart`, `PUT/DELETE /cart/:variantId`, `POST /cart/sync` | Carrinho da conta (requer login) |
| `POST /orders`, `GET /orders`, `GET /orders/:id` | Fecha o pedido a partir do carrinho / histórico |
| `POST/PUT/DELETE` em produtos, marcas e categorias | Somente `ADMIN` |

---

## 🛠️ Tecnologias

### Front-end

- Vue.js 3
- Vue Router
- Pinia
- Axios
- Tailwind CSS

### Back-end

- Node.js
- Express
- JWT
- PostgreSQL
- Prisma ORM

---

## 🎯 Objetivos

Este projeto foi desenvolvido com o objetivo de praticar conceitos como:

- Arquitetura Full Stack
- Consumo de APIs REST
- Autenticação com JWT
- Gerenciamento de estado
- Responsividade
- Boas práticas de desenvolvimento
- Clean Code

---

## 🚀 Futuras funcionalidades

- Integração com Stripe
- Integração com Mercado Pago
- Cupons de desconto
- Rastreamento de pedidos
- Dashboard administrativo
- Recomendações de produtos com IA
- Lista de desejos
- Notificações em tempo real

---

## 👨‍💻 Desenvolvedor

Desenvolvido por **Arthur Osvaldo Schmitz**

Sempre buscando criar aplicações modernas, escaláveis e com ótima experiência para o usuário.
