Node Redis Subscribe
=================

Small Redis Subscription wrapper for Node.
No need to do anything with redis publish. It's just fine.
This fixes Redis subscribing. The node way.

## Install
```bash
$ npm install redis-sub
```

## Dependencies
  - redis : ~0.8.2

## Usage

  - Options
    - host - default (127.0.0.1) - Set the Redis-server Host IP
    - port - default (6379) - Set the Redis-server Port #
    - connect_timeout - default (false) - Client will keep reconnecting until connected. This parameter should be in milliseconds and is counted once the disconnect occurs
    - max_attempts - default (null) - Client will keep reconnecting until connected. This parameter limits the total amount of reconnects
    - pubClient - optional - Publish client - write
    - subClient - optional - Subscribe client - read

```javascript
  var redisPubSub = require('redis-sub');

  var pubsub = new redisPubSub({}); // <-- Options

  var duckFunc = function(quack) {
    console.log("QUACK!!?", quack);
  }
  pubsub.on('ducks', duckFunc);

  pubsub.publish('ducks', "Quack! Quack...? QUUAWWWKWKKK");

  pubsub.removeListener('ducks', duckFunc);
  // OR
  pubsub.removeAllListeners('ducks');
```

## License (MIT)

Copyright 2013 Mathieu Gosbee

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.