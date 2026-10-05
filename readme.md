# npm-link-cli

Get a link to a given npm package. Copies link to clipboard if only one package is given.

## Install

```sh
npm install --global npm-link-cli
```

<details>
<summary>Other Package Managers</summary>
<p>

```sh
yarn global add npm-link-cli
```

```sh
pnpm add -g npm-link-cli
```

</p>
</details>

## Usage

```txt
$ npm-link --help

  Usage
    $ npm-link [package-name] […]

  Options
    --short   -s  Output short link, if available
    --github  -g  Output GitHub link
    --npmx    -x  Output npmx.dev link

  Examples
    Output link for current package
    $ npm-link --short
    ℹ npm-link-cli: https://npm.im/npm-link-cli

    $ npm-link meow np nnnope
    ℹ meow: https://www.npmjs.com/package/meow
    ℹ np: https://www.npmjs.com/package/np
    ✖ nnnope: No link found

    $ npm-link tsd -sx
    ℹ tsd: https://npmx.dev/tsd

    $ npm-link ava --github
    ℹ ava: https://github.com/avajs/ava
```

## Related

- [npm-home](https://github.com/sindresorhus/npm-home) - Open the npm page, Yarn page, or GitHub repo of a package.
- [gh-user-cli](https://github.com/tommy-mitchell/gh-user-cli) - Open the GitHub or NPM profile of the given or current user.
- [package-json-cli](https://github.com/sindresorhus/package-json-cli) - Get the package.json of a package from the npm registry.
