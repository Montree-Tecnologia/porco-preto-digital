import { Router } from "express";
import { db } from "../db";
import { piquetes, insertPiqueteSchema } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { validateRequest } from "../utils/validation";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userPiquetes = await db.query.piquetes.findMany({
      where: eq(piquetes.usuarioId, req.userId!),
      with: {
        porcos: true,
      },
    });

    res.json(userPiquetes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar piquetes" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const piquete = await db.query.piquetes.findFirst({
      where: and(
        eq(piquetes.id, parseInt(req.params.id)),
        eq(piquetes.usuarioId, req.userId!)
      ),
      with: {
        porcos: true,
      },
    });

    if (!piquete) {
      return res.status(404).json({ error: "Piquete não encontrado" });
    }

    res.json(piquete);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar piquete" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertPiqueteSchema, req.body, res);
    if (!validData) return;

    const [newPiquete] = await db.insert(piquetes).values({
      ...validData,
      usuarioId: req.userId!,
    }).returning();

    res.status(201).json(newPiquete);
  } catch (error) {
    console.error("Erro ao criar piquete:", error);
    res.status(500).json({ error: "Erro ao criar piquete" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertPiqueteSchema.partial(), req.body, res);
    if (!validData) return;
    
    const [updatedPiquete] = await db
      .update(piquetes)
      .set(validData)
      .where(
        and(
          eq(piquetes.id, parseInt(req.params.id)),
          eq(piquetes.usuarioId, req.userId!)
        )
      )
      .returning();

    if (!updatedPiquete) {
      return res.status(404).json({ error: "Piquete não encontrado" });
    }

    res.json(updatedPiquete);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar piquete" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(piquetes)
      .where(
        and(
          eq(piquetes.id, parseInt(req.params.id)),
          eq(piquetes.usuarioId, req.userId!)
        )
      );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar piquete" });
  }
});

export default router;
