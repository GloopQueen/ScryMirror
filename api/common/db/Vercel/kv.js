const kv = require("@vercel/kv").kv;

// Vercel Redis Constants
const CURRENT_PHASE_ID_STRING = 'current_phase_id';
const RESPONDERS_COUNT_HASH = 'responders_count';
const SESSION_LIFETIME_JSON = 'session_lifetime';

/* Current Phase Id */
async function getCurrentPhaseIdFromKV() {
  return await kv.get(CURRENT_PHASE_ID_STRING);
};

async function incrementCurrentPhaseIdInKV() {
  return await kv.incrby(CURRENT_PHASE_ID_STRING, 1);
};

/* Responders Count */
async function getRespondersCountForPhaseFromKV(phaseId) {
  return await kv.hget(RESPONDERS_COUNT_HASH, phaseId);
};

async function getRespondersCountForAllFromKV() {
  return await kv.hgetall(RESPONDERS_COUNT_HASH);
};

async function incrementRespondersCountForPhaseInKV(phaseId) {
  return await kv.hincrby(RESPONDERS_COUNT_HASH, phaseId, 1);
};

/* Session Lifetime */
async function clearAllSessionLifetimeInKV() {
  await kv.json.set(SESSION_LIFETIME_JSON, '$', {});
};

async function setSessionCreationInKV(sessionID, creationTimestamp) {
  // Force to bracket notation path accessor for session IDs with hyphens/underscores
  const sessionIDPath = `$["${sessionID}"]`;
  await kv.json.set(SESSION_LIFETIME_JSON, sessionIDPath, {
    creationTimestamp
  })
};

async function setSessionExpiryInKV(sessionID, expiryTimestamp) {
  // Force to bracket notation path accessor for session IDs with hyphens/underscores
  const sessionIDPath = `$["${sessionID}"]`;
  // If `session_lifetime.<sessionID>` wasn't previously initialised as an object by `setSessionCreationInKV`, this will error.
  try {
    await kv.json.set(SESSION_LIFETIME_JSON, `${sessionIDPath}.expiryTimestamp`, expiryTimestamp);
  } catch (_e) {
    // Possible logging opportunity if we care about tracking received weirdo faker sessions.
    console.warn('WARNING: received session that was not previously created.');
  }
};

async function getSessionLifetimeForSessionInKV(sessionID) {
  // Force to bracket notation path accessor for session IDs with hyphens/underscores
  const sessionIDPath = `$["${sessionID}"]`;
  const singleSessionLifetime = await kv.json.get(SESSION_LIFETIME_JSON, sessionIDPath);
  // `kv.json.get` returns an array when `path` is specified, just return first index
  return singleSessionLifetime[0];
};

async function getSessionLifetimeForAllInKV() {
  return await kv.json.get(SESSION_LIFETIME_JSON);
};

module.exports.getCurrentPhaseIdFromKV = getCurrentPhaseIdFromKV;
module.exports.incrementCurrentPhaseIdInKV = incrementCurrentPhaseIdInKV;
module.exports.getRespondersCountForPhaseFromKV = getRespondersCountForPhaseFromKV;
module.exports.getRespondersCountForAllFromKV = getRespondersCountForAllFromKV;
module.exports.incrementRespondersCountForPhaseInKV = incrementRespondersCountForPhaseInKV;
module.exports.clearAllSessionLifetimeInKV =clearAllSessionLifetimeInKV;
module.exports.setSessionCreationInKV = setSessionCreationInKV;
module.exports.setSessionExpiryInKV = setSessionExpiryInKV;
module.exports.getSessionLifetimeForSessionInKV = getSessionLifetimeForSessionInKV;
module.exports.getSessionLifetimeForAllInKV = getSessionLifetimeForAllInKV;
