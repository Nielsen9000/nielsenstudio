/* ==========================================================================
   hero3d.js — Three.js hero material (the ONE 3D moment)

   A single torus knot in a dark metal/glass material, lit so a burnt-orange
   rim light (matches --accent) rakes one edge against the near-black page.
   The visitor rotates it: OrbitControls drag, with a slow idle auto-spin and
   a subtle pointer parallax so it feels alive before it's touched.

   Bounded on purpose (Simon's first Three.js project): one geometry, three
   lights, damped controls, a single RAF loop, and a real teardown.

   Fallbacks (handled here + in CSS): reduced motion, no WebGL, small screens,
   or a failed CDN load all skip the canvas and reveal hero-fallback.jpg.
   ========================================================================== */

/**
 * @param {{ reducedMotion: boolean }} opts
 */
export async function initHero3D({ reducedMotion }) {
  const mount = document.querySelector("[data-hero-canvas]");
  if (!mount) return; // hero not on this page

  const isSmallScreen = window.matchMedia("(max-width: 48rem)").matches;

  // Decide the cheap fallbacks FIRST — before importing Three at all. Phones,
  // reduced-motion users and no-WebGL devices never download the 3D library.
  if (reducedMotion || isSmallScreen || !hasWebGL()) {
    mount.setAttribute("data-fallback", "");
    return;
  }

  // Load Three + OrbitControls on demand via the import map (see index.html).
  // Dynamic import naturally awaits readiness, so there's no fragile dependence
  // on script order / top-level-await timing. A CDN failure → static fallback.
  let THREE, OrbitControls, RoomEnvironment;
  try {
    THREE = await import("three");
    ({ OrbitControls } = await import("three/addons/controls/OrbitControls.js"));
    // Built-in studio environment → soft reflections for the metal, no asset.
    ({ RoomEnvironment } = await import(
      "three/addons/environments/RoomEnvironment.js"
    ));
  } catch (err) {
    console.warn("Three.js failed to load — hero uses static fallback.", err);
    mount.setAttribute("data-fallback", "");
    return;
  }

  startScene(mount, THREE, OrbitControls, RoomEnvironment);
}

/** Cheap WebGL capability probe — avoids mounting a broken canvas. */
function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Build and run the scene. Returns nothing; owns its own teardown via the
 * listeners it registers and the IntersectionObserver that pauses the loop
 * when the hero scrolls out of view.
 */
