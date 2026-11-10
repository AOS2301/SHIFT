import { Router } from "express";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/produto.controller";

import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Leitura é pública; escrita só pra administradores
const admin = [requireAuth, requireAdmin];

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post("/", admin, createProduct);
router.put("/:id", admin, updateProduct);
router.delete("/:id", admin, deleteProduct);

export default router;