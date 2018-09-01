// Custom logger for playlist_manager
const winston = require('winston');
const { format } = winston;
const customFormat = format.combine(
  format.timestamp(),
  format.splat(),
  format.align(),
  format.json(),
  format.colorize(),
  format.label({ label: 'playlist_manager' }),
  format.printf(
    info =>
      `[${info.level}] ${info.label} | ${info.timestamp} | ${info.message}`
  )
);
const logger = winston.createLogger({
  level: 'info',
  format: customFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/playlist_manager.log' }),
    new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }),
  ],
});


module.exports = logger;
