# is-in-subnet [![npm](https://img.shields.io/npm/v/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![dependencies](https://img.shields.io/david/natesilva/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![license](https://img.shields.io/github/license/natesilva/is-in-subnet.svg)](https://github.com/natesilva/is-in-subnet/blob/master/LICENSE) [![node](https://img.shields.io/node/v/is-in-subnet.svg)](https://www.npmjs.com/package/p-ratelimit)

Check if an IPv4 or IPv6 address is contained in the given [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) subnet.

- Small
- Fast
- Simple syntax
- Full test coverage
- TypeScript-friendly
- Zero dependencies
- 🆕 [Browser-friendly](#loading-in-a-browser-from-a-cdn)

## Installation

`npm i is-in-subnet`

### Using this module in a browser

This module is compatible with Browserify and other bundling tools. If you prefer to load this module as a single file from a CDN:

- <https://cdn.jsdelivr.net/npm/is-in-subnet@latest/browser/isInSubnet.js>
- <https://cdn.jsdelivr.net/npm/is-in-subnet@latest/browser/isInSubnet.min.js>

The module is loaded as a global named `isInSubnet`.

## Usage

```javascript
const { isInSubnet } = require('is-in-subnet');

console.log(isInSubnet('10.5.0.1', '10.4.5.0/16')); // false
console.log(isInSubnet('10.5.0.1', '10.4.5.0/15')); // true

console.log(isInSubnet('2001:db8:f53a::1', '2001:db8:f53b::1:1/48')); // false
console.log(isInSubnet('2001:db8:f53a::1', '2001:db8:f531::1:1/44')); // true
```

## More ways to use it

### `check` is an alias for `isInSubnet`

The `check` function is an alias for the `isInSubnet` function. This makes browser usage a
bit nicer:

```javascript
// if you don’t like this syntax in the browser:
console.log(isInSubnet.isInSubnet('10.5.0.1', '10.4.5.0/16'));
// you may use this instead:
console.log(isInSubnet.check('10.5.0.1', '10.4.5.0/16'));
```

### Test multiple subnets at once

You can pass an array instead of a single subnet.

```javascript
const inAnySubnet = isInSubnet('10.5.0.1', ['10.4.5.0/16', '192.168.1.0/24']);
```

This module recognizes several special classes of addresses.

### Private addresses

```javascript
isPrivate(address);
```

True if the address is in a private/internal address range, such as `192.168.1.1` or similar, or an IPv6 Unique Local Address.

### Localhost addresses

```javascript
isLocalhost(address);
```

True if the address represents the localhost, such as `127.0.0.1` or `::1`.
