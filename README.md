# 👻 GHOST — Safe Self-Healing Debugger

GHOST is a self-healing debugging agent that reads your code, suggests fixes, shows you a diff, and only writes changes after your approval. It works offline with a local JSON memory, can use the Groq API for real AI fixes, and always falls back to a mock fixer if no API key is present.

## Features

- 🔍 **Safe fix flow** — shows a diff and asks `Apply fix? (y/n)` before writing.
- 🧠 **Local memory** — remembers past fixes in `.ghost-memory.json` (git-ignored).
- 🧪 **Mock fixer** — test the entire flow without internet or API calls.
- 🤖 **Real Groq fixer** — uses Groq to generate actual code corrections when `GROQ_API_KEY` is set.
- 👀 **Watch mode** — monitors a directory and runs the safe fix flow on changes.
- 🔒 **No secret leaks** — `.env` and `.ghost-memory.json` are git-ignored.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rafanoobies-sys/ghost-factory.git
   cd ghost-factory