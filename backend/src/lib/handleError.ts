import { Response } from "express";
import { AppError } from "../errors/AppError";

// Tradução única de erro -> resposta HTTP, compartilhada pelos controllers.
export function handleError(error: unknown, res: Response) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(error);
  res.status(500).json({ error: "Erro interno do servidor" });
}
