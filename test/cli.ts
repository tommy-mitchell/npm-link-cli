import anyTest, { type TestFn } from "ava";
import { execa } from "execa";
import { getBinPath } from "get-bin-path";
import { isExecutable } from "is-executable";

const test = anyTest as TestFn<{
	binPath: string;
}>;

test.before("setup context", async t => {
	const binPath = await getBinPath(); // eslint-disable-line unicorn/prevent-abbreviations
	t.truthy(binPath, "No bin path found!");

	t.context.binPath = binPath!.replace("dist", "src").replace(".js", ".ts");
	t.true(await isExecutable(t.context.binPath), "Source binary not executable!");
});

test("main", async t => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const result = await execa(t.context.binPath, ["meow"], { env: { NO_COLOR: "1" } });

	t.like(result, {
		stdout: "ℹ meow: https://www.npmjs.com/package/meow\n\n✔ Copied link to clipboard!",
		exitCode: 0,
	});
});

test.todo("multiple");
test.todo("--short");
test.todo("-s");
test.todo("--github");
test.todo("-g");
test.todo("no network connection?");
test.todo("package not found");
test.todo("no input - outputs current package");
test.todo("no input - not in project");
test.todo("linkifies");
test.todo("copies to clipboard");
