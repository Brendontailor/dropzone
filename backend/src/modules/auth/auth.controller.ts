import { Request, Response } from "express";
import { realizarLogin } from "./auth.service.js";


export async function loginController(req: Request, res: Response){
    try{
        const {email, senha} = req.body;

        if (!email || !senha){
            return res.status(400).json({
                mensagem: 
                "email e senha são obrigatórios"
            })
        }

        const resultado = await realizarLogin({
            email,
            senha,
        });

        return(res.status(200).json(resultado))

    } catch (error){
        if (error instanceof Error && error.message == "Email ou senha inválidos"){
            return res.status(401).json({
                mensagem: error.message
            })
        }

        console.error(error)

        return res.status(500).json({
            mensagem: "Erro ao realizar login."
        })
    }
}