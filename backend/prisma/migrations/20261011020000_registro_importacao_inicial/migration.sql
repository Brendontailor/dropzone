CREATE TABLE "CatalogoImportacao" (
  "codigo" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CatalogoImportacao_pkey" PRIMARY KEY ("codigo")
);
