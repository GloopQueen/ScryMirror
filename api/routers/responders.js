const express = require('express');

/**
 * Function to create a router for the "/responders" endpoint that handles tracking and
 * displaying the number of responders for each phase.
 * @param {Express} app The express application, used to retrieve and update local constants.
 * @returns {Router} A router to be set on the "/responders" endpoint.
 */
const respondersRouterCreator = (app) => {
  const router = express.Router();

  // Custom middleware to 404 if the request phase id is higher than the app's currentPhaseId
  const phaseNotFoundMiddleware = (req, res, next) => {
    const phaseId = req.params.phaseId;
    if (phaseId && phaseId > app.locals.currentPhaseId) {
      return res.status(404).end();
    }
    next();
  }

  // PATCH method allowing responders to register
  router.patch('/:phaseId', phaseNotFoundMiddleware, (req, res, _next) => {
    const phaseId = req.params.phaseId;
    const respondersCount = app.locals.respondersCount;

    // If this is the first received responder, initialize count
    if (!respondersCount[phaseId]) {
      respondersCount[phaseId] = 0;
    }
    respondersCount[phaseId] += 1;

    app.locals.respondersCount = respondersCount;

    res.status(200).end();
  });

  // GET method for the responders count of all phases
  router.get('/', (_req, res, _next) => {
    res.json(app.locals.respondersCount);
  });

  // GET method for the responders count of one phase
  router.get('/:phaseId', phaseNotFoundMiddleware, (req, res, next) => {
    const phaseId = req.params.phaseId;
    const numResponders = app.locals.respondersCount[phaseId];

    res.send(`The number of responders for phase ${phaseId} is ${numResponders ? numResponders : '0'}`); 
  });

  return router;
}

module.exports.respondersRouterCreator = respondersRouterCreator;