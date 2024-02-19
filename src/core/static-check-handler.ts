import ts from 'typescript';
import { RE_TS_EXPECT_ERROR_PREFIX_G } from './extract-comment-text.js';

interface StaticCheckProps {
  line: number,
  expected: string,
  actual: string,
  checkSucceeded: boolean,
}
export class StaticCheck implements StaticCheckProps {
  line!: number;
  expected!: string;
  actual!: string;
  checkSucceeded!: boolean;
  constructor(props: StaticCheckProps) {
    Object.assign(this, props);
  }
}

export interface StaticCheckHandler {
  openFile(sourceFile: ts.SourceFile): void;
  collect(staticCheck: StaticCheck): void;
  closeFile(): void;
  closeHandler(): void;
}

export class LoggingStaticCheckHandler implements StaticCheckHandler {
  sourceFile: null | ts.SourceFile = null;
  staticChecks: StaticCheck[] = [];
  totalFailureCount = 0;
  totalSuccessCount = 0;
  openFile(sourceFile: ts.SourceFile) {
    this.sourceFile = sourceFile;
  }
  collect(staticCheck: StaticCheck) {
    this.staticChecks.push(staticCheck);
  }
  closeFile() {
    let fileSuccessCount = 0;
    let fileFailureCount = 0;
    for (const check of this.staticChecks) {
      if (check.checkSucceeded) {
        fileSuccessCount++;
        this.totalSuccessCount++;
      } else {
        fileFailureCount++;
        this.totalFailureCount++;
      }
    }
    console.log(`=== ${this.sourceFile!.fileName} (successes: ${fileSuccessCount})`);

    const numberOfChecks = countChecks(this.sourceFile!.text);
    if (numberOfChecks !== (fileSuccessCount + fileFailureCount)) {
      throw new Error(`File contains ${numberOfChecks} checks, we only found ${fileSuccessCount + fileFailureCount} check(s)`);
    }

    if (fileFailureCount > 0) {
      console.log();
      for (const check of this.staticChecks) {
        if (!check.checkSucceeded) {
          console.log(`– LINE: ${check.line + 1}`);
          console.log(`  ${check.expected}`);
          console.log(`  ${check.actual}`);
          console.log();
        }
      }
    }
    this.sourceFile = null;
    this.staticChecks.length = 0;
  }
  closeHandler(): void {
    console.log(`### DONE (failures: ${this.totalFailureCount}, successes: ${this.totalSuccessCount})`);
  }
}

function countChecks(str: string): number {
  return (str.match(RE_TS_EXPECT_ERROR_PREFIX_G) || []).length;
}
