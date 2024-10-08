/**
 * Middleware file for recognizing session add/drop and tracking it in
 * database for analytics purposes.
 */

/* KV getters/setters */
const kvFunctions = require('../../../db/Vercel/kv');

const sessionDropTrackingMiddleware = async (req, _res, next) => {
  if (!req.signedCookies['connect.sid']) {
    await kvFunctions.setSessionCreationInKV(req.session.id, Date.now());
  } else if (req.signedCookies['connect.sid'] !== req.session.id) {
    await kvFunctions.setSessionExpiryInKV(req.signedCookies['connect.sid'], Date.now());
  }
  next();
}

module.exports.sessionDropTrackingMiddleware = sessionDropTrackingMiddleware;
