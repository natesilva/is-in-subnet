const fixtures: [string, string, boolean][] = [
  ['2001:db8:f53a::1', '::/0', true],
  ['2001:db8:f53a::1', '2001:db8:f53a::1:1/64', true],
  ['2001:db8:f53a::1', '2001:db8:f53b::1:1/48', false],
  ['2001:db8:f53a::1', '2001:db8:f531::1:1/44', true],
  ['2001:db8:f53a::1', '2001:db8:f500::1/40', true],
  ['2001:db8:f53a::1', '2001:db8:f500::1%z/40', true],
  ['2001:db8:f53a::1', '2001:db9:f500::1/40', false],
  ['2001:db8:f53a::1', '2001:db9:f500::1%z/40', false],
  ['2001:db8:f53a:0:0:0:0:1', '2001:db8:f500:0:0:0:0:1%z/40', true],
  ['2001:db8::1', '2001:db8::/64', true],
  ['2001:db9::1', '2001:db8::/64', false],
  ['1::', '::/0', true],
  ['2::', '::/0', true],
  ['::ffff:0:0', '::ffff:0:0/96', true],
  ['::ffff:ffff:ffff', '::ffff:0:0/96', true],
  ['::fffe:0:0', '::ffff:0:0/96', false],
  ['::ffff:127.0.0.1', '::ffff:0:0/96', true]
];

export default fixtures;