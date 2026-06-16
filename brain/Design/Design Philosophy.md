# Design Philosophy

Principles that guide lumen·local, drawn from shader art, creative coding, and motion graphics communities.

## 1. Paint with Math

A shader describes every pixel simultaneously — you define a field, not a drawing. Compose from small functions: `hash21 → vnoise → fbm → grad4`.

*Inigo Quilez, Book of Shaders*

## 2. Design the Output Space

Your job is to define what *can* happen. Every preset should produce good results across 60%+ of its parameter range. A randomize button should almost always produce something worth keeping.

*Tyler Hobbs, Casey Reas*

## 3. Seamless Loop as Contract

When the last frame equals the first, the frame disappears. See [[Seamless Loop Invariant]].

*Dave Whyte (beesandbombs)*

## 4. Noise is the Engine

FBM, domain warping, ridged noise — these are the primary generative primitives. 5-octave FBM covers organic texture, terrain, flow fields.

*Book of Shaders, Matt DesLauriers*

## 5. Constraints Breed Creativity

4-digit seed, 7 sliders, 4 palette stops. Limitations force strong choices. 14 presets is a vocabulary, not a limitation.

*Processing Foundation, Inigo Quilez (4KB demoscene)*

## 6. Immediate Feedback

Every slider change re-renders at 60fps. No save/preview mode. What you see is what you export.

*ShaderToy, Matt DesLauriers*

## 7. Add Analog Imperfections

Digital perfection is lifeless. Film grain, vignette, rim lights, edge glows make procedural graphics feel tactile.

*Tyler Hobbs, Dave Whyte, Universal Everything*

## 8. Think in Systems, Not Frames

You design a procedure that generates an infinite family of pictures. Test presets across multiple seeds and slider combos.

*Casey Reas, Tyler Hobbs, FIELD.IO*

## 9. Export is a Feature

`lumen-{preset}-{seed}.{ext}` means the filename alone recreates the graphic. Zero-friction PNG/WebM/GIF at social-ready sizes.

*Processing Foundation, Dave Whyte*

## 10. Audio as First-Class Input (Future)

Any parameter should be drivable by sound. FFT amplitude → speed; frequency bands → color, scale, density.

*Ryoji Ikeda, teamLab*

## Influences

Inigo Quilez, Book of Shaders, Casey Reas / Processing Foundation, Tyler Hobbs, Matt DesLauriers, Dave Whyte (beesandbombs), Ryoji Ikeda / teamLab, FIELD.IO, Universal Everything.

## Related

- [[Design Principles]] — full 10-principle reference
- [[Color Theory for Shaders]] — palette construction
- [[Composition Guide]] — aspect ratios, timing, mood
