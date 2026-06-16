# Adding a Slider

## Steps

1. **Add to `SLIDERS` config array in `state.ts`:**
   ```ts
   { id: 'wobble', label: 'wobble', def: 0.50 },
   ```

2. **Add key to `SliderKey` type in `types.ts`:**
   ```ts
   export type SliderKey = 'speed' | 'scale' | 'density' | 'distort' | 'detail' | 'grain' | 'aberration' | 'wobble';
   ```

3. **Add key to `Params` interface in `types.ts`:**
   ```ts
   wobble: number;
   ```

4. **Add default to `P` object in `state.ts`:**
   ```ts
   wobble: 0.50,
   ```

5. **Add to `randomize()` in `main.ts`** (optional):
   ```ts
   setSlider('wobble', Math.random());
   ```

### For scene shader uniforms

6. **Declare uniform in GLSL shader (`webgl.ts` `FS` string):**
   ```glsl
   uniform float u_wobble;
   ```

7. **Add to `UNIFORM_NAMES` array in `webgl.ts`:**
   ```ts
   'u_wobble',
   ```

8. **Push in `draw()` function in `webgl.ts`:**
   ```ts
   gl.uniform1f(U.u_wobble, P.wobble);
   ```

### For post-process effects

If the slider affects a post-process effect (like chromatic aberration), add the uniform to `POST_FS` and `POST_UNIFORM_NAMES` instead, and push it in the post-process section of `draw()`.

## Gotchas

- Default in `SLIDERS` and default in `P` must match
- `SliderKey` type, `Params` interface, and `UNIFORM_NAMES` must all agree
- Uniform must be used in shader or it will be optimized out

## Related

- [[Parameter System]] — how sliders work conceptually
- [[Shader Architecture]] — uniform management
