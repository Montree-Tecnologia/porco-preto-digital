import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";

import authRoutes from "./routes/auth";
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

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in environment variables");
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
