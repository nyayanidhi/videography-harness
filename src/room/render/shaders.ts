// GLSL for the image pipeline. All passes are full-screen; inputs are linear HDR.

export const FS_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// ── Atmosphere: raymarch the haze between the camera and the first surface.
// Daylight visibility comes from the light's depth map (real shafts through the slits
// and the opening); the lamp's glow is integrated analytically.
export const VOLUME_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform sampler2D tLightDepth0;
uniform sampler2D tLightDepth1;
uniform mat4 uProjInv;
uniform mat4 uCamWorld;
uniform vec3 uCamPos;
uniform mat4 uLightVP0;
uniform mat4 uLightVP1;
uniform vec3 uSunDir0;     // direction each light travels
uniform vec3 uSunDir1;
uniform vec3 uSunCol0;
uniform vec3 uSunCol1;
uniform vec3 uAmbCol;
uniform float uDensity;    // scattering coefficient at the floor, 1/m
uniform float uFalloff;    // height scale, m
uniform float uTime;
uniform float uSeed;
uniform vec3 uLampPos;
uniform vec3 uLampDir;
uniform vec3 uLampCol;
uniform float uMaxDist;
uniform float uDebug;

float hash13(vec3 p){ p = fract(p*0.1031); p += dot(p, p.zyx+31.32); return fract((p.x+p.y)*p.z); }
float vnoise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash13(i),hash13(i+vec3(1,0,0)),f.x), mix(hash13(i+vec3(0,1,0)),hash13(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash13(i+vec3(0,0,1)),hash13(i+vec3(1,0,1)),f.x), mix(hash13(i+vec3(0,1,1)),hash13(i+vec3(1,1,1)),f.x),f.y), f.z);
}
float density(vec3 p){
  float h = exp(-max(p.y, 0.0)/uFalloff);
  vec3 q = p*0.045 + vec3(uTime*0.010, uTime*0.004, -uTime*0.016);
  float n = vnoise(q)*0.6 + vnoise(q*2.3)*0.4;
  return uDensity * h * (0.55 + 0.9*n);
}
float visOf(sampler2D dm, mat4 vp, vec3 p){
  vec4 l = vp * vec4(p, 1.0);
  vec3 s = l.xyz / l.w * 0.5 + 0.5;
  if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0 || s.z > 1.0) return 0.0;
  float d = texture2D(dm, s.xy).x;
  return s.z - 0.0006 <= d ? 1.0 : 0.0;
}
float sunVis(vec3 p){ return visOf(tLightDepth0, uLightVP0, p); }
float hg(float c, float g){ float g2 = g*g; return (1.0-g2) / (12.566 * pow(1.0 + g2 - 2.0*g*c, 1.5)); }

void main(){
  vec3 col = texture2D(tColor, vUv).rgb;
  float z = texture2D(tDepth, vUv).x;
  vec4 v = uProjInv * vec4(vUv*2.0-1.0, z*2.0-1.0, 1.0); v /= v.w;
  vec3 wp = (uCamWorld * vec4(v.xyz, 1.0)).xyz;
  vec3 rd = wp - uCamPos;
  float dist = length(rd); rd /= dist;
  bool sky = z >= 0.99999;
  float tmax = sky ? uMaxDist : min(dist, uMaxDist);

  const int N = 128;
  float dt = tmax / float(N);
  float j = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))) + uSeed);
  float c0 = dot(uSunDir0, -rd);
  float ph0 = mix(hg(c0, 0.62), hg(c0, -0.2), 0.12);
  float c1 = dot(uSunDir1, -rd);
  float ph1 = mix(hg(c1, 0.55), hg(c1, -0.2), 0.12);
  bool warmOn = dot(uSunCol1, vec3(1.0)) > 1e-4;
  vec3 L = vec3(0.0);
  float T = 1.0;
  for (int i = 0; i < N; i++){
    vec3 p = uCamPos + rd * (float(i) + j) * dt;
    float s = density(p);
    if (s <= 0.0) continue;
    vec3 inS = uSunCol0 * ph0 * visOf(tLightDepth0, uLightVP0, p) + uAmbCol * 0.0796;
    if (warmOn) inS += uSunCol1 * ph1 * visOf(tLightDepth1, uLightVP1, p);
    float a = exp(-s*dt);
    L += T * inS * (1.0 - a);   // energy-conserving step (scattering albedo 1)
    T *= a;
  }
  // lamp: single scattering from a point source, integrated in closed form
  vec3 oc = uLampPos - uCamPos;
  float tc = dot(oc, rd);
  float h = max(length(oc - rd*tc), 0.02);
  float span = (atan((tmax - tc)/h) - atan(-tc/h)) / h;
  vec3 pc = uCamPos + rd*clamp(tc, 0.0, tmax);
  float cone = smoothstep(0.55, 0.95, dot(normalize(pc - uLampPos), uLampDir));
  float sh = density(pc) * 0.0796;
  L += uLampCol * sh * span * (0.06 + 0.94*cone) * exp(-density(uCamPos)*clamp(tc,0.0,tmax));

  if (uDebug > 1.5) { float d = texture2D(tLightDepth0, vUv).x; gl_FragColor = vec4(vec3(fract(d*8.0)), 1.0); return; }
  if (uDebug > 0.5) {
    // debug: fraction of march samples the sun can see
    float vis = 0.0;
    for (int i = 0; i < 32; i++){ vec3 p = uCamPos + rd * (float(i)+0.5) * tmax/32.0; vis += sunVis(p); }
    gl_FragColor = vec4(vec3(vis/32.0)*20.0, 1.0); return;
  }
  gl_FragColor = vec4(col * T + L, 1.0);
}`;

export const ACCUM_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform float uWeight;
void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb * uWeight, 1.0); }`;

