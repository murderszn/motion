# Seamless Loop Invariant

The **most important rule** in lumen·local. Every animation must return to its starting state when `u_phase` wraps from 2π back to 0.

## The Rule

Animation is driven by `u_phase ∈ [0, 2π)`, NOT by raw time.

| Pattern | Safe? | Why |
|---------|-------|-----|
| `sin(x + 2.0 * u_phase)` | ✅ | Integer multiple of phase |
| `sin(x + u_phase)` | ✅ | Integer multiple |
| `sin(x + 1.5 * u_phase)` | ❌ | Non-integer creates visible seam |
| `time * speed` | ❌ | Monotonic — never resets |
| `loopOff()` | ✅ | Returns to origin every 2π |

## The `loopOff()` Helper

```glsl
vec2 loopOff(){
    return vec2(cos(u_phase), sin(u_phase)) * (0.10 + 0.55 * u_speed);
}
```

Traces a perfect circle — the only path that guarantees return to origin.

## Why This Matters

Seamless loops are the product's identity. When the last frame equals the first, the _frame disappears_ — the viewer experiences infinite motion, not a clip that ends.

See: [[Design Principles]] §3, [[Shader Architecture]], [[Export Pipeline]]
