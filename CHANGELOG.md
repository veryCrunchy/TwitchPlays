# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.1.1] - 2023-06-22

### Added

- Twitch Plays website api
- Twitch Plays website, to view active inputs
- Input preset: Mario Kart Wii
- Configuration: Set the alignment of the obs overlay (left, center, right)

### Fixed

- Releasing key too early when two inputs are pressing the same key simultaneously
- Not using delay when time is set bellow 0.3

## [1.1.0] - 2023-06-11

### Added

- Started keeping a changelog
- Obs overlay
- Game inputs: Delay support
- Game inputs: Mouse movement support
- New setting for TIMED mode; `TIMED_ON_INPUT`
- `.env` configurations to game input configurations, allows changing settings per game
- Timeout for CHAOS mode

### Changed

- Automatic Input Switching: Improved accuracy
- Automatic Input Switching: Non wii game support
- Configuration: Per game configuration
- Configuration: Configurations are now set by default, you can modify the defaults in `.env`
  Will be overwritten by per game configurations
- Game inputs: Support for multiple/combined outputs instead of just one
- Game inputs: Support for multiple times to go with multiple inputs

### Fixed

- "Not focused..." spam; Now only shows once until focused again.

### Removed

- Wii game only restriction

## [1.0.0] - 2023-06-05

### Added

- Support for multiple game inputs using `inputs/<game>.json`
- Input preset: M&M Kart Racing

### Removed

- Input configuration inside of index.js

### Fixed

- TIMED Mode: One input per user per interval

[unreleased]: https://github.com/veryCrunchy/TwitchPlays/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/veryCrunchy/TwitchPlays/compare/v1.1.1...HEAD
[1.1.0]: https://github.com/veryCrunchy/TwitchPlays/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/veryCrunchy/TwitchPlays/releases/tag/v1.0.0
