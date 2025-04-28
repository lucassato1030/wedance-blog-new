import { createNuxtApiHandler } from 'trpc-nuxt';
import { c as createContext, b as appRouter } from '../../../_/nitro.mjs';
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

const _trpc_ = createNuxtApiHandler({
  router: appRouter,
  createContext,
  onError({ error, path }) {
    console.error(`Error in tRPC handler for ${path}:`, error);
  }
});

export { _trpc_ as default };
//# sourceMappingURL=_trpc_.mjs.map
