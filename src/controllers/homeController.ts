import { P37Model } from "../models/P37Model";
import { AlertasController } from "../utils/alertasController";
import axios from "axios";
import { environment } from "../environment.dev";

import mongoose, { disconnect } from "mongoose";
import { P37DetailModel } from "../models/P37DetailModel";

export class HomeController {
  private P37Model: mongoose.Model<any>;
  private P37DetailModel: mongoose.Model<any>;
  private isConnected: boolean = false;

  constructor() {
    this.connectToMongoDB();
    this.initializeModels();
  }
  async destroy() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log("Conexão com o bd fechada");
      }
    } catch (erro) {
      console.log("Erro ao desconectar o DB", erro);
    }
  }
  private async connectToMongoDB(): Promise<void> {
    const mongoURI = environment.mongoURI;
    try {
      await mongoose.connect(mongoURI);
      this.isConnected = true;
      console.log("Conectado ao MongoDB com sucesso!");
    } catch (error) {
      console.error("Erro ao conectar ao MongoDB:", error);
      throw error;
    }
  }

  private initializeModels(): void {
    // Reutiliza o modelo já definido
    this.P37Model = P37Model;
    this.P37DetailModel = P37DetailModel;
  }

  async SetP37DETAIL(oData) {
    try {
      // console.log("Tentando salvar detalhe para idcontabil:", oData.idcontabil, "e status:", oData.status);
      if (!this.isConnected) {
        await this.connectToMongoDB();
      }
      const filter = { idcontabil: oData.idcontabil, status: oData.status };
      const detail = {
        idcontabil: oData.idcontabil,
        status: oData.status,
        legenda: oData.legenda,
        timestamp: new Date(),
      };
      const options = { upsert: true, new: true };
      // console.log("Filtro:", filter);
      // console.log("Detalhe:", detail);

      const savedDetail = await this.P37DetailModel.findOneAndUpdate(
        filter,
        detail,
        options
      );

      if (savedDetail) {
        // console.log("Detalhe salvo/atualizado com sucesso:", savedDetail);
        return {
          message: "Detalhe salvo/atualizado com sucesso:",
          detail: savedDetail,
        };
      } else {
        //console.warn("Nenhum detalhe foi salvo/atualizado. Verifique o filtro e os dados.");
        return {
          message:
            "Nenhum detalhe foi salvo/atualizado. Verifique o filtro e os dados.",
          detail: savedDetail,
        };
      }
    } catch (error) {
      //console.error("Erro ao salvar detalhe no MongoDB:", error);
      return { message: "Erro ao salvar detalhe no MongoDB:", detail: error };

      throw error;
    }
  }

  async SetP37DB(jsonData) {
    try {
      if (!("key" in jsonData)) {
        throw new Error(
          "A propriedade 'key' é obrigatória no objeto jsonData."
        );
      }

      if (!this.isConnected) {
        await this.connectToMongoDB();
      }

      const filter = { key: jsonData.key };
      const options = { new: true, upsert: true };

      const savedData = await this.P37Model.findOneAndUpdate(
        filter,
        jsonData,
        options
      ); // Await é crucial aqui

      if (savedData) {
        console.log("Documento salvo/atualizado:", savedData);
        await this.SetP37DETAIL(savedData); // Aguarda a inserção dos detalhes
        return savedData;
      } else {
        return {
          message: "Falha ao salvar/atualizar o documento.",
          detail: null,
        };
      }
    } catch (error) {
      console.error("Erro em SetP37DB:", error);
      return { message: "Erro ao salvar no MongoDB", detail: error.message };
    }
  }
  async getP37IpaasData(req) {
    try {
      const options = {
        method: "POST",
        url: environment.urliPaasgetp37,
        headers: {
          "Content-Type": "application/json",
          apiKey: environment.apiKeyiPaasgetp37,
        },
        data: JSON.stringify(req.body),
      };

      let totalReg = 0;
      const response = await axios(options);
      const oBody = response.data;
      const coreController = new AlertasController();

      for (const orow of oBody.result.requisicoes) {
        const existingDoc = await this.P37Model.findOne({
          key: orow.key,
        }).exec();

        if (!existingDoc) {
          orow["datatermino"] = "";
          orow["horatermino"] = "";
          orow["legenda"] = "0";
          orow["alerta"] = "0";
          // orow["bodyreq"] = "";
          // orow["bodyres"] = "";
        } else {
          orow["datatermino"] = existingDoc.datatermino;
          orow["horatermino"] = existingDoc.horatermino;
          orow["legenda"] = existingDoc.legenda;
          orow["alerta"] = existingDoc.alerta;
        }

        // Atualiza bodyreq e bodyres
        const updatedRow = orow;

        // lentidão, foi comentado. Se necessário conversar com Julio sobre essa implementaçao
        // const updatedRow =await this.updateP37BodyReqBodyRes(
        //   req.api,
        //   req.data,
        //   orow
        // );

        orow["idcontabil"] = orow.key;

        coreController.CalculaAlertas(orow);
        const resultado = await this.SetP37DB(updatedRow); // Aguarda a inserção

        if (resultado) {
          totalReg++;
        } else {
          console.error("Falha ao inserir dados:", orow);
        }
      }

      return {
        message: "Dados atualizados com sucesso",
        totalUpdated: totalReg,
      };
    } catch (error) {
      console.error(
        "Erro na requisição Axios ou gravação no MongoDB:",
        error?.response?.data || error.message
      );
      return error;
    }
  }
  async updateP37BodyReqBodyRes(api, data, orow) {
    try {
      const options = {
        method: "POST",
        url: environment.urliPaasgetp37,
        headers: {
          "Content-Type": "application/json",
          apiKey: environment.apiKeyiPaasgetp37,
        },
        data: { api: api, data: data, requisicao: orow.requisicao },
      };

      const response = await axios(options);
      const oBody = response.data;

      console.log("oBody", oBody);

      // Verifica se a resposta contém os dados esperados
      if (!oBody || !oBody.result || !oBody.result.requisicoes) {
        throw new Error("Resposta da API não contém os dados esperados.");
      }

      // Verifica se o array de requisições está vazio
      if (oBody.result.requisicoes.length === 0) {
        console.warn(
          "O array de requisições está vazio. Nenhum dado será atualizado."
        );
        orow["bodyreq"] = ""; // Define um valor padrão para bodyreq
        orow["bodyres"] = ""; // Define um valor padrão para bodyres
        return orow; // Retorna o objeto orow sem alterações adicionais
      }

      // Atualiza os atributos bodyreq e bodyres no objeto orow
      orow["bodyreq"] = oBody.result.requisicoes[0].body || ""; // Define um valor padrão caso bodyreq seja undefined
      orow["bodyres"] = oBody.result.requisicoes[0].body_response || ""; // Define um valor padrão caso bodyres seja undefined

      // Retorna o objeto orow atualizado
      return orow;
    } catch (error) {
      console.error(
        "Erro na requisição Axios ou gravação no MongoDB:",
        error?.response?.data || error.message
      );
      throw error; // Lança o erro para ser tratado no método chamador
    }
  }
  async getP37Db(req) {
    try {
      const { page, pagesize, ...filters } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(pagesize);
      // Construir o objeto de consulta com base nos filtros fornecidos
      const query: any = {};
      if (filters) {
        if (filters.idcontabil) {
          query.idcontabil = filters.idcontabil;
        }
        if (filters.status) {
          query.status = filters.status;
        }
        // Adicione mais filtros conforme necessário
      }

      // Pipeline de agregação
      const pipeline = [
        { $match: query }, // Filtra os documentos com base na query
        { $skip: skip }, // Paginação: pula os documentos
        { $limit: parseInt(pagesize) }, // Paginação: limita o número de documentos
        {
          $lookup: {
            // Junta os detalhes (P37DetailModel) com base no idcontabil
            from: "p37details", // Nome da coleção de detalhes
            localField: "idcontabil", // Campo em P37Model
            foreignField: "idcontabil", // Campo em P37DetailModel
            as: "details", // Nome do campo que armazenará os detalhes
          },
        },
      ];
      // Executa a agregação
      const data = await P37Model.aggregate(pipeline).exec();
      // Conta o total de documentos para paginação
      const total = await P37Model.countDocuments(query);
      const hasNext = page * pagesize < total;

      let oP37Items = {
        items: data,
        total: total,
        page: page,
        totalPages: Math.ceil(total / pagesize),
        hasNext: hasNext,
      };

      return oP37Items;
    } catch (error) {
      return { message: "Erro ao buscar dados", error: error };
    }
  }
}
//Regra de negocios para buscar dados no ipaas e salvar na collection
exports.getP37iPass = async (req, res) => {
  try {
    const homeController = new HomeController();
    const oBody = await homeController.getP37IpaasData(req);
    await homeController.destroy(); // Chamando destroy após usar o controller
    res.status(200).json(oBody);
  } catch (error) {
    console.error(
      "Erro na requisição Axios:",
      error?.response?.data || error.message
    );
    res.status(400).json(error);
  }
};

// Método para buscar dados paginados do MongoDB
exports.getP37DB = async (req, res) => {
  try {
    const homeController = new HomeController();
    const oP37Items = await homeController.getP37Db(req);
    await homeController.destroy(); // Chamando destroy após usar o controller
    res.status(200).json(oP37Items);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Erro ao buscar dados", error: error });
  }
};
