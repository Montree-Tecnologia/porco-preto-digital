# Plano de Implementação do Backend
## Pró Porco MVP - Migração de Mock para Backend Real com PostgreSQL

> **Objetivo:** Transformar o protótipo frontend em uma aplicação fullstack completa  
> **Banco de Dados:** PostgreSQL (Neon via Replit)  
> **Stack:** Express.js + Drizzle ORM + PostgreSQL  
> **Status:** 📋 Planejamento

---

## 1. Visão Geral da Arquitetura

### 1.1 Estado Atual
```
projeto/
├── src/                    # Frontend React (Vite)
│   ├── components/
│   ├── hooks/
│   │   └── useProPorcoData.ts  # Hook com dados mock
│   ├── pages/
│   └── App.tsx
├── package.json            # Apenas deps frontend
└── vite.config.ts
```

### 1.2 Arquitetura Alvo (Fullstack)
```
projeto/
├── client/                 # Frontend React (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   └── queryClient.ts  # TanStack Query config
│   │   ├── pages/
│   │   └── App.tsx
│   └── index.html
├── server/                 # Backend Express
│   ├── db/
│   │   ├── schema.ts      # Drizzle schemas
│   │   └── index.ts       # DB connection
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── porcos.ts
│   │   ├── piquetes.ts
│   │   ├── insumos.ts
│   │   ├── alimentacao.ts
│   │   ├── sanidade.ts
│   │   ├── pesagem.ts
│   │   ├── vendas.ts
│   │   └── custos.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── utils/
│   │   └── jwt.ts
│   ├── index.ts           # Express app
│   └── vite.ts            # Vite SSR integration
├── shared/
│   └── schema.ts          # Tipos compartilhados
├── drizzle.config.ts
├── package.json
└── vite.config.ts
```

---

## 2. Fase 1: Configuração Inicial do Ambiente

### 2.1 Instalar Dependências Backend

#### Pacotes Principais
```bash
# Express e middleware
express
cors
cookie-parser
dotenv

# Database
drizzle-orm
drizzle-kit
@neondatabase/serverless  # PostgreSQL driver para Neon
postgres                    # Alternativa: pg driver

# Autenticação
jsonwebtoken
bcryptjs
@types/jsonwebtoken
@types/bcryptjs

# Validação
zod  # já instalado

# Dev dependencies
@types/express
@types/cors
@types/cookie-parser
tsx  # Para rodar TypeScript em dev
```

#### Scripts package.json
```json
{
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "start": "NODE_ENV=production node dist/server/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 2.2 Configurar Banco de Dados PostgreSQL

#### Usar Replit Database Integration
```bash
# Via Replit UI: 
# 1. Adicionar integração PostgreSQL (Neon)
# 2. Variáveis de ambiente serão criadas automaticamente:
#    - DATABASE_URL
```

#### Configurar Drizzle (drizzle.config.ts)
```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### 2.3 Configurar TypeScript

