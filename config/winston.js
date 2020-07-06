const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

// var appRoot = require('app-root-path');
var winston = require('winston');
require('winston-daily-rotate-file');

const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'app.log');

var options = {
  file: {
    level: 'info',
    filename: `${filename}`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    // format: format.combine(
    //   format.colorize(),
    //   format.printf(
    //     info => `${info.timestamp} ${info.level}: ${info.message}`
    //   )
    // )
  },
};

var transport = new winston.transports.DailyRotateFile({
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '14d'
});

transport.on('rotate', function(oldFilename, newFilename) {
  // do something fun
});


const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
    transport
    // new transports.Console({
    //   level: 'info',
    //   format: format.combine(
    //     format.colorize(),
    //     format.printf(
    //       info => `${info.timestamp} ${info.level}: ${info.message}`
    //     )
    //   )
    // }),
    // new transports.File({ filename })
  ],
  exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;