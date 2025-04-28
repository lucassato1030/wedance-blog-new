import { shallowReactive, reactive, effectScope, getCurrentScope, hasInjectionContext, getCurrentInstance, inject, toRef, computed, defineComponent, h, isReadonly, isRef, isShallow, isReactive, toRaw, createVNode, resolveDynamicComponent, mergeProps, withCtx, renderSlot, unref, createTextVNode, toDisplayString, createBlock, openBlock, ref, watch, withModifiers, withDirectives, vModelCheckbox, useSSRContext, defineAsyncComponent, provide, onErrorCaptured, onServerPrefetch, createApp } from 'vue';
import { q as createHooks, s as getContext, t as hasProtocol, v as joinURL, w as withQuery, x as sanitizeStatusCode, y as isScriptProtocol, f as createError$1, z as toRouteMatcher, A as createRouter, B as defu, C as isEqual, D as stringifyParsedURL, E as stringifyQuery, F as parseQuery } from '../_/nitro.mjs';
import { ssrRenderVNode, ssrRenderSlot, ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrGetDynamicModelProps, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderSuspense } from 'vue/server-renderer';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';

const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";

function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  var _a;
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.16.2";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...((_a = options.ssrContext) == null ? void 0 : _a.payload) || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin) {
  if (plugin.hooks) {
    nuxtApp.hooks.addHooks(plugin.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin === "function") {
    const { provide } = await nuxtApp.runWithContext(() => plugin(nuxtApp)) || {};
    if (provide && typeof provide === "object") {
      for (const key in provide) {
        nuxtApp.provide(key, provide[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins) {
  var _a, _b, _c, _d;
  const resolvedPlugins = [];
  const unresolvedPlugins = [];
  const parallels = [];
  const errors = [];
  let promiseDepth = 0;
  async function executePlugin(plugin) {
    var _a2;
    const unresolvedPluginsForThisPlugin = ((_a2 = plugin.dependsOn) == null ? void 0 : _a2.filter((name) => plugins.some((p) => p._name === name) && !resolvedPlugins.includes(name))) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin).then(async () => {
        if (plugin._name) {
          resolvedPlugins.push(plugin._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin._name)) {
              dependsOn.delete(plugin._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      });
      if (plugin.parallel) {
        parallels.push(promise.catch((e) => errors.push(e)));
      } else {
        await promise;
      }
    }
  }
  for (const plugin of plugins) {
    if (((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext) && ((_b = plugin.env) == null ? void 0 : _b.islands) === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin);
  }
  for (const plugin of plugins) {
    if (((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) && ((_d = plugin.env) == null ? void 0 : _d.islands) === false) {
      continue;
    }
    await executePlugin(plugin);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin) {
  if (typeof plugin === "function") {
    return plugin;
  }
  const _name = plugin._name || plugin.name;
  delete plugin.name;
  return Object.assign(plugin.setup || (() => {
  }), plugin, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  }
  nuxtAppInstance || (nuxtAppInstance = getNuxtAppCtx(id).tryUse());
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}

const PageRouteSymbol = Symbol("route");

const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to, options) => {
  to || (to = "/");
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = (options == null ? void 0 : options.external) || isExternalHost;
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL(useRuntimeConfig().app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options == null ? void 0 : options.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}

const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const nuxtApp = useNuxtApp();
    const error2 = useError();
    if (false) ;
    error2.value || (error2.value = nuxtError);
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};

const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});

async function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  {
    useNuxtApp().ssrContext._preloadManifest = true;
    const _routeRulesMatcher = toRouteMatcher(
      createRouter({ routes: useRuntimeConfig().nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
  }
}

const manifest_45route_45rule = defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});

const globalMiddleware = [
  manifest_45route_45rule
];

function getRouteFromPath(fullPath) {
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = new URL(fullPath.toString(), "http://localhost");
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: {},
    name: void 0,
    matched: [],
    redirectedFrom: void 0,
    meta: {},
    href: fullPath
  };
}
const router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw = defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      "error": []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
    };
    useRuntimeConfig().app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    async function handleNavigation(url, replace) {
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (result === false || result instanceof Error) {
            return;
          }
          if (typeof result === "string" && result.length) {
            return handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
        }
        Object.assign(route, to);
        if (false) ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const currentRoute = computed(() => route);
    const router = {
      currentRoute,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url),
      replace: (url) => handleNavigation(url),
      back: () => (void 0).history.go(-1),
      go: (delta) => (void 0).history.go(delta),
      forward: () => (void 0).history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          var _a;
          const route2 = router.resolve(props.to);
          return props.custom ? (_a = slots.default) == null ? void 0 : _a.call(slots, { href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    }));
    nuxtApp._route = route;
    nuxtApp._middleware || (nuxtApp._middleware = {
      global: [],
      named: {}
    });
    const initialLayout = nuxtApp.payload.state._layout;
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        var _a;
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout;
        }
        nuxtApp._processingMiddleware = true;
        if (!((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext)) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          {
            const routeRules = await nuxtApp.runWithContext(() => getRouteRules({ path: to.path }));
            if (routeRules.appMiddleware) {
              for (const key in routeRules.appMiddleware) {
                const guard = nuxtApp._middleware.named[key];
                if (!guard) {
                  return;
                }
                if (routeRules.appMiddleware[key]) {
                  middlewareEntries.add(guard);
                } else {
                  middlewareEntries.delete(guard);
                }
              }
            }
          }
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  statusCode: 404,
                  statusMessage: `Page Not Found: ${initialURL}`,
                  data: {
                    path: initialURL
                  }
                });
                delete nuxtApp._processingMiddleware;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result === true) {
              continue;
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});

