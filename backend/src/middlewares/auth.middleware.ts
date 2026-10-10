import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      mensagem: "Token não informado",
    });
  }

  const [tipo, token] = authHeader.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      mensagem: "Token inválido",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      mensagem: "JWT_SECRET não configurado",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload & { role: string };

    const usuarioId = Number(decoded.sub);

    if (!Number.isInteger(usuarioId)) {
      return res.status(401).json({
        mensagem: "Token inválido",
      });
    }

    req.usuarioId = usuarioId;
    req.usuarioRole = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      mensagem: "Token inválido",
    });
  }
}