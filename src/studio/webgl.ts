// ─────────────────────────────────────────────────────────
//  WebGL setup — context, program, uniforms, draw
// ─────────────────────────────────────────────────────────

import { P } from './state';
import { FLUID_SHADER_BLOCK, FLUID_PRESET_BRANCH } from './fluid-shader';
import {
  bindMaskUniforms, hasPatternText, maskAspectChanged, updateMaskTexture,
} from './text_mask';
import { isActive, smoothData, updateAudioData, bindAudioTexture } from './ui/audio_visualizer';

// ── GLSL source strings ──────────────────────────────────

const VS = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

export let FS = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2  u_res;
uniform float u_phase;
uniform float u_seed;
uniform int   u_mode;
uniform float u_speed, u_scale, u_density, u_distort, u_detail, u_grain, u_warp;
uniform vec3  u_c0, u_c1, u_c2, u_c3;
uniform sampler2D u_texture;
uniform float u_mix, u_pixel, u_invert;
uniform sampler2D u_mask;
uniform float u_hasMask;
uniform vec3  u_maskBg;
uniform float u_audio_vol;
uniform float u_audio_bass;
uniform float u_audio_mid;
uniform float u_audio_treble;
uniform sampler2D u_audio_freq;
uniform float u_has_audio;

#define TAU 6.28318530718

float hash21(vec2 p){
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0);
    vec4 ix = Pi.xzxz; vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz; vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 5; i++){
        v += a * vnoise(p);
        p  = r * p * 2.1 + vec2(1.7, 9.2);
        a *= 0.5;
    }
    return v;
}

vec2 loopOff(){
    return vec2(cos(u_phase), sin(u_phase)) * (0.10 + 0.55 * u_speed);
}

vec3 grad4(float t){
    t = clamp(t, 0.0, 1.0);
    vec3 c = mix(u_c0, u_c1, smoothstep(0.00, 0.35, t));
    c = mix(c, u_c2, smoothstep(0.35, 0.70, t));
    c = mix(c, u_c3, smoothstep(0.70, 1.00, t));
    return c;
}

float metaf(vec2 p, float ar){
    float s  = u_seed;
    float rA = 0.08 + 0.20 * u_speed;
    vec2 b1 = vec2((0.28 + 0.06 * sin(s))       * ar, 0.62 + 0.05 * cos(s * 1.3))
            + rA        * vec2(cos(u_phase + s),             sin(u_phase + s));
    vec2 b2 = vec2((0.72 + 0.05 * cos(s * 2.1)) * ar, 0.40 + 0.06 * sin(s * 0.7))
            + rA * 0.85 * vec2(cos(-2.0 * u_phase + s * 1.7), sin(-2.0 * u_phase + s * 1.7));
    vec2 b3 = vec2((0.50 + 0.07 * sin(s * 1.6)) * ar, 0.24 + 0.05 * cos(s * 2.4))
            + rA * 0.70 * vec2(cos(u_phase + s * 2.3 + 2.0),  sin(u_phase + s * 2.3 + 2.0));
    return 0.30 / (length(p - b1) + 0.07)
         + 0.22 / (length(p - b2) + 0.07)
         + 0.16 / (length(p - b3) + 0.07);
}

${FLUID_SHADER_BLOCK}

