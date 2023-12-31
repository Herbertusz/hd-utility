# hd-utility

The starter is built on top of Vite 4.x and prepared for writing libraries in TypeScript. It generates a hybrid package - both support for CommonJS and ESM modules.

## Features

-   Hybrid support - CommonJS and ESM modules
-   IIFE bundle for direct browser support without bundler
-   Typings bundle
-   ESLint - scripts linter
-   Stylelint - styles linter
-   Vitest - test framework

## Checklist

When you use this template, update the following:

-   Remove `.git` directory and run `git init` to clean up the history
-   Change the name in `package.json` - it will be the name of the IIFE bundle global variable and bundle files name (`.cjs`, `.mjs`, `.iife.js`, `d.ts`)
-   Change the author name in `LICENSE`
-   Clean up the `README` and `CHANGELOG` files

And, enjoy :)

## Usage

The starter contains the following scripts:

-   `dev` - starts dev server
-   `build` - generates the following bundles: CommonJS (`.cjs`) ESM (`.mjs`) and IIFE (`.iife.js`). The name of bundle is automatically taken from `package.json` name property
-   `test` - starts vitest and runs all tests
-   `test:coverage` - starts vitest and run all tests with code coverage report
-   `lint` - lint `.ts` files with eslint
-   `format` - format with eslint

## Acknowledgment

If you found it useful somehow, I would be grateful if you could leave a star in the project's GitHub repository.

Thank you.
