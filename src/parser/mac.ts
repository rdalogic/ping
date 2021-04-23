import { BaseParser, STATES } from './base.js';
import { PingConfig } from '../interfaces/ping-config.interface';

export class MacParser extends BaseParser {
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
   * Process output's header
   * @param {string} line - A line from system ping
   */
  _processHeader(line: string) {
    // Get host and numeric_host
    const tokens = line.split(' ');
    
    this._response.host = tokens[1];
    this._response.numeric_host = tokens[2].slice(1, -2);
    
    this._changeState(STATES.BODY);
  }
  
  /**
   * Process output's body
   * @param {string} line - A line from system ping
   */
  _processBody(line: string) {
    // XXX: Assume there is at least 3 '=' can be found
    const count = (line.match(/=/g) || []).length;
    if (count >= 3) {
      const regExp = /([0-9.]+)[ ]*ms/;
      const match = regExp.exec(line);
      if (match && match.length > 0) {
        this._times.push(parseFloat(match[1]));
      }
    }
    
    // Change state if it see a '---'
    if (line.indexOf('---') >= 0) {
      this._changeState(STATES.FOOTER);
    }
  }
  
  /**
   * Process output's footer
   * @param {string} line - A line from system ping
   */
  _processFooter(line: string) {
    const packetLoss = line.match(/ ([\d.]+)%/);
    if (packetLoss) {
      this._response.packetLoss = parseFloat(packetLoss[1]);
    }
    
    // XXX: Assume number of keywords '/' more than 3
    const count = (line.match(/[/]/g) || []).length;
    if (count >= 3) {
      const regExp = /([0-9.]+)/g;
      // XXX: Assume min avg max stddev
      const m1 = regExp.exec(line) || [];
      const m2 = regExp.exec(line) || [];
      const m3 = regExp.exec(line) || [];
      const m4 = regExp.exec(line) || [];
      
      if ([m1, m2, m3, m4].every(() => true)) {
        this._response.min = parseFloat(m1[1]);
        this._response.avg = parseFloat(m2[1]);
        this._response.max = parseFloat(m3[1]);
        this._response.stddev = parseFloat(m4[1]);
        this._changeState(STATES.END);
      }
      
      this._changeState(STATES.END);
    }
  }
}
