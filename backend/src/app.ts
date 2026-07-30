import express from "express";
import cors from "cors";

import produtoRoutes from "./routes/produto.routes";
import brandRoutes from "./routes/brand.routes";
import categoriaRoutes from "./routes/categoria.routes";
import authRoutes from "./routes/auth.routes";

import { prisma } from "./lib/prisma";

// Configuração do Express isolada do "start do servidor". Isso permite que os
// testes importem `app` e simulem requisições (via supertest) sem precisar
// abrir uma porta de rede de verdade.
export const app = express();

const allowedOrigins = [
  "http://localhost:5173", // frontend em dev (Vite)
  process.env.FRONTEND_URL, // frontend publicado (Vercel)
].filter((origin): origin is string => Boolean(origin));;

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});

app.use("/products", produtoRoutes);
app.use("/brands", brandRoutes);
app.use("/categories", categoriaRoutes);
app.use("/auth", authRoutes);