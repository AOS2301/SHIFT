import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export interface CreateUsuarioData {
  nome: string;
  email: string;
  senhaHash: string;
  role?: Role;
}

export const usuarioRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: CreateUsuarioData) {
    const createData: Parameters<typeof prisma.user.create>[0]["data"] = {
      nome: data.nome,
      email: data.email,
      senhaHash: data.senhaHash,
    };
    if (data.role !== undefined) createData.role = data.role;

    return prisma.user.create({ data: createData });
  },
};