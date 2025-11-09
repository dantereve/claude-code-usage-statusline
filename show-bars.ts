#!/usr/bin/env bun

import { formatProgressBar } from "./src/lib/formatters";

console.log("\n=== Progress Bar Visual Tests ===\n");

// Test different sizes
const sizes = [5, 10, 15];
const percentages = [0, 10, 25, 33, 50, 66, 75, 90, 100];

for (const size of sizes) {
	console.log(`\n${size}-character bars:\n`);

	for (const pct of percentages) {
		const bar = formatProgressBar(pct, size, "progressive");
		console.log(`${pct.toString().padStart(3)}% ${bar}`);
	}
}

console.log("\n\n=== Color Modes (50% at 10 chars) ===\n");

const colorModes: Array<"progressive" | "green" | "yellow" | "red"> = ["progressive", "green", "yellow", "red"];
for (const mode of colorModes) {
	const bar = formatProgressBar(50, 10, mode);
	console.log(`${mode.padEnd(12)}: ${bar}`);
}

console.log("\n\n=== Fractional Blocks (10-char bar) ===\n");

const fractionalPercentages = [11.25, 12.5, 13.75, 15, 16.25, 17.5, 18.75];
for (const pct of fractionalPercentages) {
	const bar = formatProgressBar(pct, 10, "progressive");
	console.log(`${pct.toString().padStart(5)}% ${bar}`);
}

console.log("\n\n=== Progressive Color Changes (15-char bar) ===\n");

const colorTestPercentages = [30, 45, 55, 65, 75, 85, 95];
for (const pct of colorTestPercentages) {
	const bar = formatProgressBar(pct, 15, "progressive");
	console.log(`${pct.toString().padStart(3)}% ${bar}`);
}

console.log("\n");
