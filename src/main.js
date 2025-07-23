import * as THREE from "../node_modules/three/build/three.module.js";
import { PLANETS } from "./planets.js";
import WebGL from '../node_modules/three/examples/jsm/capabilities/WebGL.js';

// Checking for availability of WebGl for production purpose

if ( ! WebGL.isWebGLAvailable() ) {
  document.body.appendChild( WebGL.getWebGLErrorMessage() );
  throw new Error( 'WebGL not supported' );
}
// TextureLoader
const loader = new THREE.TextureLoader();

// Canvas element
const canvas = document.querySelector("#webgl-canvas");

const scene = new THREE.Scene();
scene.rotation.x = THREE.MathUtils.degToRad(20); // For slight tilt to entire scene
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 5, 90);

camera.lookAt(0, 0, 0);

let originalFov = camera.fov;

if (window._threeRenderer) {
  window._threeRenderer.forceContextLoss();
  window._threeRenderer.dispose();
  window._threeRenderer.domElement = null;
}


const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// 1) Grab the checkbox
const toggle = document.getElementById('theme-toggle');

// 2) Restore saved preference
const saved = localStorage.getItem('theme');
if (saved) {
  document.body.dataset.theme = saved;
  toggle.checked = (saved === 'light');
}

// 3) On change, flip the theme
toggle.addEventListener('change', () => {
  const isLight = toggle.checked;
  document.body.dataset.theme = isLight ? 'light' : '';
  localStorage.setItem('theme', isLight ? 'light' : '');
});

// Background Stars
(() => {
  const starTexture = loader.load("src/textures/stars1.jpg");
  const starsGeo = new THREE.SphereGeometry(100, 64, 64);
  const starsMat = new THREE.MeshBasicMaterial({
    map: starTexture,
    side: THREE.BackSide,
  });
  const starsMesh = new THREE.Mesh(starsGeo, starsMat);
  scene.add(starsMesh);
})();

// Sun & Lighting
(() => {
  const sunLight = new THREE.PointLight(0xffffff, 1, 0, 2);
  scene.add(sunLight);

  const sunGeo = new THREE.SphereGeometry(5, 32, 32);
  const sunTex = loader.load("src/textures/sun.jpg");
  const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sunMesh);

  const glowGeom = new THREE.SphereGeometry(6, 32, 32); // glowing background for the sun.
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeom, glowMat);
  sunMesh.add(glowMesh);
})();

// orbit visualization
(() => {
  PLANETS.forEach((p) => {
    const segments = 128;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * p.distance,
          0,
          Math.sin(theta) * p.distance
        )
      );
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
    });
    const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
    scene.add(orbitLine);
  });
})();

// Planets, Orbits and Earth and Saturn Special cases

const planetPivots = {};

PLANETS.forEach((p) => {
  const pivot = new THREE.Object3D();
  scene.add(pivot);

  const geo = new THREE.SphereGeometry(p.size, 32, 32);
  let mat;

  if (p.name === "Earth") {
    const dayTex = loader.load(p.textureDay);
    const nightTex = loader.load(p.textureNight);
    mat = new THREE.MeshPhongMaterial({
      map: dayTex,
      emissiveMap: nightTex,
      emissive: 0x222222,
      shininess: 15,
    });
  } else {
    const tex = loader.load(p.texture);
    mat = new THREE.MeshStandardMaterial({ map: tex });
  }

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = p.distance;
  pivot.add(mesh);

  if (p.name === "Saturn") {
    const ringTex = loader.load(p.ringTexture);
    const ringGeo = new THREE.RingGeometry(p.size * 1.3, p.size * 2.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.x = p.distance + 0.01;
    pivot.add(ringMesh);
  }

  planetPivots[p.name] = { pivot, mesh, speed: p.speed };
});

const tooltip = document.createElement('div');
tooltip.id = 'tooltip';
document.body.appendChild(tooltip);

// On mouse move over the canvas, raycast and show/hide tooltip
canvas.addEventListener('mousemove', event => {
  // map to normalized device coords
  mouse.x =  (event.clientX / canvas.clientWidth ) * 2 - 1;
  mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const meshes     = Object.values(planetPivots).map(o => o.mesh);
  const intersects = raycaster.intersectObjects(meshes);
  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    const [planetName] = Object.entries(planetPivots)
      .find(([, obj]) => obj.mesh === mesh);

    tooltip.style.display = 'block';
    tooltip.innerText     = planetName;
    tooltip.style.left    = event.clientX + 'px';
    tooltip.style.top     = event.clientY + 'px';
  } else {
    tooltip.style.display = 'none';
  }
});

