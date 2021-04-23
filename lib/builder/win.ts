/**
 * A builder builds command line arguments for ping in window environment
 * @module lib/builder/win
 */
import * as util from 'util';
import { PingConfig } from '../interfaces/ping-config.interface';

/**
 * Cross platform config representation
 * @typedef {Object} PingConfig
 * @property {boolean} numeric - Map IP address to hostname or not
 * @property {number} timeout - Timeout in seconds for each ping request
 * @property {number} min_reply - Exit after sending number of ECHO_REQUEST
 * @property {boolean} v6 - Use IPv4 (default) or IPv6
 * @property {string} sourceAddr - source address for sending the ping
 * @property {number} packetSize - Specifies the number of data bytes to be sent
 *                                 Default: Linux / MAC: 56 Bytes,
 *                                          Window: 32 Bytes
 * @property {string[]} extra - Optional options does not provided
 */

const DEFAULT_CONFIG: PingConfig = {
  numeric: true,
  timeout: 5,
  min_reply: 1,
  v6: false,
  sourceAddr: '',
  packetSize: 32,
  extra: [],
};

export class WinBuilder {
  
  /**
   * Get the finalized array of command line arguments
   * @param {string} target - hostname or ip address
   * @param {PingConfig} [config] - Configuration object for cmd line argument
   * @return {string[]} - Command line argument according to the configuration
   */
  static getCommandArguments(target: string, config: PingConfig): string[] {
    const _config = config || {};
    
    // Empty argument
    let ret = [];
    
    // Make every key in config has been setup properly
    const keys = [
      'numeric', 'timeout', 'min_reply', 'v6', 'sourceAddr', 'extra',
      'packetSize',
    ];
    for (const key of keys) {
      // Falsy value will overrides without below checking
      if (typeof (_config[key]) !== 'boolean') {
        _config[key] = _config[key] || DEFAULT_CONFIG[key];
      }
    }
    
    ret.push(_config.v6 ? '-6' : '-4');
    
    if (!_config.numeric) {
      ret.push('-a');
    }
    
    if (_config.timeout) {
      // refs #56: Unit problem
      // Our timeout is in second while timeout in window is in milliseconds
      // so we need to convert our units accordingly
      ret = ret.concat([
        '-w',
        util.format('%d', _config.timeout * 1000),
      ]);
    }
    
    if (_config.deadline) {
      throw new Error('There is no deadline option on windows');
    }
    
    if (_config.min_reply) {
      ret = ret.concat([
        '-n',
        util.format('%d', _config.min_reply),
      ]);
    }
    
    if (_config.sourceAddr) {
      ret = ret.concat([
        '-S',
        util.format('%s', _config.sourceAddr),
      ]);
    }
    
    if (_config.packetSize) {
      ret = ret.concat([
        '-l',
        util.format('%d', _config.packetSize),
      ]);
    }
    
    if (_config.extra) {
      ret = ret.concat(_config.extra);
    }
    
    ret.push(target);
    
    return ret;
  };
  
  /**
   * Compute an option object for child_process.spawn
   * @return {object} - Refer to document of child_process.spawn
   */
  static getSpawnOptions() {
    return {
      windowsHide: true,
    };
  };
}
