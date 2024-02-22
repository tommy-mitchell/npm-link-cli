# npm-link-cli

Get a link to a given npm package. Copies link to clipboard if only one package is given.

## Install

```sh
npm install --global npm-link-cli
```

<details>
<summary>Other Package Managers</summary>

```sh
yarn global add npm-link-cli
```

</details>

## Usage

```sh
$ npm-link --help

  Usage
    $ npm-link [package-name] […]

  Options
    --short   -s  Output npm.im link
    --github  -g  Output GitHub link

  Examples
    Output link for current package
    $ npm-link
    ℹ npm-link-cli: https://www.npmjs.com/package/npm-link-cli

    $ npm-link meow np nnnope
    ℹ meow: https://www.npmjs.com/package/meow
    ℹ np: https://www.npmjs.com/package/np
    ✖ nnnope: No link found

    $ npm-link tsd --short
    ℹ tsd: https://npm.im/tsd

    $ npm-link ava --github
    ℹ ava: https://github.com/avajs/ava
```

## Related

- [npm-home](https://github.com/sindresorhus/npm-home) - Open the npm page, Yarn page, or GitHub repo of a package.
- [gh-user-cli](https://github.com/tommy-mitchell/gh-user-cli) - Open the GitHub or NPM profile of the given or current user.
- [package-json-cli](https://github.com/sindresorhus/package-json-cli) - Get the package.json of a package from the npm registry.
