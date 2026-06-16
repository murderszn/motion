# Obsidian

## What is Obsidian?

[Obsidian](https://obsidian.md/) is a note-taking app that works on local Markdown files. Its key features:

- **[[Wikilinks]]** — link notes together with `[[Note Name]]` syntax
- **Graph View** — visualize connections between notes
- **Canvas** — spatial whiteboard for ideas
- **Plugins** — extend functionality (Git, Kanban, etc.)

## This Brain

The `brain/` directory is an Obsidian vault attached to the lumen·local project. It serves as:

- **Human documentation** — readable, interconnected reference
- **AI context** — structured knowledge for LLM-assisted development
- **Project memory** — decisions, architecture, and design rationale

Open Obsidian → "Open folder as vault" → select the `motion/` directory.

## Quick Start

1. Open Obsidian
2. File → Open Vault → Open folder as vault → choose `motion/`
3. Open `brain/Index.md` and start exploring
4. Use Cmd+Click (Mac) or Ctrl+Click on [[wikilinks]] to navigate
5. Open Graph View (Cmd+G) to see the full knowledge map

## Structure

```
brain/
├── Index.md              ← entry point / Map of Content
├── Concepts/             ← core concepts
│   ├── Seamless Loop Invariant.md
│   ├── Seed-Based Determinism.md
│   ├── Palette System.md
│   ├── Parameter System.md
│   └── Export Pipeline.md
├── Presets/              ← per-preset reference
│   ├── Reeded Glass.md
│   ├── Flow.md
│   └── ... (14 total)
├── Architecture/         ← technical deep-dive
│   ├── Studio Architecture.md
│   ├── Shader Architecture.md
│   ├── UI System.md
│   └── Plugin System.md
├── Design/               ← design principles
│   ├── Design Philosophy.md
│   ├── Design Principles.md
│   ├── Color Theory for Shaders.md
│   └── Composition Guide.md
├── Development/          ← how-to guides
│   ├── Adding a Preset.md
│   ├── Adding a Slider.md
│   ├── Adding a Palette.md
│   ├── Shader Debugging.md
│   └── Modification Points.md
└── References/           ← reference materials
    ├── Glossary.md
    ├── Resources.md
    └── Roadmap.md
```
