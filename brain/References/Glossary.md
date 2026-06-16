# Glossary

## A–C
- **Domain Warping** — feeding noise coordinates through another noise function to create organic complexity
- **FBM** — Fractal Brownian Motion: layered noise at increasing frequencies
- **GLSL** — OpenGL Shading Language, used for WebGL shaders
- **gl_FragColor** — the output variable in GLSL fragment shaders

## G–L
- **Hash Function** — deterministic pseudo-random function from coordinates → float
- **Hot-Swap** — live shader recompilation via `compileNewFS()` without page reload
- **loopOff()** — circular drift helper that respects the loop invariant
- **Metaballs** — organic blobby shapes from thresholded distance fields ([[Orbs]])

## M–R
- **Phase (u_phase)** — animation driver, 0→2π over the loop duration
- **Ridged Noise** — `1.0 - abs(2.0 * n - 1.0)`, creates vein/lightning patterns
- **SDF** — Signed Distance Function, geometric primitive for shader shapes

## S–Z
- **Seamless Loop** — last frame equals first frame, creating infinite motion
- **Uniform** — GLSL variable set from JS, constant across all pixels in a frame
- **Vignette** — darkening at image edges, analog lens effect
- **WebGL** — Web Graphics Library, browser-based GPU rendering
