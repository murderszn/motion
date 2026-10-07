# Shader Effects reference

A source map for [shader-effects-inc/shaders](https://github.com/shader-effects-inc/shaders) and [shaders.com](https://shaders.com/). Use it to research shader math, effect composition, and implementation patterns for /motion.

Reviewed: 2026-10-07. Source revision: [`935f71a`](https://github.com/shader-effects-inc/shaders/tree/935f71a7789f0e07811dfe6fd0d8f707e9848238). Documentation links follow the current upstream; source examples below are pinned to that revision.

## Documentation links

| Reference | What to look for |
| --- | --- |
| [Component library](https://shaders.com/docs/components) | Effect previews and parameter references |
| [Custom components](https://shaders.com/docs/guide/custom-shaders) | `defineShader`, typed props, and WGSL bodies |
| [Primitives](https://shaders.com/docs/primitives) | Index of math, fields, shapes, filters, and simulations |
| [Noise](https://shaders.com/docs/primitives/noise) | Noise bases, coordinate framing, tone, and color ramps |
| [Warps](https://shaders.com/docs/primitives/warps) | UV displacement, mirroring, polar transforms, and edge sampling |
| [Materials and surfaces](https://shaders.com/docs/primitives/materials) | Surface normals, lighting, glass, and metal responses |
| [Performance](https://shaders.com/docs/guide/performance) | Offscreen rendering and generator versus texture-filter costs |
| [Agent docs index](https://shaders.com/llms.txt) | Links to documentation and machine-readable references |
| [Full component reference](https://shaders.com/llms-full.txt) | Component props, defaults, and ranges |
| [Primitives manifest](https://shaders.com/std/docs-manifest.json) | Structured index for future research tooling |

## Source links

The engine is in [`packages/core`](https://github.com/shader-effects-inc/shaders/tree/main/packages/core); individual effects live in [`src/shaders`](https://github.com/shader-effects-inc/shaders/tree/main/packages/core/src/shaders).

| Pinned source | Study area |
| --- | --- |
| [Aurora](https://github.com/shader-effects-inc/shaders/blob/935f71a7789f0e07811dfe6fd0d8f707e9848238/packages/core/src/shaders/Aurora/index.ts) | Light curtains and effect parameters |
| [FractalNoise](https://github.com/shader-effects-inc/shaders/blob/935f71a7789f0e07811dfe6fd0d8f707e9848238/packages/core/src/shaders/FractalNoise/index.ts) | Procedural noise construction |
| [Glass](https://github.com/shader-effects-inc/shaders/blob/935f71a7789f0e07811dfe6fd0d8f707e9848238/packages/core/src/shaders/Glass/index.ts) | Glass effect definition |
| [Noise primitives](https://github.com/shader-effects-inc/shaders/blob/935f71a7789f0e07811dfe6fd0d8f707e9848238/packages/core/src/std/paint/noise.ts) | Shared noise recipes |
| [Warp primitives](https://github.com/shader-effects-inc/shaders/blob/935f71a7789f0e07811dfe6fd0d8f707e9848238/packages/core/src/std/warps.ts) | Coordinate mapping logic |
| [Material primitives](https://github.com/shader-effects-inc/shaders/blob/935f71a7789f0e07811dfe6fd0d8f707e9848238/packages/core/src/std/paint/materials.ts) | Shared surface shading logic |

## Applying the ideas to /motion

These are research references. Upstream uses WebGPU/WGSL; /motion's studio presets use WebGL 1.0 / GLSL ES 1.0. Adapting the algorithms requires translation, rather than copying the component API into the existing renderer.

For a future port:

- Convert types, texture sampling, and shader entry points to GLSL ES 1.0. Keep constant loop bounds, explicit float conversions, and `precision highp float`.
- Replace time-driven motion with integer multiples of `u_phase` and circular `loopOff()` drift. Check the loop boundary; phase wrapping alone does not make arbitrary animation seamless.
- Map color controls to /motion's palettes and Chromaverse tokens, and parameters to the existing studio state.
- Keep DPR at or below 2, pause hidden/offscreen animation, and measure GPU cost before adding layered texture filters.

The proposed study areas above are /motion integration ideas, not completed ports.

## Attribution

The [repository license](https://github.com/shader-effects-inc/shaders/blob/935f71a7789f0e07811dfe6fd0d8f707e9848238/LICENSE) is MIT. Preserve its copyright and license notice if code is adapted. The hosted editor, presets, and platform features have [separate terms](https://shaders.com/terms); the repository license does not cover those assets.

Related local reference: [Shader, WebGL & Web Design Research](shader-web-research.md).
