#!/usr/bin/env bun

import type { StatuslineConfig } from "../statusline.config";
import { loadConfig } from "./lib/config";
import { getContextData } from "./lib/context";
import {
	colors,
	formatBranch,
	formatPath,
	formatProgressBar,
	formatResetTime,
	formatSession,
	symbols,
} from "./lib/formatters";
import { getGitStatus } from "./lib/git";
import type { HookInput } from "./lib/types";
import { getUsageLimits } from "./lib/usage-limits";

function buildFirstLine(
	branch: string,
	dirPath: string,
	modelName: string,
	showSonnetModel: boolean,
	separator: string,
): string {
	const isSonnet = modelName.toLowerCase().includes("sonnet");
	const sep = `${colors.GRAY}${separator}${colors.LIGHT_GRAY}`;

	if (isSonnet && !showSonnetModel) {
		return `${colors.LIGHT_GRAY}${branch} ${sep} ${dirPath}${colors.RESET}`;
	}

	return `${colors.LIGHT_GRAY}${branch} ${sep} ${dirPath} ${sep} ${modelName}${colors.RESET}`;
}

function buildSecondLine(
	tokensUsed: number,
	tokensMax: number,
	contextPercentage: number,
	fiveHourUtilization: number | null,
	fiveHourReset: string | null,
	sevenDayUtilization: number | null,
	sevenDayReset: string | null,
	sessionConfig: StatuslineConfig["session"],
	limitsConfig: StatuslineConfig["limits"],
	separator: string,
): string {
	const useIconLabels = sessionConfig.useIconLabels ?? false;

	let line = formatSession(
		tokensUsed,
		tokensMax,
		contextPercentage,
		sessionConfig,
	);

	if (fiveHourUtilization !== null && fiveHourReset) {
		const resetTime = formatResetTime(fiveHourReset);
		const sep = `${colors.GRAY}${separator}`;
		const label = useIconLabels
			? `${colors.DIM}${symbols.USAGE_5H}${colors.RESET}`
			: `${colors.DIM}5h:${colors.RESET}`;

		if (limitsConfig.showProgressBar) {
			const bar = formatProgressBar(
				fiveHourUtilization,
				limitsConfig.progressBarLength,
				limitsConfig.color,
			);
			line += ` ${sep} ${label} ${bar} ${colors.LIGHT_GRAY}${fiveHourUtilization}${colors.GRAY}%${colors.RESET} ${colors.DIM}(${resetTime})${colors.RESET}`;
		} else {
			line += ` ${sep} ${label} ${colors.LIGHT_GRAY}${fiveHourUtilization}${colors.GRAY}%${colors.RESET} ${colors.DIM}(${resetTime})${colors.RESET}`;
		}
	}

	if (
		limitsConfig.showSevenDay &&
		sevenDayUtilization !== null &&
		sevenDayReset
	) {
		const resetTime = formatResetTime(sevenDayReset);
		const sep = `${colors.GRAY}${separator}`;
		const label = useIconLabels
			? `${colors.DIM}${symbols.USAGE_7D}${colors.RESET}`
			: `${colors.DIM}7d:${colors.RESET}`;

		if (limitsConfig.showProgressBar) {
			const bar = formatProgressBar(
				sevenDayUtilization,
				limitsConfig.progressBarLength,
				limitsConfig.color,
			);
			line += ` ${sep} ${label} ${bar} ${colors.LIGHT_GRAY}${sevenDayUtilization}${colors.GRAY}%${colors.RESET} ${colors.DIM}(${resetTime})${colors.RESET}`;
		} else {
			line += ` ${sep} ${label} ${colors.LIGHT_GRAY}${sevenDayUtilization}${colors.GRAY}%${colors.RESET} ${colors.DIM}(${resetTime})${colors.RESET}`;
		}
	}

	line += colors.RESET;

	return line;
}

async function main() {
	// Platform check: macOS only
	if (process.platform !== "darwin") {
		console.log(
			`${colors.RED}Error:${colors.LIGHT_GRAY} cc-statusline requires macOS${colors.RESET}`,
		);
		console.log(
			`${colors.GRAY}Current platform: ${process.platform}${colors.RESET}`,
		);
		process.exit(1);
	}

	try {
		const config = await loadConfig();
		const input: HookInput = await Bun.stdin.json();

		const git = await getGitStatus();
		const branch = formatBranch(git, config.git);
		const dirPath = formatPath(
			input.workspace.current_dir,
			config.pathDisplayMode,
		);

		const contextData = await getContextData({
			transcriptPath: input.transcript_path,
			maxContextTokens: config.context.maxContextTokens,
			autocompactBufferTokens: config.context.autocompactBufferTokens,
			useUsableContextOnly: config.context.useUsableContextOnly,
			overheadTokens: config.context.overheadTokens,
		});
		const usageLimits = await getUsageLimits();

		const firstLine = buildFirstLine(
			branch,
			dirPath,
			input.model.display_name,
			config.showSonnetModel,
			config.separator,
		);
		const secondLine = buildSecondLine(
			contextData.tokens,
			config.context.maxContextTokens,
			contextData.percentage,
			usageLimits.five_hour?.utilization ?? null,
			usageLimits.five_hour?.resets_at ?? null,
			usageLimits.seven_day?.utilization ?? null,
			usageLimits.seven_day?.resets_at ?? null,
			config.session,
			config.limits,
			config.separator,
		);

		if (config.oneLine) {
			const sep = ` ${colors.GRAY}${config.separator}${colors.LIGHT_GRAY} `;
			console.log(`${firstLine}${sep}${secondLine}`);
			console.log(""); // Empty second line for spacing
		} else {
			console.log(firstLine);
			console.log(secondLine);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.log(
			`${colors.RED}Error:${colors.LIGHT_GRAY} ${errorMessage}${colors.RESET}`,
		);
		console.log(`${colors.GRAY}Check statusline configuration${colors.RESET}`);
	}
}

main();
