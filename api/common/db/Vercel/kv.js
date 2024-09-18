const kv = require("@vercel/kv").kv;

// Vercel Redis Constants
const CURRENT_PHASE_ID_STRING = 'current_phase_id';
const RESPONDERS_COUNT_HASH = 'responders_count'

async function getCurrentPhaseIdFromKV() {
  return await kv.get(CURRENT_PHASE_ID_STRING);
}

async function incrementCurrentPhaseIdInKV() {
  return await kv.incrby(CURRENT_PHASE_ID_STRING, 1);
}

async function getRespondersCountForPhaseFromKV(phaseId) {
  return await kv.hget(RESPONDERS_COUNT_HASH, phaseId);
}

async function getRespondersCountForAllFromKV() {
  return await kv.hgetall(RESPONDERS_COUNT_HASH);
}

async function incrementRespondersCountForPhaseInKV(phaseId) {
  return await kv.hincrby(RESPONDERS_COUNT_HASH, phaseId, 1);
}

module.exports.getCurrentPhaseIdFromKV = getCurrentPhaseIdFromKV;
module.exports.incrementCurrentPhaseIdInKV = incrementCurrentPhaseIdInKV;
module.exports.getRespondersCountForPhaseFromKV = getRespondersCountForPhaseFromKV;
module.exports.getRespondersCountForAllFromKV = getRespondersCountForAllFromKV;
module.exports.incrementRespondersCountForPhaseInKV = incrementRespondersCountForPhaseInKV;
