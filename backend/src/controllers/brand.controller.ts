import { Request, Response } from "express";
import { brandService } from "../service/brand.service";
import { AppError } from "../errors/AppError";

export async function listBrands(req: Request, res: Response) {
  try {
    const brands = await brandService.list();
    res.json(brands);
  } catch (error) {
    handleError(error, res);
  }
}

export async function createBrand(req: Request, res: Response) {
  try {
    const brand = await brandService.create(req.body);
    res.status(201).json(brand);
  } catch (error) {
    handleError(error, res);
  }
}

function handleError(error: unknown, res: Response) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(error);
  res.status(500).json({ error: "Erro interno do servidor" });
}