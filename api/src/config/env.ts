import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  MONGODB_URI: z.string().min(1, "MONGODB_URI é obrigatória."),
});

export const env = envSchema.parse(process.env);