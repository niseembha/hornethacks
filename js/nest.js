/* ==========================================================================
   HornetHacks — photoreal hornets' nest
   A procedurally built paper-wasp nest rendered with Three.js: lathe body
   displaced by noise, canvas-generated paper banding (albedo + bump),
   layered outer shells, a bark-textured branch, an entrance hole, and tiny
   hornets that fly in and out or crawl near the entrance.

   Purely decorative — no navigation. Drag spins the nest; it sways gently
   while idle. Falls back to a static silhouette when WebGL is unavailable.
   ========================================================================== */
import * as THREE from "../assets/vendor/three.module.min.js";

const host = document.getElementById("nest-host");
const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Deterministic randomness so the nest looks the same on every visit */
let seed = 101026;
const rnd = () => ((seed = (Math.imul(seed, 48271) >>> 0) % 2147483647) / 2147483647);

function showFallback() {
  document.querySelectorAll(".nest-fallback").forEach((el) => el.classList.add("show"));
  if (host) host.style.display = "none";
}

if (host && window.WebGLRenderingContext) {
  try {
    main();
  } catch (err) {
    console.error("Nest init failed:", err);
    showFallback();
  }
} else {
  showFallback();
}

function main() {
  /* ---- Renderer / scene / camera ---- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (!renderer.getContext()) throw new Error("no WebGL context");
  } catch (err) {
    showFallback();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);

  /* ---- Studio lighting on black: soft key, cool fill, hard rim ---- */
  scene.add(new THREE.HemisphereLight(0x585858, 0x0e0c0a, 0.55));
  scene.add(new THREE.AmbientLight(0x404040, 0.3));
  const key = new THREE.DirectionalLight(0xfff0dd, 1.85);
  key.position.set(2.8, 3.6, 5.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fb0c4, 0.45);
  fill.position.set(-4.5, 0.5, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.7);
  rim.position.set(-2.5, 3.5, -5);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xf2e6d8, 0.6);
  rim2.position.set(3.5, -1.5, -4);
  scene.add(rim2);
  /* warm front point light — catches the airborne hornets against black */
  const front = new THREE.PointLight(0xffe2b6, 4, 8, 2);
  front.position.set(1.4, -0.4, 2.8);
  scene.add(front);

  /* Faint backdrop spill so the nest reads against pure black */
  const spill = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 26),
    new THREE.MeshBasicMaterial({
      map: radialTexture("rgba(255,255,255,0.30)", "rgba(255,255,255,0)"),
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    })
  );
  spill.position.set(0.4, 0.2, -4.5);
  scene.add(spill);

  /* ---- Noise (periodic-safe: sampled in object space) ---- */
  const noise3 = makeNoise3(7919);
  const fbm = (x, y, z) =>
    noise3(x, y, z) * 0.55 + noise3(x * 2.13, y * 2.13, z * 2.13) * 0.28 + noise3(x * 4.7, y * 4.7, z * 4.7) * 0.17;

  /* ---- Nest profile (hanging teardrop, y up) ---- */
  const PROFILE = [
    [0.10, 2.18], [0.34, 2.10], [0.62, 1.94], [0.92, 1.70], [1.18, 1.38],
    [1.38, 1.00], [1.50, 0.55], [1.53, 0.10], [1.47, -0.35], [1.32, -0.78],
    [1.10, -1.16], [0.86, -1.47], [0.62, -1.71], [0.42, -1.88], [0.26, -1.99],
    [0.12, -2.06], [0.02, -2.09],
  ];
  const profCurve = new THREE.CatmullRomCurve3(PROFILE.map(([r, y]) => new THREE.Vector3(r, y, 0)));
  const prof = (v) => {
    const p = profCurve.getPoint(Math.min(1, Math.max(0, v)));
    return { r: Math.max(0.001, p.x), y: p.y };
  };
  /* Analytic-ish surface point + normal for placing things on the nest */
  function surfacePoint(u, v, out = new THREE.Vector3()) {
    const { r, y } = prof(v);
    const phi = u * Math.PI * 2;
    return out.set(r * Math.cos(phi), y, r * Math.sin(phi));
  }
  function surfaceNormal(u, v, out = new THREE.Vector3()) {
    const e = 0.012;
    const p = surfacePoint(u, v);
    const pu = surfacePoint(u + e, v, new THREE.Vector3());
    const pv = surfacePoint(u, v + e, new THREE.Vector3());
    pu.sub(p);
    pv.sub(p);
    return out.copy(pu.cross(pv)).normalize(); /* pu × pv points outward */
  }

  /* ---- Paper materials (albedo + bump generated on canvas) ---- */
  const paperMaps = paperTexture();
  const paperMat = new THREE.MeshStandardMaterial({
    map: paperMaps.map,
    bumpMap: paperMaps.bump,
    bumpScale: 0.9,
    roughness: 0.94,
    metalness: 0,
  });
  const paperDark = paperMat.clone();
  paperDark.color = new THREE.Color(0x9c9c9c);

  /* ---- Build the nest ---- */
  const nest = new THREE.Group();
  scene.add(nest);

  const bandWobble = (u) => 1.35 * Math.sin(u * Math.PI * 4) + 0.8 * Math.sin(u * Math.PI * 10 + 1.3);

  /* Lathe seams duplicate vertices (uv 0 vs 1); average their normals so no
     vertical shading line appears down the wrap. */
  function weldSeamNormals(geo) {
    const pos = geo.attributes.position;
    const nrm = geo.attributes.normal;
    const acc = new Map();
    const key = (i) =>
      `${Math.round(pos.getX(i) * 5e3)},${Math.round(pos.getY(i) * 5e3)},${Math.round(pos.getZ(i) * 5e3)}`;
    for (let i = 0; i < pos.count; i++) {
      const k = key(i);
      let a = acc.get(k);
      if (!a) acc.set(k, (a = [0, 0, 0]));
      a[0] += nrm.getX(i);
      a[1] += nrm.getY(i);
      a[2] += nrm.getZ(i);
    }
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      const a = acc.get(key(i));
      v.set(a[0], a[1], a[2]).normalize();
      nrm.setXYZ(i, v.x, v.y, v.z);
    }
  }

  function displace(geo, amp, ridgeAmp) {
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const n = new THREE.Vector3();
    const p = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      p.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      const u = uv.getX(i);
      const v = uv.getY(i);
      const env = Math.min(1, 5 * v * (1 - v));
      const lump = (fbm(p.x * 1.35, p.y * 1.35, p.z * 1.35) - 0.5) * 2;
      const ridge = Math.sin(v * Math.PI * 2 * 24 + bandWobble(u)) * ridgeAmp;
      const d = (lump * amp + ridge) * env;
      /* push along the radial direction (cheap normal for a lathe) */
      const rl = Math.hypot(p.x, p.z) || 1;
      n.set(p.x / rl, 0.35 * Math.sign(lump), p.z / rl).normalize();
      pos.setXYZ(i, p.x + n.x * d, p.y + n.y * d * 0.4, p.z + n.z * d);
    }
    geo.computeVertexNormals();
    weldSeamNormals(geo);
    return geo;
  }

  const lathePts = [];
  for (let i = 0; i <= 90; i++) {
    const { r, y } = prof(i / 90);
    lathePts.push(new THREE.Vector2(r, y));
  }
  const bodyGeo = displace(new THREE.LatheGeometry(lathePts, 140), 0.09, 0.024);
  const body = new THREE.Mesh(bodyGeo, paperMat);
  nest.add(body);

  /* Overlapping shingle layers: flush at the top so the seam disappears,
     flared and wavy at the free lower rim — the scalloped look of real
     paper nests. Each layer overhangs the one below it. */
  for (let k = 0; k < 4; k++) {
    const v0 = 0.3 + k * 0.145;
    const v1 = v0 + 0.16;
    const pts = [];
    const STEPS = 26;
    for (let i = 0; i <= STEPS; i++) {
      const tt = i / STEPS;
      const { r, y } = prof(v0 + (v1 - v0) * tt);
      pts.push(new THREE.Vector2(r + 0.006 + 0.055 * tt * tt, y));
    }
    const geo = new THREE.LatheGeometry(pts, 120);
    const pos = geo.attributes.position;
    const guv = geo.attributes.uv;
    const P = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      P.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      const u = guv.getX(i);
      const tt = guv.getY(i);
      const v = v0 + (v1 - v0) * tt;
      /* sample the texture's matching slice so the paper continues from the
         body instead of compressing all bands into each shingle */
      guv.setY(i, v);
      const w = 0.02 + 0.07 * tt; /* rougher toward the free edge */
      const rl = Math.hypot(P.x, P.z) || 1;
      const d =
        (fbm(P.x * 1.6, P.y * 1.6 + k * 7, P.z * 1.6) - 0.5) * 2 * w +
        Math.sin(v * Math.PI * 2 * 24 + bandWobble(u)) * 0.02; /* same strata as the body */
      pos.setXYZ(i, P.x + (P.x / rl) * d, P.y + d * 0.15, P.z + (P.z / rl) * d);
    }
    geo.computeVertexNormals();
    weldSeamNormals(geo);
    const m = paperMat.clone();
    m.color = new THREE.Color().setScalar(0.96 + (k % 3) * 0.03);
    m.side = THREE.DoubleSide;
    nest.add(new THREE.Mesh(geo, m));
  }

  /* ---- Entrance hole (lower front-right) with a paper collar ---- */
  const HOLE_U = 0.235; /* phi ≈ 85° → almost facing the camera */
  const HOLE_V = 0.745;
  const holePos = surfacePoint(HOLE_U, HOLE_V);
  const holeNrm = surfaceNormal(HOLE_U, HOLE_V);

  const holeQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), holeNrm);
  const cavity = new THREE.Mesh(
    new THREE.CircleGeometry(0.175, 28),
    new THREE.MeshStandardMaterial({ color: 0x070605, roughness: 1 })
  );
  cavity.position.copy(holePos).addScaledVector(holeNrm, 0.012);
  cavity.quaternion.copy(holeQuat);
  nest.add(cavity);

  const collarGeo = new THREE.TorusGeometry(0.175, 0.05, 10, 36);
  {
    /* roughen the collar so it reads as built-up paper, not a donut */
    const cp = collarGeo.attributes.position;
    for (let i = 0; i < cp.count; i++) {
      const x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i);
      const w = 1 + 0.3 * (fbm(x * 6, y * 6, z * 6) - 0.5);
      cp.setXYZ(i, x * w, y * w, z * (0.35 * w));
    }
    collarGeo.computeVertexNormals();
  }
  const collar = new THREE.Mesh(collarGeo, paperDark.clone());
  collar.material.color = new THREE.Color(0xa6a29a);
  collar.position.copy(holePos).addScaledVector(holeNrm, 0.005);
  collar.quaternion.copy(holeQuat);
  nest.add(collar);

  /* ---- Branch the nest hangs from ---- */
  const branchCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.4, 3.05, -0.5),
    new THREE.Vector3(-1.6, 2.62, -0.25),
    new THREE.Vector3(0, 2.3, 0),
    new THREE.Vector3(1.7, 2.12, 0.4),
  ]);
  const barkMaps = barkTexture();
  const branch = new THREE.Mesh(
    new THREE.TubeGeometry(branchCurve, 40, 0.088, 10, false),
    new THREE.MeshStandardMaterial({ map: barkMaps.map, bumpMap: barkMaps.bump, bumpScale: 0.5, roughness: 0.95 })
  );
  nest.add(branch);
  const twigCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.55, 2.63, -0.25),
    new THREE.Vector3(-1.2, 2.42, 0.12),
    new THREE.Vector3(-1.0, 2.1, 0.4),
  ]);
  const twig = new THREE.Mesh(new THREE.TubeGeometry(twigCurve, 16, 0.022, 8, false), branch.material);
  nest.add(twig);

  /* Paper collar wrapping the branch at the attachment point */
  const capPts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    capPts.push(new THREE.Vector2(0.07 + Math.sin(t * Math.PI * 0.5) * 0.40, 2.34 - t * 0.56));
  }
  const capMat = paperMat.clone();
  capMat.map = paperMaps.map.clone();
  capMat.map.repeat.set(3, 0.45);
  capMat.map.needsUpdate = true;
  capMat.bumpMap = paperMaps.bump.clone();
  capMat.bumpMap.repeat.set(3, 0.45);
  capMat.bumpMap.needsUpdate = true;
  capMat.color = new THREE.Color(0xc6c0b6);
  const cap = new THREE.Mesh(displace(new THREE.LatheGeometry(capPts.reverse(), 80), 0.055, 0.022), capMat);
  nest.add(cap);

  /* ---- Hornets ---- */
  const hornetWings = [];
  const hornetProto = buildHornetProto();
  const flyers = [];
  const crawlers = [];
  const FLYER_N = RM ? 0 : 9;
  const CRAWLER_N = 3;

  for (let i = 0; i < FLYER_N; i++) {
    const h = hornetProto.clone();
    h.visible = false;
    nest.add(h);
    flyers.push({
      obj: h,
      state: "inside",
      timer: 0.4 + rnd() * 3.5,
      t: 0,
      dur: 1,
      p0: new THREE.Vector3(),
      p1: new THREE.Vector3(),
      p2: new THREE.Vector3(),
      p3: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      target: new THREE.Vector3(),
      retarget: 0,
      roamLeft: 0,
      wob: rnd() * 100,
    });
  }
  for (let i = 0; i < CRAWLER_N; i++) {
    const h = hornetProto.clone();
    foldWings(h);
    nest.add(h);
    crawlers.push({
      obj: h,
      u: HOLE_U + (rnd() - 0.5) * 0.5,
      v: HOLE_V - 0.04 - rnd() * 0.18,
      du: 0,
      dv: 0,
      pause: rnd() * 2,
      wob: rnd() * 100,
    });
  }

  const holeLocal = holePos.clone().addScaledVector(holeNrm, 0.02);
  const holeOut = holeNrm.clone();

  function startExit(f) {
    f.state = "exit";
    f.t = 0;
    f.dur = 1.1 + rnd() * 0.5;
    f.p0.copy(holeLocal).addScaledVector(holeOut, -0.05);
    f.p1.copy(holeLocal).addScaledVector(holeOut, 0.25);
    f.p2.copy(holeLocal).addScaledVector(holeOut, 0.6).add(rndVec(0.35));
    f.p3.copy(holeLocal).addScaledVector(holeOut, 1.0).add(rndVec(0.75));
    f.p2.y = Math.max(-2.05, f.p2.y);
    f.p3.y = Math.max(-2.0, f.p3.y);
    f.obj.visible = true;
  }
  function startRoam(f) {
    f.state = "roam";
    f.roamLeft = 6 + rnd() * 12;
    f.pos.copy(f.p3);
    f.vel.set(0, 0, 0);
    f.retarget = 0;
  }
  function startReturn(f) {
    f.state = "return";
    f.t = 0;
    f.dur = 1.5 + rnd() * 0.6;
    f.p0.copy(f.pos);
    f.p1.copy(f.pos).addScaledVector(f.vel, 0.35);
    f.p2.copy(holeLocal).addScaledVector(holeOut, 0.5);
    f.p3.copy(holeLocal).addScaledVector(holeOut, -0.02);
  }
  function pickRoamTarget(f) {
    /* a point in a shell around the nest, biased toward the camera side */
    const a = rnd() * Math.PI * 2;
    const r = 1.9 + rnd() * 1.3;
    const y = -1.6 + rnd() * 3.4;
    f.target.set(Math.cos(a) * r, y, Math.abs(Math.sin(a)) * r * 0.9 + 0.15);
  }
  function rndVec(s) {
    return new THREE.Vector3((rnd() - 0.5) * 2 * s, (rnd() - 0.5) * 2 * s, (rnd() - 0.5) * 2 * s);
  }

  const bez = (() => {
    const ab = new THREE.Vector3(), bc = new THREE.Vector3(), cd = new THREE.Vector3();
    const q0 = new THREE.Vector3(), q1 = new THREE.Vector3();
    return (p0, p1, p2, p3, t, out) => {
      ab.lerpVectors(p0, p1, t);
      bc.lerpVectors(p1, p2, t);
      cd.lerpVectors(p2, p3, t);
      q0.lerpVectors(ab, bc, t);
      q1.lerpVectors(bc, cd, t);
      return out.lerpVectors(q0, q1, t);
    };
  })();

  const easeIO = (t) => t * t * (3 - 2 * t);
  const lookTmp = new THREE.Vector3();
  const prevTmp = new THREE.Vector3();

  function stepFlyer(f, dt, t) {
    const o = f.obj;
    switch (f.state) {
      case "inside":
        f.timer -= dt;
        if (f.timer <= 0) startExit(f);
        break;
      case "exit":
      case "return": {
        f.t += dt / f.dur;
        const tt = easeIO(Math.min(1, f.t));
        bez(f.p0, f.p1, f.p2, f.p3, tt, o.position);
        bez(f.p0, f.p1, f.p2, f.p3, Math.max(0, tt - 0.03), prevTmp);
        lookTmp.subVectors(o.position, prevTmp);
        if (lookTmp.lengthSq() > 1e-8) orient(o, lookTmp);
        if (f.t >= 1) {
          if (f.state === "exit") startRoam(f);
          else {
            f.state = "inside";
            f.timer = 1 + rnd() * 5;
            o.visible = false;
          }
        }
        break;
      }
      case "roam": {
        f.roamLeft -= dt;
        f.retarget -= dt;
        if (f.retarget <= 0) {
          pickRoamTarget(f);
          f.retarget = 1.6 + rnd() * 2.4;
        }
        lookTmp.subVectors(f.target, f.pos).normalize().multiplyScalar(0.75 + 0.3 * Math.sin(f.wob + t));
        f.vel.lerp(lookTmp, Math.min(1, dt * 2.2));
        f.pos.addScaledVector(f.vel, dt);
        /* keep out of the nest body */
        const rl = Math.hypot(f.pos.x, f.pos.z);
        const pr = prof(0.5 - f.pos.y / 4.4).r + 0.22;
        if (f.pos.y > -2.2 && f.pos.y < 2.3 && rl < pr) {
          f.pos.x *= pr / rl;
          f.pos.z *= pr / rl;
        }
        o.position.copy(f.pos);
        o.position.x += Math.sin(t * 9 + f.wob) * 0.02;
        o.position.y += Math.sin(t * 13.7 + f.wob * 2) * 0.025;
        if (f.vel.lengthSq() > 1e-6) orient(o, f.vel);
        if (f.roamLeft <= 0) startReturn(f);
        break;
      }
    }
  }

  const upTmp = new THREE.Vector3();
  const mTmp = new THREE.Matrix4();
  function orient(o, dir) {
    lookTmp.copy(dir).normalize();
    upTmp.set(0, 1, 0);
    mTmp.lookAt(new THREE.Vector3(0, 0, 0), lookTmp.clone().negate(), upTmp);
    o.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(mTmp), 0.25);
  }

  const crawlQ = new THREE.Quaternion();
  const crawlM = new THREE.Matrix4();
  function stepCrawler(c, dt, t) {
    if (!RM) {
      c.pause -= dt;
      if (c.pause <= 0) {
        c.du = (rnd() - 0.5) * 0.05;
        c.dv = (rnd() - 0.5) * 0.035;
        c.pause = 1.2 + rnd() * 2.8;
      }
      c.u += c.du * dt;
      c.v += c.dv * dt;
      c.v = Math.min(0.9, Math.max(0.62, c.v));
    }
    const p = surfacePoint(c.u, c.v);
    const n = surfaceNormal(c.u, c.v);
    c.obj.position.copy(p).addScaledVector(n, 0.085);
    /* face the walking direction, belly to the surface */
    const fwd = surfacePoint(c.u + (c.du >= 0 ? 0.01 : -0.01), c.v, new THREE.Vector3()).sub(p).normalize();
    crawlM.lookAt(new THREE.Vector3(0, 0, 0), fwd.negate(), n);
    crawlQ.setFromRotationMatrix(crawlM);
    c.obj.quaternion.slerp(crawlQ, RM ? 1 : 0.2);
  }

  /* ---- Interaction: drag to spin, gentle idle sway ---- */
  let userYaw = 0;
  let userPitch = 0;
  let parX = 0;
  let parY = 0;
  let down = null;

  const el = renderer.domElement;
  el.style.cursor = "grab";
  el.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
  });
  el.addEventListener("pointermove", (e) => {
    if (down) {
      userYaw += (e.movementX ?? e.clientX - down.x) * 0.005;
      userPitch = clamp(userPitch + (e.movementY ?? e.clientY - down.y) * 0.003, -0.22, 0.3);
      if (!("movementX" in e)) {
        down.x = e.clientX;
        down.y = e.clientY;
      }
      needsRender = true;
    } else if (!RM) {
      const r = el.getBoundingClientRect();
      parX = ((e.clientX - r.left) / r.width - 0.5) * 0.1;
      parY = ((e.clientY - r.top) / r.height - 0.5) * 0.06;
    }
  });
  const endDrag = () => {
    down = null;
    el.style.cursor = "grab";
  };
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
  el.addEventListener("pointerleave", () => {
    parX = parY = 0;
  });

  /* ---- Loop state (declared before resize(), which flags needsRender) ---- */
  let raf = 0;
  let last = performance.now();
  let t = 0;
  let needsRender = true;

  /* ---- Sizing ---- */
  function resize() {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const half = Math.tan((camera.fov * Math.PI) / 360);
    const dist = Math.max(3.35 / half, 2.6 / (half * camera.aspect)) + 0.5;
    camera.position.set(0.15, 0.1, dist);
    camera.lookAt(0, 0.12, 0);
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  resize();
  new ResizeObserver(resize).observe(host);

  /* ---- Loop ---- */
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    let sway = 0;
    let drift = 0;
    if (!RM) {
      sway = Math.sin(t * 0.7) * 0.014 + Math.sin(t * 0.23) * 0.008;
      drift = Math.sin(t * 0.1) * 0.1;
    }
    nest.rotation.y += (userYaw + parX * 2 + drift - nest.rotation.y) * Math.min(1, dt * 3.5);
    nest.rotation.x += (userPitch + parY - nest.rotation.x) * Math.min(1, dt * 3.5);
    nest.rotation.z = sway;

    for (const f of flyers) stepFlyer(f, dt, t);
    for (const c of crawlers) stepCrawler(c, dt, t);
    if (!RM) {
      for (const w of hornetWings) {
        w.mat.opacity = 0.26 + 0.14 * Math.sin(t * 150 + w.ph);
      }
    }

    if (!RM || needsRender) {
      renderer.render(scene, camera);
      needsRender = false;
    }
  }

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!entry.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(host);

  /* ======================================================================
     Builders
     ====================================================================== */

  function buildHornetProto() {
    const g = new THREE.Group();
    const dark = new THREE.MeshStandardMaterial({
      color: 0x33281c,
      roughness: 0.45,
      emissive: 0x0e0a06,
    });
    const abdomenMat = new THREE.MeshStandardMaterial({
      map: abdomenTexture(),
      roughness: 0.45,
      emissive: 0x140d05,
    });

    const thoraxGeo = new THREE.SphereGeometry(0.042, 10, 8);
    const headGeo = new THREE.SphereGeometry(0.028, 8, 7);
    const abdomenGeo = new THREE.SphereGeometry(0.045, 12, 10);
    abdomenGeo.rotateX(Math.PI / 2); /* poles onto z so texture bands ring the tail */

    const thorax = new THREE.Mesh(thoraxGeo, dark);
    thorax.scale.set(1, 0.9, 1.05);
    const head = new THREE.Mesh(headGeo, dark);
    head.position.z = 0.06;
    head.position.y = 0.004;
    const abdomen = new THREE.Mesh(abdomenGeo, abdomenMat);
    abdomen.position.z = -0.075;
    abdomen.scale.set(0.82, 0.78, 1.5);
    g.add(thorax, head, abdomen);

    const wingGeo = new THREE.PlaneGeometry(0.1, 0.042);
    for (const s of [-1, 1]) {
      const wm = new THREE.MeshBasicMaterial({
        color: 0xe4e4e4,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const wing = new THREE.Mesh(wingGeo, wm);
      wing.position.set(0.045 * s, 0.032, -0.02);
      wing.rotation.set(-0.25, 0, s * 0.55);
      wing.userData.wingSide = s;
      g.add(wing);
      hornetWings.push({ mat: wm, ph: rnd() * 7 });
    }
    g.scale.setScalar(1.22);
    return g;
  }

  /* Crawlers keep their wings folded along the body */
  function foldWings(h) {
    h.traverse((o) => {
      const s = o.userData && o.userData.wingSide;
      if (s) {
        o.rotation.set(-0.06, s * 0.28, s * 0.12);
        o.position.set(0.018 * s, 0.038, -0.055);
        o.scale.set(0.8, 0.55, 1);
      }
    });
  }

  function abdomenTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    g.fillStyle = "#b8872b";
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#1c140c";
    /* v runs pole-to-pole: bands become rings around the abdomen */
    g.fillRect(0, 0, 64, 12);
    g.fillRect(0, 20, 64, 10);
    g.fillRect(0, 38, 64, 9);
    g.fillRect(0, 54, 64, 10);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* Layered wavy paper bands + fiber grain. Returns { map, bump }. */
  function paperTexture() {
    const W = 1024, H = 1024;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const bump = document.createElement("canvas");
    bump.width = W;
    bump.height = H;
    const bg = bump.getContext("2d");

    g.fillStyle = "#9a8f80";
    g.fillRect(0, 0, W, H);
    bg.fillStyle = "#808080";
    bg.fillRect(0, 0, W, H);

    /* mostly light paper with occasional darker swirl bands */
    const palette = [
      "#cfc5b4", "#c3b9a8", "#b7ac9a", "#a89d8b", "#8f8474",
      "#c9bfae", "#7c7365", "#bdb3a1", "#998e7d", "#d2c8b7",
    ];
    const BANDS = 26;
    /* seamless wavy edge: only whole-cycle harmonics across the width */
    const edge = (x, k) =>
      Math.sin((x / W) * Math.PI * 2 * 3 + k * 1.7) * 9 +
      Math.sin((x / W) * Math.PI * 2 * 7 + k * 3.1) * 5 +
      Math.sin((x / W) * Math.PI * 2 * 13 + k * 0.6) * 2.5;

    /* strokes run past both edges so no cap lands on the wrap seam */
    const X0 = -48;
    const X1 = W + 48;
    let prevIdx = -1;
    for (let k = BANDS; k >= 0; k--) {
      const yBase = (k / BANDS) * H;
      let idx = Math.floor(rnd() * palette.length);
      if (idx === prevIdx) idx = (idx + 3) % palette.length;
      prevIdx = idx;
      g.fillStyle = palette[idx];
      g.beginPath();
      g.moveTo(X0, yBase + edge(X0, k));
      for (let x = X0; x <= X1; x += 16) g.lineTo(x, yBase + edge(x, k));
      g.lineTo(X1, H + 60);
      g.lineTo(X0, H + 60);
      g.closePath();
      g.fill();

      /* shadow under each band's edge (overlap illusion) + bump ridge */
      g.strokeStyle = "rgba(24,19,13,0.42)";
      g.lineWidth = 6;
      g.beginPath();
      for (let x = X0; x <= X1; x += 16) {
        const y = yBase + edge(x, k) + 3;
        x === X0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
      g.strokeStyle = "rgba(255,250,240,0.15)";
      g.lineWidth = 2;
      g.beginPath();
      for (let x = X0; x <= X1; x += 16) {
        const y = yBase + edge(x, k) - 2;
        x === X0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();

      bg.strokeStyle = "#d8d8d8";
      bg.lineWidth = 4;
      bg.beginPath();
      for (let x = X0; x <= X1; x += 16) {
        const y = yBase + edge(x, k);
        x === X0 ? bg.moveTo(x, y) : bg.lineTo(x, y);
      }
      bg.stroke();
      bg.strokeStyle = "#4a4a4a";
      bg.lineWidth = 5;
      bg.beginPath();
      for (let x = X0; x <= X1; x += 16) {
        const y = yBase + edge(x, k) + 4;
        x === X0 ? bg.moveTo(x, y) : bg.lineTo(x, y);
      }
      bg.stroke();
    }

    /* paper fibers: short horizontal strokes, drawn twice for wrap-safety */
    for (let i = 0; i < 1500; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const len = 8 + rnd() * 42;
      const a = 0.03 + rnd() * 0.07;
      g.strokeStyle = rnd() > 0.5 ? `rgba(255,248,236,${a})` : `rgba(28,22,14,${a})`;
      g.lineWidth = 1 + rnd();
      const dy = (rnd() - 0.5) * 4;
      for (const off of x + len > W ? [0, -W] : [0]) {
        g.beginPath();
        g.moveTo(x + off, y);
        g.lineTo(x + len + off, y + dy);
        g.stroke();
      }
    }

    /* large soft weathering patches, then grain */
    for (let i = 0; i < 26; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const r = 60 + rnd() * 160;
      const dark = rnd() > 0.5;
      const a = 0.04 + rnd() * 0.06;
      const grad = g.createRadialGradient(x, y, r * 0.1, x, y, r);
      grad.addColorStop(0, dark ? `rgba(34,27,18,${a})` : `rgba(255,248,235,${a * 0.8})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      /* draw twice so patches wrap across the texture seam */
      for (const off of [0, x + r > W ? -W : x - r < 0 ? W : 0]) {
        if (off === 0 && i % 2) continue;
        g.beginPath();
        g.arc(x + off, y, r, 0, Math.PI * 2);
        g.fill();
      }
    }
    grain(g, W, H, 9);
    grain(bg, W, H, 12);

    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 8;
    const bumpTex = new THREE.CanvasTexture(bump);
    bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;
    return { map, bump: bumpTex };
  }

  function barkTexture() {
    const W = 256, H = 256;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#4a3d30";
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      const y = rnd() * H;
      g.strokeStyle = rnd() > 0.4 ? `rgba(22,15,9,${0.2 + rnd() * 0.35})` : `rgba(112,94,72,${0.15 + rnd() * 0.25})`;
      g.lineWidth = 1 + rnd() * 2.5;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= W; x += 32) g.lineTo(x, y + Math.sin((x / W) * Math.PI * 2) * (rnd() * 6));
      g.stroke();
    }
    grain(g, W, H, 14);
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(2, 1);
    const bump = new THREE.CanvasTexture(c);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(2, 1);
    return { map, bump };
  }

  /* Cheap grain: one small noise tile, pattern-filled. */
  function grain(g, W, H, amp) {
    let grainTile = grain.tile;
    if (!grainTile) {
      grainTile = grain.tile = document.createElement("canvas");
      grainTile.width = grainTile.height = 128;
      const tg = grainTile.getContext("2d");
      const img = tg.createImageData(128, 128);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = 118 + rnd() * 20;
        d[i] = d[i + 1] = d[i + 2] = n;
        d[i + 3] = 255;
      }
      tg.putImageData(img, 0, 0);
    }
    g.save();
    g.globalCompositeOperation = "overlay";
    g.globalAlpha = Math.min(1, amp / 11);
    g.fillStyle = g.createPattern(grainTile, "repeat");
    g.fillRect(0, 0, W, H);
    g.restore();
  }

  function radialTexture(inner, outer, size = 256) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, size * 0.02, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function makeNoise3(s) {
    const hash = (x, y, z) => {
      let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177) + s;
      h = Math.imul(h ^ (h >>> 13), 1103515245);
      return (((h ^ (h >>> 16)) >>> 0) % 4096) / 4096;
    };
    const sm = (t) => t * t * (3 - 2 * t);
    return (x, y, z) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi);
      let v = 0;
      for (let dx = 0; dx <= 1; dx++)
        for (let dy = 0; dy <= 1; dy++)
          for (let dz = 0; dz <= 1; dz++)
            v +=
              hash(xi + dx, yi + dy, zi + dz) *
              (dx ? xf : 1 - xf) *
              (dy ? yf : 1 - yf) *
              (dz ? zf : 1 - zf);
      return v;
    };
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }
}
