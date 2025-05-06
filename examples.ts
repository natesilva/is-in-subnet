import { getIpRanges, getDetailedIpRanges } from "./src/get-ip-ranges.ts";

// Examples
const examples = [
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

// Basic usage - get range names
console.log("\n=== Basic Usage - Range Names ===\n");
for (const ip of examples) {
  const ranges = getIpRanges(ip);
  console.log(`IP: ${ip}`);
  console.log(`Ranges: ${ranges.length > 0 ? ranges.join(", ") : "none"}`);
  console.log();
}

// Detailed usage - get full information
console.log("\n=== Detailed Information ===\n");
const ip = "::ffff:192.168.1.1"; // IPv4-mapped IPv6 address
const details = getDetailedIpRanges(ip);
console.log(`IP: ${ip}`);
console.log("IPv6 Matches:");
details.ipv6Matches.forEach(match => {
  console.log(`  ${match.rangeName}: ${match.matchedSubnets.join(", ")}`);
});
console.log("IPv4 Matches (via mapping):");
details.ipv4Matches.forEach(match => {
  console.log(`  ${match.rangeName}: ${match.matchedSubnets.join(", ")}`);
});