import { Router } from "express";
import { db } from "../db";
import { vendas, vendasPorcos, porcos } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userVendas = await db.query.vendas.findMany({
      where: eq(vendas.usuarioId, req.userId!),
      with: {
        vendasPorcos: {
          with: {
            porco: true,
          },
        },
      },
    });

    res.json(userVendas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar vendas" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const venda = await db.query.vendas.findFirst({
      where: and(
        eq(vendas.id, parseInt(req.params.id)),
        eq(vendas.usuarioId, req.userId!)
      ),
      with: {
        vendasPorcos: {
          with: {
            porco: true,
          },
        },
      },
    });

    if (!venda) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    res.json(venda);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar venda" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { porcos: porcosVenda, ...vendaData } = req.body;

    if (porcosVenda && Array.isArray(porcosVenda) && porcosVenda.length > 0) {
      const porcoIds = porcosVenda.map((item: { porcoId: number }) => item.porcoId);
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

    const [newVenda] = await db.insert(vendas).values({
      ...vendaData,
      usuarioId: req.userId!,
    }).returning();

    if (porcosVenda && Array.isArray(porcosVenda) && porcosVenda.length > 0) {
      await db.insert(vendasPorcos).values(
        porcosVenda.map((item: { porcoId: number; valorIndividual: number }) => ({
          vendaId: newVenda.id,
          porcoId: item.porcoId,
          valorIndividual: item.valorIndividual.toString(),
        }))
      );
    }

    const vendaCompleta = await db.query.vendas.findFirst({
      where: eq(vendas.id, newVenda.id),
      with: {
        vendasPorcos: {
          with: {
            porco: true,
          },
        },
      },
    });

    res.status(201).json(vendaCompleta);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar venda" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const { porcos: porcosVenda, usuarioId, id, createdAt, ...updateData } = req.body;

    if (porcosVenda && Array.isArray(porcosVenda) && porcosVenda.length > 0) {
      const porcoIds = porcosVenda.map((item: { porcoId: number }) => item.porcoId);
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

    const [updatedVenda] = await db
      .update(vendas)
      .set(updateData)
      .where(
        and(
          eq(vendas.id, parseInt(req.params.id)),
          eq(vendas.usuarioId, req.userId!)
        )
      )
      .returning();

    if (!updatedVenda) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    if (porcosVenda && Array.isArray(porcosVenda)) {
      await db.delete(vendasPorcos)
        .where(eq(vendasPorcos.vendaId, updatedVenda.id));

      if (porcosVenda.length > 0) {
        await db.insert(vendasPorcos).values(
          porcosVenda.map((item: { porcoId: number; valorIndividual: number }) => ({
            vendaId: updatedVenda.id,
            porcoId: item.porcoId,
            valorIndividual: item.valorIndividual.toString(),
          }))
        );
      }
    }

    const vendaCompleta = await db.query.vendas.findFirst({
      where: eq(vendas.id, updatedVenda.id),
      with: {
        vendasPorcos: {
          with: {
            porco: true,
          },
        },
      },
    });

    res.json(vendaCompleta);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar venda" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const venda = await db.query.vendas.findFirst({
      where: and(
        eq(vendas.id, parseInt(req.params.id)),
        eq(vendas.usuarioId, req.userId!)
      ),
    });

    if (!venda) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    await db.delete(vendasPorcos)
      .where(eq(vendasPorcos.vendaId, parseInt(req.params.id)));

    await db
      .delete(vendas)
      .where(eq(vendas.id, parseInt(req.params.id)));

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar venda" });
  }
});

export default router;
