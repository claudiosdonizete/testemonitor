import { app } from "./app";

import { environment } from "./environment.dev";
import { scheduleP37IpaasDataFetch } from "./utils/scheduler";

const port = environment.port;

const server = app.listen(port, () => {
  // Inicia o agendamento
  scheduleP37IpaasDataFetch();
  console.log(`Servidor rodando em http://localhost:${port}`);
});

process.on("SIGINT", () => {
  server.close();
  console.log("Servidor finalizado!");
});
