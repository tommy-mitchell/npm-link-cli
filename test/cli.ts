import { execa } from "execa";
import hasAnsi from "has-ansi";
import { test, verifyCli, verifyCliFails } from "./_util.js";

test("single input - copies to clipboard", verifyCli, "meow");
test("no input - outputs current package and copies to clipboard", verifyCli, "");
test("no input - not in project", verifyCliFails, "", { cwd: "/" }); // TODO: temp dir?
test("multiple inputs", verifyCli, "meow np nnnope");

for (const flag of ["--help", "-h"]) {
	test(`shows help - ${flag}`, verifyCli, [flag]);
}

for (const flag of ["--short", "-s"]) {
	test(`short link - ${flag}`, verifyCli, ["meow", "np", flag]);
}

for (const flag of ["--github", "-g"]) {
	test(`GitHub link - ${flag}`, verifyCli, ["meow", "np", flag]);
}

test("linkifies", async t => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const { stdout } = await execa(t.context.binPath, { env: { FORCE_COLOR: "1" } });
	t.true(hasAnsi(stdout));
});

test.todo("no network connection");
test.todo("copies to clipboard");