void main(){
    vec2 uv = gl_FragCoord.xy / u_res;
    uv.y = 1.0 - uv.y;
    float ar = u_res.x / u_res.y;
    vec2 sOff = vec2(fract(u_seed * 0.193), fract(u_seed * 0.317)) * 47.0;

    vec3 col = vec3(0.0);

    /* ─── 0 · aurora ─── */
    if (u_mode == 0){
        vec3 night  = u_c0 * 0.40;
        float light = 0.0;
        vec3  tint  = vec3(0.0);
        for (int i = 0; i < 3; i++){
            float fi = float(i) + 1.0;
            float xx = uv.x * ar * (1.0 + 0.35 * fi) + u_seed * fi * 1.7;
            float wave = fbm(vec2(xx * 0.6, fi * 4.0) + loopOff() * 1.2) - 0.5;
            float cy   = 0.42 + 0.12 * fi + wave * 0.38 + (u_has_audio > 0.5 ? u_audio_bass * 0.25 * (fi - 1.5) : 0.0);
            float streak = fbm(vec2(xx * (3.0 + 4.0 * u_detail),
                                    uv.y * (1.0 + 1.5 * u_scale)) + loopOff());
            float dist  = uv.y - cy;
            float band  = exp(-dist * dist * (8.0 + 34.0 * u_density));
            float inten = max(band * (0.25 + 0.95 * streak + (u_has_audio > 0.5 ? u_audio_vol * 0.5 : 0.0)), 0.0);
            light += inten / fi;
            tint  += grad4(clamp(0.15 + (1.0 - uv.y) * 0.95, 0.0, 1.0)) * inten / fi;
        }
        col  = night + tint * (1.3 + 1.0 * u_distort);
        col += u_c3 * pow(clamp(light, 0.0, 1.0), 3.0) * 0.30;
    }

    else if (u_mode == 1){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.0, 3.5, u_scale) + sOff;
        float t = u_phase;
        
        // Domain warping to create organic camouflage patterns
        vec2 warp = vec2(fbm(p * 0.8 + loopOff()), fbm(p * 0.8 + vec2(7.3, 3.1) - loopOff())) * mix(0.5, 2.5, u_distort);
        float n = fbm(p + warp + loopOff() * 0.5);
        
        // Camouflage levels (flat color sections)
        float levels = mix(3.0, 8.0, u_density);
        float val = n * levels + t * 0.15;
        
        // Quantize the value with antialiased step transitions to prevent aliasing
        float f_val = floor(val);
        float fract_val = fract(val);
        float border_width = 0.04 * (1.0 + u_detail * 2.0);
        float smooth_val = f_val + smoothstep(0.5 - border_width, 0.5 + border_width, fract_val);
        
        // Map to flat color bands
        float camo = clamp(smooth_val / levels, 0.0, 1.0);
        col = grad4(camo);
        
        // Subtle audio response to pulse the camo boundaries
        if (u_has_audio > 0.5) {
            col += u_c3 * (smoothstep(0.48, 0.52, fract_val) * 0.15 * u_audio_bass);
        }
    }

    /* ─── 2 · curl noise ─── */
    else if (u_mode == 2){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.2, 4.0, u_scale) + sOff;
        float eps = 0.04;
        vec2 off = loopOff();
        
        // Compute finite difference gradient of potential noise
        float n1 = cnoise(p + vec2(eps, 0.0) + off);
        float n2 = cnoise(p - vec2(eps, 0.0) + off);
        float n3 = cnoise(p + vec2(0.0, eps) + off);
        float n4 = cnoise(p - vec2(0.0, eps) + off);
        
        // Curl vector = (d/dy, -d/dx) -> divergence-free flow
        vec2 curl = vec2(n3 - n4, n2 - n1) / (2.0 * eps);
        
        // Audio reactive volume pushes the curl warp intensity
        float audioWarp = (u_has_audio > 0.5) ? u_audio_bass * 1.5 : 0.0;
        float warpStrength = mix(0.2, 3.5, u_distort) + audioWarp;
        
        // Warped coordinates
        vec2 sp = p + curl * warpStrength;
        
        // Sample multi-octave FBM for wispy strands
        float freq = mix(1.0, 3.0, u_density);
        float f = fbm(sp * freq + loopOff());
        
        // Detail adjusts contrast and sharpness of the curls
        float center = 0.5;
        float width = 0.45 - 0.20 * u_detail;
        f = smoothstep(center - width, center + width, f);
        
        col = grad4(clamp(f, 0.0, 1.0));
        
        // Add highlighting based on curl speed/magnitude
        float mag = length(curl);
        col += u_c3 * smoothstep(0.4, 1.2, mag) * 0.15 * (1.0 + (u_has_audio > 0.5 ? u_audio_treble * 1.5 : 0.0));
    }

    /* ─── 3 · electricity ─── */
    else if (u_mode == 3){
        vec2 p = uv * vec2(ar, 1.0) * mix(1.5, 5.0, u_scale) + sOff;
        vec2 q = vec2(fbm(p + loopOff()),
                      fbm(p + vec2(5.2, 1.3) - loopOff()));
        float n = fbm(p * 1.4 + q * (1.0 + 2.5 * u_distort) + loopOff());
        float ridge = 1.0 - abs(2.0 * n - 1.0);
        float veins = pow(ridge, mix(6.0, 24.0, u_detail));
        veins *= 0.55 + 0.45 * cos(3.0 * u_phase + u_seed) + (u_has_audio > 0.5 ? u_audio_bass * 0.8 : 0.0);
        col  = u_c0 * 0.55;
        col += u_c2 * veins * (1.0 + (u_has_audio > 0.5 ? u_audio_vol * 2.0 : 0.0));
        col += grad4(clamp(veins * 1.3, 0.0, 1.0)) * veins;
        col += u_c3 * pow(veins, 2.0) * 0.9;
        col += grad4(n * 0.35) * (0.10 + 0.10 * u_density);
    }

    /* ─── 4 · flow ─── */
    else if (u_mode == 4){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.2, 5.0, u_scale) + sOff;
        float w = 1.0 + 3.0 * u_distort;
        vec2 q = vec2(fbm(p + loopOff()),
                      fbm(p + vec2(5.2, 1.3) - loopOff()));
        vec2 r = vec2(fbm(p + q * w + vec2(1.7, 9.2) + loopOff() * 0.7),
                      fbm(p + q * w + vec2(8.3, 2.8) - loopOff() * 0.4));
        float f = fbm(p + r * (1.0 + 2.5 * u_detail));
        col = grad4(clamp(f * 1.45 + 0.10 * r.x - 0.05, 0.0, 1.0));
        col = mix(col, u_c2, q.y * q.x * 0.25);
    }

    /* ─── 5 · grain ─── */
    else if (u_mode == 5){
        vec2 p = vec2(uv.x * ar, uv.y);
        float s = u_seed;
        float rA = 0.10 + 0.22 * u_speed;
        vec2 b1 = vec2(0.32 * ar, 0.60) + rA * vec2(cos(u_phase + s), sin(u_phase + s));
        vec2 b2 = vec2(0.70 * ar, 0.35) + rA * 0.8 * vec2(cos(-u_phase + s * 1.9), sin(-u_phase + s * 1.9));
        float f = 0.55 / (length(p - b1) + 0.30)
                + 0.45 / (length(p - b2) + 0.30)
                + fbm(uv * (1.0 + 1.5 * u_scale) + loopOff() + sOff) * 0.25 * u_detail;
        col = grad4(f * (0.45 + 0.25 * u_density));
        col += (hash21(gl_FragCoord.xy + loopOff() * 43.7) - 0.5) * (0.10 + 0.30 * u_distort);
    }

    /* ─── 6 · halftone ─── */
    else if (u_mode == 6){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.2, 4.0, u_scale) + sOff;
        vec2 q = vec2(fbm(p + loopOff()), fbm(p + vec2(5.2, 1.3) - loopOff()));
        float f = fbm(p + q * (1.0 + 2.5 * u_distort));
        float cells = mix(18.0, 80.0, u_density);
        vec2 g = fract(vec2(uv.x * ar, uv.y) * cells) - 0.5;
        float rdot = clamp(f * (0.5 + 0.6 * u_detail), 0.05, 0.62);
        float mask = smoothstep(rdot, rdot - 0.12, length(g) * 1.45);
        col = mix(u_c0 * 0.7, grad4(clamp(f * 1.5, 0.0, 1.0)), mask);
    }

    /* ─── 7 · kaleidoscope ─── */
    else if (u_mode == 7){
        vec2 p = uv - 0.5;
        p.x *= ar;
        float slices = mix(4.0, 12.0, u_density);
        float angle = atan(p.y, p.x) + 0.18 * sin(u_phase);
        angle = mod(angle + 6.28318530718, 6.28318530718);
        float sector = 3.14159265359 / slices;
        angle = mod(angle, sector * 2.0);
        angle = abs(angle - sector);
        float rad   = length(p);
        p = vec2(cos(angle), sin(angle)) * rad;
        vec2 np = p * mix(1.5, 4.0, u_scale) + sOff;
        vec2 q = vec2(fbm(np + loopOff()),
                      fbm(np + vec2(5.2, 1.3) - loopOff()));
        float f = fbm(np + q * (1.0 + 2.0 * u_distort) + loopOff() * 0.6);
        col = grad4(clamp(f * 1.3, 0.0, 1.0));
        col += u_c3 * pow(rad * 1.8, 3.0) * 0.12;
    }

    /* ─── 8 · lines ─── */
    else if (u_mode == 8){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.5, 5.0, u_scale) + sOff;
        float t = u_phase;
        float ang = u_distort * 0.35 + 0.08 * sin(t);
        float ca = cos(ang), sa = sin(ang);
        vec2 q = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
        float freq = mix(3.0, 8.0, u_density) + u_distort * 1.4;
        float wave = 0.6 * sin(q.y * 0.7 + t);
        wave += 0.3 * sin(q.y * 1.4 - 2.0 * t) * u_detail;
        float f = 0.5 + 0.5 * sin(q.x * freq + wave);
        f += fbm(p * 0.3 + loopOff()) * 0.08 * u_detail;
        col = grad4(clamp(f, 0.0, 1.0));
    }

    /* ─── 9 · marble ─── */
    else if (u_mode == 9){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.5, 4.0, u_scale) + sOff;
        vec2 q2 = p + vec2(cnoise(p * 0.8 + loopOff()),
                           cnoise(p * 0.8 + vec2(5.2, 1.3) - loopOff())) * u_distort;
        float v = sin(q2.x * mix(4.0, 12.0, u_density) + fbm(q2 * mix(1.5, 4.0, u_detail)) * 5.0) * 0.5 + 0.5;
        col = grad4(clamp(v, 0.0, 1.0));
        float vein = pow(abs(sin(q2.x * 8.0 + fbm(q2 * 3.0 + loopOff()) * 4.0)), 8.0);
        col += u_c3 * vein * 0.15;
    }

    /* ─── 10 · orbs ─── */
    else if (u_mode == 10){
        vec2 p = vec2(uv.x * ar, uv.y);
        float f = metaf(p, ar) * (0.30 + 0.30 * u_density)
                + fbm(uv * (1.0 + 2.0 * u_scale) + loopOff() + sOff) * 0.20 * u_detail;
        col = grad4(f);
    }

    /* ─── 11 · plasma ─── */
    else if (u_mode == 11){
        vec2 p = uv * mix(1.0, 3.5, u_scale);
        float t = u_phase;
        float v = 0.0;
        v += sin(p.x * 4.0 + t) * 0.5 + 0.5;
        v += sin(p.y * 5.0 - 2.0 * t) * 0.4;
        v += sin((p.x + p.y) * 6.0 + 3.0 * t) * 0.3;
        v += sin(length(p - 0.5) * 8.0 - t) * 0.3;
        v += fbm(p * 1.5 + loopOff() + sOff) * 0.35 * u_detail;
        v *= 0.5 + 0.5 * u_density;
        col = grad4(clamp(v * 1.2, 0.0, 1.0));
        col = mix(col, grad4(clamp(v * 0.8 + 0.3, 0.0, 1.0)), 0.3 * u_distort);
    }

    /* ─── 12 · rings ─── */
    else if (u_mode == 12){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0);
        float rad = length(p);
        float n = fbm(p * mix(1.0, 4.0, u_scale) + loopOff() + sOff);
        float rings = sin((rad * mix(8.0, 30.0, u_density) + n * 2.0 * u_distort) * 3.14159 - 2.0 * u_phase);
        float f = 0.5 + 0.5 * rings;
        col = grad4(clamp(f * (0.7 + 0.5 * u_detail), 0.0, 1.0));
        float glow = exp(-rad * 3.0) * 0.3;
        col += u_c3 * glow;
    }

    /* ─── 13 · rorschach ─── */
    else if (u_mode == 13){
        vec2 mp = uv;
        mp.x = abs(mp.x - 0.5) * 2.0;
        vec2 p = (vec2(mp.x * ar, mp.y) - vec2(0.5 * ar, 0.5)) * mix(2.0, 6.0, u_scale) + sOff;
        vec2 off = loopOff();
        vec2 q2 = vec2(fbm(p * 0.8 + off), fbm(p * 0.8 + vec2(5.2, 1.3) - off));
        vec2 r2 = vec2(fbm(p + q2 * (1.0 + 2.0 * u_distort) + off),
                       fbm(p + q2 * (1.0 + 2.0 * u_distort) + vec2(1.7, 9.2) - off));
        float f = fbm(p + r2 * (1.0 + 1.5 * u_detail));
        float ink = smoothstep(0.2, 0.6, f);
        float bleed = smoothstep(0.0, 0.3, f) * (1.0 - smoothstep(0.7, 1.0, f));
        vec3 paper = u_c3 * 0.35 + vec3(0.65);
        vec3 inkCol = mix(u_c0, u_c1, 0.6);
        col = mix(paper, inkCol, ink * mix(0.5, 1.0, u_distort));
        col -= u_c2 * bleed * 0.08;
        float stain = pow(1.0 - abs(f - 0.45) * 4.0, 6.0);
        col += u_c3 * stain * 0.06 * u_detail;
        float edge = smoothstep(0.18, 0.22, f) * (1.0 - smoothstep(0.58, 0.62, f));
        col += inkCol * edge * 0.12;
    }

    /* ─── 14 · ridged ─── */
    else if (u_mode == 14){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(2.0, 6.0, u_scale) + sOff;
        mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
        float v = 0.0, a = 0.5, w = 1.0;
        vec2 q2 = p + loopOff();
        float offset = mix(0.5, 1.2, u_distort);
        for (int i = 0; i < 8; i++){
            float fi = float(i);
            if (fi >= mix(3.0, 8.0, u_density)) break;
            float n = cnoise(q2) * w;
            n = abs(n);
            n = offset - n;
            n = n * n;
            v += n * a;
            q2 = rot * q2 * 2.1 + vec2(1.7, 9.2);
            a *= mix(0.35, 0.65, u_detail);
            w = clamp(0.0, 1.0, n * 2.0);
        }
        col = grad4(clamp(v * 1.2, 0.0, 1.0));
        float ridge = pow(clamp(v, 0.0, 1.0), 2.0);
        col += u_c3 * ridge * mix(0.1, 0.4, u_detail);
    }

    /* ─── 15 · sd rosette ─── */
    else if (u_mode == 15){
        vec2 p = uv - 0.5;
        p.x *= ar;
        float n = 5.0 + floor(mix(3.0, 9.0, u_density));
        float a = atan(p.y, p.x);
        float r = length(p);
        float sector = 3.14159 / max(n, 2.0);
        a = mod(a + 0.25 * sin(u_phase), sector * 2.0);
        a = abs(a - sector);
        vec2 q = vec2(cos(a), sin(a)) * r;
        float f = abs(q.y) - 0.04 * (0.4 + 0.8 * u_scale);
        float pulse = sin(r * mix(6.0, 24.0, u_detail) - 2.0 * u_phase) * 0.5 + 0.5;
        float edge = exp(-abs(f) * (18.0 + 40.0 * u_distort));
        edge = smoothstep(0.0, 0.9, edge);
        col = mix(u_c0 * 0.5, grad4(pulse), edge);
        col += u_c3 * edge * 0.22;
    }

    /* ─── 16 · truchet ─── */
    else if (u_mode == 16){
        float tileN = mix(2.0, 8.0, u_scale);
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * tileN + sOff;
        float t = u_phase;
        vec2 ip = floor(p);
        vec2 fp = fract(p);
        float h = hash21(ip + sOff);
        if (h < 0.5) fp.x = 1.0 - fp.x;
        float d = min(length(fp), length(fp - 1.0));
        d = abs(d - 0.5);
        float bands = mix(3.0, 7.0, u_density) + u_distort * 2.5;
        float f = 0.5 + 0.5 * cos(d * bands * TAU - 2.0 * t);
        f += fbm(p * 0.4 + loopOff()) * 0.1 * u_detail;
        col = grad4(clamp(f, 0.0, 1.0));
        float edge = smoothstep(0.06, 0.0, abs(d - 0.5) - 0.02);
        col += u_c3 * edge * mix(0.15, 0.40, u_distort);
    }

    /* ─── 17 · turbulence ─── */
    else if (u_mode == 17){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(2.0, 6.0, u_scale) + sOff;
        mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
        float v = 0.0, a = 0.5;
        vec2 q2 = p + loopOff();
        for (int i = 0; i < 8; i++){
            float fi = float(i);
            if (fi >= mix(3.0, 8.0, u_density)) break;
            v += a * abs(cnoise(q2 + loopOff()));
            q2 = rot * q2 * 2.0 + vec2(100.0);
            a *= mix(0.35, 0.65, u_detail);
        }
        col = grad4(clamp(v, 0.0, 1.0));
        col += u_c3 * pow(clamp(v, 0.0, 1.0), 3.0) * 0.2;
    }

    /* ─── 18 · waves ─── */
    else if (u_mode == 18){
        float f = uv.y * mix(1.5, 5.0, u_scale);
        f += sin(uv.x * (3.0 + 9.0 * u_density) + u_phase + u_seed) * 0.45;
        f += sin(uv.x * (7.0 + 5.0 * u_density) - 2.0 * u_phase + u_seed * 1.7) * 0.20;
        f += fbm(uv * vec2(ar, 1.0) * (1.5 + 2.0 * u_scale) + loopOff() + sOff)
             * (0.30 + 0.90 * u_distort);
        float t = 0.5 + 0.5 * sin(f * TAU * (0.4 + 0.9 * u_detail));
        col = grad4(t);
    }

