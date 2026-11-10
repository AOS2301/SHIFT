import { Router } from "express";
import { checkout, listOrders, getOrderById } from "../controllers/pedido.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.post("/", checkout);
router.get("/", listOrders);
router.get("/:id", getOrderById);

export default router;
