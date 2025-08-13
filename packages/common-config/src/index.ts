import * as dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  RABBITMQ_URL: z.string().default("amqp://guest:guest@localhost:5672"),
  PORT: z.coerce.number().default(3001)
});

export type Env = z.infer<typeof EnvSchema>;
export const env: Env = EnvSchema.parse(process.env);
