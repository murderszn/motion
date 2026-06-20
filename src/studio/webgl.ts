// ─────────────────────────────────────────────────────────
//  WebGL setup — context, program, uniforms, draw
// ─────────────────────────────────────────────────────────

import { P } from './state';

// ── GLSL source strings ──────────────────────────────────

const VS = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

export let FS = `
precision highp float;

uniform vec2  u_res;
uniform float u_phase;
uniform float u_seed;
uniform int   u_mode;
uniform float u_speed, u_scale, u_density, u_distort, u_detail, u_grain;
uniform vec3  u_c0, u_c1, u_c2, u_c3;
uniform sampler2D u_texture;
uniform float u_mix, u_pixel, u_invert;

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
            float cy   = 0.42 + 0.12 * fi + wave * 0.38;
            float streak = fbm(vec2(xx * (3.0 + 4.0 * u_detail),
                                    uv.y * (1.0 + 1.5 * u_scale)) + loopOff());
            float dist  = uv.y - cy;
            float band  = exp(-dist * dist * (8.0 + 34.0 * u_density));
            float inten = max(band * (0.25 + 0.95 * streak), 0.0);
            light += inten / fi;
            tint  += grad4(clamp(0.15 + (1.0 - uv.y) * 0.95, 0.0, 1.0)) * inten / fi;
        }
        col  = night + tint * (1.3 + 1.0 * u_distort);
        col += u_c3 * pow(clamp(light, 0.0, 1.0), 3.0) * 0.30;
    }

    /* ─── 1 · contour waves ─── */
    else if (u_mode == 1){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.5, 5.0, u_scale) + sOff;
        float t = u_phase * mix(0.3, 1.0, u_speed);
        float n = cnoise(p * 1.5 + loopOff() * 0.8);
        float bands = mix(6.0, 20.0, u_density);
        float waves = sin((n * bands + t * 2.0) * 3.14159);
        waves = smoothstep(0.0, 0.1, waves) * smoothstep(0.2, 0.1, waves);
        float glow = waves * mix(0.5, 2.0, u_detail);
        col = mix(u_c0 * 0.4, u_c2, waves);
        col += u_c3 * glow * 0.3;
        float pulse = sin(n * bands * 0.5 + t) * 0.5 + 0.5;
        col += u_c2 * pulse * 0.08 * u_distort;
    }

    /* ─── 2 · curl noise ─── */
    else if (u_mode == 2){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.5, 4.0, u_scale) + sOff;
        float t = u_phase * mix(0.3, 1.0, u_speed);
        float eps = 0.01;
        vec2 off = loopOff();
        float n1 = cnoise(p + vec2(eps, 0.0) + off);
        float n2 = cnoise(p - vec2(eps, 0.0) + off);
        float n3 = cnoise(p + vec2(0.0, eps) + off);
        float n4 = cnoise(p - vec2(0.0, eps) + off);
        vec2 curl = vec2(n3 - n4, n2 - n1) / (2.0 * eps);
        float mag = length(curl);
        float angle = atan(curl.y, curl.x);
        float swirl = sin(angle * mix(2.0, 8.0, u_density) + mag * 6.0 + t * 2.0) * 0.5 + 0.5;
        swirl += fbm(p * 1.5 + curl * u_distort * 2.0 + loopOff()) * 0.3 * u_detail;
        col = grad4(clamp(swirl, 0.0, 1.0));
        col += u_c3 * pow(mag, 2.0) * 0.2;
    }

    /* ─── 3 · electricity ─── */
    else if (u_mode == 3){
        vec2 p = uv * vec2(ar, 1.0) * mix(1.5, 5.0, u_scale) + sOff;
        vec2 q = vec2(fbm(p + loopOff()),
                      fbm(p + vec2(5.2, 1.3) - loopOff()));
        float n = fbm(p * 1.4 + q * (1.0 + 2.5 * u_distort) + loopOff());
        float ridge = 1.0 - abs(2.0 * n - 1.0);
        float veins = pow(ridge, mix(6.0, 24.0, u_detail));
        veins *= 0.55 + 0.45 * cos(3.0 * u_phase + u_seed);
        col  = u_c0 * 0.55;
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

    /* ─── 5 · golden (phyllotaxis) ─── */
    else if (u_mode == 5){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.5, 5.0, u_scale) + sOff;
        float t = u_phase * mix(0.3, 1.0, u_speed);
        float r = length(p) * (1.3 + u_distort * 0.18);
        float a = atan(p.y, p.x);
        float n = r * r * mix(0.8, 1.5, u_density);
        float golden = 2.39996323;
        float spiral = cos(a - n * golden + t * 0.2);
        float rings  = cos(n * 3.14159265 - t * 0.1);
        float f = 0.5 + 0.5 * spiral * rings;
        vec2 warp = vec2(fbm(p * 0.6 + loopOff()),
                         fbm(p * 0.6 + vec2(5.2, 1.3) - loopOff()));
        f += fbm(p + warp * u_distort) * 0.15 * u_detail;
        col = grad4(clamp(f, 0.0, 1.0));
        col += u_c3 * pow(max(0.5 + 0.5 * spiral, 0.0), mix(3.0, 8.0, u_detail)) * mix(0.08, 0.20, u_distort);
    }

    /* ─── 6 · glass ─── */
    else if (u_mode == 6){
        vec2 p = vec2(uv.x * ar, uv.y);
        float frost = 0.0, rim = 0.0;
        vec2  refr = vec2(0.0);
        for (int i = 0; i < 4; i++){
            float fi = float(i) + 1.0;
            float ph = u_phase + u_seed * fi + fi * 1.9;
            vec2  c  = vec2(0.5 * ar, 0.5) + vec2(cos(ph), sin(ph)) * (0.36 / fi);
            float r  = 0.14 + 0.06 * fi * u_scale + 0.12 * u_density;
            float dd = length(p - c);
            float body = smoothstep(r, r * 0.6, dd);
            float ring = smoothstep(r * 0.70, r * 0.88, dd) * (1.0 - smoothstep(r * 0.88, r, dd));
            frost += body;
            rim   += ring;
            refr  += normalize(p - c + 0.0001) * body;
        }
        frost = clamp(frost, 0.0, 1.0);
        float bg  = metaf(p, ar) + fbm(uv * (1.2 + 2.0 * u_scale) + loopOff() + sOff) * 0.30;
        vec3 plain = grad4(bg * 0.45);
        vec2 sUV = uv + refr * (0.03 + 0.10 * u_distort);
        vec2 sp  = vec2(sUV.x * ar, sUV.y);
        float bg2 = metaf(sp, ar) + fbm(sUV * (1.2 + 2.0 * u_scale) + loopOff() + sOff) * 0.30;
        vec3 behind = grad4(bg2 * 0.45);
        vec3 frosted = mix(behind, vec3(dot(behind, vec3(0.333))), 0.30) + u_c3 * 0.10;
        col = mix(plain, frosted, frost * 0.92);
        col += u_c3 * rim * (0.4 + 0.6 * u_detail);
    }

    /* ─── 7 · grain ─── */
    else if (u_mode == 7){
        vec2 p = vec2(uv.x * ar, uv.y);
        float s = u_seed;
        float rA = 0.10 + 0.22 * u_speed;
        vec2 b1 = vec2(0.32 * ar, 0.60) + rA * vec2(cos(u_phase + s), sin(u_phase + s));
        vec2 b2 = vec2(0.70 * ar, 0.35) + rA * 0.8 * vec2(cos(-u_phase + s * 1.9), sin(-u_phase + s * 1.9));
        float f = 0.55 / (length(p - b1) + 0.30)
                + 0.45 / (length(p - b2) + 0.30)
                + fbm(uv * (1.0 + 1.5 * u_scale) + loopOff() + sOff) * 0.25 * u_detail;
        col = grad4(f * (0.45 + 0.25 * u_density));
        col += (hash21(gl_FragCoord.xy + vec2(u_phase * 43.7)) - 0.5) * (0.10 + 0.30 * u_distort);
    }

    /* ─── 8 · halftone ─── */
    else if (u_mode == 8){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.2, 4.0, u_scale) + sOff;
        vec2 q = vec2(fbm(p + loopOff()), fbm(p + vec2(5.2, 1.3) - loopOff()));
        float f = fbm(p + q * (1.0 + 2.5 * u_distort));
        float cells = mix(18.0, 80.0, u_density);
        vec2 g = fract(vec2(uv.x * ar, uv.y) * cells) - 0.5;
        float rdot = clamp(f * (0.5 + 0.6 * u_detail), 0.05, 0.62);
        float mask = smoothstep(rdot, rdot - 0.12, length(g) * 1.45);
        col = mix(u_c0 * 0.7, grad4(clamp(f * 1.5, 0.0, 1.0)), mask);
    }

    /* ─── 9 · kaleidoscope ─── */
    else if (u_mode == 9){
        vec2 p = uv - 0.5;
        p.x *= ar;
        float angle = atan(p.y, p.x);
        float rad   = length(p);
        float slices = mix(4.0, 12.0, u_density);
        angle = mod(angle, 3.14159 / slices * 2.0);
        angle = abs(angle - 3.14159 / slices);
        p = vec2(cos(angle), sin(angle)) * rad;
        vec2 np = p * mix(1.5, 4.0, u_scale) + sOff;
        vec2 q = vec2(fbm(np + loopOff()),
                      fbm(np + vec2(5.2, 1.3) - loopOff()));
        float f = fbm(np + q * (1.0 + 2.0 * u_distort) + loopOff() * 0.6);
        col = grad4(clamp(f * 1.3, 0.0, 1.0));
        col += u_c3 * pow(rad * 1.8, 3.0) * 0.12;
    }

    /* ─── 10 · lines ─── */
    else if (u_mode == 10){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.5, 5.0, u_scale) + sOff;
        float t = u_phase * mix(0.3, 1.0, u_speed);
        float ang = u_distort * 0.35 + t * 0.05;
        float ca = cos(ang), sa = sin(ang);
        vec2 q = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
        float freq = mix(3.0, 8.0, u_density) + u_distort * 1.4;
        float wave = 0.6 * sin(q.y * 0.7 + t * 0.3);
        wave += 0.3 * sin(q.y * 1.4 - t * 0.5) * u_detail;
        float f = 0.5 + 0.5 * sin(q.x * freq + wave);
        f += fbm(p * 0.3 + loopOff()) * 0.08 * u_detail;
        col = grad4(clamp(f, 0.0, 1.0));
    }

    /* ─── 11 · marble ─── */
    else if (u_mode == 11){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(1.5, 4.0, u_scale) + sOff;
        float t = u_phase * mix(0.2, 0.8, u_speed);
        vec2 q2 = p + vec2(cnoise(p * 0.8 + loopOff()),
                           cnoise(p * 0.8 + vec2(5.2, 1.3) - loopOff())) * u_distort;
        float v = sin(q2.x * mix(4.0, 12.0, u_density) + fbm(q2 * mix(1.5, 4.0, u_detail)) * 5.0) * 0.5 + 0.5;
        col = grad4(clamp(v, 0.0, 1.0));
        float vein = pow(abs(sin(q2.x * 8.0 + fbm(q2 * 3.0 + loopOff()) * 4.0)), 8.0);
        col += u_c3 * vein * 0.15;
    }

    /* ─── 12 · orbs ─── */
    else if (u_mode == 12){
        vec2 p = vec2(uv.x * ar, uv.y);
        float f = metaf(p, ar) * (0.30 + 0.30 * u_density)
                + fbm(uv * (1.0 + 2.0 * u_scale) + loopOff() + sOff) * 0.20 * u_detail;
        col = grad4(f);
    }

    /* ─── 13 · plasma ─── */
    else if (u_mode == 13){
        vec2 p = uv * mix(1.0, 3.5, u_scale);
        float t = u_phase * mix(0.3, 1.2, u_speed);
        float v = 0.0;
        v += sin(p.x * 4.0 + t) * 0.5 + 0.5;
        v += sin(p.y * 5.0 - t * 1.3) * 0.4;
        v += sin((p.x + p.y) * 6.0 + t * 0.7) * 0.3;
        v += sin(length(p - 0.5) * 8.0 - t * 1.1) * 0.3;
        v += fbm(p * 1.5 + loopOff() + sOff) * 0.35 * u_detail;
        v *= 0.5 + 0.5 * u_density;
        col = grad4(clamp(v * 1.2, 0.0, 1.0));
        col = mix(col, grad4(clamp(v * 0.8 + 0.3, 0.0, 1.0)), 0.3 * u_distort);
    }

    /* ─── 14 · reeded ─── */
    else if (u_mode == 14){
        float N  = mix(24.0, 110.0, u_density);
        float rx = uv.x * N;
        float ri = floor(rx);
        float rf = fract(rx);
        float lens = (rf - 0.5) * ((0.3 + 2.2 * u_distort) / N);
        vec2 sUV = vec2(clamp(uv.x + lens, 0.001, 0.999), uv.y);
        vec2 p = vec2(sUV.x * ar, sUV.y);
        float f = metaf(p, ar)
                + fbm(sUV * (1.2 + 2.4 * u_scale) + loopOff() + sOff) * (0.12 + 0.28 * u_detail);
        col = grad4(f * 0.42);
        float shimmer = 0.028 * sin(ri * 2.399 + u_seed + 2.0 * u_phase);
        float h1 = exp(-pow((rf - 0.27 - shimmer) * 13.5, 2.0)) * 0.62;
        float h2 = exp(-pow((rf - 0.75) * 22.0, 2.0)) * 0.10;
        float groove = smoothstep(0.0, 0.07, rf) * smoothstep(1.0, 0.93, rf);
        col  = col * (0.70 + groove * 0.30);
        col += u_c3 * h1;
        col += u_c3 * 0.85 * h2;
        col *= 0.87 + fbm(vec2(ri * 0.09, uv.y * 3.1) + loopOff() * 0.8 + sOff) * 0.15;
    }

    /* ─── 15 · rings ─── */
    else if (u_mode == 15){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0);
        float rad = length(p);
        float n = fbm(p * mix(1.0, 4.0, u_scale) + loopOff() + sOff);
        float rings = sin((rad * mix(8.0, 30.0, u_density) + n * 2.0 * u_distort - u_phase * 1.5) * 3.14159);
        float f = 0.5 + 0.5 * rings;
        col = grad4(clamp(f * (0.7 + 0.5 * u_detail), 0.0, 1.0));
        float glow = exp(-rad * 3.0) * 0.3;
        col += u_c3 * glow;
    }

    /* ─── 16 · rorschach ─── */
    else if (u_mode == 16){
        vec2 mp = uv;
        mp.x = abs(mp.x - 0.5) * 2.0;
        vec2 p = (vec2(mp.x * ar, mp.y) - vec2(0.5 * ar, 0.5)) * mix(2.0, 6.0, u_scale) + sOff;
        float t = u_phase * mix(0.3, 1.0, u_speed);
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

    /* ─── 17 · ridged ─── */
    else if (u_mode == 17){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(2.0, 6.0, u_scale) + sOff;
        float t = u_phase * mix(0.2, 0.8, u_speed);
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

    /* ─── 18 · sd rosette ─── */
    else if (u_mode == 18){
        vec2 p = uv - 0.5;
        p.x *= ar;
        float n = 5.0 + floor(mix(3.0, 9.0, u_density));
        float a = atan(p.y, p.x);
        float r = length(p);
        float sector = 3.14159 / max(n, 2.0);
        a = mod(a + u_phase * 0.25, sector * 2.0);
        a = abs(a - sector);
        vec2 q = vec2(cos(a), sin(a)) * r;
        float f = abs(q.y) - 0.04 * (0.4 + 0.8 * u_scale);
        float pulse = sin(r * mix(6.0, 24.0, u_detail) - u_phase * 1.6) * 0.5 + 0.5;
        float edge = exp(-abs(f) * (18.0 + 40.0 * u_distort));
        edge = smoothstep(0.0, 0.9, edge);
        col = mix(u_c0 * 0.5, grad4(pulse), edge);
        col += u_c3 * edge * 0.22;
    }

    /* ─── 19 · truchet ─── */
    else if (u_mode == 19){
        float tileN = mix(2.0, 8.0, u_scale);
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * tileN + sOff;
        float t = u_phase * mix(0.5, 1.5, u_speed);
        vec2 ip = floor(p);
        vec2 fp = fract(p);
        float h = hash21(ip + sOff);
        if (h < 0.5) fp.x = 1.0 - fp.x;
        float d = min(length(fp), length(fp - 1.0));
        d = abs(d - 0.5);
        float bands = mix(3.0, 7.0, u_density) + u_distort * 2.5;
        float f = 0.5 + 0.5 * cos(d * bands * TAU - t * 1.5);
        f += fbm(p * 0.4 + loopOff()) * 0.1 * u_detail;
        col = grad4(clamp(f, 0.0, 1.0));
        float edge = smoothstep(0.06, 0.0, abs(d - 0.5) - 0.02);
        col += u_c3 * edge * mix(0.15, 0.40, u_distort);
    }

    /* ─── 20 · triangle lattice ─── */
    else if (u_mode == 20){
        vec2 p = uv - 0.5;
        p.x *= ar;
        float a = u_phase * (0.2 + 0.4 * u_speed);
        float ca = cos(a), sa = sin(a);
        p = mat2(ca, -sa, sa, ca) * p;
        vec2 g = p * (8.0 + 18.0 * u_density);
        vec2 f = fract(g) - 0.5;
        float tri = abs(f.x) * 0.866 + f.y * 0.5;
        float d = abs(tri);
        float rings = sin(length(floor(g)) * 0.9 + u_phase) * 0.5 + 0.5;
        float edge = smoothstep(0.08, 0.0, d);
        col = grad4(clamp(rings * (0.6 + 0.6 * u_detail), 0.0, 1.0));
        col = mix(col, u_c3, edge * (0.4 + 0.6 * u_scale));
    }

    /* ─── 21 · turbulence ─── */
    else if (u_mode == 21){
        vec2 p = (uv - 0.5) * vec2(ar, 1.0) * mix(2.0, 6.0, u_scale) + sOff;
        float t = u_phase * mix(0.3, 1.0, u_speed);
        mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
        float v = 0.0, a = 0.5;
        vec2 q2 = p + vec2(t * 0.4, t * 0.2);
        for (int i = 0; i < 8; i++){
            float fi = float(i);
            if (fi >= mix(3.0, 8.0, u_density)) break;
            v += a * abs(cnoise(q2));
            q2 = rot * q2 * 2.0 + vec2(100.0);
            a *= mix(0.35, 0.65, u_detail);
        }
        col = grad4(clamp(v, 0.0, 1.0));
        col += u_c3 * pow(clamp(v, 0.0, 1.0), 3.0) * 0.2;
    }

    /* ─── 22 · waves ─── */
    else if (u_mode == 22){
        float f = uv.y * mix(1.5, 5.0, u_scale);
        f += sin(uv.x * (3.0 + 9.0 * u_density) + u_phase + u_seed) * 0.45;
        f += sin(uv.x * (7.0 + 5.0 * u_density) - 2.0 * u_phase + u_seed * 1.7) * 0.20;
        f += fbm(uv * vec2(ar, 1.0) * (1.5 + 2.0 * u_scale) + loopOff() + sOff)
             * (0.30 + 0.90 * u_distort);
        float t = 0.5 + 0.5 * sin(f * TAU * (0.4 + 0.9 * u_detail));
        col = grad4(t);
    }

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
    col += (hash21(gl_FragCoord.xy + vec2(u_phase * 91.3)) - 0.5) * u_grain * 0.22;
    vec2 v = uv * 2.0 - 1.0;
    col *= 1.0 - dot(v, v) * 0.16;

    if (u_invert > 0.5) {
        col = 1.0 - col;
    }

    gl_FragColor = vec4(col, 1.0);
}`;

