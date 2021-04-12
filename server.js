require("isomorphic-fetch");
const dotenv = require("dotenv");
const Koa = require("koa");
const next = require("next");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
// const { verifyRequest } = require("@shopify/koa-shopify-auth");
import shopifyAuth, {verifyRequest} from '@shopify/koa-shopify-auth'
const { default: Shopify, ApiVersion } = require("@shopify/shopify-api");
const Router = require("koa-router");
const getSubscriptionUrl = require("./server/getSubscriptionUrl");

import session from 'koa-session';

dotenv.config();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_API_SCOPES.split(","),
  HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const ACTIVE_SHOPIFY_SHOPS = {};



app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];

  const {SHOPIFY_API_KEY, SHOPIFY_SECRET} = process.env;

  server.use(session({ secure: true, sameSite: 'none' }, server))
  server.use(
    shopifyAuth({
      // if specified, mounts the routes off of the given path
      // eg. /shopify/auth, /shopify/auth/callback
      // defaults to ''
      prefix: '/shopify',
      // your shopify app api key
      apiKey: SHOPIFY_API_KEY,
      // your shopify app secret
      secret: SHOPIFY_SECRET,
      // scopes to request on the merchants store
      scopes: ['write_orders, write_products'],
      // set access mode, default is 'online'
      // accessMode: 'offline',
      // callback for when auth is completed
      afterAuth(ctx) {
        const {shop, accessToken} = ctx.session;
   
        console.log('We did it!', accessToken);
   
        ctx.redirect('/');
      },
    }),
    // createShopifyAuth({
    //   async afterAuth(ctx) {
    //     const { shop, scope, accessToken } = ctx.state.shopify;
    //     ACTIVE_SHOPIFY_SHOPS[shop] = scope;

    //     const registration = await Shopify.Webhooks.Registry.register({
    //       shop,
    //       accessToken,
    //       path: "/webhooks",
    //       topic: "APP_UNINSTALLED",
    //       apiVersion: ApiVersion.October20,
    //       webhookHandler: (_topic, shop, _body) => {
    //         console.log("App uninstalled");
    //         delete ACTIVE_SHOPIFY_SHOPS[shop];
    //       },
    //     });

    //     if (registration.success) {
    //       console.log("Successfully registered webhook!");
    //     } else {
    //       console.log("Failed to register webhook", registration.result);
    //     }

    //     const returnUrl = `https://${Shopify.Context.HOST_NAME}?shop=${shop}`;
    //     const subscriptionUrl = await getSubscriptionUrl(
    //       accessToken,
    //       shop,
    //       returnUrl
    //     );
    //     ctx.redirect(subscriptionUrl);
    //   },
    // })
  );
  server.use(
    verifyRequest({
      // path to redirect to if verification fails
      // defaults to '/auth'
      authRoute: '/auth',
      // path to redirect to if verification fails and there is no shop on the query
      // defaults to '/auth'
      fallbackRoute: '/index',
    }),
  );


  router.post("/graphql", verifyRequest(), async (ctx, next) => {
    await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
  });

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post('/webhooks', async (ctx) => {
    await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
    console.log(`Webhook processed with status code 200`);
  });

  router.get("/", async (ctx) => {
    const shop = ctx.query.shop;

    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  router.get("(/_next/static/.*)", handleRequest);
  router.get("/_next/webpack-hmr", handleRequest);
  router.get("(.*)", handleRequest);

  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
