/**
 * ROAD UNLIMITED — THE NEXT HORIZON
 * Pinned Scroll Animation Controller & 3D Typography Physics
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const stage = document.getElementById('stage');
  const backdrop = document.querySelector('.plexus-backdrop');
  const canvas = document.getElementById('plexus-canvas');
  const progressBar = document.getElementById('progressBar');
  const scrollHelper = document.getElementById('scrollHelper');
  const scrollLabel = document.getElementById('scrollLabel');
  const tracker1 = document.getElementById('scene-tracker-1');
  const tracker2 = document.getElementById('scene-tracker-2');
  const statusText = document.getElementById('status-text');

  const scene1 = document.getElementById('scene-1');
  const eyebrow1 = document.getElementById('eyebrow-1');
  const subtext1 = document.getElementById('subtext-1');
  const headline1 = document.getElementById('headline-1');

  const scene2 = document.getElementById('scene-2');
  const eyebrow2 = document.getElementById('eyebrow-2');
  const subtext2 = document.getElementById('subtext-2');
  const headline2 = document.getElementById('headline-2');

  // --- Scroll State Variables ---
  let targetProgress = 0;   // 0 (Scene 1) to 1 (Scene 2)
  let currentProgress = 0;  // Smoothly interpolated
  const LERP_SPEED = 0.075; // Smooth inertia damping factor
  const SENSITIVITY = 0.00095; // Wheel sensitivity

  // --- Letter Scattering Physics Profile ---
  let scene1Chars = [];
  let scene2Chars = [];

  // Deterministic seeded random for consistent beauty
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Dynamically prepare headline text into 3D character spans
  function prepareHeadline(element, defaultText) {
    const raw = (element.getAttribute('data-text') || defaultText || element.textContent).trim();
    // Allow explicit line breaks with pipe '|', otherwise keep as single editorial line
    const lines = raw.includes('|') ? raw.split('|') : [raw];

    element.innerHTML = '';

    lines.forEach(lineText => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'line';

      const lineWords = lineText.trim().split(/\s+/);
      lineWords.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';

        for (const char of word) {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = char;
          wordSpan.appendChild(charSpan);
        }

        lineDiv.appendChild(wordSpan);

        if (wIdx < lineWords.length - 1) {
          const spaceSpan = document.createElement('span');
          spaceSpan.className = 'space';
          spaceSpan.innerHTML = '&nbsp;';
          lineDiv.appendChild(spaceSpan);
        }
      });

      element.appendChild(lineDiv);
    });
  }

  // Initialize Scene 1 Letter Particles for 3D Aerodynamic Scatter
  function setupScene1Letters() {
    prepareHeadline(headline1, 'ROAD UNLIMITED');
    const chars = headline1.querySelectorAll('.char');
    const total = chars.length;
    const center = (total - 1) / 2;

    scene1Chars = Array.from(chars).map((char, index) => {
      const seed1 = index * 13.37;
      const seed2 = index * 42.19;
      const seed3 = index * 89.64;

      // Distance from center for radial shockwave propagation
      const distFromCenter = (index - center) / (center || 1);

      // Stagger wave: letters disperse in a graceful outward wave
      const waveDelay = (Math.abs(distFromCenter) * 0.10) + ((index / total) * 0.06);
      const startP = 0.02 + waveDelay;
      const endP = Math.min(0.88, startP + 0.50 + seededRandom(seed1) * 0.15);

      char.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)';
      char.style.opacity = '1';
      char.style.filter = 'blur(0px)';

      return {
        el: char,
        // High negative Y to launch upwards into upper atmosphere
        targetY: -600 - seededRandom(seed1) * 600,
        // Lateral scatter with organic spread
        targetX: distFromCenter * 320 + (seededRandom(seed2) - 0.5) * 360,
        curlX: (seededRandom(seed3) - 0.5) * 160,
        // Z depth dispersion
        targetZ: (seededRandom(seed3) - 0.5) * 650,
        // Smooth 3D tumbling rotations
        rotX: (seededRandom(seed1) - 0.5) * 360,
        rotY: (seededRandom(seed2) - 0.5) * 440,
        rotZ: (distFromCenter * 70) + (seededRandom(seed3) - 0.5) * 130,
        targetScale: 0.45 + seededRandom(seed1) * 0.8,
        maxBlur: 14 + seededRandom(seed2) * 8,
        startP: startP,
        endP: endP
      };
    });
  }

  // Initialize Scene 2 Letters for Cinematic Magnetic Entry
  function setupScene2Letters() {
    prepareHeadline(headline2, 'THE NEXT HORIZON');
    const chars = headline2.querySelectorAll('.char');
    const total = chars.length;

    scene2Chars = Array.from(chars).map((char, index) => {
      const seed = index * 17.81;
      const initialY = 40 + seededRandom(seed) * 30;
      const initialZ = -100 - seededRandom(seed) * 80;
      const initialRotX = 30 + seededRandom(seed) * 20;

      // Stagger arrival wave from left to right
      const staggerDelay = (index / total) * 0.20;
      const startP = 0.40 + staggerDelay;
      const endP = Math.min(0.96, startP + 0.38);

      char.style.transform = `translate3d(0, ${initialY}px, ${initialZ}px) rotateX(${initialRotX}deg) scale(0.95)`;
      char.style.opacity = '0';
      char.style.filter = 'blur(12px)';

      return {
        el: char,
        initialY: initialY,
        initialZ: initialZ,
        initialRotX: initialRotX,
        startP: startP,
        endP: endP
      };
    });
  }

  // --- Rendering Loop: Interpolate Transforms & Visuals ---
  function updateScenes(p) {
    // Container Level Visibility Isolation
    if (p <= 0.01) {
      scene1.style.visibility = 'visible';
      scene1.style.opacity = '1';
      scene2.style.visibility = 'hidden';
      scene2.style.opacity = '0';
    } else if (p >= 0.94) {
      scene1.style.visibility = 'hidden';
      scene1.style.opacity = '0';
      scene2.style.visibility = 'visible';
      scene2.style.opacity = '1';
    } else {
      scene1.style.visibility = 'visible';
      scene2.style.visibility = 'visible';
      scene1.style.opacity = Math.max(0, 1 - (p - 0.22) / 0.55).toFixed(3);
      scene2.style.opacity = Math.min(1, Math.max(0, (p - 0.32) / 0.55)).toFixed(3);
    }

    // 1. Scene 1 Letter Scatter Physics (Kinetic burst into graceful aerodynamic float)
    scene1Chars.forEach(item => {
      let localP = (p - item.startP) / (item.endP - item.startP);
      localP = Math.max(0, Math.min(1, localP));

      if (localP <= 0) {
        item.el.style.transform = 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)';
        item.el.style.opacity = '1';
        item.el.style.filter = 'blur(0px)';
      } else {
        // Quintic ease-out for explosive kinetic acceleration then soft floating drift
        const easeP = 1 - Math.pow(1 - localP, 3.2);

        const curX = item.targetX * easeP + Math.sin(localP * Math.PI) * item.curlX;
        const curY = item.targetY * easeP;
        const curZ = item.targetZ * easeP;
        const curRotX = item.rotX * easeP;
        const curRotY = item.rotY * easeP;
        const curRotZ = item.rotZ * easeP;
        const curScale = 1 + (item.targetScale - 1) * easeP;
        const curOpacity = Math.pow(1 - localP, 1.8);
        const curBlur = item.maxBlur * Math.pow(localP, 1.2);

        item.el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, ${curZ.toFixed(2)}px) rotateX(${curRotX.toFixed(2)}deg) rotateY(${curRotY.toFixed(2)}deg) rotateZ(${curRotZ.toFixed(2)}deg) scale(${curScale.toFixed(2)})`;
        item.el.style.opacity = curOpacity.toFixed(3);
        item.el.style.filter = `blur(${curBlur.toFixed(2)}px)`;
      }
    });

    // Scene 1 Eyebrow & Subtext fade away smoothly
    const fade1 = Math.max(0, 1 - p * 3.5);
    eyebrow1.style.opacity = fade1.toFixed(3);
    eyebrow1.style.transform = `translateY(${-p * 55}px)`;
    subtext1.style.opacity = fade1.toFixed(3);
    subtext1.style.transform = `translateY(${-p * 45}px)`;

    // 2. Scene 2 Entrance (Magnetic convergence into razor focus)
    const fade2Eyebrow = Math.max(0, Math.min(1, (p - 0.42) * 3.2));
    eyebrow2.style.opacity = fade2Eyebrow.toFixed(3);
    eyebrow2.style.transform = `translateY(${(1 - fade2Eyebrow) * 20}px)`;

    const fade2Subtext = Math.max(0, Math.min(1, (p - 0.62) * 3.2));
    subtext2.style.opacity = fade2Subtext.toFixed(3);
    subtext2.style.transform = `translateY(${(1 - fade2Subtext) * 20}px)`;

    // Scene 2 Characters
    scene2Chars.forEach(item => {
      let localP = (p - item.startP) / (item.endP - item.startP);
      localP = Math.max(0, Math.min(1, localP));

      // Quartic ease-out for silky deceleration into resting lock
      const easeP = 1 - Math.pow(1 - localP, 4.0);

      if (localP <= 0) {
        item.el.style.transform = `translate3d(0, ${item.initialY}px, ${item.initialZ}px) rotateX(${item.initialRotX}deg) scale(0.95)`;
        item.el.style.opacity = '0';
        item.el.style.filter = 'blur(12px)';
      } else if (localP >= 1) {
        item.el.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) scale(1)';
        item.el.style.opacity = '1';
        item.el.style.filter = 'blur(0px)';
      } else {
        const curY = item.initialY * (1 - easeP);
        const curZ = item.initialZ * (1 - easeP);
        const curRotX = item.initialRotX * (1 - easeP);
        const curBlur = 12 * (1 - easeP);
        const curOpacity = Math.pow(easeP, 1.2);
        const curScale = 0.95 + 0.05 * easeP;

        item.el.style.transform = `translate3d(0, ${curY.toFixed(2)}px, ${curZ.toFixed(2)}px) rotateX(${curRotX.toFixed(2)}deg) scale(${curScale.toFixed(2)})`;
        item.el.style.opacity = curOpacity.toFixed(3);
        item.el.style.filter = `blur(${curBlur.toFixed(2)}px)`;
      }
    });

    // 3. HUD and Trackers
    progressBar.style.transform = `scaleX(${p})`;

    if (backdrop) {
      backdrop.style.transform = `translate3d(0, ${(-p * 50).toFixed(1)}px, 0) scale(${(1 + p * 0.04).toFixed(3)})`;
      backdrop.style.opacity = (0.28 + p * 0.12).toFixed(3);
    }

    if (p < 0.45) {
      tracker1.classList.add('active');
      tracker2.classList.remove('active');
      statusText.textContent = isCarLoaded ? 'SCENE 01 // ROAD UNLIMITED' : statusText.textContent;
      scrollLabel.textContent = 'SCROLL TO EXPLORE';
    } else if (p >= 0.45 && p < 0.85) {
      tracker1.classList.remove('active');
      tracker2.classList.add('active');
      statusText.textContent = isCarLoaded ? 'TRANSITION // HORIZON DETECTED' : statusText.textContent;
      scrollLabel.textContent = 'RELEASE HORIZON';
    } else {
      tracker1.classList.remove('active');
      tracker2.classList.add('active');
      statusText.textContent = isCarLoaded ? 'SCENE 02 // THE NEXT HORIZON' : statusText.textContent;
      scrollLabel.textContent = 'SCROLL UP TO RECONSTRUCT';
    }
  }

  // --- 3D WebGL Vehicle Engine (Mercedes-Benz GLS 580) ---
  const webglCanvas = document.getElementById('webgl-canvas');
  let threeScene, threeCamera, threeRenderer;
  let carGroup = null;
  let groundShadow = null;
  let keyLight, rimLight, fillLight, sweepLight;
  let isCarLoaded = false;
  let normMouse = { x: 0, y: 0 };
  let smoothMouse = { x: 0, y: 0 };

  function initThree() {
    if (!window.THREE) return;

    // 1. Scene & Camera
    threeScene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    threeCamera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    threeCamera.position.set(0, 0.75, 8.2);

    // 2. WebGL Renderer
    threeRenderer = new THREE.WebGLRenderer({
      canvas: webglCanvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    threeRenderer.toneMappingExposure = 1.35;
    threeRenderer.outputEncoding = THREE.sRGBEncoding;
    threeRenderer.shadowMap.enabled = true;
    threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. Automotive Studio Lighting Rig
    const ambient = new THREE.AmbientLight(0xdce7f3, 0.9);
    threeScene.add(ambient);

    keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(6, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    threeScene.add(keyLight);

    rimLight = new THREE.DirectionalLight(0x7dd3fc, 3.8);
    rimLight.position.set(-7, 6, -6);
    threeScene.add(rimLight);

    fillLight = new THREE.DirectionalLight(0xa5b4fc, 1.4);
    fillLight.position.set(0, -1, 7);
    threeScene.add(fillLight);

    sweepLight = new THREE.PointLight(0xffffff, 3.2, 25);
    sweepLight.position.set(0, 3.5, 4);
    threeScene.add(sweepLight);

    // 4. Ground Contact Shadow
    createGroundShadow();

    // 5. Load GLB Model
    loadMercedesModel();

    window.addEventListener('resize', onThreeResize);
  }

  let carRawLength = 14.14;

  function createGroundShadow() {
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.55)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(shadowCanvas);
    const geo = new THREE.PlaneGeometry(10.5, 10.5);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85
    });

    groundShadow = new THREE.Mesh(geo, mat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -1.26;
    threeScene.add(groundShadow);
  }

  function loadMercedesModel() {
    if (!THREE.GLTFLoader) {
      console.warn('GLTFLoader not found');
      return;
    }

    statusText.textContent = 'LOADING GLS 580 // 0%';
    const loader = new THREE.GLTFLoader();

    loader.load(
      'assets/mercedes_gls_580.glb',
      function (gltf) {
        gltf.scene.updateMatrixWorld(true);

        // Hide export turntable cylinders and enhance shaders
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            if (child.name.toLowerCase().includes('cylinder')) {
              child.visible = false;
            } else {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = Math.min(child.material.roughness, 0.28);
                child.material.metalness = Math.max(child.material.metalness, 0.35);
                child.material.needsUpdate = true;
              }
            }
          }
        });

        // Isolate the Mercedes root object
        const mercedes = gltf.scene.getObjectByName('Mercedes') || gltf.scene;
        mercedes.updateMatrixWorld(true);

        // Compute bounds accurately on the Mercedes object
        const box = new THREE.Box3().setFromObject(mercedes);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        carRawLength = size.z || 14.14;

        // Center Mercedes so bottom of tires sits flat at y = 0
        mercedes.position.x = -center.x;
        mercedes.position.y = -box.min.y;
        mercedes.position.z = -center.z;

        carGroup = new THREE.Group();
        carGroup.add(mercedes);

        // Calculate commanding hero scale
        const w = window.innerWidth;
        const targetVisualLength = w < 768 ? 4.5 : 6.0;
        const scale = targetVisualLength / carRawLength;
        carGroup.scale.setScalar(scale);

        // Position car group cleanly below the title
        carGroup.position.set(0, -1.25, 0);

        threeScene.add(carGroup);
        isCarLoaded = true;

        statusText.textContent = 'SCENE 01 // ROAD UNLIMITED';
      },
      function (xhr) {
        if (xhr.lengthComputable || xhr.total) {
          const total = xhr.total || 11577264;
          const percent = Math.min(99, Math.round((xhr.loaded / total) * 100));
          statusText.textContent = `LOADING GLS 580 // ${percent}%`;
        }
      },
      function (error) {
        console.error('Error loading GLS 580 model:', error);
        statusText.textContent = 'READY // MODEL OFFLINE';
      }
    );
  }

  // --- 3D Vehicle Interactive Joystick Controller (Bottom Right) ---
  const joystickContainer = document.getElementById('joystickContainer');
  const joystickBase = document.getElementById('joystickBase');
  const joystickStick = document.getElementById('joystickStick');

  let isJoystickActive = false;
  let joystickPos = { x: 0, y: 0 };       // Pixel offset of the puck
  let joystickNorm = { x: 0, y: 0 };      // Normalized vector (-1 .. 1)
  let joystickYawAccum = 0;              // Accumulated orbital rotation
  let joystickPitch = 0;                 // Accumulated pitch tilt
  const MAX_STICK_RADIUS = 30;           // Max travel radius in px

  function initJoystick() {
    if (!joystickBase || !joystickStick) return;

    function handlePointerStart(clientX, clientY) {
      isJoystickActive = true;
      joystickBase.classList.add('active');
      updateStickPosition(clientX, clientY);
    }

    function handlePointerMove(clientX, clientY) {
      if (!isJoystickActive) return;
      updateStickPosition(clientX, clientY);
    }

    function handlePointerEnd() {
      if (!isJoystickActive) return;
      isJoystickActive = false;
      joystickBase.classList.remove('active');
      joystickNorm.x = 0;
      joystickNorm.y = 0;
    }

    function updateStickPosition(clientX, clientY) {
      const rect = joystickBase.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxR = window.innerWidth < 768 ? 24 : MAX_STICK_RADIUS;

      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }

      joystickPos.x = dx;
      joystickPos.y = dy;
      joystickNorm.x = dx / maxR;
      joystickNorm.y = dy / maxR;

      joystickStick.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    }

    // Pointer Events (Desktop Mouse + Mobile / Tablet Touch)
    joystickBase.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      try { joystickBase.setPointerCapture(e.pointerId); } catch (_) {}
      handlePointerStart(e.clientX, e.clientY);
    });

    window.addEventListener('pointermove', (e) => {
      if (!isJoystickActive) return;
      e.preventDefault();
      handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener('pointerup', (e) => {
      if (!isJoystickActive) return;
      try { joystickBase.releasePointerCapture(e.pointerId); } catch (_) {}
      handlePointerEnd();
    });

    window.addEventListener('pointercancel', (e) => {
      if (!isJoystickActive) return;
      handlePointerEnd();
    });
  }

  function onThreeResize() {
    if (!threeCamera || !threeRenderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;

    threeCamera.aspect = aspect;

    // Responsive camera depth & field of view for portrait phones, landscape tablets, and widescreen
    if (aspect < 0.85) {
      // Portrait smartphone
      threeCamera.fov = 44;
      threeCamera.position.z = 8.6;
    } else if (w < 1024) {
      // Tablets
      threeCamera.fov = 40;
      threeCamera.position.z = 8.0;
    } else {
      // Desktop widescreen
      threeCamera.fov = 38;
      threeCamera.position.z = 7.8;
    }

    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(w, h);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (carGroup && isCarLoaded) {
      // Responsive car visual scale: fits comfortably without clipping
      const targetVisualLength = w < 480 ? 3.8 : (w < 768 ? 4.4 : (w < 1024 ? 5.2 : 6.0));
      const scale = targetVisualLength / carRawLength;
      carGroup.scale.setScalar(scale);

      // Adaptive ground height for portrait vs landscape
      const groundY = aspect < 0.85 ? -1.05 : -1.25;
      carGroup.position.y = groundY;
      if (groundShadow) groundShadow.position.y = groundY - 0.01;
    }
  }

  function render3D(p, dt) {
    if (!threeRenderer || !threeScene || !threeCamera) return;

    const dtSafe = dt || 0.016;

    // Smooth exponential mouse parallax
    const mouseSmoothRate = 1 - Math.exp(-8.0 * dtSafe);
    smoothMouse.x += (normMouse.x - smoothMouse.x) * mouseSmoothRate;
    smoothMouse.y += (normMouse.y - smoothMouse.y) * mouseSmoothRate;

    // Update joystick physics and spring-back mechanics
    if (isJoystickActive) {
      // Continuous steering rotation when stick held
      joystickYawAccum += joystickNorm.x * 3.4 * dtSafe;
      // Target pitch proportional to vertical stick deflection
      const targetPitch = -joystickNorm.y * 0.38;
      joystickPitch += (targetPitch - joystickPitch) * (1 - Math.exp(-12 * dtSafe));
    } else {
      // Smooth spring-back to center when released
      const returnRate = 1 - Math.exp(-18 * dtSafe);
      joystickPos.x += (0 - joystickPos.x) * returnRate;
      joystickPos.y += (0 - joystickPos.y) * returnRate;
      joystickStick.style.transform = `translate3d(${joystickPos.x.toFixed(1)}px, ${joystickPos.y.toFixed(1)}px, 0)`;

      // Pitch smoothly springs back to zero
      joystickPitch += (0 - joystickPitch) * (1 - Math.exp(-9 * dtSafe));

      // Re-center joystick yaw gently back to timeline alignment
      joystickYawAccum += (0 - joystickYawAccum) * (1 - Math.exp(-2.8 * dtSafe));
    }

    if (carGroup && isCarLoaded) {
      // Cinematic S-Curve Hermite interpolation
      const smoothP = p * p * (3 - 2 * p);

      // Chassis Yaw: -0.48 rad (hero front 3/4) -> 1.18 rad (horizon stance) + joystick orbital angle
      const baseRotY = -0.48 + smoothP * 1.66;

      // Chassis Pitch: Simulated acceleration squat + joystick vertical tilt
      const squat = Math.sin(smoothP * Math.PI) * 0.016;
      const baseRotX = 0.035 - squat;

      // Chassis Roll: Dynamic body lean into sweeping turn + joystick lateral lean
      const bodyRoll = -Math.sin(smoothP * Math.PI) * 0.014;

      // Combined 3D Rotations
      carGroup.rotation.y = baseRotY + joystickYawAccum + smoothMouse.x * 0.10;
      carGroup.rotation.x = baseRotX + joystickPitch - smoothMouse.y * 0.05;
      carGroup.rotation.z = bodyRoll + (joystickNorm.x * -0.02) + smoothMouse.x * -0.015;

      // Road path trajectory
      carGroup.position.x = Math.sin(smoothP * Math.PI) * 0.40;
      carGroup.position.z = Math.sin(smoothP * Math.PI * 0.5) * -0.58;

      // Sync ground shadow with dynamic breathing
      if (groundShadow) {
        groundShadow.position.x = carGroup.position.x;
        groundShadow.position.z = carGroup.position.z;
        groundShadow.material.opacity = 0.85 + squat * 2.2;
      }

      // Studio specular highlight glides smoothly across the metallic curves
      sweepLight.position.x = -6.5 + smoothP * 14.5;
      sweepLight.position.y = 3.2 + Math.sin(smoothP * Math.PI) * 0.8;
      sweepLight.position.z = 3.6 - Math.abs(smoothP - 0.5) * 2.2;
      rimLight.intensity = 3.5 + Math.sin(smoothP * Math.PI) * 1.0;

      // Crane camera tracking path
      threeCamera.position.x = smoothMouse.x * 0.25;
      threeCamera.position.y = 0.95 + smoothP * 0.35 + smoothMouse.y * 0.12;
      threeCamera.position.z = 7.8 - Math.sin(smoothP * Math.PI) * 0.32;
      threeCamera.lookAt(carGroup.position.x * 0.25, -0.35, 0);
    }

    threeRenderer.render(threeScene, threeCamera);
  }

  // --- Main Animation Engine (RAF with Frame-Rate Independence) ---
  let lastTime = performance.now();
  let wheelVelocity = 0;

  function tick(now) {
    const timeNow = now || performance.now();
    const dt = Math.min((timeNow - lastTime) / 1000, 0.1) || 0.016;
    lastTime = timeNow;

    // Apply decayed wheel momentum
    if (Math.abs(wheelVelocity) > 0.00001) {
      targetProgress = clampProgress(targetProgress + wheelVelocity);
      wheelVelocity *= Math.pow(0.86, dt * 60); // silky inertial decay
    } else {
      wheelVelocity = 0;
    }

    // Exponential smoothing towards targetProgress
    const lerpRate = 1 - Math.exp(-7.2 * dt);
    const delta = targetProgress - currentProgress;
    if (Math.abs(delta) > 0.00005) {
      currentProgress += delta * lerpRate;
    } else {
      currentProgress = targetProgress;
    }

    updateScenes(currentProgress);
    renderPlexus(currentProgress, dt);
    render3D(currentProgress, dt);

    requestAnimationFrame(tick);
  }

  // --- Interactive Canvas Plexus (Matching User's Uploaded Aesthetic) ---
  let ctx;
  let particles = [];
  const PARTICLE_COUNT = 75;
  const CONNECTION_DIST = 160;
  let mouse = { x: null, y: null, radius: 150 };

  function initPlexus() {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        originX: Math.random() * canvas.width,
        originY: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 1.5 + Math.random() * 2,
        baseAlpha: 0.25 + Math.random() * 0.55
      });
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function renderPlexus(scrollProg) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scroll drives vertical atmospheric drift upwards
    const scrollLift = scrollProg * 350;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Update positions
      p.x += p.vx;
      p.y += p.vy;

      // Wrap boundaries
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Effective Y with scroll lift
      const renderY = (p.y - scrollLift + canvas.height * 10) % canvas.height;

      // Mouse gentle repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - renderY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      // Draw particle dot
      ctx.beginPath();
      ctx.arc(p.x, renderY, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.baseAlpha * (1 + scrollProg * 0.3)})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const p2RenderY = (p2.y - scrollLift + canvas.height * 10) % canvas.height;
        const dx = p.x - p2.x;
        const dy = renderY - p2RenderY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.35 * (1 + scrollProg * 0.2);
          ctx.beginPath();
          ctx.moveTo(p.x, renderY);
          ctx.lineTo(p2.x, p2RenderY);
          ctx.strokeStyle = `rgba(220, 230, 245, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }
  }

  // --- Strict Pinned Input Handlers ---
  function clampProgress(val) {
    return Math.max(0, Math.min(1, val));
  }

  // Mouse Wheel (Desktop): Momentum-driven velocity accumulation
  window.addEventListener('wheel', function (e) {
    e.preventDefault();
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 30; // lines mode
    else if (e.deltaMode === 2) delta *= 320; // pages mode
    wheelVelocity += delta * 0.00048;
  }, { passive: false });

  // Touch Drag (Mobile / Tablets)
  let touchStartY = 0;
  window.addEventListener('touchstart', function (e) {
    if (e.target && e.target.closest && e.target.closest('#joystickContainer')) {
      return;
    }
    if (e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
      wheelVelocity = 0;
    }
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (isJoystickActive || (e.target && e.target.closest && e.target.closest('#joystickContainer'))) {
      return;
    }
    e.preventDefault();
    if (e.touches.length > 0) {
      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY;
      touchStartY = touchCurrentY;
      wheelVelocity += deltaY * 0.0014;
    }
  }, { passive: false });

  // Keyboard navigation with smooth momentum impulses
  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      wheelVelocity += 0.085;
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      wheelVelocity -= 0.085;
    } else if (e.key === 'Home') {
      e.preventDefault();
      wheelVelocity = 0;
      targetProgress = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      wheelVelocity = 0;
      targetProgress = 1;
    }
  });

  // Mouse Move for ambient parallax and 3D vehicle interaction
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    normMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    normMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
    normMouse.x = 0;
    normMouse.y = 0;
  });

  // Click on helper button to toggle back and forth
  scrollHelper.addEventListener('click', function () {
    targetProgress = targetProgress < 0.5 ? 1 : 0;
  });

  // --- Startup Initialization ---
  function init() {
    setupScene1Letters();
    setupScene2Letters();
    initPlexus();
    initThree();
    initJoystick();
    updateScenes(0);
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
