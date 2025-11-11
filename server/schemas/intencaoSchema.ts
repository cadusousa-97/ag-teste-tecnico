import { z } from "zod";
export const criarIntencaoSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  email: z.email("Email inválido."),
  empresa: z.string().optional(),
  motivo: z.string().optional(),
});

export const atualizarStatusIntencaoSchema = z.object({
  status: z.enum(["aprovada", "rejeitada"], {
    error: "Status deve ser 'aprovada' ou 'rejeitada'",
  }),
});

export type CriarIntencaoBody = z.infer<typeof criarIntencaoSchema>;
