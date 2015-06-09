var _ = require('lodash'),
    moment = require('moment'),
    winston = require('winston');

/**
 * configure
 *    - Sets up the logging transports
 * @return {Object} - lib.logger
 */
var configure = function(config) {
  var options = {
    level: 'info'
  };

  _.assign(options, config);
  
  var transports = [];

  if (options.papertrail) {
    require('winston-papertrail');

    var papertrailConfig = {
      host: options.papertrail.host,
      port: options.papertrail.port,      
      logFormat: function(level, message) {
        return '[' + level + '] ' + message;
      }
    };

    var papertrail = new winston.transports.Papertrail(papertrailConfig);
    transports.push(papertrail);
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

  // First sets up basic loggers: debug, info, warn, error
  var logger = require('./lib/loggers')(options, new winston.Logger({ transports: transports }));

  // Then appends the higher level logging helper functions (such as alert) which are reliant on the basic functions to work
  return require('./lib/loggerHelper')(options, logger);
};

module.exports = function(options) {
  return configure(options);
};
