import { brandService } from "../brand.service";
import { brandRepository } from "../../repositories/brand.repository";
import { ValidationError } from "../../errors/AppError";

jest.mock("../../repositories/brand.repository");

const mockedRepo = brandRepository as jest.Mocked<typeof brandRepository>;

describe("brandService.create", () => {
  it("lança ValidationError se faltar o nome", async () => {
    await expect(brandService.create({})).rejects.toThrow(ValidationError);
  });

  it("lança ValidationError se a marca já existir", async () => {
    mockedRepo.findByNome.mockResolvedValue({
      id: 1,
      nome: "Nike",
      logoUrl: null,
    } as any);

    await expect(brandService.create({ nome: "Nike" })).rejects.toThrow(
      ValidationError
    );
  });

  it("cria a marca quando o nome é novo", async () => {
    mockedRepo.findByNome.mockResolvedValue(null);
    mockedRepo.create.mockResolvedValue({ id: 2, nome: "Asics", logoUrl: null } as any);

    const result = await brandService.create({ nome: "Asics" });

    expect(result.nome).toBe("Asics");
    expect(mockedRepo.create).toHaveBeenCalledWith({ nome: "Asics" });
  });
});