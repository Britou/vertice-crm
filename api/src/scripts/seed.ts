import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { type Lead, LeadModel } from "../models/Lead";

type DemoLead = Pick<
  Lead,
  | "name"
  | "company"
  | "email"
  | "phone"
  | "source"
  | "status"
  | "estimatedValue"
>;

const demoLeads: DemoLead[] = [
  {
    name: "Beatriz Martins",
    company: "Aster Studio",
    email: "beatriz.martins@demo.vertice.local",
    phone: "(11) 98888-1024",
    source: "SITE",
    status: "NOVO",
    estimatedValue: 2800,
  },
  {
    name: "Lucas Nogueira",
    company: "Cobalto Digital",
    email: "lucas.nogueira@demo.vertice.local",
    phone: "(21) 97777-3142",
    source: "INSTAGRAM",
    status: "NOVO",
    estimatedValue: 1900,
  },
  {
    name: "Marina Costa",
    company: "Orla Studio",
    email: "marina.costa@demo.vertice.local",
    phone: "(41) 96666-2187",
    source: "INDICACAO",
    status: "CONTATO",
    estimatedValue: 3600,
  },
  {
    name: "Rafael Mendes",
    company: "Norte Labs",
    email: "rafael.mendes@demo.vertice.local",
    phone: "(31) 95555-6721",
    source: "SITE",
    status: "CONTATO",
    estimatedValue: 4200,
  },
  {
    name: "Ana Clara Souza",
    company: "Lumen Arquitetura",
    email: "ana.souza@demo.vertice.local",
    phone: "(51) 94444-8810",
    source: "INDICACAO",
    status: "PROPOSTA",
    estimatedValue: 7800,
  },
  {
    name: "Gabriel Lima",
    company: "Ponto Norte",
    email: "gabriel.lima@demo.vertice.local",
    phone: "(85) 93333-4096",
    source: "INSTAGRAM",
    status: "PROPOSTA",
    estimatedValue: 5200,
  },
  {
    name: "Camila Rocha",
    company: "Viva Eventos",
    email: "camila.rocha@demo.vertice.local",
    phone: "(48) 92222-7643",
    source: "SITE",
    status: "GANHO",
    estimatedValue: 6400,
  },
  {
    name: "Diego Alves",
    company: "Métrica Consultoria",
    email: "diego.alves@demo.vertice.local",
    phone: "(61) 91111-5308",
    source: "OUTRO",
    status: "PERDIDO",
    estimatedValue: 3100,
  },
];

const demoEmails = demoLeads
  .map((lead) => lead.email)
  .filter((email): email is string => Boolean(email));

async function runSeed() {
  try {
    await connectDatabase();

    await LeadModel.collection.deleteMany({
        email: { $in: demoEmails },
    });

    await LeadModel.insertMany(demoLeads);

    console.log(
      `${demoLeads.length} leads fictícios inseridos para demonstração.`,
    );
  } catch (error) {
    console.error("Não foi possível inserir os dados fictícios.", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void runSeed();