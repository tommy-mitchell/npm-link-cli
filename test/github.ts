import test from "ava";
import esmock from "esmock";
import stripAnsi from "strip-ansi";
import type { AsyncReturnType, UnknownRecord } from "type-fest";
import type { FullVersion } from "package-json";
import type { getGitHubLink } from "../src/github.js";

const isEmptyObject = (object: UnknownRecord) => Object.keys(object).length === 0;

type MacroArgs = [{
	name: string;
	repository?: {
		url: string;
	};
	homepage?: string;
	expected: AsyncReturnType<typeof getGitHubLink>;
	errorMessage?: string | string[];
}];

const verify = test.macro<MacroArgs>(async (t, { name, repository, homepage, expected, errorMessage = [] }) => {
	const errorMessages = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
	const logs: string[] = [];

	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	const { getGitHubLink: getLink } = await esmock<typeof import("../src/github.ts")>(
		"../src/github.ts",
		import.meta.url,
		{},
		{
			import: {
				console: { error: (message: string) => logs.push(stripAnsi(message)) },
			},
		},
	);

	const result = await getLink({ name, repository, homepage } as FullVersion);

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
	name: "foo",
	expected: {},
});

test("valid repository", verify, {
	name: "npm-link-cli",
	repository: {
		url: "https://github.com/tommy-mitchell/npm-link-cli.git",
	},
	expected: {
		link: "https://github.com/tommy-mitchell/npm-link-cli",
		didWarn: false,
	},
});

test("invalid repository - points to website", verify, {
	name: "foo",
	repository: {
		url: "https://example.com",
	},
	expected: {
		link: "https://example.com",
		didWarn: true,
	},
	errorMessage:
		"✖ The `repository` field in package.json should point to a Git repo and not a website. Please open an issue or pull request on `foo`.",
});

test("invalid repository - invalid URL, fallback to homepage", verify, {
	name: "foo",
	repository: {
		url: "foo",
	},
	homepage: "http://example.com",
	expected: {
		link: "http://example.com",
		didWarn: true,
	},
	errorMessage:
		"✖ The `repository` field in package.json is invalid. Please open an issue or pull request on `foo`. Using the `homepage` field instead.",
});

test("invalid repository - invalid URL, no homepage", verify, {
	name: "foo",
	repository: {
		url: "foo",
	},
	expected: {},
	errorMessage: [
		"✖ The `repository` field in package.json is invalid. Please open an issue or pull request on `foo`. Using the `homepage` field instead.",
		"✖ No `homepage` field found in package.json.",
	],
});
