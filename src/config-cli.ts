#!/usr/bin/env bun

import * as clack from "@clack/prompts";
import type { Separator, StatuslineConfig } from "../statusline.config";
import {
	exportConfig,
	getConfigValue,
	getDefaultConfig,
	importConfig,
	loadConfig,
	saveConfig,
	setConfigValue,
} from "./lib/config";

const SEPARATORS: Separator[] = [
	"|",
	"•",
	"·",
	"⋅",
	"●",
	"◆",
	"▪",
	"▸",
	"›",
	"→",
];

async function showMainMenu(config: StatuslineConfig): Promise<void> {
	const choice = await clack.select({
		message: "Select category to configure:",
		options: [
			{ value: "display", label: "Display Options" },
			{ value: "git", label: "Git Settings" },
			{ value: "session", label: "Session Info" },
			{ value: "context", label: "Context Window" },
			{ value: "limits", label: "Usage Limits" },
			{ value: "import", label: "Import Config" },
			{ value: "export", label: "Export Config" },
			{ value: "reset", label: "Reset to Defaults" },
			{ value: "save", label: "Save & Exit" },
			{ value: "cancel", label: "Cancel (discard changes)" },
		],
	});

	if (clack.isCancel(choice)) {
		clack.cancel("Configuration cancelled");
		process.exit(0);
	}

	switch (choice) {
		case "display":
			await configureDisplay(config);
			break;
		case "git":
			await configureGit(config);
			break;
		case "session":
			await configureSession(config);
			break;
		case "context":
			await configureContext(config);
			break;
		case "limits":
			await configureLimits(config);
			break;
		case "import":
			await handleImport(config);
			break;
		case "export":
			await handleExport(config);
			break;
		case "reset":
			await handleReset(config);
			break;
		case "save":
			await saveConfig(config);
			clack.outro("Config saved successfully!");
			process.exit(0);
			break;
		case "cancel":
			clack.cancel("Changes discarded");
			process.exit(0);
			break;
	}

	// Loop back to main menu
	await showMainMenu(config);
}

async function configureDisplay(config: StatuslineConfig): Promise<void> {
	while (true) {
		clack.intro("Display Options");

		const check = (val: boolean) => (val ? "✓" : "✗");
		clack.log.info(
			`\n  One line: ${check(config.oneLine)}\n  Show first line: ${check(config.showFirstLine)}\n  Show Sonnet model: ${check(config.showSonnetModel)}\n  Path mode: ${config.pathDisplayMode}\n  Use icon labels: ${check(config.useIconLabels)}\n  Separator: ${config.separator}\n`,
		);

		const choice = await clack.select({
			message: "What would you like to change?",
			options: [
				{
					value: "oneLine",
					label: `${check(config.oneLine)} Toggle one line`,
				},
				{
					value: "showFirstLine",
					label: `${check(config.showFirstLine)} Toggle first line (session info)`,
				},
				{
					value: "showSonnet",
					label: `${check(config.showSonnetModel)} Toggle show Sonnet model`,
				},
				{
					value: "pathMode",
					label: `Change path mode (${config.pathDisplayMode})`,
				},
				{
					value: "useIconLabels",
					label: `${check(config.useIconLabels)} Toggle icon labels (📚 🕔 📅)`,
				},
				{
					value: "separator",
					label: `Change separator (${config.separator})`,
				},
				{ value: "back", label: "← Back to main menu" },
			],
		});

		if (clack.isCancel(choice) || choice === "back") {
			break;
		}

		switch (choice) {
			case "oneLine":
				config.oneLine = !config.oneLine;
				break;
			case "showFirstLine":
				config.showFirstLine = !config.showFirstLine;
				break;
			case "showSonnet":
				config.showSonnetModel = !config.showSonnetModel;
				break;
			case "pathMode": {
				const mode = await clack.select({
					message: "Select path display mode:",
					options: [
						{ value: "full", label: "Full path with ~ substitution" },
						{ value: "truncated", label: "Last 2 segments" },
						{ value: "basename", label: "Directory name only" },
					],
					initialValue: config.pathDisplayMode,
				});
				if (!clack.isCancel(mode)) {
					config.pathDisplayMode = mode as "full" | "truncated" | "basename";
				}
				break;
			}
			case "useIconLabels":
				config.useIconLabels = !config.useIconLabels;
				break;
			case "separator": {
				const sep = await clack.select({
					message: "Select separator character:",
					options: SEPARATORS.map((s) => ({ value: s, label: s })),
					initialValue: config.separator,
				});
				if (!clack.isCancel(sep)) {
					config.separator = sep as Separator;
				}
				break;
			}
		}
	}
}

