# Claude Code Statusline - Project Memory

## Overview

Clean, type-safe statusline implementation for Claude Code using Bun + TypeScript. Displays real-time session information, git status, context usage, and Claude API rate limits.

## Project Setup & Configuration

### Dependencies

- **Bun**: Runtime (uses `$` for shell commands)
- **@biomejs/biome**: Linting & formatting
- **TypeScript**: Type safety

No external npm packages required - pure Bun APIs.

### Configuration in Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bun /Users/mathias/.claude/scripts/statusline/src/index.ts",
    "padding": 0
  }
}
```

### Authentication

OAuth token stored in macOS Keychain:

- **Service**: `Claude Code-credentials`
- **Format**: JSON with `claudeAiOauth.accessToken`
- **Token type**: `sk-ant-oat01-...` (OAuth token, not API key)
- **Access**: `security find-generic-password -s "Claude Code-credentials" -w`

## Architecture

### Modular Design

The project follows a clean architecture with separated concerns:

```text
src/
├── index.ts              # Main entry - orchestrates all components
├── config-cli.ts         # Interactive config CLI with @clack/prompts
└── lib/
    ├── types.ts          # TypeScript interfaces (HookInput)
    ├── git.ts            # Git operations (branch, color-coded changes)
    ├── context.ts        # Transcript parsing & context calculation
    ├── usage-limits.ts   # Claude OAuth API integration
    ├── config.ts         # Config load/save/migration utilities
    └── formatters.ts     # Display utilities (colors, progress bars with fractional blocks)

statusline.config.ts          # Config types & defaults
statusline.config.json        # User config (auto-created)
```

### Data Flow

```text
Claude Code Hook → stdin JSON → index.ts
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            [Get Git Status]            [Get Context Data]
                    ↓                               ↓
            [Format Branch]             [Get Usage Limits]
                    ↓                               ↓
                    └───────────────┬───────────────┘
                                    ↓
                            [Build Output Lines]
                                    ↓
                            stdout (2 lines)
```

## Component Specifications

### Context Calculation (`lib/context.ts`)

- **Purpose**: Calculate token usage from Claude Code transcript files
- **Algorithm**: Parses `.jsonl` transcript, finds most recent main-chain entry
- **Tokens counted**: `input_tokens + cache_read_input_tokens + cache_creation_input_tokens`
- **Excludes**: Sidechain entries (agent calls), API error messages
- **Output**: `{ tokens: number, percentage: number }` (0-100% of 200k context)

### Usage Limits (`lib/usage-limits.ts`)

- **Purpose**: Fetch Claude API rate limits from OAuth endpoint
- **Auth**: Retrieves OAuth token from macOS Keychain (`Claude Code-credentials`)
- **API**: `https://api.anthropic.com/api/oauth/usage`
- **Data**: Five-hour window utilization + reset time
- **Error handling**: Fails silently, returns null on errors

### Git Status (`lib/git.ts`)

- **Purpose**: Show current branch and uncommitted changes
- **Detection**: Checks both staged and unstaged changes
- **Output**: Branch name + color-coded line additions/deletions
- **Display**: `main • +123 -45 ~2` (green additions, red deletions, gray/yellow file counts)
- **Color coding**: Green (+added), Red (-deleted), Gray (staged ~), Yellow (unstaged ~)

### Formatters (`lib/formatters.ts`)

- **Colors**: ANSI color codes for terminal output
- **Token display**: `62.5k`, `1.2m` format (lowercase suffix)
- **Time formatting**: `3h21m`, `45m` for countdowns
- **Progress bars**: Fractional blocks (▏▎▍▌▋▊▉█) with configurable length (5/10/15)
- **Bar colors**: Progressive (gray→yellow→orange→red) or fixed (green/yellow/red)
- **Icon labels**: Optional Unicode symbols (📚 Context, 🕔 5h, 📅 7d)

## Output Specification

### Line 1: Session Info

```text
main • +123 -45 ~2 • ~/.claude • Sonnet 4.5
```

### Line 2: Metrics

```text
Context: 62.5k 31% • 5h: 15% ▊░░░░ (3h27m) • 7d: 45% ████▏░
```

**Components:**

- `62.5k` - Context tokens used (from transcript)
- `31%` - Context percentage (tokens / 200k)
- `▊░░░░` - Visual progress bar with fractional blocks
- `15%` - Five-hour usage (from Claude API)
- `45%` - Seven-day usage (optional, from API)
- `(3h27m)` - Time until rate limit resets

## Development

### Testing

```bash
# Run test with fixture
bun run test

# Use custom fixture
bun run test fixtures/custom.json

# Manual test
echo '{ ... }' | bun run start
```

### Code Conventions

- **ALWAYS** use camelCase for variables and functions
- Use TypeScript strict mode
- Follow Biome formatting rules

### Error Handling & Performance

**Error Handling** - All components fail silently:

- Missing transcript → 0 tokens, 0%
- API failure → No usage limits shown
- Git errors → "no-git" branch
- Keychain access denied → No usage limits

This ensures statusline never crashes Claude Code.

**Performance Benchmarks:**

- Context calculation: ~10-50ms (depends on transcript size)
- API call: ~100-300ms (cached by Claude API)
- Git operations: ~20-50ms
- Total: < 500ms typical

## Configuration System

### Config Loading (`lib/config.ts`)

- **Auto-merge**: User config merged with defaults (deep merge)
- **Migration**: Auto-migrates `session.useIconLabels` → `useIconLabels`
- **Validation**: Type-safe validation of config structure
- **Import/Export**: Share configs between machines

### Available Config Options

- **Display**: `oneLine`, `showSonnetModel`, `pathDisplayMode`, `separator`, `useIconLabels`
- **Git**: `showBranch`, `showDirtyIndicator`, `showChanges`, `showStaged`, `showUnstaged`
- **Session**: `infoSeparator`, `showTokens`, `showMaxTokens`, `showTokenDecimals`, `showPercentage`
- **Context**: `maxContextTokens`, `autocompactBufferTokens`, `useUsableContextOnly`, `overheadTokens`
- **Limits**: `showProgressBar`, `progressBarLength` (5/10/15), `color`, `showSevenDay`

## Maintenance Guide

### Adding New Metrics

1. Add interface to `lib/types.ts`
2. Create fetcher in `lib/*.ts`
3. Import in `index.ts`
4. Add to `buildSecondLine()`
5. Update config types in `statusline.config.ts`

### Modifying Display

- Colors: Edit `lib/formatters.ts` colors constant
- Layout: Modify `buildFirstLine()` / `buildSecondLine()` in `index.ts`
- Formatting: Add functions to `lib/formatters.ts`
- Progress bars: Modify `formatProgressBar()` (supports fractional blocks)

## Known Limitations

- macOS only (uses Keychain)
- Requires `git` CLI for git status
- Requires Claude Code OAuth (not API key)
- Transcript must be accessible (permissions)
