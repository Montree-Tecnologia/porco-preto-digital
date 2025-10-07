import { Router } from "express";
import { db } from "../db";
import { registrosAlimentacao } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userRegistros = await db.query.registrosAlimentacao.findMany({
      where: eq(registrosAlimentacao.usuarioId, req.userId!),
      with: {
        piquete: true,
        porco: true,
        insumo: true,
        composto: true,
      },
    });

    res.json(userRegistros);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registros de alimentação" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const registro = await db.query.registrosAlimentacao.findFirst({
      where: and(
        eq(registrosAlimentacao.id, parseInt(req.params.id)),
        eq(registrosAlimentacao.usuarioId, req.userId!)
      ),
      with: {
        piquete: true,
        porco: true,
        insumo: true,
        composto: true,
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
    const [newRegistro] = await db.insert(registrosAlimentacao).values({
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
      .update(registrosAlimentacao)
      .set(updateData)
      .where(
        and(
          eq(registrosAlimentacao.id, parseInt(req.params.id)),
          eq(registrosAlimentacao.usuarioId, req.userId!)
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
      .delete(registrosAlimentacao)
      .where(
        and(
          eq(registrosAlimentacao.id, parseInt(req.params.id)),
          eq(registrosAlimentacao.usuarioId, req.userId!)
        )
      );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar registro" });
  }
});

export default router;
