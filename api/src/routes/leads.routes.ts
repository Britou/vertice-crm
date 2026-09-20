import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { LeadModel, leadSources, leadStatuses } from "../models/Lead";

const leadFields = {
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres."),
  company: z
    .string()
    .trim()
    .min(2, "Empresa deve ter ao menos 2 caracteres."),
  email: z.union([z.email("E-mail inválido."), z.literal("")]).optional(),
  phone: z.string().trim().max(30).optional(),
  source: z.enum(leadSources),
  status: z.enum(leadStatuses),
  estimatedValue: z.number().nonnegative("O valor não pode ser negativo."),
};

const createLeadSchema = z.object({
  ...leadFields,
  source: z.enum(leadSources).default("OUTRO"),
  status: z.enum(leadStatuses).default("NOVO"),
  estimatedValue: z.number().nonnegative().default(0),
});

const updateLeadSchema = z
  .object(leadFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

export const leadsRouter = Router();

function validateLeadId(request: Request, response: Response) {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ message: "ID de lead inválido." });
    return false;
  }

  return true;
}

leadsRouter.get(
  "/",
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const leads = await LeadModel.find().sort({ createdAt: -1 });
      return response.status(200).json(leads);
    } catch (error) {
      return next(error);
    }
  },
);

leadsRouter.post(
  "/",
  async (request: Request, response: Response, next: NextFunction) => {
    const validation = createLeadSchema.safeParse(request.body);

    if (!validation.success) {
      return response.status(400).json({
        message: "Dados inválidos.",
        issues: validation.error.issues,
      });
    }

    try {
      const lead = await LeadModel.create(validation.data);
      return response.status(201).json(lead);
    } catch (error) {
      return next(error);
    }
  },
);

leadsRouter.patch(
  "/:id",
  async (request: Request, response: Response, next: NextFunction) => {
    if (!validateLeadId(request, response)) {
      return;
    }

    const validation = updateLeadSchema.safeParse(request.body);

    if (!validation.success) {
      return response.status(400).json({
        message: "Dados inválidos.",
        issues: validation.error.issues,
      });
    }

    try {
      const lead = await LeadModel.findByIdAndUpdate(
        request.params.id,
        validation.data,
        { new: true, runValidators: true },
      );

      if (!lead) {
        return response.status(404).json({ message: "Lead não encontrado." });
      }

      return response.status(200).json(lead);
    } catch (error) {
      return next(error);
    }
  },
);

leadsRouter.delete(
  "/:id",
  async (request: Request, response: Response, next: NextFunction) => {
    if (!validateLeadId(request, response)) {
      return;
    }

    try {
      const lead = await LeadModel.findByIdAndDelete(request.params.id);

      if (!lead) {
        return response.status(404).json({ message: "Lead não encontrado." });
      }

      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
);