import { IpTrie } from "./src/ip-trie.ts";
import { IPV4_ADDRESS_RANGE } from "./src/address-ranges/ipv4-address-range.ts";
import { IPV6_ADDRESS_RANGE } from "./src/address-ranges/ipv6-address-range.ts";

// Create a trie initialized with all predefined ranges
const trie = IpTrie.createFromRanges(IPV4_ADDRESS_RANGE, IPV6_ADDRESS_RANGE);

// Test IPs
const testIps = [
  "127.0.0.1",            // IPv4 localhost
  "10.0.0.1",             // Private IPv4
  "192.168.1.1",          // Private IPv4
  "8.8.8.8",              // Public IPv4 (Google DNS)
  "203.0.113.1",          // Reserved for documentation (TEST-NET-3)
  "::1",                  // IPv6 localhost
  "fe80::1",              // IPv6 link-local
  "2001:db8::1",          // IPv6 documentation
  "2001:4860:4860::8888", // Public IPv6 (Google DNS)
  "::ffff:192.168.1.1"    // IPv4-mapped IPv6 address
];

console.log("=== IP Range Lookup Using Trie ===\n");

for (const ip of testIps) {
  console.log(`IP: ${ip}`);
  console.log(`Ranges: ${trie.lookup(ip).join(", ") || "none"}`);
  console.log();
}