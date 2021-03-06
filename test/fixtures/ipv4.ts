const fixtures: [string, string, boolean][] = [
  ['10.5.0.1', '0.0.0.0/0', true],
  ['10.5.0.1', '11.0.0.0/8', false],
  ['10.5.0.1', '10.0.0.0/8', true],
  ['10.5.0.1', '10.0.0.1/8', true],
  ['10.5.0.1', '10.0.0.10/8', true],
  ['10.5.0.1', '10.5.5.0/16', true],
  ['10.5.0.1', '10.4.5.0/16', false],
  ['10.5.0.1', '10.4.5.0/15', true],
  ['10.5.0.1', '10.5.0.2/32', false],
  ['10.5.0.1', '10.5.0.1/32', true],
  ['192.168.0.100', '192.168.0.0/24', true],
  ['192.168.1.100', '192.168.0.0/24', false],
  ['0.0.0.0', '0.0.0.0/0', true],
  ['1.1.1.1', '0.0.0.0/0', true],
  ['2.3.4.5', '0.0.0.0/0', true],
  ['0.0.0.1', '0.0.0.2/32', false],
  ['0.0.0.2', '0.0.0.2/32', true],
  ['0.0.0.3', '0.0.0.2/32', false],
  ['172.29.255.255', '172.30.0.0/16', false],
  ['172.30.0.0', '172.30.0.0/16', true],
  ['172.30.255.255', '172.30.0.0/16', true],
  ['172.31.0.0', '172.30.0.0/16', false]
];

export default fixtures;
