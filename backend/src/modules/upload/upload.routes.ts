import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import { upload, processarImagemProduto, deletarImagemProduto } from "../../utils/upload.js";

export const uploadRoutes = Router();

uploadRoutes.post("/produto", authMiddleware, adminMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensagem: "Nenhuma imagem enviada." });
    }

    const url = await processarImagemProduto(req.file.buffer);
    return res.status(201).json({ url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao processar imagem." });
  }
});

uploadRoutes.delete("/produto", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ mensagem: "URL da imagem é obrigatória." });
    }

    await deletarImagemProduto(url);
    return res.status(200).json({ mensagem: "Imagem removida." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao remover imagem." });
  }
});