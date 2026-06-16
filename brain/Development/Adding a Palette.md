# Adding a Palette

## Steps

1. **Append a 4-element hex color tuple to `PALETTES` in `state.ts`:**
   ```ts
   [ '#1a0f14', '#5c2a3d', '#c4606f', '#f0b4a0' ],
   ```

## Color Order

1. Dark base (0)
2. Deep mid (1)
3. Bright mid (2)
4. Highlight (3)

## Guidelines

- Stops should be perceptually evenly spaced
- Skip pure black/white — add hue
- The 2→3 jump is the energy shift
- Test with all 14 presets before committing

## Related

- [[Palette System]] — how palettes work
- [[Color Theory for Shaders]] — design principles
