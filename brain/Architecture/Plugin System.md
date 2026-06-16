# Plugin System

## Agent Skill Files

The project ships with AI agent skill files for three coding platforms. These teach AI tools how the studio works.

| Platform | Location | Format |
|----------|----------|--------|
| **Claude Code** | `.claude/skills/motion-studio/` | YAML frontmatter + Markdown |
| **opencode** | `.opencode/skills/motion-studio/` | YAML frontmatter + Markdown |
| **Codex CLI** | `.agents/skills/motion-studio/` | Codex frontmatter + Markdown |

## Skill File Contents

| File | Purpose |
|------|---------|
| `SKILL.md` | Studio overview, presets, parameters, export, loop invariant |
| `SKILL_parameters.md` | Per-preset slider outcome tables |
| `SKILL_architect.md` | Extending the studio — adding presets/sliders/sizes |
| `SKILL_design.md` | Generative design principles and philosophy |

## Future: Plugin API

Phase 1+ envisions a JS plugin API for registering new presets, nodes, and exporters.

## Related

- [[Design Philosophy]] — principles that plugins must honor
- [[Adding a Preset]] — simplest plugin-like extension today
