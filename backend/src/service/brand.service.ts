import { brandRepository, CreateBrandData } from "../repositories/brand.repository";
import { ValidationError } from "../errors/AppError";

export interface CreateBrandInput {
  nome?: string;
  logoUrl?: string;
}

export const brandService = {
  async list() {
    return brandRepository.findMany();
  },

  async create(input: CreateBrandInput) {
    if (!input.nome) {
      throw new ValidationError("Campo obrigatório: nome");
    }

    const existing = await brandRepository.findByNome(input.nome);
    if (existing) {
      throw new ValidationError(`A marca "${input.nome}" já existe`);
    }

    const data: CreateBrandData = { nome: input.nome };
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;

    return brandRepository.create(data);
  },
};