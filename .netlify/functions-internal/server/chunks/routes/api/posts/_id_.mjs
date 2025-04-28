import { d as defineEventHandler, P as PrismaClient, a as getRouterParam, r as readBody } from '../../../_/nitro.mjs';
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
  const method = event.node.req.method;
  const id = getRouterParam(event, "id");
  if (!id) {
    return {
      status: "error",
      message: "Post ID is required"
    };
  }
  if (method === "GET") {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
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
      if (!post) {
        return {
          status: "error",
          message: "Post not found"
        };
      }
      return post;
    } catch (error) {
      console.error("Error fetching post:", error);
      return {
        status: "error",
        message: "Failed to fetch post",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  if (method === "PUT") {
    try {
      const body = await readBody(event);
      const existingPost = await prisma.post.findUnique({
        where: { id }
      });
      if (!existingPost) {
        return {
          status: "error",
          message: "Post not found"
        };
      }
      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          title: body.title !== void 0 ? body.title : existingPost.title,
          content: body.content !== void 0 ? body.content : existingPost.content,
          published: body.published !== void 0 ? body.published : existingPost.published
        }
      });
      return {
        status: "success",
        post: updatedPost
      };
    } catch (error) {
      console.error("Error updating post:", error);
      return {
        status: "error",
        message: "Failed to update post",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  if (method === "DELETE") {
    try {
      const existingPost = await prisma.post.findUnique({
        where: { id }
      });
      if (!existingPost) {
        return {
          status: "error",
          message: "Post not found"
        };
      }
      await prisma.post.delete({
        where: { id }
      });
      return {
        status: "success",
        message: "Post deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting post:", error);
      return {
        status: "error",
        message: "Failed to delete post",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});

export { _id_ as default };
//# sourceMappingURL=_id_.mjs.map
