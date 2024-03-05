# ts-expect-error: checking `@ts-expect-error` comments

## What does ts-expect-error do?

Scenario: We are documenting how TypeScript works, via small examples embedded in Markdown – e.g.:

```ts
function func1(x: Object) { }
func1('abc'); // OK

function func2(x: object) { }
// @ts-expect-error: Argument of type '"abc"' is not assignable
// to parameter of type 'object'. (2345)
func2('abc');
```

There are tools for checking such examples – e.g.:

* https://github.com/anko/txm
* https://specdown.io

ts-expect-error is to be used by such tools:

* It ensures that `@ts-expect-error` suppresses the right errors.
* It can also report static compiler errors (CLI option `--unexpected-errors`). That helps when using [`tsx`](https://github.com/privatenumber/tsx) to run TypeScript code because `tsx` does not perform static checks.
* It performs its checks in RAM and does not change files on disk.

## Usage

ts-expect-error is invoked like this:

```
ts-expect-error [--tsconfig tsconfig.json] «file-or-dir-1» «file-or-dir-2» ...
```

Get help via:

```js
ts-expect-error -h
```

### Usage caveats

* This tool is relatively slow – but it’s worth using it if you are writing about TypeScript because your material will contain fewer errors.
* If you are not providing a `tsconfig.json`, you have to list all files that make up a program (only listing the entry point is not enough). That seems to be a limitation of the tsc API and I have not found a way around it. If you know better then please tell me!

## Trying out ts-expect-error without installing it

Try it out quickly without installing it permanently:

```
npx ts-expect-error some-file.ts
```

There are demo files in this repository:

```
cd ts-expect-error/demo/
npx ts-expect-error *.ts
```

## Installation

You can install ts-expect-error globally and use it as a shell command:

```
npm install -g ts-expect-error
ts-expect-error some-file.ts
```

You can also install it locally and use it via `npx` (`npx` can be ommitted in `package.json` scripts):

```
npm install ts-expect-error
npx ts-expect-error some-file.ts
```

## Comment syntax

```ts
// @ts-expect-error: The error message with many details. (1234)
// @ts-expect-error: The error message with many details.
// @ts-expect-error: The error message [...] (1234)
// @ts-expect-error: The error message [...]
// @ts-expect-error: (1234)
```

* The `[...]` is optional. ts-expect-error checks if the actual message starts with the given message.
* If there is no colon (:) after `@ts-expect-error` then no checking is performed!
* At most one error per `@ts-expect-error` is allowed. That may change in the future – if there is a need for it (I haven’t had one, so far).

## Related tools

There are open issues for better built-in `@ts-expect-error` checking but it doesn’t look like that’s going to happen:

* https://github.com/microsoft/TypeScript/issues/19139
* https://github.com/microsoft/TypeScript/issues/45937

These tools are related to ts-expect-error:

* https://github.com/pashak09/ts-expect-error-validator
  * Changes files on disk.
  * Syntax close to what I personally want (but not completely).
  * Use this tool for large projects.
* TypeScript TwoSlash: https://www.npmjs.com/package/@typescript/twoslash
  * Example: https://www.typescriptlang.org/dev/twoslash/
  * Its use cases are different from the one described at the beginning of the readme.
  * Supports custom `@errors` comments to check for errors by code.
    * Doesn’t tie errors to specific lines in the code.
    * Only checks error codes, not error messages.
* dtslint: https://github.com/microsoft/dtslint
  * Upside: standard
  * Downside:
    * No way to check for specific errors
    * A bit of work to set up (AFAICT)
* tsd: https://github.com/SamVerschueren/tsd
  * Downsides:
    * No way to check for specific errors.
    * Comes with a  custom TypeScript version.
* eslint-plugin-expect-type: https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type
  * Supports custom `$ExpectError` comments but without a way to check for specific errors.
* Language server plugin: https://github.com/peerigon/typescript-exercises-tools
