// Lightweight logger — no Winston dependency (avoids path-with-spaces hang)
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const COLORS = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[32m', debug: '\x1b[36m' };
const RESET = '\x1b[0m';

const configuredLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function log(level, message, meta = {}) {
  if (LEVELS[level] > configuredLevel) return;
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const svc = meta.service ? ` [${meta.service}]` : '';
  const { service, ...rest } = meta;
  const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
  const color = COLORS[level] || '';
  console.log(`${ts} ${color}${level}${RESET}${svc} ${message}${extra}`);
}

function makeLogger(defaultMeta = {}) {
  return {
    error: (msg, meta) => log('error', msg, { ...defaultMeta, ...meta }),
    warn:  (msg, meta) => log('warn',  msg, { ...defaultMeta, ...meta }),
    info:  (msg, meta) => log('info',  msg, { ...defaultMeta, ...meta }),
    debug: (msg, meta) => log('debug', msg, { ...defaultMeta, ...meta }),
    child: (childMeta) => makeLogger({ ...defaultMeta, ...childMeta })
  };
}

const logger = makeLogger();

function createServiceLogger(serviceName) {
  return logger.child({ service: serviceName });
}

module.exports = { logger, createServiceLogger };
