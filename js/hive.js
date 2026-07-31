/* ==========================================================================
   HornetHacks — interactive voxel hive
   The site's navigation, rebuilt as a playful 8-bit object: every hex cell
   is rasterized into little glowing cubes, a neon gradient sweeps across
   the comb, labels are set in a pixel font, and two tiny voxel hornets
   orbit the hive.

   Interaction: hover/tap highlights a cell, click follows its link, drag
   spins the comb, and it gently sways while idle. Falls back to the static
   SVG honeycomb (.hive-fallback) when WebGL isn't available.
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

/* Decorative outer cells: glow = neon block, open = dark socket. */
const SQ3 = Math.sqrt(3);
const DECOR_CELLS = [
  { angle: 30, rMul: 2, type: "glow" },
  { angle: 90, rMul: 2, type: "solid" },
  { angle: 150, rMul: 2, type: "open" },
  { angle: 210, rMul: 2, type: "glow" },
  { angle: 330, rMul: 2, type: "solid" },
  { angle: 0, rMul: SQ3, type: "open" },
  { angle: 60, rMul: SQ3, type: "glow" },
  { angle: 180, rMul: SQ3, type: "open" },
  { angle: 240, rMul: SQ3, type: "solid" },
  { angle: 300, rMul: SQ3, type: "open" },
];

/* Geometry constants */
const R = 1; // hex circumradius
const DIST = SQ3 * R + 0.18; // center-to-center distance (dark seams between cells)
const VOX = 0.21; // voxel pitch (cube size = pitch → touching cubes)

