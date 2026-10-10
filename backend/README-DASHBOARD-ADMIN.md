# Dashboard Admin

Este patch adiciona o módulo:

`src/modules/admin`

Arquivos:
- `admin.routes.ts`
- `admin.controller.ts`
- `admin.service.ts`

## Registrar no app.ts

Adicione:

```ts
import { adminRoutes } from "./modules/admin/admin.routes.js";
```

Depois:

```ts
app.use("/admin", adminRoutes);
```

## Endpoint

```text
GET /admin/dashboard
```

Exige autenticação e usuário ADMIN.

## Retorna

- total de produtos;
- total de clientes;
- total de avaliações;
- total de favoritos;
- total de pedidos/carrinhos finalizados;
- produtos mais favoritados;
- produtos melhor avaliados.

## Teste

```bash
npx tsc --noEmit
```

Depois:

```text
GET http://localhost:3333/admin/dashboard
```

Use Bearer Token de um ADMIN.
