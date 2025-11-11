import { Request, Response } from "express";
import db from "../db";
import { verificarTokenSchema } from "../schemas/conviteSchema";
import { ZodError } from "zod";

export const verificarTokenConvite = async (req: Request, res: Response) => {
  try {
    const { token } = verificarTokenSchema.parse(req.params);

    const query = `
      SELECT * FROM convites 
      WHERE token = $1 AND usado_em IS NULL AND expira_em > NOW();
    `;
    const { rows } = await db.query(query, [token]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Convite inválido, expirado ou já utilizado.",
      });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err: any) {
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
    console.error("Erro ao verificar convite:", err);
    res
      .status(500)
      .json({ success: false, error: "Erro interno do servidor." });
  }
};
