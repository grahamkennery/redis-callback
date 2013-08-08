var redis = require('redis'),
	RedisSub = require('redis-sub'),
	events = require('events'),
	util = require('util'), 
	rando = require('silly-string');

var debug = false;

function RedisCallback(options) {
	events.EventEmitter.call( this );
	options = options || {};

	this.prefix = options.prefix || 'redisCallback';
	this.subscriptions = {};

	if (options.redisSub) {
		this.redisSub = options.redisSub;
		this.pubClient = this.redisSub.pubClient;
	} else if (options.pubClient && options.subClient) {
		this.pubClient = options.pubClient;
		this.subClient = options.subClient;
		this.redisSub = new RedisSub({
			subClient: this.subClient,
			pubClient: this.pubClient
		});
	} else {
		throw new Error('I need a redis client, bro');
	}

	this.setupListeners();

	return this;
};

util.inherits(RedisCallback, events.EventEmitter);




RedisCallback.prototype.setupListeners = function (cb) {
	var self = this;
  	this.on("removeListener", function(event) {
  		if (event != "removeListener" && event != "newListener") {
  			self._unsubscribe.apply(self, arguments);
  		}
  	});

  	this.on("newListener", function(event) {
  		if (event != "removeListener" && event != "newListener") {
  			self._subscribe.apply(self, arguments);
  		}
  	});
};

RedisCallback.prototype._subscribe = function(event, functino) {
	if (this.listeners(event).length == 0) {
		var self = this;
		
		var subscription = function(str, done) {
			debug && console.log('sremming', event);
			self.pubClient.srem(self.prefix + event, str, function(err, success) {
				if (!err && success) {
					debug && console.log('sremmed', event);
					// uuid and params
					var obj = JSON.parse(str);
					debug && console.log('uuid found before processing', obj.uuid);
					var params = obj.params;
					params.push(function() {
						var params = [].slice.call(arguments);
						debug && console.log('THE CALLBACK HAPPENED, REJOICE!', event, params);
						var str = JSON.stringify(params);

						self.redisSub.publish(self.prefix + obj.uuid, str);
						done && done();
					});

					functino.apply(null, params);
				} else {
					debug && console.log('Skipped processing - another server got it');
				}
			});
		};

		var getFromSet = function() {
			debug && console.log('spopping');
			self.pubClient.spop(self.prefix + event, function(err, str) {
				debug && console.log('spopped', err, str == null);
				if (!err && str) {
					subscription(str, function() {
						getFromSet();
					});
				} else if (!err) {
					debug && console.log('Nothing in set - Subscribing', event);
					self.redisSub.on(self.prefix + event, subscription);	
				} else {
					debug && console.log('Redis spop fail for', self.prefix + event);
				}
				
			});
		};

		if (!this.subscriptions[event]) {
			this.subscriptions[event] = {};
		}
		this.subscriptions[event][functino] = subscription;

		getFromSet();
		debug && console.log('thisistheendoftheonfunctionfor', event);
	}
};

RedisCallback.prototype._unsubscribe = function(event, functino) {
	if (this.listeners(event).length == 0) {
		
		if (this.subscriptions[event] && this.subscriptions[event][functino]) {
			this.redisSub.removeListener(this.prefix + event, this.subscriptions[event][functino]);
			delete this.subscriptions[event][functino];
		}

		if (this.subscriptions[event] && Object.keys(this.subscriptions[event]).length === 0) {
			delete this.subscriptions[event];
		}

	}
};


RedisCallback.prototype.exec = function(event, cb) {
	var params = [].slice.call(arguments);
	event = params.shift();
	cb = params.pop();

	var uuid = rando(16);

	var obj = { uuid: uuid, params: params };
	var str = JSON.stringify(obj);
	var self = this;
	debug && console.log('execccing', event, "params", params.length);

	this.pubClient.sadd(this.prefix + event, str, function(err) {
		if (!err) {
			debug && console.log('sadded');

			self.redisSub.once(self.prefix + uuid, function(str) {
				debug && console.log('OMG THE FINAL CALLBACK');
				var params = JSON.parse(str);

				if (Array.isArray(params)) {
					cb.apply(null, params);
				} else {
					cb(params);
				}
			});
			debug && console.log('publishing to', event, uuid);
			self.redisSub.publish(self.prefix + event, str);
		} else {
			cb(err);
		}
	})
};



module.exports = RedisCallback;