// Express
const express = require('express');
// Database Value getters/setters
const dbCurrentPhaseId = require('../common/utils/dbValues/currentPhaseId');
const dbRespondersCount = require('../common/utils/dbValues/respondersCount');

/**
 * Function to create a router for the "/responders" endpoint that handles tracking and
 * displaying the number of responders for each phase.
 * @param {Express} app The express application, used to retrieve and update local constants.
 * @returns {Router} A router to be set on the "/responders" endpoint.
 */
const respondersRouterCreator = (app) => {
  const router = express.Router();

  // Custom middleware to 404 if the request phase id is higher than the app's currentPhaseId
  const phaseNotFoundMiddleware = async (req, res, next) => {
    const phaseId = req.params.phaseId;
    const currentPhaseId = await dbCurrentPhaseId.getCurrentPhaseId(app);
    if (phaseId && phaseId > currentPhaseId) {
      return res.status(404).end();
    }
    next();
  }

  // PATCH method allowing responders to register
  router.patch('/:phaseId', phaseNotFoundMiddleware, async (req, res, _next) => {
    const phaseId = req.params.phaseId;
    const respondersCount = await dbRespondersCount.getRespondersCountForAll(app);

    await dbRespondersCount.incrementRespondersCountForPhase(app, phaseId);

    res.status(200).end();
  });

  // GET method for the responders count of all phases
  router.get('/', async (_req, res, _next) => {
    const respondersCount = await dbRespondersCount.getRespondersCountForAll(app);
    res.json(respondersCount);
  });

  // GET method for the responders count of one phase
  router.get('/:phaseId', phaseNotFoundMiddleware, async (req, res, next) => {
    const phaseId = req.params.phaseId;
    const numResponders = await dbRespondersCount.getRespondersCountForPhase(app, phaseId);

    res.send(`The number of responders for phase ${phaseId} is ${numResponders ? numResponders : '0'}`); 
  });

  return router;
}

module.exports.respondersRouterCreator = respondersRouterCreator;