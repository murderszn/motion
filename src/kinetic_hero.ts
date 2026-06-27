export interface KineticHeroOptions {
  text?: string
  speed?: number
  amplitude?: number
  stagger?: number
  duration?: number
  accentColor?: string
  textColor?: string
  fontSize?: number
}

export function initKineticHero(
  canvas: HTMLCanvasElement,
  opts: KineticHeroOptions = {},
): void {
  const {
    text = '/motion',
    speed = 2.4,
    amplitude = 0.12,
    stagger = 0.38,
    duration = 3.5,
    accentColor = '#e03a3a',
    textColor = '#ffffff',
    fontSize = 0,
  } = opts

  const ctx = canvas.getContext('2d')!
  let animId = 0
  let startTime = 0

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function getFontSize(w: number): number {
    if (fontSize > 0) return fontSize
    return Math.max(32, Math.min(w * 0.14, 92))
  }

  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - Math.min(t, 1), 3)
  }

  function draw(time: number) {
    if (!startTime) startTime = time
    const elapsed = (time - startTime) / 1000

    resize()

    const decay = elapsed >= duration ? 0 : 1 - easeOutCubic(elapsed / duration)

    const { width, height } = canvas.getBoundingClientRect()
    const fs = getFontSize(width)
    ctx.font = `600 ${fs}px Inter, -apple-system, sans-serif`
    ctx.textBaseline = 'middle'

    const chars = text.split('')
    const charWidths = chars.map(c => ctx.measureText(c).width)
    const totalWidth = charWidths.reduce((a, b) => a + b, 0)
    const cx = width / 2
    const cy = height / 2

    ctx.clearRect(0, 0, width, height)

    let curX = cx - totalWidth / 2
    chars.forEach((c, idx) => {
      const p = elapsed * speed + idx * stagger
      const wave = Math.sin(p) * fs * amplitude * decay
      const waveScale = 1 + Math.sin(p * 0.7) * 0.04 * decay

      ctx.save()
      ctx.translate(curX + charWidths[idx] / 2, cy + wave)
      ctx.scale(waveScale, 1 / waveScale)

      ctx.fillStyle = c === '/' ? accentColor : textColor
      ctx.textAlign = 'center'
      ctx.fillText(c, 0, 0)
      ctx.restore()

      curX += charWidths[idx]
    })

    if (elapsed < duration) {
      animId = requestAnimationFrame(draw)
    }
  }

  animId = requestAnimationFrame(draw)

  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(animId)
    startTime = 0
    if (document.hidden) return
    animId = requestAnimationFrame(draw)
  })
  ro.observe(canvas)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId)
    } else if (startTime === 0 || (performance.now() - startTime) / 1000 < duration) {
      animId = requestAnimationFrame(draw)
    }
  })
}
