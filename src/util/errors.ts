import ts from 'typescript';

export class InternalError extends Error {}
export class CheckerError extends Error {}
export class TypeScriptAstError extends Error {
  constructor(sourceFile: ts.SourceFile, node: ts.Node, message: string) {
    const {line} = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
    super(`${message} (${sourceFile.fileName}:${line+1})`);
  }
}