function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}

const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});

const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = defineNuxtPlugin({
  name: "nuxt:global-components"
});

const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4
];

const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "button",
  __ssrInlineRender: true,
  props: {
    tag: {
      type: String,
      default: "button"
    },
    variant: {
      type: String,
      default: "default"
    },
    size: {
      type: String,
      default: "default"
    },
    className: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const buttonVariants = cva(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
      {
        variants: {
          variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "underline-offset-4 hover:underline text-primary"
          },
          size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 px-3",
            lg: "h-11 px-8",
            icon: "h-10 w-10"
          }
        },
        defaultVariants: {
          variant: "default",
          size: "default"
        }
      }
    );
    const props = __props;
    const variants = computed(() => {
      return (options) => {
        return buttonVariants({
          variant: options.variant,
          size: options.size,
          class: options.className
        });
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.tag), mergeProps({
        class: ["inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background", variants.value({ variant: __props.variant, size: __props.size, className: __props.className })]
      }, props, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const _sfc_main$c = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "card",
  __ssrInlineRender: true,
  props: {
    class: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: unref(cn)("rounded-lg border bg-card text-card-foreground shadow-sm", props.class)
      }, _ctx.$attrs, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});

const _sfc_main$b = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "card-header",
  __ssrInlineRender: true,
  props: {
    class: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: unref(cn)("flex flex-col space-y-1.5 p-6", props.class)
      }, _ctx.$attrs, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});

const _sfc_main$a = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "card-title",
  __ssrInlineRender: true,
  props: {
    class: {},
    as: { default: "h3" }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(_ctx.as), mergeProps({
        class: unref(cn)("text-2xl font-semibold leading-none tracking-tight", props.class)
      }, _ctx.$attrs, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});

