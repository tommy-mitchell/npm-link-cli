import process from "node:process";
import packageJson, { PackageNotFoundError } from "package-json";
import { log } from "./log.ts";

export const getPackage = async (name: string) => {
	try {
		return await packageJson(name, { fullMetadata: true });
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code === "ENOTFOUND") {
			log.error("No network connection detected!");
			process.exit(1);
		}

		if (error instanceof PackageNotFoundError) {
			return;
		}

		throw error;
	}
};
