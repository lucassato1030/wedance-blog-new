import { d as defineEventHandler, e as getMethod, f as createError, a as getRouterParam, P as PrismaClient, r as readBody } from '../../../_/nitro.mjs';
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
const _id_ = defineEventHandler(async (event) => {
  const method = getMethod(event);
  switch (method) {
    case "GET":
      return handleGet(event);
    case "PUT":
      return handlePut(event);
    case "DELETE":
      return handleDelete(event);
    default:
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed"
      });
  }
});
async function handleGet(event) {
  const id = getRouterParam(event, "id");
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { posts: true }
    });
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }
    return user;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    if (error.statusCode === 404) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user",
      data: (error == null ? void 0 : error.message) || "Unknown error"
    });
  }
}
async function handlePut(event) {
  var _a, _b;
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  try {
    const exists = await prisma.user.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!exists) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: body.name !== void 0 ? body.name : void 0,
        email: body.email !== void 0 ? body.email : void 0
      },
      include: {
        posts: true
      }
    });
    return user;
  } catch (error) {
    if (error.code === "P2002" && ((_b = (_a = error.meta) == null ? void 0 : _a.target) == null ? void 0 : _b.includes("email"))) {
      throw createError({
        statusCode: 409,
        statusMessage: "A user with this email already exists"
      });
    }
    console.error(`Error updating user ${id}:`, error);
    if (error.statusCode === 404) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update user",
      data: (error == null ? void 0 : error.message) || "Unknown error"
    });
  }
}
async function handleDelete(event) {
  const id = getRouterParam(event, "id");
  try {
    const exists = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true
          },
          take: 1
          // Only need to check if any posts exist
        }
      }
    });
    if (!exists) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }
    if (exists.posts.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot delete user with related posts. Delete the posts first."
      });
    }
    await prisma.user.delete({
      where: { id }
    });
    return {
      success: true,
      message: "User deleted successfully"
    };
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    if (error.statusCode === 404) {
      throw error;
    }
    if (error.code === "P2003") {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot delete user with related posts. Delete the posts first."
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete user",
      data: (error == null ? void 0 : error.message) || "Unknown error"
    });
  }
}

export { _id_ as default };
//# sourceMappingURL=_id_.mjs.map
