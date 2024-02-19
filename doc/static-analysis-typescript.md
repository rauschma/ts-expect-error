# Statically analyzing TypeScript

## TypeScript compiler API

* General documentation:
  * https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
  * https://basarat.gitbook.io/typescript/overview
* Specific topics:
  * https://stackoverflow.com/questions/34736109/how-do-you-get-inferred-type-from-a-typescript-ast
  * https://levelup.gitconnected.com/writing-a-custom-typescript-ast-transformer-731e2b0b66e6
  * https://medium.com/@urish/diving-into-the-internals-of-typescript-how-i-built-typewiz-d273bbef3565
* Helpful tools:
  * https://ts-ast-viewer.com/

## Alternatives to the compiler API

* Wrapper API for compiler: https://github.com/dsherret/ts-morph
* Standalone TS server: https://github.com/Microsoft/TypeScript/wiki/Standalone-Server-%28tsserver%29

Benefits of language server protocol: easier to use; documented and stable APIs
