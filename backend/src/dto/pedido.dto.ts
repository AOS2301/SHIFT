import { OrderWithRelations } from "../repositories/pedido.repository";

export interface OrderDTO {
  id: number;
  status: string;
  total: number;
  criadoEm: Date;
  itens: {
    id: number;
    quantidade: number;
    precoUnitario: number;
    tamanho: number;
    cor: string;
    produto: {
      id: number;
      nome: string;
      marca: string;
      imagemPrincipal: string | null;
    };
  }[];
}

export function toOrderDTO(order: OrderWithRelations): OrderDTO {
  return {
    id: order.id,
    status: order.status,
    total: Number(order.total),
    criadoEm: order.criadoEm,
    itens: order.items.map((item) => ({
      id: item.id,
      quantidade: item.quantidade,
      precoUnitario: Number(item.precoUnitario),
      tamanho: item.variant.tamanho,
      cor: item.variant.cor,
      produto: {
        id: item.variant.product.id,
        nome: item.variant.product.nome,
        marca: item.variant.product.brand.nome,
        imagemPrincipal: item.variant.product.imagemPrincipal,
      },
    })),
  };
}
