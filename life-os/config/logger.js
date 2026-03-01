const winston = require('winston');

const fmt = winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
  const svc = service ? ` [${service}]` : '';
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} ${level}${svc} ${message}${extra}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    fmt
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), fmt)
    })
  ]
});

function createServiceLogger(serviceName) {
  return logger.child({ service: serviceName });
}

module.exports = { logger, createServiceLogger };
