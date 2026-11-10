import { CategoryType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface CreateCategoryData {
  nome: string;
  tipo: CategoryType;
}

export const categoryRepository = {
  async findMany(tipo?: CategoryType) {
    const where: Prisma.CategoryWhereInput = {};
    if (tipo) where.tipo = tipo;

    const categorias = await prisma.category.findMany({
      where,
      orderBy: { nome: "asc" },
      include: { _count: { select: { products: true, genderProducts: true } } },
    });

    // totalProdutos: quantos produtos usam essa categoria (como categoria
    // ou como gênero) — a home usa isso pra mostrar a contagem real.
    return categorias.map(({ _count, ...categoria }) => ({
      ...categoria,
      totalProdutos: _count.products + _count.genderProducts,
    }));
  },

  async create(data: CreateCategoryData) {
    return prisma.category.create({ data });
  },
};