async function configureGit(config: StatuslineConfig): Promise<void> {
	while (true) {
		clack.intro("Git Settings");

		const check = (val: boolean) => (val ? "✓" : "✗");
		clack.log.info(
			`\n  Show branch: ${check(config.git.showBranch)}\n  Show dirty indicator (*): ${check(config.git.showDirtyIndicator)}\n  Show line changes (+/-): ${check(config.git.showChanges)}\n  Show staged files: ${check(config.git.showStaged)}\n  Show unstaged files: ${check(config.git.showUnstaged)}\n`,
		);

		const choice = await clack.select({
			message: "What would you like to change?",
			options: [
				{
					value: "showBranch",
					label: `${check(config.git.showBranch)} Toggle show branch`,
				},
				{
					value: "showDirty",
					label: `${check(config.git.showDirtyIndicator)} Toggle dirty indicator (*)`,
				},
				{
					value: "showChanges",
					label: `${check(config.git.showChanges)} Toggle line changes (+/-)`,
				},
				{
					value: "showStaged",
					label: `${check(config.git.showStaged)} Toggle staged files`,
				},
				{
					value: "showUnstaged",
					label: `${check(config.git.showUnstaged)} Toggle unstaged files`,
				},
				{ value: "back", label: "← Back to main menu" },
			],
		});

		if (clack.isCancel(choice) || choice === "back") {
			break;
		}

		switch (choice) {
			case "showBranch":
				config.git.showBranch = !config.git.showBranch;
				break;
			case "showDirty":
				config.git.showDirtyIndicator = !config.git.showDirtyIndicator;
				break;
			case "showChanges":
				config.git.showChanges = !config.git.showChanges;
				break;
			case "showStaged":
				config.git.showStaged = !config.git.showStaged;
				break;
			case "showUnstaged":
				config.git.showUnstaged = !config.git.showUnstaged;
				break;
		}
	}
}

async function configureSession(config: StatuslineConfig): Promise<void> {
	while (true) {
		clack.intro("Session Info");

		const check = (val: boolean) => (val ? "✓" : "✗");
		const infoSep = config.session.infoSeparator || "(space)";
		clack.log.info(
			`\n  Show tokens: ${check(config.session.showTokens)}\n  Show max tokens: ${check(config.session.showMaxTokens)}\n  Show decimals: ${check(config.session.showTokenDecimals)}\n  Show percentage: ${check(config.session.showPercentage)}\n  Info separator: ${infoSep}\n`,
		);

		const choice = await clack.select({
			message: "What would you like to change?",
			options: [
				{
					value: "showTokens",
					label: `${check(config.session.showTokens)} Toggle show tokens`,
				},
				{
					value: "showMax",
					label: `${check(config.session.showMaxTokens)} Toggle show max tokens`,
				},
				{
					value: "showDecimals",
					label: `${check(config.session.showTokenDecimals)} Toggle show decimals`,
				},
				{
					value: "showPercentage",
					label: `${check(config.session.showPercentage)} Toggle show percentage`,
				},
				{
					value: "infoSeparator",
					label: `Change info separator (${infoSep})`,
				},
				{ value: "back", label: "← Back to main menu" },
			],
		});

		if (clack.isCancel(choice) || choice === "back") {
			break;
		}

		switch (choice) {
			case "showTokens":
				config.session.showTokens = !config.session.showTokens;
				break;
			case "showMax":
				config.session.showMaxTokens = !config.session.showMaxTokens;
				break;
			case "showDecimals":
				config.session.showTokenDecimals = !config.session.showTokenDecimals;
				break;
			case "showPercentage":
				config.session.showPercentage = !config.session.showPercentage;
				break;
			case "infoSeparator": {
				const useSeparator = await clack.confirm({
					message: "Use custom separator? (No = space)",
					initialValue: config.session.infoSeparator !== null,
				});

				if (!clack.isCancel(useSeparator)) {
					if (useSeparator) {
						const separator = await clack.select({
							message: "Select info separator:",
							options: SEPARATORS.map((s) => ({ value: s, label: s })),
							initialValue: config.session.infoSeparator || "|",
						});

						if (!clack.isCancel(separator)) {
							config.session.infoSeparator = separator as Separator;
						}
					} else {
						config.session.infoSeparator = null;
					}
				}
				break;
			}
		}
	}
}

