export interface PingConfig {
  v6: boolean;
  min_reply: number;
  extra: any[];
  numeric: boolean;
  sourceAddr: string;
  packetSize: number;
  deadline?: boolean;
  timeout: number;
  [index: string]:any;
}
