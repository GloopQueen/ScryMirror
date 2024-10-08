/* Express */
const express = require('express');
/* KV getters/setters */
const kvFunctions = require('../../common/db/Vercel/kv');
/* Util functions */
const timeFormat = require('../../common/utils/formatting/time-format');

/**
 * 
 * @param {Express} app The express application, used to retrieve and update local constants.
 * @returns {Router} A router to be set on the "/analytics/session" endpoint.
 */
const analyticsSessionRouterCreator = (app) => {
  const router = express.Router();

  // PATCH method allowing the clearing of all session lifetimes with an admin key
  router.patch('/clear/:adminKey', async(req, res, _next) => {
    if (req.params.adminKey === app.locals.adminKey){
      await kvFunctions.clearAllSessionLifetimeInKV();
      res.status(200).end();
    } else {
      res.status(401).end();
    }
  });
  
  // GET method for all tracked sessions
  router.get('/tracking/:adminKey', async(req, res, _next) => {
    if (req.params.adminKey === app.locals.adminKey){
      const sessionLifetimesData = await kvFunctions.getSessionLifetimeForAllInKV();
      const numberTrackedSessions = Object.keys(sessionLifetimesData).length;
      const numberDroppedSessions = Object.values(sessionLifetimesData)
        .reduce(
          (accumulator, current) => {
            if (current?.creationTimestamp && current?.expiryTimestamp) {
              return accumulator + 1;
            }
            return accumulator;
          },
          0
        );
      res.json({
        numberTrackedSessions,
        numberDroppedSessions,
        sessionData: sessionLifetimesData 
      });
    } else {
      res.status(401).end();
    }
  });

  // GET method for a single tracked session
  router.get('/tracking/:sessionID/:adminKey', async(req, res, _next) => {
    if (req.params.adminKey === app.locals.adminKey){
      const sessionLifetimeData = await kvFunctions.getSessionLifetimeForSessionInKV(req.params.sessionID);
      if (sessionLifetimeData?.creationTimestamp){
        const sessionJSON = {
          ...sessionLifetimeData
        };
        if (sessionLifetimeData?.expiryTimestamp) {
          sessionJSON.lifetime = timeFormat.msToHHMMSS(sessionLifetimeData.expiryTimestamp - sessionLifetimeData.creationTimestamp);
        }
        res.json(sessionJSON);
      } else {
        res.status(404).send('Session does not exist.');
      }
    } else {
      res.status(401).end();
    }
  });

  // GET method for average lifetime of all dropped sessions
  router.get('/average/:adminKey', async(req, res, _next) => {
    if (req.params.adminKey === app.locals.adminKey){
      const sessionLifetimesData = await kvFunctions.getSessionLifetimeForAllInKV();
      const sessionLifetimesEntries = Object.values(sessionLifetimesData);
      if (sessionLifetimesEntries.length) {
        const lifetimesAverageData = sessionLifetimesEntries
          .reduce(
            (accumulator, current) => {
              if (current?.creationTimestamp && current?.expiryTimestamp) {
                return {
                  summedLifetimes: accumulator.summedLifetimes + (current.expiryTimestamp - current.creationTimestamp),
                  validLifetimes: accumulator.validLifetimes + 1
                }
              }
              return accumulator;
            },
            {
              summedLifetimes: 0,
              validLifetimes: 0,
            }
          );
        if (lifetimesAverageData.validLifetimes) {
          const averageLifetime = lifetimesAverageData.summedLifetimes/lifetimesAverageData.validLifetimes;
          res.send(`Average session lasted for ${timeFormat.msToHHMMSS(averageLifetime)}`);
        } else {
          res.status(404).send('No sessions currently expired.');
        }
      } else {
        res.status(404).send('No sessions currently tracked.');
      }
    } else {
      res.status(401).end();
    }
  });

  return router;
};

module.exports.analyticsSessionRouterCreator = analyticsSessionRouterCreator;
