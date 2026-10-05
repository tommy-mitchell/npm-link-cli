import process from "node:process";
import logSymbols from "log-symbols";
import packageJson, { PackageNotFoundError } from "package-json";

export const getPackage = async (name: string) => {
	try {
		return await packageJson(name, { fullMetadata: true });
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code === "ENOTFOUND") {
			console.error(`${logSymbols.error} No network connection detected!`);
			process.exit(1);
		}

		if (error instanceof PackageNotFoundError) {
			return;
		}

		throw error;
	}
};
