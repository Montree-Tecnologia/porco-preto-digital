import { Router } from "express";
import { db } from "../db";
import { registrosPeso, insertPesagemSchema, porcos } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { validateRequest } from "../utils/validation";

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
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertPesagemSchema, req.body, res);
    if (!validData) return;

    // Criar o registro de pesagem
    const [newRegistro] = await db.insert(registrosPeso).values({
      ...validData,
      usuarioId: req.userId!,
    }).returning();

    // Atualizar o peso atual do porco
    await db
      .update(porcos)
      .set({ pesoAtual: validData.peso })
      .where(
        and(
          eq(porcos.id, validData.porcoId),
          eq(porcos.usuarioId, req.userId!)
        )
      );

    res.status(201).json(newRegistro);
  } catch (error) {
    console.error("Erro ao criar registro:", error);
    res.status(500).json({ error: "Erro ao criar registro" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertPesagemSchema.partial(), req.body, res);
    if (!validData) return;
    
    const [updatedRegistro] = await db
      .update(registrosPeso)
      .set(validData)
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

    // Se o peso foi atualizado, atualizar também o peso atual do porco
    if (validData.peso && updatedRegistro.porcoId) {
      await db
        .update(porcos)
        .set({ pesoAtual: validData.peso })
        .where(
          and(
            eq(porcos.id, updatedRegistro.porcoId),
            eq(porcos.usuarioId, req.userId!)
          )
        );
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
