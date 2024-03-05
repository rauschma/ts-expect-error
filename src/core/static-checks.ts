import ts from 'typescript';
import { FileDiagnosticLookup, ProgramDiagnosticLookup } from '../support/diagnostic-lookup.js';
import { RE_TS_EXPECT_ERROR_PREFIX, extractCommentText } from '../support/extract-comment-text.js';
import { ActualMessageAndCode, ExpectedMessageAndCode } from '../support/message-and-code.js';
import { assertNonNullable } from '../util/type.js';
import { createPatchedCompilerHost, iterAstNodes } from './compiler-helpers.js';
import { NormalStatusLogger, type StatusLogger } from './status-logger.js';

export function performStaticChecks(fileNames: Array<string>, options: ts.CompilerOptions, reportErrors: boolean): number {
  // “`include`, `exclude`, and `files` [in tsconfig.json] are all
  // tsconfig-only things that work together to produce a set of rootNames
  // [`fileNames` below].”
  // https://github.com/Microsoft/TypeScript/issues/29960
  const program = ts.createProgram(fileNames, options, createPatchedCompilerHost(options, fileNames));
  const diagnosticLookup = new ProgramDiagnosticLookup(
    program,
    program.emit()
  );

  const statusLogger = new NormalStatusLogger(reportErrors);
  const singleFileMode = (fileNames.length === 1);
  for (const fileName of fileNames) {
    const sourceFile = program.getSourceFile(fileName);
    assertNonNullable(sourceFile);
    
    statusLogger.startFile(sourceFile);
    // Returns `undefined` if tsc didn’t produce any diagnostics for a file.
    const fileDiagnosticLookup = diagnosticLookup.fileNameToLookup.get(sourceFile.fileName);
    if (fileDiagnosticLookup) {
      for (const { node, commentParts } of iterAstNodes(sourceFile)) {
        handleTsExpectError(commentParts, sourceFile, node, fileDiagnosticLookup, statusLogger);
      }
    }
    statusLogger.endFile(fileDiagnosticLookup ?? new FileDiagnosticLookup(), singleFileMode);
  }
  statusLogger.endLogging();
  return statusLogger.getExitCode();
}

function handleTsExpectError(parts: Array<string>, sourceFile: ts.SourceFile, node: ts.Node, diagnosticLookup: FileDiagnosticLookup, statusLogger: StatusLogger): ProcessingStatus {
  const textAfterPrefix = extractCommentText(parts, RE_TS_EXPECT_ERROR_PREFIX);
  if (textAfterPrefix === null) {
    return ProcessingStatus.NoMatch;
  }
  const expected = new ExpectedMessageAndCode(textAfterPrefix);

  const { line } = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile, false));
  const diagnostics = diagnosticLookup.getAndDelete(line);
  if (diagnostics === undefined) {
    statusLogger.logStaticCheck({
      line,
      expected: 'EXPECTED ERROR: ' + expected,
      actual: 'ACTUAL ERROR: (No errors in this line)',
      checkSucceeded: false,
    });
    return ProcessingStatus.FoundMatch;
  }
  if (diagnostics.length !== 1) {
    statusLogger.logStaticCheck({
      line,
      expected: 'EXPECTED ERROR: ' + expected,
      actual: 'ACTUAL ERROR: (More than one error in this line)',
      checkSucceeded: false,
    });
    return ProcessingStatus.FoundMatch;
  }
  const actual = new ActualMessageAndCode(diagnostics[0]);

  const checkPassed = expected.matchesActual(actual);
  statusLogger.logStaticCheck({
    line,
    expected: 'EXPECTED ERROR: ' + expected,
    actual: 'ACTUAL ERROR:   ' + actual,
    checkSucceeded: checkPassed,
  });
  return ProcessingStatus.FoundMatch;
}

enum ProcessingStatus {
  FoundMatch,
  NoMatch,
}
