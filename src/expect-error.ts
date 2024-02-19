#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ParseArgsConfig } from 'node:util';
import * as util from 'node:util';
import ts from 'typescript';
import { performStaticChecks } from './core/static-checks.js';

const BIN_NAME = 'expect-error';

const OPTIONS = {
  'tsconfig': {
    type: 'string',
  },
  'trace': { // to be implemented: log all checks
    type: 'boolean',
  },
  'help': {
    type: 'boolean',
    short: 'h',
  },
} satisfies ParseArgsConfig['options'];

function main() {
  const args = util.parseArgs({ allowPositionals: true, options: OPTIONS });
  if (args.values.help || args.positionals.length === 0) {
    console.log(`${BIN_NAME} [--tsconfig tsconfig.json] «file-or-dir-1» «file-or-dir-2» ...`);
    return;
  }

  let options: ts.CompilerOptions;

  const tsconfigPath = args.values.tsconfig;
  if (tsconfigPath) {
    const projectPath = path.dirname(tsconfigPath);
    const sourceText = fs.readFileSync(tsconfigPath, 'utf-8');
    const jsonOptions = ts.parseJsonText(tsconfigPath, sourceText);
    const parseResult = ts.convertCompilerOptionsFromJson(jsonOptions, projectPath, tsconfigPath);
    if (parseResult.errors.length > 0) {
      console.log(parseResult.errors);
      process.exit(1);
    }
    options = parseResult.options;
  } else {
    options = {
      noEmit: true,
      strict: true,
      lib: ['es2022'],
    };
  }

  const pathNames = [...expandDirectories(args.positionals)];
  performStaticChecks(pathNames, options);
}

function* expandDirectories(paths: string[]): Iterable<string> {
  for (const p of paths) {
    if (fs.statSync(p).isDirectory()) {
      for (const dirent of fs.readdirSync(p, { withFileTypes: true, recursive: true })) {
        if (dirent.isFile() && /\.(ts|tsx)$/.test(dirent.path)) {
          yield path.resolve(p, dirent.path);
        }
      }
    } else {
      yield p;
    }
  }
}

main();