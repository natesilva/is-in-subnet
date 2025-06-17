# is-in-subnet
[![npm](https://img.shields.io/npm/v/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![license](https://img.shields.io/github/license/natesilva/is-in-subnet.svg)](https://github.com/natesilva/is-in-subnet/blob/master/LICENSE) [![node](https://img.shields.io/node/v/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![bundle size](https://img.shields.io/bundlephobia/minzip/is-in-subnet)](https://bundlephobia.com/package/is-in-subnet)

Checks if an IPv4 or IPv6 address is contained within a given [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) subnet.

- Accurately handles both IPv4 and IPv6 addresses.
- Thorough tests.
- Fast and efficient: hundreds of thousands of checks per second on low-end hardware.

## Example

```javascript
import { isInSubnet } from "is-in-subnet"; // Node.js
import { isInSubnet } from "@natesilva/is-in-subnet"; // Deno or Bun

console.log(isInSubnet("10.5.0.1", "10.4.5.0/16")); // false
console.log(isInSubnet("10.5.0.1", "10.4.5.0/15")); // true

console.log(isInSubnet("2001:db8:f53a::1", "2001:db8:f53b::1:1/48")); // false
console.log(isInSubnet("2001:db8:f53a::1", "2001:db8:f531::1:1/44")); // true
```
