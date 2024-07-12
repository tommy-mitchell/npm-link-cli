import process from "node:process";
import packageJson, { PackageNotFoundError } from "package-json";
import logSymbols from "log-symbols";

export const getPackage = async (name: string) => {
	try {
		return await packageJson(name, { fullMetadata: true });
	} catch (error: any) {
		if (error.code === "ENOTFOUND") {
			console.error(`${logSymbols.error} No network connection detected!`);
			process.exit(1);
		}

		if (error instanceof PackageNotFoundError) {
			return;
		}

		throw error; // eslint-disable-line @typescript-eslint/no-throw-literal
	}
};
