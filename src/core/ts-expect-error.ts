#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
// Importing JSON is experimental

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ParseArgsConfig } from 'node:util';
import * as util from 'node:util';
import ts from 'typescript';
import { performStaticChecks } from './static-checks.js';
//@ts-expect-error: Module '#package_json' has no default export.
import pkg from '#package_json' with { type: "json" };

const BIN_NAME = 'ts-expect-error';

const OPTIONS = {
  'tsconfig': {
    type: 'string',
  },
  'report-errors': {
    type: 'boolean',
    short: 'e',
  },
  'help': {
    type: 'boolean',
    short: 'h',
  },
  'version': {
    type: 'boolean',
    short: 'v',
  },
} satisfies ParseArgsConfig['options'];

function main() {
  const args = util.parseArgs({ allowPositionals: true, options: OPTIONS });

  if (args.values.version) {
    console.log(pkg.version);
    return;
  }
  if (args.values.help || args.positionals.length === 0) {
    const helpLines = [
      `${BIN_NAME} [--tsconfig tsconfig.json] «file-or-dir-1» «file-or-dir-2» ...`,
      '',
      'More options:',
      '--help -h: get help',
      '--version -v: print version',
      '--report-errors -e: report unexpected errors detected by TypeScript',
    ];
    for (const line of helpLines) {
      console.log(line);
    }
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
      lib: ['es2022'],
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      noImplicitOverride: true,
      noImplicitReturns: true,
    };
  }

  const reportErrors = args.values['report-errors'] ?? false;
  const pathNames = [...expandDirectories(args.positionals)];
  process.exitCode = performStaticChecks(pathNames, options, reportErrors);
}

function* expandDirectories(paths: Array<string>): Iterable<string> {
  for (const p of paths) {
    if (fs.statSync(p).isDirectory()) {
      for (const dirent of fs.readdirSync(p, { withFileTypes: true, recursive: true })) {
        if (dirent.isFile() && /\.(ts|tsx|mts|cts)$/.test(dirent.path)) {
          yield path.resolve(p, dirent.path);
        }
      }
    } else {
      yield p;
    }
  }
}

main();