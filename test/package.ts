import anyTest, { type TestFn } from "ava";
import esmock from "esmock";
import { type NormalizedPackageJson, readPackageUp } from "read-package-up";
import type { UnknownRecord } from "type-fest";
import { getPackage } from "../src/package.js";

const test = anyTest as TestFn<{
	packageJson: NormalizedPackageJson;
}>;

test.before("setup context", async t => {
	const result = await readPackageUp();
	t.truthy(result, "Not in an npm package!");
	t.context.packageJson = result!.packageJson;
});

test("main", async t => {
	const packageJson = await getPackage("npm-link-cli");
	t.like(packageJson, { version: t.context.packageJson.version });
});

test("returns undefined for non-existent packages", async t => {
	const packageJson = await getPackage("nnnope");
	t.is(packageJson, undefined);
});

const mockGetPackage = async (...mocks: UnknownRecord[]) =>
	esmock<typeof import("../src/package.js")>( // eslint-disable-line @typescript-eslint/consistent-type-imports
		"../src/package.js",
		import.meta.url,
		...mocks,
	);

test("no network connection", async t => {
	const { getPackage: getPackageMock } = await mockGetPackage({
		"package-json": { default: () => ({ code: "ENOTFOUND" }) },
		"node:process": { // eslint-disable-line @typescript-eslint/naming-convention
			exit: (code: number) => (
				t.is(code, 1)
			),
		},
	}, {
		import: {
			console: {
				error: (message: string) => (
					t.is(message, "✖ No network connection detected!")
				),
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
