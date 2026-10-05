import { getGitHubLink } from "./github.ts";
import { getPackage } from "./package.ts";
import type { Link } from "./types.ts";

type Context = {
	flags: {
		github?: boolean;
		npmx?: boolean;
		short?: boolean;
	};
	input: string[];
};

export const getLinks = async ({ flags, input }: Context): Promise<Link[]> => (
	Promise.all(input.map(async (name) => {
		const packageData = await getPackage(name);

		if (!packageData) {
			return { name };
		}

		if (flags.github) {
			return getGitHubLink(packageData);
		}

		return {
			link: flags.npmx
				? `https://npmx.dev${flags.short ? "" : "/package"}/${name}`
				: `https://${flags.short ? "npm.im" : "www.npmjs.com/package"}/${name}`,
			name,
		};
	}))
);
