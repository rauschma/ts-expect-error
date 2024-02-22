# Todos

* Is it possible to retrieve files on demand (vs. listing them all ahead of time)?
* GitHub issue: https://github.com/microsoft/TypeScript-Website/issues/298
* Write tests that run the files in `demo/` and check the results
* Detecting directives in code:
  ```ts
  throw new Error(`File contains ${numberOfChecks} checks, we only found ${fileSuccessCount+fileFailureCount} check(s)`);
  ```
  * Show *which* checks were not found (or recommend to switch on `--trace`)
  * Pluralize correctly
