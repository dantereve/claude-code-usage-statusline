import { existsSync } from "node:fs";
import { join } from "node:path";
import type { StatuslineConfig } from "../../statusline.config";
import { defaultConfig } from "../../statusline.config";

const CONFIG_PATH = join(import.meta.dir, "../../statusline.config.json");

/**
 * Deep merge two objects, with source overwriting target
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
	const result = { ...target };
	for (const key in source) {
		const sourceValue = source[key];
		const targetValue = result[key];
		if (
			sourceValue &&
			typeof sourceValue === "object" &&
			!Array.isArray(sourceValue) &&
			targetValue &&
			typeof targetValue === "object" &&
			!Array.isArray(targetValue)
		) {
			// @ts-expect-error - Deep merge nested objects
			result[key] = deepMerge(targetValue, sourceValue);
		} else if (sourceValue !== undefined) {
			// @ts-expect-error - Assign value
			result[key] = sourceValue;
		}
	}
	return result;
}

/**
 * Validate config structure (basic type checking)
 */
function validateConfig(config: unknown): config is StatuslineConfig {
	if (!config || typeof config !== "object") return false;
	const c = config as Partial<StatuslineConfig>;

	// Validate top-level booleans
	if (typeof c.oneLine !== "boolean") return false;
	if (typeof c.showSonnetModel !== "boolean") return false;

	// Validate path display mode
	if (
		!c.pathDisplayMode ||
		!["full", "truncated", "basename"].includes(c.pathDisplayMode)
	)
		return false;

	// Validate separator
	const validSeparators = ["|", "•", "·", "⋅", "●", "◆", "▪", "▸", "›", "→"];
	if (!c.separator || !validSeparators.includes(c.separator)) return false;

	// Validate nested objects exist
	if (!c.git || typeof c.git !== "object") return false;
	if (!c.session || typeof c.session !== "object") return false;
	if (!c.context || typeof c.context !== "object") return false;
	if (!c.limits || typeof c.limits !== "object") return false;

	return true;
}

/**
 * Load config from JSON file, merge with defaults
 */
export async function loadConfig(): Promise<StatuslineConfig> {
	try {
		if (!existsSync(CONFIG_PATH)) {
			return defaultConfig;
		}

		const file = Bun.file(CONFIG_PATH);
		const userConfig = (await file.json()) as Partial<StatuslineConfig>;

		// Merge user config with defaults
		return deepMerge(defaultConfig, userConfig);
	} catch (error) {
		console.error(`Failed to load config: ${error}`);
		return defaultConfig;
	}
}

/**
 * Save config to JSON file
 */
export async function saveConfig(config: StatuslineConfig): Promise<void> {
	try {
		await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
	} catch (error) {
		throw new Error(`Failed to save config: ${error}`);
	}
}

/**
 * Get default config
 */
export function getDefaultConfig(): StatuslineConfig {
	return defaultConfig;
}

/**
 * Export config to specified file
 */
export async function exportConfig(
	config: StatuslineConfig,
	filePath: string,
): Promise<void> {
	try {
		await Bun.write(filePath, JSON.stringify(config, null, 2));
	} catch (error) {
		throw new Error(`Failed to export config: ${error}`);
	}
}

/**
 * Import config from specified file
 */
export async function importConfig(
	filePath: string,
): Promise<StatuslineConfig> {
	try {
		const file = Bun.file(filePath);
		const importedConfig = (await file.json()) as Partial<StatuslineConfig>;

		// Validate and merge with defaults
		const mergedConfig = deepMerge(defaultConfig, importedConfig);

		if (!validateConfig(mergedConfig)) {
			throw new Error("Invalid config structure");
		}

		return mergedConfig;
	} catch (error) {
		throw new Error(`Failed to import config: ${error}`);
	}
}

/**
 * Get nested property value using dot notation
 */
export function getConfigValue(
	config: StatuslineConfig,
	path: string,
): unknown {
	const keys = path.split(".");
	// biome-ignore lint/suspicious/noExplicitAny: Need dynamic traversal
	let value: any = config;
	for (const key of keys) {
		if (value && typeof value === "object" && key in value) {
			value = value[key];
		} else {
			return undefined;
		}
	}
	return value;
}

/**
 * Set nested property value using dot notation
 */
export function setConfigValue(
	config: StatuslineConfig,
	path: string,
	value: unknown,
): StatuslineConfig {
	const keys = path.split(".");
	const newConfig = JSON.parse(JSON.stringify(config)); // Deep clone

	// biome-ignore lint/suspicious/noExplicitAny: Need dynamic property assignment
	let current: any = newConfig;
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (!(key in current)) {
			current[key] = {};
		}
		current = current[key];
	}

	const lastKey = keys[keys.length - 1];
	current[lastKey] = value;

	return newConfig;
}
