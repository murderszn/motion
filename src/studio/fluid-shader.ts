// Fluid field engines ported from https://github.com/enonforetsam/fluid (MIT)
// Adapted for seamless looping via u_phase (integer-multiple harmonics only).

export const FLUID_MODE_OFFSET = 21;

export const FLUID_SHADER_BLOCK = `
#define flT u_phase

vec2 flOff(){
    return vec2(cos(u_phase), sin(u_phase)) * (0.10 + 0.55 * u_speed);
}

float flHash(vec2 p){
    p = fract(p * 0.3183099 + fract(u_seed * 0.1031) + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * (p.x + p.y));
}
float flVnoise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = flHash(i);
    float b = flHash(i + vec2(1.0, 0.0));
    float c = flHash(i + vec2(0.0, 1.0));
    float d = flHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float flFbm(vec2 p){
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++){
        v += a * flVnoise(p);
        p = p * 2.03 + vec2(11.7, 5.9);
        a *= 0.5;
    }
    return v;
}
vec2 flHash22(vec2 p){
    return vec2(flHash(p), flHash(p + vec2(37.2, 17.3)));
}
vec2 flHexCenter(vec2 p){
    vec2 r = vec2(1.0, 1.7320508);
    vec2 h = r * 0.5;
    vec2 a = mod(p, r) - h;
    vec2 b = mod(p - h, r) - h;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    return p - gv;
}
float flSpreadF(float v, float g){ return clamp((v - 0.5) * g + 0.5, 0.0, 1.0); }
vec2 flFgrad(vec2 p, vec2 off){
    float e = 0.06;
    float gx = flFbm(p + vec2(e, 0.0) + off) - flFbm(p - vec2(e, 0.0) + off);
    float gy = flFbm(p + vec2(0.0, e) + off) - flFbm(p - vec2(0.0, e) + off);
    return vec2(gx, gy) / (2.0 * e);
}
float flFieldFlow(vec2 p, float warp){
    vec2 np = p * (0.6 + 0.6 * u_density);
    float amt = 0.6 + warp * 0.25 + u_distort * 1.5;
    vec2 wa = vec2(flFbm(np * 0.6 + 11.0), flFbm(np * 0.6 + 27.0)) - 0.5;
    vec2 wb = vec2(flFbm(np * 0.9 + 41.0), flFbm(np * 0.9 + 63.0)) - 0.5;
    vec2 sp = np + wa * (1.1 * sin(flT)) + wb * (1.0 * cos(2.0 * flT));
    vec2 g = flFgrad(sp, vec2(0.0));
    vec2 curl = vec2(g.y, -g.x);
    float flow = flSpreadF(flFbm(np + curl * amt), 2.0);
    return flow + (flFbm(p * 12.0) - 0.5) * 0.15 * u_detail;
}
float flFieldCellular(vec2 p, float warp){
    vec2 np = p * (1.0 + 1.5 * u_density);
    np += vec2(flFbm(np * 2.0 + 3.1), flFbm(np * 2.0 + 7.4)) * u_distort * 0.5;
    vec2 ip = floor(np);
    vec2 fp = fract(np);
    float f1 = 9.0; float f2 = 9.0;
    for (int j = -1; j <= 1; j++){
        for (int i = -1; i <= 1; i++){
            vec2 g = vec2(float(i), float(j));
            vec2 o = flHash22(ip + g);
            o = 0.5 + 0.5 * sin(flT + 6.2831853 * o);
            vec2 d = g + o - fp;
            float dd = dot(d, d);
            if (dd < f1){ f2 = f1; f1 = dd; }
            else if (dd < f2){ f2 = dd; }
        }
    }
    f1 = sqrt(f1); f2 = sqrt(f2);
    float cells = 1.0 - f1;
    float edges = f2 - f1;
    float base = mix(cells, edges, clamp(warp / 9.0, 0.0, 1.0));
    return base + (flFbm(p * 15.0) - 0.5) * 0.12 * u_detail;
}
float flFieldGyroid(vec2 p, float warp){
    vec2 np = p * (1.0 + 1.8 * u_density);
    vec3 q = vec3(np * 1.4, sin(flT) * 0.5);
    float g = sin(q.x) * cos(q.y) + sin(q.y) * cos(q.z) + sin(q.z) * cos(q.x);
    g += (0.15 + warp * 0.12 + u_distort * 0.8) * sin(2.0 * g + length(np));
    return 0.5 + 0.5 * sin(g * (1.6 + 1.2 * u_detail));
}
float flTruchetCell(vec2 p, float h, float warp){
    vec2 fp = fract(p);
    if (h < 0.5){ fp.x = 1.0 - fp.x; }
    float d = min(length(fp), length(fp - 1.0));
    d = abs(d - 0.5);
    float bands = 4.0 + warp * 2.5 + u_density * 8.0;
    float w = d * bands * 6.2831853 - flT;
    float val = cos(w);
    if (u_detail > 0.05) {
        val = mix(val, cos(w * 2.0), u_detail * 0.5);
    }
    return 0.5 + 0.5 * val;
}
float flFieldTruchet(vec2 p, float warp){
    vec2 np = p;
    np += vec2(flFbm(p * 2.5 + 2.0), flFbm(p * 2.5 + 5.0)) * u_distort * 0.35;
    return flTruchetCell(np, flHash(floor(np)), warp);
}
float flFieldInterf(vec2 p, float warp){
    float v = 0.0;
    float t = flT;
    for (int i = 0; i < 4; i++){
        float fi = float(i);
        float speed = (fi < 1.5) ? 1.0 : 2.0;
        if (mod(fi, 2.0) > 0.5) speed = -speed;
        
        float angle = speed * t + fi * 1.57079632679;
        vec2 c = 1.2 * vec2(sin(angle), cos(angle));
        if (u_distort > 0.01) {
            c += vec2(flFbm(p * 1.2), flFbm(p * 1.2 + 4.0)) * u_distort * 0.35;
        }
        float freq = 5.0 + warp * 2.0 + fi * 1.6 + u_density * 6.0;
        v += sin(length(p - c) * freq - 5.0 * speed * t);
    }
    float interf = 0.5 + 0.5 * (v / 4.0);
    return interf + (flFbm(p * 10.0) - 0.5) * 0.15 * u_detail;
}
float flFieldKaleido(vec2 p, float warp){
    float ang = atan(p.y, p.x);
    vec2 lOffset = vec2(cos(flT), sin(flT)) * 0.4;
    float rad = length(p) + flFbm(p * 2.0 + lOffset) * u_distort * 0.25;
    float sectors = 3.0 + floor(warp * 0.7) + floor(u_density * 6.0);
    float seg = 6.2831853 / sectors;
    ang = mod(ang, seg);
    ang = abs(ang - 0.5 * seg);
    vec2 q = vec2(cos(ang), sin(ang)) * rad;
    float f = flSpreadF(flFbm(q * 1.6 + lOffset * 1.5), 1.6);
    return f + (flFbm(p * 14.0) - 0.5) * 0.12 * u_detail;
}
float flFieldLines(vec2 p, float warp){
    float ang = warp * 0.35;
    float c = cos(ang), s = sin(ang);
    vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    q.x += flFbm(p * 1.8 + flOff()) * u_distort * 0.8;
    float freq = 5.0 + warp * 1.4 + u_density * 12.0;
    float l = 0.5 + 0.5 * sin(q.x * freq + flT + 0.6 * sin(q.y * 0.7 + flT));
    if (u_detail > 0.05) {
        l = mix(l, smoothstep(0.35, 0.65, l), u_detail);
    }
    return l;
}
float flFieldGrid(vec2 p, float warp){
    vec2 np = p + vec2(flFbm(p * 2.0), flFbm(p * 2.0 + 3.0)) * u_distort * 0.45;
    float freq = 4.0 + warp * 1.4 + u_density * 10.0;
    float gx = sin(np.x * freq + flT);
    float gy = sin(np.y * freq - flT);
    float lines = max(gx, gy);
    float nodes = gx * gy;
    float grid = flSpreadF(0.5 + 0.5 * mix(lines, nodes, 0.35), 1.5);
    if (u_detail > 0.05) {
        float gx2 = sin(np.x * freq * 3.0 + flT);
        float gy2 = sin(np.y * freq * 3.0 - flT);
        float sub = 0.5 + 0.5 * max(gx2, gy2);
        grid = mix(grid, grid * sub, u_detail * 0.5);
    }
    return grid;
}
float flFieldGolden(vec2 p, float warp){
    float r = length(p) * (1.3 + warp * 0.18 + u_density * 1.5);
    float a = atan(p.y, p.x);
    float n = r * r;
    float spiral = cos(a - n * 2.39996323 + flT);
    float rings = cos(n * 3.14159265 - 2.0 * flT);
    return 0.5 + 0.5 * spiral * rings;
}
float flFieldSmoke(vec2 p, float warp){
    vec2 np = p * (1.0 + 1.2 * u_density);
    float w = max(warp + u_distort * 6.0, 1.0);
    vec2 a1 = vec2(sin(flT), cos(flT)) * 0.8;
    vec2 a2 = vec2(cos(2.0 * flT), sin(2.0 * flT)) * 0.8;
    vec2 q = vec2(flFbm(np + a1), flFbm(np + vec2(5.2, 1.3) - a2));
    vec2 r = vec2(flFbm(np + w * 0.42 * q + vec2(1.7, 9.2) + a2),
                  flFbm(np + w * 0.42 * q + vec2(8.3, 2.8) - a1));
    float body = flFbm(np + w * 0.5 * r);
    float fine = flFbm(np * 2.4 + r * 1.6 + a1 * 0.4);
    float d = body * (0.72 - 0.32 * u_detail) + fine * (0.28 + 0.32 * u_detail);
    return pow(clamp((d - 0.15) * 1.65, 0.0, 1.0), 1.6);
}
float flFieldQuasi(vec2 p, float warp){
    vec2 np = p + vec2(flFbm(p * 2.0), flFbm(p * 2.0 + 4.0)) * u_distort * 0.45;
    float n = 5.0 + floor(warp * 0.6) + floor(u_detail * 7.0);
    float freq = 8.0 + u_density * 12.0;
    float v = 0.0;
    for (int i = 0; i < 12; i++){
        float on = step(float(i), n - 0.5);
        float a = 3.14159265 * float(i) / max(n, 1.0);
        v += on * cos((np.x * cos(a) + np.y * sin(a)) * freq + flT);
    }
    return flSpreadF(0.5 + 0.5 * (v / max(n, 1.0)), 1.5);
}
float flFieldHoneycomb(vec2 p, float warp){
    // Direct Cracked Devs fluid HC baseline, adapted to our uniform model.
    // Original: hp = p * (1.3 + u_warp * 0.35)
    float hcWarp = mix(1.5, 6.0, u_density) + warp * 0.10;
    vec2 hp = p * (1.3 + hcWarp * 0.35);
    vec2 c = flHexCenter(hp);
    vec2 gv = hp - c;
    float hd = max(abs(gv.x), max(abs(0.5 * gv.x + 0.8660254 * gv.y), abs(-0.5 * gv.x + 0.8660254 * gv.y)));
    float pulse = 0.5 + 0.5 * sin(flHash(c) * 6.2831853 + flT);
    float cell = mix(0.5, pulse, 0.55 + 0.45 * u_distort);
    float wall = smoothstep(0.40 - 0.035 * u_detail, 0.48 + 0.025 * u_detail, hd);
    return mix(cell, 0.04, wall);
}
float flFieldOf(int eng, vec2 p, float warp, out vec2 disp){
    float d1 = 1.8 * sin(flT) + 1.2 * cos(2.0 * flT);
    float d2 = 1.8 * cos(flT) + 1.2 * sin(2.0 * flT);
    disp = vec2(0.5);
    if (eng == 1){ return flFieldFlow(p, warp); }
    else if (eng == 2){ return flFieldCellular(p, warp); }
    else if (eng == 3){ return flFieldGyroid(p, warp); }
    else if (eng == 4){ return flFieldTruchet(p, warp); }
    else if (eng == 5){ return flFieldInterf(p, warp); }
    else if (eng == 6){ return flFieldKaleido(p, warp); }
    else if (eng == 7){ return flFieldLines(p, warp); }
    else if (eng == 8){ return flFieldGrid(p, warp); }
    else if (eng == 9){ return flFieldGolden(p, warp); }
    else if (eng == 10){ return flFieldSmoke(p, warp); }
    else if (eng == 11){ return flFieldQuasi(p, warp); }
    else if (eng == 12){ return flFieldHoneycomb(p, warp); }
    vec2 m1 = vec2(d1, d2);
    vec2 m2 = vec2(d2, -d1);
    vec2 q = vec2(flFbm(p + m1 * 0.5), flFbm(p + vec2(5.2, 1.3) + m2 * 0.5));
    disp = vec2(
        flFbm(p + warp * q + vec2(1.7, 9.2) + m1),
        flFbm(p + warp * q + vec2(8.3, 2.8) + m2)
    );
    return flSpreadF(flFbm(p + warp * disp), 1.5);
}
`;

