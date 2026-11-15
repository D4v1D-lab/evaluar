type Env = {
  BASE_URL: string;
  PROCESS_URL: string;
  HEADLESS: boolean;
};

export const env: Env = {
  BASE_URL: process.env.BASE_URL ?? 'https://candidato.evaluar.com',
  PROCESS_URL:
    process.env.PROCESS_URL ??
    'https://candidato.evaluar.com/auth/autoregister/controlled/572ff080-da01-4a64-9858-897f5a8d1be9',
  HEADLESS: process.env.HEADLESS !== 'false',
};
