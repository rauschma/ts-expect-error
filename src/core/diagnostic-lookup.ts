import ts from 'typescript';

export type DiagnosticInfo = {
  fileName: string,
  lineNumber: number,
  messageText: string | ts.DiagnosticMessageChain,
  code: number,
};

function createDiagnosticInfo(fileName: string, lineNumber: number, d: ts.Diagnostic): DiagnosticInfo {
  return {
    fileName,
    lineNumber,
    messageText: d.messageText,
    code: d.code,
  };
}

export class DiagnosticLookup {
  keyToDiagnostics = new Map<string, Array<DiagnosticInfo>>();

  constructor(program: ts.Program, emitResult: ts.EmitResult) {
    let allDiagnostics = ts
      .sortAndDeduplicateDiagnostics([
        ...ts.getPreEmitDiagnostics(program),
        ...emitResult.diagnostics,
      ]);
    for (const diagnostic of allDiagnostics) {
      if (diagnostic === undefined || diagnostic.file === undefined) continue;
      let { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      this.add(diagnostic.file, line, diagnostic);
    }
    return this;
  }

  add(sourceFile: ts.SourceFile, lineNumber: number, diagnostic: ts.Diagnostic): void {
    const key = createKey(sourceFile, lineNumber);
    let diagnostics = this.keyToDiagnostics.get(key);
    if (diagnostics === undefined) {
      diagnostics = new Array<DiagnosticInfo>();
      this.keyToDiagnostics.set(key, diagnostics);
    }
    diagnostics.push(
      createDiagnosticInfo(sourceFile.fileName, lineNumber, diagnostic)
    );
  }

  getAndDelete(sourceFile: ts.SourceFile, line: number): undefined | Array<DiagnosticInfo> {
    const key = createKey(sourceFile, line);
    const diagnostics = this.keyToDiagnostics.get(key);
    if (diagnostics) {
      this.keyToDiagnostics.delete(key);
    }
    return diagnostics;
  }
}

function createKey(sourceFile: ts.SourceFile, line: number): string {
  return sourceFile.fileName + ':' + line;
}
