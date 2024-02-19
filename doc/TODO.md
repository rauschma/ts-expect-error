# Todos

* Reporting:
  * `LoggingStaticCheckHandler`: Combine ts-expect-error results (per-file) with other detected errors (global)
  * Output: stdout vs. stderr
  * Non-zero exit code if errors were detected





## Old todos

* GitHub issue: https://github.com/microsoft/TypeScript-Website/issues/298
* Write tests that run the files in `demo/` and check the results
* Detecting directives in code:
  ```ts
  throw new Error(`File contains ${numberOfChecks} checks, we only found ${fileSuccessCount+fileFailureCount} check(s)`);
  ```
  * Show *which* checks were not found (or recommend to switch on `--trace`)
  * Pluralize correctly
  * Check for `// %` and `// @` (= more matches)
* `@ts-ignore`:
  * Allow error message or error number to be omitted
  * Allow descriptions to be abbreviated:
    ```ts
    // @ts-ignore: This expression is not constructable. [...] (2351)
    ```
* Command line options:
  * `--tsconfig` to specify a tsconfig.
    * Additionally or alternatively: find automatically
  * `--trace`: print out all the checks
