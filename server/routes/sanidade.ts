import { Router } from "express";
import { db } from "../db";
import { registrosSanitarios, registrosSanitariosPorcos, porcos, insertSanitarioSchema } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { validateRequest } from "../utils/validation";
import { z } from "zod";

const router = Router();

// Schema de validação para criação de registro sanitário com porcos
const createSanitarioSchema = z.object({
  data: z.string(),
  insumoId: z.number().int().positive(),
  quantidade: z.number().or(z.string()),
  responsavel: z.string(),
  observacoes: z.string().optional(),
  proximaAplicacao: z.string().optional(),
  porcoIds: z.array(z.number().int().positive()).optional(),
});

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userRegistros = await db.query.registrosSanitarios.findMany({
      where: eq(registrosSanitarios.usuarioId, req.userId!),
      with: {
        insumo: true,
        registrosSanitariosPorcos: {
          with: {
            porco: true,
          },
        },
      },
    });

    res.json(userRegistros);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registros sanitários" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const registro = await db.query.registrosSanitarios.findFirst({
      where: and(
        eq(registrosSanitarios.id, parseInt(req.params.id)),
        eq(registrosSanitarios.usuarioId, req.userId!)
      ),
      with: {
        insumo: true,
        registrosSanitariosPorcos: {
          with: {
            porco: true,
          },
        },
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
    const validData = validateRequest(createSanitarioSchema, req.body, res);
    if (!validData) return;

    const { porcoIds, ...registroData } = validData;

    // Verificar se os porcos pertencem ao usuário
    if (porcoIds && porcoIds.length > 0) {
      const userPorcos = await db.query.porcos.findMany({
        where: and(
          inArray(porcos.id, porcoIds),
          eq(porcos.usuarioId, req.userId!)
        ),
      });

      if (userPorcos.length !== porcoIds.length) {
        return res.status(403).json({ error: "Um ou mais porcos não pertencem ao usuário" });
      }
    }

    const [newRegistro] = await db.insert(registrosSanitarios).values({
      ...registroData,
      usuarioId: req.userId!,
    }).returning();

    if (porcoIds && porcoIds.length > 0) {
      await db.insert(registrosSanitariosPorcos).values(
        porcoIds.map((porcoId) => ({
          registroSanitarioId: newRegistro.id,
          porcoId,
        }))
      );
    }

    const registroCompleto = await db.query.registrosSanitarios.findFirst({
      where: eq(registrosSanitarios.id, newRegistro.id),
      with: {
        insumo: true,
        registrosSanitariosPorcos: {
          with: {
            porco: true,
          },
        },
      },
    });

    res.status(201).json(registroCompleto);
  } catch (error) {
    console.error("Erro ao criar registro:", error);
    res.status(500).json({ error: "Erro ao criar registro" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const { porcoIds, usuarioId, id, createdAt, ...updateData } = req.body;

    if (porcoIds && Array.isArray(porcoIds) && porcoIds.length > 0) {
      const userPorcos = await db.query.porcos.findMany({
        where: and(
          inArray(porcos.id, porcoIds),
          eq(porcos.usuarioId, req.userId!)
        ),
      });

      if (userPorcos.length !== porcoIds.length) {
        return res.status(403).json({ error: "Um ou mais porcos não pertencem ao usuário" });
      }
    }

    const [updatedRegistro] = await db
      .update(registrosSanitarios)
      .set(updateData)
      .where(
        and(
          eq(registrosSanitarios.id, parseInt(req.params.id)),
          eq(registrosSanitarios.usuarioId, req.userId!)
        )
      )
      .returning();

    if (!updatedRegistro) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }

    if (porcoIds && Array.isArray(porcoIds)) {
      await db.delete(registrosSanitariosPorcos)
        .where(eq(registrosSanitariosPorcos.registroSanitarioId, updatedRegistro.id));

      if (porcoIds.length > 0) {
        await db.insert(registrosSanitariosPorcos).values(
          porcoIds.map((porcoId: number) => ({
            registroSanitarioId: updatedRegistro.id,
            porcoId,
          }))
        );
      }
    }

    const registroCompleto = await db.query.registrosSanitarios.findFirst({
      where: eq(registrosSanitarios.id, updatedRegistro.id),
      with: {
        insumo: true,
        registrosSanitariosPorcos: {
          with: {
            porco: true,
          },
        },
      },
    });

    res.json(registroCompleto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const registro = await db.query.registrosSanitarios.findFirst({
      where: and(
        eq(registrosSanitarios.id, parseInt(req.params.id)),
        eq(registrosSanitarios.usuarioId, req.userId!)
      ),
    });

    if (!registro) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }

    await db.delete(registrosSanitariosPorcos)
      .where(eq(registrosSanitariosPorcos.registroSanitarioId, parseInt(req.params.id)));

    await db
      .delete(registrosSanitarios)
      .where(eq(registrosSanitarios.id, parseInt(req.params.id)));

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar registro" });
  }
});

export default router;
