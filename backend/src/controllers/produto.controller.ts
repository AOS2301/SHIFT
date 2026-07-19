import { Request, Response } from "express";
import { productService } from "../service/produto.service";
import { AppError } from "../errors/AppError";

export async function listProducts(req: Request, res: Response) {
  try {
    const result = await productService.list(req.query);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const product = await productService.getById(String(req.params.id));
    res.json(product);
  } catch (error) {
    handleError(error, res);
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    handleError(error, res);
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const product = await productService.update(String(req.params.id), req.body);
    res.json(product);
  } catch (error) {
    handleError(error, res);
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    await productService.delete(String(req.params.id));
    res.status(204).send();
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