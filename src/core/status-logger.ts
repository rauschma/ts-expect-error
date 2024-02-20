import ts from 'typescript';
import { assertNonNullable } from '../util/type.js';
import type { FileDiagnosticLookup } from './diagnostic-lookup.js';
import { RE_TS_EXPECT_ERROR_PREFIX_G } from './extract-comment-text.js';

export interface StaticCheck {
  line: number,
  expected: string,
  actual: string,
  checkSucceeded: boolean,
}

export interface StatusLogger {
  startFile(sourceFile: ts.SourceFile): void;
  logStaticCheck(staticCheck: StaticCheck): void;
  endFile(fileDiagnosticLookup: FileDiagnosticLookup): void;
  endLogging(): void;
}

export class NormalStatusLogger implements StatusLogger {
  sourceFile: null | ts.SourceFile = null;
  failures: Array<StaticCheck> = [];
  totalCounts = new StatusCounts();
  fileCounts = new StatusCounts();
  startFile(sourceFile: ts.SourceFile) {
    this.sourceFile = sourceFile;
  }
  logStaticCheck(staticCheck: StaticCheck) {
    if (staticCheck.checkSucceeded) {
      this.fileCounts.successCount++;
      this.totalCounts.successCount++;
    } else {
      // We display failures later so that we can start with the counts
      // (vs. ending with them).
      this.fileCounts.failureCount++;
      this.totalCounts.failureCount++;
      this.failures.push(staticCheck);
    }
  }
  endFile(fileDiagnosticLookup: FileDiagnosticLookup) {
    assertNonNullable(this.sourceFile);
    this.fileCounts.errorCount += fileDiagnosticLookup.lineNumberToDiagnostics.size;
    this.totalCounts.errorCount += fileDiagnosticLookup.lineNumberToDiagnostics.size;
    console.log(`=== ${this.sourceFile.fileName} (${this.fileCounts.toString()}) ${this.fileCounts.toStatusEmoji()}`);

    const checksInFile = countChecks(this.sourceFile.text);
    const performedChecks = this.fileCounts.successCount + this.fileCounts.failureCount;
    if (checksInFile !== performedChecks) {
      throw new Error(`File contains ${checksInFile} check(s), we only found ${performedChecks} check(s)`);
    }

    for (const check of this.failures) {
      console.log(`– LINE ${check.line + 1}:`);
      console.log(`  ${check.expected}`);
      console.log(`  ${check.actual}`);
    }

    for (const diagnosticInfo of Array.from(fileDiagnosticLookup.lineNumberToDiagnostics.values()).flat()) {
      console.log(`- LINE ${diagnosticInfo.lineNumber + 1}: ${diagnosticInfo.messageText} (${diagnosticInfo.code})`);
    }

    console.log(); // empty line

    this.sourceFile = null;
    this.failures.length = 0;
    this.fileCounts.reset();
  }
  endLogging(): void {
    console.log(`### DONE (${this.totalCounts.toString()}) ${this.totalCounts.toStatusEmoji()}`);
  }
  getExitCode(): number {
    return this.totalCounts.getExitCode();
  }
}

function countChecks(str: string): number {
  return (str.match(RE_TS_EXPECT_ERROR_PREFIX_G) || []).length;
}

class StatusCounts {
  successCount = 0;
  failureCount = 0;
  errorCount = 0;
  reset(): void {
    this.successCount = 0;
    this.failureCount = 0;
    this.errorCount = 0;
  }
  toString(): string {
    return `successes: ${this.successCount}, failures: ${this.failureCount}, errors: ${this.errorCount}`;
  }
  toStatusEmoji(): string {
    return (this.failureCount + this.errorCount) === 0 ? '✅' : '❌';
  }
  getExitCode(): number {
    return (this.failureCount + this.errorCount) === 0 ? 0 : 1;
  }
}
