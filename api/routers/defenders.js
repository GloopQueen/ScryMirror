const express = require('express');

/**
 * Function to create a router for the "/defenders" endpoint that handles tracking and
 * displaying the number of defenders for each attack.
 * @param {Express} app The express application, used to retrieve and update local constants.
 * @returns {Router} A router to be set on the "/defenders" endpoint.
 */
const defendersRouterCreator = (app) => {
  const router = express.Router();

  // Custom middleware to 404 if the request attack id is higher than the app's currentAttackId
  const attackNotFoundMiddleware = (req, res, next) => {
    const attackId = req.params.attackId;
    if (attackId && attackId > app.locals.currentAttackId) {
      return res.status(404).end();
    }
    next();
  }

  // PATCH method allowing defenders to register
  router.patch('/:attackId', attackNotFoundMiddleware, (req, res, _next) => {
    const attackId = req.params.attackId;
    const defendersCount = app.locals.defendersCount;

    // If this is the first received defender, initialize count
    if (!defendersCount[attackId]) {
      defendersCount[attackId] = 0;
    }
    defendersCount[attackId] += 1;

    app.locals.defendersCount = defendersCount;

    res.status(200).end();
  });

  // GET method for the defenders count of all attacks
  router.get('/', (_req, res, _next) => {
    res.json(app.locals.defendersCount);
  });

  // GET method for the defenders count of one attack
  router.get('/:attackId', attackNotFoundMiddleware, (req, res, next) => {
    const attackId = req.params.attackId;
    const numDefenders = app.locals.defendersCount[attackId];

    res.send(`The number of defenders for attack ${attackId} is ${numDefenders ? numDefenders : '0'}`); 
  });

  return router;
}

module.exports.defendersRouterCreator = defendersRouterCreator;