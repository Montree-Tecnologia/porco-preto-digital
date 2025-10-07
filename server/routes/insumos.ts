import { Router } from "express";
import { db } from "../db";
import { insumos } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userInsumos = await db.query.insumos.findMany({
      where: eq(insumos.usuarioId, req.userId!),
    });

    res.json(userInsumos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar insumos" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const insumo = await db.query.insumos.findFirst({
      where: and(
        eq(insumos.id, parseInt(req.params.id)),
        eq(insumos.usuarioId, req.userId!)
      ),
    });

    if (!insumo) {
      return res.status(404).json({ error: "Insumo não encontrado" });
    }

    res.json(insumo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar insumo" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const [newInsumo] = await db.insert(insumos).values({
      ...req.body,
      usuarioId: req.userId!,
    }).returning();

    res.status(201).json(newInsumo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar insumo" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const { usuarioId, id, createdAt, updatedAt, ...updateData } = req.body;
    
    const [updatedInsumo] = await db
      .update(insumos)
      .set(updateData)
      .where(
        and(
          eq(insumos.id, parseInt(req.params.id)),
          eq(insumos.usuarioId, req.userId!)
        )
      )
      .returning();

    if (!updatedInsumo) {
      return res.status(404).json({ error: "Insumo não encontrado" });
    }

    res.json(updatedInsumo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar insumo" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(insumos)
      .where(
        and(
          eq(insumos.id, parseInt(req.params.id)),
          eq(insumos.usuarioId, req.userId!)
        )
      );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar insumo" });
  }
});

export default router;
