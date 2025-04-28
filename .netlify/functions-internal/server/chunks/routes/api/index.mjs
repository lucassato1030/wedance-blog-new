import { d as defineEventHandler, P as PrismaClient, r as readBody } from '../../_/nitro.mjs';
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
  const method = event.node.req.method;
  if (method === "GET") {
    try {
      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        status: "error",
        message: "Failed to fetch posts",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  if (method === "POST") {
    try {
      const body = await readBody(event);
      if (!body.title) {
        return {
          status: "error",
          message: "Title is required"
        };
      }
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return {
          status: "error",
          message: "No users available to be set as author"
        };
      }
      const post = await prisma.post.create({
        data: {
          title: body.title,
          content: body.content || "",
          published: body.published || false,
          authorId: firstUser.id
        }
      });
      return {
        status: "success",
        post
      };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        status: "error",
        message: "Failed to create post",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});

export { index as default };
//# sourceMappingURL=index.mjs.map
