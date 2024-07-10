#!/usr/bin/env tsimp
import process from "node:process";
import meow from "meow";
import { readPackageUp } from "read-package-up";
import terminalLink from "terminal-link";
import clipboard from "clipboardy";
import logSymbols from "log-symbols";
import { getPackage } from "./package.js";
import { getGitHubLink } from "./github.js";

// dprint-ignore
const cli = meow(`
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
`, {
	importMeta: import.meta,
	description: false,
	flags: {
		help: {
			type: "boolean",
			shortFlag: "h",
		},
		short: {
			type: "boolean",
			shortFlag: "s",
		},
		github: {
			type: "boolean",
			shortFlag: "g",
		},
	},
});

type Link = {
	name: string;
	link?: string;
};

let shouldAddBreak = false;

const getLinks = async (names: string[]): Promise<Link[]> => (
	Promise.all(names.map(async (name) => {
		const packageData = await getPackage(name);

		if (!packageData) {
			return { name };
		}

		if (cli.flags.github) {
			const { link, didWarn } = await getGitHubLink(packageData);

			if (didWarn) {
				shouldAddBreak = true;
			}

			return { name, link };
		}

		if (cli.flags.short) {
			return { name, link: `https://npm.im/${name}` };
		}

		return { name, link: `https://www.npmjs.com/package/${name}` };
	}))
);

let links: Link[];

if (cli.input.length > 0) {
	links = await getLinks(cli.input);
} else {
	const result = await readPackageUp();

	if (!result) {
		console.error(`${logSymbols.error} You must be in an npm package`);
		process.exit(1);
	}

	links = await getLinks([result.packageJson.name]);
}

if (shouldAddBreak) {
	console.log();
}

for (const { name, link } of links) {
	if (!link) {
		console.log(`${logSymbols.error} ${name}: No link found`);
		continue;
	}

	const linkified = terminalLink(link, link, { fallback: () => link });
	console.log(`${logSymbols.info} ${name}: ${linkified}`);

	if (cli.input.length < 2) {
		await clipboard.write(link); // eslint-disable-line no-await-in-loop
		console.log(`\n${logSymbols.success} Copied link to clipboard!`);
	}
}
