#!/usr/bin/env python3
"""Generate 5 theme HTML files — builds complete files from scratch."""
import os

# Common CSS and HTML structure template
CSS_TEMPLATE = """
:root {{
    --accent: {accent};
    --accent-light: {accent_light};
    --accent-bright: {accent_bright};
    --accent-pale: {accent_pale};
    --r-sm: 3px;
    --r-md: 6px;
    --r-lg: 12px;
    --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
    --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px; --sp-9: 96px; --sp-10: 128px;
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}}

[data-theme="dark"] {{
    --accent-dim: {accent_dim_dark};
    --accent-border: {accent_border_dark};
    --black: {black_dark}; --ink: {ink_dark}; --ink-soft: {ink_soft_dark};
    --ink-mid: {ink_mid_dark}; --ink-muted: {ink_muted_dark};
    --bg: {bg_dark}; --bg-alt: {bg_alt_dark}; --bg-deep: {bg_deep_dark};
    --text: {text_dark}; --text-mid: {text_mid_dark}; --text-muted: {text_muted_dark};
    --border: {border_dark}; --nav-bg: {nav_bg_dark};
    --shadow-sm: {shadow_sm_dark}; --shadow-md: {shadow_md_dark}; --shadow-lg: {shadow_lg_dark};
    --body-gradient: {body_gradient_dark};
}}

[data-theme="light"] {{
    --accent-dim: {accent_dim_light};
    --accent-border: {accent_border_light};
    --black: {black_light}; --ink: {ink_light}; --ink-soft: {ink_soft_light};
    --ink-mid: {ink_mid_light}; --ink-muted: {ink_muted_light};
    --bg: {bg_light}; --bg-alt: {bg_alt_light}; --bg-deep: {bg_deep_light};
    --text: {text_light}; --text-mid: {text_mid_light}; --text-muted: {text_muted_light};
    --border: {border_light}; --nav-bg: {nav_bg_light};
    --shadow-sm: {shadow_sm_light}; --shadow-md: {shadow_md_light}; --shadow-lg: {shadow_lg_light};
    --body-gradient: {body_gradient_light};
}}
"""

