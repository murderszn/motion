// ─────────────────────────────────────────────────────────
//  AI — Pollinations.ai integrations (Texture, State, Chat)
// ─────────────────────────────────────────────────────────

import { P, PRESETS } from '../state';
import type { Params, SliderKey, Palette } from '../types';
import { loadTexture, clearTexture } from '../webgl';
import { setSlider } from './sliders';
import { setPalette } from './palette';
import { setSeed } from './seed';
import { applyPresetUI } from './presets';
import { updateShaderSource } from './shader_editor';
import { logToTerminal } from './terminal';

const $ = (id: string) => document.getElementById(id)!;

// Cache the original system prompt for the chat co-pilot
function getChatSystemPrompt(): string {
  const presetList = PRESETS.map((p, idx) => `${idx}: ${p.full} (${p.id})`).join('\n');
  return `You are Antigravity, the AI creative partner for /motion (a real-time WebGL shader studio).
You can help the user understand the math behind fragment shaders, generate new styles, or write custom GLSL code.

Aesthetic Guidelines:
- The design system of /motion relies on high-end glassmorphism, 4px grid spacing, bilateral or radial symmetry, and vibrant contrast.
- Prefer elegant, organic visual patterns over chaotic noise.

Interactive capabilities:
1. Adjusting parameters:
If the user asks you to tweak settings, adjust speeds, scale, density, or select presets, you can apply them programmatically by adding a JSON config block at the very end of your response inside a block starting with ":::motion-config" and ending with ":::".
Example:
:::motion-config
{
  "mode": 3,
  "speed": 0.80,
  "scale": 0.45,
  "colors": ["#000000", "#ff00ff", "#00ffff", "#ffffff"]
}
:::

Supported config keys:
- "mode": number (0 to 31, representing the preset modes listed below)
- "seed": number (0 to 9999)
- "speed", "scale", "density", "distort", "warp", "detail", "grain": float (0.0 to 1.0)
- "colors": array of 4 hex color strings (e.g. ["#bg", "#c1", "#c2", "#c3"])

Preset mode indices:
${presetList}

2. Modifying GLSL:
If the user asks you to write or edit a shader, respond with your normal explanation and output the full GLSL code inside a standard markdown code block starting with \`\`\`glsl. The studio will automatically intercept this block and compile it in the Monaco editor. Keep code fully compatible with WebGL 1.0 (GLSL ES 1.0) - use highp precision, constant loop bounds, and explicit float types (e.g. 1.0, not 1).

Current active state:
- Mode/Preset index: ${P.mode} (${PRESETS[P.mode]?.full})
- Seed: ${P.seed}
- Colors: ${JSON.stringify(P.colors)}
- Speed: ${P.speed}, Scale: ${P.scale}, Density: ${P.density}, Distort: ${P.distort}, Warp: ${P.warp}, Detail: ${P.detail}, Grain: ${P.grain}
`;
}

// ── State Variables ──────────────────────────────────────
const chatMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

// ── API Keys ─────────────────────────────────────────────
function getApiKey(): string {
  const keyInput = $('aiApiKey') as HTMLInputElement | null;
  return keyInput?.value.trim() || '';
}

