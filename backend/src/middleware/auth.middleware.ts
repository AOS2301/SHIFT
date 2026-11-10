import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

interface TokenPayload {
  userId: number;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não definido");
    const payload = jwt.verify(token, secret) as unknown as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
// Usar DEPOIS do requireAuth: libera só usuários com role ADMIN.
// Consulta o banco a cada chamada (em vez de confiar num "role" dentro do
// token) pra que rebaixar um admin tenha efeito imediato.
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.userId ?? -1 },
      select: { role: true },
    });

    if (!usuario || usuario.role !== "ADMIN") {
      return res.status(403).json({ error: "Acesso restrito a administradores" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
