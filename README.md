# is-in-subnet
[![npm](https://img.shields.io/npm/v/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![license](https://img.shields.io/github/license/natesilva/is-in-subnet.svg)](https://github.com/natesilva/is-in-subnet/blob/master/LICENSE) [![node](https://img.shields.io/node/v/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![bundle size](https://img.shields.io/bundlephobia/minzip/is-in-subnet)](https://bundlephobia.com/package/is-in-subnet)

Checks if an IPv4 or IPv6 address is contained within a given [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) subnet.

Key Features:

- Small footprint
- Fast performance
- Simple API
- Comprehensive test coverage
- TypeScript support
- Zero external dependencies
- ESM and CommonJS compatibility
- Works in Node.js and browsers

## Getting Started

### ESM, TypeScript, Node.js, Bundlers

Install the package:

```shell
deno add jsr:@natesilva/is-in-subnet
pnpm add jsr:@natesilva/is-in-subnet
yarn add jsr:@natesilva/is-in-subnet

# for NPM:
npx jsr add @natesilva/is-in-subnet
```

Then, import and use the `isInSubnet` function:

```javascript
import { isInSubnet } from "is-in-subnet";

console.log(isInSubnet("10.5.0.1", "10.4.5.0/16")); // false
console.log(isInSubnet("10.5.0.1", "10.4.5.0/15")); // true

console.log(isInSubnet("2001:db8:f53a::1", "2001:db8:f53b::1:1/48")); // false
console.log(isInSubnet("2001:db8:f53a::1", "2001:db8:f531::1:1/44")); // true
```

### In a browser (without a bundler)

For direct use in a browser without a bundler, you can use a CDN like unpkg or jsdelivr.

```html
<!-- From unpkg -->
<script src="https://unpkg.com/is-in-subnet@latest"></script>

<!-- Or, from jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/is-in-subnet@latest"></script>

<script>
  // The IsInSubnet object is available in the global scope
  console.log(IsInSubnet.isInSubnet("10.5.0.1", "10.4.5.0/16"));
  // Alternatively, use the check alias:
  console.log(IsInSubnet.check("10.5.0.1", "10.4.5.0/16"));
</script>
```
