# Export Pipeline

## Formats

| Format | Mechanism | FPS | Resolution |
|--------|-----------|-----|------------|
| **PNG** | `canvas.toBlob()` | — | Full canvas |
| **WebM** | `canvas.captureStream(60)` + `MediaRecorder` | 60 | Full canvas |
| **GIF** | gif.js (lazy-loaded from CDN) | 30 | ≤640 px longest edge |

## Architecture

All exports:
1. Reset `phase = 0`
2. Draw frames sequentially
3. Reassemble into container format
4. Trigger browser download as `lumen-{preset}-{seed}.{ext}`

## The Seamless Guarantee

Because [[Seamless Loop Invariant|phase drives everything]], WebM and GIF exports capture exactly one loop that seamlessly tiles forever.

## Notes

- GIF needs internet on first use (fetches gif.js worker from cdnjs)
- Safari WebM support is spotty — PNG and GIF work everywhere
- WebM encoder prefers VP9, falls back to VP8

## See Also

- [[Studio Architecture]] — where export code lives (`ui/export.ts`)
- [[Design Principles]] §9 — "Export is a feature"
