/* Express */
const express = require('express');
/* Sub Routers */
const session = require('./session');

const analyticsRouterCreator = (app) => {
  const router = express.Router();

  /* Nested Routers */
  if (process.env.SESSION_ENABLED === 'true'){
    router.use("/session", session.analyticsSessionRouterCreator(app));
  }

  return router;
}

module.exports.analyticsRouterCreator = analyticsRouterCreator;
