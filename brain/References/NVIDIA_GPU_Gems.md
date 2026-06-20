# NVIDIA GPU Gems: Advanced Graphics & Shader Techniques

This reference compiles core shader methodologies published by NVIDIA across the *GPU Gems* series and NVIDIA Developer documentation, focusing on high-performance post-processing blurs, Depth of Field, motion vectors, and procedural noise.

---

## 1. Textureless Procedural Noise (GPU Gems 2 & 3)

In early hardware, procedural noise required sampling 3D textures. Modern techniques use **textureless** mathematical noise, which is computationally cheaper than texture memory fetches on parallel GPU architectures.

### Ken Perlin's "Improved Noise" Advancements
*   **Quintic Interpolation**: Classic Perlin noise used the cubic hermite curve $s(t) = 3t^2 - 2t^3$, which has discontinuous second derivatives ($C^1$ continuity). Improved Perlin noise uses the quintic curve $s(t) = 6t^5 - 15t^4 + 10t^3$, which yields $C^2$ continuity, eliminating banding artifacts in lighting derivatives.
*   **Hash Function Permutation**: Avoids 3D texture lookups by using a mod-based coordinate hash (`permute`).

### Stefan Gustavson's Textureless 2D Classic Perlin Noise
```glsl
// Classic Perlin 2D Noise 
// by Stefan Gustavson (https://github.com/stegu/webgl-noise)

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0); // Quintic curve
}

vec4 permute(vec4 x) {
  return mod(((x*34.0)+1.0)*x, 289.0);
}

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // Avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}
```

---

## 2. Advanced Post-Processing Blurs (GPU Gems 2 & 3)

### Separable Bilinear Sampling
A major NVIDIA optimization leverages the GPU's bilinear texture unit. When sampling between texel centers, the hardware automatically blends them. This allows a 1D filter to achieve wider kernel coverage with fewer samples.

$$x_{bilinear} = \frac{w_1 \cdot c_1 + w_2 \cdot c_2}{w_1 + w_2}$$

*   Instead of rendering $N$ texture fetches for $N$ weights, we can sample at offset locations between texels to retrieve the weighted sum of two texels in a single texture fetch. This cuts texture fetches by nearly **50%**.

### Practical Depth of Field (DoF) - GPU Gems 3, Chapter 28
Rather than a uniform blur, DoF requires variable-width blur based on camera focus distance and depth values.

1.  **Circle of Confusion (CoC)** calculation:
    $$CoC = \left| \frac{D_f \cdot (z - z_f)}{z \cdot (D_f - F)} \right|$$
    Where $z$ is pixel depth, $z_f$ is focus distance, $F$ is focal length, and $D_f$ is aperture diameter.
2.  **Multisampling with CoC**: In the fragment shader, sample neighbors using an offset scaled by the local CoC.
3.  **Leaking Prevention**: Avoid blurring sharp foreground objects onto blurred background objects by comparing depth values ($z_{neighbor}$ vs $z_{center}$) and clamping or rejecting contributions where $z_{neighbor} < z_{center}$ and $CoC_{neighbor} < CoC_{center}$.

---

## 3. Motion Blur Post-Processing (GPU Gems 3, Chapter 27)

Instead of rendering multiple geometry passes, NVIDIA introduced post-process motion blur using a velocity buffer.

### Velocity Vectors
1.  In the main pass, output the per-pixel velocity vector to a buffer (usually texture format RG16F or RG8).
    $$v = p_{current} - p_{previous}$$
    Where $p_{current}$ is the projection-space coordinate of the pixel in the current frame, and $p_{previous}$ is its coordinate in the previous frame (calculated using the current depth and the previous frame's View-Projection matrix).

### Fragment Shader Vector Blur
```glsl
uniform sampler2D u_sceneTex;    // Raw scene color
uniform sampler2D u_velocityTex; // Per-pixel velocity vectors (x, y)
uniform int u_numSamples;        // e.g., 8 or 16 samples

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 velocity = texture2D(u_velocityTex, uv).rg;
    
    // Scale velocity by exposure time
    vec2 blurVec = velocity * u_exposure;
    
    vec4 color = texture2D(u_sceneTex, uv);
    for (int i = 1; i < u_numSamples; i++) {
        // Sample along direction of travel
        vec2 offset = blurVec * (float(i) / float(u_numSamples - 1) - 0.5);
        color += texture2D(u_sceneTex, uv + offset);
    }
    
    gl_FragColor = color / float(u_numSamples);
}
```
*Note: To prevent ghosting, the sample steps should be scaled down or blended with local depth validation.*
