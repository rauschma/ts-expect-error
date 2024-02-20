import ts from 'typescript';
import { normalizeWhitespace, removeSuffix } from '../util/strings.js';
import type { DiagnosticInfo } from './diagnostic-lookup.js';

const RE_ERROR_CODE = /\(([0-9]+)\)\s*$/u;
const ELLIPSIS = '[...]';

export class ExpectedMessageAndCode {
  message: null | string;
  code: null | number;

  constructor(textAfterPrefix: string) {
    const errorCodeMatch = RE_ERROR_CODE.exec(textAfterPrefix);
    if (errorCodeMatch) {
      this.code = Number(errorCodeMatch[1]);
      const message = textAfterPrefix.slice(0, errorCodeMatch.index).trim();
      if (message.length > 0) {
        this.message = message;
      } else {
        this.message = null;
      }
    } else {
      this.code = null;
      const message = textAfterPrefix.trim();
      if (message.length === 0) {
        throw new Error('Neither message nor code was provided');
      }
      this.message = message;
    }
  }

  toString(): string {
    const result = [];
    if (this.message !== null) {
      result.push(this.message);
    }
    if (this.code !== null) {
      result.push(`(${this.code})`);
    }
    return result.join(' ');
  }
  matchesActual(actual: ActualMessageAndCode) {
    if (this.message !== null) {
      if (this.message.endsWith(ELLIPSIS)) {
        const prefix = removeSuffix(this.message, ELLIPSIS).trimEnd();
        if (!actual.message.startsWith(prefix)) {
          return false;
        }
      } else {
        if (this.message !== actual.message) {
          return false;
        }
      }
    }
    if (this.code !== null && this.code !== actual.code) {
      return false;
    }
    return true;
  }
}

export class ActualMessageAndCode {
  message: string;
  code: number;

  constructor(diagnostic: DiagnosticInfo) {
    this.message = normalizeWhitespace(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    this.code = diagnostic.code;
  }

  toString(): string {
    return `${this.message} (${this.code})`;
  }
}
