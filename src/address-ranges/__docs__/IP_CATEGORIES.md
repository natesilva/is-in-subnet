# IP Address Categories

This document lists the IP address categories used in this library, along with their corresponding IP address ranges.

<!-- #region localhost -->

## Localhost

Represents loopback addresses.

- **LOCALHOST_V4**: `127.0.0.0/8` ([RFC 6890](https://tools.ietf.org/html/rfc6890))
- **LOCALHOST_V6**: `::1/128` ([RFC 6890](https://tools.ietf.org/html/rfc6890))
- **LOCALHOST**: Includes both LOCALHOST_V4 and LOCALHOST_V6.
<!-- #endregion localhost -->

<!-- #region private -->

## Private

Represents private-use IP addresses.

- **PRIVATE_V4** ([RFC 1918](https://tools.ietf.org/html/rfc1918)):
  - `10.0.0.0/8`
  - `172.16.0.0/12`
  - `192.168.0.0/16`
- **PRIVATE_V6**:
  - `fe80::/10` (Link-Scoped Unicast, [RFC 4291](https://tools.ietf.org/html/rfc4291))
  - `fc00::/7` (Unique Local, [RFC 4193](https://tools.ietf.org/html/rfc4193))
- **PRIVATE**: Includes both PRIVATE_V4 and PRIVATE_V6.
<!-- #endregion private -->

<!-- #region reserved -->

## Reserved

Represents reserved IP addresses for various special purposes.

- **RESERVED_V4** ([RFC 5735](https://tools.ietf.org/html/rfc5735)):
  - `0.0.0.0/8` (Broadcast This)
  - `100.64.0.0/10` (Carrier Grade NAT, [RFC 6598](https://tools.ietf.org/html/rfc6598))
  - `169.254.0.0/16` (Link Local, [RFC 3927](https://tools.ietf.org/html/rfc3927))
  - `192.0.0.0/24` (IETF Protocol Assignments)
  - `192.0.0.0/29` (DS-Lite, [RFC 6333](https://tools.ietf.org/html/rfc6333))
  - `192.0.2.0/24` (Test Net 1, [RFC 5737](https://tools.ietf.org/html/rfc5737))
  - `192.88.99.0/24` (6to4 Relay Anycast, [RFC 3068](https://tools.ietf.org/html/rfc3068))
  - `198.18.0.0/15` (Benchmarking, [RFC 2544](https://tools.ietf.org/html/rfc2544))
  - `198.51.100.0/24` (Test Net 2, [RFC 5737](https://tools.ietf.org/html/rfc5737))
  - `203.0.113.0/24` (Test Net 3, [RFC 5737](https://tools.ietf.org/html/rfc5737))
  - `224.0.0.0/4` (Multicast, [RFC 5771](https://tools.ietf.org/html/rfc5771))
  - `240.0.0.0/4` (Reserved 1)
  - `255.255.255.255/32` (Limited Broadcast)
- **RESERVED_V6** ([RFC 5156](https://tools.ietf.org/html/rfc5156)):
  - `::/128` (Unspecified, [RFC 4291](https://tools.ietf.org/html/rfc4291))
  - `64:ff9b::/96` (IPv4-IPv6 Translation, [RFC 6052](https://tools.ietf.org/html/rfc6052))
  - `100::/64` (Discard Only, [RFC 6666](https://tools.ietf.org/html/rfc6666))
  - `2001::/32` (Teredo, [RFC 4380](https://tools.ietf.org/html/rfc4380))
  - `2001:db8::/32` (Documentation, [RFC 3849](https://tools.ietf.org/html/rfc3849))
  - `2002::/16` (6to4, [RFC 3056](https://tools.ietf.org/html/rfc3056))
  - `ff00::/8` (Multicast, [RFC 4291](https://tools.ietf.org/html/rfc4291))
  - `2001:20::/28` (ORCHIDv2, [RFC 7343](https://tools.ietf.org/html/rfc7343))
- **RESERVED**: Includes both RESERVED_V4 and RESERVED_V6.
<!-- #endregion reserved -->

## Special

A comprehensive category that includes Localhost, Private, and Reserved addresses.

- **SPECIAL_V4**: Includes LOCALHOST_V4, PRIVATE_V4, and RESERVED_V4.
- **SPECIAL_V6**: Includes LOCALHOST_V6, PRIVATE_V6, and RESERVED_V6.
- **SPECIAL**: Includes all of the above.