function startScene(mount, THREE, OrbitControls, RoomEnvironment) {
  // Palette pulled live from CSS tokens so JS and CSS never drift.
  const css = getComputedStyle(document.documentElement);
  const COLOR_BG = new THREE.Color(read(css, "--bg", "#0d0d0f"));
  const COLOR_ACCENT = new THREE.Color(read(css, "--accent", "#c8643c"));
  const COLOR_FILL = new THREE.Color(read(css, "--text", "#f4f2ec"));

  const sizes = { width: mount.clientWidth, height: mount.clientHeight };
  // Cap DPR low: the hero canvas is full-bleed, so every device pixel is shaded
  // with the PBR material EVERY frame. 1.5 stays crisp with antialias on and
  // roughly halves the fragment load vs 2 on retina — the main lag fix.
  const MAX_DPR = 1.5;
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

  // --- Renderer ----------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true, // page background shows through; canvas isn't a hard rectangle
    powerPreference: "high-performance",
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(dpr);
  // Explicitly clear to fully transparent so the smoke video behind the canvas
  // shows through everywhere the object isn't drawn (don't rely on the default).
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  mount.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  // --- Scene & camera ----------------------------------------------------
  const scene = new THREE.Scene();

  // Image-based lighting: a metallic surface is black with nothing to reflect.
  // PMREM-prefilter Three's built-in RoomEnvironment to give the material soft
  // studio reflections, so the form reads even before the rim light hits it.
  // (No external HDRI needed — this is generated at runtime.)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(
    38,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.set(0, 0, 6.4);
  scene.add(camera);

  // Push the subject into the right of the canvas so the headline keeps clean
  // dark space on the left. We render our canvas as the LEFT window of a wider
  // virtual frame; the centred, in-place-spinning object then lands right-of-
  // centre, undistorted, and never swings off-screen (the orbit is centred on
  // the object, not on screen centre). SUBJECT_OFFSET widens the virtual frame.
  const SUBJECT_OFFSET = 0.30; // 0 = centred · larger = further right
  // Drop the subject a touch below centre so its top clears the fixed header and
  // it sits more in the middle of the hero. Pure framing (negative vertical view
  // offset) — it shifts where the object lands without changing its size or the
  // orbit pivot, so drag-to-rotate still feels natural.
  const SUBJECT_DROP = 0.06; // fraction of canvas height to lower the subject
  function frameCamera() {
    const fullW = sizes.width * (1 + SUBJECT_OFFSET);
    const fullH = sizes.height;
    camera.aspect = fullW / fullH; // base frustum matches the wide virtual frame
    camera.setViewOffset(
      fullW,
      fullH,
      0,
      -sizes.height * SUBJECT_DROP,
      sizes.width,
      sizes.height
    );
    camera.updateProjectionMatrix();
  }
  frameCamera();

  // --- Geometry + material ----------------------------------------------
  // Torus knot reads as a crafted object without a model load. Dark metal, but
  // a lighter base + slightly higher roughness than pure chrome so the studio
  // environment paints visible form across the body, not just edge glints.
  const geometry = new THREE.TorusKnotGeometry(1.1, 0.36, 160, 24);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2a2a31"),
    metalness: 0.85,
    roughness: 0.38,
    envMapIntensity: 1.1, // let the RoomEnvironment reflections carry the form
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(0.79); // a touch more presence, still fully inside the hero
  scene.add(mesh);

  // --- Lighting ----------------------------------------------------------
  // The environment does most of the form-reading; these lights add direction:
  //   1) gentle ambient lift so deep shadows aren't crushed,
  //   2) a cool key from the upper-left for shape,
  //   3) the signature burnt-orange RIM from behind-right, raking one edge.
  const ambient = new THREE.AmbientLight(COLOR_FILL, 0.35);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(COLOR_FILL, 2.6);
  key.position.set(-4, 3, 4);
  scene.add(key);

  const rim = new THREE.DirectionalLight(COLOR_ACCENT, 9);
  rim.position.set(3.5, -1.5, -4); // behind + right → orange edge toward viewer
  scene.add(rim);

  // A second, softer orange kicker from the lower-left adds depth and makes the
  // accent read as a wrap of light rather than a single hard edge.
  const kicker = new THREE.DirectionalLight(COLOR_ACCENT, 3);
  kicker.position.set(-3, -2.5, 2);
  scene.add(kicker);

  scene.background = null; // keep --bg from the page behind the canvas
  void COLOR_BG; // reserved for an optional fog pass; kept for token parity

  // --- Controls ----------------------------------------------------------
  // Drag to rotate only. No zoom/pan — the hero shouldn't fly apart. The idle
  // spin lives on the mesh itself (below), NOT on controls.autoRotate, because
  // the pointer parallax used to fight autoRotate and cancel it out.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.6;

  // Pause the idle spin only while the user is actively dragging.
  let userInteracting = false;
  controls.addEventListener("start", () => (userInteracting = true));
  controls.addEventListener("end", () => (userInteracting = false));

  // --- Pointer parallax --------------------------------------------------
  // Gentle tilt of the object toward the cursor — applied to the MESH, so it
  // never interferes with the camera/controls.
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  function onPointerMove(e) {
    pointer.tx = e.clientX / window.innerWidth - 0.5;
    pointer.ty = e.clientY / window.innerHeight - 0.5;
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  // --- Resize ------------------------------------------------------------
  function onResize() {
    sizes.width = mount.clientWidth;
    sizes.height = mount.clientHeight;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    frameCamera(); // re-apply the right-of-centre framing at the new size
  }
  window.addEventListener("resize", onResize);

  // --- Loop (paused only when off-screen / tab hidden) -------------------
  // Renders continuously while the hero is in view so the object keeps spinning
  // at all times, including during scroll. (Kept cheap via the capped DPR and
  // trimmed geometry above.)
  let rafId = 0;
  let running = false;

  function tick() {
    rafId = requestAnimationFrame(tick);

    // Idle self-spin — continuous, in place, paused only during a drag.
    if (!userInteracting) mesh.rotation.y += 0.004;

    // Ease the pointer values and tilt the mesh toward the cursor (transform
    // only). rotation.y is owned by the spin above, so we set x/z, not y.
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    mesh.rotation.x = pointer.y * 0.35;
    mesh.rotation.z = pointer.x * 0.12;

    controls.update();
    renderer.render(scene, camera);
  }

  function play() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }
  function pause() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    // Leave a complete frame on the canvas so it never blanks while paused.
    // (Frame-based spin means no THREE.Clock delta to skip — it simply resumes
    // from the exact rotation it stopped at, with no freeze or jump.)
    if (!document.hidden) renderer.render(scene, camera);
  }

  // Only render while the hero is actually visible — saves the GPU on scroll.
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? play() : pause()),
    { threshold: 0.05 }
  );
  io.observe(mount);

  // Pause on hidden tab; resume when visible if the hero is in view.
  function onVisibility() {
    if (document.hidden) pause();
    else if (isInViewport(mount)) play();
  }
  document.addEventListener("visibilitychange", onVisibility);

  // Mark ready so CSS can fade the canvas in over the content reveal.
  mount.setAttribute("data-ready", "");

  // --- Teardown ----------------------------------------------------------
  // Not auto-called (the hero lives for the page's life), but exposed so a
  // future SPA-style transition can dispose cleanly. Frees GPU + listeners.
  function destroy() {
    pause();
    io.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    controls.dispose();
    geometry.dispose();
    material.dispose();
    envTexture.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
  mount.__heroDestroy = destroy; // discoverable handle for later cleanup
}

/* --- helpers ------------------------------------------------------------ */

function read(css, name, fallback) {
  const v = css.getPropertyValue(name).trim();
  return v || fallback;
}

function isInViewport(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}
