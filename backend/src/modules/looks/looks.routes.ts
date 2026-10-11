import { randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";

export const looksRoutes = Router();

const entrada = z.object({
  nome: z.string().trim().min(2).max(100),
  descricao: z.string().trim().max(300).default(""),
  imagemUrl: z.string().trim().min(1).max(1000).refine(v => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//i.test(v), "Imagem deve ser um caminho local ou URL HTTPS"),
  ordem: z.number().int().min(0).max(999).default(0),
  publicado: z.boolean().default(true),
  produtoIds: z.array(z.number().int().positive()).max(30).default([]),
});

const include = {
  itens: {
    orderBy: { ordem: "asc" as const },
    include: { produto: { include: { categoria: true, imagens: true, variacoes: { include: { cor: true, tamanho: true } } } } },
  },
};

const errorHandler = (error: unknown, res: Response) => {
  console.error("Erro em looks:", error);
  return res.status(500).json({ mensagem: "Erro ao processar look." });
};

looksRoutes.get("/", async (_req, res) => {
  try {
    const looks = await prisma.look.findMany({ where: { publicado: true }, orderBy: [{ ordem: "asc" }, { id: "asc" }], include });
    return res.json(looks.map(look => ({ ...look, itens: look.itens.filter(item => item.produto.disponivel) })));
  } catch (e) { return errorHandler(e, res); }
});

looksRoutes.get("/admin", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    return res.json(await prisma.look.findMany({ orderBy: [{ ordem: "asc" }, { id: "asc" }], include }));
  } catch (e) { return errorHandler(e, res); }
});

async function validarProdutos(ids: number[], res: Response): Promise<number[] | null> {
  const unicos = [...new Set(ids)];
  if (unicos.length !== ids.length) { res.status(400).json({ mensagem: "O mesmo produto aparece mais de uma vez." }); return null; }
  const encontrados = await prisma.produto.count({ where: { id: { in: unicos } } });
  if (encontrados !== unicos.length) { res.status(400).json({ mensagem: "Um ou mais produtos selecionados não existem." }); return null; }
  return unicos;
}

looksRoutes.post("/", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const validacao = entrada.safeParse(req.body);
  if (!validacao.success) return res.status(400).json({ mensagem: "Confira os dados do look.", detalhes: validacao.error.flatten() });
  try {
    const { produtoIds, ...dados } = validacao.data;
    const ids = await validarProdutos(produtoIds, res);
    if (!ids) return;
    const criado = await prisma.look.create({ data: { ...dados, codigo: randomUUID(), itens: { create: ids.map((produtoId, ordem) => ({ produtoId, ordem })) } }, include });
    return res.status(201).json(criado);
  } catch (e) { return errorHandler(e, res); }
});

looksRoutes.put("/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ mensagem: "ID inválido." });
  const validacao = entrada.safeParse(req.body);
  if (!validacao.success) return res.status(400).json({ mensagem: "Confira os dados do look.", detalhes: validacao.error.flatten() });
  try {
    const existente = await prisma.look.findUnique({ where: { id }, select: { id: true } });
    if (!existente) return res.status(404).json({ mensagem: "Look não encontrado." });
    const { produtoIds, ...dados } = validacao.data;
    const ids = await validarProdutos(produtoIds, res);
    if (!ids) return;
    const atualizado = await prisma.look.update({ where: { id }, data: { ...dados, itens: { deleteMany: {}, create: ids.map((produtoId, ordem) => ({ produtoId, ordem })) } }, include });
    return res.json(atualizado);
  } catch (e) { return errorHandler(e, res); }
});

looksRoutes.delete("/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ mensagem: "ID inválido." });
  try {
    const deleted = await prisma.look.deleteMany({ where: { id } });
    if (!deleted.count) return res.status(404).json({ mensagem: "Look não encontrado." });
    return res.json({ mensagem: "Look excluído." });
  } catch (e) { return errorHandler(e, res); }
});
