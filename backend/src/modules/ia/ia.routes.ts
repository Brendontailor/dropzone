import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { sugestaoLookController } from "./ia.controller.js";

export const iaRoutes = Router();

iaRoutes.post(
  "/sugestao-look",
  authMiddleware,
  sugestaoLookController
);