#### tsconfig.server.json
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "./dist/server",
    "rootDir": "./server",
    "noEmit": false
  },
  "include": ["server/**/*", "shared/**/*"],
  "exclude": ["node_modules", "client"]
}
```

---

## 3. Fase 2: Estruturar o Backend

### 3.1 Criar Schema do Banco de Dados (server/db/schema.ts)

```typescript
import { pgTable, serial, varchar, text, integer, decimal, date, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabela de Usuários
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha: varchar("senha", { length: 255 }).notNull(), // hash bcrypt
  fazenda: varchar("fazenda", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Piquetes
export const piquetes = pgTable("piquetes", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  capacidadeMaxima: integer("capacidade_maxima").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }),
  tipo: varchar("tipo", { length: 50 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Porcos
export const porcos = pgTable("porcos", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  nome: varchar("nome", { length: 100 }),
  dataNascimento: date("data_nascimento").notNull(),
  pesoInicial: decimal("peso_inicial", { precision: 6, scale: 2 }).notNull(),
  pesoAlvoAbate: decimal("peso_alvo_abate", { precision: 6, scale: 2 }).notNull(),
  pesoAtual: decimal("peso_atual", { precision: 6, scale: 2 }),
  piqueteId: integer("piquete_id").references(() => piquetes.id).notNull(),
  valorCompra: decimal("valor_compra", { precision: 10, scale: 2 }).notNull(),
  valorVenda: decimal("valor_venda", { precision: 10, scale: 2 }),
  dataVenda: date("data_venda"),
  raca: varchar("raca", { length: 50 }),
  sexo: varchar("sexo", { length: 1 }), // M ou F
  origem: varchar("origem", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("ativo"), // ativo, vendido, morto
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Insumos
export const insumos = pgTable("insumos", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  categoria: varchar("categoria", { length: 20 }).notNull(), // vacina, medicamento, alimento
  unidadeMedida: varchar("unidade_medida", { length: 20 }).notNull(),
  valorCompra: decimal("valor_compra", { precision: 10, scale: 2 }).notNull(),
  quantidadeEstoque: decimal("quantidade_estoque", { precision: 10, scale: 2 }).notNull(),
  estoqueMinimo: decimal("estoque_minimo", { precision: 10, scale: 2 }),
  fornecedor: varchar("fornecedor", { length: 100 }),
  dataValidade: date("data_validade"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Compostos Alimentares
export const compostosAlimentares = pgTable("compostos_alimentares", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  ingredientes: jsonb("ingredientes").notNull(), // [{ insumoId, quantidade }]
  custoTotal: decimal("custo_total", { precision: 10, scale: 2 }).notNull(),
  custoKg: decimal("custo_kg", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Registros de Alimentação
export const registrosAlimentacao = pgTable("registros_alimentacao", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  data: date("data").notNull(),
  piqueteId: integer("piquete_id").references(() => piquetes.id),
  porcoId: integer("porco_id").references(() => porcos.id),
  insumoId: integer("insumo_id").references(() => insumos.id),
  compostoId: integer("composto_id").references(() => compostosAlimentares.id),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull(),
  custoTotal: decimal("custo_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Registros Sanitários
export const registrosSanitarios = pgTable("registros_sanitarios", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  data: date("data").notNull(),
  porcoIds: jsonb("porco_ids").notNull(), // array de IDs
  insumoId: integer("insumo_id").references(() => insumos.id).notNull(),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull(),
  responsavel: varchar("responsavel", { length: 100 }).notNull(),
  observacoes: text("observacoes"),
  proximaAplicacao: date("proxima_aplicacao"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Registros de Peso
export const registrosPeso = pgTable("registros_peso", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  porcoId: integer("porco_id").references(() => porcos.id).notNull(),
  data: date("data").notNull(),
  peso: decimal("peso", { precision: 6, scale: 2 }).notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Vendas
export const vendas = pgTable("vendas", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  data: date("data").notNull(),
  porcoIds: jsonb("porco_ids").notNull(), // array de IDs
  valoresIndividuais: jsonb("valores_individuais").notNull(), // [{ porcoId, valor }]
  peso: decimal("peso", { precision: 10, scale: 2 }).notNull(),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  comissaoPercentual: decimal("comissao_percentual", { precision: 5, scale: 2 }).notNull(),
  comprador: varchar("comprador", { length: 255 }).notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Custos
export const custos = pgTable("custos", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // comissionamento, operacional, administrativo, outros
  descricao: varchar("descricao", { length: 255 }).notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  data: date("data").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relações
export const usuariosRelations = relations(usuarios, ({ many }) => ({
  porcos: many(porcos),
  piquetes: many(piquetes),
  insumos: many(insumos),
}));

export const piquetesRelations = relations(piquetes, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [piquetes.usuarioId],
    references: [usuarios.id],
  }),
  porcos: many(porcos),
}));

export const porcosRelations = relations(porcos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [porcos.usuarioId],
    references: [usuarios.id],
  }),
  piquete: one(piquetes, {
    fields: [porcos.piqueteId],
    references: [piquetes.id],
  }),
}));
```

### 3.2 Configurar Conexão com DB (server/db/index.ts)

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

### 3.3 Criar Servidor Express (server/index.ts)

```typescript
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth";
import porcosRoutes from "./routes/porcos";
import piquetesRoutes from "./routes/piquetes";
import insumosRoutes from "./routes/insumos";
import alimentacaoRoutes from "./routes/alimentacao";
import sanidadeRoutes from "./routes/sanidade";
import pesagemRoutes from "./routes/pesagem";
import vendasRoutes from "./routes/vendas";
import custosRoutes from "./routes/custos";

// Middleware
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/porcos", authMiddleware, porcosRoutes);
app.use("/api/piquetes", authMiddleware, piquetesRoutes);
app.use("/api/insumos", authMiddleware, insumosRoutes);
app.use("/api/alimentacao", authMiddleware, alimentacaoRoutes);
app.use("/api/sanidade", authMiddleware, sanidadeRoutes);
app.use("/api/pesagem", authMiddleware, pesagemRoutes);
app.use("/api/vendas", authMiddleware, vendasRoutes);
app.use("/api/custos", authMiddleware, custosRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Vite integration for production
if (process.env.NODE_ENV === "production") {
  const { setupVite } = require("./vite");
  setupVite(app);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3.4 Middleware de Autenticação (server/middleware/auth.ts)

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
```

---

## 4. Fase 3: Implementar Rotas da API

### 4.1 Rota de Autenticação (server/routes/auth.ts)

```typescript
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { usuarios } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, fazenda } = req.body;

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

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
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

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout realizado com sucesso" });
});

export default router;
```

### 4.2 Exemplo de Rota CRUD - Porcos (server/routes/porcos.ts)

```typescript
import { Router } from "express";
import { db } from "../db";
import { porcos } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/porcos
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

// POST /api/porcos
router.post("/", async (req: AuthRequest, res) => {
  try {
    const [newPorco] = await db.insert(porcos).values({
      ...req.body,
      usuarioId: req.userId!,
    }).returning();

    res.status(201).json(newPorco);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar porco" });
  }
});

// PUT /api/porcos/:id
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const [updatedPorco] = await db
      .update(porcos)
      .set(req.body)
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
    res.status(500).json({ error: "Erro ao atualizar porco" });
  }
});

// DELETE /api/porcos/:id
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
```

---

## 5. Fase 4: Atualizar Frontend para Usar API

### 5.1 Mover Frontend para client/

```bash
# Estrutura
mkdir -p client/src
mv src/* client/src/
mv index.html client/
mv public client/
```

### 5.2 Atualizar vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  root: "client",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
});
```

### 5.3 Criar API Client (client/src/lib/api.ts)

```typescript
const API_URL = import.meta.env.VITE_API_URL || "/api";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro na requisição");
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, senha: string) =>
    fetcher("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),
  
  register: (data: any) =>
    fetcher("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => fetcher("/auth/logout", { method: "POST" }),

  // Porcos
  getPorcos: () => fetcher("/porcos"),
  createPorco: (data: any) =>
    fetcher("/porcos", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePorco: (id: string, data: any) =>
    fetcher(`/porcos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePorco: (id: string) =>
    fetcher(`/porcos/${id}`, { method: "DELETE" }),

  // ... outros endpoints
};
```

### 5.4 Configurar TanStack Query (client/src/lib/queryClient.ts)

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(`/api${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro na requisição");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
```

### 5.5 Refatorar useProPorcoData para usar API

```typescript
// client/src/hooks/useProPorcoData.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useProPorcoData() {
  const queryClient = useQueryClient();

  // Queries
  const { data: porcos = [], isLoading: loadingPorcos } = useQuery({
    queryKey: ["/api/porcos"],
    queryFn: () => api.getPorcos(),
  });

  const { data: piquetes = [] } = useQuery({
    queryKey: ["/api/piquetes"],
  });

  // Mutations
  const criarPorco = useMutation({
    mutationFn: (data: any) => api.createPorco(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
    },
  });

  const atualizarPorco = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updatePorco(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
    },
  });

  const excluirPorco = useMutation({
    mutationFn: (id: string) => api.deletePorco(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
    },
  });

  return {
    porcos,
    piquetes,
    loading: loadingPorcos,
    criarPorco: criarPorco.mutateAsync,
    atualizarPorco: atualizarPorco.mutateAsync,
    excluirPorco: excluirPorco.mutateAsync,
    // ... outros métodos
  };
}
```

---

## 6. Fase 5: Variáveis de Ambiente

### 6.1 Arquivo .env (Development)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prorporco

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=3000
NODE_ENV=development

# Client
VITE_API_URL=http://localhost:3000/api
CLIENT_URL=http://localhost:5173
```

### 6.2 Configurar Secrets no Replit

```bash
# Via Replit Secrets (UI):
1. DATABASE_URL - Gerado automaticamente pela integração PostgreSQL
2. JWT_SECRET - Gerar string aleatória segura
3. NODE_ENV - "production" para deploy
```

---

## 7. Fase 6: Testes e Validação

### 7.1 Checklist de Testes

- [ ] Conectar ao PostgreSQL com sucesso
- [ ] Executar migrations (drizzle-kit push)
- [ ] Testar login/logout
- [ ] Testar CRUD de cada entidade:
  - [ ] Porcos
  - [ ] Piquetes
  - [ ] Insumos
  - [ ] Compostos Alimentares
  - [ ] Registros de Alimentação
  - [ ] Registros Sanitários
  - [ ] Registros de Peso
  - [ ] Vendas
  - [ ] Custos
- [ ] Validar cálculos (ocupação, custos, lucros)
- [ ] Testar filtros e relatórios
- [ ] Validar autenticação em todas as rotas
- [ ] Testar multi-usuário (isolamento de dados)

### 7.2 Scripts de Seed (Opcional)

```typescript
// server/db/seed.ts
import { db } from "./index";
import { usuarios, piquetes, porcos } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash("123456", 10);
  
  const [user] = await db.insert(usuarios).values({
    nome: "João Silva",
    email: "admin@prorporco.com",
    senha: hashedPassword,
    fazenda: "Fazenda São João",
  }).returning();

  // Criar piquetes
  const [piquete1] = await db.insert(piquetes).values({
    usuarioId: user.id,
    nome: "Piquete A",
    capacidadeMaxima: 50,
    area: "500",
    tipo: "Crescimento",
  }).returning();

  // Criar porcos de exemplo
  await db.insert(porcos).values([
    {
      usuarioId: user.id,
      nome: "Porco 001",
      dataNascimento: "2024-01-15",
      pesoInicial: "25",
      pesoAlvoAbate: "110",
      pesoAtual: "45",
      piqueteId: piquete1.id,
      valorCompra: "150",
      raca: "Landrace",
      sexo: "M",
      status: "ativo",
    },
  ]);

  console.log("Seed concluído!");
}

seed().catch(console.error);
```

---

## 8. Cronograma de Implementação

### Sprint 1 (2-3 dias): Fundação
- ✅ Configurar estrutura fullstack (client/server)
- ✅ Instalar dependências backend
- ✅ Configurar PostgreSQL (Replit)
- ✅ Criar schemas Drizzle
- ✅ Executar migrations

### Sprint 2 (2-3 dias): Backend Core
- ✅ Implementar servidor Express
- ✅ Criar middleware de autenticação
- ✅ Implementar rotas de autenticação
- ✅ Implementar rotas de Porcos
- ✅ Implementar rotas de Piquetes
- ✅ Implementar rotas de Insumos

### Sprint 3 (2-3 dias): Backend Completo
- ✅ Implementar rotas de Alimentação
- ✅ Implementar rotas de Sanidade
- ✅ Implementar rotas de Pesagem
- ✅ Implementar rotas de Vendas
- ✅ Implementar rotas de Custos
- ✅ Criar endpoints de relatórios

### Sprint 4 (2-3 dias): Integração Frontend
- ✅ Configurar TanStack Query
- ✅ Criar API client
- ✅ Refatorar useProPorcoData
- ✅ Atualizar páginas para usar API
- ✅ Testar fluxo completo

### Sprint 5 (1-2 dias): Testes e Deploy
- ✅ Testar todas as funcionalidades
- ✅ Criar seed data
- ✅ Configurar variáveis de ambiente
- ✅ Deploy no Replit
- ✅ Testes em produção

**Total Estimado:** 9-14 dias

---

## 9. Segurança e Boas Práticas

### 9.1 Segurança
- ✅ Senhas com bcrypt (salt rounds: 10)
- ✅ JWT com expiração (7 dias)
- ✅ HttpOnly cookies para tokens
- ✅ CORS configurado corretamente
- ✅ Validação com Zod em todas as rotas
- ✅ Isolamento de dados por usuário
- ✅ Prepared statements (Drizzle ORM)

### 9.2 Performance
- ✅ Índices no banco de dados (usuarioId, datas)
- ✅ Query caching com TanStack Query
- ✅ Lazy loading de dados
- ✅ Paginação em listas grandes (futuro)

### 9.3 Observabilidade
- ✅ Logs estruturados
- ✅ Error handling centralizado
- ✅ Health check endpoint
- ✅ Monitoramento de queries (Drizzle Studio)

---

## 10. Próximos Passos Pós-Backend

### 10.1 Melhorias Futuras
- [ ] WebSockets para atualizações em tempo real
- [ ] Upload de imagens (fotos de porcos)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Notificações por email
- [ ] Backup automático do banco
- [ ] API GraphQL (alternativa)
- [ ] Aplicativo mobile (React Native)

### 10.2 Otimizações
- [ ] Redis para cache
- [ ] CDN para assets estáticos
- [ ] Compressão de respostas (gzip)
- [ ] Rate limiting
- [ ] Paginação e infinite scroll

---

## 11. Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor backend com hot reload
npm run dev:client       # Inicia cliente Vite (separado)

# Database
npm run db:generate      # Gera migrations
npm run db:push          # Aplica schema ao banco
npm run db:studio        # Abre Drizzle Studio

# Build & Deploy
npm run build           # Build completo (client + server)
npm start               # Inicia em produção

# Úteis
npm run lint            # Verifica código
npm run type-check      # Verifica tipos TypeScript
```

---

## 12. Notas Importantes

### ⚠️ Atenção
1. **Nunca commitar .env** - Adicionar ao .gitignore
2. **Usar Replit Secrets** para variáveis sensíveis em produção
3. **Backup do banco** antes de migrations destrutivas
4. **Testar em dev** antes de aplicar em produção
5. **Versionamento de schemas** com Drizzle migrations

### 📝 Convenções
- Usar `camelCase` para código TypeScript
- Usar `snake_case` para colunas do banco
- Prefixar rotas com `/api`
- Validar todos os inputs com Zod
- Retornar erros padronizados

### 🎯 Objetivo Final
Backend funcional, seguro e escalável, integrado perfeitamente com o frontend existente, mantendo toda a experiência do usuário já desenvolvida.
