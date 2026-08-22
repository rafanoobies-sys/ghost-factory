# flying dutchman — architecture

the flying dutchman is a local-first, ai-assisted development system built for solo builders and service providers.

it acts as a personal dev team:
- ghost fixes
- spectre builds
- wraith watches
- aegis protects
- adjutant commands

## crew

| agent | role | status |
|-------|------|--------|
| ghost | debugger / fixer | ✅ v1.0 working |
| spectre | scaffold builder | ✅ v0.1 working |
| wraith | watcher / logger | 🔮 planned |
| aegis | guardian / rollback | 🔮 planned |
| adjutant | commander / orchestrator | 🔮 planned |

## current capabilities

### ghost

- safe fix flow (diff + approval before writing)
- local json memory
- mock fixer for offline testing
- real groq fixer when api key is present
- watch mode
- memory show / clear

### spectre

- builds 12 project types
- creates clean folder-per-project structure
- generates essential files only
- no bloat, no extra dependencies

## project structure
ghost-factory/
ghost/ ghost agent
spectre/ spectre agent
projects/ generated projects
architecture.md this file
setup.md machine setup guide
readme.md project overview


## philosophy

- offline-first
- local-first
- review before apply
- build clean, build minimal
- one tool, one job
- document everything
- commit often

## roadmap

- [x] ghost v1.0
- [x] spectre v0.1
- [ ] wraith v0.1
- [ ] aegis v0.1
- [ ] adjutant v0.1
- [ ] omega mvp