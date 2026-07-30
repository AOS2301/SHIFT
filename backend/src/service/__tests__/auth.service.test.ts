import { authService } from "../auth.service";
import { usuarioRepository } from "../../repositories/usuario.repository";
import { ValidationError } from "../../errors/AppError";

jest.mock("../../repositories/usuario.repository");

const mockedRepo = usuarioRepository as jest.Mocked<typeof usuarioRepository>;

describe("authService.register", () => {
  it("lança ValidationError se faltar campo obrigatório", async () => {
    await expect(authService.register({ nome: "Teste" })).rejects.toThrow(
      ValidationError
    );
  });

  it("lança ValidationError se o email for inválido", async () => {
    await expect(
      authService.register({ nome: "Teste", email: "nao-e-email", senha: "123456" })
    ).rejects.toThrow(ValidationError);
  });

  it("lança ValidationError se a senha tiver menos de 6 caracteres", async () => {
    await expect(
      authService.register({ nome: "Teste", email: "teste@teste.com", senha: "123" })
    ).rejects.toThrow(ValidationError);
  });

  it("lança ValidationError se o email já estiver cadastrado", async () => {
    mockedRepo.findByEmail.mockResolvedValue({
      id: 1,
      nome: "Existente",
      email: "teste@teste.com",
      senhaHash: "hash",
      role: "CUSTOMER",
    } as any);

    await expect(
      authService.register({ nome: "Teste", email: "teste@teste.com", senha: "123456" })
    ).rejects.toThrow(ValidationError);
  });

  it("cria o usuário e devolve token quando os dados são válidos", async () => {
    mockedRepo.findByEmail.mockResolvedValue(null);
    mockedRepo.create.mockResolvedValue({
      id: 1,
      nome: "Teste",
      email: "teste@teste.com",
      senhaHash: "hash-qualquer",
      role: "CUSTOMER",
    } as any);

    const result = await authService.register({
      nome: "Teste",
      email: "teste@teste.com",
      senha: "123456",
    });

    expect(result.usuario.email).toBe("teste@teste.com");
    expect(result.usuario).not.toHaveProperty("senhaHash"); // nunca vaza o hash
    expect(typeof result.token).toBe("string");
  });
});

describe("authService.login", () => {
  it("lança ValidationError se o email não existir (mensagem genérica)", async () => {
    mockedRepo.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: "naoexiste@teste.com", senha: "123456" })
    ).rejects.toThrow(ValidationError);
  });

  it("lança ValidationError se a senha estiver errada", async () => {
    const bcrypt = require("bcrypt");
    const senhaHashReal = await bcrypt.hash("senhacerta", 10);

    mockedRepo.findByEmail.mockResolvedValue({
      id: 1,
      nome: "Teste",
      email: "teste@teste.com",
      senhaHash: senhaHashReal,
      role: "CUSTOMER",
    } as any);

    await expect(
      authService.login({ email: "teste@teste.com", senha: "senhaerrada" })
    ).rejects.toThrow(ValidationError);
  });

  it("retorna token quando email e senha conferem", async () => {
    const bcrypt = require("bcrypt");
    const senhaHashReal = await bcrypt.hash("senhacerta", 10);

    mockedRepo.findByEmail.mockResolvedValue({
      id: 1,
      nome: "Teste",
      email: "teste@teste.com",
      senhaHash: senhaHashReal,
      role: "CUSTOMER",
    } as any);

    const result = await authService.login({
      email: "teste@teste.com",
      senha: "senhacerta",
    });

    expect(typeof result.token).toBe("string");
  });
});