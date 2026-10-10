import { Request, Response } from "express";
import { gerarSugestaoLook } from "./ia.service.js";

function obterMensagemErroIA(error: unknown) {
  if (!(error instanceof Error)) {
    return "Erro ao gerar sugestão de look.";
  }

  const mensagem = error.message.toLowerCase();

  if (
    mensagem.includes("api key") ||
    mensagem.includes("apikey") ||
    mensagem.includes("api_key") ||
    mensagem.includes("permission") ||
    mensagem.includes("forbidden") ||
    mensagem.includes("unauthorized") ||
    mensagem.includes("403") ||
    mensagem.includes("401")
  ) {
    return "Chave da IA inválida ou sem permissão. Gere uma chave do Gemini no Google AI Studio.";
  }

  if (
    mensagem.includes("model") ||
    mensagem.includes("not found") ||
    mensagem.includes("404")
  ) {
    return "Modelo de IA indisponível. Verifique a variável GEMINI_MODEL ou use gemini-2.5-flash.";
  }

  if (mensagem.includes("quota") || mensagem.includes("rate limit")) {
    return "Limite de uso da IA atingido. Tente novamente mais tarde.";
  }

  if (mensagem.includes("resposta_ia_vazia")) {
    return "A IA não retornou uma sugestão válida.";
  }

  if (error instanceof SyntaxError) {
    return "A IA retornou uma resposta fora do formato esperado.";
  }

  return "Erro ao gerar sugestão de look.";
}

export async function sugestaoLookController(
  req: Request,
  res: Response
) {
  try {
    const produtoId = Number(req.body.produtoId);

    if (!Number.isInteger(produtoId)) {
      return res.status(400).json({
        mensagem: "produtoId é obrigatório e deve ser um número inteiro.",
      });
    }

    const sugestao = await gerarSugestaoLook(produtoId);

    return res.status(200).json(sugestao);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PRODUTO_NAO_ENCONTRADO"
    ) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "GEMINI_API_KEY não configurada"
    ) {
      return res.status(500).json({
        mensagem: "Integração com IA não configurada.",
      });
    }

    console.error("Erro Gemini:", error);

    return res.status(500).json({
      mensagem: obterMensagemErroIA(error),
    });
  }
}
