# Adding a Preset

## Steps

1. **Add to `PRESETS` array in `state.ts`:**
   ```ts
   { id: 'mynewpreset', icon: 'MP', full: 'my new preset' },
   ```

2. **Add shader branch in `webgl.ts` (`FS` string):**
   ```glsl
   else if (u_mode == 14){
       // produce `col` using available helpers
   }
   ```

3. **Test across:**
   - All 11 palettes
   - Multiple seeds
   - All 4 aspect ratios
   - Multiple loop durations
   - The full slider range

## Available Helpers

See [[Shader Architecture]] for the full list: `hash21`, `vnoise`, `fbm`, `grad4`, `metaf`, `loopOff`.

## Loop Invariant

All time-varying terms MUST use integer multiples of `u_phase`. See [[Seamless Loop Invariant]].

## Post-Process

Film grain and vignette apply automatically after all modes — you don't need to add them.

## Related

- [[Shader Architecture]] — uniform reference
- [[Seamless Loop Invariant]] — the critical rule
- [[Studio Architecture]] — where the shader lives
