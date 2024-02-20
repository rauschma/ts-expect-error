import ts from 'typescript';
import { assertNonNullable } from '../util/type.js';
import { createPatchedCompilerHost, iterAstNodes } from './compiler-helpers.js';
import { FileDiagnosticLookup, ProgramDiagnosticLookup } from '../support/diagnostic-lookup.js';
import { RE_TS_EXPECT_ERROR_PREFIX, extractCommentText } from '../support/extract-comment-text.js';
import { ActualMessageAndCode, ExpectedMessageAndCode } from '../support/message-and-code.js';
import { NormalStatusLogger, type StatusLogger } from './status-logger.js';

export function performStaticChecks(fileNames: Array<string>, options: ts.CompilerOptions): number {
  const program = ts.createProgram(fileNames, options, createPatchedCompilerHost(options, fileNames));
  const diagnosticLookup = new ProgramDiagnosticLookup(
    program,
    program.emit()
  );

  const statusLogger = new NormalStatusLogger();
  for (const file of fileNames) {
    const sourceFile = program.getSourceFile(file);
    if (sourceFile === undefined) continue;

    const fileDiagnosticLookup = diagnosticLookup.fileNameToLookup.get(sourceFile.fileName);
    assertNonNullable(fileDiagnosticLookup);
    statusLogger.startFile(sourceFile);
    for (const { node, commentParts } of iterAstNodes(sourceFile)) {
      if (handleTsExpectError(commentParts, sourceFile, node, fileDiagnosticLookup, statusLogger) === ProcessingStatus.FoundMatch) {
        continue;
      }
    }
    statusLogger.endFile(fileDiagnosticLookup);
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
