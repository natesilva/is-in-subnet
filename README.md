# is-in-subnet [![npm](https://img.shields.io/npm/v/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![dependencies](https://img.shields.io/david/natesilva/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![license](https://img.shields.io/github/license/natesilva/is-in-subnet.svg)](https://github.com/natesilva/is-in-subnet/blob/master/LICENSE) [![node](https://img.shields.io/node/v/is-in-subnet.svg)](https://www.npmjs.com/package/p-ratelimit)

Check if an IPv4 or IPv6 address is contained in the given [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) subnet.

- Small
- Fast
- Simple syntax
- Full test coverage
- TypeScript-friendly
- Zero dependencies
- 🆕 [Browser-friendly](#in-a-browser)

See the 📖 [Reference](doc/reference.md) page for complete documentation.

## Installation

### With Node.js

`npm install is-in-subnet`

### In a browser

This module is compatible with Browserify and other bundling tools. If you prefer to load it as a single file from a CDN:

- <https://cdn.jsdelivr.net/npm/is-in-subnet@3/browser/isInSubnet.js>
- <https://cdn.jsdelivr.net/npm/is-in-subnet@3/browser/isInSubnet.min.js>

The module is loaded as a global named `isInSubnet`.

## Basic Usage

### Node.js

```javascript
const { isInSubnet } = require('is-in-subnet');

console.log(isInSubnet('10.5.0.1', '10.4.5.0/16')); // false
console.log(isInSubnet('10.5.0.1', '10.4.5.0/15')); // true

console.log(isInSubnet('2001:db8:f53a::1', '2001:db8:f53b::1:1/48')); // false
console.log(isInSubnet('2001:db8:f53a::1', '2001:db8:f531::1:1/44')); // true
```

### Browser

```javascript
console.log(isInSubnet.isInSubnet('10.5.0.1', '10.4.5.0/16'));
// if you don’t like that syntax, you may use this instead:
console.log(isInSubnet.check('10.5.0.1', '10.4.5.0/16'));
```

## More ways to use it

### Test multiple subnets at once

- You can pass an array instead of a single subnet.

```javascript
const inAnySubnet = isInSubnet('10.5.0.1', ['10.4.5.0/16', '192.168.1.0/24']);
```

### Amortise the parsing cost using a functional version

- `createChecker(subnetOrSubnets)` returns a function used to check an address

```javascript
const checker = createChecker(['10.4.5.0/16', '192.168.1.0/24']);
console.log(checker('10.5.0.1')); // true
```

### Test for special types of addresses

- `isPrivate(address)` — Private addresses (like `192.168.0.0`)
- `isLocalhost(address)` — Localhost addresses (like `::1`)

And more. See the [documentation](doc/reference.md#testing-for-special-address-ranges).

### Check if an address is valid

- `isIPv4(address)`, `isIPv6(address)`, `isIP(address)` — works just like the similarly-named functions in Node’s `net` module.
