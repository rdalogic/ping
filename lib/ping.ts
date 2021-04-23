// System library
import * as util from 'util';
import * as net from 'net';
import * as cp from 'child_process';
import * as os from 'os';

// Our library
import { BuilderFactory } from './builder/factory.js';
import { ParserFactory } from './parser/factory.js';
import { PingConfig } from './interfaces/ping-config.interface.js';
import { PingResponse } from './interfaces/ping-response.interface.js';

export class Ping {
  
  /**
   * @param {string} host - Hostname or ip addres
   * @param {PingConfig} config - Configuration for command ping
   * @return {Promise}
   */
  static probe(host: string, config: PingConfig = ({} as PingConfig)): Promise<PingResponse> {
    return Ping._probe(host, config);
  }
  
  /**
   * @param {string} host - Hostname or ip addres
   * @param {probeCallback} cb - Callback
   * @param {PingConfig} config - Configuration for command ping
   */
  static probeCb(host: string, cb: (res: PingResponse | null, err?: string) => void, config: PingConfig = ({} as PingConfig)) {
    Ping.probe(host, config)
      .then((res: PingResponse) => {
        cb(res);
      }).catch((err) => {
        cb(null, err);
      });
  }
  
  private static _probe(host: string, config: PingConfig = ({} as PingConfig)): Promise<PingResponse> {
    
    return new Promise((resolve, reject) => {
      if (config.v6 === undefined) {
        config.v6 = net.isIPv6(host);
      }
      
      // Spawn a ping process
      let ping;
      const platform = os.platform();
      try {
        const argumentBuilder = BuilderFactory.createBuilder(platform);
        if (!argumentBuilder) {
          reject('Platform not supported');
        }
        const pingExecutablePath = BuilderFactory.getExecutablePath(platform, config.v6) || '';
        if (!pingExecutablePath) {
          reject('Platform not supported');
        }
        const pingArgs = argumentBuilder?.getCommandArguments(host, config);
        const spawnOptions = argumentBuilder?.getSpawnOptions();
        ping = cp.spawn(pingExecutablePath, pingArgs, spawnOptions);
      } catch (err) {
        reject(err);
      }
      
      // Initial parser
      const parser = ParserFactory.createParser(host, platform, config);
      if (!parser) {
        return Promise.reject('Platform not supported');
      }
      
      // Register events from system ping
      ping?.once('error', () => {
        const err = new Error(
          util.format(
            'ping.probe: %s. %s',
            'there was an error while executing the ping program. ',
            'Check the path or permissions...'
          )
        );
        reject(err);
      });
      
      // Cache all lines from the system ping
      const outString: string[] = [];
      ping?.stdout.on('data', (data) => {
        outString.push(String(data));
      });
      
      
      // Parse lines we have on closing system ping
      ping?.once('close', () => {
        // Merge lines we have and split it by \n
        let lines = outString.join('').split('\n');
        
        // Parse line one by one
        lines.forEach(parser.eat, parser);
        
        // Get result
        const ret = parser.getResult();
        
        resolve(ret);
      });
    });
  }
}
