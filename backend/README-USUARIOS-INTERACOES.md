# Interações do Cliente

Este patch fecha o item:

`GET /usuarios/me/interacoes`

A rota usa o usuário autenticado pelo token e retorna:

- favoritos;
- avaliações;
- carrinhos/pedidos.

## Endpoint

```text
GET /usuarios/me/interacoes
```

Authorization:

```text
Bearer SEU_TOKEN
```

## Exemplo de resposta

```json
{
  "favoritos": [],
  "avaliacoes": [],
  "carrinhos": []
}
```

## Importante

O `usuarioId` não vem do body nem da URL.

Ele vem do token JWT por meio do `authMiddleware`.

## Atenção ao seu projeto atual

Se `usuarios.service.ts`, `usuarios.controller.ts` ou `usuarios.routes.ts`
já tiverem outras funções, não substitua o arquivo inteiro sem mesclar.

Copie apenas:

- `buscarInteracoesUsuario` para o service;
- `minhasInteracoesController` para o controller;
- a rota `/me/interacoes` para o routes.

## Teste

```bash
npx tsc --noEmit
```

Depois teste no Thunder Client:

```text
GET http://localhost:3333/usuarios/me/interacoes
```
