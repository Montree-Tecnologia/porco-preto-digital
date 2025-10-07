import { z } from "zod";
import { Response } from "express";

/**
 * Valida dados com um schema Zod e retorna erro 400 se inválido
 * @param schema Schema Zod para validação
 * @param data Dados a serem validados
 * @param res Response do Express para enviar erro
 * @returns Dados validados ou null se inválido
 */
export function validateRequest<T = any>(
  schema: z.ZodTypeAny,
  data: unknown,
  res: Response
): T | null {
  const validation = schema.safeParse(data);
  
  if (!validation.success) {
    res.status(400).json({ 
      error: "Dados inválidos", 
      detalhes: validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`) 
    });
    return null;
  }
  
  return validation.data as T;
}
