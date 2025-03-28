import ts from 'typescript';

//#################### createPatchedCompilerHost ####################

/**
 * @see https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#customizing-module-resolution
 */
export function createPatchedCompilerHost(options: ts.CompilerOptions, fileNames: Array<string>): ts.CompilerHost {
  const fileNameSet = new Set(fileNames);
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = patchedGetSourceFile;
  return host;

  function patchedGetSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): ts.SourceFile | undefined {
    if (fileNameSet.has(fileName)) {
      let sourceText = ts.sys.readFile(fileName);
      if (sourceText !== undefined) {
        sourceText = sourceText.replaceAll(
          /(\/\/ *)@ts-expect-error: /ug,
          '$1%ts-expect-error'
        );
        return ts.createSourceFile(fileName, sourceText, languageVersion);
      } else {
        return undefined;
      }
    } else {
      return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    }
  }
}

//#################### iterAstNodes ####################

/**
 * Invisible AST nodes that exist at the same position as visible AST nodes
 * inside them.
 */
const UNYIELDED_SYNTAX_KINDS = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.SourceFile,
  ts.SyntaxKind.SyntaxList,
]);

export interface IterNodeValue {
  commentParts: Array<string>;
  node: ts.Node;
}

/**
 * This way of iterating is not the most efficient, but it is simple and
 * robust.
 */
export function* iterAstNodes(sourceFile: ts.SourceFile, node: ts.Node = sourceFile, visitedNodePositions = new Set<number>()): Iterable<IterNodeValue> {
  if (!UNYIELDED_SYNTAX_KINDS.has(node.kind) && !visitedNodePositions.has(node.pos)) {
    const commentRanges = ts.getLeadingCommentRanges(sourceFile.text, node.pos);
    if (commentRanges && commentRanges.length > 0) {
      const commentParts = commentRanges.map(
        cr => sourceFile.text.slice(cr.pos, cr.end));

      yield { commentParts, node };
      visitedNodePositions.add(node.pos);
    }
  }
  for (const child of node.getChildren()) {
    yield* iterAstNodes(sourceFile, child, visitedNodePositions);
  }
}
