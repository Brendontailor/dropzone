import express from "express"
import cors from "cors"

import { categoriasRoutes } from "./modules/categorias/categorias.routes.js"
import { produtosRoutes } from "./modules/produtos/produtos.routes.js"


export const app = express()

app.use(cors())
app.use(express.json())

app.get("/teste", (req, res)=>{
    res.json({status: "server rodando"})
})

app.use("/categorias", categoriasRoutes)
app.use("/produtos", produtosRoutes);