import { Request, Response } from "express";
import db from "../db";
import {
  atualizarStatusIntencaoSchema,
  criarIntencaoSchema,
} from "../schemas/intencaoSchema";
import { ZodError } from "zod";

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
    const query = `SELECT * FROM intencoes ORDER BY created_at DESC;`;
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

  try {
    const query = `
      UPDATE intencoes
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const values = [status, id];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Intenção não encontrada." });
    }

    if (status === "aprovada") {
      console.log(`Enviar email de aprovação para ${rows[0].email}`);
    }

    res.status(200).json({ message: `Intenção ${status} com sucesso.` });
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

    console.error("Erro ao atualizar status da intenção:", err);
    res.status(500).json({ error: "Erro ao atualizar status da intenção." });
  }
};
