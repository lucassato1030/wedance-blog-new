import { d as defineEventHandler, P as PrismaClient, f as createError, r as readBody } from '../../_/nitro.mjs';
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

const prisma = new PrismaClient();
const index = defineEventHandler(async (event) => {
  var _a, _b;
  const method = event.method;
  console.log(`Handling ${method} request to /api/users`);
  if (method === "GET") {
    try {
      console.log("Processing GET request for users");
      const users = await prisma.user.findMany({
        include: {
          posts: true
        }
      });
      console.log(`Found ${users.length} users`);
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch users",
        data: (error == null ? void 0 : error.message) || "Unknown error"
      });
    }
  }
  if (method === "POST") {
    try {
      const body = await readBody(event);
      if (!body.email) {
        console.error("Email is required but not provided");
        throw createError({
          statusCode: 400,
          statusMessage: "Email is required"
        });
      }
      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name || null
        },
        include: {
          posts: true
        }
      });
      console.log("Created user:", user);
      return user;
    } catch (error) {
      if (error.code === "P2002" && ((_b = (_a = error.meta) == null ? void 0 : _a.target) == null ? void 0 : _b.includes("email"))) {
        console.error("Duplicate email error:", error);
        throw createError({
          statusCode: 409,
          statusMessage: "A user with this email already exists"
        });
      }
      console.error("Error creating user:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create user",
        data: (error == null ? void 0 : error.message) || "Unknown error"
      });
    }
  }
  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed",
    data: `Method ${method} is not supported`
  });
});

export { index as default };
//# sourceMappingURL=index2.mjs.map
