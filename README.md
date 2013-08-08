redis-callback
==============

Callbacks through redis to make cross-server calls a breeze

## Installation

		$ npm install redis-callback


## Usage

This is an example with two servers, one will call exec and wait for a callback, 
the other will listen to an event and callback with a result.

This happens over **multiple servers**. This means you can have an infinite amount of
worker roles listening for data to process, and it calls back to your main application
server **seamlessly**.

Awesome, right? :-)


### Server A

```javascript
var RedisCallback = require('redis-callback');

var redisCallback = new RedisCallback({ 
	prefix: 'somethingHere', 
	pubClient: redisClientA, 
	subClient: redisClientB 
});

redisCallback.exec('double', 333, function(err, result) {
	console.log('It has been doubled!', result);
});

```


### Server B

```javascript

var RedisCallback = require('redis-callback');

var redisCallback = new RedisCallback({ 
	prefix: 'somethingHere', 
	pubClient: redisClientA, 
	subClient: redisClientB 
});

redisCallback.on('double', function(someNumber, cb) {
	someNumber *= 2;
	cb(nul, someNumber);
});

```


