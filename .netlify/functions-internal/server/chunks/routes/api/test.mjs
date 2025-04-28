import { d as defineEventHandler, P as PrismaClient } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:module';
import 'node:process';
import 'node:url';
import 'node:child_process';
import 'node:fs/promises';
import 'node:os';
import 'node:util';
import 'node:async_hooks';
import '@trpc/server';
import 'zod';

const test = defineEventHandler(async (event) => {
  try {
    const prisma = new PrismaClient();
    const result = await prisma.$queryRaw`SELECT 1 as "connectionTest"`;
    await prisma.$disconnect();
    return {
      status: "success",
      message: "Database connection successful!",
      details: {
        connection: "Supabase PostgreSQL",
        result
      }
    };
  } catch (error) {
    console.error("Database connection test failed:", error);
    return {
      status: "error",
      message: "Failed to connect to the database",
      error: (error == null ? void 0 : error.message) || "Unknown error",
      hint: "Check your DATABASE_URL in .env file and make sure Supabase is accessible"
    };
  }
});

export { test as default };
//# sourceMappingURL=test.mjs.map