${FLUID_PRESET_BRANCH}

    /* texture overlay */
    if (u_mix > 0.001){
        vec2 tuv = uv;
        float pix = 1.0 - u_pixel;
        float blocks = mix(8.0, 200.0, pix * pix);
        tuv = floor(tuv * blocks) / blocks;
        vec4 tex = texture2D(u_texture, tuv);
        col = mix(col, tex.rgb, clamp(u_mix, 0.0, 1.0));
    }

    /* film grain + vignette */
    col += (hash21(gl_FragCoord.xy + loopOff() * 91.3) - 0.5) * u_grain * 0.22;
    vec2 v = uv * 2.0 - 1.0;
    col *= 1.0 - dot(v, v) * 0.16;

    if (u_invert > 0.5) {
        col = 1.0 - col;
    }

    if (u_hasMask > 0.5) {
        float mk = texture2D(u_mask, vec2(uv.x, uv.y)).r;
        col = mix(u_maskBg, col, smoothstep(0.42, 0.58, mk));
    }

    if (u_has_audio > 0.5) {
        // Global ambient audio pulse & accent color glow
        col += u_c2 * u_audio_bass * 0.08;
        col = mix(col, col * (1.0 + u_audio_vol * 0.15), 0.7);
    }

    gl_FragColor = vec4(col, 1.0);
}`;

// ── WebGL context and program ────────────────────────────

type UniformMap = Record<string, WebGLUniformLocation | null>;

const UNIFORM_NAMES = [
  'u_res', 'u_phase', 'u_seed', 'u_mode',
  'u_speed', 'u_scale', 'u_density', 'u_distort', 'u_detail', 'u_grain', 'u_warp',
  'u_c0', 'u_c1', 'u_c2', 'u_c3', 'u_texture', 'u_mix', 'u_pixel', 'u_invert',
  'u_mask', 'u_hasMask', 'u_maskBg',
  'u_audio_vol', 'u_audio_bass', 'u_audio_mid', 'u_audio_treble', 'u_audio_freq', 'u_has_audio',
] as const;

export let canvas: HTMLCanvasElement;
export let gl: WebGLRenderingContext;
let prog: WebGLProgram;
let U: UniformMap = {};
export let texLoaded = false;
export let texObj: WebGLTexture | null = null;

function compileShaderSrc(ctx: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = ctx.createShader(type)!;
  ctx.shaderSource(s, src);
  ctx.compileShader(s);
  if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS))
    throw new Error(ctx.getShaderInfoLog(s) ?? 'shader compile error');
  return s;
}

function linkProgram(ctx: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const p = ctx.createProgram()!;
  ctx.attachShader(p, vs);
  ctx.attachShader(p, fs);
  ctx.linkProgram(p);
  if (!ctx.getProgramParameter(p, ctx.LINK_STATUS))
    throw new Error(ctx.getProgramInfoLog(p) ?? 'link error');
  return p;
}

function setupGeometry(program: WebGLProgram): void {
  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
}

function cacheUniforms(program: WebGLProgram): UniformMap {
  const map: UniformMap = {};
  UNIFORM_NAMES.forEach(n => { map[n] = gl.getUniformLocation(program, n); });
  return map;
}

export function initWebGL(cv: HTMLCanvasElement): void {
  canvas = cv;
  const ctx = cv.getContext('webgl', { preserveDrawingBuffer: true })
           ?? cv.getContext('experimental-webgl', { preserveDrawingBuffer: true });
  if (!ctx) {
    document.body.innerHTML = '<p style="padding:40px">webgl required.</p>';
    throw new Error('WebGL not available');
  }
  gl = ctx as WebGLRenderingContext;
  gl.getExtension('OES_standard_derivatives');

  compileAndLink();

  // Context-loss recovery
  cv.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('lumen:contextLost'));
  });
  cv.addEventListener('webglcontextrestored', () => {
    gl.getExtension('OES_standard_derivatives');
    compileAndLink();
    if (texLoaded && texObj) {
      // Re-upload requires the original image — mark as lost, UI should re-prompt
      texLoaded = false;
      texObj = null;
    }
    window.dispatchEvent(new CustomEvent('lumen:contextRestored'));
  });
}

function compileAndLink(): void {
  const vs = compileShaderSrc(gl, gl.VERTEX_SHADER, VS);
  const fs = compileShaderSrc(gl, gl.FRAGMENT_SHADER, FS);
  prog = linkProgram(gl, vs, fs);
  gl.useProgram(prog);
  setupGeometry(prog);
  U = cacheUniforms(prog);
}

// ── Texture ──────────────────────────────────────────────

export function loadTexture(img: HTMLImageElement): void {
  if (texObj) gl.deleteTexture(texObj);
  texObj = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texObj);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texLoaded = true;
}

export function clearTexture(): void {
  if (texObj) { gl.deleteTexture(texObj); texObj = null; }
  texLoaded = false;
}

// ── Helper ───────────────────────────────────────────────

function hex2rgb(h: string): [number, number, number] {
  return [
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255,
  ];
}

// ── Draw ─────────────────────────────────────────────────

export function draw(phase: number): void {
  if (hasPatternText() && maskAspectChanged(canvas.width, canvas.height)) {
    updateMaskTexture(gl, canvas.width, canvas.height);
  }
  gl.uniform2f(U.u_res, canvas.width, canvas.height);
  gl.uniform1f(U.u_phase, phase);
  gl.uniform1f(U.u_seed, (P.seed % 10000) * 0.6180339887 % 12.566);
  gl.uniform1i(U.u_mode, P.mode);
  gl.uniform1f(U.u_speed,   P.speed);
  gl.uniform1f(U.u_scale,   P.scale);
  gl.uniform1f(U.u_density, P.density);
  gl.uniform1f(U.u_distort, P.distort);
  gl.uniform1f(U.u_detail,  P.detail);
  gl.uniform1f(U.u_grain,   P.grain);
  gl.uniform1f(U.u_warp,    P.warp ?? 0.5);
  gl.uniform1f(U.u_mix,     P.mix);
  gl.uniform1f(U.u_pixel,   P.pixel);
  gl.uniform1f(U.u_invert,  P.invert);
  gl.uniform3fv(U.u_c0, hex2rgb(P.colors[0]));
  gl.uniform3fv(U.u_c1, hex2rgb(P.colors[1]));
  gl.uniform3fv(U.u_c2, hex2rgb(P.colors[2]));
  gl.uniform3fv(U.u_c3, hex2rgb(P.colors[3]));
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texLoaded ? texObj : null);
  gl.uniform1i(U.u_texture, 0);

  // Bind audio visualizer data
  if (isActive) {
    updateAudioData(gl);
    gl.uniform1f(U.u_audio_vol, smoothData.volume);
    gl.uniform1f(U.u_audio_bass, smoothData.bass);
    gl.uniform1f(U.u_audio_mid, smoothData.mid);
    gl.uniform1f(U.u_audio_treble, smoothData.treble);
    gl.uniform1f(U.u_has_audio, 1.0);
    bindAudioTexture(gl, U.u_audio_freq);
  } else {
    gl.uniform1f(U.u_audio_vol, 0.0);
    gl.uniform1f(U.u_audio_bass, 0.0);
    gl.uniform1f(U.u_audio_mid, 0.0);
    gl.uniform1f(U.u_audio_treble, 0.0);
    gl.uniform1f(U.u_has_audio, 0.0);
    bindAudioTexture(gl, U.u_audio_freq);
  }
  bindMaskUniforms(gl, U);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/** Temporarily resize the GL canvas, run fn, then restore preview dimensions. */
export function withRenderSize<T>(w: number, h: number, fn: () => T): T {
  const ow = canvas.width;
  const oh = canvas.height;
  canvas.width = w;
  canvas.height = h;
  gl.viewport(0, 0, w, h);
  if (hasPatternText()) updateMaskTexture(gl, w, h);
  try {
    return fn();
  } finally {
    canvas.width = ow;
    canvas.height = oh;
    gl.viewport(0, 0, ow, oh);
    if (hasPatternText()) updateMaskTexture(gl, ow, oh);
  }
}

// ── Shader hot-swap (live editor) ────────────────────────

export function compileNewFS(newSrc: string): string | null {
  try {
    const fs = compileShaderSrc(gl, gl.FRAGMENT_SHADER, newSrc);
    const vs = compileShaderSrc(gl, gl.VERTEX_SHADER, VS);
    const newProg = linkProgram(gl, vs, fs);
    const aLoc = gl.getAttribLocation(newProg, 'a');
    if (aLoc === -1) return "Error: Attrib 'a' not found in shader.";
    gl.useProgram(newProg);
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    const oldProg = prog;
    prog = newProg;
    U = cacheUniforms(prog);
    FS = newSrc;

    if (oldProg) {
      const shaders = gl.getAttachedShaders(oldProg);
      if (shaders) {
        shaders.forEach(s => {
          gl.detachShader(oldProg, s);
          gl.deleteShader(s);
        });
      }
      gl.deleteProgram(oldProg);
    }

    return null; // success
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

// ── Preset thumbnails ────────────────────────────────────

const THUMB_W = 88;
const THUMB_H = 50;
const thumbCache = new Map<string, string>();
let thumbCanvas: HTMLCanvasElement | null = null;
let thumbGl: WebGLRenderingContext | null = null;
let thumbProg: WebGLProgram | null = null;
let thumbU: UniformMap = {};

function thumbCacheKey(mode: number): string {
  return [
    mode, P.seed,
    ...P.colors,
    P.speed, P.scale, P.density, P.distort, P.detail,
  ].join('|');
}

function ensureThumbContext(): boolean {
  if (thumbCanvas && thumbGl && thumbProg) return true;
  thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = THUMB_W;
  thumbCanvas.height = THUMB_H;
  const ctx = thumbCanvas.getContext('webgl', { preserveDrawingBuffer: true })
    ?? thumbCanvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
  if (!ctx) return false;
  thumbGl = ctx as WebGLRenderingContext;
  thumbGl.getExtension('OES_standard_derivatives');
  const vs = compileShaderSrc(thumbGl, thumbGl.VERTEX_SHADER, VS);
  const fs = compileShaderSrc(thumbGl, thumbGl.FRAGMENT_SHADER, FS);
  thumbProg = linkProgram(thumbGl, vs, fs);
  thumbGl.useProgram(thumbProg);
  const buf = thumbGl.createBuffer()!;
  thumbGl.bindBuffer(thumbGl.ARRAY_BUFFER, buf);
  thumbGl.bufferData(thumbGl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), thumbGl.STATIC_DRAW);
  const aLoc = thumbGl.getAttribLocation(thumbProg, 'a');
  thumbGl.enableVertexAttribArray(aLoc);
  thumbGl.vertexAttribPointer(aLoc, 2, thumbGl.FLOAT, false, 0, 0);
  thumbU = {};
  UNIFORM_NAMES.forEach(n => { thumbU[n] = thumbGl!.getUniformLocation(thumbProg!, n); });
  return true;
}

function drawThumbMode(mode: number): void {
  if (!thumbGl || !thumbProg) return;
  thumbGl.viewport(0, 0, THUMB_W, THUMB_H);
  thumbGl.useProgram(thumbProg);
  thumbGl.uniform2f(thumbU.u_res, THUMB_W, THUMB_H);
  thumbGl.uniform1f(thumbU.u_phase, 1.2);
  thumbGl.uniform1f(thumbU.u_seed, (P.seed % 10000) * 0.6180339887 % 12.566);
  thumbGl.uniform1i(thumbU.u_mode, mode);
  thumbGl.uniform1f(thumbU.u_speed,   P.speed);
  thumbGl.uniform1f(thumbU.u_scale,   P.scale);
  thumbGl.uniform1f(thumbU.u_density, P.density);
  thumbGl.uniform1f(thumbU.u_distort, P.distort);
  thumbGl.uniform1f(thumbU.u_detail,  P.detail);
  thumbGl.uniform1f(thumbU.u_grain,   P.grain);
  thumbGl.uniform1f(thumbU.u_warp,    P.warp ?? 0.5);
  thumbGl.uniform1f(thumbU.u_mix,     0);
  thumbGl.uniform1f(thumbU.u_pixel,   0);
  thumbGl.uniform1f(thumbU.u_invert,  P.invert);
  thumbGl.uniform1f(thumbU.u_hasMask, 0.0);
  thumbGl.uniform3f(thumbU.u_maskBg, 0.03, 0.03, 0.04);
  thumbGl.uniform3fv(thumbU.u_c0, hex2rgb(P.colors[0]));
  thumbGl.uniform3fv(thumbU.u_c1, hex2rgb(P.colors[1]));
  thumbGl.uniform3fv(thumbU.u_c2, hex2rgb(P.colors[2]));
  thumbGl.uniform3fv(thumbU.u_c3, hex2rgb(P.colors[3]));
  thumbGl.activeTexture(thumbGl.TEXTURE0);
  thumbGl.bindTexture(thumbGl.TEXTURE_2D, null);
  thumbGl.uniform1i(thumbU.u_texture, 0);
  thumbGl.drawArrays(thumbGl.TRIANGLE_STRIP, 0, 4);
}

export function getPresetThumbnail(mode: number): string | null {
  if (!gl || !prog) return null;
  const key = thumbCacheKey(mode);
  const cached = thumbCache.get(key);
  if (cached) return cached;
  if (!ensureThumbContext() || !thumbCanvas) return null;
  drawThumbMode(mode);
  try {
    const url = thumbCanvas.toDataURL('image/png');
    thumbCache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

export function invalidatePresetThumbnails(): void {
  thumbCache.clear();
}