async function configureContext(config: StatuslineConfig): Promise<void> {
	while (true) {
		clack.intro("Context Window");

		const check = (val: boolean) => (val ? "✓" : "✗");
		clack.log.info(
			`\n  Max context tokens: ${config.context.maxContextTokens}\n  Autocompact buffer: ${config.context.autocompactBufferTokens}\n  Use usable context only: ${check(config.context.useUsableContextOnly)}\n  Overhead tokens: ${config.context.overheadTokens}\n`,
		);

		const choice = await clack.select({
			message: "What would you like to change?",
			options: [
				{
					value: "maxTokens",
					label: `Change max context tokens (${config.context.maxContextTokens})`,
				},
				{
					value: "autocompact",
					label: `Change autocompact buffer (${config.context.autocompactBufferTokens})`,
				},
				{
					value: "useUsable",
					label: `${check(config.context.useUsableContextOnly)} Toggle use usable context only`,
				},
				{
					value: "overhead",
					label: `Change overhead tokens (${config.context.overheadTokens})`,
				},
				{ value: "back", label: "← Back to main menu" },
			],
		});

		if (clack.isCancel(choice) || choice === "back") {
			break;
		}

		switch (choice) {
			case "maxTokens": {
				const value = await clack.text({
					message: "Maximum context tokens:",
					initialValue: String(config.context.maxContextTokens),
					validate: (v) => {
						const num = Number.parseInt(v, 10);
						if (Number.isNaN(num) || num <= 0)
							return "Must be a positive number";
					},
				});
				if (!clack.isCancel(value)) {
					config.context.maxContextTokens = Number.parseInt(value, 10);
				}
				break;
			}
			case "autocompact": {
				const value = await clack.text({
					message: "Autocompact buffer tokens:",
					initialValue: String(config.context.autocompactBufferTokens),
					validate: (v) => {
						const num = Number.parseInt(v, 10);
						if (Number.isNaN(num) || num < 0)
							return "Must be a non-negative number";
					},
				});
				if (!clack.isCancel(value)) {
					config.context.autocompactBufferTokens = Number.parseInt(value, 10);
				}
				break;
			}
			case "useUsable":
				config.context.useUsableContextOnly =
					!config.context.useUsableContextOnly;
				break;
			case "overhead": {
				const value = await clack.text({
					message: "System overhead tokens estimate:",
					initialValue: String(config.context.overheadTokens),
					validate: (v) => {
						const num = Number.parseInt(v, 10);
						if (Number.isNaN(num) || num < 0)
							return "Must be a non-negative number";
					},
				});
				if (!clack.isCancel(value)) {
					config.context.overheadTokens = Number.parseInt(value, 10);
				}
				break;
			}
		}
	}
}

