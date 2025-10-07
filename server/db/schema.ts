import { pgTable, serial, varchar, text, integer, decimal, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de Usuários
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha: varchar("senha", { length: 255 }).notNull(),
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
  sexo: varchar("sexo", { length: 1 }),
  origem: varchar("origem", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("ativo"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Insumos
export const insumos = pgTable("insumos", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  categoria: varchar("categoria", { length: 20 }).notNull(),
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
  ingredientes: jsonb("ingredientes").notNull(),
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
  insumoId: integer("insumo_id").references(() => insumos.id).notNull(),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull(),
  responsavel: varchar("responsavel", { length: 100 }).notNull(),
  observacoes: text("observacoes"),
  proximaAplicacao: date("proxima_aplicacao"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de junção: Registros Sanitários - Porcos
export const registrosSanitariosPorcos = pgTable("registros_sanitarios_porcos", {
  id: serial("id").primaryKey(),
  registroSanitarioId: integer("registro_sanitario_id").references(() => registrosSanitarios.id).notNull(),
  porcoId: integer("porco_id").references(() => porcos.id).notNull(),
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
  peso: decimal("peso", { precision: 10, scale: 2 }).notNull(),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  comissaoPercentual: decimal("comissao_percentual", { precision: 5, scale: 2 }).notNull(),
  comprador: varchar("comprador", { length: 255 }).notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de junção: Vendas - Porcos
export const vendasPorcos = pgTable("vendas_porcos", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id").references(() => vendas.id).notNull(),
  porcoId: integer("porco_id").references(() => porcos.id).notNull(),
  valorIndividual: decimal("valor_individual", { precision: 10, scale: 2 }).notNull(),
});

// Tabela de Custos
export const custos = pgTable("custos", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
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
  compostosAlimentares: many(compostosAlimentares),
  registrosAlimentacao: many(registrosAlimentacao),
  registrosSanitarios: many(registrosSanitarios),
  registrosPeso: many(registrosPeso),
  vendas: many(vendas),
  custos: many(custos),
}));

export const piquetesRelations = relations(piquetes, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [piquetes.usuarioId],
    references: [usuarios.id],
  }),
  porcos: many(porcos),
  registrosAlimentacao: many(registrosAlimentacao),
}));

export const porcosRelations = relations(porcos, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [porcos.usuarioId],
    references: [usuarios.id],
  }),
  piquete: one(piquetes, {
    fields: [porcos.piqueteId],
    references: [piquetes.id],
  }),
  registrosAlimentacao: many(registrosAlimentacao),
  registrosPeso: many(registrosPeso),
  registrosSanitariosPorcos: many(registrosSanitariosPorcos),
  vendasPorcos: many(vendasPorcos),
}));

export const insumosRelations = relations(insumos, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [insumos.usuarioId],
    references: [usuarios.id],
  }),
  registrosAlimentacao: many(registrosAlimentacao),
  registrosSanitarios: many(registrosSanitarios),
}));

export const compostosAlimentaresRelations = relations(compostosAlimentares, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [compostosAlimentares.usuarioId],
    references: [usuarios.id],
  }),
  registrosAlimentacao: many(registrosAlimentacao),
}));

export const registrosAlimentacaoRelations = relations(registrosAlimentacao, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [registrosAlimentacao.usuarioId],
    references: [usuarios.id],
  }),
  piquete: one(piquetes, {
    fields: [registrosAlimentacao.piqueteId],
    references: [piquetes.id],
  }),
  porco: one(porcos, {
    fields: [registrosAlimentacao.porcoId],
    references: [porcos.id],
  }),
  insumo: one(insumos, {
    fields: [registrosAlimentacao.insumoId],
    references: [insumos.id],
  }),
  composto: one(compostosAlimentares, {
    fields: [registrosAlimentacao.compostoId],
    references: [compostosAlimentares.id],
  }),
}));

export const registrosSanitariosRelations = relations(registrosSanitarios, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [registrosSanitarios.usuarioId],
    references: [usuarios.id],
  }),
  insumo: one(insumos, {
    fields: [registrosSanitarios.insumoId],
    references: [insumos.id],
  }),
  registrosSanitariosPorcos: many(registrosSanitariosPorcos),
}));

export const registrosSanitariosPorcosRelations = relations(registrosSanitariosPorcos, ({ one }) => ({
  registroSanitario: one(registrosSanitarios, {
    fields: [registrosSanitariosPorcos.registroSanitarioId],
    references: [registrosSanitarios.id],
  }),
  porco: one(porcos, {
    fields: [registrosSanitariosPorcos.porcoId],
    references: [porcos.id],
  }),
}));

export const registrosPesoRelations = relations(registrosPeso, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [registrosPeso.usuarioId],
    references: [usuarios.id],
  }),
  porco: one(porcos, {
    fields: [registrosPeso.porcoId],
    references: [porcos.id],
  }),
}));

export const vendasRelations = relations(vendas, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [vendas.usuarioId],
    references: [usuarios.id],
  }),
  vendasPorcos: many(vendasPorcos),
}));

export const vendasPorcosRelations = relations(vendasPorcos, ({ one }) => ({
  venda: one(vendas, {
    fields: [vendasPorcos.vendaId],
    references: [vendas.id],
  }),
  porco: one(porcos, {
    fields: [vendasPorcos.porcoId],
    references: [porcos.id],
  }),
}));

export const custosRelations = relations(custos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [custos.usuarioId],
    references: [usuarios.id],
  }),
}));

// Schemas de validação Zod

// Schemas base para insert
export const insertUsuarioSchema = createInsertSchema(usuarios).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertPiqueteSchema = createInsertSchema(piquetes).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertPorcoSchema = createInsertSchema(porcos).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertInsumoSchema = createInsertSchema(insumos).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCompostoSchema = createInsertSchema(compostosAlimentares).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertAlimentacaoSchema = createInsertSchema(registrosAlimentacao).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true 
});

export const insertSanitarioSchema = createInsertSchema(registrosSanitarios).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true 
});

export const insertPesagemSchema = createInsertSchema(registrosPeso).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true 
});

export const insertVendaSchema = createInsertSchema(vendas).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true 
});

export const insertCustoSchema = createInsertSchema(custos).omit({ 
  id: true, 
  usuarioId: true, 
  createdAt: true 
});

// Tipos TypeScript inferidos dos schemas
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type InsertPiquete = z.infer<typeof insertPiqueteSchema>;
export type InsertPorco = z.infer<typeof insertPorcoSchema>;
export type InsertInsumo = z.infer<typeof insertInsumoSchema>;
export type InsertComposto = z.infer<typeof insertCompostoSchema>;
export type InsertAlimentacao = z.infer<typeof insertAlimentacaoSchema>;
export type InsertSanitario = z.infer<typeof insertSanitarioSchema>;
export type InsertPesagem = z.infer<typeof insertPesagemSchema>;
export type InsertVenda = z.infer<typeof insertVendaSchema>;
export type InsertCusto = z.infer<typeof insertCustoSchema>;
