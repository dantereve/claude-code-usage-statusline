# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-11-09

### Added
- Configuration option `showFirstLine` to hide session info line

### Fixed
- Progress bar spacing issues caused by ANSI color code transitions

## [0.2.0] - 2025-11-09

### Added
- Fractional block characters (▏▎▍▌▋▊▉█) for higher precision progress bars
- 15-character progress bar option (5/10/15 char options now available)
- Color-coded git status: green for additions (+), red for deletions (-), gray/yellow for file counts (~)

### Changed
- Moved `useIconLabels` config from `session` section to `display` section for better organization

## [0.1.0] - 2025-11-08

### Added
- Initial release
- Real-time Claude Code session information display
- Git status integration (branch name, staged/unstaged changes)
- Context usage tracking from transcript files
- Claude API rate limits (5-hour and 7-day windows)
- OAuth token authentication via macOS Keychain
- Configurable display options
- Progress bars for usage visualization
- Interactive configuration CLI (`cc-statusline-config`)
- Support for Bun runtime
