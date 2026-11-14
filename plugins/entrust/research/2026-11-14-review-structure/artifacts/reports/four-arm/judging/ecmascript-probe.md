# ECMAScript newline claim: coordinator check

After the static assessment, the coordinator ran this language-level check with
Node v24.15.0; it did not execute the fixture application or its tests:

```sh
node -e 'for (const s of ["A1\n", "A1\r", "A1\r\n", "A1\u2028", "A1\u2029"]) console.log(JSON.stringify(s), /^([A-Z])([1-9][0-9]*)$/.test(s))'
```

The result was `false` for all five strings. This directly checks the regex
premise on this Node version; it does not establish behavior for other regex
engines or runtimes.
