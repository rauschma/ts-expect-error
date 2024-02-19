import ts from 'typescript';
import { normalizeWhitespace, removeSuffix } from '../util/strings.js';
import type { DiagnosticInfo } from './diagnostic-lookup.js';

const RE_ERROR_CODE = /\s*\(([0-9]+)\)$/u;
export class MessageAndCode {
  static fromDiagnostic(diagnostic: DiagnosticInfo): MessageAndCode {
    const actualMessage = normalizeWhitespace(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    const actualCode = diagnostic.code;
    return new MessageAndCode(actualMessage, actualCode);
  }
  static fromCommentText(text: string): MessageAndCode {
    let code: null | number = null;
    const errorCodeMatch = RE_ERROR_CODE.exec(text);
    if (errorCodeMatch) {
      code = Number(errorCodeMatch[1]);
      text = text.slice(0, errorCodeMatch.index);
    }
    return new MessageAndCode(text, code);  
  }

  private constructor(public message: null | string, public code: null | number) { }
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
}

const ELLIPSIS = ' [...]';
export function expectedMatchesActual(expected: MessageAndCode, actual: MessageAndCode) {
  if (expected.message !== null) {
    if (actual.message === null) {
      return false;
    }
    if (expected.message.endsWith(ELLIPSIS)) {
      const prefix = removeSuffix(expected.message, ELLIPSIS);
      if (!actual.message.startsWith(prefix)) {
        return false;
      }
    } else {
      if (expected.message !== actual.message) {
        return false;
      }
    }
  }
  if (expected.code !== null && expected.code !== actual.code) {
    return false;
  }
  return true;
}