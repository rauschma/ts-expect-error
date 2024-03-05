# Todos

* Always `.startsWith` for error messages?
* Is it possible to retrieve files on demand (vs. listing them all ahead of time)?
* Write tests that run the files in `demo/` and check the results
* Detecting checks in code:
  ```ts
  throw new Error(`File contains ${numberOfChecks} checks, we only found ${fileSuccessCount+fileFailureCount} check(s)`);
  ```
  * Show *which* checks were not found (or recommend to switch on `--trace`)
  * Pluralize correctly
