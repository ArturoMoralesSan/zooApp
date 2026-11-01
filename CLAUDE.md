@AGENTS.md

## Claude Code specifics

- `AGENTS.md` (imported above) is the shared guide for every agent; put project rules there, not here.
- Use the dedicated tools: Grep/Glob to find, Read with `offset`/`limit` (or `pages` for PDFs) to read only what's needed, Edit for targeted changes. Write only for new files or full rewrites.
- Don't spawn subagents unless the user asks: they start cold and re-read the codebase.
- Put screenshots, audit notes and other temporary files in your scratchpad directory, never in the repo.
- Use the expo plugin enabled in `.claude/settings.json` for Expo questions before guessing APIs.
- Long tasks: work autonomously, and stop to ask only for what needs the user (native rebuild, Metro restart if they run it, PIN or system dialogs, design decisions the PDFs don't cover).
