import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";

import authRoutes from "./routes/auth";
import setupRoutes from "./routes/setup";
import porcosRoutes from "./routes/porcos";
import piquetesRoutes from "./routes/piquetes";
import insumosRoutes from "./routes/insumos";
import compostosRoutes from "./routes/compostos";
import alimentacaoRoutes from "./routes/alimentacao";
import sanidadeRoutes from "./routes/sanidade";
import pesagemRoutes from "./routes/pesagem";
import vendasRoutes from "./routes/vendas";
import custosRoutes from "./routes/custos";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateEnvironment() {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não configuradas: ${missing.join(', ')}\n` +
      `Consulte o arquivo .env.example para configuração correta.`
    );
  }
}

validateEnvironment();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// CORS apenas em desenvolvimento (em produção, frontend e backend estão no mesmo servidor)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true,
  }));
}

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/setup", setupRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/porcos", authMiddleware, porcosRoutes);
app.use("/api/piquetes", authMiddleware, piquetesRoutes);
app.use("/api/insumos", authMiddleware, insumosRoutes);
app.use("/api/compostos", authMiddleware, compostosRoutes);
app.use("/api/alimentacao", authMiddleware, alimentacaoRoutes);
app.use("/api/sanidade", authMiddleware, sanidadeRoutes);
app.use("/api/pesagem", authMiddleware, pesagemRoutes);
app.use("/api/vendas", authMiddleware, vendasRoutes);
app.use("/api/custos", authMiddleware, custosRoutes);

// Servir arquivos estáticos do frontend em produção
if (process.env.NODE_ENV === 'production') {
  // Em produção: dist/server/index.js -> precisa ir para dist/
  // __dirname será /app/dist/server, então .. leva para /app/dist
  const distPath = path.join(__dirname, '..');
  
  console.log('Static files path:', distPath);
  app.use(express.static(distPath));
  
  // Fallback para index.html (necessário para React Router)
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Serving frontend from dist/');
  }
});
