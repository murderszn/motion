# Curl Noise

> Divergence-free swirling motion from noise derivatives.

## Technique
- Compute partial derivatives of noise: `dn/dx` and `dn/dy`
- Curl = `(-dn/dy, dn/dx)` — perpendicular to gradient
- Result is divergence-free: fluid-like swirling without compression
- Magnitude drives color intensity, angle drives pattern

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Drift velocity |
| scale | Spatial frequency |
| density | Angular frequency (2–8) |
| distortion | Curl displacement strength |
| detail | FBM overlay contribution |

## Key Code
```glsl
float eps = 0.01;
float n1 = cnoise(p + vec2(eps,0) + off);
float n2 = cnoise(p - vec2(eps,0) + off);
float n3 = cnoise(p + vec2(0,eps) + off);
float n4 = cnoise(p - vec2(0,eps) + off);
vec2 curl = vec2(n3-n4, n2-n1) / (2.0*eps);
```

## Related
- [[Fractal & Pattern Vocabulary]] — curl noise
- [[WebGL Techniques]] — fluid simulation techniques
