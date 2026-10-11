import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import { importarNovoLote } from "./novo-lote.import.js";

export const novoLoteRoutes = Router();
novoLoteRoutes.post("/importar-novo-lote", authMiddleware, adminMiddleware, async (_req, res) => {
  try { return res.json(await importarNovoLote()); }
  catch (error) { console.error("Falha ao importar Novo Lote:", error); return res.status(500).json({ mensagem: "Não foi possível importar o lote. Confira migrações do banco e logs da API." }); }
});