// ── 1. Neural Texture Generation ─────────────────────────
async function generateNeuralTexture(): Promise<void> {
  const promptEl = $('aiImgPrompt') as HTMLTextAreaElement;
  const modelEl = $('aiImgModel') as HTMLSelectElement;
  const statusEl = $('aiImgStatus');
  const genBtn = $('btnAIImgGen') as HTMLButtonElement;

  const prompt = promptEl.value.trim();
  if (!prompt) {
    statusEl.textContent = 'Please enter a prompt first.';
    return;
  }

  statusEl.textContent = 'Generating texture via Pollinations... 🐝';
  statusEl.style.color = 'var(--accent)';
  genBtn.disabled = true;

  try {
    const seed = Math.floor(Math.random() * 1000000);
    const model = modelEl.value;
    const key = getApiKey();
    
    let url = `/pollinations-image/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seed}&model=${model}`;
    if (key) {
      url += `&key=${encodeURIComponent(key)}`;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevent CORS taint on WebGL canvas
    img.onload = () => {
      loadTexture(img);
      
      // Update parameters
      P.mix = 0.50;
      P.pixel = 0.00;

      // Update AI inputs & labels
      const mixRange = $('aiImgMix') as HTMLInputElement;
      const mixVal = $('aiImgMixVal');
      const pixelRange = $('aiImgPixel') as HTMLInputElement;
      const pixelVal = $('aiImgPixelVal');

      if (mixRange) mixRange.value = '0.50';
      if (mixVal) mixVal.textContent = '0.50';
      if (pixelRange) pixelRange.value = '0.00';
      if (pixelVal) pixelVal.textContent = '0.00';

      // Update main panel previews for image overlay
      const imgThumb = $('imgThumb') as HTMLImageElement | null;
      const imgPreview = $('imgPreview') as HTMLDivElement | null;
      const imgStatus = $('imgStatus') as HTMLDivElement | null;
      if (imgThumb) imgThumb.src = img.src;
      if (imgPreview) imgPreview.style.display = 'block';
      if (imgStatus) imgStatus.textContent = '512×512';

      window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
      
      statusEl.textContent = 'Neural texture applied successfully! 🟢';
      statusEl.style.color = '';
      genBtn.disabled = false;
      logToTerminal(`neural texture generated: "${prompt.slice(0, 30)}..."`, 'ok');
    };
    img.onerror = () => {
      statusEl.textContent = 'Failed to load generated texture. 🔴';
      statusEl.style.color = 'var(--term-accent, var(--accent))';
      genBtn.disabled = false;
      logToTerminal('failed to download neural texture from pollinations', 'err');
    };
    img.src = url;
  } catch (err) {
    statusEl.textContent = 'Error: ' + (err as Error).message;
    statusEl.style.color = 'var(--term-accent, var(--accent))';
    genBtn.disabled = false;
    logToTerminal('error generating neural texture: ' + (err as Error).message, 'err');
  }
}

function removeNeuralTexture(): void {
  clearTexture();
  P.mix = 0.00;
  P.pixel = 0.00;

  const mixRange = $('aiImgMix') as HTMLInputElement;
  const mixVal = $('aiImgMixVal');
  const pixelRange = $('aiImgPixel') as HTMLInputElement;
  const pixelVal = $('aiImgPixelVal');

  if (mixRange) mixRange.value = '0.00';
  if (mixVal) mixVal.textContent = '0.00';
  if (pixelRange) pixelRange.value = '0.00';
  if (pixelVal) pixelVal.textContent = '0.00';

  const imgPreview = $('imgPreview') as HTMLDivElement | null;
  const imgFile = $('imgFile') as HTMLInputElement | null;
  const imgStatus = $('imgStatus') as HTMLDivElement | null;
  if (imgPreview) imgPreview.style.display = 'none';
  if (imgFile) imgFile.value = '';
  if (imgStatus) imgStatus.textContent = '';

  window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
  logToTerminal('neural texture cleared', 'info');
  
  const statusEl = $('aiImgStatus');
  if (statusEl) statusEl.textContent = 'Texture removed';
}

// ── 2. Apply Custom AI Configurations ────────────────────
function applyMotionConfig(config: Partial<Params & { colors: Palette }>): void {
  window.dispatchEvent(new CustomEvent('lumen:historyBefore'));

  let appliedCount = 0;

  // Preset Mode
  if (typeof config.mode === 'number' && config.mode >= 0 && config.mode < PRESETS.length) {
    P.mode = config.mode;
    applyPresetUI();
    appliedCount++;
  }

  // Seed
  if (typeof config.seed === 'number') {
    setSeed(config.seed);
    appliedCount++;
  }

  // Palette
  if (Array.isArray(config.colors) && config.colors.length === 4) {
    setPalette(config.colors as Palette);
    appliedCount++;
  }

  // Sliders
  const sliderKeys: SliderKey[] = ['speed', 'scale', 'density', 'distort', 'warp', 'detail', 'grain'];
  sliderKeys.forEach(k => {
    if (typeof config[k] === 'number') {
      setSlider(k, Math.max(0, Math.min(1, config[k] as number)));
      appliedCount++;
    }
  });

  if (appliedCount > 0) {
    window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
    logToTerminal(`applied ${appliedCount} AI style configurations`, 'ok');
  }
}

// ── 3. Semantic Style Assistant (Prompt-to-Preset) ───────
async function applySemanticStyling(): Promise<void> {
  const promptEl = $('aiPresetPrompt') as HTMLTextAreaElement;
  const statusEl = $('aiPresetStatus');
  const applyBtn = $('btnAIPresetApply') as HTMLButtonElement;

  const prompt = promptEl.value.trim();
  if (!prompt) {
    statusEl.textContent = 'Please enter a description first.';
    return;
  }

  statusEl.textContent = 'Analyzing style with Pollinations LLM... 🧠';
  statusEl.style.color = 'var(--accent)';
  applyBtn.disabled = true;

  try {
    const key = getApiKey();
    const systemPrompt = `You are a shader director. You map user aesthetic prompts to settings for /motion (a WebGL shader studio).
Output ONLY a JSON block containing adjustments to apply. DO NOT output code fences or conversational text. Return ONLY the JSON object.

Format:
{
  "mode": number (0-31),
  "seed": number (0-9999, optional),
  "speed": float (0.0 to 1.0, optional),
  "scale": float (0.0 to 1.0, optional),
  "density": float (0.0 to 1.0, optional),
  "distort": float (0.0 to 1.0, optional),
  "warp": float (0.0 to 1.0, optional),
  "detail": float (0.0 to 1.0, optional),
  "grain": float (0.0 to 1.0, optional),
  "colors": [hexColor1, hexColor2, hexColor3, hexColor4] (array of 4 strings, optional)
}

Preset indices reference:
${PRESETS.map((p, idx) => `${idx}: ${p.full}`).join(', ')}`;

    const url = '/pollinations-text/openai';
    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'openai'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'Authorization': `Bearer ${key}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const text = await response.text();
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*/, '').replace(/```$/, '').trim();
    }

    const config = JSON.parse(cleaned);
    applyMotionConfig(config);

    statusEl.textContent = 'AI style settings applied successfully! ✨';
    statusEl.style.color = '';
    applyBtn.disabled = false;
  } catch (err) {
    statusEl.textContent = 'Failed to apply style: ' + (err as Error).message;
    statusEl.style.color = 'var(--term-accent, var(--accent))';
    applyBtn.disabled = false;
    logToTerminal('failed to apply semantic styling: ' + (err as Error).message, 'err');
  }
}

