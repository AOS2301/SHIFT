import { Router } from "express";
import { listBrands, createBrand } from "../controllers/brand.controller";

const router = Router();

router.get("/", listBrands);
router.post("/", createBrand);

export default router;