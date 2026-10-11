import "dotenv/config";
import { importarNovoLote } from "../src/modules/admin/novo-lote.import.js";
import { prisma } from "../src/database/prisma.js";

importarNovoLote()
  .then(resultado => console.log("Importação concluída:", resultado))
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
