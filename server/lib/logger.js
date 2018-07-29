const winston = require('winston');
const { format } = winston;

const getLogger = label => {
  if (!label) {
    throw new Error('Label required for logger');
  }
  const customFormat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.splat(),
    format.align(),
    format.json(),
    format.label({label}),
    format.printf(info => `[${info.level}] ${info.label} | ${info.timestamp} | ${info.message}`)
  );
  const logger = winston.createLogger({
    level: 'info',
    format: customFormat,
    transports: [new winston.transports.Console()],
  });
  // Write to file in production (and mount volume so we can see it probably)
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.File({ filename: 'error.log', level: 'error' })
    );
  }
  return logger;
};


module.exports = getLogger;
