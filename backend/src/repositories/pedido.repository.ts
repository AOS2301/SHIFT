import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ValidationError } from "../errors/AppError";

const orderWithRelations = {
  items: {
    include: { variant: { include: { product: { include: { brand: true } } } } },
    orderBy: { id: "asc" },
  },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderWithRelations;
}>;

export interface CreateOrderItem {
  variantId: number;
  quantidade: number;
  precoUnitario: number;
}

export const orderRepository = {
  async findByUser(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      include: orderWithRelations,
      orderBy: { criadoEm: "desc" },
    });
  },

  async findById(id: number) {
    return prisma.order.findUnique({ where: { id }, include: orderWithRelations });
  },

  // Fecha o pedido numa transação única: baixa o estoque, cria o pedido e
  // esvazia o carrinho. Se qualquer passo falhar, nada é gravado.
  async createFromCart(userId: number, itens: CreateOrderItem[], total: number) {
    return prisma.$transaction(async (tx) => {
      for (const item of itens) {
        // O "estoque >= quantidade" no WHERE garante que duas compras
        // simultâneas nunca deixem o estoque negativo.
        const { count } = await tx.productVariant.updateMany({
          where: { id: item.variantId, estoque: { gte: item.quantidade } },
          data: { estoque: { decrement: item.quantidade } },
        });

        if (count === 0) {
          throw new ValidationError(
            "Um dos itens ficou sem estoque suficiente. Revise seu carrinho."
          );
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          total,
          items: { create: itens },
        },
        include: orderWithRelations,
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  },
};
