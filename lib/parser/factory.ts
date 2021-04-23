import * as util from 'util';

import { BuilderFactory } from '../builder/factory.js';
import { MacParser } from './mac.js';
import { WinParser } from './win.js';
import { LinuxParser } from './linux.js';
import { PingConfig } from '../interfaces/ping-config.interface';

/**
 * A factory creates a parser for parsing output from system ping
 */
export class ParserFactory {
  
  /**
   * Create a parser for a given platform
   * @param {string} addr - Hostname or ip addres
   * @param {string} platform - Name of the platform
   * @param {PingConfig} [config] - Config object in probe()
   * @return {object} - Parser
   * @throw if given platform is not supported
   */
  static createParser(addr: string, platform: string, config: PingConfig) {
    // Avoid function reassignment
    const _config = config || {};
    
    if (!BuilderFactory.isPlatformSupport(platform)) {
      throw new Error(util.format('Platform |%s| is not support', platform));
    }
    
    let ret = null;
    if (BuilderFactory.isWindow(platform)) {
      ret = new WinParser(addr, _config);
    } else if (BuilderFactory.isMacOS(platform)) {
      ret = new MacParser(addr, _config);
    } else if (BuilderFactory.isLinux(platform)) {
      ret = new LinuxParser(addr, _config);
    }
    
    return ret;
  };
}