async function configureLimits(config: StatuslineConfig): Promise<void> {
	while (true) {
		clack.intro("Usage Limits");

		const check = (val: boolean) => (val ? "✓" : "✗");
		clack.log.info(
			`\n  Show progress bar: ${check(config.limits.showProgressBar)}\n  Progress bar length: ${config.limits.progressBarLength} chars\n  Color mode: ${config.limits.color}\n  Show seven-day limit: ${check(config.limits.showSevenDay)}\n`,
		);

		const choice = await clack.select({
			message: "What would you like to change?",
			options: [
				{
					value: "showBar",
					label: `${check(config.limits.showProgressBar)} Toggle show progress bar`,
				},
				{
					value: "barLength",
					label: `Change bar length (${config.limits.progressBarLength} chars)`,
				},
				{
					value: "color",
					label: `Change color mode (${config.limits.color})`,
				},
				{
					value: "showSevenDay",
					label: `${check(config.limits.showSevenDay)} Toggle seven-day limit`,
				},
				{ value: "back", label: "← Back to main menu" },
			],
		});

		if (clack.isCancel(choice) || choice === "back") {
			break;
		}

		switch (choice) {
			case "showBar":
				config.limits.showProgressBar = !config.limits.showProgressBar;
				break;
			case "barLength": {
				const length = await clack.select({
					message: "Select progress bar length:",
					options: [
						{ value: 5, label: "5 characters" },
						{ value: 10, label: "10 characters" },
						{ value: 15, label: "15 characters" },
					],
					initialValue: config.limits.progressBarLength,
				});
				if (!clack.isCancel(length)) {
					config.limits.progressBarLength = length as 5 | 10 | 15;
				}
				break;
			}
			case "color": {
				const colorMode = await clack.select({
					message: "Select color mode:",
					options: [
						{
							value: "progressive",
							label: "Progressive (changes based on usage)",
						},
						{ value: "green", label: "Always green" },
						{ value: "yellow", label: "Always yellow" },
						{ value: "red", label: "Always red" },
						{ value: "blue", label: "Always blue" },
					],
					initialValue: config.limits.color,
				});
				if (!clack.isCancel(colorMode)) {
					config.limits.color = colorMode as
						| "progressive"
						| "green"
						| "yellow"
						| "red"
						| "blue";
				}
				break;
			}
			case "showSevenDay":
				config.limits.showSevenDay = !config.limits.showSevenDay;
				break;
		}
	}
}

