import { Router } from "express";
import { db } from "../db";
import { custos, insertCustoSchema } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { validateRequest } from "../utils/validation";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userCustos = await db.query.custos.findMany({
      where: eq(custos.usuarioId, req.userId!),
    });

    res.json(userCustos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar custos" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const custo = await db.query.custos.findFirst({
      where: and(
        eq(custos.id, parseInt(req.params.id)),
        eq(custos.usuarioId, req.userId!)
      ),
    });

    if (!custo) {
      return res.status(404).json({ error: "Custo não encontrado" });
    }

    res.json(custo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar custo" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertCustoSchema, req.body, res);
    if (!validData) return;

    const [newCusto] = await db.insert(custos).values({
      ...validData,
      usuarioId: req.userId!,
    }).returning();

    res.status(201).json(newCusto);
  } catch (error) {
    console.error("Erro ao criar custo:", error);
    res.status(500).json({ error: "Erro ao criar custo" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertCustoSchema.partial(), req.body, res);
    if (!validData) return;
    
    const [updatedCusto] = await db
      .update(custos)
      .set(validData)
      .where(
        and(
          eq(custos.id, parseInt(req.params.id)),
          eq(custos.usuarioId, req.userId!)
        )
      )
      .returning();

    if (!updatedCusto) {
      return res.status(404).json({ error: "Custo não encontrado" });
    }

    res.json(updatedCusto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar custo" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(custos)
      .where(
        and(
          eq(custos.id, parseInt(req.params.id)),
          eq(custos.usuarioId, req.userId!)
        )
      );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar custo" });
  }
});

export default router;