/* Deterministic per-cube variation so the mosaic is stable across loads */
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
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

  /* ---- Lights: crisp voxel shading — bright top-left key, cool fill ---- */
  scene.add(new THREE.HemisphereLight(0x8a8aa8, 0x141018, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-3.5, 6, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xff9a5c, 0.5);
  fill.position.set(6, -3, 4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xb187ff, 0.65);
  rim.position.set(0, -5, -6);
  scene.add(rim);

  /* ---- Neon gradient halo behind the comb ---- */
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshBasicMaterial({
      map: gradientHaloTexture(),
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    })
  );
  halo.position.set(0, -0.3, -1.6);
  scene.add(halo);

  /* ---- Neon ramp: amber → orange → magenta → violet across the comb ---- */
  function cellTint(x, y, light = 0.5) {
    const t = clamp((x * 0.55 - y * 0.62) / 5.6 + 0.42, 0, 1);
    const h = ((42 - 104 * t) + 360) % 360;
    return { h: h / 360, s: 0.92, l: light };
  }

  const glowSpriteTex = radialTexture("rgba(255,255,255,0.85)", "rgba(255,255,255,0)");

  /* ---- Build the comb ---- */
  const hive = new THREE.Group();
  scene.add(hive);
  const navCells = [];
  const rayTargets = [];
  const glowPulses = [];

  const wallMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.68, metalness: 0 });
  const capBaseOpts = { vertexColors: true, roughness: 0.38, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0 };

  function buildCellBase(cx, cy) {
    const cell = new THREE.Group();
    cell.position.set(cx, cy, 0);
    const tint = cellTint(cx, cy);
    const cubes = [];
    /* three-deep voxel walls + dark floor, rasterized on the voxel grid */
    forHexGrid((gx, gy) => {
      const inOuter = pointInHex(gx, gy, R);
      const inInner = pointInHex(gx, gy, R * 0.7);
      if (inOuter && !inInner) {
        for (let layer = 0; layer < 3; layer++) {
          const sparkle = rnd() < 0.05;
          const l = tint.l + (rnd() - 0.5) * 0.09 + (sparkle ? 0.28 : 0) + layer * 0.02;
          cubes.push({ x: gx, y: gy, z: layer * VOX, s: VOX, hsl: [tint.h, sparkle ? 0.6 : tint.s, clamp(l, 0.1, 0.9)] });
        }
      } else if (inInner) {
        cubes.push({ x: gx, y: gy, z: 0, s: VOX, hsl: [tint.h, 0.35, 0.06 + rnd() * 0.03] });
      }
    });
    const walls = new THREE.Mesh(mergeCubes(cubes), wallMat);
    cell.add(walls);
    hive.add(cell);
    return { cell, walls, tint };
  }

  /* Pixel labels want the pixel font ready before we draw them */
  const labelFont = '400 54px "Press Start 2P", monospace';
  await Promise.race([
    document.fonts.load(labelFont).catch(() => {}),
    new Promise((res) => setTimeout(res, 1500)),
  ]);

  for (const nav of NAV_CELLS) {
    const a = (nav.angle * Math.PI) / 180;
    const cx = Math.cos(a) * DIST;
    const cy = Math.sin(a) * DIST;
    const { cell, walls, tint } = buildCellBase(cx, cy);

    /* glowing voxel cap plate — hover glow in the cell's own accent hue */
    const capMat = new THREE.MeshStandardMaterial(capBaseOpts);
    capMat.emissive = new THREE.Color().setHSL(tint.h, 0.9, 0.42);
    const capCubes = [];
    forHexGrid((gx, gy) => {
      if (pointInHex(gx, gy, R * 0.68)) {
        const l = (nav.primary ? 0.6 : 0.54) + (rnd() - 0.5) * 0.07;
        capCubes.push({ x: gx, y: gy, z: VOX * 1.6, s: VOX, hsl: [tint.h, tint.s, l] });
      }
    });
    const cap = new THREE.Mesh(mergeCubes(capCubes), capMat);
    cell.add(cap);

    /* pixel-font label + soft glow sprite that brightens on hover */
    const accent = new THREE.Color().setHSL(tint.h, 0.95, 0.62);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.72, 1.72),
      new THREE.MeshBasicMaterial({
        map: labelTexture(nav.label, accent.getStyle()),
        transparent: true,
        depthWrite: false,
      })
    );
    label.position.z = VOX * 2.4;
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 3.1),
      new THREE.MeshBasicMaterial({
        map: glowSpriteTex,
        color: accent,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    glow.position.z = VOX * 2.1;
    cell.add(label, glow);

    cell.userData = { nav, capMat, glowMat: glow.material, hover: 0 };
    for (const m of [walls, cap, label]) m.userData.cellRef = cell;
    navCells.push(cell);
    rayTargets.push(walls, cap, label);
  }

  /* Center cell wears a pixel-art hornet sprite */
  {
    const { cell, tint } = buildCellBase(0, 0);
    const capCubes = [];
    forHexGrid((gx, gy) => {
      if (pointInHex(gx, gy, R * 0.68)) {
        capCubes.push({ x: gx, y: gy, z: VOX * 1.6, s: VOX, hsl: [0.11, 0.9, 0.55 + (rnd() - 0.5) * 0.06] });
      }
    });
    cell.add(new THREE.Mesh(mergeCubes(capCubes), new THREE.MeshStandardMaterial(capBaseOpts)));
    const sprite = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({ map: hornetSpriteTexture(), transparent: true, depthWrite: false })
    );
    sprite.position.z = VOX * 2.4;
    cell.add(sprite);
  }

  /* Decorative cells */
  for (const d of DECOR_CELLS) {
    const a = (d.angle * Math.PI) / 180;
    const cx = Math.cos(a) * DIST * d.rMul;
    const cy = Math.sin(a) * DIST * d.rMul;
    const { cell, tint } = buildCellBase(cx, cy);
    if (d.type === "glow") {
      const cubes = [];
      forHexGrid((gx, gy) => {
        if (pointInHex(gx, gy, R * 0.68)) {
          cubes.push({ x: gx, y: gy, z: VOX * 0.8, s: VOX, hsl: [tint.h, 1, 0.6 + (rnd() - 0.5) * 0.08] });
        }
      });
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.3,
        emissive: new THREE.Color().setHSL(tint.h, 1, 0.5),
        emissiveIntensity: 0.55,
      });
      cell.add(new THREE.Mesh(mergeCubes(cubes), mat));
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.35, 2.35),
        new THREE.MeshBasicMaterial({
          map: glowSpriteTex,
          color: new THREE.Color().setHSL(tint.h, 1, 0.55),
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      glow.position.z = VOX * 1.6;
      cell.add(glow);
      glowPulses.push({ mat, glowMat: glow.material, ph: rnd() * 7 });
    } else if (d.type === "solid") {
      const cubes = [];
      forHexGrid((gx, gy) => {
        if (pointInHex(gx, gy, R * 0.68)) {
          cubes.push({ x: gx, y: gy, z: VOX * 1.4, s: VOX, hsl: [tint.h, 0.25, 0.24 + (rnd() - 0.5) * 0.05] });
        }
      });
      cell.add(new THREE.Mesh(mergeCubes(cubes), wallMat));
    }
    cell.position.z = (rnd() - 0.5) * 0.06;
  }

  /* ---- Two tiny voxel hornets orbiting the comb ---- */
  const hornets = [];
  if (!RM) {
    for (let i = 0; i < 2; i++) {
      const h = buildVoxelHornet();
      h.group.scale.setScalar(0.34);
      hive.add(h.group);
      hornets.push({ ...h, ph: i * Math.PI, dir: i === 0 ? 1 : -1 });
    }
  }

  /* ---- Pose ---- */
  const BASE_Y = 0.16;
  const BASE_X = -0.09;
  hive.rotation.set(BASE_X, BASE_Y, 0);

  /* ---- Interaction ---- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null;
  let down = null;
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
    const fitR = 4.95;
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
    }
    const k = 1 - Math.exp(-dt * 4.5);
    hive.rotation.y += (ty - hive.rotation.y) * k;
    hive.rotation.x += (tx - hive.rotation.x) * k;

    for (const cell of navCells) {
      const d = cell.userData;
      d.hover += ((cell === hovered ? 1 : 0) - d.hover) * Math.min(1, dt * 9);
      cell.position.z = d.hover * 0.4;
      const s = 1 + d.hover * 0.05;
      cell.scale.set(s, s, 1);
      d.capMat.emissiveIntensity = d.hover * 0.55;
      d.glowMat.opacity = d.hover * 0.38;
    }

    if (!RM) {
      for (const g of glowPulses) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + g.ph);
        g.mat.emissiveIntensity = 0.3 + pulse * 0.35;
        g.glowMat.opacity = 0.1 + pulse * 0.16;
      }
      for (const h of hornets) {
        const a = t * 0.45 * h.dir + h.ph;
        h.group.position.set(
          Math.cos(a) * 4.1,
          Math.sin(a * 1.7) * 1.9 + Math.sin(t * 7 + h.ph) * 0.08,
          1.1 + Math.sin(a * 0.9) * 0.7
        );
        h.group.rotation.y = -a * h.dir + (h.dir > 0 ? Math.PI : 0);
        h.group.rotation.z = Math.sin(t * 6 + h.ph) * 0.12;
        const flap = 0.7 + Math.abs(Math.sin(t * 26 + h.ph)) * 0.7;
        h.wingL.scale.y = flap;
        h.wingR.scale.y = flap;
      }
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

  /* ======================================================================
     Voxel builders & helpers
     ====================================================================== */

  /* Visit every voxel-grid point that could fall inside a cell hex */
  function forHexGrid(fn) {
    const n = Math.ceil(R / VOX) + 1;
    for (let ix = -n; ix <= n; ix++) {
      for (let iy = -n; iy <= n; iy++) {
        fn(ix * VOX, iy * VOX);
      }
    }
  }

  /* Flat-top hex (vertices at 0°, 60°, …) point-inside test */
  function pointInHex(px, py, r) {
    const a = r * Math.cos(Math.PI / 6);
    for (let k = 0; k < 6; k++) {
      const ang = Math.PI / 6 + (k * Math.PI) / 3;
      if (px * Math.cos(ang) + py * Math.sin(ang) > a) return false;
    }
    return true;
  }

  /* Merge axis-aligned cubes into one geometry with per-vertex colors */
  function mergeCubes(cubes) {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const bp = box.attributes.position.array;
    const bn = box.attributes.normal.array;
    const bi = box.index.array;
    const V = bp.length / 3;
    const pos = new Float32Array(cubes.length * bp.length);
    const nrm = new Float32Array(cubes.length * bp.length);
    const col = new Float32Array(cubes.length * bp.length);
    const idx = new Uint32Array(cubes.length * bi.length);
    const c = new THREE.Color();
    cubes.forEach((cube, ci) => {
      const sx = cube.sx || cube.s;
      const sy = cube.sy || cube.s;
      const sz = cube.sz || cube.s;
      c.setHSL(cube.hsl[0], cube.hsl[1], cube.hsl[2]);
      for (let v = 0; v < V; v++) {
        const o = (ci * V + v) * 3;
        pos[o] = bp[v * 3] * sx + cube.x;
        pos[o + 1] = bp[v * 3 + 1] * sy + cube.y;
        pos[o + 2] = bp[v * 3 + 2] * sz + cube.z;
        nrm[o] = bn[v * 3];
        nrm[o + 1] = bn[v * 3 + 1];
        nrm[o + 2] = bn[v * 3 + 2];
        col[o] = c.r;
        col[o + 1] = c.g;
        col[o + 2] = c.b;
      }
      for (let i = 0; i < bi.length; i++) {
        idx[ci * bi.length + i] = bi[i] + ci * V;
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    return geo;
  }

  /* A ~30-cube hornet: striped voxel body, dark head, flappy wings */
  function buildVoxelHornet() {
    const g = new THREE.Group();
    const u = 0.24;
    const cubes = [];
    const amber = [0.11, 0.95, 0.55];
    const dark = [0.08, 0.5, 0.08];
    /* abdomen stripes (x: tail → head), 2×2 columns */
    const cols = [dark, amber, dark, amber];
    cols.forEach((hsl, i) => {
      for (const y of [0, 1]) {
        for (const z of [0, 1]) {
          cubes.push({ x: i * u, y: y * u, z: z * u, s: u, hsl });
        }
      }
    });
    /* stinger */
    cubes.push({ x: -u, y: u * 0.5, z: u * 0.5, s: u * 0.6, hsl: dark });
    /* thorax */
    for (const y of [0, 1]) {
      for (const z of [0, 1]) {
        cubes.push({ x: 4 * u, y: y * u, z: z * u, s: u, hsl: [0.09, 0.65, 0.28] });
      }
    }
    /* head + eyes */
    for (const y of [0, 1]) {
      for (const z of [0, 1]) {
        cubes.push({ x: 5 * u, y: y * u, z: z * u, s: u * 0.92, hsl: dark });
      }
    }
    cubes.push({ x: 5.3 * u, y: u * 1.1, z: -u * 0.1, s: u * 0.34, hsl: [0.6, 0.9, 0.75] });
    cubes.push({ x: 5.3 * u, y: u * 1.1, z: u * 1.1, s: u * 0.34, hsl: [0.6, 0.9, 0.75] });
    const body = new THREE.Mesh(
      mergeCubes(cubes),
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 })
    );
    body.position.set(-2.5 * u, -u, -u * 0.5); /* roughly center the body */
    g.add(body);

    const wingMat = new THREE.MeshBasicMaterial({
      color: 0xdfe8ff,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const wingGeo = new THREE.PlaneGeometry(u * 2.6, u * 1.4);
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(u * 0.6, u * 1.4, -u * 0.7);
    wingL.rotation.set(0.9, 0, 0.25);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(u * 0.6, u * 1.4, u * 1.2);
    wingR.rotation.set(-0.9, 0, 0.25);
    g.add(wingL, wingR);
    return { group: g, wingL, wingR };
  }

  /* Neon pixel label: blurred color glow behind crisp white pixel text */
  function labelTexture(text, glowColor) {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    g.textAlign = "center";
    g.textBaseline = "middle";
    const upper = text.toUpperCase();
    let px = 54;
    do {
      g.font = `400 ${px}px "Press Start 2P", monospace`;
      if (g.measureText(upper).width <= 430) break;
      px -= 4;
    } while (px > 22);
    g.shadowColor = glowColor;
    g.shadowBlur = 16;
    g.fillStyle = glowColor;
    g.fillText(upper, size / 2, size / 2 + 4);
    g.fillText(upper, size / 2, size / 2 + 4);
    g.shadowBlur = 0;
    g.fillStyle = "#ffffff";
    g.fillText(upper, size / 2, size / 2 + 4);
    g.fillText(upper, size / 2, size / 2 + 4);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    tex.anisotropy = 4;
    return tex;
  }

  /* 16×16 pixel-art hornet, drawn crisp for the center cell */
  function hornetSpriteTexture() {
    const P = pixelHornetMap();
    const cellPx = 20;
    const c = document.createElement("canvas");
    c.width = c.height = 16 * cellPx;
    const g = c.getContext("2d");
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const col = P[y][x];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x * cellPx, y * cellPx, cellPx, cellPx);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    return tex;
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

  /* Big soft multi-color gradient blob for the backdrop halo */
  function gradientHaloTexture(size = 512) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const blobs = [
      ["rgba(245,166,35,0.55)", 0.32, 0.3, 0.42],
      ["rgba(255,45,146,0.4)", 0.72, 0.62, 0.4],
      ["rgba(138,99,255,0.35)", 0.34, 0.74, 0.38],
    ];
    for (const [col, bx, by, br] of blobs) {
      const grad = g.createRadialGradient(size * bx, size * by, 8, size * bx, size * by, size * br);
      grad.addColorStop(0, col);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(c);
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }
}

/* Shared 16×16 pixel hornet (also mirrored by assets/favicon.svg).
   Facing right: stinger left, wings up, antenna up-right, legs below. */
function pixelHornetMap() {
  const COLORS = {
    K: "#15100a", /* outline / stripes */
    A: "#f5a623", /* amber */
    W: "rgba(223,232,255,0.85)", /* wings */
    E: "#ffffff", /* eye */
  };
  const ROWS = [
    "................",
    "......WWW.......",
    ".....WWWWW....K.",
    ".....WWWWW...K..",
    "......WWW....K..",
    ".............K..",
    "...AKAAKKKKKK...",
    "..AAKAAKKKKKEK..",
    "KKAAKAAKKKKKKK..",
    "..AAKAAKKKKKK...",
    "...AKAA.K.K.....",
    "........K.K.....",
    "................",
    "................",
    "................",
    "................",
  ];
  return ROWS.map((row) => [...row].map((ch) => COLORS[ch] || null));
}
