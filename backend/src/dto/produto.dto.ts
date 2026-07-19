import { Prisma } from "@prisma/client";

// Tipo do produto retornado pelo repository, já com as relações incluídas
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { brand: true; category: true; variants: true };
}>;

type ProductWithFullRelations = Prisma.ProductGetPayload<{
  include: { brand: true; category: true; variants: true; images: true };
}>;

export interface ProductDTO {
  id: number;
  nome: string;
  descricao: string | null;
  precoBase: number;
  imagemPrincipal: string | null;
  marca: { id: number; nome: string; logoUrl: string | null };
  categoria: { id: number; nome: string; tipo: string };
  variantes: {
    id: number;
    tamanho: number;
    cor: string;
    estoque: number;
    sku: string;
  }[];
  imagens?: { id: number; url: string; ordem: number }[];
}

export interface PaginatedProductsDTO {
  data: ProductDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Converte o resultado "cru" do banco (com Decimal, nomes internos, etc.)
// no formato exato que a API expõe pro cliente.
export function toProductDTO(
  product: ProductWithRelations | ProductWithFullRelations
): ProductDTO {
  const dto: ProductDTO = {
    id: product.id,
    nome: product.nome,
    descricao: product.descricao,
    precoBase: Number(product.precoBase),
    imagemPrincipal: product.imagemPrincipal,
    marca: {
      id: product.brand.id,
      nome: product.brand.nome,
      logoUrl: product.brand.logoUrl,
    },
    categoria: {
      id: product.category.id,
      nome: product.category.nome,
      tipo: product.category.tipo,
    },
    variantes: product.variants.map((v) => ({
      id: v.id,
      tamanho: v.tamanho,
      cor: v.cor,
      estoque: v.estoque,
      sku: v.sku,
    })),
  };

  if ("images" in product) {
    dto.imagens = product.images.map((img) => ({
      id: img.id,
      url: img.url,
      ordem: img.ordem,
    }));
  }

  return dto;
}