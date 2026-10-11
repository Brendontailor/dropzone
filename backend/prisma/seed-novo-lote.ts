import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
// Preços de referência: revise no painel antes de publicar. Estoque real não inferido pelas fotos.
// Importação idempotente: nome único dentro deste lote, não modifica produtos existentes.
const lote = [
  {
    "nome": "Camiseta Graffiti Violet",
    "categoria": "Camisetas",
    "preco": 119.9,
    "imagens": [
      "/colecao/novo-lote/peca-01.webp",
      "/colecao/novo-lote/peca-06.webp",
      "/colecao/novo-lote/peca-07.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "nome": "Boné Violet Label",
    "categoria": "Bonés",
    "preco": 89.9,
    "imagens": [
      "/colecao/novo-lote/peca-02.webp",
      "/colecao/novo-lote/peca-08.webp",
      "/colecao/novo-lote/peca-09.webp"
    ],
    "tamanhos": [
      "Único"
    ]
  },
  {
    "nome": "Bermuda Utility Black",
    "categoria": "Bermudas",
    "preco": 159.9,
    "imagens": [
      "/colecao/novo-lote/peca-03.webp",
      "/colecao/novo-lote/peca-12.webp",
      "/colecao/novo-lote/peca-13.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "nome": "Moletom Forest Utility",
    "categoria": "Moletons",
    "preco": 279.9,
    "imagens": [
      "/colecao/novo-lote/peca-04.webp",
      "/colecao/novo-lote/peca-10.webp",
      "/colecao/novo-lote/peca-11.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "nome": "Boné Tokyo Black",
    "categoria": "Bonés",
    "preco": 99.9,
    "imagens": [
      "/colecao/novo-lote/peca-05.webp",
      "/colecao/novo-lote/peca-14.webp",
      "/colecao/novo-lote/peca-15.webp"
    ],
    "tamanhos": [
      "Único"
    ]
  },
  {
    "nome": "Hoodie Grey Essential",
    "categoria": "Moletons",
    "preco": 229.9,
    "imagens": [
      "/colecao/novo-lote/peca-16.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "nome": "Cargo Black Division",
    "categoria": "Calças",
    "preco": 259.9,
    "imagens": [
      "/colecao/novo-lote/peca-17.webp"
    ],
    "tamanhos": [
      "38",
      "40",
      "42",
      "44"
    ]
  },
  {
    "nome": "Jeans Wide Light Blue",
    "categoria": "Calças",
    "preco": 239.9,
    "imagens": [
      "/colecao/novo-lote/peca-18.webp"
    ],
    "tamanhos": [
      "36",
      "38",
      "40",
      "42",
      "44"
    ]
  },
  {
    "nome": "Camiseta Angel Orange",
    "categoria": "Camisetas",
    "preco": 129.9,
    "imagens": [
      "/colecao/novo-lote/peca-19.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "nome": "Cropped Hoodie White",
    "categoria": "Moletons",
    "preco": 219.9,
    "imagens": [
      "/colecao/novo-lote/peca-20.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G"
    ]
  },
  {
    "nome": "Calça Wide Black",
    "categoria": "Calças",
    "preco": 219.9,
    "imagens": [
      "/colecao/novo-lote/peca-21.webp"
    ],
    "tamanhos": [
      "36",
      "38",
      "40",
      "42",
      "44"
    ]
  },
  {
    "nome": "Camiseta Black Letter",
    "categoria": "Camisetas",
    "preco": 139.9,
    "imagens": [
      "/colecao/novo-lote/peca-22.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "nome": "Jogger Green Block",
    "categoria": "Calças",
    "preco": 199.9,
    "imagens": [
      "/colecao/novo-lote/peca-23.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "nome": "Jeans Cargo Ice Blue",
    "categoria": "Calças",
    "preco": 269.9,
    "imagens": [
      "/colecao/novo-lote/peca-24.webp"
    ],
    "tamanhos": [
      "36",
      "38",
      "40",
      "42",
      "44"
    ]
  },
  {
    "nome": "Crewneck Grey",
    "categoria": "Moletons",
    "preco": 199.9,
    "imagens": [
      "/colecao/novo-lote/peca-25.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "nome": "Hoodie Compton Black",
    "categoria": "Moletons",
    "preco": 289.9,
    "imagens": [
      "/colecao/novo-lote/peca-26.webp",
      "/colecao/novo-lote/peca-27.webp"
    ],
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  }
];
async function main() {
  let criados = 0, existentes = 0;
  for (const item of lote) {
    const existente = await prisma.produto.findFirst({where:{nome:item.nome}});
    if (existente) { existentes++; continue; }
    const categoria = await prisma.categoria.upsert({where:{nome:item.categoria},update:{},create:{nome:item.categoria}});
    const tamanhos = await Promise.all(item.tamanhos.map(nome => prisma.tamanho.upsert({where:{nome},update:{},create:{nome}})));
    await prisma.produto.create({data:{
      nome:item.nome,
      descricao:`Peça selecionada do novo drop DropZone. Confira medidas e disponibilidade antes da compra.`,
      preco:item.preco, categoriaId:categoria.id, destaque:true, disponivel:true,
      imagens:{create:item.imagens.map(imagemUrl=>({imagemUrl}))},
      variacoes:{create:tamanhos.map(t=>({tamanhoId:t.id,disponivel:true}))}
    }});
    criados++;
  }
  console.log(`Novo lote: ${criados} produtos criados; ${existentes} já existentes.`);
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>prisma.$disconnect());
