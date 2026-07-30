import request from "supertest";
import { app } from "../app";
import { prisma } from "../lib/prisma";

// Mocka o Prisma inteiro pra esse teste não depender de conexão real com o banco
jest.mock("../lib/prisma", () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("GET /health", () => {
  it("responde ok quando o banco está acessível", async () => {
    (mockedPrisma.$queryRaw as jest.Mock).mockResolvedValue([{ "?column?": 1 }]);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", database: "connected" });
  });

  it("responde 503 quando o banco está inacessível", async () => {
    (mockedPrisma.$queryRaw as jest.Mock).mockRejectedValue(new Error("conexão falhou"));

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
  });
});