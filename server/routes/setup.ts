import { Router } from "express";
import { db } from "../db";
import { usuarios } from "../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const router = Router();

// Rota de setup única para criar usuário admin
router.post("/create-admin", async (req, res) => {
  try {
    // Verificar se já existe usuário admin
    const existingAdmin = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, "admin@prorporco.com"),
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        error: "Usuário admin já existe",
        message: "Use as credenciais existentes para fazer login" 
      });
    }

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    const [newAdmin] = await db.insert(usuarios).values({
      nome: "Admin",
      email: "admin@prorporco.com",
      senha: hashedPassword,
      fazenda: "Fazenda Demo",
    }).returning();

    res.json({
      success: true,
      message: "Usuário admin criado com sucesso!",
      credentials: {
        email: "admin@prorporco.com",
        senha: "123456"
      },
      user: {
        id: newAdmin.id,
        nome: newAdmin.nome,
        email: newAdmin.email,
        fazenda: newAdmin.fazenda
      }
    });
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    res.status(500).json({ 
      error: "Erro ao criar usuário admin",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

export default router;
