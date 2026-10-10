# Pedido pelo WhatsApp

Este patch gera uma mensagem com todo o carrinho e um link que abre o
WhatsApp da empresa com a mensagem já preenchida.

## Número da empresa

Adicione no `.env`:

```env
WHATSAPP_NUMERO="5553081298719"
```

O valor acima usa:
- `55` = Brasil
- `53` = DDD
- restante = número informado

O número deve ficar somente com dígitos.

## Rota

```text
POST /carrinho/whatsapp
```

A rota exige autenticação.

Body:

```text
vazio
```

Retorno:

```json
{
  "carrinhoId": 1,
  "mensagem": "Olá! Gostaria de finalizar meu pedido...",
  "whatsappUrl": "https://wa.me/5553081298719?text=...",
  "total": 199.8
}
```

## Frontend

Ao clicar em "Comprar pelo WhatsApp", o frontend chama:

```text
POST /carrinho/whatsapp
```

Depois abre o `whatsappUrl` retornado:

```ts
window.open(whatsappUrl, "_blank");
```

O WhatsApp abre a conversa da empresa com a mensagem pronta.

O cliente ainda precisa clicar em "Enviar" dentro do WhatsApp.

## Importante

Um link `wa.me` não consegue:
- clicar em "Enviar" automaticamente;
- confirmar ao backend que a mensagem foi realmente enviada;
- enviar um arquivo/anexo automaticamente.

Essas ações exigiriam integração oficial com a API do WhatsApp.

Por isso este patch apenas prepara a mensagem e abre a conversa correta.

## app.ts

Se ainda não estiver registrado:

```ts
import { carrinhoRoutes } from "./modules/carrinho/carrinho.routes.js";

app.use("/carrinho", carrinhoRoutes);
```

## Validar

```bash
npx tsc --noEmit
```

## Teste no Thunder Client

```text
POST http://localhost:3333/carrinho/whatsapp
```

Auth:

```text
Bearer TOKEN_CLIENTE
```

Body vazio.
