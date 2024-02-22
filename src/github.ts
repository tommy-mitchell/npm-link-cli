import type { FullMetadata } from "package-json";
import githubUrlFromGit from "github-url-from-git";
import isUrl from "is-url-superb";
import logSymbols from "log-symbols";

// From https://github.com/sindresorhus/npm-home
export const getGitHubLink = async (name: string, packageData: FullMetadata) => {
	const { repository } = packageData;

	if (!repository) {
		return {};
	}

	let link = githubUrlFromGit(repository.url);
	let didWarn = false;

	if (!link) {
		link = repository.url;

		if (isUrl(link) && /^https?:\/\//.test(link)) {
			console.error(
				`${logSymbols.error} The \`repository\` field in package.json should point to a Git repo and not a website. Please open an issue or pull request on \`${name}\`.`,
			);
			didWarn = true;
		} else {
			console.error(
				`${logSymbols.error} The \`repository\` field in package.json is invalid. Please open an issue or pull request on \`${name}\`. Using the \`homepage\` field instead.`,
			);
			didWarn = true;

			if (!packageData.homepage) {
				console.error(`${logSymbols.error} No \`homepage\` field found in package.json.`);
				return {};
			}

			link = packageData.homepage;
		}
	}

	return { link, didWarn };
};
