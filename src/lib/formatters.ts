import type { Separator, StatuslineConfig } from "../../statusline.config";
import type { GitStatus } from "./git";

export const colors = {
	GREEN: "\x1b[0;32m",
	RED: "\x1b[0;31m",
	PURPLE: "\x1b[0;35m",
	YELLOW: "\x1b[0;33m",
	ORANGE: "\x1b[38;5;208m",
	GRAY: "\x1b[0;90m",
	DIM: "\x1b[2;90m",
	LIGHT_GRAY: "\x1b[0;37m",
	// Foreground colors for progress bars
	FG_GRAY: "\x1b[38;5;240m",
	FG_YELLOW: "\x1b[38;5;220m",
	FG_ORANGE: "\x1b[38;5;208m",
	FG_RED: "\x1b[38;5;196m",
	FG_GREEN: "\x1b[38;5;28m",
	FG_EMPTY: "\x1b[38;5;236m",
	// Background color for progress bar
	BG_BAR: "\x1b[48;5;236m",
	RESET: "\x1b[0m",
} as const;

export const symbols = {
	CONTEXT: "📚",
	USAGE_5H: "🕔",
	USAGE_7D: "📅",
	DIRTY: "•",
	CHANGES: "±",
} as const;

export function formatBranch(
	git: GitStatus,
	gitConfig: StatuslineConfig["git"],
): string {
	let result = "";

	if (gitConfig.showBranch) {
		result = git.branch;
	}

	if (git.hasChanges) {
		const changes: string[] = [];

		if (gitConfig.showDirtyIndicator) {
			result += ` ${colors.PURPLE}${symbols.DIRTY}${colors.RESET}`;
		}

		if (gitConfig.showChanges) {
			const totalAdded = git.staged.added + git.unstaged.added;
			const totalDeleted = git.staged.deleted + git.unstaged.deleted;
			const total = totalAdded + totalDeleted;

			if (total > 0) {
				changes.push(
					`${colors.GREEN}+${totalAdded}${colors.RESET} ${colors.RED}-${totalDeleted}${colors.RESET}`,
				);
			}
		}

		if (gitConfig.showStaged && git.staged.files > 0) {
			changes.push(`${colors.GRAY}~${git.staged.files}${colors.RESET}`);
		}

		if (gitConfig.showUnstaged && git.unstaged.files > 0) {
			changes.push(`${colors.YELLOW}~${git.unstaged.files}${colors.RESET}`);
		}

		if (changes.length > 0) {
			result += ` ${changes.join(" ")}`;
		}
	}

	return result;
}

export function formatPath(
	path: string,
	mode: "full" | "truncated" | "basename" = "truncated",
): string {
	const home = process.env.HOME || "";
	let formattedPath = path;

	if (home && path.startsWith(home)) {
		formattedPath = `~${path.slice(home.length)}`;
	}

	if (mode === "basename") {
		const segments = path.split("/").filter((s) => s.length > 0);
		return segments[segments.length - 1] || path;
	}

	if (mode === "truncated") {
		const segments = formattedPath.split("/").filter((s) => s.length > 0);
		if (segments.length > 2) {
			return `/${segments.slice(-2).join("/")}`;
		}
	}

	return formattedPath;
}

export function formatTokens(tokens: number, showDecimals = true): string {
	if (tokens >= 1000000) {
		const value = tokens / 1000000;
		const number = showDecimals
			? value.toFixed(1)
			: Math.round(value).toString();
		return `${number}${colors.GRAY}m${colors.LIGHT_GRAY}`;
	}
	if (tokens >= 1000) {
		const value = tokens / 1000;
		const number = showDecimals
			? value.toFixed(1)
			: Math.round(value).toString();
		return `${number}${colors.GRAY}k${colors.LIGHT_GRAY}`;
	}
	return tokens.toString();
}

