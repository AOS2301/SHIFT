import { cartRepository } from "../repositories/carrinho.repository";
import { toCartDTO, CartDTO } from "../dto/carrinho.dto";
import { NotFoundError, ValidationError } from "../errors/AppError";

export interface CartItemInput {
  variantId?: number | string;
  quantidade?: number | string;
}

function parseId(valor: unknown, nome: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`${nome} inválido`);
  }
  return id;
}

function parseQuantidade(valor: unknown): number {
  const quantidade = Number(valor);
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw new ValidationError("quantidade deve ser um inteiro maior que zero");
  }
  return quantidade;
}

async function buscarVarianteComEstoque(variantId: number) {
  const variante = await cartRepository.findVariant(variantId);
  if (!variante) {
    throw new NotFoundError("Variante de produto não encontrada");
  }
  if (variante.estoque < 1) {
    throw new ValidationError("Produto esgotado nesse tamanho");
  }
  return variante;
}

export const cartService = {
  async get(userId: number): Promise<CartDTO> {
    return toCartDTO(await cartRepository.findByUser(userId));
  },

  // Soma a quantidade ao que já existe no carrinho (botão "Adicionar ao carrinho")
  async add(userId: number, input: CartItemInput): Promise<CartDTO> {
    const variantId = parseId(input.variantId, "variantId");
    const quantidade = parseQuantidade(input.quantidade ?? 1);

    const variante = await buscarVarianteComEstoque(variantId);
    const existente = await cartRepository.findItem(userId, variantId);
    const novaQuantidade = (existente?.quantidade ?? 0) + quantidade;

    if (novaQuantidade > variante.estoque) {
      throw new ValidationError(
        `Só temos ${variante.estoque} unidade(s) desse tamanho em estoque`
      );
    }

    await cartRepository.setQuantidade(userId, variantId, novaQuantidade);
    return this.get(userId);
  },

  // Define a quantidade exata (botões +/− do carrinho)
  async update(userId: number, variantIdParam: string, input: CartItemInput): Promise<CartDTO> {
    const variantId = parseId(variantIdParam, "variantId");
    const quantidade = parseQuantidade(input.quantidade);

    const existente = await cartRepository.findItem(userId, variantId);
    if (!existente) {
      throw new NotFoundError("Item não está no carrinho");
    }

    const variante = await buscarVarianteComEstoque(variantId);
    if (quantidade > variante.estoque) {
      throw new ValidationError(
        `Só temos ${variante.estoque} unidade(s) desse tamanho em estoque`
      );
    }

    await cartRepository.setQuantidade(userId, variantId, quantidade);
    return this.get(userId);
  },

  async remove(userId: number, variantIdParam: string): Promise<CartDTO> {
    const variantId = parseId(variantIdParam, "variantId");
    await cartRepository.remove(userId, variantId);
    return this.get(userId);
  },

  async clear(userId: number): Promise<CartDTO> {
    await cartRepository.clear(userId);
    return this.get(userId);
  },

  // Junta o carrinho de visitante (localStorage) ao carrinho da conta logo
  // após o login. É tolerante: item inválido ou esgotado é ignorado e a
  // quantidade é limitada ao estoque, em vez de derrubar a operação toda.
  async sync(userId: number, input: { itens?: CartItemInput[] }): Promise<CartDTO> {
    if (!Array.isArray(input.itens)) {
      throw new ValidationError("itens deve ser uma lista");
    }

    for (const item of input.itens.slice(0, 50)) {
      const variantId = Number(item.variantId);
      const quantidade = Number(item.quantidade);
      if (!Number.isInteger(variantId) || !Number.isInteger(quantidade) || quantidade < 1) {
        continue;
      }

      const variante = await cartRepository.findVariant(variantId);
      if (!variante || variante.estoque < 1) continue;

      const existente = await cartRepository.findItem(userId, variantId);
      const novaQuantidade = Math.min(
        variante.estoque,
        (existente?.quantidade ?? 0) + quantidade
      );
      await cartRepository.setQuantidade(userId, variantId, novaQuantidade);
    }

    return this.get(userId);
  },
};
