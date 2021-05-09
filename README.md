<p align="center">
  <a href="https://www.npmjs.com/package/@rdalogic/ping" target="_blank"><img src="https://img.shields.io/npm/v/@rdalogic/ping.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/@rdalogic/ping" target="_blank"><img src="https://img.shields.io/npm/l/@rdalogic/ping.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/package/@rdalogic/ping" target="_blank"><img src="https://img.shields.io/npm/dm/@rdalogic/ping.svg" alt="NPM Downloads" /></a>
  <a href="https://coveralls.io/github/rdalogic/ping?branch=master"><img class="notice-badge" src="https://coveralls.io/repos/github/rdalogic/ping/badge.svg?branch=main" alt="Badge"></a>
</p>

# @rdalogic/ping

## Description

Simple and lightweight ES6 node-ping wrapper for the system ping utility with no 3-d part dependencies used.

Supported OS:

- linux
- windows
- macOS

## INSTALLATION

```
npm install @rdalogic/ping
```

## USAGE

Below are examples extracted from `examples`

## ES6 imports

```js
import {Ping} from '@rdalogic/ping'
```

## Tradition calls

```js
const hosts = ['192.168.1.1', 'google.com', 'yahoo.com'];
hosts.forEach((host) => {
    Ping.probeCb(host, (res) => {
        const msg = res.alive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
        console.log(msg);
    });
});
```

## Tradition calls with configuration

```js
const cfg = {
    timeout: 10,
    // WARNING: -i 2 may not work in other platform like windows
    extra: ['-i', '2'],
};

hosts.forEach((host) => {
    Ping.probeCb(host, (res) => {
        const msg = res.alive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
        console.log(msg);
    }, cfg);
});
```

## Promise wrapper

```js
const hosts = ['192.168.1.1', 'google.com', 'yahoo.com'];

hosts.forEach((host) => {
    Ping.probe(host)
        .then((res) => {
            console.log(res);
        });
});
```

## Promise Wrapper with configurable ping options

```js
hosts.forEach((host) => {
    // WARNING: -i 2 argument may not work in other platform like windows
    Ping.probe(host, {
        timeout: 10,
        extra: ['-i', '2'],
    }).then((res) => {
        console.log(res);
    });
});
```

## Async-Await

```js
const hosts = ['192.168.1.1', 'google.com', 'yahoo.com'];

for (let host of hosts) {
    let res = await Ping.probe(host);
    console.log(res);
}
```

## Async-Await with configurable ping options

```js
const hosts = ['192.168.1.1', 'google.com', 'yahoo.com'];

for (let host of hosts) {
    // WARNING: -i 2 argument may not work in other platform like windows
    let res = await Ping.probe(host, {
        timeout: 10,
        extra: ['-i', '2'],
    });
    console.log(res);
}
```

### Support configuration

```js
/**
 * Cross platform config representation
 * @typedef {Object} PingConfig
 * @property {boolean} numeric - Map IP address to hostname or not
 * @property {number} timeout - Timeout in seconds for each ping request.
 * Behaviour varies between platforms. Check platform ping documentation for more information.
 * @property {number} deadline - Specify a timeout, in seconds, before ping exits regardless of
 how many packets have been sent or received. In this case ping
 does not stop after count packet are sent, it waits either for
 deadline expire or until count probes are answered or for some
 error notification from network. This option is only available on linux and mac.
 * @property {number} min_reply - Exit after sending number of ECHO_REQUEST
 * @property {boolean} v6 - Ping via ipv6 or not. Default is false
 * @property {string} sourceAddr - source address for sending the ping
 * @property {number} packetSize - Specifies the number of data bytes to be sent
 Default: Linux / MAC: 56 Bytes, Windows: 32 Bytes
 * @property {string[]} extra - Optional options does not provided
 */
```

### Output specification

* For callback based implementation:

```js
/**
 * Callback after probing given host
 * @callback probeCallback
 * @param {boolean} isAlive - Whether target is alive or not
 * @param {Object} error - Null if no error occurs
 */
```

* For promise based implementation

```js
/**
 * Parsed response
 * @typedef {object} PingResponse
 * @param {string} inputHost - The input IP address or HOST
 * @param {string} host - Parsed host from system command's output
 * @param {string} numeric_host - Target IP address
 * @param {boolean} alive - True for existed host
 * @param {string} output - Raw stdout from system ping
 * @param {number} time - Time (float) in ms for first successful ping response
 * @param {Array} times - Array of Time (float) in ms for each ping response
 * @param {string} min - Minimum time for collection records
 * @param {string} max - Maximum time for collection records
 * @param {string} avg - Average time for collection records
 * @param {string} packetLoss - Packet Losses in percent (100% -> "100.000")
 * @param {string} stddev - Standard deviation time for collected records
 */
```

#### Note

* Since `ping` in this module relies on the `ping` from underlying platform, arguments in `PingConfig.extra` will
  definitely be varied across different platforms.

* However, `numeric`, `timeout` and `min_reply` have been abstracted. Values for them are expected to be cross platform.

* By setting `numeric`, `timeout` or `min_reply` to false, you can run `ping`
  without corresponding arguments.

## LICENSE MIT

(C) Dmytro Rybachuk

https://github.com/rdalogic/ping.git