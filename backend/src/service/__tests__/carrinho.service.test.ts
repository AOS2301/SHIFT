import { cartService } from "../carrinho.service";
import { cartRepository } from "../../repositories/carrinho.repository";
import { ValidationError, NotFoundError } from "../../errors/AppError";

jest.mock("../../repositories/carrinho.repository");

const mockedRepo = cartRepository as jest.Mocked<typeof cartRepository>;

const varianteFake = { id: 10, tamanho: 40, cor: "Preto", estoque: 3, sku: "NK-1", productId: 1 };

function itemFake(quantidade: number, preco = 100, precoPromocional: number | null = null) {
  return {
    id: 1,
    quantidade,
    userId: 1,
    variantId: 10,
    variant: {
      ...varianteFake,
      product: {
        id: 1,
        nome: "Air Max Pulse",
        imagemPrincipal: null,
        precoBase: preco,
        precoPromocional,
        brand: { id: 1, nome: "Nike", logoUrl: null },
      },
    },
  } as any;
}

describe("cartService.get", () => {
  it("calcula subtotal, frete e total", async () => {
    mockedRepo.findByUser.mockResolvedValue([itemFake(2)]);

    const cart = await cartService.get(1);

    expect(cart.subtotal).toBe(200);
    expect(cart.frete).toBe(29.9);
    expect(cart.total).toBe(229.9);
  });

  it("dá frete grátis a partir de R$ 300", async () => {
    mockedRepo.findByUser.mockResolvedValue([itemFake(3)]);

    const cart = await cartService.get(1);

    expect(cart.frete).toBe(0);
    expect(cart.total).toBe(300);
  });

  it("usa o preço promocional quando existe", async () => {
    mockedRepo.findByUser.mockResolvedValue([itemFake(1, 100, 80)]);

    const cart = await cartService.get(1);

    expect(cart.itens[0]!.produto.preco).toBe(80);
  });
});

describe("cartService.add", () => {
  beforeEach(() => mockedRepo.findByUser.mockResolvedValue([]));

  it("soma a quantidade ao item que já está no carrinho", async () => {
    mockedRepo.findVariant.mockResolvedValue(varianteFake);
    mockedRepo.findItem.mockResolvedValue({ id: 1, quantidade: 1, userId: 1, variantId: 10 });

    await cartService.add(1, { variantId: 10, quantidade: 2 });

    expect(mockedRepo.setQuantidade).toHaveBeenCalledWith(1, 10, 3);
  });

  it("rejeita quantidade acima do estoque", async () => {
    mockedRepo.findVariant.mockResolvedValue(varianteFake);
    mockedRepo.findItem.mockResolvedValue({ id: 1, quantidade: 2, userId: 1, variantId: 10 });

    await expect(cartService.add(1, { variantId: 10, quantidade: 2 })).rejects.toThrow(
      ValidationError
    );
    expect(mockedRepo.setQuantidade).not.toHaveBeenCalled();
  });

  it("rejeita variante esgotada", async () => {
    mockedRepo.findVariant.mockResolvedValue({ ...varianteFake, estoque: 0 });

    await expect(cartService.add(1, { variantId: 10 })).rejects.toThrow(ValidationError);
  });

  it("lança NotFoundError se a variante não existe", async () => {
    mockedRepo.findVariant.mockResolvedValue(null);

    await expect(cartService.add(1, { variantId: 999 })).rejects.toThrow(NotFoundError);
  });

  it("rejeita quantidade inválida", async () => {
    await expect(cartService.add(1, { variantId: 10, quantidade: 0 })).rejects.toThrow(
      ValidationError
    );
    await expect(cartService.add(1, { variantId: 10, quantidade: 1.5 })).rejects.toThrow(
      ValidationError
    );
  });
});

describe("cartService.update", () => {
  it("lança NotFoundError se o item não está no carrinho", async () => {
    mockedRepo.findItem.mockResolvedValue(null);

    await expect(cartService.update(1, "10", { quantidade: 1 })).rejects.toThrow(NotFoundError);
  });
});

describe("cartService.sync", () => {
  beforeEach(() => mockedRepo.findByUser.mockResolvedValue([]));

  it("limita a quantidade ao estoque e ignora itens inválidos", async () => {
    mockedRepo.findVariant.mockImplementation(async (id) => (id === 10 ? varianteFake : null));
    mockedRepo.findItem.mockResolvedValue(null);

    await cartService.sync(1, {
      itens: [
        { variantId: 10, quantidade: 99 },
        { variantId: 999, quantidade: 1 },
        { variantId: "abc", quantidade: 1 },
      ],
    });

    expect(mockedRepo.setQuantidade).toHaveBeenCalledTimes(1);
    expect(mockedRepo.setQuantidade).toHaveBeenCalledWith(1, 10, 3);
  });
});
