# Visual Language Reference

> A reference for what constitutes good design — principles, patterns, and anti-patterns.

---

## The Foundation: Good Design Is Invisible

When design works, you don't notice it. You notice the content, the experience, the feeling. Bad design draws attention to itself — awkward spacing, confusing hierarchy, visual noise.

Good design has three properties:
1. **Clarity** — the user knows what to do without thinking
2. **Consistency** — every element follows the same rules
3. **Atmosphere** — the site has a mood, a feeling, a point of view

---

## Visual Hierarchy

The single most important concept in design. Hierarchy tells the eye where to go:

### Size Hierarchy

```
H1: 48–64px  — hero statement (one per page)
H2: 28–36px  — section titles
H3: 18–24px  — subsection titles
Body: 14–16px — readable content
Small: 11–12px — labels, metadata, captions
Micro: 9–10px — tags, timestamps, micro-copy
```

### Weight Hierarchy

- **Bold** for headings, important data, active states
- **Regular** for body text, descriptions
- **Never use thin/light** for UI text — it disappears on dark backgrounds
- Minimum weight: 400 for body, 500 for labels, 600+ for headings

### Color Hierarchy

```
Primary text:    #f4f4f6  (brightest — headings, active labels)
Secondary text:  #b8b8c0  (default body, most content)
Tertiary text:   #55555e  (hints, labels, disabled)
Accent:          #e03a3a  (interactive, selected, active)
Surface:         #08080a  (background void)
Panel:           #0e0e12  (raised surfaces)
Border:          #1c1c22  (structure, separation)
```

### Spacing Hierarchy

```
Tight:    4–8px    — between related items (icon + label)
Default:  12–16px  — between paragraphs, form fields
Comfortable: 24–32px — between groups of related content
Spacious:  48–64px  — between major sections
Grand:     96–128px — page-level section breaks
```

---

## Grid Systems

### The 4px Grid

Every measurement is a multiple of 4:

```
4px   — hairline gaps, icon padding
8px   — compact spacing, inline elements
12px  — standard gap, form field spacing
16px  — paragraph spacing, card padding
24px  — section gaps, sidebar padding
32px  — component spacing
48px  — section breaks
64px  — major whitespace
96px  — hero sections
128px — page-level breathing room
```

### CSS Grid for Layout

```css
.studio {
    display: grid;
    grid-template-columns: 48px 1fr 290px;
    grid-template-rows: 1fr 24px;
    grid-template-areas:
        "activity stage panel"
        "status   status status";
    height: 100vh;
    gap: 0;
}
```

Grid gap is 0 for full-bleed layouts. Borders and background color define separation.

### The 12-Column Grid (Marketing Pages)

```
|  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  | 10  | 11  | 12  |
|←─────────────── centered content (max 1200px) ────────────────────────→|
```

- Text blocks: columns 2–7 (5 of 12)
- Images: columns 1–8 or full width
- Feature grids: 3×4 or 4×3

---

## Color Psychology

