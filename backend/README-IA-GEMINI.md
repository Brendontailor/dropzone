# Integração com IA - Google Gemini

Este patch adiciona:

```text
src/modules/ia/
  ia.routes.ts
  ia.controller.ts
  ia.service.ts
```

## 1. Instalar o SDK

```bash
npm install @google/genai
```

O projeto usa o SDK atual do Gemini para Node.js.

## 2. Configurar a chave

No `.env`:

```env
GEMINI_API_KEY=sua_chave_aqui
```

Não envie essa chave para o GitHub.

## 3. Registrar no app.ts

Importe:

```ts
import { iaRoutes } from "./modules/ia/ia.routes.js";
```

Registre:

```ts
app.use("/ia", iaRoutes);
```

## 4. Endpoint

```text
POST /ia/sugestao-look
```

A rota exige usuário autenticado.

Body:

```json
{
  "produtoId": 1
}
```

Exemplo de resposta:

```json
{
  "produtoBase": {
    "id": 1,
    "nome": "Camiseta Oversized"
  },
  "explicacao": "Uma combinação casual e equilibrada.",
  "sugestoes": [
    {
      "produtoId": 4,
      "nome": "Calça Cargo Preta",
      "motivo": "Mantém o estilo urbano e combina com a modelagem oversized."
    }
  ],
  "geradoPorIA": true,
  "fonte": "Google Gemini"
}
```

Os campos `geradoPorIA` e `fonte` deixam explícito para o frontend que a sugestão veio da IA.

## 5. Como funciona

A IA não recebe liberdade para inventar produtos.

O backend:
1. busca o produto escolhido;
2. busca produtos disponíveis no banco;
3. envia esse catálogo ao Gemini;
4. pede sugestões usando somente os produtos existentes;
5. valida novamente os IDs retornados antes de enviar a resposta ao frontend.

## 6. Testar

```bash
npx tsc --noEmit
```

Depois inicie o servidor e teste pelo Thunder Client.

Use:

```text
POST http://localhost:3333/ia/sugestao-look
```

Authorization:

```text
Bearer SEU_TOKEN
```

Body:

```json
{
  "produtoId": 1
}
```

## Observação

O modelo está centralizado nesta constante:

```ts
const MODELO_GEMINI = "gemini-3.8-flash";
```

Assim, se o modelo for alterado no futuro, basta trocar em um único lugar.
