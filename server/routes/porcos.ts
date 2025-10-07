import { Router } from "express";
import { db } from "../db";
import { porcos, insertPorcoSchema } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { validateRequest } from "../utils/validation";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userPorcos = await db.query.porcos.findMany({
      where: eq(porcos.usuarioId, req.userId!),
      with: {
        piquete: true,
      },
    });

    res.json(userPorcos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar porcos" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const porco = await db.query.porcos.findFirst({
      where: and(
        eq(porcos.id, parseInt(req.params.id)),
        eq(porcos.usuarioId, req.userId!)
      ),
      with: {
        piquete: true,
      },
    });

    if (!porco) {
      return res.status(404).json({ error: "Porco não encontrado" });
    }

    res.json(porco);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar porco" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertPorcoSchema, req.body, res);
    if (!validData) return;

    const [newPorco] = await db.insert(porcos).values({
      ...validData,
      usuarioId: req.userId!,
    }).returning();

    res.status(201).json(newPorco);
  } catch (error) {
    console.error("Erro ao criar porco:", error);
    res.status(500).json({ error: "Erro ao criar porco" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    // Validar request body (permite campos parciais para update)
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertPorcoSchema.partial(), req.body, res);
    if (!validData) return;

    const [updatedPorco] = await db
      .update(porcos)
      .set(validData)
      .where(
        and(
          eq(porcos.id, parseInt(req.params.id)),
          eq(porcos.usuarioId, req.userId!)
        )
      )
      .returning();

    if (!updatedPorco) {
      return res.status(404).json({ error: "Porco não encontrado" });
    }

    res.json(updatedPorco);
  } catch (error) {
    console.error("Erro ao atualizar porco:", error);
    res.status(500).json({ error: "Erro ao atualizar porco" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(porcos)
      .where(
        and(
          eq(porcos.id, parseInt(req.params.id)),
          eq(porcos.usuarioId, req.userId!)
        )
      );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar porco" });
  }
});

export default router;
