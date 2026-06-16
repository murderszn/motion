# Flow

**Index:** 1 | **Icon:** FL

Domain-warped liquid noise gradients. Classic FBM with domain warping.

## Slider Outcomes

| Slider | 0.0–0.2 | 0.2–0.4 | 0.4–0.6 | 0.6–0.8 | 0.8–1.0 |
|--------|---------|---------|---------|---------|---------|
| speed | Static painting | Slow morphing | Moderate flow | Active swirling | Fast turbulent |
| scale | Very zoomed out | Wide sweeping | Moderate | Finer intricate | Very tight detail |
| density | Subtle color | Gentle patterning | Moderate mixing | Strong contrast | Broken-up color |
| distortion | Minimal warp | Gentle bending | Clear domain warp | Strong swirls | Extreme complexity |
| detail | 1–2 octaves smooth | Moderate | Balanced | 4–5 octaves rich | Maximum complexity |

## Sweet Spot

`scale 0.40–0.70` + `distortion 0.50–0.80` for classic "liquid light." Try `distortion 0.80+` + `detail 0.60+` for psychedelic patterns.

## Best Palettes

aurora (1), ocean (4), cobalt (9)

## Related

- [[Reeded Glass]] — also uses domain warping
- [[Shader Architecture]] — `fbm()` and domain warping helpers
