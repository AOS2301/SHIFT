import { Router } from "express";
import { listBrands, createBrand } from "../controllers/brand.controller";

import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", listBrands);
router.post("/", requireAuth, requireAdmin, createBrand);

export default router;