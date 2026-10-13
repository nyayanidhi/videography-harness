import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';

// Full-screen raymarched cloud sea + sky. Drawn first; meshes render on top.
const frag = /* glsl */ `
precision highp float;
uniform vec3 uCam;
uniform mat4 uCamWorld;
uniform mat4 uProjInv;
uniform float uTime;
uniform float uTop;     // cloud-top height
uniform float uBase;    // cloud-base height
uniform vec3 uSun;
varying vec2 vUv;

float hash(vec3 p){ p = fract(p*0.3183099 + .1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z);
}
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.03; a*=0.5; } return s; }

float density(vec3 p){
  float h = (p.y - uBase) / (uTop - uBase);
  if (h < 0.0 || h > 1.0) return 0.0;
  vec3 q = p*0.018 + vec3(uTime*0.012, 0.0, uTime*0.02);
  float billow = fbm(q);
  float shape = smoothstep(0.0, 0.25, h) * (1.0 - smoothstep(0.62, 1.0, h));
  float d = billow * shape * 1.6 - (h*0.5 + 0.18);
  return clamp(d*3.0, 0.0, 1.0);
}

vec3 sky(vec3 rd){
  float t = clamp(rd.y*1.6, 0.0, 1.0);
  vec3 horizon = vec3(0.976, 0.972, 0.955);
  vec3 zenith  = vec3(0.70, 0.80, 0.91);
  vec3 c = mix(horizon, zenith, pow(t, 0.7));
  float sunAmt = max(dot(rd, uSun), 0.0);
  c += vec3(1.0, 0.97, 0.9) * (pow(sunAmt, 900.0) * 0.6 + pow(sunAmt, 40.0) * 0.05);
  return c;
}

void main(){
  vec4 ndc = vec4(vUv*2.0-1.0, 1.0, 1.0);
  vec4 view = uProjInv * ndc; view /= view.w;
  vec3 rd = normalize((uCamWorld * vec4(view.xyz, 0.0)).xyz);
  vec3 ro = uCam;

  vec3 col = sky(rd);
  // march only through the cloud slab
  float t0, t1;
  if (abs(rd.y) < 1e-4) { gl_FragColor = vec4(col,1.0); return; }
  float ta = (uTop - ro.y)/rd.y, tb = (uBase - ro.y)/rd.y;
  t0 = max(min(ta,tb), 0.0); t1 = max(ta,tb);
  if (t1 <= 0.0) { gl_FragColor = vec4(col,1.0); return; }
  t1 = min(t1, t0 + 900.0);

  float T = 1.0; vec3 acc = vec3(0.0);
  const int STEPS = 72;
  float dt = (t1 - t0)/float(STEPS);
  float t = t0 + dt*hash(vec3(gl_FragCoord.xy, uTime));
  for (int i=0;i<STEPS;i++){
    vec3 p = ro + rd*t;
    float d = density(p);
    if (d > 0.01){
      // light: short march toward the sun
      float ls = 0.0;
      for (int j=1;j<=4;j++) ls += density(p + uSun*float(j)*6.0);
      float light = exp(-ls*0.9);
      float h = (p.y - uBase)/(uTop - uBase);
      vec3 lit = mix(vec3(0.68,0.73,0.81), vec3(1.0,0.995,0.98), light) * (0.8 + 0.2*h);
      float a = 1.0 - exp(-d*dt*0.22);
      acc += T * a * lit;
      T *= 1.0 - a;
      if (T < 0.02) break;
    }
    t += dt;
  }
  // aerial perspective toward the horizon
  float fog = 1.0 - exp(-t0*0.0016);
  vec3 cloudCol = mix(acc + T*col, sky(rd), fog*(1.0-T)*0.8);
  gl_FragColor = vec4(cloudCol, 1.0);
}`;

const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;

export const Clouds: React.FC<{time: number; top?: number; base?: number}> = ({time, top = 0, base = -60}) => {
  const {camera} = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uCam: {value: new THREE.Vector3()},
          uCamWorld: {value: new THREE.Matrix4()},
          uProjInv: {value: new THREE.Matrix4()},
          uTime: {value: 0},
          uTop: {value: top},
          uBase: {value: base},
          uSun: {value: new THREE.Vector3(-0.45, 0.55, 0.7).normalize()}, // behind-left of camera: lit clouds, no sun disc in frame
        },
      }),
    [top, base],
  );
  camera.updateMatrixWorld();
  mat.uniforms.uCam.value.copy(camera.position);
  mat.uniforms.uCamWorld.value.copy(camera.matrixWorld);
  mat.uniforms.uProjInv.value.copy(camera.projectionMatrixInverse);
  mat.uniforms.uTime.value = time;
  return (
    <mesh frustumCulled={false} renderOrder={-1} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};