// ── WebGL context and program ────────────────────────────

type UniformMap = Record<string, WebGLUniformLocation | null>;

const UNIFORM_NAMES = [
  'u_res', 'u_phase', 'u_seed', 'u_mode',
  'u_speed', 'u_scale', 'u_density', 'u_distort', 'u_detail', 'u_grain',
  'u_c0', 'u_c1', 'u_c2', 'u_c3', 'u_texture', 'u_mix', 'u_pixel', 'u_invert',
] as const;

export let canvas: HTMLCanvasElement;
export let gl: WebGLRenderingContext;
let prog: WebGLProgram;
let U: UniformMap = {};
export let texLoaded = false;
export let texObj: WebGLTexture | null = null;

function compileShaderSrc(type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile error');
  return s;
}

function linkProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p) ?? 'link error');
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

  const vs = compileShaderSrc(gl.VERTEX_SHADER, VS);
  const fs = compileShaderSrc(gl.FRAGMENT_SHADER, FS);
  prog = linkProgram(vs, fs);
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
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// ── Shader hot-swap (live editor) ────────────────────────

export function compileNewFS(newSrc: string): string | null {
  try {
    const fs = compileShaderSrc(gl.FRAGMENT_SHADER, newSrc);
    const vs = compileShaderSrc(gl.VERTEX_SHADER, VS);
    const newProg = linkProgram(vs, fs);
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
