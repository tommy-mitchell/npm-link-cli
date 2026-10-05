import test from "ava";
import { tq } from "@tommy-mitchell/test-helpers";
import type { UnknownRecord } from "type-fest";
import { getPackage } from "#src/helpers/package.ts";
import rootPackageJson from "../package.json" with { type: "json" };

test("main", async t => {
	const packageJson = await getPackage("npm-link-cli");
	t.like(packageJson, { version: rootPackageJson.version });
});

test("returns undefined for non-existent packages", async t => {
	const packageJson = await getPackage("nnnope");
	t.is(packageJson, undefined);
});

const mockGetPackage = async (localMocks: UnknownRecord, globalMocks?: UnknownRecord) =>
	tq.replace<typeof import("#src/helpers/package.ts")>({
		globalMocks,
		importMeta: import.meta,
		localMocks,
		modulePath: "#src/helpers/package.ts",
	});

test("no network connection", async t => {
	const { getPackage: getPackageMock } = await mockGetPackage({
		"node:process": {
			exit: (code: number) => {
				t.is(code, 1);
			},
		},
		"package-json": { default: () => ({ code: "ENOTFOUND" }) },
	}, {
		import: {
			console: {
				error: (message: string) => {
					t.is(message, "✖ No network connection detected!");
				},
			},
		},
	});

	await t.notThrowsAsync(getPackageMock(""));
});

test("throws on other errors", async t => {
	const { getPackage: getPackageMock } = await mockGetPackage({
		// dprint-ignore
		"package-json": { default: () => { throw new Error("foo"); } },
	});

	await t.throwsAsync(getPackageMock(""), { message: "foo" });
});
