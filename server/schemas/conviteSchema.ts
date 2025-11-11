// server/schemas/conviteSchema.ts
import { z } from "zod";

export const verificarTokenSchema = z.object({
  token: z.string().length(64, { message: "Token inválido." }),
});
