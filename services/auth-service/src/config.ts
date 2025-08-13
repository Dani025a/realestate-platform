import { z } from "zod";

export const ConfigSchema = z.object({
  PORT: z.coerce.number().default(3002),
  AUTH_DATABASE_URL: z.string().default("postgresql://auth:authpass@localhost:5433/authdb"),
  JWT_ISSUER: z.string().default("auth-service"),
  JWT_AUDIENCE: z.string().default("realestate-platform")
});

export type AppConfig = z.infer<typeof ConfigSchema>;
export const cfg: AppConfig = ConfigSchema.parse(process.env);
