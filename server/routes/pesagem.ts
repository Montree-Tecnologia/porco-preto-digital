import { Router } from "express";
import { db } from "../db";
import { registrosPeso } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userRegistros = await db.query.registrosPeso.findMany({
      where: eq(registrosPeso.usuarioId, req.userId!),
      with: {
        porco: true,
      },
    });

    res.json(userRegistros);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registros de peso" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const registro = await db.query.registrosPeso.findFirst({
      where: and(
        eq(registrosPeso.id, parseInt(req.params.id)),
        eq(registrosPeso.usuarioId, req.userId!)
      ),
      with: {
        porco: true,
      },
    });

    if (!registro) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }

    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registro" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const [newRegistro] = await db.insert(registrosPeso).values({
      ...req.body,
      usuarioId: req.userId!,
    }).returning();

    res.status(201).json(newRegistro);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar registro" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const { usuarioId, id, createdAt, ...updateData } = req.body;
    
    const [updatedRegistro] = await db
      .update(registrosPeso)
      .set(updateData)
      .where(
        and(
          eq(registrosPeso.id, parseInt(req.params.id)),
          eq(registrosPeso.usuarioId, req.userId!)
        )
      )
      .returning();

    if (!updatedRegistro) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }

    res.json(updatedRegistro);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(registrosPeso)
      .where(
        and(
          eq(registrosPeso.id, parseInt(req.params.id)),
          eq(registrosPeso.usuarioId, req.userId!)
        )
      );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar registro" });
  }
});

export default router;
