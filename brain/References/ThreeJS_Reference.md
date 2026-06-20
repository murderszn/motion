# Three.js API Reference & Quick Guide

This guide compiles standard Three.js concepts, scene setup, custom shaders (`ShaderMaterial`), custom attributes, rendering loops, and post-processing configurations.

---

## 1. Core Scene Initialization

A standard Three.js application requires a Scene, a Camera, and a Renderer.

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 1. Create Scene container
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0c);

// 2. Setup Perspective Camera
const camera = new THREE.PerspectiveCamera(
  75,                                      // Field of view (FOV)
  window.innerWidth / window.innerHeight,  // Aspect ratio
  0.1,                                     // Near plane
  1000                                     // Far plane
);
camera.position.set(0, 0, 5);

// 3. Setup WebGL Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0)); // Clamp DPR to 2
document.body.appendChild(renderer.domElement);

// 4. Add Interactive Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
```

---

## 2. Geometries, Materials, and Meshes

A **Mesh** binds a geometry shape to visual surface properties (Material).

```javascript
// Basic shapes
const geometry = new THREE.BoxGeometry(1, 1, 1);

// MeshStandardMaterial reacts to scene lighting and shadow casting
const material = new THREE.MeshStandardMaterial({
  color: 0x8a2be2,
  roughness: 0.2,
  metalness: 0.8
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

---

## 3. Lighting & Shadows

```javascript
// Ambient light provides soft universal lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Directional light mimics sunlight (supports cast shadow maps)
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// Configure shadows on the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

---

## 4. Custom Shaders (`ShaderMaterial`)

Use `ShaderMaterial` to run custom GLSL vertex and fragment code while inheriting Three.js uniform arrays and lighting bindings.

```javascript
// 1. Define custom uniforms object
const shaderUniforms = {
  u_time: { value: 0.0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_texture: { value: null }
};

// 2. Initialize ShaderMaterial
const customMaterial = new THREE.ShaderMaterial({
  uniforms: shaderUniforms,
  
  // Custom Vertex Shader
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv; // Pass texture UV mapping to fragment shader
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  // Custom Fragment Shader
  fragmentShader: `
    uniform float u_time;
    varying vec2 vUv;
    void main() {
      vec3 col = 0.5 + 0.5 * cos(u_time + vUv.xyx + vec3(0, 2, 4));
      gl_FragColor = vec4(col, 1.0);
    }
  `
});
```

---

## 5. Animation Render Loop

```javascript
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  
  // Update custom uniforms
  shaderUniforms.u_time.value = elapsedTime;
  
  // Update controls
  controls.update();

  // Render Scene
  renderer.render(scene, camera);
}

animate();
```

---

## 6. Post-Processing Pipeline (`EffectComposer`)

Use post-processing to apply rendering filters (bloom, chromatic aberration, film grain) at the screen space layer.

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { LuminosityHighPassShader } from 'three/examples/jsm/shaders/LuminosityHighPassShader.js';

// Initialize Composer
const composer = new EffectComposer(renderer);

// 1. Initial Pass: Renders the standard scene
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 2. Filter Pass: e.g. Chromatic aberration filter
const customFilter = {
  uniforms: {
    tDiffuse: { value: null },
    u_amount: { value: 0.005 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float u_amount;
    varying vec2 vUv;
    void main() {
      vec4 col;
      col.r = texture2D(tDiffuse, vec2(vUv.x + u_amount, vUv.y)).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vec2(vUv.x - u_amount, vUv.y)).b;
      col.a = texture2D(tDiffuse, vUv).a;
      gl_FragColor = col;
    }
  `
};

const filterPass = new ShaderPass(customFilter);
composer.addPass(filterPass);

// In the animation loop, replace renderer.render with composer.render:
// function animate() {
//   requestAnimationFrame(animate);
//   composer.render();
// }
```
