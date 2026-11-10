import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

const cartItemWithRelations = {
  variant: { include: { product: { include: { brand: true } } } },
} satisfies Prisma.CartItemInclude;

export type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: typeof cartItemWithRelations;
}>;

export const cartRepository = {
  async findByUser(userId: number) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: cartItemWithRelations,
      orderBy: { id: "asc" },
    });
  },

  async findItem(userId: number, variantId: number) {
    return prisma.cartItem.findUnique({
      where: { userId_variantId: { userId, variantId } },
    });
  },

  async findVariant(variantId: number) {
    return prisma.productVariant.findUnique({ where: { id: variantId } });
  },

  // Cria o item ou sobrescreve a quantidade se ele já existir
  async setQuantidade(userId: number, variantId: number, quantidade: number) {
    return prisma.cartItem.upsert({
      where: { userId_variantId: { userId, variantId } },
      create: { userId, variantId, quantidade },
      update: { quantidade },
    });
  },

  async remove(userId: number, variantId: number) {
    return prisma.cartItem.deleteMany({ where: { userId, variantId } });
  },

  async clear(userId: number) {
    return prisma.cartItem.deleteMany({ where: { userId } });
  },
};
