import test from "ava";
import type { FullVersion } from "package-json";
import type { AsyncReturnType, UnknownRecord } from "type-fest";
import { getGitHubLink } from "#src/helpers/github.ts";

const isEmptyObject = (object: UnknownRecord) => Object.keys(object).length === 0;

type MacroArgs = [{
	errorMessage?: string[] | string;
	expected: AsyncReturnType<typeof getGitHubLink>;
	homepage?: string;
	name: string;
	repository?: {
		url: string;
	};
}];

const verify = test.macro<MacroArgs>(async (t, { errorMessage = [], expected, homepage, name, repository }) => {
	const errorMessages = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
	const logs: string[] = [];

	const result = await getGitHubLink({ homepage, name, repository } as FullVersion);

	const assertions = await t.try(tt => {
		if (isEmptyObject(expected)) {
			tt.true(isEmptyObject(result));
		} else {
			tt.like(result, expected);
		}

		tt.deepEqual(logs, errorMessages);
	});

	assertions.commit({ retainLogs: !assertions.passed });
});

test("no repository", verify, {
	expected: {
		link: undefined,
		name: "foo",
		warnings: undefined,
	},
	name: "foo",
});

test("valid repository", verify, {
	expected: {
		link: "https://github.com/tommy-mitchell/npm-link-cli",
		name: "npm-link-cli",
		warnings: [],
	},
	name: "npm-link-cli",
	repository: {
		url: "https://github.com/tommy-mitchell/npm-link-cli.git",
	},
});

test("invalid repository - points to website", verify, {
	expected: {
		link: "https://example.com",
		name: "foo",
		warnings: [
			"The `repository` field in package.json should point to a Git repo and not a website. Please open an issue or pull request on `foo`.",
		],
	},
	name: "foo",
	repository: {
		url: "https://example.com",
	},
});

test("invalid repository - invalid URL, fallback to homepage", verify, {
	expected: {
		link: "https://example.com",
		name: "foo",
		warnings: [
			"The `repository` field in package.json is invalid. Please open an issue or pull request on `foo`.",
		],
	},
	homepage: "https://example.com",
	name: "foo",
	repository: {
		url: "foo",
	},
});

test("invalid repository - invalid URL, no homepage", verify, {
	expected: {
		link: undefined,
		name: "foo",
		warnings: [
			"The `repository` field in package.json is invalid. Please open an issue or pull request on `foo`.",
			"Tried falling back to `homepage` field, but none found in package.json.",
		],
	},
	name: "foo",
	repository: {
		url: "foo",
	},
});
