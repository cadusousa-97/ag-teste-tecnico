import { Request, Response } from "express";
import db from "../db";
import { registrarUsuarioSchema } from "../schemas/usuarioSchema";
import { ZodError } from "zod";
import { PoolClient } from "pg";
import bcrypt from "bcryptjs";

export const registrarUsuario = async (req: Request, res: Response) => {
  const client: PoolClient = await db.connect();

  try {
    const { token, nome, empresa, senha } = registrarUsuarioSchema.parse(
      req.body
    );

    await client.query("BEGIN");

    const conviteQuery = `
      SELECT * FROM convites 
      WHERE token = $1 AND usado_em IS NULL AND expira_em > NOW()
      FOR UPDATE;
    `;
    const conviteResult = await client.query(conviteQuery, [token]);

    if (conviteResult.rows.length === 0) {
      throw new Error("Convite inválido, expirado ou já utilizado.");
    }

    const conviteValido = conviteResult.rows[0];

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const usuarioQuery = `
      INSERT INTO usuarios (nome, email, senha_hash, empresa, tipo, ativo)
      VALUES ($1, $2, $3, $4, 'membro', true)
      RETURNING id, nome, email, empresa;
    `;
    const usuarioValues = [nome, conviteValido.email, senhaHash, empresa];

    const usuarioResult = await client.query(usuarioQuery, usuarioValues);
    const novoUsuario = usuarioResult.rows[0];

    const marcarUsadoQuery =
      "UPDATE convites SET usado_em = NOW() WHERE id = $1";
    await client.query(marcarUsadoQuery, [conviteValido.id]);

    await client.query("COMMIT");

    res.status(201).json({ success: true, data: novoUsuario });
  } catch (err: any) {
    await client.query("ROLLBACK");

    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Dados de entrada inválidos.",
        details: err.issues.map((e) => ({
          campo: e.path.join("."),
          mensagem: e.message,
        })),
      });
    }

    if (err.constraint.includes("usuarios_email_key")) {
      return res.status(409).json({
        success: false,
        error: "Este email já está cadastrado na plataforma.",
      });
    }

    if (err.message === "Convite inválido, expirado ou já utilizado.") {
      return res.status(404).json({ success: false, error: err.message });
    }

    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Erro interno do servidor.",
    });
  } finally {
    client.release();
  }
};
