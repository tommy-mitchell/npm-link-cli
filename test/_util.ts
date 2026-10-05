/* eslint-disable ava/no-ignored-test-files, unicorn/no-top-level-side-effects -- util */
import anyTest, { type ExecutionContext, type TestFn } from "ava";
import {
	$,
	type ConcurrencyContext,
	getExecutableBinPath,
	parseCommandString,
	withConcurrency,
} from "@tommy-mitchell/test-helpers";
import prettyAnsi from "pretty-ansi";

type TestContext = {
	binPath: string;
	concurrency: ConcurrencyContext;
};

export const test = anyTest as TestFn<TestContext>;

test.before("setup context", async t => {
	t.context.binPath = await getExecutableBinPath({
		map: binPath => binPath.replace("dist", "src").replace(".js", ".ts"),
	});

	t.context.concurrency = await withConcurrency();
	t.log("CLI concurrency:", t.context.concurrency.max);
});

test.beforeEach("setup concurrency", async t => {
	await t.context.concurrency.lock();
});

test.afterEach.always(t => {
	t.context.concurrency.unlock();
});

// Matches OSC 8 hyperlinks (BEL or ST terminated), optionally tmux-wrapped
// eslint-disable-next-line no-control-regex, regexp/no-control-character, regexp/prefer-named-capture-group -- terminal escape sequences, dprint-ignore
const terminalLinkRegex = /\u{1B}\]8;[^\u{7}\u{1B};]*;([^\u{7}\u{1B}]*)(?:\u{7}|\u{1B}\\)(.*?)\u{1B}\]8;;(?:\u{7}|\u{1B}\\)/gsv;

/** Replaces terminal links with `<link url>text</link>`, then serializes remaining ANSI codes. */
export const prettyAnsiWithLinks = (text: string) => (
	prettyAnsi(text.replaceAll(terminalLinkRegex, "<link $1>$2</link>"))
);

type Input = string[] | string;

type Options = {
	cwd?: string;
};

type VerifyArgs = Options & {
	input: Input;
	passes: boolean;
	t: ExecutionContext<TestContext>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const $$ = $({ all: true, env: { FORCE_HYPERLINK: "1" }, reject: false });

const _verify = async ({ cwd, input, passes, t }: VerifyArgs) => {
	const args = Array.isArray(input) ? input : parseCommandString(input);
	const expectedExitCode = passes ? 0 : 1;

	const { all: output, exitCode } = await $$(t.context.binPath, args, { cwd });
	const pretty = prettyAnsiWithLinks(output);

	const assertions = await t.try(tt => {
		tt.log("args:", args);
		tt.snapshot(pretty);
		tt.is(exitCode, expectedExitCode, "Process exited with incorrect exit code!");
	});

	assertions.commit({ retainLogs: !assertions.passed });
};

// eslint-disable-next-line ava/no-inline-assertions
export const verifyCli = test.macro(async (t, args: Input, options?: Options) => (
	_verify({ ...options, input: args, passes: true, t })
));

// eslint-disable-next-line ava/no-inline-assertions
export const verifyCliFails = test.macro(async (t, args: Input, options?: Options) => (
	_verify({ ...options, input: args, passes: false, t })
));
