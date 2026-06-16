# Seed-Based Determinism

## Philosophy

Same seed + same preset + same slider values = **exactly the same output**, every time, on any machine. This is a feature, not a bug.

## Implementation

- `P.seed` is an integer 0–9999
- Reaches the shader as: `u_seed = (seed % 10000) * φ % 4π`
- Offsets noise domains and orbit phases
- Shader uses ONLY `u_seed`-derived randomness (never `Math.random()` at render time)

## Filename Convention

Exports are named `lumen-{preset}-{seed}.{ext}`. The filename alone is enough to recreate the graphic — share the filename, not just the image.

## Related

- [[Parameter System]] — how sliders interact with seeds
- [[Export Pipeline]] — naming and reproducibility
- [[Shader Architecture]] — how uniforms carry the seed
