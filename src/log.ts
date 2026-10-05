import logSymbols from "log-symbols";

export const log = {
	error: (...logs: unknown[]) => console.error(logSymbols.error, ...logs),
	info: (...logs: unknown[]) => console.info(logSymbols.info, ...logs),
	success: (...logs: unknown[]) => console.log(logSymbols.success, ...logs),
	warning: (...logs: unknown[]) => console.warn(logSymbols.warning, ...logs),
};
