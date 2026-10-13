// A person, always seen as a silhouette: a simple jointed figure with the four poses the
// story needs (seated at work, looking up, reaching to decide, standing in the light).
// Faces -z in its local frame.
import * as THREE from 'three';

export type Pose = {headPitch: number; reach: number; stand: number; breath: number};

const cap = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 6, 16);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// a limb hanging from a joint: the mesh's top sits on the joint
const limb = (parent: THREE.Object3D, mat: THREE.Material, r: number, len: number, x: number, y: number, z: number) => {
  const j = new THREE.Group();
  j.position.set(x, y, z);
  parent.add(j);
  const m = new THREE.Mesh(cap(r, len), mat);
  m.position.y = -len / 2;
  m.castShadow = m.receiveShadow = true;
  j.add(m);
  const end = new THREE.Group();
  end.position.y = -len;
  j.add(end);
  return {joint: j, end};
};

export class Person {
  root = new THREE.Group();
  private hips = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private thighs: THREE.Group[] = [];
  private shins: THREE.Group[] = [];
  private upper: THREE.Group[] = [];
  private fore: THREE.Group[] = [];
  private armMeshes: {mesh: THREE.Mesh; mat: THREE.Material}[] = [];
  private ghost = new THREE.MeshBasicMaterial({colorWrite: false, depthWrite: false});

  constructor(mat: THREE.Material, skin: THREE.Material = mat) {
    this.root.add(this.hips);
    this.hips.add(this.torso);
    for (const sx of [-0.1, 0.1]) {
      const th = limb(this.hips, mat, 0.072, 0.36, sx, 0, 0);
      const sh = limb(th.end, mat, 0.056, 0.38, 0, 0, 0);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.24), mat);
      foot.position.set(0, -0.44, -0.07);
      foot.castShadow = true;
      sh.end.parent!.add(foot);
      this.thighs.push(th.joint);
      this.shins.push(sh.joint);
    }
    // torso as a lathe: hips, waist, chest, sloping shoulders, neck
    const prof = [
      [0.0, -0.02],
      [0.14, 0.0],
      [0.15, 0.08],
      [0.135, 0.2],
      [0.15, 0.34],
      [0.168, 0.45],
      [0.18, 0.52],
      [0.16, 0.57],
      [0.11, 0.6],
      [0.058, 0.625],
      [0.05, 0.66],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), mat);
    body.scale.set(1.18, 1, 0.66);
    body.castShadow = body.receiveShadow = true;
    this.torso.add(body);
    const neck = new THREE.Mesh(cap(0.046, 0.05), mat);
    neck.position.y = 0.66;
    neck.castShadow = true;
    this.torso.add(neck);
    this.head.position.y = 0.68;
    this.torso.add(this.head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.1, 28, 20), mat);
    skull.position.y = 0.09;
    skull.scale.set(0.88, 1.06, 1);
    skull.castShadow = true;
    this.head.add(skull);
    // hair: a softer, fuller crown at the back
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.104, 28, 20), mat);
    hair.position.set(0, 0.112, 0.012);
    hair.scale.set(0.93, 0.98, 1.02);
    hair.castShadow = true;
    this.head.add(hair);
    for (const sx of [-0.2, 0.2]) {
      const ua = limb(this.torso, mat, 0.047, 0.25, sx * 0.97, 0.52, 0.0);
      const fa = limb(ua.end, mat, 0.041, 0.24, 0, 0, 0);
      // cuff, palm, fingers, thumb: enough to read as a hand in silhouette
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.044, 0.05, 20), mat);
      cuff.position.y = -0.25;
      fa.joint.add(cuff);
      const hand = new THREE.Group();
      hand.position.y = -0.29;
      hand.rotation.x = 0.25;
      fa.joint.add(hand);
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.085, 0.026, 2, 2, 2), skin);
      palm.position.y = -0.03;
      hand.add(palm);
      for (let f = 0; f < 4; f++) {
        const fl = [0.068, 0.078, 0.074, 0.06][f];
        const fg = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, fl, 4, 8), skin);
        fg.position.set(-0.027 + f * 0.018, -0.075 - fl / 2, 0.002);
        fg.rotation.x = 0.12 + f * 0.03;
        hand.add(fg);
      }
      const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.01, 0.05, 4, 8), skin);
      th.position.set(sx > 0 ? -0.045 : 0.045, -0.04, -0.012);
      th.rotation.z = sx > 0 ? -0.7 : 0.7;
      hand.add(th);
      hand.traverse((o) => ((o as THREE.Mesh).castShadow = true));
      this.upper.push(ua.joint);
      this.fore.push(fa.joint);
      ua.joint.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) this.armMeshes.push({mesh: m, mat: m.material as THREE.Material});
      });
    }
  }

  // keep the right arm casting shadows but invisible to the lens
  setArmHidden(hidden: boolean) {
    for (const a of this.armMeshes) a.mesh.material = hidden ? this.ghost : a.mat;
  }

  // angles are measured from hanging straight down; positive swings the limb forward (-z)
  setPose(p: Pose) {
    const s = p.stand;
    this.hips.position.set(0, mix(0.5, 0.855, s), mix(0, -0.06, s));
    for (let i = 0; i < 2; i++) {
      const thigh = mix(Math.PI / 2, 0.02, s);
      this.thighs[i].rotation.x = thigh;
      this.shins[i].rotation.x = mix(-Math.PI / 2, -0.02, s); // shin stays vertical
    }
    this.torso.rotation.x = -mix(0.17, 0.02, s); // lean in toward the work when seated
    this.torso.scale.y = 1 + 0.005 * p.breath;
    this.head.rotation.x = -p.headPitch;
    for (let i = 0; i < 2; i++) {
      const right = i === 1;
      const reach = right ? p.reach : 0;
      const uaGlobal = mix(mix(0.42, 0.04, s), 0.55, reach);
      const faGlobal = mix(mix(1.5, 0.12, s), 1.45, reach);
      // compensate for the torso's lean so the angles are global
      this.upper[i].rotation.x = uaGlobal - this.torso.rotation.x;
      this.fore[i].rotation.x = faGlobal - uaGlobal;
    }
  }
}
