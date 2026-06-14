# liquidGL Presets

Copy-paste these configurations into `liquidGL({...})`.

## Default
Balanced look, good starting point.
```js
{ refraction: 0, bevelDepth: 0.052, bevelWidth: 0.211, frost: 2, shadow: true, specular: true }
```

## Alien
Strong refraction, deep bevel, sci-fi aesthetic.
```js
{ refraction: 0.073, bevelDepth: 0.2, bevelWidth: 0.156, frost: 2, shadow: true, specular: false }
```

## Pulse
Flat pane with wide bevel, great for pulsing UI.
```js
{ refraction: 0.03, bevelDepth: 0, bevelWidth: 0.273, frost: 0, shadow: false, specular: false }
```

## Frost
Softly diffused, privacy-glass style.
```js
{ refraction: 0, bevelDepth: 0.035, bevelWidth: 0.119, frost: 0.9, shadow: true, specular: true }
```

## Edge
Thin bevel, bright rim highlights.
```js
{ refraction: 0.047, bevelDepth: 0.136, bevelWidth: 0.076, frost: 2, shadow: true, specular: false }
```

## /motion Glass
Optimised for overlaying on the /motion WebGL canvas. Uses low refraction
to keep the shader visible beneath.
```js
{ refraction: 0.005, bevelDepth: 0.04, bevelWidth: 0.12, frost: 1.5, shadow: true, specular: true, tilt: true, tiltFactor: 3 }
```
