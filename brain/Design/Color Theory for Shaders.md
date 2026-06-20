# Color Theory for Shaders

## 4-Stop Gradient Construction

The [[Palette System]] uses 4 ordered colors:

1. **Dark base** — anchors the image, provides depth
2. **Deep mid** — primary body, carries the preset's character
3. **Bright mid** — accent/energy, draws attention
4. **Highlight** — rim lights, brightest points, sparkle

## Palette Design Rules

- Stops should be perceptually evenly spaced in brightness
- Adjacent stops should have harmonious hue relationships
- The jump from stop 2→3 should be the most dramatic (energy shift)
- Avoid pure black or pure white — always add a touch of hue

## IQ Cosine Palette

Inigo Quilez's technique for generating smooth palettes from 4 parameters:
```glsl
vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.10, 0.20); // offset per channel
    return a + b * cos(6.28318 * (c * t + d));
}
```
Vary `d` to shift hue rotation. `c` controls frequency of color cycling.

## Gradient Ramp Mapping

Map any scalar (noise, distance, iteration) to a 4-stop color:
```glsl
vec3 grad4(float t) {
    vec3 c = mix(color0, color1, smoothstep(0.0, 0.35, t));
    c = mix(c, color2, smoothstep(0.35, 0.70, t));
    c = mix(c, color3, smoothstep(0.70, 1.0, t));
    return c;
}
```
Smoothstep creates perceptually smooth transitions without banding.

## Best Practices per Preset

Warm palettes (crimson, ember, gold) → organic/energetic presets
Cool palettes (aurora, ocean, cobalt) → atmospheric/ethereal presets
Neutral palettes (noir, stone) → texture-focused presets

## Related

- [[Palette System]] — technical reference
- [[Design Philosophy]] — why 4 stops
- [[Fractal & Pattern Vocabulary]] — palette mapping for patterns
