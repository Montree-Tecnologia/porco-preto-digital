# Product Requirements Document (PRD)
## SuínoGest MVP - Aplicativo Web para Gestão de Pecuária Suína

## 1. Visão Geral do Produto

**Nome do Produto:** Pró Porco MVP  
**Tipo:** Aplicativo Web Responsivo  
**Target:** Pequenos produtores de suínos  
**Objetivo:** Digitalizar e simplificar a gestão da criação de suínos, oferecendo controle financeiro e operacional completo

## 2. Problema e Oportunidade

### Problema
Pequenos produtores de suínos enfrentam dificuldades para:
- Controlar custos e receitas de forma organizada
- Monitorar o desenvolvimento individual dos animais
- Calcular rentabilidade por animal
- Gerenciar estoque de insumos e alimentação
- Ter visibilidade clara do negócio

### Oportunidade
Criar uma solução acessível que permita gestão completa da atividade suinícola com foco em resultados financeiros e operacionais.

## 3. Objetivos do MVP

### Objetivos Primários
- Permitir controle completo do rebanho e insumos
- Oferecer gestão financeira básica com demonstrativo de resultados
- Facilitar o acompanhamento do desenvolvimento dos animais
- Calcular rentabilidade individual por suíno

### Métricas de Sucesso
- 80% dos usuários utilizarem o sistema por pelo menos 30 dias consecutivos
- Redução de 50% no tempo gasto com controles manuais
- 90% de satisfação dos usuários com relatórios financeiros

## 4. Personas e Usuários

### Persona Principal: João, Pequeno Produtor
- 45 anos, criador há 15 anos
- Possui entre 50-200 suínos
- Conhecimento básico de tecnologia
- Precisa de controle financeiro simples e eficaz
- Trabalha sozinho ou com poucos funcionários

## 5. Funcionalidades do MVP

### 5.1 Gestão de Cadastros (CRUD)

#### 5.1.1 Cadastro de Porcos
- **Campos obrigatórios:** ID único, data nascimento/aquisição, peso inicial, piquete atual, valor de compra
- **Campos opcionais:** Raça, sexo, origem, observações
- **Funcionalidades:** Criar, visualizar, editar, excluir, buscar, filtrar por piquete/status

#### 5.1.2 Cadastro de Piquetes
- **Campos obrigatórios:** Nome/código, capacidade máxima
- **Campos opcionais:** Área (m²), tipo, observações
- **Funcionalidades:** CRUD completo, visualização de ocupação atual

#### 5.1.3 Cadastro de Insumos
- **Categorias:** Vacinas, Medicamentos, Alimentos
- **Campos obrigatórios:** Nome, categoria, unidade de medida, valor de compra, quantidade em estoque
- **Campos opcionais:** Fornecedor, data de validade, observações
- **Funcionalidades:** CRUD completo, controle de estoque, alerta de estoque baixo

### 5.2 Composição de Alimentos

**Funcionalidades:**
- Criar receitas/compostos alimentares
- Adicionar múltiplos insumos do tipo "alimento" com quantidades específicas
- Calcular custo total do composto
- Salvar receitas para reutilização
- Aplicar compostos na alimentação diária

### 5.3 Gestão de Alimentação

#### 5.3.1 Alimentação por Piquete
- Registrar tipo de alimento/composto utilizado
- Quantidade total fornecida ao piquete
- Data e hora da alimentação
- Cálculo automático de quantidade por cabeça
- Custo total e por cabeça

#### 5.3.2 Alimentação Individual
- Opção de registrar alimentação por porco específico
- Sobrescreve o cálculo automático por piquete
- Histórico individual de alimentação

### 5.4 Controle Sanitário

**Aplicação de Medicamentos e Vacinas:**
- Selecionar porco(s) ou piquete inteiro
- Registrar insumo aplicado (medicamento/vacina)
- Quantidade aplicada
- Data/hora da aplicação
- Responsável pela aplicação
- Observações e próxima aplicação (se aplicável)

### 5.5 Controle de Peso

**Funcionalidades:**
- Registrar peso de qualquer porco a qualquer momento
- Histórico completo de pesagens por animal
- Cálculo automático de ganho de peso
- Gráfico de evolução de peso

### 5.6 Gestão de Vendas

**Registro de Vendas:**
- Selecionar porco(s) vendido(s)
- Peso na venda
- Valor total da venda
- Data da venda
- Comprador
- Atualização automática de status do porco

### 5.7 Controle de Custos

**Tipos de Custos:**
- Comissionamento de vendas (% ou valor fixo)
- Despesas operacionais (energia, água, mão de obra)
- Despesas administrativas
- Outros custos variáveis

### 5.8 Relatórios Financeiros

#### 5.8.1 Demonstrativo de Resultado (DRE)
- **Receitas:** Vendas de suínos
- **Custos Diretos:** Alimentação, medicamentos, vacinas, aquisição de animais
- **Custos Indiretos:** Comissionamento, despesas operacionais
- **Resultado:** Lucro/Prejuízo do período
- **Filtros:** Por período (mensal, trimestral, anual)

#### 5.8.2 Fluxo de Caixa
- **Entradas:** vendas de animais
- **Saídas:** compra de animais, insumos, despesas
- **Saldo acumulado**
- **Projeções básicas**

### 5.9 Relatórios Operacionais

#### 5.9.1 Relatório por Animal
- Ganho de peso total e médio diário
- Custo total investido (alimentação + medicamentos + aquisição)
- Receita (se vendido)
- Lucro/prejuízo individual
- Tempo de criação
- Conversão alimentar aproximada

## 6. Requisitos Técnicos

### 6.1 Arquitetura
- **Frontend:** React.js
- **Banco de Dados:** Relacional (PostgreSQL ou MySQL)