const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "BlogList",
  __ssrInlineRender: true,
  props: {
    posts: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectedPostId: {
      type: String,
      default: ""
    }
  },
  emits: ["select-post", "create-post"],
  setup(__props) {
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(date);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full" }, _attrs))}><div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold">Blog Posts</h2>`);
      _push(ssrRenderComponent(_sfc_main$d, {
        onClick: ($event) => _ctx.$emit("create-post"),
        size: "sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` New Post `);
          } else {
            return [
              createTextVNode(" New Post ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex-1">`);
      if (__props.loading) {
        _push(`<div class="py-8 text-center text-muted-foreground"> Loading posts... </div>`);
      } else if (!__props.posts || __props.posts.length === 0) {
        _push(`<div class="py-8 text-center text-muted-foreground"> No posts found </div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(__props.posts, (post) => {
          _push(ssrRenderComponent(_sfc_main$c, {
            key: post.id,
            class: ["cursor-pointer transition", { "border-primary": __props.selectedPostId === post.id }],
            onClick: ($event) => _ctx.$emit("select-post", post.id)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_sfc_main$b, { class: "pb-2" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_sfc_main$a, { class: "text-lg" }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`${ssrInterpolate(post.title)}`);
                          } else {
                            return [
                              createTextVNode(toDisplayString(post.title), 1)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                      _push3(`<div class="flex justify-between text-sm text-muted-foreground pt-2"${_scopeId2}><span${_scopeId2}>${ssrInterpolate(formatDate(post.createdAt))}</span>`);
                      if (post.published) {
                        _push3(`<span class="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"${_scopeId2}> Published </span>`);
                      } else {
                        _push3(`<span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"${_scopeId2}> Draft </span>`);
                      }
                      _push3(`</div>`);
                    } else {
                      return [
                        createVNode(_sfc_main$a, { class: "text-lg" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(post.title), 1)
                          ]),
                          _: 2
                        }, 1024),
                        createVNode("div", { class: "flex justify-between text-sm text-muted-foreground pt-2" }, [
                          createVNode("span", null, toDisplayString(formatDate(post.createdAt)), 1),
                          post.published ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"
                          }, " Published ")) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                          }, " Draft "))
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_sfc_main$b, { class: "pb-2" }, {
                    default: withCtx(() => [
                      createVNode(_sfc_main$a, { class: "text-lg" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(post.title), 1)
                        ]),
                        _: 2
                      }, 1024),
                      createVNode("div", { class: "flex justify-between text-sm text-muted-foreground pt-2" }, [
                        createVNode("span", null, toDisplayString(formatDate(post.createdAt)), 1),
                        post.published ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"
                        }, " Published ")) : (openBlock(), createBlock("span", {
                          key: 1,
                          class: "px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                        }, " Draft "))
                      ])
                    ]),
                    _: 2
                  }, 1024)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});

