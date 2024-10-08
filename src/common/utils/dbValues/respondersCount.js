/**
 * File for methods relating to the get/set of `respondersCount`.
 * Keeps the app.local and Vercel Redis db version in sync and
 * cuts down on expense of reads to Vercel.
 */
const vercelKV = require('../../db/Vercel/kv');

let isFullCountFetched = false;

async function initializeRespondersCountForPhaseFromDb(app, phaseId) {
  app.locals.respondersCount[phaseId] = await vercelKV.getRespondersCountForPhaseFromKV(phaseId);
}

async function initializeRespondersCountForAllFromDb(app) {
  app.locals.respondersCount = await vercelKV.getRespondersCountForAllFromKV();
  isFullCountFetched = true;
}

async function getRespondersCountForPhase(app, phaseId) {
  // If the `phaseId` key for `respondersCount` is undefined, hasn't been initialized from db yet.
  if (app.locals.respondersCount[phaseId] === undefined) {
    await initializeRespondersCountForPhaseFromDb(app, phaseId);
  }
  return app.locals.respondersCount[phaseId];
}

async function getRespondersCountForAll(app) {
  // If `isFullCountFetched` hasn't been set to `true`, hasn't been initialized from db yet.
  if (!isFullCountFetched) {
    await initializeRespondersCountForAllFromDb(app);
  }
  return app.locals.respondersCount;
}

async function incrementRespondersCountForPhase(app, phaseId) {
  app.locals.respondersCount[phaseId] = await vercelKV.incrementRespondersCountForPhaseInKV(phaseId);
}

module.exports.getRespondersCountForPhase = getRespondersCountForPhase;
module.exports.getRespondersCountForAll = getRespondersCountForAll;
module.exports.incrementRespondersCountForPhase = incrementRespondersCountForPhase;
