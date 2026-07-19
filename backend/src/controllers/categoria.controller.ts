import { Request, Response } from "express";
import { categoryService } from "../service/categoria.service";
import { AppError } from "../errors/AppError";

export async function listCategories(req: Request, res: Response) {
  try {
    const tipo = req.query.tipo as string | undefined;
    const categories = await categoryService.list(tipo);
    res.json(categories);
  } catch (error) {
    handleError(error, res);
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
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