import { CategoryType } from "@prisma/client";
import { categoryRepository } from "../repositories/categoria.repository";
import { ValidationError } from "../errors/AppError";

export interface CreateCategoryInput {
  nome?: string;
  tipo?: string;
}

const VALID_TYPES: CategoryType[] = ["CATEGORIA", "GENERO"];

export const categoryService = {
  async list(tipoParam?: string) {
    if (tipoParam && !VALID_TYPES.includes(tipoParam as CategoryType)) {
      throw new ValidationError(`tipo deve ser um de: ${VALID_TYPES.join(", ")}`);
    }

    return categoryRepository.findMany(tipoParam as CategoryType | undefined);
  },

  async create(input: CreateCategoryInput) {
    if (!input.nome || !input.tipo) {
      throw new ValidationError("Campos obrigatórios: nome, tipo");
    }

    if (!VALID_TYPES.includes(input.tipo as CategoryType)) {
      throw new ValidationError(`tipo deve ser um de: ${VALID_TYPES.join(", ")}`);
    }

    return categoryRepository.create({
      nome: input.nome,
      tipo: input.tipo as CategoryType,
    });
  },
};