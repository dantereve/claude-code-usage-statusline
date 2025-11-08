# claude-code-usage-statusline

Clean, type-safe statusline for Claude Code displaying real-time session info, git status, context usage, and Claude API rate limits.

## Features

- **Session Info**: Current branch, uncommitted changes, working directory
- **Context Usage**: Token consumption and percentage of 200K limit
- **Usage Limits**: Five-hour API usage with countdown timer, Weekly API usage with reset timer
- **Performance**: <500ms typical render time
- **Type Safety**: Full TypeScript with strict mode

## Prerequisites

### Install Bun

This package requires Bun runtime. If you don't have Bun installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

This automatically:

- Installs Bun
- Adds `~/.bun/bin` to your PATH ([bun.sh add to your path](https://bun.com/docs/installation#add-bun-to-your-path))
- Configures your shell

For more details, see [bun.sh](https://bun.sh)

## Installation

```bash
bun add -g claude-code-usage-statusline
```

## Requirements

- **Runtime**: Bun 1.0+
- **Platform**: macOS only (uses Keychain for authentication)
- **Dependencies**: Git CLI, Claude Code with OAuth token

## Configuration

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "cc-statusline",
    "padding": 0
  }
}
```

## Authentication

The statusline retrieves your Claude OAuth token from macOS Keychain:

- **Service**: `Claude Code-credentials`
- **Token Type**: OAuth token (`sk-ant-oat01-...`)
- **Setup**: Automatically configured when you authenticate Claude Code

If you don't have Claude Code installed, the statusline will still work but won't display API usage limits.

## Output Format

### Line 1: Session Info

```
main* (+123 -45) | ~/.claude | Sonnet 4.5
```

### Line 2: Metrics

```
Context: 62.5K tokens 31% | 5h: 15% (3h27m left)
```

**Components:**

- `62.5K tokens` - Context tokens used
- `31%` - Context percentage (tokens / 200K)
- `15%` - Five-hour usage
- `(3h27m left)` - Time until rate limit resets

## Configuration

### Interactive Configuration

Launch the interactive config menu:

```bash
bun run config
# or after global install:
cc-statusline-config
```

Navigate through categories:

- **Display Options**: Layout, separators, path display
- **Git Settings**: Branch, changes, staged/unstaged files
- **Session Info**: Token display, decimals, percentages
- **Context Window**: Max tokens, autocompact buffer
- **Usage Limits**: Progress bars, colors, seven-day limits
- **Import/Export**: Share configs between machines

### Programmatic Configuration

```bash
# List all settings
cc-statusline-config list

# Get specific value
cc-statusline-config get git.showBranch

# Set value
cc-statusline-config set git.showChanges true
cc-statusline-config set separator "→"
cc-statusline-config set context.maxContextTokens 200000

# Reset to defaults
cc-statusline-config reset              # All settings
cc-statusline-config reset git.showChanges  # Single setting

# Import/Export configs
cc-statusline-config export ./my-config.json
cc-statusline-config import ./my-config.json
```

### Configuration File

Settings stored in `statusline.config.json` (auto-created on first use). Example configuration in `statusline.config.example.json`.

**Available Settings:**

- `oneLine`: Display on single line (default: false)
- `showSonnetModel`: Show model when Sonnet (default: false)
- `pathDisplayMode`: "full" | "truncated" | "basename" (default: "truncated")
- `separator`: Section separator character (default: "•")
- `git.showBranch`: Show branch name (default: true)
- `git.showDirtyIndicator`: Show * when dirty (default: true)
- `git.showChanges`: Show +/- line counts (default: false)
- `git.showStaged`: Show staged files (default: true)
- `git.showUnstaged`: Show unstaged files (default: true)
- `session.showTokens`: Show token count (default: true)
- `session.showPercentage`: Show context % (default: true)
- `context.maxContextTokens`: Context window size (default: 200000)
- `limits.showProgressBar`: Visual progress bar (default: true)
- `limits.color`: "progressive" | "green" | "yellow" | "red" (default: "progressive")

## Development

```bash
# Clone repository
git clone https://github.com/dantereve/claude-code-usage-statusline.git
cd claude-code-usage-statusline

# Install dependencies
bun install

# Run tests
bun test

# Test locally
echo '{"type": "test"}' | bun run src/index.ts
```

## Architecture

```
src/
├── index.ts              # Main entry point
├── config-cli.ts         # Interactive config CLI
└── lib/
    ├── types.ts          # TypeScript interfaces
    ├── git.ts            # Git operations
    ├── context.ts        # Transcript parsing
    ├── usage-limits.ts   # Claude OAuth API
    ├── config.ts         # Config load/save utilities
    └── formatters.ts     # Display utilities

statusline.config.ts          # TypeScript types
statusline.config.json        # User config (auto-created)
statusline.config.example.json # Example config
```

## Error Handling

All components fail silently to ensure the statusline never crashes Claude Code:

- Missing transcript → 0 tokens, 0%
- API failure → No usage limits shown
- Git errors → "no-git" branch
- Keychain access denied → No usage limits

## Performance

Typical render times:

- Context calculation: ~10-50ms
- API call: ~100-300ms (cached)
- Git operations: ~20-50ms
- **Total: <500ms**

## License

MIT © Mathias

## Contributing

Issues and PRs welcome at [github.com/dantereve/claude-code-usage-statusline](https://github.com/dantereve/claude-code-usage-statusline)