export function formatResetTime(resetsAt: string): string {
	try {
		const resetDate = new Date(resetsAt);
		const now = new Date();
		const diffMs = resetDate.getTime() - now.getTime();

		if (diffMs <= 0) {
			return "now";
		}

		const days = Math.floor(diffMs / 86400000);
		const hours = Math.floor((diffMs % 86400000) / 3600000);
		const minutes = Math.floor((diffMs % 3600000) / 60000);

		if (days > 0) {
			return hours > 0 ? `${days}d${hours}h` : `${days}d`;
		}
		if (hours > 0) {
			return `${hours}h${minutes}m`;
		}
		return `${minutes}m`;
	} catch {
		return "N/A";
	}
}

export function formatProgressBar(
	percentage: number,
	length: number,
	colorMode: "progressive" | "green" | "yellow" | "red",
): string {
	// Partial block characters from empty to nearly full
	const partialBlocks = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];

	// Calculate progress
	const progress = (percentage / 100) * length;
	const fullBlocks = Math.floor(progress);
	const remainder = progress % 1;

	// Get partial block character
	const partialBlockIndex = Math.floor(remainder * 8);
	const partialBlock = partialBlocks[partialBlockIndex];

	// Calculate empty blocks
	const usedBlocks = fullBlocks + (partialBlock ? 1 : 0);
	const emptyBlocks = Math.max(0, length - usedBlocks);

	// Determine foreground color
	let fgColor: string;
	if (colorMode === "progressive") {
		if (percentage < 50) {
			fgColor = colors.FG_GRAY;
		} else if (percentage < 70) {
			fgColor = colors.FG_YELLOW;
		} else if (percentage < 90) {
			fgColor = colors.FG_ORANGE;
		} else {
			fgColor = colors.FG_RED;
		}
	} else if (colorMode === "green") {
		fgColor = colors.FG_GREEN;
	} else if (colorMode === "yellow") {
		fgColor = colors.FG_YELLOW;
	} else {
		fgColor = colors.FG_RED;
	}

	// Build progress bar with background to mask gaps
	let result = colors.BG_BAR;

	// Filled portion (full blocks and partial) with bright foreground color
	if (fullBlocks > 0 || partialBlock) {
		result += fgColor + '█'.repeat(fullBlocks);
		if (partialBlock) result += partialBlock;
	}

	// Empty portion with dim gray foreground (no RESET between sections)
	if (emptyBlocks > 0) {
		result += colors.FG_EMPTY + '░'.repeat(emptyBlocks);
	}

	// Single RESET at the end
	result += colors.RESET;

	return result;
}

export interface SessionConfig {
	infoSeparator: Separator | null;
	showTokens: boolean;
	showMaxTokens: boolean;
	showTokenDecimals: boolean;
	showPercentage: boolean;
}

export function formatSession(
	tokensUsed: number,
	tokensMax: number,
	percentage: number,
	config: SessionConfig,
	useIconLabels: boolean,
): string {
	const sessionItems: string[] = [];

	if (config.showTokens) {
		const formattedUsed = formatTokens(tokensUsed, config.showTokenDecimals);
		if (config.showMaxTokens) {
			const formattedMax = formatTokens(tokensMax, config.showTokenDecimals);
			sessionItems.push(
				`${formattedUsed}${colors.GRAY}/${formattedMax}${colors.LIGHT_GRAY}`,
			);
		} else {
			sessionItems.push(formattedUsed);
		}
	}
	if (config.showPercentage) {
		sessionItems.push(`${percentage}${colors.GRAY}%${colors.LIGHT_GRAY}`);
	}

	if (sessionItems.length === 0) {
		return "";
	}

	const label = useIconLabels
		? `${colors.DIM}${symbols.CONTEXT}${colors.RESET}`
		: `${colors.DIM}Context:${colors.RESET}`;

	const infoSep = config.infoSeparator
		? ` ${colors.GRAY}${config.infoSeparator}${colors.LIGHT_GRAY} `
		: " ";
	return `${label} ${colors.LIGHT_GRAY}${sessionItems.join(infoSep)}${colors.RESET}`;
}
