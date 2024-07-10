import { test, verifyCli } from "./_util.js";

test("single input - copies to clipboard", verifyCli, "meow");
test("no input - outputs current package and copies to clipboard", verifyCli, "");
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

test.todo("no network connection");
test.todo("no input - not in project");
test.todo("linkifies");
test.todo("copies to clipboard");

// TODO: prune unused snapshots?
