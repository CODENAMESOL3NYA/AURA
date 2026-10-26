import 'dotenv/config'; 
import { z } from 'zod'; 
const schema = z.object({ 
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'), 
    PORT: z.coerce.number().int().default(5000), 
    DATABASE_URL: z.string().min(1), 
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'), 
    ID_ENC_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, 'ID_ENC_KEY must be 64 hex chars (32 bytes)'), 
    ID_HASH_PEPPER: z.string().min(16), 
    OTP_PEPPER: z.string().min(16), 
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000,capacitor://localhost,https://localhost').transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)), 
    SMS_PROVIDER: z.enum(['console', 'twilio']).default('console'), 
}); export const env = schema.parse(process.env);