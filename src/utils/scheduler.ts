import cron from "node-cron";
import { HomeController } from "../controllers/homeController";
import { environment } from "../environment.dev";

// Função para agendar a tarefa
export function scheduleP37IpaasDataFetch(): void {
  // Agendando a tarefa para rodar a cada 5 minutos, por exemplo
  cron.schedule("*/5 * * * *", async () => {
    console.log("Executando a tarefa agendada: getP37IpaasData");
    const homeController = new HomeController();
    try {
      // Obter os dados de ontem e de hoje
      const datesToProcess = [getYesterdayDate(), getCurrentDate()];

      for (const date of datesToProcess) {
        const req = {
          body: {
            api: environment.apiCodeP37,
            data: date, // Data no formato AAAAMMDD
          },
        };

        console.log(`Executando getP37IpaasData para a data: ${date}`);
        const result = await homeController.getP37IpaasData(req);
        console.log(`Resultado da tarefa agendada para ${date}:`, result);
      }
    } catch (error) {
      console.error("Erro ao executar a tarefa agendada:", error);
    } finally {
      await homeController.destroy();
    }
  });
}

// Função para obter a data de ontem no formato AAAAMMDD
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

// Função para obter a data atual no formato AAAAMMDD
function getCurrentDate(): string {
  return formatDate(new Date());
}

// Função para formatar a data no formato AAAAMMDD
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}
