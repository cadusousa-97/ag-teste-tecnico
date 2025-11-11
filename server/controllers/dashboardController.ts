// server/controllers/dashboardController.ts
import { Request, Response } from "express";
import db from "../db";

export const listarDashboardStats = async (req: Request, res: Response) => {
  try {
    const queryMembros =
      "SELECT COUNT(*) AS total_membros_ativos FROM usuarios WHERE ativo = true";
    const { rows } = await db.query(queryMembros);

    const total_membros_ativos = parseInt(rows[0].total_membros_ativos, 10);

    const indicacoes_mes_mock = Math.floor(Math.random() * 20) + 5;
    const agradecimentos_mes_mock = Math.floor(Math.random() * 10) + 2;

    res.status(200).json({
      success: true,
      data: {
        total_membros_ativos: total_membros_ativos,
        indicacoes_mes: indicacoes_mes_mock,
        agradecimentos_mes: agradecimentos_mes_mock,
      },
    });
  } catch (err: any) {
    console.error("Erro ao buscar estatísticas do dashboard:", err);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor.",
    });
  }
};
