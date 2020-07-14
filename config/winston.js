const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

// var appRoot = require('app-root-path');
var winston = require('winston'),
  WinstonCloudWatch = require('winston-cloudwatch');
require('winston-daily-rotate-file');

const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

const AWS = require('aws-sdk');
 
var profileName = 'dev';
var regionName = 'us-east-1';
var logGroupName = 'BookstoreTest';
var logStreamName = 'webapp';

if(process.env.NODE_ENV == 'production'){
  profileName = process.env.IAMInstanceProfileName;
  regionName = process.env.DEPLOYMENT_REGION;
  logGroupName = process.env.LOG_GROUP_NAME || 'BookstoreCSYE6225';
  logStreamName = 'webapp-prod';
  // logGroupName = process.env.LOG_GROUP_NAME;
  // logStreamName = process.env.LOG_STREAM_NAME;
} else {
  console.info("Running Env: " + process.env.NODE_ENV);
  var credentials = new AWS.SharedIniFileCredentials({profile: profileName});
  AWS.config.credentials = credentials;
}

AWS.config.update({ region: regionName });


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
  filename: logDir+'/app-%DATE%.log',
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

logger.add(new WinstonCloudWatch({
  cloudWatchLogs: new AWS.CloudWatchLogs(),
  logGroupName: logGroupName,
  logStreamName: logStreamName,
  messageFormatter: ({ level, message, additionalInfo }) => `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
}));

module.exports = logger;