// Ensure .env is loaded when this config file is imported by the Prisma CLI.
// Prisma may import this file before the environment is automatically loaded,
// so load it explicitly here.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
