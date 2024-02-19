import ts from 'typescript';

export class DiagnosticLookup {
  private keyToDiagnostics = new Map<string, Array<ts.Diagnostic>>();

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

  add(sourceFile: ts.SourceFile, line: number, diagnostic: ts.Diagnostic): void {
    const key = createKey(sourceFile, line);
    let diagnostics = this.keyToDiagnostics.get(key);
    if (diagnostics === undefined) {
      diagnostics = new Array<ts.Diagnostic>();
      this.keyToDiagnostics.set(key, diagnostics);
    }
    diagnostics.push(diagnostic);
  }

  get(sourceFile: ts.SourceFile, line: number): undefined | Array<ts.Diagnostic> {
    const key = createKey(sourceFile, line);
    return this.keyToDiagnostics.get(key);
  }
}

function createKey(sourceFile: ts.SourceFile, line: number): string {
  return sourceFile.fileName + ':' + line;
}
