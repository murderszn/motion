# WebGL 1.0 API Reference & Quick Guide

This guide compiles standard WebGL 1.0 (WebGLRenderingContext) state machine operations, shader compilation pipelines, buffer allocations, and rendering commands.

---

## 1. WebGL Pipeline Architecture

WebGL is a rasterization engine based on OpenGL ES 2.0. It runs on a GPU state machine and utilizes two shaders:
1.  **Vertex Shader**: Computes vertex positions (outputs `gl_Position`).
2.  **Fragment Shader**: Computes pixel colors (outputs `gl_FragColor`).

```
[Vertex Data] -> (Vertex Shader) -> [Rasterizer] -> (Fragment Shader) -> [Framebuffer]
```

---

## 2. Initialization and Context Setup

```javascript
const canvas = document.getElementById('webgl-canvas');

// Context attributes
const gl = canvas.getContext('webgl', {
  alpha: false,
  depth: true,
  antialias: true,
  preserveDrawingBuffer: true // Required if capturing frame screenshots
});

if (!gl) {
  console.error("WebGL 1.0 is not supported by your browser.");
}

// Set drawing viewport size
gl.viewport(0, 0, canvas.width, canvas.height);

// Configure state settings
gl.clearColor(0.0, 0.0, 0.0, 1.0); // RGBA clear color
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

---

## 3. Shader Compilation Pipeline

### Compiling Individual Shaders
```javascript
function compileShader(gl, sourceCode, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);

  // Check compile status
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    const errorLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error (${type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'}): ${errorLog}`);
  }
  return shader;
}
```

### Linking to a Program
```javascript
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Check link status
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    const errorLog = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${errorLog}`);
  }
  return program;
}
```

---

## 4. Buffers, Attributes, and Drawing

### Allocating Buffers (e.g. Fullscreen Quad)
```javascript
// Two triangles covering the screen [-1, 1] bounds
const vertices = new Float32Array([
  -1.0, -1.0,  // Bottom left
   1.0, -1.0,  // Bottom right
  -1.0,  1.0,  // Top left
  -1.0,  1.0,  // Top left
   1.0, -1.0,  // Bottom right
   1.0,  1.0   // Top right
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
```

### Mapping Attributes to the Shader
```javascript
// Locate attribute in the program
const positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLocation);

// Point position attribute pointer to bound array buffer
gl.vertexAttribPointer(
  positionLocation,
  2,          // size (x, y coords)
  gl.FLOAT,    // type of data
  false,      // normalize
  0,          // stride
  0           // offset
);
```

### Drawing commands
```javascript
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 6);
```

---

## 5. Working with Uniforms

Uniforms remain constant across all processed vertices and fragments.

```javascript
// Finding location
const timeLoc = gl.getUniformLocation(program, "u_time");
const resolutionLoc = gl.getUniformLocation(program, "u_resolution");

// Setting values
gl.uniform1f(timeLoc, clockTimeInSeconds);
gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
```

---

## 6. Texture Bindings & Configuration

```javascript
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

// Configure filtering parameters
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

// Upload HTML image elements, canvas elements or typed data buffers
gl.texImage2D(
  gl.TEXTURE_2D,
  0,                // mipmap level
  gl.RGBA,          // internal GPU format
  gl.RGBA,          // source format
  gl.UNSIGNED_BYTE, // data type
  imageElement      // source image
);
```