// dual-filter (Kawase) blur for bloom/halation
export const DOWN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform vec2 uTexel;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb * 4.0;
  c += texture2D(tSrc, vUv + uTexel*vec2(-1.0,-1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel*vec2( 1.0,-1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel*vec2(-1.0, 1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel*vec2( 1.0, 1.0)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}`;
export const UP_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform sampler2D tPrev;
uniform vec2 uTexel;
void main(){
  vec3 c = vec3(0.0);
  c += texture2D(tSrc, vUv + uTexel*vec2(-2.0, 0.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel*vec2( 2.0, 0.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel*vec2( 0.0,-2.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel*vec2( 0.0, 2.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel*vec2(-1.0, 1.0)).rgb * 2.0;
  c += texture2D(tSrc, vUv + uTexel*vec2( 1.0, 1.0)).rgb * 2.0;
  c += texture2D(tSrc, vUv + uTexel*vec2(-1.0,-1.0)).rgb * 2.0;
  c += texture2D(tSrc, vUv + uTexel*vec2( 1.0,-1.0)).rgb * 2.0;
  gl_FragColor = vec4(c / 12.0 + texture2D(tPrev, vUv).rgb, 1.0);
}`;

// ── Film finish: exposure, halation, AgX-style tone curve, split-tone grade, vignette,
// grain, dither, letterbox.
export const FINAL_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform sampler2D tBloom;
uniform float uExposure;
uniform float uBloom;
uniform float uGrain;
uniform float uFrame;
uniform float uBar;        // letterbox bar height, fraction of frame height (each)
uniform vec2 uRes;

float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

// AgX (Troy Sobotka) with a punchy-but-natural look, polynomial fit after Benjamin Wrensch
vec3 agxContrast(vec3 x){
  vec3 x2 = x*x; vec3 x4 = x2*x2;
  return 15.5*x4*x2 - 40.14*x4*x + 31.96*x4 - 6.868*x2*x + 0.4298*x2 + 0.1191*x - 0.00232;
}
vec3 agx(vec3 c){
  const mat3 inM = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                        0.0784335999999992, 0.878468636469772, 0.0784336,
                        0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  const mat3 outM = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                         -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                         -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
  const float minEv = -12.47393; const float maxEv = 4.026069;
  c = inM * c;
  c = clamp(log2(max(c, 1e-10)), minEv, maxEv);
  c = (c - minEv) / (maxEv - minEv);
  c = agxContrast(c);
  c = outM * c;
  return clamp(c, 0.0, 1.0); // display-encoded (≈ sRGB)
}

void main(){
  vec2 uv = vUv;
  vec3 hdr = texture2D(tSrc, uv).rgb;
  vec3 bl = texture2D(tBloom, uv).rgb;
  // halation: film's red-orange glow around bright edges
  hdr += bl * uBloom * vec3(1.0, 0.92, 0.86) + bl * uBloom * 0.6 * vec3(0.55, 0.12, 0.04);
  hdr *= uExposure;
  // natural vignette (cos^4-like)
  vec2 d = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);
  hdr *= mix(1.0, pow(cos(clamp(length(d)*0.62, 0.0, 1.5)), 4.0), 0.85);
  vec3 c = agx(hdr);
  // grade: cool the shadows, warm the highlights, a hair of lift
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c += (1.0 - smoothstep(0.0, 0.45, luma)) * vec3(-0.006, 0.0, 0.012);
  c += smoothstep(0.55, 1.0, luma) * vec3(0.012, 0.004, -0.01);
  c = c * 0.985 + 0.012;
  // grain: per-frame, strongest in the mid-tones
  float g = hash12(gl_FragCoord.xy + fract(uFrame*0.6180339)*1000.0) + hash12(gl_FragCoord.yx*1.37 + uFrame) - 1.0;
  c += g * uGrain * (0.35 + 0.65*(1.0 - abs(luma*2.0 - 1.0)));
  // letterbox
  float bar = step(uv.y, uBar) + step(1.0 - uBar, uv.y);
  c = mix(c, vec3(0.012, 0.014, 0.016), clamp(bar, 0.0, 1.0));
  // dither to kill banding in the haze before 8-bit encode
  c += (hash12(gl_FragCoord.xy*0.731 + uFrame*3.1) - 0.5) / 255.0;
  gl_FragColor = vec4(c, 1.0);
}`;
