#!/usr/bin/env node
import process from "node:process";
import clipboard from "clipboardy";
import logSymbols from "log-symbols";
import meow from "meow";
import { readPackageUp } from "read-package-up";
import terminalLink from "terminal-link";
import { getGitHubLink } from "./github.ts";
import { getPackage } from "./package.ts";

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
	description: false,
	flags: {
		github: {
			shortFlag: "g",
			type: "boolean",
		},
		help: {
			shortFlag: "h",
			type: "boolean",
		},
		short: {
			shortFlag: "s",
			type: "boolean",
		},
	},
	importMeta: import.meta,
});

type Link = {
	link?: string;
	name: string;
};

let shouldAddBreak = false;

const getLinks = async (names: string[]): Promise<Link[]> => (
	Promise.all(names.map(async (name) => {
		const packageData = await getPackage(name);

		if (!packageData) {
			return { name };
		}

		if (cli.flags.github) {
			const { didWarn, link } = await getGitHubLink(packageData);

			if (didWarn) {
				shouldAddBreak = true;
			}

			return { link, name };
		}

		return {
			link: `https://${cli.flags.short ? "npm.im" : "www.npmjs.com/package"}/${name}`,
			name,
		};
	}))
);

let links: Link[];

if (cli.input.length > 0) {
	links = await getLinks(cli.input);
} else {
	const result = await readPackageUp();

	if (!result) {
		console.error(`${logSymbols.error} You must be in an npm package.`);
		process.exit(1);
	}

	links = await getLinks([result.packageJson.name]);
}

if (shouldAddBreak) {
	console.log();
}

for (const { link, name } of links) {
	if (!link) {
		console.log(`${logSymbols.error} ${name}: No link found`);
		continue;
	}

	const linkified = terminalLink(link, link, { fallback: () => link });
	console.log(`${logSymbols.info} ${name}: ${linkified}`);

	if (cli.input.length < 2) {
		try {
			await clipboard.write(link); // eslint-disable-line no-await-in-loop
			console.log(`\n${logSymbols.success} Copied link to clipboard!`);
		} catch {}
	}
}
