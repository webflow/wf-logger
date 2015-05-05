var _ = require('lodash'),
    moment = require('moment'),
    winston = require('winston');

var configure = function(config) {
  var options = {
    level: 'info'
  };

  _.assign(options, config);
  
  var transports = [];

  if (options.papertrail) {
    require('winston-papertrail');

    var papertrailConfig = {
      logFormat: function(level, message) {
        return '[' + level + '] ' + message;
      }
    };

    _.assign(papertrailConfig, options.papertrail);

    transports.push(winston.transports.Papertrail(papertrailConfig));
  }

  if (options.console) { // Dev environment will hit stdout
    transports.push(new (winston.transports.Console)({ level: options.level, timestamp: moment().format('YYYY-MM-DD HH:MM:ss.SSS'), colorize: true }));
  }

  if (options.path) { // Output to a file
    var filename = options.path;
    if (filename.indexOf('/') !== 0) {
      filename = __dirname + "/../" + filename;
    }

    transports.push(new (winston.transports.File)({ level: options.level, timestamp: moment().format('YYYY-MM-DD HH:MM:ss.SSS'), filename: filename, json: false }));
  }

  logger = new winston.Logger({ transports: transports });
  logger.info("Logging enabled. Level:[%s] Location:[%s] Transports:[%d]", options.level, options.path, transports.length);
  
  return require('./lib/loggers')(options, logger);
};

module.exports = function(options) {
  return configure(options);
};
