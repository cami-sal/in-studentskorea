// =============================================================================
// Globe3D: Interactive 3D Cosmic Earth Visualization for Foreign Students in Korea
// Visualizes 2025 Country of Origin flows into South Korea with 3D Great Circle Arcs,
// Animated Luminous Pulse Packets, Starfield Space Environment, and Korea Receiving Beacon.
// =============================================================================

window.Globe3D = (function () {
  let isInitialized = false;
  let isVisible = false;

  // DOM elements
  let container, canvas;
  let tooltipEl;

  // Three.js Core
  let scene, camera, renderer;
  let globeGroup; // Contains earth sphere, atmosphere, borders, markers, arcs
  let globeMesh, atmosphereMesh;
  let starfieldMesh;
  let bordersLineSegments;

  // Korea Target Beacon & Pulse Rings
  let koreaTargetMesh;
  let koreaPulseRings = [];
  let koreaBeaconBeam;
  const KOREA_LAT = 36.2683;
  const KOREA_LNG = 127.6358;
  const GLOBE_RADIUS = 100;

  // Data & Layers
  let countryVisaData = [];
  let activeCountryRecords = [];
  let currentVisa = "all";
  let currentContinent = "all";
  let currentLang = "en";
  let selectedCountryName = null;
  let hoveredCountry = null;

  // 3D Objects
  let countryMarkersGroup;
  let countryMarkersMap = new Map(); // country_en.toLowerCase() -> Mesh
  let interactiveObjects = [];
  let arcsGroup;
  let arcObjectsList = []; // Array of { country, lineMesh, points, pulseOffset, speed, color }
  let pulseInstancedMesh;
  const MAX_PULSES = 400;

  // Interaction & Camera
  let isPointerDown = false;
  let pointerStart = { x: 0, y: 0 };
  let pointerLast = { x: 0, y: 0 };
  let rotationVelocity = { yaw: 0, pitch: 0 };
  let currentRotation = { yaw: -1.2, pitch: 0.35 };
  let targetRotation = { yaw: -1.2, pitch: 0.35 };
  let isFocusing = false;
  let focusProgress = 1;
  let focusStartRotation = { yaw: 0, pitch: 0 };
  let cameraDistance = 275;
  let targetCameraDistance = 275;
  let isAutoRotating = true;
  let autoRotateSpeed = 0.0012;
  let isHoveredOnObject = false;

  // Animation Loop
  let animFrameId = null;
  let clock;
  let globalPulseTimer = 0;

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9999, -9999);
  let mouseScreen = { x: 0, y: 0 };

  // Color Palette by Student Volume (Editorial ink scale matching website tokens)
  function getThermalColor(count) {
    if (count >= 50000) return { hex: "#c2410c", three: new THREE.Color(0xc2410c), glow: "#ea580c" }; // Terracotta (China, Vietnam)
    if (count >= 10000) return { hex: "#d97706", three: new THREE.Color(0xd97706), glow: "#f59e0b" }; // Amber (Mongolia, Uzbekistan, Nepal)
    if (count >= 3000)  return { hex: "#1d4ed8", three: new THREE.Color(0x1d4ed8), glow: "#3b82f6" }; // Royal Blue (Japan, Myanmar, USA, Russia)
    if (count >= 1000)  return { hex: "#0284c7", three: new THREE.Color(0x0284c7), glow: "#38bdf8" }; // Ocean Blue (France, Germany, Indonesia, India)
    return { hex: "#475569", three: new THREE.Color(0x475569), glow: "#64748b" };                      // Slate Ink (<1000)
  }

  // Geographic Math: Lat/Lng to 3D Cartesian coordinates on sphere
  function latLngToVector3(lat, lng, radius = GLOBE_RADIUS) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  // Calculate Great-Circle Arc 3D Curve points elevated into space
  function createGreatCircleArc(startVec, endVec, radius = GLOBE_RADIUS, segments = 48) {
    const points = [];
    const angle = startVec.angleTo(endVec);
    // Dynamic height based on geographic distance: longer arcs arch higher into space
    const maxAltitude = Math.min(46, Math.max(12, radius * 0.32 * Math.sin(angle / 2)));

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Slerp interpolation between start and end
      const v = new THREE.Vector3().copy(startVec).lerp(endVec, t);
      v.normalize();
      // Altitude parabolic elevation
      const altitude = radius + maxAltitude * Math.sin(Math.PI * t);
      v.multiplyScalar(altitude);
      points.push(v);
    }
    return points;
  }

  // Helper to extract student count based on active visa
  function getCountryCount(record) {
    if (!record) return 0;
    if (currentVisa === "d2") return record.d2 || 0;
    if (currentVisa === "d4") return record.d4 || 0;
    return record.total || 0;
  }

  // ---------------------------------------------------------------------------
  // Canvas Texture Generator for Earth Continents (Editorial Cartography)
  // ---------------------------------------------------------------------------
  function generateEarthTexture() {
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 2048;
    texCanvas.height = 1024;
    const ctx = texCanvas.getContext("2d");

    // 1. Serene Porcelain/Slate Ocean Background (matches editorial paper palette)
    ctx.fillStyle = "#dbe5eb";
    ctx.fillRect(0, 0, 2048, 1024);

    // 2. Subtle Equirectangular Graticule Grid
    if (window.d3) {
      const projection = d3.geoEquirectangular()
        .translate([1024, 512])
        .scale(1024 / Math.PI);
      const path = d3.geoPath(projection, ctx);

      // Lat/Lng 10-degree grid in delicate slate ink
      try {
        const grat = typeof d3.geoGraticule === "function" ? d3.geoGraticule()() :
                     typeof d3.geoGraticule10 === "function" ? d3.geoGraticule10() : null;
        if (grat) {
          ctx.beginPath();
          path(grat);
          ctx.strokeStyle = "rgba(100, 116, 139, 0.22)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } catch (e) {
        console.warn("Graticule skipped:", e);
      }

      // Equator & Prime Meridian highlighted
      ctx.beginPath();
      ctx.strokeStyle = "rgba(71, 85, 105, 0.35)";
      ctx.lineWidth = 1.4;
      ctx.moveTo(0, 512);
      ctx.lineTo(2048, 512);
      ctx.moveTo(1024, 0);
      ctx.lineTo(1024, 1024);
      ctx.stroke();

      // 3. Draw World Country Polygons
      const worldGeo = window.WORLD_COUNTRIES_GEOJSON;
      if (worldGeo && worldGeo.features) {
        worldGeo.features.forEach(f => {
          ctx.beginPath();
          path(f);

          const isKorea = f.properties && (f.properties.country_en === "South Korea" || f.properties.country_kr === "대한민국");

          if (isKorea) {
            // Vivid Royal Cobalt Blue for South Korea (Destination Hub)
            ctx.fillStyle = "#1d4ed8";
            ctx.fill();
            ctx.strokeStyle = "#172554";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          } else {
            // Crisp White Landmass with Refined Slate Ink Boundaries
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        });
      }
    } else {
      // Fallback simple light land rectangles if D3 isn't available
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(200, 200, 1600, 600);
    }

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  // ---------------------------------------------------------------------------
  // Initialize Three.js Scene
  // ---------------------------------------------------------------------------
  function init(data, lang = "en") {
    countryVisaData = data.countryVisaData || [];
    currentLang = lang;

    container = document.getElementById("globeContainer");
    canvas = document.getElementById("globeCanvas");
    tooltipEl = document.getElementById("tooltip");
    if (!container || !canvas || typeof THREE === "undefined") return false;

    clock = new THREE.Clock();

    // Scene with soft warm ambient fog matching the ivory background
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf4efe4, 0.00032);

    // Camera
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || 800;
    const height = rect.height || container.clientHeight || 770;
    camera = new THREE.PerspectiveCamera(42, width / height, 1, 3500);
    camera.position.set(0, 30, cameraDistance);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    // Warm Studio Lighting (Crisp gallery illumination)
    const ambientLight = new THREE.AmbientLight(0xfffdf7, 2.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(350, 220, 300);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 0.85);
    fillLight.position.set(-300, -100, -200);
    scene.add(fillLight);

    // Tactile Contact Shadow Plane beneath Globe (Grounds sphere above ivory desk)
    buildContactShadow();

    // Subtle Ambient Floating Dust Particles (Gentle depth without deep space clutter)
    buildAmbientParticles();

    // Globe Group: all objects on and around Earth rotate together
    globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Earth Sphere Mesh
    const earthTexture = generateEarthTexture();
    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.85,
      metalness: 0.04,
      emissive: new THREE.Color(0x1a2433),
      emissiveIntensity: 0.06
    });
    globeMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(globeMesh);

    // 2. 3D Crisp Vector Country Borders
    build3DCountryBorders();

    // 3. Subtle Pearl Atmosphere Glow (BackSide Fresnel Halo)
    buildAtmosphereGlow();

    // 4. South Korea Target Receiving Beacon & Pulse Rings
    buildKoreaTargetBeacon();

    // 5. Origin Countries Markers & Great-Circle 3D Pulse Arcs
    countryMarkersGroup = new THREE.Group();
    globeGroup.add(countryMarkersGroup);

    arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);

    // Set initial rotation so South Korea is facing front center
    focusOnKorea(false);

    // Event listeners
    setupInteractionListeners();
    setupHudControls();

    isInitialized = true;
    updateDataAndLayers();
    return true;
  }

  // ---------------------------------------------------------------------------
  // Contact Shadow Plane beneath Globe
  // ---------------------------------------------------------------------------
  function buildContactShadow() {
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext("2d");

    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, "rgba(45, 40, 34, 0.32)");
    grad.addColorStop(0.35, "rgba(45, 40, 34, 0.18)");
    grad.addColorStop(0.7, "rgba(45, 40, 34, 0.06)");
    grad.addColorStop(1, "rgba(45, 40, 34, 0.0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(180, 180);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -108; // Directly beneath sphere (radius 100)
    scene.add(shadowMesh);
  }

  // ---------------------------------------------------------------------------
  // Subtle Ambient Floating Dust Particles
  // ---------------------------------------------------------------------------
  function buildAmbientParticles() {
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 550 + Math.random() * 650;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 2.0,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.28,
      sizeAttenuation: true
    });

    starfieldMesh = new THREE.Points(geometry, material);
    scene.add(starfieldMesh);
  }

  // ---------------------------------------------------------------------------
  // 3D Vector Borders on Earth Sphere (Crisp Slate Ink Line Overlays)
  // ---------------------------------------------------------------------------
  function build3DCountryBorders() {
    const worldGeo = window.WORLD_COUNTRIES_GEOJSON;
    if (!worldGeo || !worldGeo.features) return;

    const linePoints = [];
    const rBorder = GLOBE_RADIUS * 1.0025;

    worldGeo.features.forEach(f => {
      const geom = f.geometry;
      if (!geom) return;

      const processRing = ring => {
        for (let i = 0; i < ring.length - 1; i++) {
          const ptA = ring[i];
          const ptB = ring[i + 1];
          const vA = latLngToVector3(ptA[1], ptA[0], rBorder);
          const vB = latLngToVector3(ptB[1], ptB[0], rBorder);
          linePoints.push(vA, vB);
        }
      };

      if (geom.type === "Polygon") {
        geom.coordinates.forEach(processRing);
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach(poly => poly.forEach(processRing));
      }
    });

    const borderGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const borderMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending
    });
    bordersLineSegments = new THREE.LineSegments(borderGeo, borderMat);
    globeGroup.add(bordersLineSegments);
  }

  // ---------------------------------------------------------------------------
  // Atmospheric Ethereal Rim Glow (Soft Pearl Fresnel Halo)
  // ---------------------------------------------------------------------------
  function buildAtmosphereGlow() {
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.08, 48, 48);

    // Fresnel Atmospheric Shader (Subtle pearl halo)
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vEyeVec;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vEyeVec = -normalize(mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vEyeVec;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vEyeVec), 3.0);
          vec3 atmoColor = vec3(0.55, 0.65, 0.78);
          gl_FragColor = vec4(atmoColor, intensity * 0.35);
        }
      `,
      blending: THREE.NormalBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmosphereMesh);
  }

  // ---------------------------------------------------------------------------
  // South Korea Receiving Hub Beacon & Animated Concentric Radar Pulse Rings
  // ---------------------------------------------------------------------------
  function buildKoreaTargetBeacon() {
    const koreaPos = latLngToVector3(KOREA_LAT, KOREA_LNG, GLOBE_RADIUS * 1.015);
    const normal = koreaPos.clone().normalize();

    // 1. Central Royal Cobalt Hub
    const hubGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const hubMat = new THREE.MeshBasicMaterial({
      color: 0x1d4ed8, // Royal Cobalt Blue
      transparent: true,
      opacity: 0.98
    });
    koreaTargetMesh = new THREE.Mesh(hubGeo, hubMat);
    koreaTargetMesh.position.copy(koreaPos);
    globeGroup.add(koreaTargetMesh);

    // Core white center pin
    const coreGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.copy(koreaPos);
    globeGroup.add(coreMesh);

    // 2. 3 Concentric Animated Pulse Rings (Royal Blue expanding radar)
    koreaPulseRings = [];
    const ringGeo = new THREE.RingGeometry(1.2, 2.4, 36);

    for (let i = 0; i < 3; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1d4ed8,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(koreaPos.clone().add(normal.clone().multiplyScalar(0.2 + i * 0.1)));
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      ringMesh.userData = { phaseOffset: i * 0.33 };
      globeGroup.add(ringMesh);
      koreaPulseRings.push(ringMesh);
    }

    // 3. Editorial Needle Pin (Stem & Royal Blue Pinhead)
    const pinStemGeo = new THREE.CylinderGeometry(0.25, 0.25, 14, 12);
    pinStemGeo.translate(0, 7, 0);
    const pinStemMat = new THREE.MeshBasicMaterial({
      color: 0x1a1917,
      transparent: true,
      opacity: 0.85
    });
    const pinStem = new THREE.Mesh(pinStemGeo, pinStemMat);
    pinStem.position.copy(koreaPos);
    pinStem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    globeGroup.add(pinStem);

    const pinHeadGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const pinHeadMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8 });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinHeadMat);
    pinHead.position.copy(koreaPos.clone().add(normal.clone().multiplyScalar(14)));
    globeGroup.add(pinHead);
  }

  // ---------------------------------------------------------------------------
  // Build Origin Country Markers & 3D Great-Circle Pulse Arcs to South Korea
  // ---------------------------------------------------------------------------
  function updateDataAndLayers() {
    if (!isInitialized) return;

    // Filter country records
    activeCountryRecords = countryVisaData.filter(d => {
      if (d.lat === 0 && d.lng === 0) return false;
      if (currentContinent !== "all" && d.continent_en !== currentContinent) return false;
      return getCountryCount(d) > 0;
    });

    // Sort by count descending
    activeCountryRecords.sort((a, b) => getCountryCount(b) - getCountryCount(a));

    // Clear old markers and arcs
    while (countryMarkersGroup.children.length > 0) {
      const obj = countryMarkersGroup.children[0];
      countryMarkersGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
    countryMarkersMap.clear();
    interactiveObjects = [];

    while (arcsGroup.children.length > 0) {
      const obj = arcsGroup.children[0];
      arcsGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
    arcObjectsList = [];

    const koreaVec = latLngToVector3(KOREA_LAT, KOREA_LNG, GLOBE_RADIUS);
    const maxCount = d3.max(activeCountryRecords, d => getCountryCount(d)) || 1;

    // Radius scale for origin country markers: 1.2 to 5.0
    const markerRadiusScale = d3.scaleSqrt()
      .domain([1, Math.max(80000, maxCount)])
      .range([1.2, 5.0]);

    // Build each origin country marker & 3D Arc
    activeCountryRecords.forEach((d, idx) => {
      const count = getCountryCount(d);
      const thermal = getThermalColor(count);
      const cPos = latLngToVector3(d.lat, d.lng, GLOBE_RADIUS * 1.012);
      const r = markerRadiusScale(count);

      // 1. Origin Country 3D Node Mesh (Luminous Pin/Sphere)
      const markerGeo = new THREE.SphereGeometry(r, 20, 20);
      const markerMat = new THREE.MeshBasicMaterial({
        color: thermal.three,
        transparent: true,
        opacity: 0.95
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(cPos);
      markerMesh.userData = { country: d, count: count, thermal: thermal, baseRadius: r };
      countryMarkersGroup.add(markerMesh);

      // Contrast ring around marker so it pops on white land
      const rimGeo = new THREE.RingGeometry(r * 1.08, r * 1.32, 24);
      const rimMat = new THREE.MeshBasicMaterial({
        color: 0x1a1917,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
      });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.copy(cPos.clone().multiplyScalar(1.0015));
      rimMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cPos.clone().normalize());
      countryMarkersGroup.add(rimMesh);

      // Larger invisible picking target for effortless hovering
      const hitGeo = new THREE.SphereGeometry(Math.max(5.0, r * 1.6), 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(cPos);
      hitMesh.userData = { country: d, count: count, thermal: thermal, markerMesh: markerMesh };
      countryMarkersGroup.add(hitMesh);
      interactiveObjects.push(hitMesh);

      const enKey = (d.country_en || "").toLowerCase();
      countryMarkersMap.set(enKey, markerMesh);
      if (d.country_kr) countryMarkersMap.set(d.country_kr, markerMesh);

      // 2. Great Circle 3D Arc elevated into space towards Korea
      const arcPoints = createGreatCircleArc(cPos, koreaVec, GLOBE_RADIUS);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);

      // Base arc opacity & thickness by volume (Rich Editorial Ink)
      let arcOpacity = 0.28;
      if (count >= 10000) {
        arcOpacity = 0.62;
      } else if (count >= 3000) {
        arcOpacity = 0.45;
      }

      const arcMat = new THREE.LineBasicMaterial({
        color: thermal.three,
        transparent: true,
        opacity: arcOpacity,
        blending: THREE.NormalBlending,
        depthWrite: false
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcLine.userData = {
        country: d,
        count: count,
        thermal: thermal,
        baseOpacity: arcOpacity,
        isArcLine: true
      };
      arcsGroup.add(arcLine);

      // Store in pulse animation registry
      // Higher student volume corridors have faster/multiple pulse packets
      const pulseSpeed = 0.0035 + Math.min(0.006, (count / 80000) * 0.004);
      arcObjectsList.push({
        country: d,
        lineMesh: arcLine,
        points: arcPoints,
        pulseOffset: (idx * 0.17) % 1.0,
        speed: pulseSpeed,
        color: thermal.three,
        count: count
      });
    });

    // 3. Build Animated Pulse Particles Mesh (Instanced / Points streaming to Korea)
    buildPulseParticlesSystem();

    // Update Floating HUD Counter
    const hudSub = document.getElementById("globeHudSub");
    if (hudSub) {
      const activeSum = activeCountryRecords.reduce((sum, d) => sum + getCountryCount(d), 0);
      hudSub.textContent = `${activeCountryRecords.length} Countries (${d3.format(",")(activeSum)} Students) → Korea`;
    }
  }

  // ---------------------------------------------------------------------------
  // Build Moving Pulse Particles System
  // ---------------------------------------------------------------------------
  function buildPulseParticlesSystem() {
    if (pulseInstancedMesh) {
      globeGroup.remove(pulseInstancedMesh);
      if (pulseInstancedMesh.geometry) pulseInstancedMesh.geometry.dispose();
      if (pulseInstancedMesh.material) pulseInstancedMesh.material.dispose();
    }

    const totalArcs = arcObjectsList.length;
    if (totalArcs === 0) return;

    // Allow up to 2 pulses per arc for top countries, 1 for others
    let totalPulseCount = 0;
    arcObjectsList.forEach(arc => {
      totalPulseCount += arc.count >= 5000 ? 2 : 1;
    });

    const sphereGeo = new THREE.SphereGeometry(1.3, 12, 12);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    pulseInstancedMesh = new THREE.InstancedMesh(sphereGeo, sphereMat, Math.min(MAX_PULSES, totalPulseCount));
    pulseInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Color instances with saturated vibrant tone
    let pIdx = 0;
    const dummy = new THREE.Object3D();

    arcObjectsList.forEach(arc => {
      const numPulses = arc.count >= 5000 ? 2 : 1;
      for (let p = 0; p < numPulses; p++) {
        if (pIdx >= MAX_PULSES) break;
        pulseInstancedMesh.setColorAt(pIdx, arc.color);
        dummy.position.copy(arc.points[0]);
        dummy.scale.setScalar(0.001);
        dummy.updateMatrix();
        pulseInstancedMesh.setMatrixAt(pIdx, dummy.matrix);
        pIdx++;
      }
    });

    if (pulseInstancedMesh.instanceColor) pulseInstancedMesh.instanceColor.needsUpdate = true;
    pulseInstancedMesh.instanceMatrix.needsUpdate = true;
    globeGroup.add(pulseInstancedMesh);
  }

  // ---------------------------------------------------------------------------
  // Animation Loop (60fps Butter-Smooth WebGL Render)
  // ---------------------------------------------------------------------------
  function animate() {
    if (!isVisible) return;
    animFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    globalPulseTimer += delta;

    // 1. Camera & Globe Rotation with Inertia
    if (!isPointerDown) {
      if (isAutoRotating && !isHoveredOnObject && !isFocusing) {
        currentRotation.yaw += autoRotateSpeed;
        targetRotation.yaw = currentRotation.yaw;
      } else {
        // Apply inertia decay
        rotationVelocity.yaw *= 0.92;
        rotationVelocity.pitch *= 0.92;
        currentRotation.yaw += rotationVelocity.yaw;
        currentRotation.pitch += rotationVelocity.pitch;
      }
    }

    // Smooth focus slerp if targeting a specific country / Korea
    if (isFocusing) {
      focusProgress += delta * 2.2;
      if (focusProgress >= 1) {
        focusProgress = 1;
        isFocusing = false;
      }
      const ease = 1 - Math.pow(1 - focusProgress, 3);
      currentRotation.yaw = focusStartRotation.yaw + (targetRotation.yaw - focusStartRotation.yaw) * ease;
      currentRotation.pitch = focusStartRotation.pitch + (targetRotation.pitch - focusStartRotation.pitch) * ease;
    }

    // Clamp pitch so globe doesn't flip upside down
    currentRotation.pitch = Math.max(-Math.PI * 0.44, Math.min(Math.PI * 0.44, currentRotation.pitch));

    // Apply rotation to globeGroup
    globeGroup.rotation.y = currentRotation.yaw;
    globeGroup.rotation.x = currentRotation.pitch;

    // Smooth Camera Zoom
    cameraDistance += (targetCameraDistance - cameraDistance) * 0.12;
    camera.position.z = cameraDistance;

    // 2. Animate Korea Receiving Radar Pulse Rings
    koreaPulseRings.forEach(ring => {
      const phase = (globalPulseTimer * 0.8 + ring.userData.phaseOffset) % 1.0;
      const scale = 1.0 + phase * 3.2;
      ring.scale.set(scale, scale, 1);
      ring.material.opacity = (1.0 - phase) * 0.85;
    });

    // 3. Animate Pulse Packets Travelling Along Arcs to Korea
    if (pulseInstancedMesh && arcObjectsList.length > 0) {
      const dummy = new THREE.Object3D();
      let pIdx = 0;

      arcObjectsList.forEach(arc => {
        const numPulses = arc.count >= 5000 ? 2 : 1;
        for (let p = 0; p < numPulses; p++) {
          if (pIdx >= MAX_PULSES) break;

          const offset = arc.pulseOffset + p * 0.5;
          const prog = (globalPulseTimer * arc.speed + offset) % 1.0;

          // Interpolate point along arc curve (prog = 0: origin country, prog = 1: Korea)
          const ptCount = arc.points.length;
          const floatIdx = prog * (ptCount - 1);
          const i0 = Math.floor(floatIdx);
          const i1 = Math.min(ptCount - 1, i0 + 1);
          const frac = floatIdx - i0;

          const p0 = arc.points[i0];
          const p1 = arc.points[i1];
          const currPos = new THREE.Vector3().copy(p0).lerp(p1, frac);

          dummy.position.copy(currPos);

          // Pulse scale grows in middle of flight, tapers at origin and landing
          const scaleCurve = Math.sin(Math.PI * prog);
          const pulseScale = Math.max(0.6, (0.8 + (arc.count / 50000) * 1.2) * scaleCurve);
          dummy.scale.setScalar(pulseScale);
          dummy.updateMatrix();

          pulseInstancedMesh.setMatrixAt(pIdx, dummy.matrix);
          pIdx++;
        }
      });

      pulseInstancedMesh.instanceMatrix.needsUpdate = true;
    }

    // 4. Subtle Starfield Twinkle Drift
    if (starfieldMesh) {
      starfieldMesh.rotation.y += 0.00015;
    }

    // 5. Update Dynamic 2D Screen Position of Korea Tag
    updateKoreaScreenBadge();

    // Render Frame
    renderer.render(scene, camera);
  }

  // ---------------------------------------------------------------------------
  // Project Korea 3D Position onto 2D Screen for Floating Destination Badge
  // ---------------------------------------------------------------------------
  function updateKoreaScreenBadge() {
    const badge = document.getElementById("koreaDestinationBadge");
    if (!badge || !container) return;

    const koreaPos = latLngToVector3(KOREA_LAT, KOREA_LNG, GLOBE_RADIUS * 1.03);
    koreaPos.applyMatrix4(globeGroup.matrixWorld);

    // Check if Korea is on the front side facing the camera
    const eyeVec = camera.position.clone().normalize();
    const dot = koreaPos.clone().normalize().dot(eyeVec);

    if (dot <= 0.15) {
      // Facing away / behind the globe
      badge.style.opacity = "0";
      badge.style.pointerEvents = "none";
      return;
    }

    // Project 3D vector to normalized device coordinates [-1, 1]
    const proj = koreaPos.clone().project(camera);
    const rect = container.getBoundingClientRect();
    const x = ((proj.x + 1) / 2) * rect.width;
    const y = ((-proj.y + 1) / 2) * rect.height;

    badge.style.transform = `translate3d(${x}px, ${y - 32}px, 0) translate(-50%, -100%)`;
    badge.style.opacity = `${Math.min(1.0, (dot - 0.15) * 2.5)}`;
  }

  // ---------------------------------------------------------------------------
  // Focus / Rotate Globe to Face Any Given Country or South Korea
  // ---------------------------------------------------------------------------
  function focusOnCoordinates(lat, lng, animated = true) {
    // Calculate yaw to bring longitude facing front (+Z)
    const targetYaw = -((lng * Math.PI) / 180) - Math.PI / 2;
    // Calculate pitch to bring latitude centered vertically
    const targetPitch = (lat * Math.PI) / 180 * 0.75;

    if (!animated) {
      currentRotation.yaw = targetYaw;
      currentRotation.pitch = targetPitch;
      targetRotation.yaw = targetYaw;
      targetRotation.pitch = targetPitch;
      return;
    }

    // Smooth shortest angular distance interpolation
    focusStartRotation = { yaw: currentRotation.yaw, pitch: currentRotation.pitch };
    let dYaw = targetYaw - (focusStartRotation.yaw % (Math.PI * 2));
    while (dYaw > Math.PI) dYaw -= Math.PI * 2;
    while (dYaw < -Math.PI) dYaw += Math.PI * 2;

    targetRotation.yaw = focusStartRotation.yaw + dYaw;
    targetRotation.pitch = targetPitch;
    focusProgress = 0;
    isFocusing = true;
  }

  function focusOnKorea(animated = true) {
    focusOnCoordinates(KOREA_LAT, KOREA_LNG, animated);
    selectedCountryName = null;
    clearCountryHighlight();
  }

  function focusCountry(countryName) {
    if (!countryName) {
      focusOnKorea(true);
      return;
    }
    const cData = countryVisaData.find(x =>
      (x.country_en && x.country_en.toLowerCase() === countryName.toLowerCase()) ||
      (x.country_kr && x.country_kr === countryName)
    );
    if (!cData) return;

    selectedCountryName = cData.country_en;
    focusOnCoordinates(cData.lat, cData.lng, true);
    highlightCountry(cData, true);
  }

  // ---------------------------------------------------------------------------
  // Country Highlight & Hover Details
  // ---------------------------------------------------------------------------
  function highlightCountry(countryData, isSelected = false) {
    if (!countryData) return;
    const cName = countryData.country_en.toLowerCase();

    // 1. Highlight Node Marker
    const marker = countryMarkersMap.get(cName);
    if (marker) {
      marker.scale.setScalar(2.0);
      marker.material.color.setHex(0xc2410c); // Editorial Terracotta Accent
    }

    // 2. Highlight Arc Line to Korea & Dim others
    arcObjectsList.forEach(arc => {
      const isMatch = arc.country.country_en.toLowerCase() === cName;
      if (isMatch) {
        arc.lineMesh.material.color.setHex(0xc2410c);
        arc.lineMesh.material.opacity = 0.95;
        arc.lineMesh.renderOrder = 99;
      } else {
        arc.lineMesh.material.opacity = 0.08;
        arc.lineMesh.renderOrder = 1;
      }
    });
  }

  function clearCountryHighlight() {
    // Restore all node markers
    if (countryMarkersGroup && countryMarkersGroup.children) {
      countryMarkersGroup.children.forEach(mesh => {
        if (mesh && mesh.userData && mesh.userData.baseRadius && mesh.material) {
          mesh.scale.setScalar(1.0);
          mesh.material.color.copy(mesh.userData.thermal.three);
        }
      });
    }

    // Restore all arcs
    if (arcObjectsList) {
      arcObjectsList.forEach(arc => {
        if (arc && arc.lineMesh && arc.lineMesh.material) {
          arc.lineMesh.material.color.copy(arc.color);
          arc.lineMesh.material.opacity = arc.lineMesh.userData.baseOpacity;
          arc.lineMesh.renderOrder = 2;
        }
      });
    }

    if (tooltipEl) {
      tooltipEl.style.opacity = "0";
      tooltipEl.style.pointerEvents = "none";
    }
  }

  // ---------------------------------------------------------------------------
  // Tooltip Display for 3D Globe
  // ---------------------------------------------------------------------------
  function showCountryTooltip(countryData, mouseEv) {
    if (!tooltipEl || !countryData) return;

    const count = getCountryCount(countryData);
    const d2Count = countryData.d2 || 0;
    const d4Count = countryData.d4 || 0;
    const totalCount = countryData.total || count;
    const d2Pct = totalCount > 0 ? ((d2Count / totalCount) * 100).toFixed(1) : 0;
    const d4Pct = totalCount > 0 ? ((d4Count / totalCount) * 100).toFixed(1) : 0;

    const cNameEn = countryData.country_en || "";
    const cNameKr = countryData.country_kr || "";
    const continent = currentLang === "ko" ? (countryData.continent_kr || "") : (countryData.continent_en || "");
    const rank = countryData.rank ? `#${countryData.rank}` : "";

    const activeFilterText = currentVisa === "d2" ? " (D-2 Degree Only)" :
                             currentVisa === "d4" ? " (D-4 Language Only)" : "";

    tooltipEl.innerHTML = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 2px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px;">
          <div style="font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.2;">
            ${cNameEn} <span style="font-size: 12px; font-weight: 600; color: #64748b;">${cNameKr}</span>
          </div>
          ${rank ? `<span style="background: #1e293b; color: #f8fafc; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${rank}</span>` : ""}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
          ${continent} • Flow Corridor → South Korea
        </div>
        <div style="background: #f1f5f9; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 600; color: #475569;">2025 Students in Korea${activeFilterText}</div>
          <div style="font-size: 20px; font-weight: 850; color: #1d4ed8; letter-spacing: -0.02em;">
            ${d3.format(",")(count)} <span style="font-size: 12px; font-weight: 600; color: #64748b;">students</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #1e40af; font-weight: 600;">🎓 D-2 Degree:</span>
            <span style="font-weight: 700; color: #0f172a;">${d3.format(",")(d2Count)} (${d2Pct}%)</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #b45309; font-weight: 600;">🗣️ D-4 Language:</span>
            <span style="font-weight: 700; color: #0f172a;">${d3.format(",")(d4Count)} (${d4Pct}%)</span>
          </div>
        </div>
      </div>
    `;

    tooltipEl.style.display = "block";
    tooltipEl.style.opacity = "1";
    tooltipEl.style.left = `${mouseEv.clientX + 16}px`;
    tooltipEl.style.top = `${mouseEv.clientY - 12}px`;
  }

  // ---------------------------------------------------------------------------
  // Mouse & Touch Interaction Listeners
  // ---------------------------------------------------------------------------
  function setupInteractionListeners() {
    canvas.addEventListener("pointerdown", e => {
      isPointerDown = true;
      pointerStart.x = e.clientX;
      pointerStart.y = e.clientY;
      pointerLast.x = e.clientX;
      pointerLast.y = e.clientY;
      rotationVelocity = { yaw: 0, pitch: 0 };
      isFocusing = false;
      canvas.setPointerCapture(e.pointerId);
    });

    window.addEventListener("pointermove", e => {
      const rect = canvas.getBoundingClientRect();
      mouseScreen.x = e.clientX;
      mouseScreen.y = e.clientY;
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isPointerDown) {
        const dx = e.clientX - pointerLast.x;
        const dy = e.clientY - pointerLast.y;
        pointerLast.x = e.clientX;
        pointerLast.y = e.clientY;

        const sensitivity = 0.0055;
        rotationVelocity.yaw = dx * sensitivity;
        rotationVelocity.pitch = dy * sensitivity;

        currentRotation.yaw += rotationVelocity.yaw;
        currentRotation.pitch += rotationVelocity.pitch;
        targetRotation.yaw = currentRotation.yaw;
        targetRotation.pitch = currentRotation.pitch;
      } else {
        // Raycasting for country hover
        if (!isVisible) return;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, false);

        if (intersects.length > 0) {
          isHoveredOnObject = true;
          canvas.style.cursor = "pointer";
          const hit = intersects[0].object;
          if (hit.userData && hit.userData.country) {
            if (hoveredCountry !== hit.userData.country) {
              hoveredCountry = hit.userData.country;
              highlightCountry(hoveredCountry, false);
            }
            showCountryTooltip(hoveredCountry, e);
          }
        } else {
          isHoveredOnObject = false;
          canvas.style.cursor = "grab";
          if (hoveredCountry && !selectedCountryName) {
            hoveredCountry = null;
            clearCountryHighlight();
          }
        }
      }
    });

    window.addEventListener("pointerup", e => {
      if (!isPointerDown) return;
      isPointerDown = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // Click check (if barely dragged)
      const dist = Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y);
      if (dist < 5) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hit.userData && hit.userData.country) {
            focusCountry(hit.userData.country.country_en);
            // Sync with sidebar select if present
            const sel = document.getElementById("countrySelect");
            if (sel) sel.value = hit.userData.country.country_en;
          }
        }
      }
    });

    // Zoom on Wheel
    canvas.addEventListener(
      "wheel",
      e => {
        e.preventDefault();
        const zoomDelta = e.deltaY * 0.22;
        targetCameraDistance = Math.max(130, Math.min(420, targetCameraDistance + zoomDelta));
      },
      { passive: false }
    );
  }

  // ---------------------------------------------------------------------------
  // Floating On-Canvas Space HUD Controls
  // ---------------------------------------------------------------------------
  function setupHudControls() {
    const btnRotate = document.getElementById("btnGlobeAutoRotate");
    if (btnRotate) {
      btnRotate.addEventListener("click", () => {
        isAutoRotating = !isAutoRotating;
        btnRotate.classList.toggle("active", isAutoRotating);
      });
    }

    const btnReset = document.getElementById("btnGlobeResetView");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        focusOnKorea(true);
        targetCameraDistance = 275;
      });
    }

    const btnZoomIn = document.getElementById("btnGlobeZoomIn");
    if (btnZoomIn) {
      btnZoomIn.addEventListener("click", () => {
        targetCameraDistance = Math.max(130, targetCameraDistance - 35);
      });
    }

    const btnZoomOut = document.getElementById("btnGlobeZoomOut");
    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", () => {
        targetCameraDistance = Math.min(420, targetCameraDistance + 35);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Public Visibility & Filter Control Methods
  // ---------------------------------------------------------------------------
  function show(data, lang = "en") {
    if (data && data.countryVisaData) {
      countryVisaData = data.countryVisaData;
    }
    currentLang = lang;

    if (!isInitialized) {
      init(data, lang);
    }

    if (container) container.style.display = "block";
    isVisible = true;

    // Trigger Resize
    onResize();

    // Start 60fps WebGL loop
    if (!animFrameId) {
      clock.start();
      animate();
    }

    updateDataAndLayers();
  }

  function hide() {
    isVisible = false;
    if (container) container.style.display = "none";
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    clearCountryHighlight();
  }

  function setVisaFilter(visa) {
    currentVisa = visa || "all";
    updateDataAndLayers();
  }

  function setContinentFilter(continent) {
    currentContinent = continent || "all";
    updateDataAndLayers();

    // If filtering to a specific continent, focus towards its center
    const continentCenters = {
      Asia: [34, 100],
      Europe: [52, 20],
      "North America": [40, -100],
      "South America": [-15, -60],
      Africa: [5, 20],
      Oceania: [-25, 135]
    };
    if (continentCenters[continent]) {
      const [lat, lng] = continentCenters[continent];
      focusOnCoordinates(lat, lng, true);
    } else {
      focusOnKorea(true);
    }
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || 800;
    const height = rect.height || container.clientHeight || 770;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener("resize", () => {
    if (isVisible) onResize();
  });

  // Public Interface
  return {
    init,
    show,
    hide,
    setVisaFilter,
    setContinentFilter,
    focusCountry,
    focusOnKorea,
    onResize,
    getIsVisible: () => isVisible
  };
})();