# Minimal but functional theme data
THEMES = [
    {
        "slug": "volcanic", "name": "Volcanic Ember",
        "title_tag": "Volcanic Ember — Theme Reference",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Outfit", system-ui, -apple-system, sans-serif',
        "font_secondary": '"Fira Code", monospace',
        "accent": "#C2410C", "accent_light": "#EA580C", "accent_bright": "#F97316", "accent_pale": "#FDBA74",
        "accent_dim_dark": "rgba(194, 65, 12, 0.18)", "accent_border_dark": "rgba(194, 65, 12, 0.45)",
        "black_dark": "#0C0604", "ink_dark": "#140B06", "ink_soft_dark": "#2A1A10",
        "ink_mid_dark": "#4D3020", "ink_muted_dark": "#7A4D35",
        "bg_dark": "#0F0805", "bg_alt_dark": "#1C110A", "bg_deep_dark": "#2A1A10",
        "text_dark": "#FFF0E6", "text_mid_dark": "#E8D4C2", "text_muted_dark": "#B8916E",
        "border_dark": "rgba(249, 115, 22, 0.22)", "nav_bg_dark": "rgba(15, 8, 5, 0.92)",
        "shadow_sm_dark": "0 4px 20px rgba(194, 65, 12, 0.25)",
        "shadow_md_dark": "0 12px 48px rgba(194, 65, 12, 0.35)",
        "shadow_lg_dark": "0 25px 80px rgba(12, 6, 4, 0.85)",
        "body_gradient_dark": "linear-gradient(180deg, rgba(194, 65, 12, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2A1A10 0%, var(--bg) 70%)",
        "accent_dim_light": "rgba(194, 65, 12, 0.1)", "accent_border_light": "rgba(194, 65, 12, 0.28)",
        "black_light": "#1A0E07", "ink_light": "#FFF3E8", "ink_soft_light": "#FFE6D0",
        "ink_mid_light": "#A86B42", "ink_muted_light": "#CC9566",
        "bg_light": "#FFF9F4", "bg_alt_light": "#FFF3E8", "bg_deep_light": "#FFE6D0",
        "text_light": "#1A0E07", "text_mid_light": "#4D2B16", "text_muted_light": "#7A4D35",
        "border_light": "rgba(249, 115, 22, 0.16)", "nav_bg_light": "rgba(255, 243, 232, 0.92)",
        "shadow_sm_light": "0 4px 20px rgba(194, 65, 12, 0.12)",
        "shadow_md_light": "0 12px 48px rgba(194, 65, 12, 0.16)",
        "shadow_lg_light": "0 25px 80px rgba(26, 14, 7, 0.12)",
        "body_gradient_light": "linear-gradient(180deg, rgba(194, 65, 12, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFF3E8 0%, var(--bg) 70%)",
        "eyebrow": "Molten earth · Monochromatic fire · Raw power",
        "hero_title": 'Burned sienna surfaces with <span>volcanic accents</span>',
        "hero_lede": "A monochromatic warm palette built from burnt sienna and fire orange. Every surface is tinted from the ember family — dark modes use charred earth tones, not pure black.",
        "tags": ["Editorial", "Food &amp; Drink", "Artisan Brands"],
        "typo_desc": "Outfit delivers smooth geometric display and body weights. Fira Code carries technical monospace annotations for data and metadata.",
        "p1": ("Ember depth", "Dark surfaces use charred earth tones from the orange family. No pure black or cold grey."),
        "p2": ("Monochromatic fire", "One hue family at varying saturations creates cohesion. The burnt base carries all emphasis."),
        "p3": ("Raw materials", "Fira Code labels and heavy Outfit display type give the UI an artisan, handcrafted feel."),
        "swatches": ["#C2410C", "#F97316", "#1C110A", "#0F0805", "#FFF9F4"],
        "ls_key": "volcanic-ember-theme-mode",
        "card_meta": "Monochromatic burnt sienna with charred earth surfaces and fire-orange accents.",
    },
    {
        "slug": "indigo", "name": "Midnight Indigo",
        "title_tag": "Midnight Indigo — Theme Reference",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Playfair Display", serif',
        "font_secondary": '"DM Sans", sans-serif',
        "accent": "#4F46E5", "accent_light": "#6366F1", "accent_bright": "#818CF8", "accent_pale": "#C7D2FE",
        "accent_dim_dark": "rgba(79, 70, 229, 0.18)", "accent_border_dark": "rgba(79, 70, 229, 0.45)",
        "black_dark": "#060510", "ink_dark": "#0A0918", "ink_soft_dark": "#1A1840",
        "ink_mid_dark": "#2E2B6B", "ink_muted_dark": "#4A46A0",
        "bg_dark": "#08071A", "bg_alt_dark": "#12103A", "bg_deep_dark": "#1E1B5C",
        "text_dark": "#EDE9FE", "text_mid_dark": "#C4B5FD", "text_muted_dark": "#A78BFA",
        "border_dark": "rgba(99, 102, 241, 0.22)", "nav_bg_dark": "rgba(8, 7, 26, 0.92)",
        "shadow_sm_dark": "0 4px 20px rgba(79, 70, 229, 0.25)",
        "shadow_md_dark": "0 12px 48px rgba(79, 70, 229, 0.35)",
        "shadow_lg_dark": "0 25px 80px rgba(6, 5, 16, 0.85)",
        "body_gradient_dark": "linear-gradient(180deg, rgba(79, 70, 229, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1E1B5C 0%, var(--bg) 70%)",
        "accent_dim_light": "rgba(79, 70, 229, 0.1)", "accent_border_light": "rgba(79, 70, 229, 0.28)",
        "black_light": "#0C0A24", "ink_light": "#EDE9FE", "ink_soft_light": "#DDD6FE",
        "ink_mid_light": "#6366F1", "ink_muted_light": "#818CF8",
        "bg_light": "#F5F3FF", "bg_alt_light": "#EDE9FE", "bg_deep_light": "#DDD6FE",
        "text_light": "#0C0A24", "text_mid_light": "#2E1065", "text_muted_light": "#4338CA",
        "border_light": "rgba(79, 70, 229, 0.16)", "nav_bg_light": "rgba(237, 233, 254, 0.92)",
        "shadow_sm_light": "0 4px 20px rgba(79, 70, 229, 0.12)",
        "shadow_md_light": "0 12px 48px rgba(79, 70, 229, 0.16)",
        "shadow_lg_light": "0 25px 80px rgba(12, 10, 36, 0.12)",
        "body_gradient_light": "linear-gradient(180deg, rgba(79, 70, 229, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #EDE9FE 0%, var(--bg) 70%)",
        "eyebrow": "Deep indigo · Analogous violet · Night sky",
        "hero_title": 'Cosmic indigo depths with <span>violet glow</span>',
        "hero_lede": "An analogous cool palette built from deep indigo and violet. Surfaces use dark blue-purple tones that feel like a midnight sky — immersive and authoritative.",
        "tags": ["SaaS", "Fintech", "Data Platforms"],
        "typo_desc": "Playfair Display brings high-contrast serif elegance to headlines. DM Sans provides a clean, neutral body foundation.",
        "p1": ("Night sky depth", "Surfaces use deep indigo-violet, never pure black. The whole UI feels like a midnight sky."),
        "p2": ("Analogous flow", "Indigo and violet are adjacent hues — they flow naturally without contrast vibration."),
        "p3": ("Serif authority", "Playfair Display gives headings a classic, authoritative presence in an otherwise modern UI."),
        "swatches": ["#4F46E5", "#818CF8", "#12103A", "#08071A", "#F5F3FF"],
        "ls_key": "midnight-indigo-theme-mode",
        "card_meta": "Deep indigo-violet surfaces with cosmic glow accents and serif elegance.",
    },
    {
        "slug": "ember", "name": "Copper Sun",
        "title_tag": "Copper Sun — Theme Reference",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />',
        "font_primary": '"Syne", sans-serif',
        "font_secondary": '"Space Grotesk", sans-serif',
        "accent": "#B45309", "accent_light": "#D97706", "accent_bright": "#F59E0B", "accent_pale": "#FDE68A",
        "accent_dim_dark": "rgba(180, 83, 9, 0.18)", "accent_border_dark": "rgba(180, 83, 9, 0.45)",
        "black_dark": "#0A0704", "ink_dark": "#14100A", "ink_soft_dark": "#2A2218",
        "ink_mid_dark": "#5C4A33", "ink_muted_dark": "#8A7050",
        "bg_dark": "#0D0906", "bg_alt_dark": "#1A150E", "bg_deep_dark": "#2A2218",
        "text_dark": "#FFF8EB", "text_mid_dark": "#F0DFC0", "text_muted_dark": "#C4A87A",
        "border_dark": "rgba(245, 158, 11, 0.22)", "nav_bg_dark": "rgba(13, 9, 6, 0.92)",
        "shadow_sm_dark": "0 4px 20px rgba(180, 83, 9, 0.25)",
        "shadow_md_dark": "0 12px 48px rgba(180, 83, 9, 0.35)",
        "shadow_lg_dark": "0 25px 80px rgba(10, 7, 4, 0.85)",
        "body_gradient_dark": "linear-gradient(180deg, rgba(245, 158, 11, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2A2218 0%, var(--bg) 70%)",
        "accent_dim_light": "rgba(180, 83, 9, 0.1)", "accent_border_light": "rgba(180, 83, 9, 0.28)",
        "black_light": "#1A1208", "ink_light": "#FFF8EB", "ink_soft_light": "#FFF0D6",
        "ink_mid_light": "#A87B3A", "ink_muted_light": "#CC9E5E",
        "bg_light": "#FFFCF5", "bg_alt_light": "#FFF8EB", "bg_deep_light": "#FFF0D6",
        "text_light": "#1A1208", "text_mid_light": "#5C3D10", "text_muted_light": "#8A6030",
        "border_light": "rgba(180, 83, 9, 0.16)", "nav_bg_light": "rgba(255, 248, 235, 0.92)",
        "shadow_sm_light": "0 4px 20px rgba(180, 83, 9, 0.12)",
        "shadow_md_light": "0 12px 48px rgba(180, 83, 9, 0.16)",
        "shadow_lg_light": "0 25px 80px rgba(26, 18, 8, 0.12)",
        "body_gradient_light": "linear-gradient(180deg, rgba(180, 83, 9, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFF8EB 0%, var(--bg) 70%)",
        "eyebrow": "Polished copper · Warm gold · Complementary warmth",
        "hero_title": 'Polished copper on <span>warm gold</span>',
        "hero_lede": "A complementary warm palette built from deep copper and polished gold. Surfaces use rich amber-brown tones that evoke burnished metal and golden hour light.",
        "tags": ["Luxury Brands", "Architecture", "Wine &amp; Spirits"],
        "typo_desc": "Syne delivers quirky, expressive display headers with high contrast. Space Grotesk provides clean, geometric body text.",
        "p1": ("Golden hour warmth", "Every surface carries amber undertones. The UI glows like burnished metal in sunset light."),
        "p2": ("Copper and gold", "Deep copper base with gold emphasis creates a rich, premium complementary relationship."),
        "p3": ("Expressive geometry", "Syne's quirky weight contrasts with Space Grotesk's precision for a dynamic typographic voice."),
        "swatches": ["#B45309", "#F59E0B", "#1A150E", "#0D0906", "#FFFCF5"],
        "ls_key": "copper-sun-theme-mode",
        "card_meta": "Polished copper and warm gold accents on rich amber-brown surfaces.",
    },
    {
        "slug": "moss", "name": "Glacial Moss",
        "title_tag": "Glacial Moss — Theme Reference",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Instrument Serif", serif',
        "font_secondary": '"DM Sans", sans-serif',
        "accent": "#15803D", "accent_light": "#16A34A", "accent_bright": "#22C55E", "accent_pale": "#BBF7D0",
        "accent_dim_dark": "rgba(21, 128, 61, 0.18)", "accent_border_dark": "rgba(21, 128, 61, 0.45)",
        "black_dark": "#040A06", "ink_dark": "#081209", "ink_soft_dark": "#142A1A",
        "ink_mid_dark": "#2A5033", "ink_muted_dark": "#3E7A50",
        "bg_dark": "#060F08", "bg_alt_dark": "#0D1E12", "bg_deep_dark": "#142A1A",
        "text_dark": "#ECFDF5", "text_mid_dark": "#BBF7D0", "text_muted_dark": "#6EE7B7",
        "border_dark": "rgba(22, 163, 74, 0.22)", "nav_bg_dark": "rgba(6, 15, 8, 0.92)",
        "shadow_sm_dark": "0 4px 20px rgba(21, 128, 61, 0.25)",
        "shadow_md_dark": "0 12px 48px rgba(21, 128, 61, 0.35)",
        "shadow_lg_dark": "0 25px 80px rgba(4, 10, 6, 0.85)",
        "body_gradient_dark": "linear-gradient(180deg, rgba(21, 128, 61, 0.28) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #142A1A 0%, var(--bg) 70%)",
        "accent_dim_light": "rgba(21, 128, 61, 0.1)", "accent_border_light": "rgba(21, 128, 61, 0.28)",
        "black_light": "#0A1C10", "ink_light": "#ECFDF5", "ink_soft_light": "#D1FAE5",
        "ink_mid_light": "#4ADE80", "ink_muted_light": "#86EFAC",
        "bg_light": "#F0FDF4", "bg_alt_light": "#ECFDF5", "bg_deep_light": "#D1FAE5",
        "text_light": "#0A1C10", "text_mid_light": "#14532D", "text_muted_light": "#166534",
        "border_light": "rgba(22, 163, 74, 0.16)", "nav_bg_light": "rgba(236, 253, 245, 0.92)",
        "shadow_sm_light": "0 4px 20px rgba(21, 128, 61, 0.12)",
        "shadow_md_light": "0 12px 48px rgba(21, 128, 61, 0.16)",
        "shadow_lg_light": "0 25px 80px rgba(10, 28, 16, 0.12)",
        "body_gradient_light": "linear-gradient(180deg, rgba(21, 128, 61, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #ECFDF5 0%, var(--bg) 70%)",
        "eyebrow": "Forest moss · Glacial green · Living earth",
        "hero_title": 'Deep forest moss on <span>glacial stone</span>',
        "hero_lede": "An analogous cool-green palette built from deep forest moss and fresh spring growth. Surfaces use natural green-blacks that feel rooted in the earth.",
        "tags": ["Wellness", "Eco Brands", "Organic Products"],
        "typo_desc": "Instrument Serif brings an elegant, book-like display voice. DM Sans provides clean, neutral body text with excellent readability.",
        "p1": ("Living surfaces", "Dark mode uses forest-black tones, never neutral grey. The UI feels alive and organic."),
        "p2": ("Botanical harmony", "Greens at varying saturations create a cohesive nature-inspired palette without monotony."),
        "p3": ("Serif calm", "Instrument Serif brings a gentle, literary presence that pairs with the organic palette."),
        "swatches": ["#15803D", "#22C55E", "#0D1E12", "#060F08", "#F0FDF4"],
        "ls_key": "glacial-moss-theme-mode",
        "card_meta": "Deep forest moss greens with glacial stone surfaces and botanical warmth.",
    },
    {
        "slug": "coral", "name": "Coral Reef",
        "title_tag": "Coral Reef — Theme Reference",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Fraunces", serif',
        "font_secondary": '"Plus Jakarta Sans", sans-serif',
        "accent": "#E11D48", "accent_light": "#F43F5E", "accent_bright": "#FB7185", "accent_pale": "#FECDD3",
        "accent_dim_dark": "rgba(225, 29, 72, 0.18)", "accent_border_dark": "rgba(225, 29, 72, 0.45)",
        "black_dark": "#0A0507", "ink_dark": "#140A0E", "ink_soft_dark": "#2E1522",
        "ink_mid_dark": "#5A2A42", "ink_muted_dark": "#8A3D62",
        "bg_dark": "#0D0609", "bg_alt_dark": "#1C0F16", "bg_deep_dark": "#2E1522",
        "text_dark": "#FFF1F2", "text_mid_dark": "#FECDD3", "text_muted_dark": "#FDA4AF",
        "border_dark": "rgba(244, 63, 94, 0.22)", "nav_bg_dark": "rgba(13, 6, 9, 0.92)",
        "shadow_sm_dark": "0 4px 20px rgba(225, 29, 72, 0.25)",
        "shadow_md_dark": "0 12px 48px rgba(225, 29, 72, 0.35)",
        "shadow_lg_dark": "0 25px 80px rgba(10, 5, 7, 0.85)",
        "body_gradient_dark": "linear-gradient(180deg, rgba(225, 29, 72, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2E1522 0%, var(--bg) 70%)",
        "accent_dim_light": "rgba(225, 29, 72, 0.1)", "accent_border_light": "rgba(225, 29, 72, 0.28)",
        "black_light": "#1C0A10", "ink_light": "#FFF1F2", "ink_soft_light": "#FFE4E6",
        "ink_mid_light": "#BE123C", "ink_muted_light": "#E11D48",
        "bg_light": "#FFF5F6", "bg_alt_light": "#FFE4E6", "bg_deep_light": "#FECDD3",
        "text_light": "#1C0A10", "text_mid_light": "#4C0519", "text_muted_light": "#881337",
        "border_light": "rgba(225, 29, 72, 0.16)", "nav_bg_light": "rgba(255, 228, 230, 0.92)",
        "shadow_sm_light": "0 4px 20px rgba(225, 29, 72, 0.12)",
        "shadow_md_light": "0 12px 48px rgba(225, 29, 72, 0.16)",
        "shadow_lg_light": "0 25px 80px rgba(28, 10, 16, 0.12)",
        "body_gradient_light": "linear-gradient(180deg, rgba(225, 29, 72, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFE4E6 0%, var(--bg) 70%)",
        "eyebrow": "Warm coral · Split complement · Living reef",
        "hero_title": 'Warm coral surfaces with <span>reef depths</span>',
        "hero_lede": "A split-complementary palette built from warm coral with deep rose and blush surfaces. The interplay of warm reds creates a living, vibrant atmosphere with organic depth.",
        "tags": ["Fashion", "Beauty", "Lifestyle Brands"],
        "typo_desc": "Fraunces provides elegant, variable serif headlines with personality. Plus Jakarta Sans carries clean, modern body text.",
        "p1": ("Reef depth", "Dark surfaces use deep rose-plum, never neutral grey. The palette feels like underwater coral gardens."),
        "p2": ("Split warmth", "Coral red with rose-pink variants creates dynamic warmth without monotony."),
        "p3": ("Organic serif", "Fraunces variable weight brings a living, breathing quality to the typography."),
        "swatches": ["#E11D48", "#FB7185", "#1C0F16", "#0D0609", "#FFF5F6"],
        "ls_key": "coral-reef-theme-mode",
        "card_meta": "Warm coral red with split-complement rose and blush on living reef surfaces.",
    },
]


