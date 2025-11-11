import { z } from "zod";

export const registrarUsuarioSchema = z.object({
  token: z.string().length(64, { message: "Token inválido." }),
  nome: z
    .string()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  empresa: z.string().optional(),
  senha: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres." }),
});
