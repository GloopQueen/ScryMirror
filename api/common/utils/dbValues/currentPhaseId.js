/**
 * File for methods relating to the get/set of `currentPhaseId`.
 * Keeps the app.local and Vercel Redis db version in sync and
 * cuts down on expense of reads to Vercel.
 */
const vercelKV = require('../../db/Vercel/kv');

async function initializeFromDb(app) {
  app.locals.currentPhaseId = await vercelKV.getCurrentPhaseIdFromKV();
}

async function getCurrentPhaseId(app) {
  // If `currentPhaseId` is 0, hasn't been initialized from db yet.
  if (app.locals.currentPhaseId === 0) {
    await initializeFromDb(app);
  }
  return app.locals.currentPhaseId;
}

async function incrementCurrentPhaseId(app) {
  app.locals.currentPhaseId = await vercelKV.incrementCurrentPhaseIdInKV();
}

module.exports.getCurrentPhaseId = getCurrentPhaseId;
module.exports.incrementCurrentPhaseId = incrementCurrentPhaseId;
