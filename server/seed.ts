import { db } from "./db";
import { usuarios } from "./db/schema";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Verificar se já existe usuário admin
    const existingAdmin = await db.query.usuarios.findFirst({
      where: (usuarios, { eq }) => eq(usuarios.email, "admin@prorporco.com"),
    });

    if (existingAdmin) {
      console.log("✅ Usuário admin já existe!");
      return;
    }

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    await db.insert(usuarios).values({
      nome: "Admin",
      email: "admin@prorporco.com",
      senha: hashedPassword,
      fazenda: "Fazenda Demo",
    });

    console.log("✅ Usuário admin criado com sucesso!");
    console.log("📧 Email: admin@prorporco.com");
    console.log("🔑 Senha: 123456");
  } catch (error) {
    console.error("❌ Erro ao criar seed:", error);
    process.exit(1);
  }
}

seed().then(() => {
  console.log("🎉 Seed concluído!");
  process.exit(0);
});
