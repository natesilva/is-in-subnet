import { Ipv4Subnet } from "./src/ipv4/ipv4-subnet.ts";
import { SubnetGroup } from "./src/subnet-group.ts";

// Using the new spread constructor
const group = new SubnetGroup(
  new Ipv4Subnet("10.0.0.0/8"),
  new Ipv4Subnet("172.16.0.0/12"),
  new Ipv4Subnet("192.168.0.0/16")
);

console.log("SubnetGroup initialized successfully!");