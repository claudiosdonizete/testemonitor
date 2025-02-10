import mongoose from "mongoose";
import { environment } from '../environment.dev';
import { P37Model } from '../models/P37Model'; // Importa o modelo
import moment from 'moment';

export class AlertasController {
  constructor() {}
  public CalculaAlertas(jsonData) {
    // Implementação do método CalculaAlertas
    /*implementar a Leitura do Json da requisicao e multiplicar por 0,5 Segundos cada linha, ao fazer
      teremos uma media de minutos que a requisicao deveria ser processada entao podemos mudar a alerta
      de acordo com as qtd de linhas  exemplo de calculo 
      100 linhas no lote
      calculo 100 * 0,5 = 50segundos =  50 segundos ou seja 50 segundos o tempo ideal, entao a regra ficaria:
      entre 50s ate  (50*0,05)+ 50 segundos, aqui equivale a 50% do tempo total + tempo total alerta Amarela > que isso vermelho
      Você, Ontem 17:29
      mas para isso teriamos que acessar outro endpoint  do protheus que ja temos para listar e gravar o body das requisicoes no portal em uma nova collecton
      ou na msm collection porem em um campo body request, body response
      */

      // P37_STATUS "0" 
      // VERDE     --> <5 Minutos   
      // AMARELO   --> >=5 and <=10  
      // VERMELHOI --> > 10

      // P37_STATUS "1" OU "F"
      // VERDE     --> <30 Minutos   
      // AMARELO   --> >=30 and <=60  
      // VERMELHO --> > 60 

      // manipular atributos Legenda e alerta de acordo com a regra acima e retornar jsondata já manipulado

      // Gravar os atributos em branco na inclusão  do documento na collection ou se o status for diferente de 0,1 e F atualizar data e hora termino e legenda
      // criar um metodo para verificar se a key já existe na collection
      // se ja existir, não manipular os atributos que forma gravados em branco na inclusão
      // após gravar todas as linbhas e atualizar na collection, chamar o metodo calcula alerta. Dentro desse metodo, ler todas as linhas da collection
      // cujos status são 0,1 ou F e aplicar  calculo de alertas

      const dataini = jsonData.data
      const horaini = jsonData.hora
      const diferencaSegundos = this.calcularDiferencaSegundos(dataini, horaini);

      this.setAlerta(jsonData, diferencaSegundos);
      this.setTermino(jsonData);

    return jsonData;
  }

  calcularDiferencaSegundos(data: string, hora: string): number {
    // Combina a data e hora do JSON em um objeto moment
    const dataHoraJson: moment.Moment = moment(`${data} ${hora}`, 'DD/MM/YYYY HH:mm:ss');
  
    // Data e hora atuais
    const dataHoraAtual: moment.Moment = moment();
  
    // Calcula a diferença em segundos
    const diferencaSegundos: number = dataHoraJson.diff(dataHoraAtual, 'seconds');
  
    // Retorna o valor absoluto da diferença
    return Math.abs(diferencaSegundos);
  }
  setAlerta(jsonData: any, diferencaSegundos: number): object {
  
    // Constantes para os limites de tempo (em segundos)
    const LIMITE_VERDE_STATUS_0 = 5 * 60; // 5 minutos
    const LIMITE_AMARELO_STATUS_0 = 10 * 60; // 10 minutos
    const LIMITE_VERDE_STATUS_1 = 30 * 60; // 30 minutos
    const LIMITE_AMARELO_STATUS_1 = 60 * 60; // 60 minutos
  
    // Define a propriedade 'alerta' com base no status e na diferença de segundos
    if (jsonData.status === "0") {
      if (diferencaSegundos <= LIMITE_VERDE_STATUS_0) {
        jsonData['alerta'] = '0'; // Verde
      } else if (diferencaSegundos <= LIMITE_AMARELO_STATUS_0) {
        jsonData['alerta'] = '1'; // Amarelo
      } else {
        jsonData['alerta'] = '2'; // Vermelho
      }
    } else if (jsonData.status === "1" || jsonData.status === "F") {
      if (diferencaSegundos <= LIMITE_VERDE_STATUS_1) {
        jsonData['alerta'] = '0'; // Verde
      } else if (diferencaSegundos <= LIMITE_AMARELO_STATUS_1) {
        jsonData['alerta'] = '1'; // Amarelo
      } else {
        jsonData['alerta'] = '2'; // Vermelho
      }
    }
  
    return jsonData;
  }
  setTermino(jsonData: any): object {
  
    // Obtém a data e hora atuais
    const dataTermino = new Date().toLocaleDateString();
    const horaTermino = new Date().toLocaleTimeString();
  
    // Define a propriedade 'alerta' com base no status e na diferença de segundos
    if (!(jsonData.status === "0" || jsonData.status === "1" || jsonData.status === "F")) {
      // Define 'datatermino' e 'horatermino' apenas se o status não for "0", "1" ou "F"
      jsonData["datatermino"] = dataTermino;
      jsonData["horatermino"] = horaTermino;
    }
  
    return jsonData;
  }
}