import { Prisma } from "@prisma/client";
import {
  productRepository,
  UpdateProductData,
  CreateProductData,
} from "../repositories/produto.repository";
import { toProductDTO, ProductDTO, PaginatedProductsDTO } from "../dto/produto.dto";
import { NotFoundError, ValidationError } from "../errors/AppError";

export interface ListProductsInput {
  page?: string | number;
  limit?: string | number;
  brand?: string;
  category?: string;
  search?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

export interface CreateProductInput {
  nome?: string;
  descricao?: string;
  precoBase?: number | string;
  imagemPrincipal?: string;
  brandId?: number | string;
  categoryId?: number | string;
}

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

export const productService = {
  async list(input: ListProductsInput): Promise<PaginatedProductsDTO> {
    const page = Math.max(1, Number(input.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(input.limit) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (input.brand) {
      where.brand = { nome: { equals: input.brand, mode: "insensitive" } };
    }

    if (input.category) {
      where.category = { nome: { equals: input.category, mode: "insensitive" } };
    }

    if (input.search) {
      where.nome = { contains: input.search, mode: "insensitive" };
    }

    if (input.minPrice || input.maxPrice) {
      where.precoBase = {};
      if (input.minPrice) where.precoBase.gte = Number(input.minPrice);
      if (input.maxPrice) where.precoBase.lte = Number(input.maxPrice);
    }

    const [products, total] = await Promise.all([
      productRepository.findMany({ where, skip, take: limit }),
      productRepository.count(where),
    ]);

    return {
      data: products.map(toProductDTO),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(idParam: string): Promise<ProductDTO> {
    const id = Number(idParam);

    if (Number.isNaN(id)) {
      throw new ValidationError("ID de produto inválido");
    }

    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError("Produto não encontrado");
    }

    return toProductDTO(product);
  },

  async create(input: CreateProductInput): Promise<ProductDTO> {
    if (!input.nome || !input.precoBase || !input.brandId || !input.categoryId) {
      throw new ValidationError(
        "Campos obrigatórios: nome, precoBase, brandId, categoryId"
      );
    }

    const precoBase = Number(input.precoBase);
    if (Number.isNaN(precoBase) || precoBase <= 0) {
      throw new ValidationError("precoBase deve ser um número maior que zero");
    }

    const data: CreateProductData = {
      nome: input.nome,
      precoBase,
      brandId: Number(input.brandId),
      categoryId: Number(input.categoryId),
    };
    if (input.descricao !== undefined) data.descricao = input.descricao;
    if (input.imagemPrincipal !== undefined) data.imagemPrincipal = input.imagemPrincipal;

    const created = await productRepository.create(data);

    const product = await productRepository.findById(created.id);
    return toProductDTO(product!);
  },

  async update(idParam: string, input: CreateProductInput): Promise<ProductDTO> {
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      throw new ValidationError("ID de produto inválido");
    }

    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Produto não encontrado");
    }

    if (input.precoBase !== undefined) {
      const precoBase = Number(input.precoBase);
      if (Number.isNaN(precoBase) || precoBase <= 0) {
        throw new ValidationError("precoBase deve ser um número maior que zero");
      }
    }

    const updateData: UpdateProductData = {};

    if (input.nome !== undefined) updateData.nome = input.nome;
    if (input.descricao !== undefined) updateData.descricao = input.descricao;
    if (input.precoBase !== undefined) updateData.precoBase = Number(input.precoBase);
    if (input.imagemPrincipal !== undefined) updateData.imagemPrincipal = input.imagemPrincipal;
    if (input.brandId !== undefined) updateData.brandId = Number(input.brandId);
    if (input.categoryId !== undefined) updateData.categoryId = Number(input.categoryId);

    await productRepository.update(id, updateData);

    const updated = await productRepository.findById(id);
    return toProductDTO(updated!);
  },

  async delete(idParam: string): Promise<void> {
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      throw new ValidationError("ID de produto inválido");
    }

    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Produto não encontrado");
    }

    await productRepository.delete(id);
  },
};