import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { leadsRouter } from "./routes/leads.routes";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "vertice-api" });
});

app.use("/api/leads", leadsRouter);

app.use((_request, response) => {
  response.status(404).json({ message: "Rota não encontrada." });
});

async function start() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`API disponível em http://localhost:${env.PORT}`);
  });
}

void start();