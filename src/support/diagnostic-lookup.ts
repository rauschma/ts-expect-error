import ts from 'typescript';

//#################### ProgramDiagnosticLookup ####################

export class ProgramDiagnosticLookup {
  fileNameToLookup = new Map<string, FileDiagnosticLookup>();

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
    let fileLookup = this.fileNameToLookup.get(sourceFile.fileName);
    if (!fileLookup) {
      fileLookup = new FileDiagnosticLookup();
      this.fileNameToLookup.set(sourceFile.fileName, fileLookup);
    }
    fileLookup.add(lineNumber, diagnostic);
  }
}

//#################### FileDiagnosticLookup ####################

export class FileDiagnosticLookup {
  lineNumberToDiagnostics = new Map<number, Array<DiagnosticInfo>>();
  add(lineNumber: number, diagnostic: ts.Diagnostic): void {
    let diagnostics = this.lineNumberToDiagnostics.get(lineNumber);
    if (diagnostics === undefined) {
      diagnostics = new Array<DiagnosticInfo>();
      this.lineNumberToDiagnostics.set(lineNumber, diagnostics);
    }
    diagnostics.push(
      createDiagnosticInfo(lineNumber, diagnostic)
    );
  }

  getAndDelete(lineNumber: number): undefined | Array<DiagnosticInfo> {
    const diagnostics = this.lineNumberToDiagnostics.get(lineNumber);
    if (diagnostics) {
      this.lineNumberToDiagnostics.delete(lineNumber);
    }
    return diagnostics;
  }
}

//#################### DiagnosticInfo ####################

export type DiagnosticInfo = {
  lineNumber: number,
  messageText: string | ts.DiagnosticMessageChain,
  code: number,
};

function createDiagnosticInfo(lineNumber: number, d: ts.Diagnostic): DiagnosticInfo {
  return {
    lineNumber,
    messageText: d.messageText,
    code: d.code,
  };
}