async function handleImport(config: StatuslineConfig): Promise<void> {
	const filePath = await clack.text({
		message: "Enter path to config file:",
		placeholder: "./my-config.json",
	});

	if (clack.isCancel(filePath)) {
		return;
	}

	try {
		const importedConfig = await importConfig(filePath);
		Object.assign(config, importedConfig);
		clack.outro("Config imported successfully!");
	} catch (error) {
		clack.log.error(
			`Failed to import: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function handleExport(config: StatuslineConfig): Promise<void> {
	const filePath = await clack.text({
		message: "Enter export path:",
		placeholder: "./my-config.json",
	});

	if (clack.isCancel(filePath)) {
		return;
	}

	try {
		await exportConfig(config, filePath);
		clack.outro(`Config exported to ${filePath}`);
	} catch (error) {
		clack.log.error(
			`Failed to export: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function handleReset(config: StatuslineConfig): Promise<void> {
	const confirm = await clack.confirm({
		message: "Reset all settings to defaults?",
	});

	if (clack.isCancel(confirm) || !confirm) {
		return;
	}

	const defaults = getDefaultConfig();
	Object.assign(config, defaults);
	clack.outro("Config reset to defaults");
}

// Programmatic commands
async function cmdSet(key: string, value: string): Promise<void> {
	const config = await loadConfig();

	// Type conversion
	let parsedValue: unknown = value;

	if (value === "true" || value === "false") {
		parsedValue = value === "true";
	} else if (!Number.isNaN(Number(value))) {
		parsedValue = Number(value);
	} else if (value === "null") {
		parsedValue = null;
	}

	const newConfig = setConfigValue(config, key, parsedValue);
	await saveConfig(newConfig);
	console.log(`Set ${key} = ${value}`);
}

async function cmdGet(key?: string): Promise<void> {
	const config = await loadConfig();

	if (key) {
		const value = getConfigValue(config, key);
		console.log(JSON.stringify(value, null, 2));
	} else {
		console.log(JSON.stringify(config, null, 2));
	}
}

async function cmdList(): Promise<void> {
	const config = await loadConfig();

	console.log("\n=== Statusline Configuration ===\n");

	console.log("Display:");
	console.log(`  oneLine: ${config.oneLine}`);
	console.log(`  showFirstLine: ${config.showFirstLine}`);
	console.log(`  showSonnetModel: ${config.showSonnetModel}`);
	console.log(`  pathDisplayMode: ${config.pathDisplayMode}`);
	console.log(`  useIconLabels: ${config.useIconLabels}`);
	console.log(`  separator: ${config.separator}`);

	console.log("\nGit:");
	console.log(`  showBranch: ${config.git.showBranch}`);
	console.log(`  showDirtyIndicator: ${config.git.showDirtyIndicator}`);
	console.log(`  showChanges: ${config.git.showChanges}`);
	console.log(`  showStaged: ${config.git.showStaged}`);
	console.log(`  showUnstaged: ${config.git.showUnstaged}`);

	console.log("\nSession:");
	console.log(`  infoSeparator: ${config.session.infoSeparator}`);
	console.log(`  showTokens: ${config.session.showTokens}`);
	console.log(`  showMaxTokens: ${config.session.showMaxTokens}`);
	console.log(`  showTokenDecimals: ${config.session.showTokenDecimals}`);
	console.log(`  showPercentage: ${config.session.showPercentage}`);

	console.log("\nContext:");
	console.log(`  maxContextTokens: ${config.context.maxContextTokens}`);
	console.log(
		`  autocompactBufferTokens: ${config.context.autocompactBufferTokens}`,
	);
	console.log(`  useUsableContextOnly: ${config.context.useUsableContextOnly}`);
	console.log(`  overheadTokens: ${config.context.overheadTokens}`);

	console.log("\nLimits:");
	console.log(`  showProgressBar: ${config.limits.showProgressBar}`);
	console.log(`  progressBarLength: ${config.limits.progressBarLength}`);
	console.log(`  color: ${config.limits.color}`);
	console.log(`  showSevenDay: ${config.limits.showSevenDay}`);

	console.log("");
}

async function cmdReset(key?: string): Promise<void> {
	const config = await loadConfig();
	const defaults = getDefaultConfig();

	if (key) {
		const defaultValue = getConfigValue(defaults, key);
		const newConfig = setConfigValue(config, key, defaultValue);
		await saveConfig(newConfig);
		console.log(`Reset ${key} to default: ${JSON.stringify(defaultValue)}`);
	} else {
		await saveConfig(defaults);
		console.log("Reset all settings to defaults");
	}
}

async function cmdImport(filePath: string): Promise<void> {
	try {
		const config = await importConfig(filePath);
		await saveConfig(config);
		console.log(`Config imported from ${filePath}`);
	} catch (error) {
		console.error(
			`Failed to import: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}

async function cmdExport(filePath: string): Promise<void> {
	try {
		const config = await loadConfig();
		await exportConfig(config, filePath);
		console.log(`Config exported to ${filePath}`);
	} catch (error) {
		console.error(
			`Failed to export: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}

async function main() {
	const args = process.argv.slice(2);

	// Programmatic commands
	if (args.length > 0) {
		const command = args[0];

		switch (command) {
			case "set":
				if (args.length < 3) {
					console.error("Usage: config set <key> <value>");
					process.exit(1);
				}
				await cmdSet(args[1], args[2]);
				break;

			case "get":
				await cmdGet(args[1]);
				break;

			case "list":
				await cmdList();
				break;

			case "reset":
				await cmdReset(args[1]);
				break;

			case "import":
				if (args.length < 2) {
					console.error("Usage: config import <file>");
					process.exit(1);
				}
				await cmdImport(args[1]);
				break;

			case "export":
				if (args.length < 2) {
					console.error("Usage: config export <file>");
					process.exit(1);
				}
				await cmdExport(args[1]);
				break;

			default:
				console.error(`Unknown command: ${command}`);
				console.error(
					"Available commands: set, get, list, reset, import, export",
				);
				process.exit(1);
		}
	} else {
		// Interactive mode
		clack.intro("Statusline Configuration");

		const config = await loadConfig();
		await showMainMenu(config);
	}
}

main();
