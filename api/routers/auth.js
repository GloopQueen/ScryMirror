// Express
const express = require('express');

/**
 * Function to create a router for the "/auth" endpoints that handles logging in
 * and providing other endpoints for testing proper handling of session token.
 * @param {Express} app The express application, used to retrieve and update local constants.
 * @returns {Router} A router to be set on the "/auth" endpoint.
 */
const authRouterCreator = (app) => {
  const router = express.Router();

  // GET method, used for testing currently
  router.get('/guest', async(req, res, _next) => {
    res.send('You have marked this session as a guest session (any endpoint would have done this)');
  });

  // GET method that will only return if the requests session was previously in the store.
  router.get('/test', async(req, res, _next) => {
    // If received session doesn't exist or doesn't match the middleware provided session, client is not authed.
    if (req.signedCookies['connect.sid'] === req.session.id) {
      res.send('Congratulations! The server knows who you are (affectionate, not ominous)');
    }
    res.status(401).end();
  });

  // PATCH endpoint to progressively upgrade user session with itch.io login
  router.patch('/itchio', async(req, res, _next) => {
    // Not currently implemented
    res.status(501).end();
  });

  // PATCH endpoint to progressively upgrade user session with itch.io login
  router.patch('twitch', async(req, res, _next) => {
    // Not currently implemented
    res.status(501).end();
  });

  return router;
}

module.exports.authRouterCreator = authRouterCreator;