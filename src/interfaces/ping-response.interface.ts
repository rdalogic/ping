export interface PingResponse {
  output: string | null;
  times: any[];
  min: number | null;
  avg: number;
  alive: boolean;
  packetLoss: number | null;
  max: number | null;
  host: string | null;
  inputHost: any;
  time: number | null;
  stddev: number | null;
  numeric_host?: string | null;
  [index: string]:any;
}