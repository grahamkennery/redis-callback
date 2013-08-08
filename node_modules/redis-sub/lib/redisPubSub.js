var redis = require('redis'),
  events = require('events');

/**
 * RedisPubSub - Simple Pub/Sub
 * @param options
 *          port - Redis Port
 *          host - Redis host
 *          connect_timeout - timeout
 *          max_attempts - max connection attempts
 *          pubClient - Redis pubClient
 *          subClient - Redis subClient
 * @constructor
 */
function RedisPubSub (options) {
  options = options || {};
  events.EventEmitter.call(this);
  this.host = options && options.host ? options.port : '127.0.0.1';
  this.port = options && options.port ? options.port : 6379;

  this.redisOptions = {
    connect_timeout : options && options.connect_timeout ? options.connect_timeout : false,
    max_attempts : options && options.max_attempts ? options.max_attempts : false
  };

  this.pubClient = options.pubClient || redis.createClient(this.port, this.host, this.redisOptions);
  this.subClient = options.subClient || redis.createClient(this.port, this.host, this.redisOptions);

  this.setupListeners();
};
RedisPubSub.prototype.__proto__ = events.EventEmitter.prototype;
RedisPubSub.prototype.setupListeners = function (cb) {
  this.on("removeListener", this._unsubscribe);
  this.on("newListener", this._subscribe);
  var self = this;
  this.subClient.on("message", function (channel, message) {
    if (self.listeners(channel).length > 0) {
      self.emit(channel, message);
    }
  });
};
RedisPubSub.prototype._subscribe = function(event, functino) {
  // Subscribe to event
  if (event != "removeListener" && event != "newListener") {
    if (this.listeners(event).length == 0) {
      this.subClient.subscribe(event);
    }
  }
};
RedisPubSub.prototype._unsubscribe = function(event, functino) {
  // Unsubscribe from event.
  if (event != "removeListener" && event != "newListener") {
    if (this.listeners(event).length == 0) {
      this.subClient.unsubscribe(event);
    }
  }
};
RedisPubSub.prototype.publish = function() {
  this.pubClient.publish.apply(this.pubClient, arguments);
};
module.exports = RedisPubSub;