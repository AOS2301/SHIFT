import { orderRepository } from "../repositories/pedido.repository";
import { cartRepository } from "../repositories/carrinho.repository";
import { toOrderDTO, OrderDTO } from "../dto/pedido.dto";
import { precoEfetivo } from "../dto/produto.dto";
import { arredondar, calcularFrete } from "../lib/frete";
import { NotFoundError, ValidationError } from "../errors/AppError";

export const orderService = {
  // Fecha o pedido a partir do carrinho salvo do usuário. Os preços vêm
  // sempre do banco — nunca do que o cliente enviou.
  async checkout(userId: number): Promise<OrderDTO> {
    const carrinho = await cartRepository.findByUser(userId);

    if (carrinho.length === 0) {
      throw new ValidationError("Seu carrinho está vazio");
    }

    for (const item of carrinho) {
      if (item.quantidade > item.variant.estoque) {
        throw new ValidationError(
          `Estoque insuficiente para ${item.variant.product.nome} (tamanho ${item.variant.tamanho})`
        );
      }
    }

    const itens = carrinho.map((item) => ({
      variantId: item.variantId,
      quantidade: item.quantidade,
      precoUnitario: precoEfetivo(item.variant.product),
    }));

    const subtotal = arredondar(
      itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0)
    );
    const total = arredondar(subtotal + calcularFrete(subtotal));

    const order = await orderRepository.createFromCart(userId, itens, total);
    return toOrderDTO(order);
  },

  async list(userId: number): Promise<OrderDTO[]> {
    const orders = await orderRepository.findByUser(userId);
    return orders.map(toOrderDTO);
  },

  async getById(userId: number, idParam: string): Promise<OrderDTO> {
    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      throw new ValidationError("ID de pedido inválido");
    }

    const order = await orderRepository.findById(id);

    // Pedido de outro usuário responde 404 (e não 403) pra não revelar
    // que aquele ID existe.
    if (!order || order.userId !== userId) {
      throw new NotFoundError("Pedido não encontrado");
    }

    return toOrderDTO(order);
  },
};
