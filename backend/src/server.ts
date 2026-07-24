import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import produtoRoutes from "./routes/produto.routes";
import brandRoutes from "./routes/brand.routes";
import categoriaRoutes from "./routes/categoria.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", produtoRoutes);
app.use("/brands", brandRoutes);
app.use("/categories", categoriaRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));