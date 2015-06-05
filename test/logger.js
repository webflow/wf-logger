var should = require('should');
var sinon = require('sinon');

var config = {
  console: true
};

var sandbox = sinon.sandbox.create();
var logger = require('../index.js')(config);

describe('Simple logger tests', function() {
  afterEach(function() {
    spy.reset();
  });

  it('Logs with inspect', function() {
    spy = sandbox.spy(logger, 'inspect');

    logger.inspect({});
    spy.callCount.should.eql(1);
  });

});
