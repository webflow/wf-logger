var AWS = require('aws-sdk');
var step = require('step');

var SNS = function(config) {
  var setupSubscriptions = function(cb) {
    if (config.sns && config.sns.topics && config.sns.topics.length > 0) {
      step(
        function() {
          var group = this.group();
          config.sns.topics.forEach(function(t) {
            setupTopic(t, group());
          });
        },
        function(err, responses) {
          if (err) return cb(err);

          return cb(null, responses);
        }
      );
    } else {
      return cb(null, []);
    }

    function setupTopic(topicArn, cb) {
      if (!config.sns.endpoint) throw new Error('missing sns.endpoint!');

      var sns = new AWS.SNS();
      var data = {
        'TopicArn': topicArn,
        'Protocol': 'http',
        'Endpoint': config.sns.endpoint
      };
      sns.subscribe(data, function(err, data) {
        if (err) return cb(err);
        cb(null, data);
      });
    }
  };

  var publishError = function(message) {
    this.publish(message, "Webflow Error " + process.env.NODE_ENV);
  };

  var publish = function(message, subject, arn, cb) {
    var sns = new AWS.SNS();

    if (arguments.length === 2 && typeof subject === 'function') {
      cb = subject;
      subject = null;
    } else if (arguments.length === 3 && typeof arn === 'function') {
      cb = arn;
      arn = null;
    }

    subject = subject || "Webflow Error";
    arn = arn || config.file.aws.snsErrorArn;
    cb = cb || function () {};

    if (!arn) {
      return cb(new Error("Failed to select a suitible ARN."));
    }

    var data = {
      'TopicArn': arn,
      'Subject': subject,
      'Message': message.toString()
    };

    return sns.publish(data, cb);
  };

  return {
    setupSubscriptions: setupSubscriptions,
    publishError: setupSubscriptions,
    publish: publish
  };
};

module.exports = function(config) {
  AWS.config.update({
    accessKeyId: config.awsAccessKey,
    secretAccessKey: config.awsSecretKey
  });

  AWS.config.update({region: 'us-east-1'});

  return SNS(config);
};
