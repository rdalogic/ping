import * as util from 'util';
import { BaseParser, STATES } from './base.js';
import { PingConfig } from '../interfaces/ping-config.interface';
import { IPV4REGEX } from '../ping.constants.js';

export class WinParser extends BaseParser {
  
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
    // XXX: Expect to find [****] when pinging domain like google.com
    //      Read fixture/win/**/* for the detail
    const isPingNumeric = line.indexOf('[') === -1;
    
    // Get host and numeric_host
    const tokens = line.split(' ');
    
    if (isPingNumeric) {
      // For those missing [***], get the first token which match IPV4 regex
      this._response.host = tokens.find((t) => IPV4REGEX.test(t)) || null;
      this._response.numeric_host = this._response.host;
    } else {
      // For those has [***], anchor with such token
      const numericHost = tokens.find((t) => t.indexOf('[') !== -1);
      if (numericHost) {
        const numericHostIndex = tokens.indexOf(numericHost);
        const match = /\[(.*)\]/.exec(numericHost);
        
        if (match) {
          // Capture IP inside [] only. refs #71
          this._response.numeric_host = match[1];
        } else {
          // Otherwise, just mark as NA to indicate an error
          this._response.numeric_host = 'NA';
        }
        this._response.host = tokens[numericHostIndex - 1];
      }
    }
    
    this._changeState(STATES.BODY);
  };
  
  /**
   * Process ipv6 output's body
   * @param {string} line - A line from system ping
   */
  _processIPV6Body(line: string) {
    const tokens = line.split(' ');
    let dataFields = tokens.filter((token) => {
      return token.indexOf('=') >= 0 || token.indexOf('<') >= 0;
    });
    
    // refs #65: Support system like french which has an extra space
    dataFields = dataFields.map((dataField) => {
      let ret = dataField;
      const dataFieldIndex = tokens.indexOf(dataField);
      const nextIndex = dataFieldIndex + 1;
      
      // Append the missing *ms*
      if (nextIndex < tokens.length) {
        if (tokens[nextIndex] === 'ms') {
          ret += 'ms';
        }
      }
      
      return ret;
    });
    
    const expectDataFieldInReplyLine = 1;
    if (dataFields.length >= expectDataFieldInReplyLine) {
      // XXX: Assume time will alaways get keyword ms for all language
      const timeKVP = dataFields.find((dataField) => dataField.search(/(ms|мс)/i) >= 0);
      const regExp = /([0-9.]+)/;
      if (timeKVP) {
        const match = regExp.exec(timeKVP);
        
        if (match) {
          this._times.push(parseFloat(match[1]));
        }
      }
    }
  };
  
  /**
   * Process ipv4 output's body
   * @param {string} line - A line from system ping
   */
  _processIPV4Body(line: string) {
    const tokens = line.split(' ');
    const byteTimeTTLFields = tokens.filter((token) => {
      return token.indexOf('=') >= 0 || token.indexOf('<') >= 0;
    });
    
    const expectDataFieldInReplyLine = 3;
    const isReplyLine = byteTimeTTLFields.length >= expectDataFieldInReplyLine;
    if (isReplyLine) {
      const packetSize = this._pingConfig.packetSize;
      const byteField = byteTimeTTLFields.find((dataField) => {
        const packetSizeToken = util.format('=%d', packetSize);
        return dataField.indexOf(packetSizeToken) >= 0;
      });
      
      if (byteField) {
        // XXX: Assume time field will always be next of byte field
        const byteFieldIndex = byteTimeTTLFields.indexOf(byteField);
        const timeFieldIndex = byteFieldIndex + 1;
        const timeKVP = byteTimeTTLFields[timeFieldIndex];
        
        const regExp = /([0-9.]+)/;
        const match = regExp.exec(timeKVP) || [];
        
        this._times.push(parseFloat(match[1]));
      }
    }
  };
  
  /**
   * Process output's body
   * @param {string} line - A line from system ping
   */
  _processBody(line: string) {
    const isPingSummaryLineShown = line.slice(-1) === ':';
    if (isPingSummaryLineShown) {
      this._changeState(STATES.FOOTER);
      return;
    }
    
    const isIPV6 = this._pingConfig.v6;
    if (isIPV6) {
      this._processIPV6Body(line);
    } else {
      this._processIPV4Body(line);
    }
  };
  
  /**
   * Process output's footer
   * @param {string} line - A line from system ping
   */
  _processFooter(line: string) {
    const packetLoss = line.match(/([\d.]+)%/);
    if (packetLoss) {
      this._response.packetLoss = parseFloat(packetLoss[1]);
    }
    
    // XXX: Assume there is a keyword ms
    if (line.search(/(ms|мсек)/i) >= 0) {
      // XXX: Assume the ordering is Min Max Avg
      const regExp = /([0-9.]+)/g;
      const m1 = regExp.exec(line) || [];
      const m2 = regExp.exec(line) || [];
      const m3 = regExp.exec(line) || [];
      
      if ([m1, m2, m3].every(() => true)) {
        this._response.min = parseFloat(m1[1]);
        this._response.max = parseFloat(m2[1]);
        this._response.avg = parseFloat(m3[1]);
        this._changeState(STATES.END);
      }
    }
  };
}
