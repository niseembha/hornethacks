/* ==========================================================================
   HornetHacks — interactive 3D hive
   A realistic honeycomb rendered with Three.js. The six cells around the
   center are the site's navigation; decorative cells (open, honey-filled,
   capped brood) make it read as a real comb fragment.

   Interaction: hover/tap highlights a cell, click follows its link,
   drag spins the comb, and it gently sways while idle. Falls back to the
   static SVG honeycomb (.hive-fallback) when WebGL isn't available.
   ========================================================================== */
import * as THREE from "../assets/vendor/three.module.min.js";

const host = document.getElementById("hive-canvas-host");
const cfg = window.HORNETHACKS || {};
const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The six navigation cells, placed by angle around the center (90° = top). */
const NAV_CELLS = [
  { label: "Register", angle: 90, href: cfg.interestFormUrl || "#", external: true, primary: true },
  { label: "About", angle: 30, href: "about.html" },
  { label: "Schedule", angle: 330, href: "schedule.html" },
  { label: "FAQ", angle: 270, href: "faq.html" },
  { label: "Sponsors", angle: 210, href: "sponsors.html" },
  { label: "Contact", angle: 150, href: "contact.html" },
];

/* Decorative outer cells: rMul is in units of the cell-to-cell distance.
   Two positions are intentionally left empty for an organic silhouette. */
const SQ3 = Math.sqrt(3);
const DECOR_CELLS = [
  { angle: 30, rMul: 2, type: "honey" },
  { angle: 90, rMul: 2, type: "brood" },
  { angle: 150, rMul: 2, type: "open" },
  { angle: 210, rMul: 2, type: "honey" },
  { angle: 330, rMul: 2, type: "brood" },
  { angle: 0, rMul: SQ3, type: "open" },
  { angle: 60, rMul: SQ3, type: "honey" },
  { angle: 180, rMul: SQ3, type: "open" },
  { angle: 240, rMul: SQ3, type: "brood" },
  { angle: 300, rMul: SQ3, type: "open" },
];

/* Geometry constants */
const R = 1; // hex circumradius
const WALL = 0.6; // wall depth
const DIST = SQ3 * R + 0.07; // center-to-center distance (small gap)

/* Deterministic per-cell variation so the comb looks handmade but stable */
let seed = 20261010;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function showFallback() {
  document.querySelectorAll(".hive-fallback").forEach((el) => el.classList.add("show"));
  if (host) host.style.display = "none";
}

if (host && window.WebGLRenderingContext) {
  main().catch((err) => {
    console.error("Hive init failed:", err);
    showFallback();
  });
} else {
  showFallback();
}

