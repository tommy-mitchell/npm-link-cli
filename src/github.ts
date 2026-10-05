import type { FullVersion as PackageJson } from "package-json";
import repoUrlFromPackage from "repo-url-from-package";
import type { Link } from "./types.ts";

export const getGitHubLink = async (packageJson: PackageJson): Promise<Link> => {
	const { name } = packageJson;

	if (!packageJson.repository) {
		return { name };
	}

	const { url, warnings } = repoUrlFromPackage(packageJson);
	const link = url ?? packageJson.homepage;

	if (!link) {
		warnings.push("Tried falling back to `homepage` field, but none found in package.json.");
	}

	return { link, name, warnings };
};
