# DropZone — Backend

API responsável pelo backend de uma plataforma web de vitrine e venda de roupas, desenvolvida como projeto acadêmico do curso de **Análise e Desenvolvimento de Sistemas do SENAC-RS**.

> **Status:** 🚧 Em desenvolvimento

## 📖 Sobre o projeto

Este repositório contém a API responsável pelas regras de negócio, autenticação, persistência de dados e integrações utilizadas pela plataforma.

O sistema permitirá que clientes naveguem por produtos, favoritem peças, realizem avaliações e montem um carrinho.

Ao finalizar o carrinho, o cliente será direcionado ao WhatsApp com uma mensagem contendo as peças, cores e tamanhos selecionados.

Também será utilizada a API do **Google Gemini** para gerar sugestões de combinações de roupas.

## ✨ Funcionalidades

### Usuários

- Cadastro de clientes;
- Login;
- Autenticação;
- Diferenciação entre Cliente e Administrador.

### Produtos

- Cadastro de produtos;
- Consulta de produtos;
- Atualização de produtos;
- Gerenciamento de cores;
- Gerenciamento de tamanhos;
- Controle da disponibilidade das peças por tamanho.

### Favoritos

- Favoritar produtos;
- Remover produtos dos favoritos;
- Consultar produtos favoritos.

### Avaliações

- Avaliar produtos de 1 a 5 estrelas;
- Adicionar comentários;
- Consultar avaliações dos produtos.

### Carrinho

- Adicionar produtos;
- Selecionar tamanho e cor;
- Remover produtos;
- Consultar carrinho;
- Preparar os dados necessários para geração da mensagem do WhatsApp.

### Inteligência Artificial

Integração com o **Google Gemini** para geração de sugestões de combinações de roupas.

As sugestões poderão ser relacionadas aos produtos existentes no catálogo, permitindo recomendar outras peças ao cliente.

## 🛠️ Tecnologias

O backend será desenvolvido utilizando:

- **Node.js** — ambiente de execução;
- **Express** — construção da API REST;
- **TypeScript** — tipagem e desenvolvimento;
- **PostgreSQL** — banco de dados;
- **Prisma ORM** — comunicação com o banco;
- **Zod** — validação dos dados;
- **JWT** — autenticação;
- **Hash de senhas** — armazenamento seguro das credenciais;
- **Google Gemini API** — sugestões de combinações de roupas.

## 🏗️ Arquitetura

A aplicação seguirá uma separação de responsabilidades entre as principais partes do backend.

Estrutura planejada:

```text
src/
├── controllers/
├── routes/
├── services/
├── middlewares/
├── schemas/
└── utils/

prisma/
└── schema.prisma
```

A estrutura poderá sofrer alterações durante o desenvolvimento.

## 🔐 Autenticação

O sistema possuirá dois tipos principais de usuário:

**Cliente**

Responsável por utilizar as funcionalidades da loja, como catálogo, favoritos, avaliações e carrinho.

**Administrador**

Responsável pelo gerenciamento dos produtos e suas disponibilidades.

A autenticação será realizada utilizando **JWT**, e as senhas não serão armazenadas diretamente no banco de dados, sendo utilizado hash para protegê-las.

## 🤖 Integração com Gemini

A API será responsável pela comunicação com o Google Gemini.

A IA receberá informações relevantes sobre uma peça ou solicitação do cliente e poderá gerar sugestões de combinações.

Quando possível, essas sugestões poderão ser relacionadas com produtos existentes no catálogo.

## 🛒 Integração com WhatsApp

Não será utilizada uma API oficial do WhatsApp.

Ao finalizar o carrinho, serão utilizadas as informações selecionadas pelo cliente para montar uma mensagem pronta contendo os produtos, tamanhos e cores.

O usuário será então direcionado ao WhatsApp para continuar o atendimento com a loja.

## 🗂️ Repositórios

O projeto será dividido em:

**Backend:** este repositório

**Frontend:** `[link do repositório frontend]`

## 🚧 Estado atual

O projeto encontra-se em fase inicial de desenvolvimento.

As funcionalidades, estrutura da API e modelagem do banco de dados poderão sofrer alterações durante a implementação.

## 🎓 Contexto acadêmico

Projeto desenvolvido em dupla durante o **4º semestre** do curso de **Análise e Desenvolvimento de Sistemas (ADS)** do **SENAC-RS**, na disciplina de **Programação Fullstack**.

O projeto busca aplicar conhecimentos relacionados a:

- Desenvolvimento de APIs REST;
- Desenvolvimento frontend;
- Banco de dados relacional;
- ORM;
- Autenticação e autorização;
- Validação de dados;
- Integração entre frontend e backend;
- Integração com Inteligência Artificial.

## 👥 Desenvolvedores

- [Integrante 1]
- [Integrante 2]