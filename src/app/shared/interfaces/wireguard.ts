export interface IPNet {
  IP: string;
  Mask: string;
}

export interface Network {
  id: string;
  name: string;
  addr: IPNet | string;
  addr6: IPNet | string;
  dns: string[] | null;
  domains: string[];
  info: object | null;
  user_id: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
  uuid: string;
}

export type PeerType = 'gateway' | 'node' | 'client';

export interface Peer {
  id: string | null;
  name: string;
  addr: string;
  cidr: IPNet | string;
  addr6: string | null;
  dns: string[] | null;
  network_id: string | null;
  allowed_ips: string[];
  endpoint: string | null;
  enabled: boolean | null;
  type: string | null;
  pubkey: string;
  privkey: string | null;
  presharedkey: string | null;
  info: object | null;
  user_id: string | null;
  listen_port: number | null;
  mtu: number | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
  uuid: string | null;
}
