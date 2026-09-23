// prisma.config.ts

import env from '../../../config/env.js';
import { defineConfig } from "prisma/config";


export default defineConfig({
  schema: "./db",
  migrations: {
    path: "./migrations",
    seed: 'tsx ./seed/seed.ts',
  },
  datasource: {
    url: env.publicServiceDatabaseUrl,
  },
});