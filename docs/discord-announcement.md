# /motion update: seamless shader loops are fixed

/motion just got a shader-loop cleanup pass.

What changed:
- Fixed the WebGL shader compile crash from the duplicate `float t` definition.
- Audited the studio shader timing holistically.
- Removed non-loop-safe phase math that made some presets feel like short video clips with a cut.
- Updated fluid shader timing to use loop-safe phase motion.
- Verified all 33 studio presets render cleanly at the hard loop wrap: `phase 0` equals `phase 2π`.

Build is passing, and the studio should feel much more like real continuous generative rendering now.

Try it here: https://motion-e93d3.web.app
Repo: https://github.com/murderszn/motion
