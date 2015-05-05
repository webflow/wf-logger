var os = require('os');

module.exports = function(config, loggers) {
  var sns = require('./sns')(config);
  var meta = { host: os.hostname() };

  var inspect = function(o) {
    loggers.debug(JSON.stringify(o, null, '\t'));
  };

  var alert = function(msg, subject, request, notify) {
    notify = notify || true;
    var errStr;
    var domainId;

    if (typeof msg == 'object') {
      if (msg.name) {
        errStr = ["alert error:", "'" + subject + "'", msg.toString()];
        errStr = errStr.join(' ');
      } else {
        errStr = JSON.stringify(msg, '\t', 4);
      }

      if (msg.domain && msg.domain.id) {
        errStr += '\n Domain: ' + msg.domain.id;
        errStr += '\n IP: ' + msg.domain.ip;
        errStr += '\n Referer: ' + msg.domain.referer;
      }

      if (msg.stack) {
        errStr += '\n' + msg.stack;
      }

      loggers.error(errStr);

      if (!notify) {
        return;
      }
    }

    subject = subject || "Webflow Alert";
    subject += " (" + process.env.NODE_ENV + "@" + meta.host + ")";

    if (errStr) {
      msg += "\n\n----Stack------\n";
      msg += errStr + '\n\n';
    }
    if (request) {
      msg += "\n\n----Request----\n";
      msg += request.method + " " + request.url + " HTTP/" + request.httpVersion + "\n";
      msg += "HEADERS " + JSON.stringify(request.headers, null, '\t') + "\n";
      msg += "BODY " + JSON.stringify(request.body, null, '\t') + "\n";
      msg += "SESSION " + JSON.stringify(request.user, null, '\t');
      msg = msg.replace(/"password": "[^"]+/, '"password": "<redacted>');
      msg = msg.replace(/"newPassword": "[^"]+/, '"newPassword": "<redacted>');
    }

    if (config.aws) {
      var arn = config.aws.snsErrorsArn || config.aws.snsNotifyArn;
      sns.publish(msg, subject, arn, function(error) {
        if (error) {
          loggers.error('sns.publish error: %j', error);
        } else {
          loggers.info('sns.publish: success %s [%s]', subject, arn);
        }
      });
    }
  };

  loggers.inspect = inspect;
  loggers.alert = alert;

  return loggers;
};