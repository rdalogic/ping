import { PingConfig } from "../interfaces/ping-config.interface";
import { PingResponse } from "../interfaces/ping-response.interface";

/**
 * Parsed response
 * @typedef {object} PingResponse
 * @param {string} inputHost - The input IP address or HOST
 * @param {string} host - The input IP address or HOST
 * @param {string} numeric_host - Target IP address
 * @param {boolean} alive - True for existed host
 * @param {string} output - Raw stdout from system ping
 * @param {number} time - Time (float) in ms for first successful ping response
 * @param {string} min - Minimum time for collection records
 * @param {string} max - Maximum time for collection records
 * @param {string} avg - Average time for collection records
 * @param {number} packetLoss - Packet Losses in percent (number)
 * @param {string} stddev - Standard deviation time for collected records
 */

/**
 * Enum for parser states
 */
export enum STATES {
  INIT = 0,
  HEADER = 1,
  BODY = 2,
  FOOTER = 3,
  END = 4,
}

export abstract class BaseParser {
  protected _response: PingResponse;
  protected _times: any[];
  private _state: number;
  private _lines: any[];
  protected _pingConfig: PingConfig;
  private readonly _stripRegex: RegExp;

  /**
   * @constructor
   *
   * @param {string} addr - Hostname or ip addres
   * @param {PingConfig} config - Config object in probe()
   */
  constructor(addr: string, config: PingConfig) {
    // Initial state is 0
    this._state = 0;

    // Initial cache value
    this._response = {
      inputHost: addr,
      host: null,
      alive: false,
      output: null,
      time: null,
      times: [],
      min: 0,
      max: 0,
      avg: 0,
      stddev: null,
      packetLoss: null,
    };

    // Initial times storage for ping time
    this._times = [];

    // Initial lines storage for ping output
    this._lines = [];

    // strip string regexp
    this._stripRegex = /[ ]*\r?\n?$/g;

    // Ping Config
    this._pingConfig = config || {};
  }

  /**
   * Change state of this parser
   * @param {number} state - parser.STATES
   * @return {this} - This instance
   */
  _changeState(state: STATES) {
    if (!Object.values(STATES).includes(state)) {
      throw new Error("Unknown state");
    }

    this._state = state;

    return this;
  }

  /**
   * Process output's header
   * @param {string} line - A line from system ping
   */
  protected abstract _processHeader(line: string): void;

  /**
   * Process output's body
   * @param {string} line - A line from system ping
   */
  protected abstract _processBody(line: string): void;

  /**
   * Process output's footer
   * @param {string} line - A line from system ping
   */
  protected abstract _processFooter(line: string): void;

  /**
   * Process a line from system ping
   * @param {string} line - A line from system ping
   * @return {this} - This instance
   */
  eat(line: string): BaseParser {
    const headerStates = [STATES.INIT, STATES.HEADER];

    // Store lines
    this._lines.push(line);

    // Strip all space \r\n at the end
    const _line = line.replace(this._stripRegex, "");

    if (_line.length === 0) {
      // Do nothing if this is an empty line
    } else if (headerStates.includes(this._state)) {
      this._processHeader(_line);
    } else if (this._state === STATES.BODY) {
      this._processBody(_line);
    } else if (this._state === STATES.FOOTER) {
      this._processFooter(_line);
    } else if (this._state === STATES.END) {
      // Do nothing
    } else {
      throw new Error("Unknown state");
    }

    return this;
  }

  /**
   * Get results after parsing certain lines from system ping
   * @return {PingResponse} - Response from parsing ping output
   */
  getResult(): PingResponse {
    const ret = { ...this._response };

    // Concat output
    ret.output = this._lines.join("\n");

    // Determine alive
    ret.alive = this._times.length > 0;

    // Update time at first successful line
    if (ret.alive) {
      this._response.time = this._times[0];
      ret.time = this._response.time;
      this._response.times = this._times;
      ret.times = this._response.times;
    }

    // Get stddev
    if (ret.stddev === null && ret.alive) {
      const numberOfSamples = this._times.length;

      const sumOfAllSquareDifferences = this._times.reduce((memory, time) => {
        const differenceFromMean = time - ret.avg;
        const squaredDifference = differenceFromMean * differenceFromMean;
        return memory + squaredDifference;
      }, 0);
      const variances = sumOfAllSquareDifferences / numberOfSamples;

      ret.stddev = Math.round(Math.sqrt(variances) * 1000) / 1000;
    }

    // Fix min, avg, max, stddev up to 3 decimal points
    const keys = ["min", "avg", "max", "stddev", "packetLoss"];
    for (const key of keys) {
      const v = ret[key];
      if (typeof v === "number") {
        ret[key] = v.toFixed(3);
      }
    }

    return ret;
  }
}
