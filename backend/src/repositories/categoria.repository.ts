import { CategoryType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface CreateCategoryData {
  nome: string;
  tipo: CategoryType;
}

export const categoryRepository = {
  async findMany(tipo?: CategoryType) {
    const args: Prisma.CategoryFindManyArgs = {
      orderBy: { nome: "asc" },
    };

    if (tipo) {
      args.where = { tipo };
    }

    return prisma.category.findMany(args);
  },

  async create(data: CreateCategoryData) {
    return prisma.category.create({ data });
  },
};