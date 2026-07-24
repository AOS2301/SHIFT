import { Request, Response } from "express";
import { authService } from "../service/auth.service";
import { AppError } from "../errors/AppError";

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    handleError(error, res);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
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