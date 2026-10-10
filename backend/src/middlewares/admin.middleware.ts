import { Request, Response, NextFunction } from "express";

//identifica se o usuário é admin se sim, permite o acesso, se não, retorna 403
export function adminMiddleware(
  req: Request,  res: Response,  next: NextFunction
) {
  if (req.usuarioRole !== "ADMIN") {
    return res.status(403).json({
      mensagem: "Acesso permitido apenas para administradores.",
    });
  }

  return next();
}