import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { usuarios, insertUsuarioSchema } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validateRequest } from "../utils/validation";
import { z } from "zod";

const router = Router();

// Schema de validação para login
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

router.post("/login", async (req, res) => {
  try {
    const validData = validateRequest(loginSchema, req.body, res);
    if (!validData) return;

    const { email, senha } = validData;

    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      fazenda: user.fazenda,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

router.post("/register", async (req, res) => {
  try {
    // @ts-expect-error - Incompatibilidade de tipos Zod/drizzle-zod, funciona em runtime
    const validData = validateRequest(insertUsuarioSchema, req.body, res);
    if (!validData) return;

    const { nome, email, senha, fazenda } = validData;

    const existingUser = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const [newUser] = await db.insert(usuarios).values({
      nome,
      email,
      senha: hashedPassword,
      fazenda,
    }).returning();

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      fazenda: newUser.fazenda,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, req.userId!),
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      fazenda: user.fazenda,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout realizado com sucesso" });
});

export default router;
