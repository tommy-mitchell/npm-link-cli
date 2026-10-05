#!/usr/bin/env node
import process from "node:process";
import meow from "meow";
import { readPackageUp } from "read-package-up";
import terminalLink from "terminal-link";
import * as clipboard from "tinyclip";
import { getLinks } from "./helpers/links.ts";
import { log } from "./helpers/log.ts";
import type { Link } from "./helpers/types.ts";

// dprint-ignore
const cli = meow(`
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
		npmx: {
			shortFlag: "x",
			type: "boolean",
		},
		short: {
			shortFlag: "s",
			type: "boolean",
		},
	},
	importMeta: import.meta,
});

let links: Link[];

if (cli.input.length > 0) {
	links = await getLinks(cli);
} else {
	const result = await readPackageUp();

	if (!result) {
		log.error("You must be in an npm package.");
		process.exit(1);
	}

	links = await getLinks({ ...cli, input: [result.packageJson.name] });
}

for (const { link, name, warnings = [] } of links) {
	if (link) {
		const linkified = terminalLink(link, link, { fallback: () => link });
		log.info(`${name}: ${linkified}`);
	} else {
		log.error(`${name}: No link found`);
	}

	for (const warning of warnings) {
		log.warning(warning);
	}
}

const lastLink = links.at(-1)?.link;

if (lastLink && cli.input.length < 2) {
	try {
		await clipboard.writeText(lastLink);
		console.log("");
		log.success("Copied link to clipboard!");
	} catch {}
}
