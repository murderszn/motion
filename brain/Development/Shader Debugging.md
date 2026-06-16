# Shader Debugging

## Common Issues

### Black Screen
- Shader compile error → check browser console (F12)
- Missing `precision highp float;`
- GLSL syntax error (missing semicolon, mismatched brackets)

### Uniform Not Working
- Forgot to add to the `UNIFORM_NAMES` array in `webgl.ts`
- Shader optimizes out unused uniforms
- Name mismatch between TypeScript and GLSL

### Loop Has Visible Seam
- Non-integer multiple of `u_phase` — see [[Seamless Loop Invariant]]
- Using raw time instead of phase

### GIF Export Fails
- No internet (gif.js loads from CDN)
- Browser doesn't support the downscale approach

## Debugging Techniques

1. **Simplify:** Start with a solid color output, add complexity incrementally
2. **Visualize intermediates:** Output `uv.x` as a color to see coordinates
3. **Use `u_mode` branches:** Keep old code working while developing new presets
4. **Check the console:** WebGL errors appear there, not in the DOM
5. **Use the live shader editor:** Panel in the sidebar for hot-swapping GLSL

## Tools

- Browser DevTools (F12) — Console, Sources, Performance
- [[Shader Architecture]] — reference for helpers and uniforms
- [[Studio Architecture]] — module layout
