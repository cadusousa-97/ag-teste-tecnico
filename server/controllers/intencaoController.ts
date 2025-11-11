import { Request, Response } from "express";
import db from "../db";
import {
  atualizarStatusIntencaoSchema,
  criarIntencaoSchema,
} from "../schemas/intencaoSchema";
import { ZodError } from "zod";
import { PoolClient } from "pg";
import crypto from "crypto";

export const criarIntencao = async (req: Request, res: Response) => {
  const { nome, email, empresa, motivo } = criarIntencaoSchema.parse(req.body);

  try {
    const query = `
      INSERT INTO intencoes (nome, email, empresa, motivo)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [nome, email, empresa, motivo];
    const { rows } = await db.query(query, values);

    res.status(201).json(rows[0]);
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Dados de entrada inválidos.",
        details: err.issues.map((e) => ({
          campo: e.path.join("."),
          mensagem: e.message,
        })),
      });
    }
    console.error("Erro ao criar intenção:", err);
    res.status(500).json({ error: "Erro ao criar intenção." });
  }
};

export const listarIntencoes = async (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM intencoes ORDER BY criado_em DESC;`;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err: any) {
    console.error("Erro ao listar intenções:", err);
    res.status(500).json({ error: "Erro ao listar intenções." });
  }
};

export const atualizarStatusIntencao = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID da intenção é obrigatório." });
  }

  const { status } = atualizarStatusIntencaoSchema.parse(req.body);
  const client: PoolClient = await db.connect();
  try {
    await client.query("BEGIN");

    const intencaoQuery = `
      UPDATE intencoes
      SET status = $1, atualizado_em = NOW()
      WHERE id = $2 AND status = 'pendente'
      RETURNING *;
    `;

    const values = [status, id];

    const intencaoResult = await client.query(intencaoQuery, values);

    if (intencaoResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Intenção não encontrada ou já processada." });
    }

    const intencaoAprovada = intencaoResult.rows[0];
    let conviteGerado = null;

    if (status === "aprovada") {
      const token = crypto.randomBytes(32).toString("hex");
      const expiraEm = new Date();
      expiraEm.setDate(expiraEm.getDate() + 7);

      const conviteQuery = `
      INSERT INTO convites (email, intencao_id, token, expira_em)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

      const conviteValues = [
        intencaoAprovada.email,
        intencaoAprovada.id,
        token,
        expiraEm,
      ];

      const conviteResult = await client.query(conviteQuery, conviteValues);

      conviteGerado = conviteResult.rows[0];

      console.log(`Convite gerado para: ${conviteGerado.email}`);
      console.log(`Token: ${conviteGerado.token}`);
      console.log(
        `Link de Cadastro: http://localhost:3000/cadastro?token=${conviteGerado.token}`
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      intencao: intencaoAprovada,
      convite: conviteGerado,
    });
  } catch (err: any) {
    await client.query("ROLLBACK");

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Dados de entrada inválidos.",
        details: err.issues.map((e) => ({
          campo: e.path.join("."),
          mensagem: e.message,
        })),
      });
    }

    console.error("Erro na transação de atualização:", err);
    res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: err.message });
  } finally {
    client.release();
  }
};
