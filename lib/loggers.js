var util = require('util'),
    debug = require('debug');

module.exports = function(options, logger) {
  logger.setLevels({ debug: 0, info: 1, warn: 2, error: 3 });

  logger.debug = setupFormating(logger.debug); 
  logger.info = setupFormating(logger.info);
  logger.warn = setupFormating(logger.warn);
  logger.error = setupFormating(logger.error);

  logger.debugNS = function(namespace) {
    if (options.debug) {
      return debug(namespace);  
    } else {
      return function(){};
    }
  };

  logger.info("Logging enabled. Level:[%s] Location:[%s]", options.level, options.path);
  return logger;
};

function setupFormating(fn) {
  return function() {
    fn(util.format.apply(util, arguments), {});
  };
}
