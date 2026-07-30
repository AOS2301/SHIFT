import { categoryService } from "../categoria.service";
import { categoryRepository } from "../../repositories/categoria.repository";
import { ValidationError } from "../../errors/AppError";

jest.mock("../../repositories/categoria.repository");

const mockedRepo = categoryRepository as jest.Mocked<typeof categoryRepository>;

describe("categoryService.list", () => {
  it("lança ValidationError se o tipo informado for inválido", async () => {
    await expect(categoryService.list("INVALIDO")).rejects.toThrow(ValidationError);
  });

  it("aceita CATEGORIA e GENERO como tipos válidos", async () => {
    mockedRepo.findMany.mockResolvedValue([]);

    await expect(categoryService.list("CATEGORIA")).resolves.toEqual([]);
    await expect(categoryService.list("GENERO")).resolves.toEqual([]);
  });
});

describe("categoryService.create", () => {
  it("lança ValidationError se faltar nome ou tipo", async () => {
    await expect(categoryService.create({ nome: "Corrida" })).rejects.toThrow(
      ValidationError
    );
  });

  it("lança ValidationError se o tipo não for CATEGORIA nem GENERO", async () => {
    await expect(
      categoryService.create({ nome: "Corrida", tipo: "ERRADO" })
    ).rejects.toThrow(ValidationError);
  });

  it("cria a categoria quando os dados são válidos", async () => {
    mockedRepo.create.mockResolvedValue({
      id: 1,
      nome: "Trail Running",
      tipo: "CATEGORIA",
    } as any);

    const result = await categoryService.create({
      nome: "Trail Running",
      tipo: "CATEGORIA",
    });

    expect(result.nome).toBe("Trail Running");
  });
});