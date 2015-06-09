var util = require('util'),
    debug = require('debug');

var namespaceCache = {};

module.exports = function(options, logger) {
  logger.setLevels({ debug: 0, info: 1, warn: 2, error: 3 });

  logger.debug = setupFormating(logger.debug); 
  logger.info = setupFormating(logger.info);
  logger.warn = setupFormating(logger.warn);
  logger.error = setupFormating(logger.error);

  /**
   * debugNS
   *   - Creates a unique debug logger instance for a given namespace. It will reuse namespaces
   *     that already have been defined allowing the same namespace to be accessed in different files
   *     without creating duplicates.
   * @param  {String} namespace
   * @return {Function}
   */
  logger.debugNS = function(namespace) {
    if (options.debug !== true) {
      return function(){};
    }

    if (typeof namespaceCache[namespace] !== 'undefined') {
      return namespaceCache[namespace];
    }
    
    var _namespaceDebug = debug(namespace);

    // Add namespaced debug function to cache
    namespaceCache[namespace] = _namespaceDebug;

    return _namespaceDebug;
  };

  logger.info("Logging enabled. Level:[%s] Location:[%s]", options.level, options.path);
  
  return logger;
};

function setupFormating(fn) {
  return function() {
    fn(util.format.apply(util, arguments), {});
  };
}
