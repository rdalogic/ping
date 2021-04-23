import * as util from 'util';

// Our library
import { LinuxBuilder } from './linux.js';
import { MacBuilder } from './mac.js';
import { WinBuilder } from './win.js';

/**
 * A factory creates argument builders for different platform
 * @constructor
 */
export class BuilderFactory {
  
  /**
   * Check out linux platform
   */
  static isLinux(p: string): boolean {
    const platforms = [
      'aix',
      'android',
      'linux',
    ];
    
    return platforms.indexOf(p) >= 0;
  };
  
  /**
   * Check out macos platform
   */
  static isMacOS(p: string): boolean {
    const platforms = [
      'darwin',
      'freebsd',
    ];
    
    return platforms.indexOf(p) >= 0;
  };
  
  /**
   * Check out window platform
   */
  static isWindow(p: string): boolean {
    return p?.match(/^win/) !== null;
  };
  
  /**
   * Check whether given platform is supported
   * @param {string} p - Name of the platform
   * @return {boolean} - True or False
   */
  static isPlatformSupport(p: string): boolean {
    return this.isWindow(p) || this.isLinux(p) || this.isMacOS(p);
  };
  
  /**
   * Return a path to the ping executable in the system
   * @param platform - Name of the platform
   * @param v6 - Ping via ipv6 or not
   * @return {string} - Executable path for system command ping
   * @throw if given platform is not supported
   */
  static getExecutablePath(platform: string, v6: boolean): string | null {
    if (!BuilderFactory.isPlatformSupport(platform)) {
      throw new Error(util.format('Platform |%s| is not support', platform));
    }
    
    let ret = null;
    
    if (platform === 'aix') {
      ret = '/usr/sbin/ping';
    } else if (BuilderFactory.isLinux(platform)) {
      ret = v6 ? 'ping6' : 'ping';
    } else if (BuilderFactory.isWindow(platform)) {
      ret = process.env.SystemRoot + '/system32/ping.exe';
    } else if (BuilderFactory.isMacOS(platform)) {
      ret = v6 ? '/sbin/ping6' : '/sbin/ping';
    }
    
    return ret;
  };
  
  /**
   * Create a builder
   * @param {NodeJS.Platform} platform - Name of the platform
   * @return {object} - Argument builder
   * @throw if given platform is not supported
   */
  static createBuilder(platform: NodeJS.Platform) {
    if (!BuilderFactory.isPlatformSupport(platform)) {
      throw new Error(util.format('Platform |%s| is not support', platform));
    }
    
    let ret = null;
    
    if (BuilderFactory.isLinux(platform)) {
      return LinuxBuilder;
    } else if (BuilderFactory.isWindow(platform)) {
      return WinBuilder;
    } else if (BuilderFactory.isMacOS(platform)) {
      return MacBuilder;
    }
    
    return ret;
  };
}