import { stripVTControlCharacters as stripAnsi } from "node:util";
import test from "ava";
import { tq } from "@tommy-mitchell/test-helpers";
import type { FullVersion } from "package-json";
import type { AsyncReturnType, UnknownRecord } from "type-fest";
import type { getGitHubLink } from "#src/github.ts";

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

	const { getGitHubLink: getLink } = await tq.replace<typeof import("#src/github.ts")>({
		globalMocks: {
			import: {
				console: {
					error: (message: string) => {
						logs.push(stripAnsi(message));
					},
				},
			},
		},
		importMeta: import.meta,
		modulePath: "#src/github.ts",
	});

	const result = await getLink({ homepage, name, repository } as FullVersion);

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
	expected: {},
	name: "foo",
});

test("valid repository", verify, {
	expected: {
		didWarn: false,
		link: "https://github.com/tommy-mitchell/npm-link-cli",
	},
	name: "npm-link-cli",
	repository: {
		url: "https://github.com/tommy-mitchell/npm-link-cli.git",
	},
});

test("invalid repository - points to website", verify, {
	errorMessage:
		"✖ The `repository` field in package.json should point to a Git repo and not a website. Please open an issue or pull request on `foo`.",
	expected: {
		didWarn: true,
		link: "https://example.com",
	},
	name: "foo",
	repository: {
		url: "https://example.com",
	},
});

test("invalid repository - invalid URL, fallback to homepage", verify, {
	errorMessage:
		"✖ The `repository` field in package.json is invalid. Please open an issue or pull request on `foo`. Using the `homepage` field instead.",
	expected: {
		didWarn: true,
		link: "https://example.com",
	},
	homepage: "https://example.com",
	name: "foo",
	repository: {
		url: "foo",
	},
});

test("invalid repository - invalid URL, no homepage", verify, {
	errorMessage: [
		"✖ The `repository` field in package.json is invalid. Please open an issue or pull request on `foo`. Using the `homepage` field instead.",
		"✖ No `homepage` field found in package.json.",
	],
	expected: {},
	name: "foo",
	repository: {
		url: "foo",
	},
});
