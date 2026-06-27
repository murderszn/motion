// ─────────────────────────────────────────────────────────
//  Audio Visualizer — microphone and Web Audio analyser
// ─────────────────────────────────────────────────────────

const $ = (id: string) => document.getElementById(id)!;

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let stream: MediaStream | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let dataArray = new Uint8Array(256);
let audioTexture: WebGLTexture | null = null;
let dummyTexture: WebGLTexture | null = null;

export let isActive = false;

export const smoothData = {
  volume: 0,
  bass: 0,
  mid: 0,
  treble: 0,
};

export function initAudioVisualizer(): void {
  const btn = $('btnAudioVisualizer');
  if (!btn) return;

  btn.onclick = () => {
    toggleAudio();
  };

  // Keyboard shortcut 'a' to toggle visualizer
  window.addEventListener('keydown', (e) => {
    // Only trigger if not typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    if (e.key.toLowerCase() === 'a') {
      e.preventDefault();
      toggleAudio();
    }
  });
}

export async function toggleAudio(): Promise<void> {
  const btn = $('btnAudioVisualizer');
  
  if (isActive) {
    // Stop
    isActive = false;
    if (btn) {
      btn.classList.remove('active');
      btn.style.transform = '';
      btn.style.color = '';
      btn.style.textShadow = '';
    }
    
    // Disconnect stream
    if (source) {
      source.disconnect();
      source = null;
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    // Close context
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close();
      audioCtx = null;
    }
    analyser = null;

    // Reset smoothData
    smoothData.volume = 0;
    smoothData.bass = 0;
    smoothData.mid = 0;
    smoothData.treble = 0;

    window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'audio visualizer deactivated', cls: 'info' } }));
  } else {
    // Start
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512; // 256 frequency bins
      analyser.smoothingTimeConstant = 0.75;
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      isActive = true;
      if (btn) btn.classList.add('active');

      window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'microphone connected — audio visualizer active', cls: 'ok' } }));
    } catch (err: any) {
      console.error('Audio visualizer failed:', err);
      isActive = false;
      if (btn) {
        btn.classList.remove('active');
        btn.style.transform = '';
        btn.style.color = '';
        btn.style.textShadow = '';
      }
      window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'mic access denied: ' + (err.message || String(err)), cls: 'err' } }));
    }
  }
}

export function updateAudioData(gl: WebGLRenderingContext): void {
  if (!isActive || !analyser) return;

  analyser.getByteFrequencyData(dataArray);

  // Analyze frequency bins for Bass, Mids, Trebles
  let bassSum = 0; // bins 0-15 (0-350Hz)
  let midSum = 0;  // bins 16-100 (350-2200Hz)
  let trebleSum = 0; // bins 100-256 (2200-5500Hz)

  for (let i = 0; i < 16; i++) {
    bassSum += dataArray[i];
  }
  for (let i = 16; i < 100; i++) {
    midSum += dataArray[i];
  }
  for (let i = 100; i < 256; i++) {
    trebleSum += dataArray[i];
  }

  const volume = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length / 255;
  const bass = (bassSum / 16) / 255;
  const mid = (midSum / 84) / 255;
  const treble = (trebleSum / 156) / 255;

  // Dampen values with a rolling filter for smooth visuals
  smoothData.volume = smoothData.volume * 0.85 + volume * 0.15;
  smoothData.bass = smoothData.bass * 0.85 + bass * 0.15;
  smoothData.mid = smoothData.mid * 0.85 + mid * 0.15;
  smoothData.treble = smoothData.treble * 0.85 + treble * 0.15;

  // Pulse sidebar button based on volume
  const btn = $('btnAudioVisualizer');
  if (btn) {
    const scale = 1.0 + smoothData.volume * 0.22;
    btn.style.transform = `scale(${scale})`;
    btn.style.textShadow = `0 0 ${smoothData.volume * 15}px var(--accent)`;
    // Color shift towards white-hot intensity at high volumes
    const whiteIntensity = Math.floor(smoothData.volume * 150);
    btn.style.color = `rgb(${224 + Math.min(31, whiteIntensity)}, ${58 + Math.min(197, whiteIntensity)}, ${58 + Math.min(197, whiteIntensity)})`;
  }

  // Upload frequency spectrum to TEXTURE1
  gl.activeTexture(gl.TEXTURE1);
  if (!audioTexture) {
    audioTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, audioTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 256, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, dataArray);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, audioTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 1, gl.LUMINANCE, gl.UNSIGNED_BYTE, dataArray);
  }
  gl.activeTexture(gl.TEXTURE0);
}

export function bindAudioTexture(gl: WebGLRenderingContext, location: WebGLUniformLocation | null): void {
  if (!location) return;

  gl.activeTexture(gl.TEXTURE1);
  if (isActive && audioTexture) {
    gl.bindTexture(gl.TEXTURE_2D, audioTexture);
  } else {
    if (!dummyTexture) {
      dummyTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, dummyTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([0]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, dummyTexture);
    }
  }
  gl.uniform1i(location, 1);
  gl.activeTexture(gl.TEXTURE0);
}