| Color | Feeling | In Web Design |
|-------|---------|---------------|
| **Deep black** (#08080a) | Void, infinite, cinematic | Default background for creative tools |
| **Soft white** (#b8b8c0) | Calm, readable, not harsh | Primary text on dark backgrounds |
| **Red accent** (#e03a3a) | Energy, urgency, passion | Active states, CTAs, recording indicators |
| **Blue** (#3b82f6) | Trust, depth, technology | Links, info states, calm UIs |
| **Green** (#22c55e) | Success, growth, health | Confirmation, positive feedback |
| **Amber** (#f59e0b) | Warning, warmth, attention | Caution states, highlights |
| **Purple** (#a855f7) | Creative, premium, mysterious | Creative tools, luxury brands |
| **Pink** (#ec4899) | Playful, modern, energetic | Consumer apps, social platforms |

### Color Rules

1. **One accent.** Never two competing accent colors.
2. **Muted backgrounds.** Pure saturated colors as backgrounds exhaust the eye.
3. **Context-aware.** Red means "stop" in forms, "recording" in studios, "error" in logs.
4. **Accessible contrast.** WCAG AA: 4.5:1 for text, 3:1 for large text. Test every combination.

---

## Typography Deep Dive

### Font Pairing

| UI + Mono | Use Case |
|-----------|----------|
| `Inter` + `JetBrains Mono` | Creative tools, data dashboards |
| `Space Grotesk` + `Fira Code` | Developer-focused, technical |
| `Satoshi` + `JetBrains Mono` | Modern SaaS, marketing |
| `General Sans` + `DM Mono` | Design tools, portfolios |

**Rule:** One sans-serif for UI, one monospace for data. Never mix two sans-serifs.

### Readability Rules

- **Line height:** 1.5× for body text, 1.2× for headings
- **Line length:** 50–75 characters max. Anything wider is hard to track.
- **Paragraph spacing:** 1em between paragraphs (same as line height)
- **Left-aligned** for body text. Center-aligned only for short text (headings, CTAs).
- **Never justify** text on the web — it creates rivers of whitespace.

### Type Scale (Modular, 1.250× Major Third)

```
9px    — micro
11px   — caption
14px   — body
18px   — subhead
22px   — h3
28px   — h2
35px   — h1
44px   — display
55px   — hero
```

---

## The Dark Mode Formula

### Why Dark Works for Creative Tools

1. **Content glow** — the canvas/artifact is the light source
2. **Reduced distraction** — chrome disappears, content dominates
3. **Professional aesthetic** — studios, theaters, galleries use darkness
4. **Technical accuracy** — color perception is more accurate on dark backgrounds

### Dark Mode Color Architecture

```
Layer 0: Void        #08080a  (deepest background)
Layer 1: Panel       #0e0e12  (raised surfaces, cards)
Layer 2: Elevated    #141418  (modals, popovers)
Layer 3: Overlay     #1a1a1e  (dropdowns, tooltips)

Border:  #1c1c22     (barely visible structure)
Text:    #b8b8c0     (default)
Bright:  #f4f4f6     (headings, active)
Dim:     #55555e     (hints, disabled)
Accent:  #e03a3a     (interactive)
```

### Avoiding Pure Black

`#000000` is too harsh — it creates an infinite void that's uncomfortable. `#08080a` (near-black with a hint of blue) feels deep without being oppressive.

---

## Anti-Patterns

| Pattern | Why It's Bad |
|---------|-------------|
| **Centered long text** | Unreadable — lines are too long |
| **Thin/light fonts on dark** | Invisible on low-brightness screens |
| **Rainbow gradients** | No hierarchy, no intent, looks default |
| **Rounded corners >8px** | Childish for professional tools |
| **Drop shadows on everything** | Visual noise, no depth hierarchy |
| **Auto-playing video** | Aggressive, wastes bandwidth |
| **Parallax on every section** | Motion sickness, no focal point |
| **Sticky headers on mobile** | Eat 50%+ of viewport height |
| **Cookie banners that overlay everything** | Hostile to user experience |
| **Infinite scroll without indicators** | No sense of progress or location |
| **Skeleton screens that shimmer** | Annoying, looks like loading forever |
| **3D transforms on UI elements** |眩晕, readability killer |
| **Text on busy images** | Use overlay or blur to create contrast |
| **Icons without labels** | Universal recognition is a myth |
| **Gradient text on gradient background** | Visual collision |

---

## Accessibility Is Design

Accessibility isn't a constraint — it's a quality marker:

- **Color contrast** — WCAG AA minimum (4.5:1 text, 3:1 large text)
- **Focus indicators** — every interactive element must have a visible focus ring
- **Reduced motion** — respect `prefers-reduced-motion: reduce`
- **Keyboard navigation** — Tab through every interactive element in logical order
- **Screen reader labels** — `aria-label` on icon-only buttons
- **Text scaling** — use `rem`/`em` so text scales with user preferences
- **Semantic HTML** — `<button>`, `<nav>`, `<main>`, `<article>` — not all `<div>`

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## Design Systems in a Nutshell

A design system is not a component library. It's a set of **decisions**:

| Decision | Examples |
|----------|----------|
| **Color** | 5 surface colors, 1 accent, 3 text levels |
| **Type** | 2 families, 7 sizes, 3 weights |
| **Spacing** | 4px grid, 10 sizes |
| **Motion** | 4 durations, 4 easings |
| **Layout** | 1 grid system, 3 breakpoint patterns |
| **Component** | Button, Input, Select, Card, Panel, Modal |

Once these decisions are made and documented, every new screen or component is just **assembly** — not invention.

---

## Related

- [[Design Principles]] — lumen·local's generative design tenets
- [[Design Philosophy]] — shader art philosophy
- [[Modern Web Design]] — contemporary web aesthetic
- [[Color Theory for Shaders]] — palette construction for generative art
