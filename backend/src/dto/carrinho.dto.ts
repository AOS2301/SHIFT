import { CartItemWithRelations } from "../repositories/carrinho.repository";
import { precoEfetivo } from "./produto.dto";
import { arredondar, calcularFrete } from "../lib/frete";

export interface CartItemDTO {
  variantId: number;
  quantidade: number;
  tamanho: number;
  cor: string;
  estoque: number;
  produto: {
    id: number;
    nome: string;
    marca: string;
    imagemPrincipal: string | null;
    preco: number;
  };
}

export interface CartDTO {
  itens: CartItemDTO[];
  subtotal: number;
  frete: number;
  total: number;
}

export function toCartDTO(items: CartItemWithRelations[]): CartDTO {
  const itens = items.map((item) => ({
    variantId: item.variantId,
    quantidade: item.quantidade,
    tamanho: item.variant.tamanho,
    cor: item.variant.cor,
    estoque: item.variant.estoque,
    produto: {
      id: item.variant.product.id,
      nome: item.variant.product.nome,
      marca: item.variant.product.brand.nome,
      imagemPrincipal: item.variant.product.imagemPrincipal,
      preco: precoEfetivo(item.variant.product),
    },
  }));

  const subtotal = arredondar(
    itens.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0)
  );
  const frete = calcularFrete(subtotal);

  return { itens, subtotal, frete, total: arredondar(subtotal + frete) };
}
