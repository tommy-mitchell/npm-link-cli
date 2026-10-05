import * as configs from "@tommy-mitchell/configs/xo";

/** @type {import('xo').FlatXoConfig} */
export default [...configs.xo, ...configs.dprint, { ignores: ["test/fixtures"] }, {
	rules: {
		"ava/no-async-fn-without-await": "off",
		"unicorn/no-process-exit": "off",
	},
}];
