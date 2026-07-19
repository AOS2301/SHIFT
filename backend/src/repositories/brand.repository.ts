import { prisma } from "../lib/prisma";

export interface CreateBrandData {
  nome: string;
  logoUrl?: string;
}

export const brandRepository = {
  async findMany() {
    return prisma.brand.findMany({ orderBy: { nome: "asc" } });
  },

  async findByNome(nome: string) {
    return prisma.brand.findUnique({ where: { nome } });
  },

  async create(data: CreateBrandData) {
    return prisma.brand.create({ data });
  },
};