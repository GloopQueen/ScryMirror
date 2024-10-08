/**
 * Middleware file for managing a common CookieParser middleware.
 * We currently don't have any need for having multiple CookieParsers
 * to support differing needs for separate endpoints.
 */

const cookieParser = require('cookie-parser');

// Common cookieParserMiddleware instance
let cookieParserMiddleware;

/**
 * Function to create a common instance of the cookie parser middleware.
 * @param {string} secret The secret used to sign and unsign cookies.
 */
const initCookieParserMiddleware = (secret) => {
  if (!cookieParserMiddleware) {
    cookieParserMiddleware = cookieParser(secret);
  } else {
    console.warn('CookieParserMiddleware already initialized');
  }
};

/**
 * Function to get the common instance of the cookie parser middleware.
 * Should either be used by the app as a whole or on a case by case basis for routers/endpoints.
 * IMPORTANT NOTE: Must come before Session middleware.
 * @returns {Express.RequestHandler} The CookieParser middleware singleton.
 */
const getCookieParserMiddleware = () => {
  if (cookieParserMiddleware) {
    return cookieParserMiddleware;
  }
  throw new Error('CookieParser Middleware has not been initialized.');
};

module.exports.initCookieParserMiddleware = initCookieParserMiddleware;
module.exports.getCookieParserMiddleware = getCookieParserMiddleware;