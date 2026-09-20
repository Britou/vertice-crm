import { model, Schema } from "mongoose";

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

export interface Lead {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  source: (typeof leadSources)[number];
  status: (typeof leadStatuses)[number];
  estimatedValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<Lead>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: {
      type: String,
      enum: leadSources,
      default: "OUTRO",
      required: true,
    },
    status: {
      type: String,
      enum: leadStatuses,
      default: "NOVO",
      required: true,
    },
    estimatedValue: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
  },
  { timestamps: true },
);

export const LeadModel = model<Lead>("Lead", leadSchema);