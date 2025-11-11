import request from "supertest";
import app from "../app";
import db from "../db";

describe("Intenção API", () => {
  beforeEach(async () => {
    await db.query("DELETE FROM intencoes");
  });

  afterAll(async () => {
    await db.end();
  });

  describe("POST /api/intencoes", () => {
    it("deve criar uma nova intenção com dados válidos", async () => {
      const novaIntencao = {
        nome: "Candidato de Teste",
        email: "teste@exemplo.com",
        empresa: "Empresa Teste",
        motivo: "Motivo de teste",
      };

      const res = await request(app).post("/api/intencoes").send(novaIntencao);

      expect(res.statusCode).toEqual(201);

      expect(res.body.success).toBe(true);

      expect(res.body.data.email).toBe("teste@exemplo.com");
      expect(res.body.data.status).toBe("pendente");
      expect(res.body.data.id).toBeDefined();
    });

    it("deve retornar erro 400 (Bad Request) para dados inválidos (Zod)", async () => {
      const intencaoInvalida = {
        nome: "Candidato 2",
        empresa: "Empresa Teste 2",
      };

      const res = await request(app)
        .post("/api/intencoes")
        .send(intencaoInvalida);

      expect(res.statusCode).toEqual(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Dados de entrada inválidos.");

      expect(res.body.details[0].campo).toBe("email");
      expect(res.body.details[0].mensagem).toBe("Email inválido.");
    });

    it("deve retornar erro 409 (Conflict) ao tentar duplicar email", async () => {
      const intencaoOriginal = {
        nome: "Candidato Original",
        email: "original@exemplo.com",
      };
      await request(app).post("/api/intencoes").send(intencaoOriginal);

      const intencaoDuplicada = {
        nome: "Candidato Duplicado",
        email: "original@exemplo.com",
      };
      const res = await request(app)
        .post("/api/intencoes")
        .send(intencaoDuplicada);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Este email já foi submetido.");
    });
  });
});
