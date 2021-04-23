import { BaseParser, STATES } from './base.js';
import { MacParser } from './mac.js';
import { PingConfig } from '../interfaces/ping-config.interface';

export class LinuxParser extends BaseParser {
  
  /**
   * @constructor
   *
   * @param {string} addr - Hostname or ip addres
   * @param {PingConfig} config - Config object in probe()
   */
  constructor(addr: string, config: PingConfig) {
    super(addr, config);
  }
  
  /**
   * Process output's body
   * @param {string} line - A line from system ping
   */
  _processHeader(line: string) {
    // Get host and numeric_host
    const tokens = line.split(' ');
    const isProbablyIPv4 = tokens[1].indexOf('(') === -1;
    
    if (isProbablyIPv4) {
      this._response.host = tokens[1];
      this._response.numeric_host = tokens[2].slice(1, -1);
    } else {
      // Normalise into either a 2 or 3 element array
      const foundAddresses = tokens.slice(1, -3).join('').match(/([^\s()]+)/g);
      this._response.host = foundAddresses?.shift() || null;
      this._response.numeric_host = foundAddresses?.pop();
    }
    
    this._changeState(STATES.BODY);
  };
  
  /**
   * Process output's body
   * @param {string} line - A line from system ping
   */
  _processBody(line: string) {
    // Reuse mac parser implementation
    MacParser.prototype._processBody.call(this, line);
  };
  
  /**
   * Process output's footer
   * @param {string} line - A line from system ping
   */
  _processFooter(line: string) {
    // Reuse mac parser implementation
    MacParser.prototype._processFooter.call(this, line);
  };
}
