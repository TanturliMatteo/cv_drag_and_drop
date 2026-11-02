# react-a4-drag-drop-editor

Agent skill for building a drag-and-drop editor on a fixed A4 sheet with React, react-grid-layout v2 and Tiptap 3, with PDF export through the browser print dialog.

Derived from a working project: [CV Drag & Drop](https://github.com/) (replace with the repo URL).

## Contents

- `SKILL.md`: workflow and rules
- `references/geometry-and-model.md`: mm-accurate grid and data model
- `references/rgl-v2-setup.md`: react-grid-layout 2.x configuration
- `references/free-drag.md`: pixel-level dragging with snap on release
- `references/text-block.md`: Tiptap block with auto-height
- `references/print-export.md`: A4 print CSS and checklist
- `references/pitfalls.md`: symptom → cause → fix

## Requirements

React 18+, `react-grid-layout` 2.x, `@tiptap/react` 3.x. No scripts, no network access, no secrets.

## Install

Copy the folder into your agent's skills directory, e.g. `.claude/skills/react-a4-drag-drop-editor/`.
