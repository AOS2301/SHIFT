import { orderService } from "../pedido.service";
import { orderRepository } from "../../repositories/pedido.repository";
import { cartRepository } from "../../repositories/carrinho.repository";
import { ValidationError, NotFoundError } from "../../errors/AppError";

jest.mock("../../repositories/pedido.repository");
jest.mock("../../repositories/carrinho.repository");

const mockedOrders = orderRepository as jest.Mocked<typeof orderRepository>;
const mockedCart = cartRepository as jest.Mocked<typeof cartRepository>;

function itemCarrinho(quantidade: number, estoque: number, precoPromocional: number | null = null) {
  return {
    id: 1,
    quantidade,
    userId: 1,
    variantId: 10,
    variant: {
      id: 10,
      tamanho: 40,
      cor: "Preto",
      estoque,
      sku: "NK-1",
      productId: 1,
      product: {
        id: 1,
        nome: "Air Max Pulse",
        imagemPrincipal: null,
        precoBase: 100,
        precoPromocional,
        brand: { id: 1, nome: "Nike", logoUrl: null },
      },
    },
  } as any;
}

const pedidoFake = {
  id: 7,
  status: "PENDING",
  total: 229.9,
  criadoEm: new Date(),
  userId: 1,
  items: [],
} as any;

describe("orderService.checkout", () => {
  it("rejeita carrinho vazio", async () => {
    mockedCart.findByUser.mockResolvedValue([]);

    await expect(orderService.checkout(1)).rejects.toThrow(ValidationError);
    expect(mockedOrders.createFromCart).not.toHaveBeenCalled();
  });

  it("rejeita quando a quantidade passa do estoque", async () => {
    mockedCart.findByUser.mockResolvedValue([itemCarrinho(5, 2)]);

    await expect(orderService.checkout(1)).rejects.toThrow(ValidationError);
    expect(mockedOrders.createFromCart).not.toHaveBeenCalled();
  });

  it("cria o pedido com preço do banco e frete somado ao total", async () => {
    mockedCart.findByUser.mockResolvedValue([itemCarrinho(2, 5)]);
    mockedOrders.createFromCart.mockResolvedValue(pedidoFake);

    const pedido = await orderService.checkout(1);

    expect(mockedOrders.createFromCart).toHaveBeenCalledWith(
      1,
      [{ variantId: 10, quantidade: 2, precoUnitario: 100 }],
      229.9
    );
    expect(pedido.id).toBe(7);
  });

  it("cobra o preço promocional quando existe", async () => {
    mockedCart.findByUser.mockResolvedValue([itemCarrinho(4, 5, 80)]);
    mockedOrders.createFromCart.mockResolvedValue(pedidoFake);

    await orderService.checkout(1);

    expect(mockedOrders.createFromCart).toHaveBeenCalledWith(
      1,
      [{ variantId: 10, quantidade: 4, precoUnitario: 80 }],
      320
    );
  });
});

describe("orderService.getById", () => {
  it("responde NotFound para pedido de outro usuário", async () => {
    mockedOrders.findById.mockResolvedValue({ ...pedidoFake, userId: 2 });

    await expect(orderService.getById(1, "7")).rejects.toThrow(NotFoundError);
  });

  it("retorna o pedido do próprio usuário", async () => {
    mockedOrders.findById.mockResolvedValue(pedidoFake);

    const pedido = await orderService.getById(1, "7");

    expect(pedido.total).toBe(229.9);
  });
});
