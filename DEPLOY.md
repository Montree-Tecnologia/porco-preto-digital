# 🚀 Guia de Deploy - Pró Porco

Este guia explica como configurar e fazer deploy da aplicação Pró Porco em produção.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Banco de dados PostgreSQL (recomendado: Neon, Supabase ou similar)
- Variáveis de ambiente configuradas

## 🔐 Variáveis de Ambiente Obrigatórias

A aplicação requer as seguintes variáveis de ambiente:

### 1. DATABASE_URL
Conexão com o banco de dados PostgreSQL:
```bash
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**Onde obter:**
- **Neon**: https://console.neon.tech → Seu projeto → Connection String
- **Supabase**: https://app.supabase.com → Configurações → Database → Connection String
- **Railway**: https://railway.app → Seu projeto → PostgreSQL → Connection URL

### 2. JWT_SECRET
Chave secreta para assinatura de tokens JWT:
```bash
JWT_SECRET=sua-chave-super-secreta-minimo-32-caracteres
```

**Como gerar uma chave segura:**
```bash
# Usando OpenSSL
openssl rand -base64 32

# Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. FRONTEND_URL
URL do frontend para configuração de CORS:
```bash
# Desenvolvimento
FRONTEND_URL=http://localhost:5000

# Produção
FRONTEND_URL=https://seu-dominio.com
```

**Importante:** Esta variável permite que o backend aceite requisições do frontend em produção.

### 4. NODE_ENV (opcional mas recomendado)
Define o ambiente de execução:
```bash
NODE_ENV=production
```

**Importante:** Em produção (NODE_ENV=production), os cookies JWT são configurados com a flag `secure`, exigindo HTTPS.

## 📦 Deploy no Replit

### Opção 1: Usando Replit Secrets (Recomendado)

1. Vá para a aba "Secrets" (🔒) no painel esquerdo do Replit
2. Adicione as variáveis:
   - `DATABASE_URL`: Sua connection string do PostgreSQL
   - `JWT_SECRET`: Sua chave secreta JWT
   - `NODE_ENV`: `production`

3. A aplicação detectará automaticamente estas variáveis

### Opção 2: Usando arquivo .env

1. Crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

2. Edite `.env` com suas credenciais reais

**⚠️ ATENÇÃO:** Nunca commite o arquivo `.env` para o Git!

## 🗄️ Configuração do Banco de Dados

### 1. Criar o banco de dados

Certifique-se de ter um banco PostgreSQL criado. Recomendamos:

- **Neon** (gratuito): https://neon.tech
- **Supabase** (gratuito): https://supabase.com
- **Railway**: https://railway.app

### 2. Aplicar o schema

Execute o comando para criar as tabelas:

```bash
npm run db:push
```

Se houver conflitos, force a aplicação:
```bash
npm run db:push --force
```

### 3. Criar usuário inicial

Acesse o banco de dados e execute:

```sql
-- Gere um hash bcrypt para a senha
-- Você pode gerar em: https://bcrypt-generator.com/

INSERT INTO usuarios (nome, email, senha, fazenda, created_at, updated_at) 
VALUES (
  'Administrador',
  'admin@suafazenda.com',
  '$2b$10$...seu.hash.bcrypt.aqui...',
  'Sua Fazenda',
  NOW(),
  NOW()
);
```

## 🚀 Comandos de Deploy

### Desenvolvimento
```bash
npm run dev
```
Inicia servidor Express (porta 3000) + Vite (porta 5000)

### Produção
```bash
npm run build    # Compila frontend e backend
npm start        # Inicia servidor de produção
```

## 🔒 Segurança em Produção

### Checklist de Segurança:

- [ ] `JWT_SECRET` é uma string aleatória de pelo menos 32 caracteres
- [ ] `DATABASE_URL` usa SSL/TLS (`?sslmode=require`)
- [ ] `NODE_ENV=production` está configurado
- [ ] Arquivo `.env` está no `.gitignore`
- [ ] HTTPS está habilitado no servidor
- [ ] Senhas no banco estão com hash bcrypt

### CORS em Produção

Atualize `server/index.ts` para permitir seu domínio de produção:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://seu-dominio.com",
  credentials: true,
}));
```

## 📊 Verificação de Deploy

Após o deploy, verifique:

1. **Health Check:**
```bash
curl https://seu-dominio.com/api/health
# Deve retornar: {"status":"ok","timestamp":"..."}
```

2. **Login:**
```bash
curl -X POST https://seu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@suafazenda.com","senha":"suasenha"}'
```

3. **Autenticação:**
```bash
curl https://seu-dominio.com/api/auth/me \
  -H "Cookie: token=..." 
```

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente obrigatórias não configuradas"
- Verifique se `JWT_SECRET` e `DATABASE_URL` estão definidos
- No Replit, use a aba "Secrets"
- Localmente, crie arquivo `.env`

### Erro: "Connection refused" ao acessar banco
- Verifique se `DATABASE_URL` está correto
- Confirme que o banco PostgreSQL está ativo
- Teste a conexão diretamente com psql ou GUI

### Erro: "Invalid token" no login
- Confirme que `JWT_SECRET` é o mesmo em todos os ambientes
- Limpe cookies do navegador
- Verifique se a senha está correta no banco

### Cookies não funcionam em produção
- Certifique-se que `NODE_ENV=production`
- Confirme que o site usa HTTPS
- Verifique configuração de CORS

## 📝 Variáveis de Ambiente - Resumo

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `DATABASE_URL` | ✅ Sim | Connection string PostgreSQL | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | ✅ Sim | Chave secreta JWT (min 32 chars) | `dGhpc2lzYXNlY3JldGtleWZvcmp3dA==` |
| `FRONTEND_URL` | ⚠️ Recomendado | URL do frontend para CORS | `https://app.prorporco.com` |
| `NODE_ENV` | ⚠️ Recomendado | Ambiente (development/production) | `production` |
| `PORT` | ❌ Opcional | Porta servidor Express (padrão: 3000) | `3000` |

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. Configure backup automático do banco de dados
2. Implemente monitoramento de erros (Sentry, LogRocket)
3. Configure analytics (opcional)
4. Documente processos para sua equipe
5. Considere implementar CI/CD para deploys automáticos

## 💡 Dicas de Performance

- Use CDN para assets estáticos
- Ative compressão gzip no servidor
- Configure cache no navegador
- Considere usar Redis para sessões (futuro)

---

**Precisa de ajuda?** Verifique os logs do servidor ou consulte a documentação do Replit.