// ── 4. Chat Co-Pilot ─────────────────────────────────────
function appendChatMessage(sender: 'user' | 'assistant' | 'system', text: string): void {
  const historyEl = $('aiChatHistory');
  if (!historyEl) return;

  const msgWrap = document.createElement('div');
  msgWrap.style.marginBottom = '6px';
  
  const nameSpan = document.createElement('span');
  nameSpan.style.fontWeight = 'bold';
  
  if (sender === 'user') {
    nameSpan.textContent = 'You: ';
    nameSpan.style.color = 'var(--accent-bright, var(--accent))';
  } else if (sender === 'assistant') {
    nameSpan.textContent = 'Co-Pilot: ';
    nameSpan.style.color = '#a3be8c';
  } else {
    nameSpan.textContent = 'System: ';
    nameSpan.style.color = 'var(--dim)';
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  textSpan.style.whiteSpace = 'pre-wrap';

  msgWrap.append(nameSpan, textSpan);
  historyEl.appendChild(msgWrap);
  historyEl.scrollTop = historyEl.scrollHeight;
}

async function sendChatMessage(): Promise<void> {
  const inputEl = $('aiChatInput') as HTMLInputElement;
  const sendBtn = $('btnAIChatSend') as HTMLButtonElement;
  
  const text = inputEl.value.trim();
  if (!text) return;

  appendChatMessage('user', text);
  inputEl.value = '';
  inputEl.disabled = true;
  sendBtn.disabled = true;

  // Initialize message logs if empty
  if (chatMessages.length === 0) {
    chatMessages.push({ role: 'system', content: getChatSystemPrompt() });
  } else {
    // Keep system prompt updated with current slider values
    chatMessages[0].content = getChatSystemPrompt();
  }

  chatMessages.push({ role: 'user', content: text });

  try {
    const key = getApiKey();
    const url = '/pollinations-text/openai';
    const payload = {
      messages: chatMessages,
      model: 'openai'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'Authorization': `Bearer ${key}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const reply = await response.text();
    chatMessages.push({ role: 'assistant', content: reply });

    // Clean up conversational reply
    let userVisibleText = reply;
    
    // 1. Intercept :::motion-config blocks
    const configMatch = reply.match(/:::motion-config([\s\S]*?):::/);
    if (configMatch) {
      try {
        const configJson = JSON.parse(configMatch[1].trim());
        applyMotionConfig(configJson);
        userVisibleText = userVisibleText.replace(configMatch[0], '\n*(applied parameters)*');
      } catch (e) {
        logToTerminal('failed to parse co-pilot configuration block', 'err');
      }
    }

    // 2. Intercept ```glsl code blocks
    const glslMatch = reply.match(/```glsl([\s\S]*?)```/);
    if (glslMatch) {
      try {
        const glslCode = glslMatch[1].trim();
        updateShaderSource(glslCode);
        userVisibleText = userVisibleText.replace(glslMatch[0], '\n*(compiled and loaded custom shader)*');
        logToTerminal('compiled co-pilot shader source code', 'ok');
      } catch (e) {
        logToTerminal('failed to load custom co-pilot shader', 'err');
      }
    }

    appendChatMessage('assistant', userVisibleText.trim());
  } catch (err) {
    appendChatMessage('system', 'Error: ' + (err as Error).message);
    logToTerminal('co-pilot message delivery failed: ' + (err as Error).message, 'err');
  } finally {
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

// ── Initialization ───────────────────────────────────────
export function initAI(): void {
  // Texture Generation bindings
  $('btnAIImgGen').onclick = generateNeuralTexture;
  $('btnAIImgRemove').onclick = removeNeuralTexture;

  // Mix & Pixel slider inputs
  const mixInput = $('aiImgMix') as HTMLInputElement;
  const mixVal = $('aiImgMixVal');
  mixInput.addEventListener('input', () => {
    P.mix = parseFloat(mixInput.value);
    mixVal.textContent = P.mix.toFixed(2);
    
    // Also sync the standard image slider if it exists in another panel
    // Note: P.mix is shared globally, we just force WebGL to redraw
    window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
  });

  const pixelInput = $('aiImgPixel') as HTMLInputElement;
  const pixelVal = $('aiImgPixelVal');
  pixelInput.addEventListener('input', () => {
    P.pixel = parseFloat(pixelInput.value);
    pixelVal.textContent = P.pixel.toFixed(2);
    window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
  });

  // Semantic Presets bindings
  $('btnAIPresetApply').onclick = applySemanticStyling;

  // Chat/Co-Pilot bindings
  $('btnAIChatSend').onclick = sendChatMessage;
  $('aiChatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
    }
  });

  // Load publishable key from localStorage if it exists to be nice
  const savedKey = localStorage.getItem('lumen-pollinations-key');
  const keyInput = $('aiApiKey') as HTMLInputElement | null;
  if (keyInput && savedKey) {
    keyInput.value = savedKey;
  }
  if (keyInput) {
    keyInput.addEventListener('change', () => {
      localStorage.setItem('lumen-pollinations-key', keyInput.value.trim());
    });
  }
}
