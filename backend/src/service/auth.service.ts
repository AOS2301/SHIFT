import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usuarioRepository } from "../repositories/usuario.repository";
import { toUsuarioDTO, AuthResponseDTO } from "../dto/usuario.dto";
import { ValidationError } from "../errors/AppError";

export interface RegisterInput {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface LoginInput {
  email?: string;
  senha?: string;
}

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "7d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Falha alto e cedo: se o .env não tiver o segredo, é melhor quebrar
    // no boot do que gerar tokens inseguros silenciosamente.
    throw new Error("JWT_SECRET não está definido no .env");
  }
  return secret;
}

function gerarToken(userId: number): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponseDTO> {
    if (!input.nome || !input.email || !input.senha) {
      throw new ValidationError("Campos obrigatórios: nome, email, senha");
    }

    if (!EMAIL_REGEX.test(input.email)) {
      throw new ValidationError("Email inválido");
    }

    if (input.senha.length < 6) {
      throw new ValidationError("A senha precisa ter pelo menos 6 caracteres");
    }

    const existente = await usuarioRepository.findByEmail(input.email);
    if (existente) {
      throw new ValidationError("Já existe uma conta com esse email");
    }

    const senhaHash = await bcrypt.hash(input.senha, SALT_ROUNDS);

    const usuario = await usuarioRepository.create({
      nome: input.nome,
      email: input.email,
      senhaHash,
    });

    const token = gerarToken(usuario.id);

    return { usuario: toUsuarioDTO(usuario), token };
  },

  async login(input: LoginInput): Promise<AuthResponseDTO> {
    if (!input.email || !input.senha) {
      throw new ValidationError("Campos obrigatórios: email, senha");
    }

    const usuario = await usuarioRepository.findByEmail(input.email);

    // Mensagem de erro genérica de propósito: não revela se foi o email
    // ou a senha que errou (evita dar dica pra quem tenta adivinhar contas)
    if (!usuario) {
      throw new ValidationError("Email ou senha inválidos");
    }

    const senhaConfere = await bcrypt.compare(input.senha, usuario.senhaHash);
    if (!senhaConfere) {
      throw new ValidationError("Email ou senha inválidos");
    }

    const token = gerarToken(usuario.id);

    return { usuario: toUsuarioDTO(usuario), token };
  },
};