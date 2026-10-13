import {useMemo} from 'react';
import * as THREE from 'three';

// Prandtl–Glauert vapor cone: a bell of condensation that hugs the body and flares to the tail.
// life: 0 → forms, ~0.15 fully formed, 1 → torn off and gone.
const vert = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vView;
void main(){
  vUv = uv;
  float wob = sin(uv.x*37.0 + position.y*0.9) * 0.18 + sin(uv.x*91.0 - position.y*1.7) * 0.08;
  vec3 pos = position + normal * wob * uv.y;
  vec4 wp = modelMatrix * vec4(pos,1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const frag = /* glsl */ `
precision highp float;
uniform float uLife; uniform float uSeed; uniform vec3 uSun;
varying vec2 vUv; varying vec3 vN; varying vec3 vView;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 x){ vec2 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.1; a*=0.5; } return s; }
void main(){
  float u = vUv.x, v = vUv.y;               // u around, v from apex (0) to rim (1)
  // fine streaks running along the body, drifting tailward as it ages
  float streak = fbm(vec2(u*48.0 + uSeed, v*2.5 - uLife*3.0));
  float grain  = fbm(vec2(u*140.0, v*9.0 + uSeed));
  // densest at the leading shock lip, fraying into streaks toward the tail
  float lip  = smoothstep(0.0, 0.05, v) * pow(1.0 - v, 1.4);
  float rim  = exp(-pow((v - 0.08) * 9.0, 2.0)) * 0.9;
  float fray = smoothstep(0.25 + 0.5*streak, 0.0, v + uLife*0.4);
  float edge = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 1.2);
  float form = smoothstep(0.0, 0.1, uLife) * (1.0 - smoothstep(0.4, 1.0, uLife));
  float clump = smoothstep(0.38, 0.72, fbm(vec2(u*22.0 + uSeed*3.0, v*4.0 - uLife*2.0)));
  float a = form * (lip * (0.35 + 0.65*edge) * mix(0.2, 1.0, streak) + rim * streak) * mix(0.6, 1.0, grain) * mix(0.35, 1.0, clump);
  a *= smoothstep(0.98, 0.7, edge) * 0.6 + 0.4; // don't let the exact silhouette read as a hard shell
  a *= 1.0 - fray * 0.6;
  float lambert = clamp(dot(normalize(vN), uSun)*0.5+0.5, 0.0, 1.0);
  vec3 col = mix(vec3(0.80,0.84,0.90), vec3(1.0), lambert);
  gl_FragColor = vec4(col, clamp(a*3.0, 0.0, 0.97));
}`;

export const VaporCone: React.FC<{life: number; seed?: number}> = ({life, seed = 3.1}) => {
  const geo = useMemo(() => {
    // bell profile in rocket-local units (nose ≈ +7.7, tail ≈ −8)
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const y = 2.5 - t * 14; // apex just ahead of mid-body → past the tail
      const r = 0.6 + 12.5 * Math.pow(t, 0.62);
      pts.push(new THREE.Vector2(r, y));
    }
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {uLife: {value: 0}, uSeed: {value: seed}, uSun: {value: new THREE.Vector3(0.35, 0.6, 0.7).normalize()}},
      }),
    [seed],
  );
  mat.uniforms.uLife.value = life;
  // once formed, the shroud detaches and slips back along the body while expanding
  const slip = Math.max(0, life - 0.3) * 9;
  const grow = 1 + Math.max(0, life - 0.3) * 0.5;
  if (life <= 0 || life >= 1) return null;
  return <mesh geometry={geo} material={mat} position={[0, -slip, 0]} scale={[grow, 1, grow]} renderOrder={2} />;
};
