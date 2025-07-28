
// scripts/createAdmin.js - Script para criar administrador
import { createAdminUser } from "../src/services/createAdminUser.js";

async function main() {
  try {
    console.log("🚀 Iniciando criação de administrador...");
    
    const result = await createAdminUser(
      "paulinett@live.com",
      "123456", 
      "Paulinette Administrador"
    );
    
    console.log("✅ Resultado:", result);
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

main();
