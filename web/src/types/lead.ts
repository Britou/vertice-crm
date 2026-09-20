export const leadStatuses = [
  "NOVO",
  "CONTATO",
  "PROPOSTA",
  "GANHO",
  "PERDIDO",
] as const;

export const leadSources = [
  "SITE",
  "INDICACAO",
  "INSTAGRAM",
  "OUTRO",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type LeadSource = (typeof leadSources)[number];

export interface Lead {
  _id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  estimatedValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  estimatedValue: number;
}