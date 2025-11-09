# claude-code-usage-statusline

Clean, type-safe statusline for Claude Code displaying real-time session info, git status, context usage, and Claude API rate limits.

## Features

- **Session Info**: Current branch, uncommitted changes (color-coded +/-), working directory
- **Context Usage**: Token consumption and percentage of 200K limit
- **Usage Limits**: Five-hour & seven-day API usage with visual progress bars (fractional blocks)
- **Customization**: Icon labels, separators, path modes, progress bar styles
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

Source your shell file, for instance the .zshrc :

```bash
source ~/.zshrc
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

```text
main • +123 -45 ~2 • ~/.claude • Sonnet 4.5
```

### Line 2: Metrics

```text
Context: 62.5k 31% • 5h: 15% ▊░░░░ (3h27m) • 7d: 45% ████▏░
```

**Components:**

- `62.5k` - Context tokens used (color-coded additions/deletions)
- `31%` - Context percentage (tokens / 200K)
- `▊░░░░` - Visual progress bar with fractional blocks
- `15%` - Five-hour usage
- `45%` - Seven-day usage (optional)
- `(3h27m)` - Time until rate limit resets

## Customization

### Interactive Configuration

Launch the interactive config menu:

```bash
cc-statusline-config
```

Navigate through categories:

- **Display Options**: Layout, separators, path display, use icons instead of labels
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

Settings stored in `~/.config/claude-code-statusline/statusline.config.json` (auto-created on first use). Configuration persists across package upgrades (`bun add -g`). Example configuration in `statusline.config.example.json`.

**Available Settings:**

- `oneLine`: Display on single line (default: false)
- `showSonnetModel`: Show model when Sonnet (default: false)
- `pathDisplayMode`: "full" | "truncated" | "basename" (default: "truncated")
- `useIconLabels`: Use icons (📚🕔📅) instead of text labels (default: false)
- `separator`: Section separator ("|", "•", "·", etc.) (default: "•")
- `git.showBranch`: Show branch name (default: true)
- `git.showDirtyIndicator`: Show • when dirty (default: true)
- `git.showChanges`: Show color-coded +/- line counts (default: false)
- `git.showStaged`: Show staged files (default: true)
- `git.showUnstaged`: Show unstaged files (default: true)
- `session.infoSeparator`: Info separator or null for space (default: null)
- `session.showTokens`: Show token count (default: true)
- `session.showMaxTokens`: Show max tokens (192k/200k) (default: false)
- `session.showTokenDecimals`: Show decimals in tokens (default: false)
- `session.showPercentage`: Show context % (default: true)
- `context.maxContextTokens`: Context window size (default: 200000)
- `context.autocompactBufferTokens`: Autocompact buffer (default: 45000)
- `context.useUsableContextOnly`: Include buffer in display (default: false)
- `context.overheadTokens`: System overhead tokens (default: 0)
- `limits.showProgressBar`: Visual progress bar with fractional blocks (default: true)
- `limits.progressBarLength`: Bar length: 5, 10, or 15 chars (default: 5)
- `limits.color`: "progressive" | "green" | "yellow" | "red" (default: "progressive")
- `limits.showSevenDay`: Show seven-day usage bar (default: false)

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

```text
src/
├── index.ts              # Main entry point
├── config-cli.ts         # Interactive config CLI
└── lib/
    ├── types.ts          # TypeScript interfaces
    ├── git.ts            # Git operations (color-coded changes)
    ├── context.ts        # Transcript parsing
    ├── usage-limits.ts   # Claude OAuth API
    ├── config.ts         # Config load/save utilities
    └── formatters.ts     # Display utilities (progress bars)

statusline.config.ts                                      # Config types & defaults
~/.config/claude-code-statusline/statusline.config.json  # User config (XDG location)
statusline.config.example.json                           # Example config
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
