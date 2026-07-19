import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRoutes from "./routes/produto.routes";
import brandsRoutes from "./routes/brand.routes";
import categoriesRoutes from "./routes/categoria.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", productsRoutes);
app.use("/brands", brandsRoutes);
app.use("/categories", categoriesRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));