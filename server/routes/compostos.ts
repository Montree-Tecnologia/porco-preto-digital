import { Router } from "express";
import { db } from "../db";
import { compostosAlimentares, insertCompostoSchema } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { validateRequest } from "../utils/validation";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userCompostos = await db.query.compostosAlimentares.findMany({
      where: eq(compostosAlimentares.usuarioId, req.userId!),
    });

    res.json(userCompostos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar compostos" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const composto = await db.query.compostosAlimentares.findFirst({
      where: and(
        eq(compostosAlimentares.id, parseInt(req.params.id)),
        eq(compostosAlimentares.usuarioId, req.userId!)
      ),
    });

    if (!composto) {
      return res.status(404).json({ error: "Composto não encontrado" });
    }

    res.json(composto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar composto" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertCompostoSchema, req.body, res);
    if (!validData) return;

    const [newComposto] = await db.insert(compostosAlimentares).values({
      ...validData,
      usuarioId: req.userId!,
    }).returning();

    res.status(201).json(newComposto);
  } catch (error) {
    console.error("Erro ao criar composto:", error);
    res.status(500).json({ error: "Erro ao criar composto" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertCompostoSchema.partial(), req.body, res);
    if (!validData) return;
    
    const [updatedComposto] = await db
      .update(compostosAlimentares)
      .set(validData)
      .where(
        and(
          eq(compostosAlimentares.id, parseInt(req.params.id)),
          eq(compostosAlimentares.usuarioId, req.userId!)
        )
      )
      .returning();

    if (!updatedComposto) {
      return res.status(404).json({ error: "Composto não encontrado" });
    }

    res.json(updatedComposto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar composto" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(compostosAlimentares)
      .where(
        and(
          eq(compostosAlimentares.id, parseInt(req.params.id)),
          eq(compostosAlimentares.usuarioId, req.userId!)
        )
      );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar composto" });
  }
});

export default router;
