import { Router } from "express";
import { listCategories, createCategory } from "../controllers/categoria.controller";

import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", listCategories);
router.post("/", requireAuth, requireAdmin, createCategory);

export default router;