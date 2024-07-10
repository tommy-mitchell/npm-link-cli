import process from "node:process";
import anyTest, { type ExecutionContext, type TestFn } from "ava";
import { getExecutableBinPath } from "get-executable-bin-path";
import { type Permit, Semaphore } from "@shopify/semaphore";
import { execa as _execa, parseCommandString } from "execa";

// eslint-disable-next-line @typescript-eslint/naming-convention
const execa = _execa({ all: true, reject: false, env: { NO_COLOR: "1" } });

type TestContext = {
	binPath: string;
	permit: Permit;
};

export const test = anyTest as TestFn<TestContext>;

test.before("setup context", async t => {
	t.context.binPath = await getExecutableBinPath();
});

const semaphore = new Semaphore(Number(process.env["concurrency"]) || 5);

test.beforeEach("setup concurrency", async t => {
	t.context.permit = await semaphore.acquire();
});

test.afterEach.always(async t => {
	await t.context.permit.release();
});

type Input = string | string[];

type VerifyArgs = {
	t: ExecutionContext<TestContext>;
	input: Input;
	passes: boolean;
};

const _verify = async ({ t, input = [], passes }: VerifyArgs) => {
	const args = Array.isArray(input) ? input : parseCommandString(input);
	const expectedExitCode = passes ? 0 : 1;

	const { all: output, exitCode } = await execa(t.context.binPath, args);
	/// t.log(output);

	const assertions = await t.try(tt => {
		tt.log("args:", args);
		tt.snapshot(output);
		tt.is(exitCode, expectedExitCode, "Process exited with incorrect exit code!");
	});

	assertions.commit({ retainLogs: !assertions.passed });
};

export const verifyCli = test.macro(async (t, args: Input) => _verify({ t, input: args, passes: true }));

export const verifyCliFails = test.macro(async (t, args: Input) => _verify({ t, input: args, passes: false }));
