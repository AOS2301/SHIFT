import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ProductFilters {
  where: Prisma.ProductWhereInput;
  skip: number;
  take: number;
  orderBy?: Prisma.ProductOrderByWithRelationInput;
}

export interface CreateProductData {
  nome: string;
  descricao?: string;
  precoBase: number;
  imagemPrincipal?: string;
  precoPromocional?: number | null;
  brandId: number;
  categoryId: number;
  genderId?: number | null;
}

export interface UpdateProductData {
  nome?: string;
  descricao?: string;
  precoBase?: number;
  imagemPrincipal?: string;
  precoPromocional?: number | null;
  brandId?: number;
  categoryId?: number;
  genderId?: number | null;
}

const productWithRelations = {
  brand: true,
  category: true,
  gender: true,
  variants: { orderBy: { tamanho: "asc" } },
} satisfies Prisma.ProductInclude;

export const productRepository = {
  async findMany({ where, skip, take, orderBy }: ProductFilters) {
    return prisma.product.findMany({
      where,
      skip,
      take,
      include: productWithRelations,
      orderBy: orderBy ?? { createdAt: "desc" },
    });
  },

  async count(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  },

  async findById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        ...productWithRelations,
        images: { orderBy: { ordem: "asc" } },
      },
    });
  },

  async create(data: CreateProductData) {
    return prisma.product.create({ data });
  },

  async update(id: number, data: UpdateProductData) {
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.product.delete({ where: { id } });
  },
};