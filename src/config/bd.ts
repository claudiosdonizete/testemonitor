import { MongoClient } from "mongodb";
require("dotenv").config();
import { app } from "../app";
import { environment } from "../environment.dev";
 

const URI_BD = environment.mongoURI;

export const conectarNoBD = async () => {
  const clienteMongo = new MongoClient(URI_BD, {});

  try {
    const conexao = await clienteMongo.connect();
    app.locals.conexao = conexao;
    app.locals.bd = conexao.db();
    console.log(`App conectado ao bd ${conexao.db().databaseName}`);

    process.on("SIGINT", async () => {
      try {
        await conexao.close();
        console.log("Conexão com o bd fechada");
      } catch (erro) {
        console.log(erro);
      }
    });
  } catch (erro) {
    console.log(erro);
  }
};

export const DesconectarNoBD = async () => {
   try {
   await app.locals.conexao.close();
        console.log("Conexão com o bd fechada");    
  } catch (erro) {
    console.log("DESCONECTAR DB",erro);
  }
};
