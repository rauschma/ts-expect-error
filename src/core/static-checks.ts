import ts from 'typescript';
import { createPatchedCompilerHost, iterAstNodes } from './compiler-helpers.js';
import { DiagnosticLookup } from './diagnostic-lookup.js';
import { RE_TS_EXPECT_ERROR_PREFIX, extractCommentText } from './extract-comment-text.js';
import { MessageAndCode, expectedMatchesActual } from './message-and-code.js';
import { LoggingStaticCheckHandler, StaticCheck, type StaticCheckHandler } from './static-check-handler.js';

export function performStaticChecks(fileNames: string[], options: ts.CompilerOptions): void {
  const program = ts.createProgram(fileNames, options, createPatchedCompilerHost(options, fileNames));
  const emitResult = program.emit();
  const diagnosticLookup = new DiagnosticLookup(program, emitResult);

  const staticCheckObserver = new LoggingStaticCheckHandler();
  for (const file of fileNames) {
    const sourceFile = program.getSourceFile(file);
    if (sourceFile === undefined) continue;
    staticCheckObserver.openFile(sourceFile);

    for (const { node, commentParts } of iterAstNodes(sourceFile)) {
      if (handleTsExpectError(commentParts, sourceFile, node, diagnosticLookup, staticCheckObserver) === ProcessingStatus.FoundMatch) {
        continue;
      }
    }
    staticCheckObserver.closeFile();
  }
  staticCheckObserver.closeHandler();
}

function handleTsExpectError(parts: string[], sourceFile: ts.SourceFile, node: ts.Node, diagnosticLookup: DiagnosticLookup, staticCheckObserver: StaticCheckHandler): ProcessingStatus {
  const textAfterPrefix = extractCommentText(parts, RE_TS_EXPECT_ERROR_PREFIX);
  if (textAfterPrefix === null) {
    return ProcessingStatus.NoMatch;
  }
  const expected = MessageAndCode.fromCommentText(textAfterPrefix);

  const { line } = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile, false));
  const diagnostics = diagnosticLookup.get(sourceFile, line);
  if (diagnostics === undefined) {
    staticCheckObserver.collect(new StaticCheck({
      line,
      expected: 'EXPECTED ERROR: ' + expected,
      actual: 'ACTUAL ERROR: (No errors in this line)',
      checkSucceeded: false,
    }));
    return ProcessingStatus.FoundMatch;
  }
  if (diagnostics.length !== 1) {
    staticCheckObserver.collect(new StaticCheck({
      line,
      expected: 'EXPECTED ERROR: ' + expected,
      actual: 'ACTUAL ERROR: (More than one error in this line)',
      checkSucceeded: false,
    }));
    return ProcessingStatus.FoundMatch;
  }
  const actual = MessageAndCode.fromDiagnostic(diagnostics[0]);

  const checkPassed = expectedMatchesActual(expected, actual);
  staticCheckObserver.collect(new StaticCheck({
    line,
    expected: 'EXPECTED ERROR: ' + expected,
    actual: 'ACTUAL ERROR:   ' + actual,
    checkSucceeded: checkPassed,
  }));
  return ProcessingStatus.FoundMatch;
}

enum ProcessingStatus {
  FoundMatch,
  NoMatch,
}
