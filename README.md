# 👻 Ghost Factory

Ghost Factory is the home of the Flying Dutchman crew — an AI-assisted development system.

## Crew

- **GHOST** — self-healing debugger
- **SPECTRE** — project scaffold builder

## Current Features

### GHOST

- Safe fix flow (shows diff, asks before writing)
- Local JSON memory
- Mock fixer for offline testing
- Real Groq fixer when API key is present
- Watch mode
- Memory show/clear

### SPECTRE

- Generates landing-page scaffolds
- Generates portfolio scaffolds
- Clean folder-per-project structure

## Setup

See `SETUP.md` for Linux Mint setup instructions.

## Usage

### GHOST

```bash
node ghost/cli.js fix <file> [error] [--mock]
node ghost/cli.js watch <dir> [--mock]
node ghost/cli.js memory show
node ghost/cli.js memory clear

SPECTRE
bash

node spectre/cli.js build landing-page "Business Name"
node spectre/cli.js build portfolio "Person Name"

Project structure
text

ghost/           GHOST agent
spectre/         SPECTRE agent
projects/        Generated projects
SETUP.md         Machine setup guide
README.md        This file

License

MIT