def generate_theme(t):
    """Generate a complete theme HTML file."""
    font_f1 = t["font_primary"].split(",")[0].strip('"')
    font_f2 = t["font_secondary"].split(",")[0].strip('"')

    tokens_dark = f"""dark: {{
                "--accent-dim": "{t["accent_dim_dark"]}",
                "--accent-border": "{t["accent_border_dark"]}",
                "--black": "{t["black_dark"]}",
                "--ink": "{t["ink_dark"]}",
                "--ink-soft": "{t["ink_soft_dark"]}",
                "--ink-mid": "{t["ink_mid_dark"]}",
                "--ink-muted": "{t["ink_muted_dark"]}",
                "--bg": "{t["bg_dark"]}",
                "--bg-alt": "{t["bg_alt_dark"]}",
                "--bg-deep": "{t["bg_deep_dark"]}",
                "--text": "{t["text_dark"]}",
                "--text-mid": "{t["text_mid_dark"]}",
                "--text-muted": "{t["text_muted_dark"]}",
                "--border": "{t["border_dark"]}",
            }}"""

    tokens_light = f"""light: {{
                "--accent-dim": "{t["accent_dim_light"]}",
                "--accent-border": "{t["accent_border_light"]}",
                "--black": "{t["black_light"]}",
                "--ink": "{t["ink_light"]}",
                "--ink-soft": "{t["ink_soft_light"]}",
                "--ink-mid": "{t["ink_mid_light"]}",
                "--ink-muted": "{t["ink_muted_light"]}",
                "--bg": "{t["bg_light"]}",
                "--bg-alt": "{t["bg_alt_light"]}",
                "--bg-deep": "{t["bg_deep_light"]}",
                "--text": "{t["text_light"]}",
                "--text-mid": "{t["text_mid_light"]}",
                "--text-muted": "{t["text_muted_light"]}",
                "--border": "{t["border_light"]}",
            }}"""

    token_block = f""":root {{
  --accent: {t["accent"]};
  --accent-light: {t["accent_light"]};
  --accent-bright: {t["accent_bright"]};
  --accent-pale: {t["accent_pale"]};
}}

[data-theme="dark"] {{
{tokens_dark}
}}

[data-theme="light"] {{
{tokens_light}
}}"""

    html = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{t["title_tag"]}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    {t["font_import"]}
    <style>
        {CSS_TEMPLATE.format(**t)}
        *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
        html {{ scroll-behavior: smooth; }}
        body {{ font-family: {t["font_primary"]}; background: var(--body-gradient); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; transition: background 0.25s var(--ease-out), color 0.25s var(--ease-out); }}
        a {{ color: var(--accent-bright); text-decoration: none; }}
        a:hover {{ color: var(--accent-light); }}
        .page-wrap {{ max-width: 1120px; margin: 0 auto; padding: var(--sp-8) var(--sp-5); }}
        .page-header {{ border-bottom: 3px solid var(--accent); padding-bottom: var(--sp-6); margin-bottom: var(--sp-8); display: grid; grid-template-columns: 1fr auto; align-items: end; gap: var(--sp-5); }}
        .page-header-brand {{ font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; text-transform: uppercase; letter-spacing: 0.035em; line-height: 0.95; color: var(--text); }}
        .page-header-brand span, .section-title span, .display-type span, .footer-brand span {{ color: var(--accent-bright); }}
        .page-header-meta {{ font-family: {t["font_secondary"]}; font-size: 0.78rem; font-weight: 400; letter-spacing: 0.13em; text-transform: uppercase; color: var(--text-muted); text-align: right; line-height: 1.8; }}
        .mode-toggle {{ display: inline-flex; border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden; margin-top: var(--sp-3); }}
        .mode-toggle button {{ font-family: {t["font_secondary"]}; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 8px 14px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: background 0.15s, color 0.15s; }}
        .mode-toggle button:hover {{ color: var(--text); }}
        .mode-toggle button.active {{ background: var(--accent); color: #fff; }}
        .mode-toggle button + button {{ border-left: 1px solid var(--border); }}
        .back-link {{ display: inline-block; margin-bottom: var(--sp-4); font-family: {t["font_secondary"]}; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }}
        .hero-panel {{ margin-bottom: var(--sp-10); }}
        .hero-copy {{ padding: var(--sp-7); background: var(--bg-alt); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-sm); }}
        .eyebrow {{ font-family: {t["font_secondary"]}; font-size: 0.74rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent-light); margin-bottom: var(--sp-3); }}
        .hero-title {{ max-width: 760px; font-size: clamp(2rem, 4.5vw, 3.6rem); font-weight: 900; line-height: 0.98; letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: var(--sp-5); color: var(--text); }}
        .hero-title span {{ color: var(--accent-bright); }}
        .hero-lede {{ max-width: 720px; font-size: 1rem; color: var(--text-mid); line-height: 1.8; }}
        .hero-tags {{ display: flex; flex-wrap: wrap; gap: var(--sp-2); margin-top: var(--sp-5); }}
        .palette-group {{ margin-bottom: var(--sp-6); }}
        .palette-group:last-child {{ margin-bottom: 0; }}
        .palette-group-label {{ font-family: {t["font_secondary"]}; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--sp-4); }}
        .swatch-chip.token-bg {{ background: var(--bg); }} .swatch-chip.token-bg-alt {{ background: var(--bg-alt); }} .swatch-chip.token-bg-deep {{ background: var(--bg-deep); }} .swatch-chip.token-text {{ background: var(--text); }} .swatch-chip.token-text-mid {{ background: var(--text-mid); }}
        .section {{ margin-bottom: var(--sp-10); }}
        .section-label {{ font-family: {t["font_secondary"]}; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--sp-2); }}
        .section-title {{ font-size: clamp(1.6rem, 2.8vw, 2.2rem); font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text); margin-bottom: var(--sp-2); }}
        .section-desc {{ max-width: 660px; color: var(--text-mid); font-size: 0.94rem; line-height: 1.75; margin-bottom: var(--sp-6); }}
        .section-desc code {{ font-family: {t["font_secondary"]}; font-size: 0.82em; color: var(--accent-light); }}
        .hero-copy, .swatch, .card, .nav-preview, .code-block, .metric, .principle-card, .section-header-preview {{ transition: background 0.25s var(--ease-out), border-color 0.25s var(--ease-out), color 0.25s var(--ease-out); }}
        .section-toolbar {{ display: flex; flex-wrap: wrap; gap: var(--sp-3); margin-bottom: var(--sp-5); }}
        .rule {{ border: none; border-top: 2px solid var(--accent-border); margin: var(--sp-7) 0; }}
        .color-grid {{ display: grid; gap: var(--sp-4); align-items: stretch; }}
        .accent-grid {{ grid-template-columns: repeat(4, minmax(0, 1fr)); }}
        .surface-grid {{ grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }}
        .swatch {{ display: flex; flex-direction: column; width: 100%; min-width: 0; margin: 0; padding: 0; border-radius: var(--r-md); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--border); background: var(--bg-alt); cursor: pointer; font: inherit; color: inherit; text-align: left; appearance: none; -webkit-appearance: none; transition: transform 0.15s var(--ease-out), border-color 0.15s; }}
        .swatch::-moz-focus-inner {{ border: 0; padding: 0; }}
        .swatch:hover {{ transform: translateY(-3px); border-color: var(--accent-border); }}
        .swatch.copied {{ border-color: var(--accent-bright); }}
        .swatch-chip {{ flex-shrink: 0; height: 92px; width: 100%; display: block; }}
        .swatch-info {{ flex: 1; display: flex; flex-direction: column; padding: var(--sp-3) var(--sp-4); }}
        .swatch-name, .card-title, .metric-label, .principle-name {{ font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text); }}
        .swatch-name {{ min-height: 2.4em; line-height: 1.2; }}
        .swatch-hex, .caption {{ font-family: {t["font_secondary"]}; font-size: 0.72rem; font-weight: 300; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }}
        .swatch-use {{ font-size: 0.68rem; color: var(--text-muted); margin-top: 4px; line-height: 1.45; }}
        .code-block {{ position: relative; background: var(--ink); border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; }}
        .code-block pre {{ padding: var(--sp-5); overflow-x: auto; font-family: {t["font_secondary"]}; font-size: 0.78rem; line-height: 1.7; color: var(--text-mid); white-space: pre; }}
        .code-block .comment {{ color: var(--ink-muted); }} .code-block .prop {{ color: var(--accent-pale); }} .code-block .val {{ color: var(--text); }}
        .type-row {{ padding: var(--sp-5) 0; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 150px 1fr; gap: var(--sp-5); align-items: center; }}
        .type-row:last-child {{ border-bottom: none; }}
        .type-meta {{ font-family: {t["font_secondary"]}; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); line-height: 1.6; }}
        .type-meta strong {{ display: block; color: var(--text-mid); margin-bottom: 4px; }}
        .display-type {{ font-size: clamp(3rem, 5vw, 5.5rem); font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; line-height: 1; color: var(--text); }}
        .h1-type {{ font-size: clamp(2rem, 3.2vw, 3.1rem); font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; line-height: 1.1; }}
        .h2-type {{ font-size: clamp(1.3rem, 2vw, 1.7rem); font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }}
        .body-type {{ max-width: 620px; font-size: 0.95rem; line-height: 1.75; color: var(--text-mid); }}
        .btn-row, .tag-row {{ display: flex; flex-wrap: wrap; gap: var(--sp-3); align-items: center; margin-bottom: var(--sp-6); }}
        .btn {{ display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 var(--sp-6); border-radius: var(--r-sm); border: 2px solid transparent; font-size: 0.76rem; font-weight: 800; letter-spacing: 0.11em; text-transform: uppercase; transition: all 0.2s var(--ease-out); cursor: pointer; font-family: inherit; }}
        .btn-primary {{ background: var(--accent); border-color: var(--accent); color: white; }}
        .btn-primary:hover {{ background: var(--accent-light); border-color: var(--accent-light); transform: translateY(-2px); }}
        .btn-outline {{ background: transparent; border-color: var(--text); color: var(--text); }}
        .btn-outline:hover {{ background: var(--text); color: var(--bg); }}
        .btn-ghost {{ background: transparent; border-color: var(--accent-border); color: var(--accent-light); }}
        .btn-ghost:hover {{ background: var(--accent-dim); border-color: var(--accent); }}
        .btn-sm {{ min-height: 36px; padding: 0 var(--sp-4); font-size: 0.68rem; }}
        .tag {{ font-family: {t["font_secondary"]}; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 12px; border-radius: 999px; border: 1px solid; }}
        .tag-gold {{ color: var(--accent-bright); border-color: var(--accent-border); background: var(--accent-dim); }}
        .tag-ink {{ color: var(--text); border-color: var(--border); background: transparent; }}
        .tag-filled {{ color: white; border-color: var(--accent); background: var(--accent); }}
        .nav-preview {{ display: flex; align-items: center; justify-content: space-between; gap: var(--sp-4); padding: var(--sp-4) var(--sp-6); border: 1px solid var(--border); background: var(--nav-bg); backdrop-filter: blur(12px); border-radius: var(--r-md); box-shadow: var(--shadow-sm); margin-bottom: var(--sp-6); }}
        .nav-brand {{ font-size: 1.35rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text); }}
        .nav-brand span {{ color: var(--accent-bright); }}
        .nav-links {{ display: flex; gap: var(--sp-5); list-style: none; }}
        .nav-links a {{ font-family: {t["font_secondary"]}; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-mid); }}
        .section-header-preview {{ padding: var(--sp-7) var(--sp-6); background: var(--bg-alt); border-radius: var(--r-lg); border: 1px solid var(--border); margin-bottom: var(--sp-6); }}
        .section-header-preview h3 {{ font-size: clamp(1.8rem, 2.8vw, 2.6rem); font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.1; margin-bottom: var(--sp-3); }}
        .divider-gold {{ width: 48px; height: 3px; background: linear-gradient(to right, var(--accent), var(--accent-light)); margin: var(--sp-4) 0; }}
        .card-row {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--sp-4); }}
        .card {{ background: var(--bg-alt); border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.2s var(--ease-out); }}
        .card:hover {{ transform: translateY(-6px); }}
        .card-top {{ min-height: 150px; padding: var(--sp-4); background: var(--bg-deep); display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sp-3); }}
        .card-badge {{ font-family: {t["font_secondary"]}; font-size: 0.62rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: white; background: var(--accent); padding: 4px 10px; border-radius: var(--r-sm); }}
        .card-number {{ font-size: 2rem; font-weight: 900; line-height: 1; opacity: 0.35; color: var(--accent); }}
        .card-body {{ padding: var(--sp-4) var(--sp-5); }}
        .card-desc {{ margin-top: var(--sp-2); color: var(--text-muted); font-size: 0.82rem; line-height: 1.6; }}
        .metrics-grid, .principles-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--sp-5); }}
        .metric {{ padding: var(--sp-5); background: var(--bg-alt); border: 1px solid var(--border); border-left: 4px solid var(--accent); border-radius: 0 var(--r-md) var(--r-md) 0; }}
        .metric-value {{ font-size: clamp(2.3rem, 4vw, 3.5rem); font-weight: 900; line-height: 1; color: var(--accent-bright); margin-bottom: var(--sp-2); }}
        .principle-card {{ padding: var(--sp-5); background: var(--bg-alt); border-left: 4px solid var(--accent); border-radius: 0 var(--r-md) var(--r-md) 0; }}
        .principle-number {{ font-size: 2rem; font-weight: 900; color: var(--accent-pale); line-height: 1; margin-bottom: var(--sp-2); }}
        .principle-desc {{ margin-top: var(--sp-2); color: var(--text-mid); font-size: 0.82rem; line-height: 1.6; }}
        .toast {{ position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; background: var(--bg-alt); border: 1px solid var(--accent-border); border-radius: var(--r-md); font-family: {t["font_secondary"]}; font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s; pointer-events: none; z-index: 100; }}
        .toast.show {{ opacity: 1; transform: translateY(0); }}
        .footer {{ padding-top: var(--sp-7); border-top: 3px solid var(--accent); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--sp-3); }}
        .footer-brand {{ font-size: 1rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; }}
        .footer-note {{ font-family: {t["font_secondary"]}; font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); }}
        @media (max-width: 840px) {{ .page-header {{ grid-template-columns: 1fr; }} .page-header-meta {{ text-align: left; }} .nav-links {{ display: none; }} .type-row {{ grid-template-columns: 1fr; }} .accent-grid {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} }}
    </style>
