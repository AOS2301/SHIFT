import { Router } from "express";
import {
  getCart,
  addCartItem,
  syncCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/carrinho.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Todo o carrinho é por usuário: exige login em todas as rotas
router.use(requireAuth);

router.get("/", getCart);
router.post("/", addCartItem);
router.post("/sync", syncCart);
router.put("/:variantId", updateCartItem);
router.delete("/:variantId", removeCartItem);
router.delete("/", clearCart);

export default router;