// Also hide it when the pointer leaves the canvas
canvas.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
});

// speed control and UI binding
(() => {
  const controlsDiv = document.getElementById("controls");
  controlsDiv.innerHTML = `  
  <select id="planet-select">
    <option value="">— Select a planet —</option>
    ${PLANETS.map((p) => `<option value="${p.name}">${p.name}</option>`).join(
      ""
    )}
  </select>
  <div id="slider-container" style="margin-top: 10px;"></div>
`;

// Slider UI with dropdown

  const select = document.getElementById("planet-select");
  const sliderContainer = document.getElementById("slider-container");

  select.addEventListener("change", () => {
    const name = select.value;
    sliderContainer.innerHTML = "";
    if (!name) return;

    // slider builder
    const { speed } = planetPivots[name];
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
    <label for="ctrl-speed">${name} speed:</label>
    <input
      type="range" id="ctrl-speed"
      min="0" max="0.1" step="0.001"
      value="${speed}"
    />
  `;
    sliderContainer.appendChild(wrapper);

    // Speed change wrapper

    const input = wrapper.querySelector("input");
    input.addEventListener("input", (e) => {
      planetPivots[name].speed = parseFloat(e.target.value);
    });
  });
})();

// Info box
const infoDiv = document.createElement("div");
infoDiv.id = "info";
infoDiv.style.position = "absolute";
infoDiv.style.pointerEvents = "none";
infoDiv.style.color = "white";
infoDiv.style.fontSize = "0.6rem";
infoDiv.style.transform = "translate(-50%, 0)";
document.body.appendChild(infoDiv);

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let lastClickedMesh = null;

// Zoom in
window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const meshes = Object.values(planetPivots).map((o) => o.mesh);
  const intersects = raycaster.intersectObjects(meshes);
  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    lastClickedMesh = mesh;
    const [planetName] = Object.entries(planetPivots).find(
      ([, obj]) => obj.mesh === mesh
    );

    // Project the planet’s world position to screen coords

    const worldPos = mesh.getWorldPosition(new THREE.Vector3());
    const screenPos = worldPos.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight + 16;

    // Position & fill the label

    infoDiv.style.left = `${x}px`;
    infoDiv.style.top = `${y}px`;
    infoDiv.innerText = `${planetName} — Rotation: ${mesh.rotation.y.toFixed(
      2
    )}`;

    // Zoom in
    camera.fov = originalFov * 0.65;
    camera.updateProjectionMatrix();
  }
});

// Zoom out
window.addEventListener("dblclick", () => {
  camera.fov = originalFov;
  camera.updateProjectionMatrix();
  infoDiv.innerText = "";
  lastClickedMesh = null;
});

// Animation Loop for the Orbits and Planets

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  Object.values(planetPivots).forEach(({ pivot, mesh, speed }) => {
    pivot.rotation.y += speed * delta;
    mesh.rotation.y += 0.01;
  });

  renderer.render(scene, camera);
}

const originalSpeeds = {};
Object.entries(planetPivots).forEach(([name, { speed }]) => {
  originalSpeeds[name] = speed;
});

const speedControls = document.createElement('div');
speedControls.id = 'global-speed-controls';
Object.assign(speedControls.style, {
  position:    'absolute',
  bottom:      '20px',
  left:        '50%',
  transform:   'translateX(-50%)',
  display:     'flex',
  gap:         '12px',
  zIndex:      '10'
});

// Define multipliers to increase speed
const options = [
  { label: 'Normal', factor: 1   },
  { label: '2×',   factor: 2 },
  { label: '4×',     factor: 4   }
];

options.forEach(opt => {
  const btn = document.createElement('button');
  btn.textContent = opt.label;
  Object.assign(btn.style, {
    padding:       '8px 16px',
    borderRadius:  '6px',
    border:        'none',
    background:    'var(--panel-bg)',
    color:         'var(--fg-text)',
    cursor:        'pointer',
    fontSize:      '0.9rem'
  });

  btn.addEventListener('click', () => {
    Object.entries(planetPivots).forEach(([name, obj]) => {
      obj.speed = originalSpeeds[name] * opt.factor;
    });

    // Also updating the selected Slider
    
    const slider = document.querySelector('#ctrl-speed');
    if (slider) {
      const sel = document.querySelector('#planet-select');
      const chosen = sel ? sel.value : null;
      if (chosen && planetPivots[chosen]) {
        slider.value = planetPivots[chosen].speed.toFixed(3);
      }
    }
  });
  speedControls.appendChild(btn);
});

document.body.appendChild(speedControls);

animate();

//Window resizer

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