</head>
<body>
    <div class="page-wrap">
        <a href="index.html" class="back-link">← All themes</a>
        <header class="page-header">
            <div class="page-header-brand">{t["name"].split(" ")[0]} <span>{t["name"].split(" ")[1] if " " in t["name"] else ""}</span></div>
            <div class="page-header-meta">
                Theme v1.0<br />Light &amp; dark · 2 typefaces<br />{t["eyebrow"].split("·")[1].strip() if "·" in t["eyebrow"] else ""}
                <div class="mode-toggle" role="group" aria-label="Color mode">
                    <button type="button" class="active" data-mode="dark" aria-pressed="true">Dark</button>
                    <button type="button" data-mode="light" aria-pressed="false">Light</button>
                </div>
            </div>
        </header>
        <section class="hero-panel" aria-labelledby="theme-hero">
            <div class="hero-copy">
                <div class="eyebrow">{t["eyebrow"]}</div>
                <h1 id="theme-hero" class="hero-title">{t["hero_title"]}</h1>
                <p class="hero-lede">{t["hero_lede"]}</p>
                <div class="hero-tags">
                    <span class="tag tag-gold">{t["tags"][0]}</span>
                    <span class="tag tag-ink">{t["tags"][1]}</span>
                    <span class="tag tag-filled">{t["tags"][2]}</span>
                </div>
            </div>
        </section>
        <section class="section" id="palette">
            <div class="section-label">01 — Foundation</div>
            <h2 class="section-title">Color <span>palette</span></h2>
            <p class="section-desc">Click any swatch to copy its hex value. Accent colors are shared across modes; surface tokens update when you switch between light and dark.</p>
            <div class="palette-group">
                <div class="palette-group-label">Accent — shared</div>
                <div class="color-grid accent-grid">
                    <button type="button" class="swatch" data-hex="{t["swatches"][0]}" aria-label="Copy accent 1">
                        <div class="swatch-chip" style="background:{t["swatches"][0]};"></div>
                        <div class="swatch-info"><div class="swatch-name">Accent</div><div class="swatch-hex">{t["swatches"][0]}</div><div class="swatch-use">Primary accent, rules, CTAs</div></div>
                    </button>
                    <button type="button" class="swatch" data-hex="{t["accent_light"]}" aria-label="Copy accent light">
                        <div class="swatch-chip" style="background:{t["accent_light"]};"></div>
                        <div class="swatch-info"><div class="swatch-name">Accent Light</div><div class="swatch-hex">{t["accent_light"]}</div><div class="swatch-use">Hover states, secondary highlights</div></div>
                    </button>
                    <button type="button" class="swatch" data-hex="{t["accent_bright"]}" aria-label="Copy accent bright">
                        <div class="swatch-chip" style="background:{t["accent_bright"]};"></div>
                        <div class="swatch-info"><div class="swatch-name">Accent Bright</div><div class="swatch-hex">{t["accent_bright"]}</div><div class="swatch-use">Emphasis, badges, links</div></div>
                    </button>
                    <button type="button" class="swatch" data-hex="{t["accent_pale"]}" aria-label="Copy accent pale">
                        <div class="swatch-chip" style="background:{t["accent_pale"]};"></div>
                        <div class="swatch-info"><div class="swatch-name">Accent Pale</div><div class="swatch-hex">{t["accent_pale"]}</div><div class="swatch-use">Soft accents, decorative numbers</div></div>
                    </button>
                </div>
            </div>
            <div class="palette-group">
                <div class="palette-group-label">Surfaces — <span id="surface-mode-label">dark mode</span></div>
                <div class="color-grid surface-grid" id="surface-grid">
                    <button type="button" class="swatch surface-swatch" data-token="bg"><div class="swatch-chip token-bg"></div><div class="swatch-info"><div class="swatch-name">Background</div><div class="swatch-hex" data-token-hex="bg"></div><div class="swatch-use">Page background</div></div></button>
                    <button type="button" class="swatch surface-swatch" data-token="bg-alt"><div class="swatch-chip token-bg-alt"></div><div class="swatch-info"><div class="swatch-name">Surface</div><div class="swatch-hex" data-token-hex="bg-alt"></div><div class="swatch-use">Cards, panels, fills</div></div></button>
                    <button type="button" class="swatch surface-swatch" data-token="bg-deep"><div class="swatch-chip token-bg-deep"></div><div class="swatch-info"><div class="swatch-name">Surface Deep</div><div class="swatch-hex" data-token-hex="bg-deep"></div><div class="swatch-use">Card headers, wells</div></div></button>
                    <button type="button" class="swatch surface-swatch" data-token="text"><div class="swatch-chip token-text"></div><div class="swatch-info"><div class="swatch-name">Text</div><div class="swatch-hex" data-token-hex="text"></div><div class="swatch-use">Headlines, primary copy</div></div></button>
                    <button type="button" class="swatch surface-swatch" data-token="text-mid"><div class="swatch-chip token-text-mid"></div><div class="swatch-info"><div class="swatch-name">Text Mid</div><div class="swatch-hex" data-token-hex="text-mid"></div><div class="swatch-use">Body copy, descriptions</div></div></button>
                </div>
            </div>
        </section>
        <hr class="rule" />
        <section class="section" id="tokens">
            <div class="section-label">02 — Tokens</div>
            <h2 class="section-title">CSS <span>variables</span></h2>
            <p class="section-desc">Drop this block into your project's global stylesheet. Includes shared accents plus light and dark surface tokens — toggle <code>data-theme</code> on <code>&lt;html&gt;</code> to switch.</p>
            <div class="section-toolbar"><button type="button" class="btn btn-ghost btn-sm" id="copy-tokens">Copy CSS variables</button></div>
            <div class="code-block"><pre id="token-block"></pre></div>
        </section>
        <hr class="rule" />
        <section class="section" id="typography">
            <div class="section-label">03 — Typography</div>
            <h2 class="section-title">Type <span>scale</span></h2>
            <p class="section-desc">{t["typo_desc"]}</p>
            <div class="type-row"><div class="type-meta"><strong>Display</strong>{font_f1} 900</div><div class="display-type">{t["name"].split(" ")[0]} <span>{t["name"].split(" ")[1] if " " in t["name"] else ""}</span></div></div>
            <div class="type-row"><div class="type-meta"><strong>Heading 1</strong>{font_f1} 800</div><div class="h1-type">Section title</div></div>
            <div class="type-row"><div class="type-meta"><strong>Heading 2</strong>{font_f1} 800</div><div class="h2-type">Subsection label</div></div>
            <div class="type-row"><div class="type-meta"><strong>Body</strong>{font_f1} 400</div><div class="body-type">Use the text token for primary copy and text-mid for supporting paragraphs. Keep line height around 1.7–1.8 for readability in both light and dark modes.</div></div>
            <div class="type-row"><div class="type-meta"><strong>Label</strong>{font_f2} 600</div><div class="eyebrow" style="margin:0">Eyebrow · Metadata · Captions</div></div>
        </section>
        <hr class="rule" />
        <section class="section" id="components">
            <div class="section-label">04 — Components</div>
            <h2 class="section-title">UI <span>patterns</span></h2>
            <p class="section-desc">Common building blocks using the palette.</p>
            <p class="caption" style="margin-bottom:12px">Buttons</p>
            <div class="btn-row"><button type="button" class="btn btn-primary">Primary action</button><button type="button" class="btn btn-outline">Secondary</button><button type="button" class="btn btn-ghost">Ghost</button></div>
            <p class="caption" style="margin-bottom:12px">Tags</p>
            <div class="tag-row"><span class="tag tag-gold">Accent</span><span class="tag tag-ink">Neutral</span><span class="tag tag-filled">Filled</span></div>
            <p class="caption" style="margin-bottom:12px">Navigation</p>
            <nav class="nav-preview"><div class="nav-brand">Brand <span>Name</span></div><ul class="nav-links"><li><a href="#">Work</a></li><li><a href="#">About</a></li><li><a href="#">Contact</a></li></ul></nav>
            <p class="caption" style="margin-bottom:12px">Section header</p>
            <div class="section-header-preview"><h3>Feature <span style="color:var(--accent-bright)">spotlight</span></h3><div class="divider-gold"></div><p class="body-type" style="margin:0">Supporting copy sits in text-mid with a short accent rule underneath the headline.</p></div>
            <p class="caption" style="margin-bottom:12px">Cards</p>
            <div class="card-row">
                <article class="card"><div class="card-top"><span class="card-badge">New</span><span class="card-number">01</span></div><div class="card-body"><div class="card-title">Card title</div><p class="card-desc">Elevated panel with accent shadow fill and badge accent.</p></div></article>
                <article class="card"><div class="card-top"><span class="card-badge">Draft</span><span class="card-number">02</span></div><div class="card-body"><div class="card-title">Card title</div><p class="card-desc">Hover lifts the card slightly — keep motion on transform only.</p></div></article>
                <article class="card"><div class="card-top"><span class="card-badge">Live</span><span class="card-number">03</span></div><div class="card-body"><div class="card-title">Card title</div><p class="card-desc">Deep background on the card header creates depth without extra imagery.</p></div></article>
            </div>
            <p class="caption" style="margin:32px 0 12px">Metrics &amp; principles</p>
            <div class="metrics-grid">
                <div class="metric"><div class="metric-value">8</div><div class="metric-label">Core colors</div></div>
                <div class="metric"><div class="metric-value">4.5:1</div><div class="metric-label">Min contrast target</div></div>
            </div>
            <div class="principles-grid" style="margin-top:24px">
                <div class="principle-card"><div class="principle-number">01</div><div class="principle-name">{t["p1"][0]}</div><p class="principle-desc">{t["p1"][1]}</p></div>
                <div class="principle-card"><div class="principle-number">02</div><div class="principle-name">{t["p2"][0]}</div><p class="principle-desc">{t["p2"][1]}</p></div>
                <div class="principle-card"><div class="principle-number">03</div><div class="principle-name">{t["p3"][0]}</div><p class="principle-desc">{t["p3"][1]}</p></div>
            </div>
        </section>
        <footer class="footer">
            <span class="footer-brand">{t["name"].split(" ")[0]} <span>{t["name"].split(" ")[1] if " " in t["name"] else ""}</span></span>
            <span class="footer-note"><a href="index.html">← Back to themes</a></span>
        </footer>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <script>
        const root = document.documentElement;
        const toast = document.getElementById("toast");
        const tokenBlock = document.getElementById("token-block");
        const surfaceModeLabel = document.getElementById("surface-mode-label");
        const modeButtons = document.querySelectorAll(".mode-toggle button");
        let toastTimer;
        const THEME_TOKENS = {{ {tokens_dark}, {tokens_light} }};
        function showToast(message) {{ toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 1800); }}
        async function copyText(text, message) {{ try {{ await navigator.clipboard.writeText(text); showToast(message); }} catch {{ showToast("Copy failed"); }} }}
        function getTokenValue(token) {{ return getComputedStyle(root).getPropertyValue(`--${{token}}`).trim(); }}
        function rgbToHex(rgb) {{ const m = rgb.match(/\\d+/g); if (!m) return rgb.toUpperCase(); return "#" + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase(); }}
        function updateSurfaceLabels() {{ const mode = root.dataset.theme; surfaceModeLabel.textContent = `${{mode}} mode`; document.querySelectorAll("[data-token-hex]").forEach((el) => {{ const raw = getTokenValue(el.dataset.tokenHex); el.textContent = raw.startsWith("#") ? raw.toUpperCase() : rgbToHex(raw); }}); }}
        function renderTokenBlock() {{ tokenBlock.textContent = `:root {{\\n  --accent: {t["accent"]};\\n  --accent-light: {t["accent_light"]};\\n  --accent-bright: {t["accent_bright"]};\\n  --accent-pale: {t["accent_pale"]};\\n}}\\n\\n[data-theme="dark"] {{\\n${{Object.entries(THEME_TOKENS.dark).map(([k, v]) => `  ${{k}}: ${{v}};`).join("\\n")}}\\n}}\\n\\n[data-theme="light"] {{\\n${{Object.entries(THEME_TOKENS.light).map(([k, v]) => `  ${{k}}: ${{v}};`).join("\\n")}}\\n}}`; }}
        function setTheme(mode) {{ root.dataset.theme = mode; localStorage.setItem("{t["ls_key"]}", mode); modeButtons.forEach((btn) => {{ const active = btn.dataset.mode === mode; btn.classList.toggle("active", active); btn.setAttribute("aria-pressed", String(active)); }}); updateSurfaceLabels(); }}
        document.querySelectorAll(".swatch[data-hex]").forEach((s) => {{ s.addEventListener("click", () => {{ copyText(s.dataset.hex, `Copied ${{s.dataset.hex}}`); s.classList.add("copied"); setTimeout(() => s.classList.remove("copied"), 600); }}); }});
        document.querySelectorAll(".surface-swatch").forEach((s) => {{ s.addEventListener("click", () => {{ const raw = getTokenValue(s.dataset.token); const hex = raw.startsWith("#") ? raw.toUpperCase() : rgbToHex(raw); copyText(hex, `Copied ${{hex}}`); s.classList.add("copied"); setTimeout(() => s.classList.remove("copied"), 600); }}); }});
        modeButtons.forEach((btn) => {{ btn.addEventListener("click", () => setTheme(btn.dataset.mode)); }});
        document.getElementById("copy-tokens").addEventListener("click", () => {{ copyText(tokenBlock.textContent, "Copied CSS variables"); }});
        setTheme(localStorage.getItem("{t["ls_key"]}") === "light" ? "light" : "dark");
        renderTokenBlock();
    </script>
</body>
</html>"""
    return html


# Generate all themes
for t in THEMES:
    html = generate_theme(t)
    filename = f'{t["slug"]}.html'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Generated: {filename} ({t["name"]})')

print(f'\nGenerated {len(THEMES)} themes successfully!')