export const FLUID_PRESET_BRANCH = `
    else if (u_mode >= 19){
        float mn = sqrt(u_res.x * u_res.y);
        vec2 flP = (gl_FragCoord.xy - 0.5 * u_res) / mn;
        flP *= mix(1.0, 2.5, u_scale) * 3.0;
        flP += vec2(fract(u_seed * 0.193), fract(u_seed * 0.317)) * 2.0;
        float flWarp = u_warp * 9.0;
        vec2 disp = vec2(0.5);
        int eng = u_mode - 19;
        float f = flFieldOf(eng, flP, flWarp, disp);
        
        // Detail controls color mapping sharpness & contrast
        float center = 0.5;
        float width = 0.42 - 0.15 * u_detail;
        f = smoothstep(center - width, center + width, f);
        
        // Quantize the flow field for eng == 1 (fluid flow) to look like moving camo
        if (eng == 1) {
            float levels = mix(3.0, 7.0, u_density);
            float val = f * levels;
            float f_val = floor(val);
            float fract_val = fract(val);
            float border_width = 0.05 * (1.0 + u_detail * 2.0);
            f = clamp((f_val + smoothstep(0.5 - border_width, 0.5 + border_width, fract_val)) / levels, 0.0, 1.0);
        }
        
        // Add a micro-detail noise overlay if detail is high
        if (u_detail > 0.01 && eng != 12 && eng != 1) {
            float noise = flFbm(flP * 20.0) - 0.5;
            f = clamp(f + noise * u_detail * 0.15, 0.0, 1.0);
        }
        
        col = grad4(f);
        
        // Ambient specular highlight glow based on density
        if (eng != 1) {
            col += u_c3 * smoothstep(0.72 - 0.12 * u_density, 1.0, f) * 0.12;
        }
    }
`;