async function main() {
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
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

  /* ---- Lights: warm key, soft warm fill, moving glint ---- */
  scene.add(new THREE.HemisphereLight(0xfff3da, 0x7a5218, 0.95));
  const key = new THREE.DirectionalLight(0xffffff, 1.55);
  key.position.set(4.5, 6, 7.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffd27a, 0.5);
  fill.position.set(-6, -2.5, 4);
  scene.add(fill);
  const glint = new THREE.PointLight(0xffc35c, 26, 0, 2);
  glint.position.set(2.6, 2.2, 4.4);
  scene.add(glint);

  /* ---- Soft amber halo behind the comb (grounds it on the dark page) ---- */
  const haloTex = radialTexture("rgba(245,166,35,0.5)", "rgba(245,166,35,0)");
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(13.5, 13.5),
    new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, opacity: 0.16, depthWrite: false })
  );
  halo.position.set(0, 0, -1.4);
  scene.add(halo);

  /* ---- Shared geometry ---- */
  const wallGeo = new THREE.ExtrudeGeometry(hexRing(R, R * 0.84), {
    depth: WALL,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  const capGeo = new THREE.ExtrudeGeometry(hexShape(R * 0.66), {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.09,
    bevelSegments: 3,
  });
  const floorGeo = new THREE.ShapeGeometry(hexShape(R * 0.85));
  const labelGeo = new THREE.PlaneGeometry(1.62, 1.62);

  /* ---- Materials ---- */
  const floorTex = radialTexture("#1f1204", "#4a2f10");
  floorTex.colorSpace = THREE.SRGBColorSpace;
  fitShapeUVs(floorGeo, R * 0.85, floorTex);
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.96 });

  const wallMatBase = new THREE.MeshPhysicalMaterial({
    color: 0xd6952e,
    roughness: 0.52,
    clearcoat: 0.3,
    clearcoatRoughness: 0.5,
  });
  const honeyMat = new THREE.MeshPhysicalMaterial({
    color: 0x9e5a02,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissive: 0x6b3400,
    emissiveIntensity: 0.4,
  });
  const broodMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8a054,
    roughness: 0.86,
    clearcoat: 0.05,
    clearcoatRoughness: 0.8,
  });

  /* ---- Build the comb ---- */
  const hive = new THREE.Group();
  scene.add(hive);
  const navCells = [];
  const rayTargets = [];

  function buildCell(x, y) {
    const cell = new THREE.Group();
    cell.position.set(x, y, 0);
    const wallMat = wallMatBase.clone();
    wallMat.color.offsetHSL((rnd() - 0.5) * 0.016, (rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.05);
    const walls = new THREE.Mesh(wallGeo, wallMat);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.z = 0.015;
    cell.add(walls, floor);
    hive.add(cell);
    return { cell, walls };
  }

  /* Navigation cells + center logo cell */
  const labelFont = '500 84px "Geist Mono", ui-monospace, monospace';
  await Promise.race([
    document.fonts.load(labelFont).catch(() => {}),
    new Promise((res) => setTimeout(res, 1500)),
  ]);

  for (const nav of NAV_CELLS) {
    const a = (nav.angle * Math.PI) / 180;
    const { cell, walls } = buildCell(Math.cos(a) * DIST, Math.sin(a) * DIST);

    const capMat = new THREE.MeshPhysicalMaterial({
      color: nav.primary ? 0xf2a819 : 0xf0bc55,
      roughness: 0.4,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      emissive: 0xffa200,
      emissiveIntensity: 0,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.z = WALL * 0.52 - 0.13;
    const label = new THREE.Mesh(
      labelGeo,
      new THREE.MeshBasicMaterial({
        map: labelTexture(nav.label, "#2a1b05"),
        transparent: true,
        depthWrite: false,
      })
    );
    label.position.z = cap.position.z + 0.17;
    cell.add(cap, label);

    cell.userData = { nav, capMat, hover: 0 };
    for (const m of [walls, cap, label]) m.userData.cellRef = cell;
    navCells.push(cell);
    rayTargets.push(walls, cap, label);
  }

  /* Center cell wears the hornet mark like a wax seal */
  const centerCap = (() => {
    const { cell } = buildCell(0, 0);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xf0b136,
      roughness: 0.42,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      emissive: 0xffa200,
      emissiveIntensity: 0.06,
    });
    const cap = new THREE.Mesh(capGeo, mat);
    cap.position.z = WALL * 0.52 - 0.13;
    cell.add(cap);
    logoTexture().then((tex) => {
      if (!tex) return;
      const logo = new THREE.Mesh(
        labelGeo,
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      logo.position.z = cap.position.z + 0.17;
      cell.add(logo);
    });
    return mat;
  })();

  /* Decorative cells */
  for (const d of DECOR_CELLS) {
    const a = (d.angle * Math.PI) / 180;
    const { cell, walls } = buildCell(Math.cos(a) * DIST * d.rMul, Math.sin(a) * DIST * d.rMul);
    walls.scale.z = 0.86 + rnd() * 0.22;
    if (d.type === "honey") {
      const cap = new THREE.Mesh(capGeo, honeyMat);
      cap.position.z = WALL * 0.3 - 0.13;
      cap.scale.z = 0.7;
      cell.add(cap);
    } else if (d.type === "brood") {
      const cap = new THREE.Mesh(capGeo, broodMat);
      cap.position.z = WALL * 0.62 - 0.13;
      cell.add(cap);
    }
    cell.position.z = (rnd() - 0.5) * 0.08;
  }

  /* Floating pollen motes for depth (skipped under reduced motion) */
  let motes = null;
  if (!RM) {
    const N = 34;
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (rnd() - 0.5) * 10.5;
      pos[i * 3 + 1] = (rnd() - 0.5) * 8.5;
      pos[i * 3 + 2] = -0.8 + rnd() * 3.2;
      vel[i] = 0.06 + rnd() * 0.12;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    motes = new THREE.Points(
      g,
      new THREE.PointsMaterial({
        color: 0xf0b03c,
        size: 0.055,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    motes.userData.vel = vel;
    scene.add(motes);
  }

  /* ---- Pose: slight 3/4 view at rest so the depth reads immediately ---- */
  const BASE_Y = 0.17;
  const BASE_X = -0.1;
  hive.rotation.set(BASE_X, BASE_Y, 0);

  /* ---- Interaction ---- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null;
  let down = null; // {x, y, t, moved}
  let userYaw = 0;
  let userPitch = 0;
  let parX = 0;
  let parY = 0;
  let lastInteract = 0;

  function toNDC(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    return ndc;
  }

  function pick(e) {
    raycaster.setFromCamera(toNDC(e), camera);
    const hit = raycaster.intersectObjects(rayTargets, false)[0];
    return hit ? hit.object.userData.cellRef : null;
  }

  const el = renderer.domElement;
  el.style.cursor = "grab";

  el.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
    el.setPointerCapture(e.pointerId);
    lastInteract = performance.now();
  });

  el.addEventListener("pointermove", (e) => {
    lastInteract = performance.now();
    if (down) {
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (down.moved || Math.hypot(dx, dy) > 7) {
        down.moved = true;
        userYaw = clamp(userYaw + (e.movementX ?? dx) * 0.0052, -0.62, 0.62);
        userPitch = clamp(userPitch + (e.movementY ?? dy) * 0.0042, -0.38, 0.38);
        if (!("movementX" in e)) {
          down.x = e.clientX;
          down.y = e.clientY;
        }
        hovered = null;
        el.style.cursor = "grabbing";
      }
      return;
    }
    hovered = pick(e);
    if (!RM) {
      parX = ndc.x * 0.13;
      parY = -ndc.y * 0.085;
    }
    el.style.cursor = hovered ? "pointer" : "grab";
  });

  el.addEventListener("pointerleave", () => {
    hovered = null;
    parX = parY = 0;
    el.style.cursor = "grab";
  });

  el.addEventListener("pointercancel", () => {
    down = null;
    el.style.cursor = "grab";
  });

  el.addEventListener("pointerup", (e) => {
    const wasTap = down && !down.moved && performance.now() - down.t < 700;
    down = null;
    el.style.cursor = "grab";
    if (!wasTap) return;
    const cell = pick(e);
    if (!cell) return;
    const { href, external } = cell.userData.nav;
    if (external) window.open(href, "_blank", "noopener");
    else window.location.href = href;
  });

  /* ---- Sizing ---- */
  function resize() {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fitR = 4.9; // cluster bounding radius + margin
    const half = Math.tan((camera.fov * Math.PI) / 360);
    camera.position.set(0, 0.5, Math.max(fitR / half, fitR / (half * camera.aspect)) + 0.4);
    camera.lookAt(0, 0.05, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);

  /* ---- Animation loop (paused while the hive is offscreen) ---- */
  let raf = 0;
  let last = performance.now();
  let t = 0;

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    /* User spin slowly relaxes back to center after a pause */
    if (!down && now - lastInteract > 2500) {
      const decay = Math.exp(-dt / 3.5);
      userYaw *= decay;
      userPitch *= decay;
    }

    let ty = BASE_Y + userYaw + parX;
    let tx = BASE_X + userPitch + parY;
    if (!RM) {
      ty += Math.sin(t * 0.22) * 0.05;
      tx += Math.cos(t * 0.165) * 0.03;
      hive.position.y = Math.sin(t * 0.55) * 0.05;
      glint.position.set(Math.cos(t * 0.3) * 3.2, 1.8 + Math.sin(t * 0.21) * 1.4, 4.4);
      centerCap.emissiveIntensity = 0.07 + (Math.sin(t * 1.3) + 1) * 0.04;
    }
    const k = 1 - Math.exp(-dt * 4.5);
    hive.rotation.y += (ty - hive.rotation.y) * k;
    hive.rotation.x += (tx - hive.rotation.x) * k;

    for (const cell of navCells) {
      const d = cell.userData;
      d.hover += ((cell === hovered ? 1 : 0) - d.hover) * Math.min(1, dt * 9);
      cell.position.z = d.hover * 0.34;
      const s = 1 + d.hover * 0.05;
      cell.scale.set(s, s, 1);
      d.capMat.emissiveIntensity = d.hover * 0.55;
    }

    if (motes) {
      const pos = motes.geometry.attributes.position;
      const vel = motes.userData.vel;
      for (let i = 0; i < vel.length; i++) {
        let y = pos.getY(i) + vel[i] * dt;
        let x = pos.getX(i) + Math.sin(t * 0.5 + i) * 0.0009;
        if (y > 4.4) y = -4.4;
        pos.setY(i, y);
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }

    renderer.render(scene, camera);
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

  /* ---- Helpers ---- */

  function hexShape(r) {
    const s = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }

  function hexRing(rOut, rIn) {
    const s = hexShape(rOut);
    const hole = new THREE.Path();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = Math.cos(a) * rIn;
      const y = Math.sin(a) * rIn;
      if (i === 0) hole.moveTo(x, y);
      else hole.lineTo(x, y);
    }
    hole.closePath();
    s.holes.push(hole);
    return s;
  }

  /* ShapeGeometry UVs equal local x/y — remap so the texture spans the hex */
  function fitShapeUVs(geo, r, tex) {
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1 / (2 * r), 1 / (2 * r));
    tex.offset.set(0.5, 0.5);
  }

  function radialTexture(inner, outer, size = 256) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, size * 0.04, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function labelTexture(text, color) {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = color;
    try {
      g.letterSpacing = "5px";
    } catch (e) {
      /* older browsers: no tracking, still fine */
    }
    let px = 84;
    const upper = text.toUpperCase();
    do {
      g.font = `500 ${px}px "Geist Mono", ui-monospace, monospace`;
      if (g.measureText(upper).width <= 410) break;
      px -= 4;
    } while (px > 40);
    g.fillText(upper, size / 2, size / 2 + 4);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  function logoTexture() {
    return new Promise((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => resolve(fallbackMark()), 2000);
      img.onload = () => {
        clearTimeout(timer);
        const size = 512;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const g = c.getContext("2d");
        g.drawImage(img, size * 0.14, size * 0.14, size * 0.72, size * 0.72);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(fallbackMark());
      };
      img.src = "assets/hornet-mark.svg";
    });

    function fallbackMark() {
      return labelTexture("HH", "#2a1b05");
    }
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }
}
