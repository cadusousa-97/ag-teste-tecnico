import request from "supertest";
import app from "../app";
import db from "../db";

const insertMockIntencao = async () => {
  const res = await db.query(
    `INSERT INTO intencoes (nome, email, empresa, motivo, status)
     VALUES ($1, $2, $3, $4, 'pendente')
     RETURNING *;`,
    ["Mock usuario", "mock@test.com", "Mock Empresa", "Mock motivo"]
  );
  return res.rows[0];
};

describe("Intenção API", () => {
  beforeEach(async () => {
    await db.query("DELETE FROM convites");
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

  describe("PATCH /api/intencoes/:id", () => {
    it("deve APROVAR uma intenção e CRIAR um convite (Transação)", async () => {
      const intencao = await insertMockIntencao();

      const res = await request(app)
        .patch(`/api/intencoes/${intencao.id}`)
        .send({ status: "aprovada" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.intencao.status).toBe("aprovada");
      expect(res.body.data.intencao.id).toBe(intencao.id);

      expect(res.body.data.convite.token).toBeDefined();
      expect(res.body.data.convite.token.length).toBe(64);
      expect(res.body.data.convite.intencao_id).toBe(intencao.id);

      const conviteDb = await db.query(
        "SELECT * FROM convites WHERE intencao_id = $1",
        [intencao.id]
      );
      expect(conviteDb.rows.length).toBe(1);
      expect(conviteDb.rows[0].email).toBe("mock@test.com");
    });

    it("deve REJEITAR uma intenção e NÃO criar um convite", async () => {
      const intencao = await insertMockIntencao();

      const res = await request(app)
        .patch(`/api/intencoes/${intencao.id}`)
        .send({ status: "rejeitada" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.intencao.status).toBe("rejeitada");
      expect(res.body.data.convite).toBeNull();

      const conviteDb = await db.query(
        "SELECT * FROM convites WHERE intencao_id = $1",
        [intencao.id]
      );
      expect(conviteDb.rows.length).toBe(0);
    });

    it("deve retornar erro 404 se a intenção já foi processada", async () => {
      const intencao = await insertMockIntencao();
      await request(app)
        .patch(`/api/intencoes/${intencao.id}`)
        .send({ status: "aprovada" });

      const res = await request(app)
        .patch(`/api/intencoes/${intencao.id}`)
        .send({ status: "aprovada" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Intenção não encontrada ou já processada.");
    });

    it("deve retornar erro 400 para um status inválido (Zod)", async () => {
      const intencao = await insertMockIntencao();

      const res = await request(app)
        .patch(`/api/intencoes/${intencao.id}`)
        .send({ status: "pendente" });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Dados de entrada inválidos.");
      expect(res.body.details[0].mensagem).toContain(
        "Status deve ser 'aprovada' ou 'rejeitada'"
      );
    });
  });
});
