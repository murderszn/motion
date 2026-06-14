# Developer & AI Agent Integration Guide

Welcome to the `lumen·local` WebGL Generative Shader Studio integration guide. This document details how developers and AI agents (such as Claude, ChatGPT, or Antigravity) can programmatically control, configure, and automate this application to generate visual media, webpage splash screens, and motion design exports.

---

## 1. URL Query Parameter API (Automated Loading)

You can launch the studio in any pre-configured visual state by appending query parameters to the URL:

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `preset` | `string` | The ID or full name of the shader preset | `preset=aurora` or `preset=waves` |
| `seed` | `number` | The integer seed value (0–9999) | `seed=4012` |
| `palette` | `string` | Comma-separated hex list of 4 colors | `palette=#000000,#ff0055,#00ffff,#ffffff` |
| `speed` | `number` | Animation rate (0.0 to 1.0) | `speed=0.65` |
| `scale` | `number` | Zoom/scale factor (0.0 to 1.0) | `scale=0.35` |
| `density` | `number` | Density/frequency (0.0 to 1.0) | `density=0.75` |
| `distort` | `number` | Distortion amount (0.0 to 1.0) | `distort=0.40` |
| `detail` | `number` | Detail complexity (0.0 to 1.0) | `detail=0.50` |
| `grain` | `number` | Film grain amount (0.0 to 1.0) | `grain=0.15` |
| `mix` | `number` | Image blend factor (0.0 to 1.0) | `mix=0.50` |
| `pixel` | `number` | Pixelation downscale factor (0.0 to 1.0) | `pixel=0.20` |

### Example Launch URLs:
* **Cyberpunk Vibe**: `http://localhost:8888/studio.html?preset=electric&seed=9015&palette=%230a0612,%23120b20,%23ff0055,%2300ffff`
* **Vibrant Waves**: `http://localhost:8888/studio.html?preset=waves&speed=0.8&scale=0.3&distort=0.9`

---

## 2. Shareable JSON State Format

To share designs, copy the state payload directly from the clipboard using the **Copy JSON** button or write a custom JSON payload and paste it using **Paste JSON**.

### JSON Payload Schema
```json
{
  "version": "1.0.0",
  "params": {
    "mode": 0,
    "seed": 9015,
    "sizeIdx": 1,
    "loop": 4.0,
    "colors": ["#100c16", "#7f0616", "#e03a3a", "#fff5f5"],
    "speed": 0.50,
    "scale": 0.45,
    "density": 0.55,
    "distort": 0.60,
    "detail": 0.50,
    "grain": 0.20,
    "mix": 0.0,
    "pixel": 0.0
  },
  "texts": [
    {
      "id": 0,
      "x": 0.5,
      "y": 0.5,
      "content": "lumen·local",
      "fontSize": 0.06,
      "fontFamily": "Outfit, sans-serif",
      "color": "#ffffff",
      "align": "center",
      "bold": true,
      "italic": false,
      "tracking": 0.15,
      "opacity": 1.0,
      "effect": "neon",
      "bgColor": "#e03a3a"
    }
  ]
}
```

---

## 3. Self-Contained HTML Embed Exporter

Clicking **"Export HTML Splash Page"** generates a single-file, production-ready `index.html` file that you can deploy immediately.

### What is embedded:
1. **WebGL Canvas & Quad Setup**: Fullscreen responsive `<canvas>` with auto-scaling resolution.
2. **Embedded Fragment Shader**: The raw GLSL code representing the active visual preset.
3. **Embedded Parameters**: Embedded as a JSON block that feeds the animation frame loop.
4. **Base64-Encoded Media**: If you uploaded an image or texture to blend, it is converted to a Base64 string and embedded directly inside the code (running fully client-side/offline).
5. **CSS Text Layout**: Any typography overlays are written directly as HTML and dynamically styled in CSS (with google font integration).

---

## 4. How to Guide AI Agents (System Prompt Snippet)

If you are pointing an AI agent at this codebase to write a preset or configure a layout, copy/paste this prompt:

> You are inside the `lumen-local` motion graphics studio codebase. 
> 
> * **To create a new design**: Output a valid JSON state payload matching the schema defined in `DEVELOPER_AGENT_GUIDE.md#2-shareable-json-state-format`. The user can immediately copy/paste this JSON payload into their studio.
> * **To add a new shader preset**:
>   1. Add your metadata to `PRESETS` inside `src/studio/state.ts`.
>   2. Add your GLSL code branch mapping inside `src/studio/webgl.ts` FS string (matching the numeric `u_mode`).
>   3. Add the preset command mapping in `src/studio/ui/command_palette.ts`.
