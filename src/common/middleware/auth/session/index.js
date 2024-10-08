const session = require('express-session');
const createMemoryStore = require('memorystore');

// MemoryStore class constructor
const MemoryStore = createMemoryStore(session);

const SESSION_TTL = parseInt(process.env.SESSION_TTL) || 3600000;

// In-memory store for use by the session middlware. 
// Only using in-memory as we don't have access to a separate database for session persistence,
// nor do we have multiple server instances to necessitate having that capability.
// Vercel constantly kills the server, so shouldn't worry about this getting filled.
const SESSION_MEMORY_STORE = new MemoryStore(
  {
    checkPeriod: SESSION_TTL
  }
);

// Options object used to configure the session middleware
const DEFAULT_SESSION_MIDDLEWARE_OPTIONS = {
  cookie: { 
    maxAge: SESSION_TTL
  },
  store: SESSION_MEMORY_STORE,
  // Necessary to save sessions where nothing is written to session store
  saveUninitialized: true,
  resave: false,
};

// Common sessionMiddleware instance.
let sessionMiddleware;

/**
 * Function to create a common instance of the session middleware.     
 * @param {string[]} secrets Secret array for signing sessions.
 *                           First secret for sign/verify new sessions, subsequent secrets for verifying old sessions.
 */
const initSessionMiddleware = (secrets) => {
  if (!sessionMiddleware) {
    sessionOptions = {
      ...DEFAULT_SESSION_MIDDLEWARE_OPTIONS,
      secret: secrets
    }
    sessionMiddleware = session(sessionOptions);
  } else {
    console.warn('SessionMiddleware already initialized');
  }
};

/**
 * Function to get the common instance of the session middleware.
 * Should either be used by the app as a whole or on a case by case basis for routers/endpoints.
 * IMPORTANT NOTE: Must come after CookieParser middleware.
 * @returns {Express.RequestHandler} The Session middleware singleton.
 */
const getSessionMiddleware = () => {
  if (sessionMiddleware) {
    return sessionMiddleware;
  }
  throw new Error('Session Middleware has not been initialized.')
};

module.exports.initSessionMiddleware = initSessionMiddleware;
module.exports.getSessionMiddleware = getSessionMiddleware;
