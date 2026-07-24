import { User } from "@prisma/client";

// Formato do usuário exposto pela API — nunca inclui senhaHash
export interface UsuarioDTO {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export interface AuthResponseDTO {
  usuario: UsuarioDTO;
  token: string;
}

export function toUsuarioDTO(user: User): UsuarioDTO {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
  };
}