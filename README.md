# Testing TypeScript examples

❌ Use if only a few files are involved. Otherwise use one of the related tools mentioned below.

Challenges:

* Testing expected static errors. In JavaScript, expected dynamic errors can be tested via:
  * `assert.throws(() => eval('const myVar;'), SyntaxError);`
  * `assert.throws(() => null.someProp, TypeError);`
* Testing expected inferred types.
  * https://github.com/TypeStrong/ts-expect

## Static checker: expected static errors

Approach: Suppress the errors via `@ts-expect-error`

```ts
function func1(x: Object) { }
func1('abc'); // OK

function func2(x: object) { }
// @ts-expect-error: Argument of type '"abc"' is not assignable to parameter of type 'object'. (2345)
func2('abc');
```

The static checker warns if the static error doesn’t match text and number after `@ts-expect-error:`.

(This functionality would be useful for TypeScript code in general.)

## Related tools

These tools are related:

* TypeScript TwoSlasher: https://github.com/microsoft/TypeScript-Website/tree/v2/packages/ts-twoslasher
  * Example: https://www.typescriptlang.org/v2/en/tsconfig#strictFunctionTypes
  * Upsides:
    * Powerful
    * Awesome for web content (tooltips, colors, etc.)
  * Downsides:
    * Doesn’t tie errors to specific lines in the code
    * Less suited for PDFs and print
    * Can’t split up examples into multiple fragments and connect them.
    * Only checking error codes is less robust. It would be nice if one could also mention (and check) error messages.
    * Can’t check inferred types.
* https://www.npmjs.com/package/@typescript/twoslash
* dtslint: https://github.com/microsoft/dtslint
  * Upside: standard
  * Downside:
    * No way to check for specific errors
    * Slightly more work to set up (AFAICT)
* tsd: https://github.com/SamVerschueren/tsd
  * Downside:
    * No way to check for specific errors
    * Unsure if its custom TypeScript version changes how other code behaves
* Language server plugin: https://github.com/peerigon/typescript-exercises-tools
* `@ts-expect-error`: https://github.com/microsoft/TypeScript/pull/36014
  * Only complains if it is used and there is no error. Does not check if that error is the expected error.
* https://github.com/pashak09/ts-expect-error-validator
  * Changes files on disk.
  * Syntax close to – but slightly different from – what I want.
