import { db } from "./db";
import { usuarios } from "./db/schema";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config();

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Criar usuário João Marcos
    const existingJoao = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, "joaomarcosjunior@gmail.com"),
    });

    if (!existingJoao) {
      const hashedPasswordJoao = await bcrypt.hash("Jo@oM@rcos007", 10);
      
      await db.insert(usuarios).values({
        nome: "João Marcos",
        email: "joaomarcosjunior@gmail.com",
        senha: hashedPasswordJoao,
        fazenda: "Minha Fazenda",
      });

      console.log("✅ Usuário João Marcos criado com sucesso!");
      console.log("📧 Email: joaomarcosjunior@gmail.com");
    } else {
      console.log("✅ Usuário João Marcos já existe!");
    }

    // Criar usuário admin (backup)
    const existingAdmin = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, "admin@prorporco.com"),
    });

    if (!existingAdmin) {
      const hashedPasswordAdmin = await bcrypt.hash("123456", 10);
      
      await db.insert(usuarios).values({
        nome: "Admin",
        email: "admin@prorporco.com",
        senha: hashedPasswordAdmin,
        fazenda: "Fazenda Demo",
      });

      console.log("✅ Usuário admin criado com sucesso!");
      console.log("📧 Email: admin@prorporco.com");
    } else {
      console.log("✅ Usuário admin já existe!");
    }

  } catch (error) {
    console.error("❌ Erro ao criar seed:", error);
    process.exit(1);
  }
}

seed().then(() => {
  console.log("🎉 Seed concluído!");
  process.exit(0);
});
