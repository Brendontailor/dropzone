# Área Admin + Interações

Este patch complementa a área administrativa.

## O que já continua sendo gerenciado pelas rotas existentes

As rotas de produtos, categorias, cores e tamanhos devem continuar usando:

```ts
authMiddleware,
adminMiddleware
```

para POST, PUT/PATCH e DELETE.

Não foi criado um CRUD duplicado dentro de `/admin`.

## Novas rotas administrativas

Todas as rotas abaixo passam por autenticação e autorização de ADMIN:

```text
GET    /admin/dashboard
GET    /admin/avaliacoes
PATCH  /admin/avaliacoes/:id/resposta
DELETE /admin/avaliacoes/:id
GET    /admin/favoritos
GET    /admin/pedidos
```

## Responder avaliação

```text
PATCH /admin/avaliacoes/5/resposta
```

Body:

```json
{
  "respostaAdmin": "Obrigado pela sua avaliação."
}
```

## Excluir avaliação inadequada

```text
DELETE /admin/avaliacoes/5
```

## Alteração necessária no Prisma

Adicione no model `Avaliacao`:

```prisma
respostaAdmin String?
```

Depois:

```bash
npx prisma db push
npx prisma generate
npx tsc --noEmit
```

## app.ts

Se ainda não estiver registrado:

```ts
import { adminRoutes } from "./modules/admin/admin.routes.js";

app.use("/admin", adminRoutes);
```

## Por que o router usa `use`

No começo do router foi usado:

```ts
adminRoutes.use(authMiddleware, adminMiddleware);
```

Assim todas as rotas deste módulo são automaticamente protegidas como ADMIN,
sem repetir os dois middlewares em cada endpoint.
