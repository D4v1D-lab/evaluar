type Env = {
  BASE_URL: string;
  PROCESS_ID: string;
  PROCESS_URL: string;
  PROCESS_PAGE_URL: string;
  HEADLESS: boolean;
};

const BASE_URL = process.env.BASE_URL ?? 'https://candidato.evaluar.com';
const PROCESS_ID =
  process.env.PROCESS_ID ?? '572ff080-da01-4a64-9858-897f5a8d1be9';

export const env: Env = {
  BASE_URL,
  PROCESS_ID,
  PROCESS_URL:
    process.env.PROCESS_URL ?? `${BASE_URL}/auth/autoregister/controlled/${PROCESS_ID}`,
  PROCESS_PAGE_URL: `${BASE_URL}/es/process/${PROCESS_ID}`,
  HEADLESS: process.env.HEADLESS !== 'false',
};