const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "card-description",
  __ssrInlineRender: true,
  props: {
    class: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<p${ssrRenderAttrs(mergeProps({
        class: unref(cn)("text-sm text-muted-foreground", props.class)
      }, _ctx.$attrs, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</p>`);
    };
  }
});

const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "card-content",
  __ssrInlineRender: true,
  props: {
    class: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: unref(cn)("p-6 pt-0", props.class)
      }, _ctx.$attrs, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});

const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "input",
  __ssrInlineRender: true,
  props: {
    class: {},
    type: {},
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const value = computed({
      get: () => props.modelValue,
      set: (value2) => emit("update:modelValue", value2)
    });
    return (_ctx, _push, _parent, _attrs) => {
      let _temp0;
      _push(`<input${ssrRenderAttrs((_temp0 = mergeProps({
        type: _ctx.type || "text",
        class: ["flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", unref(cn)(props.class)]
      }, _attrs), mergeProps(_temp0, ssrGetDynamicModelProps(_temp0, value.value))))}>`);
    };
  }
});

const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "textarea",
  __ssrInlineRender: true,
  props: {
    class: {},
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const value = computed({
      get: () => props.modelValue,
      set: (value2) => emit("update:modelValue", value2)
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<textarea${ssrRenderAttrs(mergeProps({
        class: ["flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", unref(cn)(props.class)]
      }, _attrs), "textarea")}>${ssrInterpolate(value.value)}</textarea>`);
    };
  }
});

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "BlogContent",
  __ssrInlineRender: true,
  props: {
    post: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    saving: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update-post", "delete-post"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isEditing = ref(false);
    const editForm = ref({
      title: "",
      content: "",
      published: false
    });
    watch(() => props.post, (newPost) => {
      if (newPost) {
        editForm.value = {
          title: newPost.title || "",
          content: newPost.content || "",
          published: newPost.published || false
        };
      }
      isEditing.value = false;
    }, { immediate: true });
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    };
    const formattedContent = computed(() => {
      if (!props.post || !props.post.content) return "";
      return props.post.content.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
    });
    const startEditing = () => {
      isEditing.value = true;
    };
    const savePost = () => {
      var _a;
      if (!editForm.value.title) return;
      emit("update-post", {
        id: (_a = props.post) == null ? void 0 : _a.id,
        title: editForm.value.title,
        content: editForm.value.content,
        published: editForm.value.published
      });
      isEditing.value = false;
    };
    const cancelEdit = () => {
      if (props.post) {
        editForm.value = {
          title: props.post.title || "",
          content: props.post.content || "",
          published: props.post.published || false
        };
      }
      isEditing.value = false;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full" }, _attrs))}>`);
      if (!__props.post) {
        _push(`<div class="flex items-center justify-center h-60 text-muted-foreground"> Select a post to view </div>`);
      } else {
        _push(`<!--[-->`);
        if (!isEditing.value) {
          _push(`<div>`);
          if (__props.loading) {
            _push(`<div class="py-8 text-center text-gray-500"> Loading post... </div>`);
          } else if (!__props.post) {
            _push(`<div class="py-8 text-center text-gray-500"> Select a post from the list or create a new one </div>`);
          } else {
            _push(`<div>`);
            _push(ssrRenderComponent(_sfc_main$c, { class: "mb-8" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_sfc_main$b, null, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_sfc_main$a, null, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`${ssrInterpolate(__props.post.title)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(__props.post.title), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent3, _scopeId2));
                        _push3(`<div class="flex items-center gap-4 text-sm text-muted-foreground mt-2"${_scopeId2}><span${_scopeId2}>${ssrInterpolate(formatDate(__props.post.createdAt))}</span>`);
                        if (__props.post.published) {
                          _push3(`<span class="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"${_scopeId2}> Published </span>`);
                        } else {
                          _push3(`<span class="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"${_scopeId2}> Draft </span>`);
                        }
                        _push3(`</div>`);
                      } else {
                        return [
                          createVNode(_sfc_main$a, null, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(__props.post.title), 1)
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "flex items-center gap-4 text-sm text-muted-foreground mt-2" }, [
                            createVNode("span", null, toDisplayString(formatDate(__props.post.createdAt)), 1),
                            __props.post.published ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"
                            }, " Published ")) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                            }, " Draft "))
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                  _push2(ssrRenderComponent(_sfc_main$7, null, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`<div class="prose max-w-none"${_scopeId2}><div${_scopeId2}>${formattedContent.value ?? ""}</div></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "prose max-w-none" }, [
                            createVNode("div", { innerHTML: formattedContent.value }, null, 8, ["innerHTML"])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_sfc_main$b, null, {
                      default: withCtx(() => [
                        createVNode(_sfc_main$a, null, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(__props.post.title), 1)
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "flex items-center gap-4 text-sm text-muted-foreground mt-2" }, [
                          createVNode("span", null, toDisplayString(formatDate(__props.post.createdAt)), 1),
                          __props.post.published ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"
                          }, " Published ")) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                          }, " Draft "))
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(_sfc_main$7, null, {
                      default: withCtx(() => [
                        createVNode("div", { class: "prose max-w-none" }, [
                          createVNode("div", { innerHTML: formattedContent.value }, null, 8, ["innerHTML"])
                        ])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<div>`);
          _push(ssrRenderComponent(_sfc_main$c, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_sfc_main$b, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_sfc_main$a, null, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`Edit Post`);
                          } else {
                            return [
                              createTextVNode("Edit Post")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_sfc_main$8, null, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`Make changes to your blog post`);
                          } else {
                            return [
                              createTextVNode("Make changes to your blog post")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_sfc_main$a, null, {
                          default: withCtx(() => [
                            createTextVNode("Edit Post")
                          ]),
                          _: 1
                        }),
                        createVNode(_sfc_main$8, null, {
                          default: withCtx(() => [
                            createTextVNode("Make changes to your blog post")
                          ]),
                          _: 1
                        })
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_sfc_main$7, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<form class="space-y-6"${_scopeId2}><div${_scopeId2}><label class="block mb-1 text-sm font-medium"${_scopeId2}>Title:</label>`);
                      _push3(ssrRenderComponent(_sfc_main$6, {
                        modelValue: editForm.value.title,
                        "onUpdate:modelValue": ($event) => editForm.value.title = $event,
                        required: "",
                        disabled: __props.saving
                      }, null, _parent3, _scopeId2));
                      _push3(`</div><div${_scopeId2}><label class="block mb-1 text-sm font-medium"${_scopeId2}>Content:</label>`);
                      _push3(ssrRenderComponent(_sfc_main$5, {
                        modelValue: editForm.value.content,
                        "onUpdate:modelValue": ($event) => editForm.value.content = $event,
                        class: "h-80 font-mono",
                        disabled: __props.saving
                      }, null, _parent3, _scopeId2));
                      _push3(`</div><div class="flex items-center gap-3"${_scopeId2}><label class="flex items-center gap-2"${_scopeId2}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(editForm.value.published) ? ssrLooseContain(editForm.value.published, null) : editForm.value.published) ? " checked" : ""}${ssrIncludeBooleanAttr(__props.saving) ? " disabled" : ""}${_scopeId2}><span${_scopeId2}>Publish this post</span></label></div></form>`);
                    } else {
                      return [
                        createVNode("form", {
                          onSubmit: withModifiers(savePost, ["prevent"]),
                          class: "space-y-6"
                        }, [
                          createVNode("div", null, [
                            createVNode("label", { class: "block mb-1 text-sm font-medium" }, "Title:"),
                            createVNode(_sfc_main$6, {
                              modelValue: editForm.value.title,
                              "onUpdate:modelValue": ($event) => editForm.value.title = $event,
                              required: "",
                              disabled: __props.saving
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
                          ]),
                          createVNode("div", null, [
                            createVNode("label", { class: "block mb-1 text-sm font-medium" }, "Content:"),
                            createVNode(_sfc_main$5, {
                              modelValue: editForm.value.content,
                              "onUpdate:modelValue": ($event) => editForm.value.content = $event,
                              class: "h-80 font-mono",
                              disabled: __props.saving
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
                          ]),
                          createVNode("div", { class: "flex items-center gap-3" }, [
                            createVNode("label", { class: "flex items-center gap-2" }, [
                              withDirectives(createVNode("input", {
                                type: "checkbox",
                                "onUpdate:modelValue": ($event) => editForm.value.published = $event,
                                disabled: __props.saving
                              }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                                [vModelCheckbox, editForm.value.published]
                              ]),
                              createVNode("span", null, "Publish this post")
                            ])
                          ])
                        ], 32)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_sfc_main$b, null, {
                    default: withCtx(() => [
                      createVNode(_sfc_main$a, null, {
                        default: withCtx(() => [
                          createTextVNode("Edit Post")
                        ]),
                        _: 1
                      }),
                      createVNode(_sfc_main$8, null, {
                        default: withCtx(() => [
                          createTextVNode("Make changes to your blog post")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(_sfc_main$7, null, {
                    default: withCtx(() => [
                      createVNode("form", {
                        onSubmit: withModifiers(savePost, ["prevent"]),
                        class: "space-y-6"
                      }, [
                        createVNode("div", null, [
                          createVNode("label", { class: "block mb-1 text-sm font-medium" }, "Title:"),
                          createVNode(_sfc_main$6, {
                            modelValue: editForm.value.title,
                            "onUpdate:modelValue": ($event) => editForm.value.title = $event,
                            required: "",
                            disabled: __props.saving
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
                        ]),
                        createVNode("div", null, [
                          createVNode("label", { class: "block mb-1 text-sm font-medium" }, "Content:"),
                          createVNode(_sfc_main$5, {
                            modelValue: editForm.value.content,
                            "onUpdate:modelValue": ($event) => editForm.value.content = $event,
                            class: "h-80 font-mono",
                            disabled: __props.saving
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
                        ]),
                        createVNode("div", { class: "flex items-center gap-3" }, [
                          createVNode("label", { class: "flex items-center gap-2" }, [
                            withDirectives(createVNode("input", {
                              type: "checkbox",
                              "onUpdate:modelValue": ($event) => editForm.value.published = $event,
                              disabled: __props.saving
                            }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                              [vModelCheckbox, editForm.value.published]
                            ]),
                            createVNode("span", null, "Publish this post")
                          ])
                        ])
                      ], 32)
                    ]),
                    _: 1
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        }
        _push(`<div class="border-t pt-4 mt-4 flex items-center justify-between"><div>`);
        if (__props.post && !isEditing.value) {
          _push(ssrRenderComponent(_sfc_main$d, {
            onClick: startEditing,
            variant: "default"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Edit Post `);
              } else {
                return [
                  createTextVNode(" Edit Post ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (isEditing.value) {
          _push(`<div class="flex items-center gap-3">`);
          _push(ssrRenderComponent(_sfc_main$d, {
            onClick: savePost,
            variant: "default",
            disabled: __props.saving
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(__props.saving ? "Saving..." : "Save Post")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(__props.saving ? "Saving..." : "Save Post"), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_sfc_main$d, {
            onClick: cancelEdit,
            variant: "outline",
            disabled: __props.saving
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Cancel `);
              } else {
                return [
                  createTextVNode(" Cancel ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (__props.post && !isEditing.value) {
          _push(`<div>`);
          _push(ssrRenderComponent(_sfc_main$d, {
            onClick: ($event) => _ctx.$emit("delete-post", __props.post.id),
            variant: "destructive",
            disabled: __props.saving
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Delete `);
              } else {
                return [
                  createTextVNode(" Delete ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "card-footer",
  __ssrInlineRender: true,
  props: {
    class: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: unref(cn)("flex items-center p-6 pt-0", props.class)
      }, _ctx.$attrs, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});

const _sfc_main$2 = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const posts = ref([]);
    const postLoading = ref(false);
    const currentPostLoading = ref(false);
    const postSaving = ref(false);
    const selectedPostId = ref("");
    const currentPost = ref(null);
    const showDeleteModal = ref(false);
    const postToDelete = ref(null);
    const loadPosts = async () => {
      try {
        postLoading.value = true;
        const response = await fetch("/api/posts");
        const data = await response.json();
        if (data.status === "error") {
          throw new Error(data.message);
        }
        posts.value = data || [];
        if (posts.value.length > 0 && !selectedPostId.value) {
          selectPost(posts.value[0].id);
        }
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        postLoading.value = false;
      }
    };
    const loadPost = async (id) => {
      if (!id) return;
      try {
        currentPostLoading.value = true;
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();
        if (data.status === "error") {
          throw new Error(data.message);
        }
        currentPost.value = data;
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        currentPostLoading.value = false;
      }
    };
    const selectPost = (id) => {
      selectedPostId.value = id;
      loadPost(id);
    };
    const createNewPost = async () => {
      try {
        postSaving.value = true;
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: "New Blog Post",
            content: "Start writing your blog post here...",
            published: false
          })
        });
        const result = await response.json();
        if (result.status === "error") {
          throw new Error(result.message);
        }
        await loadPosts();
        selectPost(result.post.id);
      } catch (error) {
        console.error("Error creating post:", error);
      } finally {
        postSaving.value = false;
      }
    };
    const updatePost = async (updatedPost) => {
      try {
        postSaving.value = true;
        const response = await fetch(`/api/posts/${updatedPost.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedPost)
        });
        const result = await response.json();
        if (result.status === "error") {
          throw new Error(result.message);
        }
        await loadPosts();
        await loadPost(updatedPost.id);
      } catch (error) {
        console.error("Error updating post:", error);
      } finally {
        postSaving.value = false;
      }
    };
    const confirmDeletePost = (id) => {
      const post = posts.value.find((p) => p.id === id);
      postToDelete.value = post;
      showDeleteModal.value = true;
    };
    const deletePostConfirmed = async () => {
      try {
        postSaving.value = true;
        const response = await fetch(`/api/posts/${postToDelete.value.id}`, {
          method: "DELETE"
        });
        const result = await response.json();
        if (result.status === "error") {
          throw new Error(result.message);
        }
        showDeleteModal.value = false;
        postToDelete.value = null;
        currentPost.value = null;
        selectedPostId.value = "";
        await loadPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
      } finally {
        postSaving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900" }, _attrs))}><header class="border-b bg-white dark:bg-gray-800 py-4"><div class="container mx-auto px-6 max-w-6xl"><h1 class="text-3xl font-bold">Nuxt, Vue.shadcn, TailwindCSS, Supabase, Prisma, tRPC Testing</h1></div></header><main class="flex-1 container mx-auto px-6 py-6 max-w-6xl">`);
      _push(ssrRenderComponent(_sfc_main$c, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$7, { class: "p-6 h-full" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full"${_scopeId2}><div class="md:col-span-1 border-r pr-4 h-full flex flex-col"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_sfc_main$9, {
                    posts: posts.value,
                    loading: postLoading.value,
                    selectedPostId: selectedPostId.value,
                    onSelectPost: selectPost,
                    onCreatePost: createNewPost
                  }, null, _parent3, _scopeId2));
                  _push3(`</div><div class="md:col-span-2 pl-4 h-full flex flex-col"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_sfc_main$4, {
                    post: currentPost.value,
                    loading: currentPostLoading.value,
                    saving: postSaving.value,
                    onUpdatePost: updatePost,
                    onDeletePost: confirmDeletePost
                  }, null, _parent3, _scopeId2));
                  _push3(`</div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-6 h-full" }, [
                      createVNode("div", { class: "md:col-span-1 border-r pr-4 h-full flex flex-col" }, [
                        createVNode(_sfc_main$9, {
                          posts: posts.value,
                          loading: postLoading.value,
                          selectedPostId: selectedPostId.value,
                          onSelectPost: selectPost,
                          onCreatePost: createNewPost
                        }, null, 8, ["posts", "loading", "selectedPostId"])
                      ]),
                      createVNode("div", { class: "md:col-span-2 pl-4 h-full flex flex-col" }, [
                        createVNode(_sfc_main$4, {
                          post: currentPost.value,
                          loading: currentPostLoading.value,
                          saving: postSaving.value,
                          onUpdatePost: updatePost,
                          onDeletePost: confirmDeletePost
                        }, null, 8, ["post", "loading", "saving"])
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_sfc_main$7, { class: "p-6 h-full" }, {
                default: withCtx(() => [
                  createVNode("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-6 h-full" }, [
                    createVNode("div", { class: "md:col-span-1 border-r pr-4 h-full flex flex-col" }, [
                      createVNode(_sfc_main$9, {
                        posts: posts.value,
                        loading: postLoading.value,
                        selectedPostId: selectedPostId.value,
                        onSelectPost: selectPost,
                        onCreatePost: createNewPost
                      }, null, 8, ["posts", "loading", "selectedPostId"])
                    ]),
                    createVNode("div", { class: "md:col-span-2 pl-4 h-full flex flex-col" }, [
                      createVNode(_sfc_main$4, {
                        post: currentPost.value,
                        loading: currentPostLoading.value,
                        saving: postSaving.value,
                        onUpdatePost: updatePost,
                        onDeletePost: confirmDeletePost
                      }, null, 8, ["post", "loading", "saving"])
                    ])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</main>`);
      if (showDeleteModal.value) {
        _push(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">`);
        _push(ssrRenderComponent(_sfc_main$c, { class: "max-w-md w-full" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_sfc_main$b, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_sfc_main$a, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Confirm Deletion`);
                        } else {
                          return [
                            createTextVNode("Confirm Deletion")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_sfc_main$8, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        var _a, _b;
                        if (_push4) {
                          _push4(` Are you sure you want to delete the post. <span class="font-semibold"${_scopeId3}>${ssrInterpolate((_a = postToDelete.value) == null ? void 0 : _a.title)}</span>? This action cannot be undone. `);
                        } else {
                          return [
                            createTextVNode(" Are you sure you want to delete the post. "),
                            createVNode("span", { class: "font-semibold" }, toDisplayString((_b = postToDelete.value) == null ? void 0 : _b.title), 1),
                            createTextVNode("? This action cannot be undone. ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_sfc_main$a, null, {
                        default: withCtx(() => [
                          createTextVNode("Confirm Deletion")
                        ]),
                        _: 1
                      }),
                      createVNode(_sfc_main$8, null, {
                        default: withCtx(() => {
                          var _a;
                          return [
                            createTextVNode(" Are you sure you want to delete the post. "),
                            createVNode("span", { class: "font-semibold" }, toDisplayString((_a = postToDelete.value) == null ? void 0 : _a.title), 1),
                            createTextVNode("? This action cannot be undone. ")
                          ];
                        }),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_sfc_main$3, { class: "gap-3 justify-end" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_sfc_main$d, {
                      onClick: ($event) => showDeleteModal.value = false,
                      variant: "outline"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(` Cancel `);
                        } else {
                          return [
                            createTextVNode(" Cancel ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_sfc_main$d, {
                      onClick: deletePostConfirmed,
                      variant: "destructive",
                      disabled: postSaving.value
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(postSaving.value ? "Deleting..." : "Delete")}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(postSaving.value ? "Deleting..." : "Delete"), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_sfc_main$d, {
                        onClick: ($event) => showDeleteModal.value = false,
                        variant: "outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Cancel ")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_sfc_main$d, {
                        onClick: deletePostConfirmed,
                        variant: "destructive",
                        disabled: postSaving.value
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(postSaving.value ? "Deleting..." : "Delete"), 1)
                        ]),
                        _: 1
                      }, 8, ["disabled"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_sfc_main$b, null, {
                  default: withCtx(() => [
                    createVNode(_sfc_main$a, null, {
                      default: withCtx(() => [
                        createTextVNode("Confirm Deletion")
                      ]),
                      _: 1
                    }),
                    createVNode(_sfc_main$8, null, {
                      default: withCtx(() => {
                        var _a;
                        return [
                          createTextVNode(" Are you sure you want to delete the post. "),
                          createVNode("span", { class: "font-semibold" }, toDisplayString((_a = postToDelete.value) == null ? void 0 : _a.title), 1),
                          createTextVNode("? This action cannot be undone. ")
                        ];
                      }),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(_sfc_main$3, { class: "gap-3 justify-end" }, {
                  default: withCtx(() => [
                    createVNode(_sfc_main$d, {
                      onClick: ($event) => showDeleteModal.value = false,
                      variant: "outline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Cancel ")
                      ]),
                      _: 1
                    }, 8, ["onClick"]),
                    createVNode(_sfc_main$d, {
                      onClick: deletePostConfirmed,
                      variant: "destructive",
                      disabled: postSaving.value
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(postSaving.value ? "Deleting..." : "Delete"), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled"])
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};

const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404.vue.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500.vue.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};

const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    var _a;
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      (_a = nuxt.payload).error || (_a.error = createError(error));
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);

const server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: entry$1
});

export { useNuxtApp as a, useRuntimeConfig as b, nuxtLinkDefaults as c, navigateTo as n, resolveRouteObject as r, server as s, tryUseNuxtApp as t, useRouter as u };
//# sourceMappingURL=server.mjs.map
