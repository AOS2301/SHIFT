import { productService } from "../produto.service";
import { productRepository } from "../../repositories/produto.repository";
import { ValidationError, NotFoundError } from "../../errors/AppError";

// Mocka o repository inteiro — os testes de service não devem depender
// de um banco de dados real, só das regras de negócio.
jest.mock("../../repositories/produto.repository");

const mockedRepo = productRepository as jest.Mocked<typeof productRepository>;

// Formato "cru" que o Prisma devolveria, com as relações incluídas
const produtoFake = {
  id: 1,
  nome: "Air Max Pulse",
  descricao: "Teste",
  precoBase: 899 as any,
  imagemPrincipal: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  brandId: 1,
  categoryId: 1,
  brand: { id: 1, nome: "Nike", logoUrl: null },
  category: { id: 1, nome: "Corrida", tipo: "CATEGORIA" as const },
  variants: [{ id: 1, tamanho: 40, cor: "Preto", estoque: 5, sku: "NK-1", productId: 1 }],
};

describe("productService.list", () => {
  it("retorna produtos paginados", async () => {
    mockedRepo.findMany.mockResolvedValue([produtoFake] as any);
    mockedRepo.count.mockResolvedValue(1);

    const result = await productService.list({});

    expect(result.data).toHaveLength(1);
    expect(result.data[0]!.nome).toBe("Air Max Pulse");
    expect(result.pagination.total).toBe(1);
  });

  it("nunca deixa o limit passar de 50, mesmo se pedido um valor maior", async () => {
    mockedRepo.findMany.mockResolvedValue([]);
    mockedRepo.count.mockResolvedValue(0);

    await productService.list({ limit: 9999 });

    expect(mockedRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it("nunca deixa a página ser menor que 1", async () => {
    mockedRepo.findMany.mockResolvedValue([]);
    mockedRepo.count.mockResolvedValue(0);

    await productService.list({ page: -5 });

    expect(mockedRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });
});

describe("productService.getById", () => {
  it("lança ValidationError se o ID não for um número", async () => {
    await expect(productService.getById("abc")).rejects.toThrow(ValidationError);
  });

  it("lança NotFoundError se o produto não existir", async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(productService.getById("999")).rejects.toThrow(NotFoundError);
  });

  it("retorna o produto formatado quando encontrado", async () => {
    mockedRepo.findById.mockResolvedValue(produtoFake as any);

    const result = await productService.getById("1");

    expect(result.id).toBe(1);
    expect(result.marca.nome).toBe("Nike");
  });
});

describe("productService.create", () => {
  it("lança ValidationError se faltar campo obrigatório", async () => {
    await expect(productService.create({ nome: "Teste" })).rejects.toThrow(
      ValidationError
    );
  });

  it("lança ValidationError se precoBase for zero ou negativo", async () => {
    await expect(
      productService.create({
        nome: "Teste",
        precoBase: 0,
        brandId: 1,
        categoryId: 1,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("cria o produto quando os dados são válidos", async () => {
    mockedRepo.create.mockResolvedValue(produtoFake as any);
    mockedRepo.findById.mockResolvedValue(produtoFake as any);

    const result = await productService.create({
      nome: "Air Max Pulse",
      precoBase: 899,
      brandId: 1,
      categoryId: 1,
    });

    expect(result.nome).toBe("Air Max Pulse");
    expect(mockedRepo.create).toHaveBeenCalled();
  });
});

describe("productService.delete", () => {
  it("lança NotFoundError se o produto não existir", async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(productService.delete("999")).rejects.toThrow(NotFoundError);
  });
});