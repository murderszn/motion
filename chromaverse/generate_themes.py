import re
import os
import json

themes = [
    {
        "id": "01",
        "name": "Crimson Horizon",
        "slug": "crimson",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Montserrat", system-ui, -apple-system, sans-serif',
        "font_secondary": '"Josefin Sans", sans-serif',
        "accents": ["#D92D0D", "#E44623", "#FC390D", "#F8A070"],
        "accent_names": ["Crimson", "Crimson Light", "Crimson Bright", "Crimson Pale"],
        "accent_uses": ["Primary accent, rules, CTAs", "Hover states, secondary highlights", "Emphasis, badges, links", "Soft accents, decorative numbers"],
        "dark": {
            "black": "#0A0604", "ink": "#100A0A", "ink_soft": "#2C1F1A", "ink_mid": "#5C4033", "ink_muted": "#8A6655",
            "bg": "#0F0A07", "bg_alt": "#1C140F", "bg_deep": "#2C1F1A", "text": "#F5EDE4", "text_mid": "#D4C3B0", "text_muted": "#A88A6F",
            "border": "rgba(244, 57, 13, 0.22)", "accent_dim": "rgba(217, 45, 13, 0.18)", "accent_border": "rgba(217, 45, 13, 0.45)",
            "nav_bg": "rgba(16, 10, 10, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 45, 13, 0.25)",
            "shadow_md": "0 12px 48px rgba(217, 45, 13, 0.35)", "shadow_lg": "0 25px 80px rgba(10, 6, 4, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 45, 13, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2C1F1A 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1C120E", "ink": "#EDE4D8", "ink_soft": "#E0D4C6", "ink_mid": "#7A6558", "ink_muted": "#A89484",
            "bg": "#FAF5EF", "bg_alt": "#F2EBE2", "bg_deep": "#E6D9CC", "text": "#1C120E", "text_mid": "#4A3528", "text_muted": "#7A6558",
            "border": "rgba(217, 45, 13, 0.16)", "accent_dim": "rgba(217, 45, 13, 0.1)", "accent_border": "rgba(217, 45, 13, 0.28)",
            "nav_bg": "rgba(242, 235, 226, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 45, 13, 0.12)",
            "shadow_md": "0 12px 48px rgba(217, 45, 13, 0.16)", "shadow_lg": "0 25px 80px rgba(28, 18, 14, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 45, 13, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F2EBE2 0%, var(--bg) 70%)"
        },
        "eyebrow": "Warm ember · Dual mode · Bold contrast",
        "title": "Fiery accents on <span>warm foundations</span>",
        "lede": "A high-impact palette built around blazing crimson with paired light and dark surfaces. Toggle modes above to preview how accents, typography, and components adapt across contexts.",
        "tags": ["SaaS & Enterprise", "Editorial & Literary", "Creative & Portfolios"],
        "typography_desc": "Montserrat handles display and UI weight. Josefin Sans carries labels, metadata, and monospace-adjacent detail.",
        "principles": [
            {"number": "01", "name": "Lead with crimson", "desc": "One accent color carries emphasis — rules, badges, and CTAs share the same family."},
            {"number": "02", "name": "Warm, not flat", "desc": "Layer ember gradients and parchment text to avoid a cold dark-mode feel."},
            {"number": "03", "name": "Heavy type", "desc": "Uppercase display at 800–900 weight is the default voice for headlines."}
        ]
    },
    {
        "id": "02",
        "name": "Nordic Frost",
        "slug": "nordic",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Inter", system-ui, -apple-system, sans-serif',
        "font_secondary": '"Fira Code", monospace',
        "accents": ["#88C0D0", "#81A1C1", "#5E81AC", "#4C566A"],
        "accent_names": ["Frost Blue", "Polar Ocean", "Deep Cobalt", "Slate Shadow"],
        "accent_uses": ["Primary highlight, tags, CTAs", "Secondary hover actions", "Vibrant links and highlights", "Subtle metadata and borders"],
        "dark": {
            "black": "#1E222A", "ink": "#242933", "ink_soft": "#2E3440", "ink_mid": "#434C5E", "ink_muted": "#4C566A",
            "bg": "#2E3440", "bg_alt": "#3B4252", "bg_deep": "#2E3440", "text": "#ECEFF4", "text_mid": "#E5E9F0", "text_muted": "#D8DEE9",
            "border": "rgba(136, 192, 208, 0.22)", "accent_dim": "rgba(136, 192, 208, 0.15)", "accent_border": "rgba(136, 192, 208, 0.4)",
            "nav_bg": "rgba(36, 41, 51, 0.92)", "shadow_sm": "0 4px 20px rgba(136, 192, 208, 0.15)",
            "shadow_md": "0 12px 48px rgba(136, 192, 208, 0.25)", "shadow_lg": "0 25px 80px rgba(30, 34, 42, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(136, 192, 208, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 30%, #3B4252 0%, var(--bg) 80%)"
        },
        "light": {
            "black": "#2E3440", "ink": "#ECEFF4", "ink_soft": "#E5E9F0", "ink_mid": "#D8DEE9", "ink_muted": "#4C566A",
            "bg": "#F7FAFC", "bg_alt": "#EDF2F7", "bg_deep": "#E2E8F0", "text": "#2E3440", "text_mid": "#4C566A", "text_muted": "#7B88A1",
            "border": "rgba(136, 192, 208, 0.16)", "accent_dim": "rgba(136, 192, 208, 0.08)", "accent_border": "rgba(136, 192, 208, 0.22)",
            "nav_bg": "rgba(237, 242, 247, 0.92)", "shadow_sm": "0 4px 20px rgba(136, 192, 208, 0.08)",
            "shadow_md": "0 12px 48px rgba(136, 192, 208, 0.12)", "shadow_lg": "0 25px 80px rgba(46, 52, 64, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(136, 192, 208, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #EDF2F7 0%, var(--bg) 70%)"
        },
        "eyebrow": "Cool slate · Polar gradients · Technical Type",
        "title": "Crisp arctic lines on <span>technical foundations</span>",
        "lede": "A calm, highly readable palette inspired by Nordic winter hues, perfect for developers, documentation portals, and complex dashboard interfaces.",
        "tags": ["SaaS & Enterprise", "Technical & Dev Tools", "Minimal & Brutalist"],
        "typography_desc": "Inter handles primary reading weights. Fira Code handles annotations, monospace code, and technical metrics.",
        "principles": [
            {"number": "01", "name": "Preserve negative space", "desc": "Clean spacing lets the cool tones frame content without visual noise."},
            {"number": "02", "name": "Technical emphasis", "desc": "Use Fira Code for metrics and badges to double down on utility and precision."},
            {"number": "03", "name": "Muted contrast", "desc": "Keep borders soft and rely on background color blocks to separate sections."}
        ]
    },
    {
        "id": "03",
        "name": "Solar Flare",
        "slug": "solar",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />',
        "font_primary": '"Syne", sans-serif',
        "font_secondary": '"Outfit", sans-serif',
        "accents": ["#FFB000", "#FF6B00", "#FFD266", "#9E6400"],
        "accent_names": ["Solar Amber", "Nova Orange", "Sunlight Gold", "Coronal Deep"],
        "accent_uses": ["Primary brand accent, tags", "High impact CTAs and hover", "Soft decorative lights", "Monochrome details and backgrounds"],
        "dark": {
            "black": "#0E0A07", "ink": "#1A110A", "ink_soft": "#2D1D11", "ink_mid": "#613D1D", "ink_muted": "#8A5C33",
            "bg": "#140D07", "bg_alt": "#2A1B0E", "bg_deep": "#3E2915", "text": "#FFF6EE", "text_mid": "#FFEBDA", "text_muted": "#D4B190",
            "border": "rgba(255, 176, 0, 0.22)", "accent_dim": "rgba(255, 176, 0, 0.15)", "accent_border": "rgba(255, 176, 0, 0.45)",
            "nav_bg": "rgba(26, 17, 10, 0.92)", "shadow_sm": "0 4px 20px rgba(255, 176, 0, 0.2)",
            "shadow_md": "0 12px 48px rgba(255, 176, 0, 0.3)", "shadow_lg": "0 25px 80px rgba(14, 10, 7, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(255, 107, 0, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2A1B0E 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1F140A", "ink": "#FFF1E5", "ink_soft": "#FFE4CC", "ink_mid": "#B37A47", "ink_muted": "#CC9566",
            "bg": "#FFFBF7", "bg_alt": "#FFF1E5", "bg_deep": "#FFE4CC", "text": "#1F140A", "text_mid": "#4D331A", "text_muted": "#805933",
            "border": "rgba(255, 176, 0, 0.16)", "accent_dim": "rgba(255, 176, 0, 0.08)", "accent_border": "rgba(255, 176, 0, 0.25)",
            "nav_bg": "rgba(255, 241, 229, 0.92)", "shadow_sm": "0 4px 20px rgba(255, 107, 0, 0.08)",
            "shadow_md": "0 12px 48px rgba(255, 107, 0, 0.12)", "shadow_lg": "0 25px 80px rgba(31, 20, 10, 0.1)",
            "body_gradient": "linear-gradient(180deg, rgba(255, 107, 0, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFF1E5 0%, var(--bg) 70%)"
        },
        "eyebrow": "Cyber warm · Retro-future · Radiant orange",
        "title": "High energy amber on <span>golden structures</span>",
        "lede": "Vibrant and warm, Solar Flare pairs heavy-weight expressionist headers with glowing solar accents. Excellent for tech startups, product sites, and campaigns.",
        "tags": ["Creative & Portfolios", "SaaS & Enterprise", "Retro & Gaming"],
        "typography_desc": "Syne provides quirky, modern, high-contrast headings. Outfit carries the body text with clean geometric shapes.",
        "principles": [
            {"number": "01", "name": "Vibrant contrast", "desc": "Keep text bright and sharp against deep orange gradients."},
            {"number": "02", "name": "Wide expression", "desc": "Let headings expand. Syne is designed to be expressive and heavy."},
            {"number": "03", "name": "Warm shadows", "desc": "Glow shadows should match the amber family, creating a backlit halo effect."}
        ]
    },
    {
        "id": "04",
        "name": "Emerald Grove",
        "slug": "emerald",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Playfair Display", serif',
        "font_secondary": '"Lora", serif',
        "accents": ["#0A5C36", "#10B981", "#34D399", "#A7F3D0"],
        "accent_names": ["Forest Emerald", "Mint Glow", "Vibrant Sage", "Pale Fern"],
        "accent_uses": ["Primary editorial highlights", "Interactive buttons, tags", "High impact links", "Soft highlight panels"],
        "dark": {
            "black": "#060A08", "ink": "#0D1812", "ink_soft": "#132A1C", "ink_mid": "#224D36", "ink_muted": "#387D59",
            "bg": "#0A140E", "bg_alt": "#132A1C", "bg_deep": "#1B3B27", "text": "#F0FDF4", "text_mid": "#D1FAE5", "text_muted": "#86EFAC",
            "border": "rgba(16, 185, 129, 0.22)", "accent_dim": "rgba(16, 185, 129, 0.18)", "accent_border": "rgba(16, 185, 129, 0.4)",
            "nav_bg": "rgba(13, 24, 18, 0.92)", "shadow_sm": "0 4px 20px rgba(16, 185, 129, 0.2)",
            "shadow_md": "0 12px 48px rgba(16, 185, 129, 0.3)", "shadow_lg": "0 25px 80px rgba(6, 10, 8, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(16, 185, 129, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #132A1C 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0A140E", "ink": "#E6F5EC", "ink_soft": "#D4ECD9", "ink_mid": "#4A6E56", "ink_muted": "#6E9C7E",
            "bg": "#F4FBF7", "bg_alt": "#E6F5EC", "bg_deep": "#D4ECD9", "text": "#0A140E", "text_mid": "#1E3A27", "text_muted": "#3E6B4E",
            "border": "rgba(16, 185, 129, 0.16)", "accent_dim": "rgba(16, 185, 129, 0.08)", "accent_border": "rgba(16, 185, 129, 0.25)",
            "nav_bg": "rgba(230, 245, 236, 0.92)", "shadow_sm": "0 4px 20px rgba(16, 185, 129, 0.08)",
            "shadow_md": "0 12px 48px rgba(16, 185, 129, 0.12)", "shadow_lg": "0 25px 80px rgba(10, 20, 14, 0.1)",
            "body_gradient": "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #E6F5EC 0%, var(--bg) 70%)"
        },
        "eyebrow": "Muted botanical · Editorial serif · Luxury organic",
        "title": "Rich forest foliage in <span>classical grids</span>",
        "lede": "A organic and luxurious theme featuring deep pine green tones and soft sage backgrounds. The serif typography makes it perfect for boutique brands, literary journals, and design studios.",
        "tags": ["Creative & Portfolios", "Editorial & Literary", "Lifestyle & Organic"],
        "typography_desc": "Playfair Display delivers elegant classic serif headers. Lora provides a readable, calm companion for long-form narrative text.",
        "principles": [
            {"number": "01", "name": "Organic structure", "desc": "Keep shapes slightly rounded and use thin, delicate border rules."},
            {"number": "02", "name": "High editorial voice", "desc": "Use serif weights for large displays and italicize key highlight terms."},
            {"number": "03", "name": "Subtle botanical tints", "desc": "Avoid cold greys; all neutrals are warm-tinted with olive and forest greens."}
        ]
    },
    {
        "id": "05",
        "name": "Neon Cyber",
        "slug": "cyber",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Space Grotesk", sans-serif',
        "font_secondary": '"JetBrains Mono", monospace',
        "accents": ["#D946EF", "#06B6D4", "#F472B6", "#A5F3FC"],
        "accent_names": ["Electric Magenta", "Biolume Cyan", "Laser Pink", "Sky Glitch"],
        "accent_uses": ["Vibrant primary highlight", "Secondary interactive states", "Emphasis labels", "Soft background glares"],
        "dark": {
            "black": "#0B0A18", "ink": "#0F0E26", "ink_soft": "#1E1B4B", "ink_mid": "#4C2B80", "ink_muted": "#6E44B3",
            "bg": "#0F0E26", "bg_alt": "#1E1B4B", "bg_deep": "#2E297A", "text": "#FDF4FF", "text_mid": "#E8E2FA", "text_muted": "#C084FC",
            "border": "rgba(217, 70, 239, 0.25)", "accent_dim": "rgba(217, 70, 239, 0.18)", "accent_border": "rgba(217, 70, 239, 0.45)",
            "nav_bg": "rgba(15, 14, 38, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 70, 239, 0.25)",
            "shadow_md": "0 12px 48px rgba(6, 182, 212, 0.35)", "shadow_lg": "0 25px 80px rgba(11, 10, 24, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 70, 239, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1E1B4B 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0F0E26", "ink": "#F3E8FF", "ink_soft": "#E9D5FF", "ink_mid": "#8B5CF6", "ink_muted": "#A78BFA",
            "bg": "#FAF5FF", "bg_alt": "#F3E8FF", "bg_deep": "#E9D5FF", "text": "#0F0E26", "text_mid": "#4C1D95", "text_muted": "#6D28D9",
            "border": "rgba(217, 70, 239, 0.16)", "accent_dim": "rgba(217, 70, 239, 0.08)", "accent_border": "rgba(217, 70, 239, 0.25)",
            "nav_bg": "rgba(243, 232, 255, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 70, 239, 0.1)",
            "shadow_md": "0 12px 48px rgba(6, 182, 212, 0.16)", "shadow_lg": "0 25px 80px rgba(15, 14, 38, 0.1)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 70, 239, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F3E8FF 0%, var(--bg) 70%)"
        },
        "eyebrow": "Futuristic retro · Synthwave · Glowing grid",
        "title": "High intensity neon on <span>deep space</span>",
        "lede": "An energetic design built around glowing magenta and cyan accents, retro-wave grids, and monospaced number overlays. Excellent for tech projects, gaming portals, and digital art studios.",
        "tags": ["Retro & Gaming", "Technical & Dev Tools", "Creative & Portfolios"],
        "typography_desc": "Space Grotesk provides geometric, tech-forward headers. JetBrains Mono delivers strict technical monospace detail.",
        "principles": [
            {"number": "01", "name": "Vibrant retro-tech", "desc": "Lean into heavy borders, dot patterns, and glowing typography states."},
            {"number": "02", "name": "Strict monospace specs", "desc": "Use JetBrains Mono to structure all card figures and small metadata labels."},
            {"number": "03", "name": "Electric gradients", "desc": "Utilize cyan and magenta linear transitions to give headers a light-leak feel."}
        ]
    },
    {
        "id": "06",
        "name": "Desert Dunes",
        "slug": "desert",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600&family=Sora:wght@700;800&display=swap" rel="stylesheet" />',
        "font_primary": '"Sora", sans-serif',
        "font_secondary": '"Plus Jakarta Sans", sans-serif',
        "accents": ["#D97706", "#C2410C", "#F59E0B", "#FDE68A"],
        "accent_names": ["Earthy Amber", "Terracotta Red", "Sand Yellow", "Desert Sun"],
        "accent_uses": ["Primary branding highlights", "Buttons, borders", "Tags, inline highlights", "Soft cards, overlays"],
        "dark": {
            "black": "#120D0B", "ink": "#1A1412", "ink_soft": "#2D231E", "ink_mid": "#6E5042", "ink_muted": "#8A6655",
            "bg": "#1A1412", "bg_alt": "#2D231E", "bg_deep": "#3E302A", "text": "#FAF5F0", "text_mid": "#E6DDD5", "text_muted": "#C2B2A2",
            "border": "rgba(217, 119, 6, 0.22)", "accent_dim": "rgba(217, 119, 6, 0.15)", "accent_border": "rgba(217, 119, 6, 0.4)",
            "nav_bg": "rgba(26, 20, 18, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 119, 6, 0.15)",
            "shadow_md": "0 12px 48px rgba(217, 119, 6, 0.25)", "shadow_lg": "0 25px 80px rgba(18, 13, 11, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(194, 65, 12, 0.2) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2D231E 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1A1412", "ink": "#F2EAE1", "ink_soft": "#E6D5C3", "ink_mid": "#8A6D55", "ink_muted": "#A88D74",
            "bg": "#FAF7F2", "bg_alt": "#F2EAE1", "bg_deep": "#E6D5C3", "text": "#1A1412", "text_mid": "#4A3629", "text_muted": "#7A5E4E",
            "border": "rgba(217, 119, 6, 0.16)", "accent_dim": "rgba(217, 119, 6, 0.08)", "accent_border": "rgba(217, 119, 6, 0.25)",
            "nav_bg": "rgba(242, 234, 225, 0.92)", "shadow_sm": "0 4px 20px rgba(194, 65, 12, 0.06)",
            "shadow_md": "0 12px 48px rgba(194, 65, 12, 0.12)", "shadow_lg": "0 25px 80px rgba(26, 20, 18, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(194, 65, 12, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F2EAE1 0%, var(--bg) 70%)"
        },
        "eyebrow": "Sandstone & terracotta · Muted editorial · Warm clay",
        "title": "Warm sunbaked earth on <span>structured panels</span>",
        "lede": "Rich sandstone, terracotta, and warm clay tones. Desert Dunes blends natural, cozy earthiness with sleek modern type lines, ideally suited for architectural studios and natural products.",
        "tags": ["Lifestyle & Organic", "Creative & Portfolios", "Minimal & Brutalist"],
        "typography_desc": "Sora delivers soft, modern geometric display properties. Plus Jakarta Sans offers highly legible reading structure.",
        "principles": [
            {"number": "01", "name": "Baked clay accents", "desc": "Accents represent red sand and terracotta — use them to frame headers and borders."},
            {"number": "02", "name": "Soft earthy shadows", "desc": "Keep panels flat or give them soft, warm shadows to replicate desert sundown light."},
            {"number": "03", "name": "Tactile grids", "desc": "Section layouts should mimic blocks of sandstone, relying on rich solid fills."}
        ]
    }
]

# Let's populate the remaining themes 11 to 24 inside the Python generator script so it has them all.
# Themes list should extend with the remaining items:
remaining_themes_data = [
    {
        "id": "07",
        "name": "Ocean Abyss",
        "slug": "ocean",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;1,400&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet" />',
        "font_primary": '"Plus Jakarta Sans", sans-serif',
        "font_secondary": '"DM Sans", sans-serif',
        "accents": ["#0EA5E9", "#0284C7", "#00F5FF", "#7DD3FC"],
        "accent_names": ["Ocean Blue", "Deep Marine", "Biolume Teal", "Sky Frost"],
        "accent_uses": ["Branding outlines, tags", "Borders, deep highlights", "Vibrant links, glows", "Soft background grids"],
        "dark": {
            "black": "#01040E", "ink": "#070E1B", "ink_soft": "#0F172A", "ink_mid": "#253454", "ink_muted": "#384E7A",
            "bg": "#020617", "bg_alt": "#0F172A", "bg_deep": "#1E293B", "text": "#F0F9FF", "text_mid": "#E0F2FE", "text_muted": "#93C5FD",
            "border": "rgba(14, 165, 233, 0.22)", "accent_dim": "rgba(14, 165, 233, 0.18)", "accent_border": "rgba(14, 165, 233, 0.4)",
            "nav_bg": "rgba(7, 14, 27, 0.92)", "shadow_sm": "0 4px 20px rgba(14, 165, 233, 0.18)",
            "shadow_md": "0 12px 48px rgba(14, 165, 233, 0.28)", "shadow_lg": "0 25px 80px rgba(1, 4, 14, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(14, 165, 233, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #0F172A 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0F172A", "ink": "#E2E8F0", "ink_soft": "#CBD5E1", "ink_mid": "#475569", "ink_muted": "#64748B",
            "bg": "#F8FAFC", "bg_alt": "#F1F5F9", "bg_deep": "#E2E8F0", "text": "#0F172A", "text_mid": "#334155", "text_muted": "#475569",
            "border": "rgba(14, 165, 233, 0.16)", "accent_dim": "rgba(14, 165, 233, 0.08)", "accent_border": "rgba(14, 165, 233, 0.25)",
            "nav_bg": "rgba(241, 245, 249, 0.92)", "shadow_sm": "0 4px 20px rgba(14, 165, 233, 0.06)",
            "shadow_md": "0 12px 48px rgba(14, 165, 233, 0.12)", "shadow_lg": "0 25px 80px rgba(15, 23, 42, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(14, 165, 233, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F1F5F9 0%, var(--bg) 70%)"
        },
        "eyebrow": "Marine depths · Bioluminescent glow · Fluid type",
        "title": "Subsea indigo layered with <span>glowing electrics</span>",
        "lede": "Deep marine indigos highlighted by glowing bioluminescent cyan and ice-blue tones. Create immersive, smooth, fluid user interfaces representing raw marine intelligence.",
        "tags": ["Technical & Dev Tools", "SaaS & Enterprise", "Minimal & Brutalist"],
        "typography_desc": "Plus Jakarta Sans delivers fluid, wide sans-serif display headers. DM Sans carries secondary paragraph layers.",
        "principles": [
            {"number": "01", "name": "Biolume emphasis", "desc": "Keep the page dark and utilize cyan highlights for key interactive details."},
            {"number": "02", "name": "Fluid lines", "desc": "Use soft border radii and blur filters to imitate underwater transparency."},
            {"number": "03", "name": "Depth layering", "desc": "Elevate sections using background slate blocks to mirror oceanic zones."}
        ]
    },
    {
        "id": "08",
        "name": "Brutalist Concrete",
        "slug": "brutalist",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Archivo", sans-serif',
        "font_secondary": '"Courier Prime", monospace',
        "accents": ["#FACC15", "#E2E8F0", "#000000", "#A1A1AA"],
        "accent_names": ["Hazard Yellow", "Concrete Slate", "Stark Ink", "Muted Rebar"],
        "accent_uses": ["Hazard highlight, active tags", "Secondary blocks, fills", "Severe lines, text", "Soft borders, rules"],
        "dark": {
            "black": "#121214", "ink": "#1e1e21", "ink_soft": "#3f3f46", "ink_mid": "#71717a", "ink_muted": "#a1a1aa",
            "bg": "#2c2d30", "bg_alt": "#3a3c41", "bg_deep": "#1a1b1d", "text": "#ffffff", "text_mid": "#e4e4e7", "text_muted": "#a1a1aa",
            "border": "#facc15", "accent_dim": "rgba(250, 204, 21, 0.15)", "accent_border": "#facc15",
            "nav_bg": "rgba(44, 45, 48, 0.92)", "shadow_sm": "0 4px 0px rgba(0, 0, 0, 1)",
            "shadow_md": "0 8px 0px rgba(0, 0, 0, 1)", "shadow_lg": "0 16px 0px rgba(0, 0, 0, 1)",
            "body_gradient": "linear-gradient(180deg, rgba(250, 204, 21, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 30%, #3a3c41 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#000000", "ink": "#ffffff", "ink_soft": "#e4e4e7", "ink_mid": "#a1a1aa", "ink_muted": "#71717a",
            "bg": "#d1d5db", "bg_alt": "#e5e7eb", "bg_deep": "#9ca3af", "text": "#000000", "text_mid": "#111827", "text_muted": "#374151",
            "border": "#000000", "accent_dim": "rgba(0, 0, 0, 0.08)", "accent_border": "#000000",
            "nav_bg": "rgba(209, 213, 219, 0.92)", "shadow_sm": "0 3px 0px rgba(0, 0, 0, 1)",
            "shadow_md": "0 6px 0px rgba(0, 0, 0, 1)", "shadow_lg": "0 12px 0px rgba(0, 0, 0, 1)",
            "body_gradient": "linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, transparent 35%), radial-gradient(circle at 50% 20%, #e5e7eb 0%, var(--bg) 70%)"
        },
        "eyebrow": "Stark concrete · Industrial raw · Neo-brutalist",
        "title": "Industrial yellow on <span>stark monoliths</span>",
        "lede": "A high-contrast monochrome canvas broken by warning-tape yellow highlights. Features rigid borders, blocky hard-shadow offsets, and industrial monospaced lettering.",
        "tags": ["Minimal & Brutalist", "Creative & Portfolios", "Technical & Dev Tools"],
        "typography_desc": "Archivo provides raw, ultra-condensed display weight. Courier Prime offers clinical typewriter monospace annotations.",
        "principles": [
            {"number": "01", "name": "Zero soft motion", "desc": "Ditch smooth transitions; use immediate, blocky hover states and active tags."},
            {"number": "02", "name": "Stark border containment", "desc": "Wrap cards and buttons in thick 2px solid lines to contain sections."},
            {"number": "03", "name": "Raw grey-scale", "desc": "Keep colors restricted to pure grey-scale concrete slabs with warning yellow accents."}
        ]
    },
    {
        "id": "09",
        "name": "Vintage Parchment",
        "slug": "parchment",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Spectral:wght@300;400;600&display=swap" rel="stylesheet" />',
        "font_primary": '"EB Garamond", serif',
        "font_secondary": '"Spectral", serif',
        "accents": ["#78350F", "#92400E", "#D97706", "#F59E0B"],
        "accent_names": ["Sepia Ink", "Faded Rust", "Amber Hue", "Sunlight Glint"],
        "accent_uses": ["Primary text highlighting", "Rules, dividers", "Decorative links", "Soft highlight overlays"],
        "dark": {
            "black": "#140D09", "ink": "#1F140E", "ink_soft": "#2E1F16", "ink_mid": "#6B4934", "ink_muted": "#8A644D",
            "bg": "#1F140E", "bg_alt": "#2E1F16", "bg_deep": "#3E2B1F", "text": "#EDE0D4", "text_mid": "#E0D1C4", "text_muted": "#B5A192",
            "border": "rgba(120, 53, 15, 0.22)", "accent_dim": "rgba(120, 53, 15, 0.15)", "accent_border": "rgba(120, 53, 15, 0.4)",
            "nav_bg": "rgba(31, 20, 14, 0.92)", "shadow_sm": "0 4px 20px rgba(120, 53, 15, 0.12)",
            "shadow_md": "0 12px 48px rgba(120, 53, 15, 0.22)", "shadow_lg": "0 25px 80px rgba(20, 13, 9, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(120, 53, 15, 0.18) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2E1F16 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1F140E", "ink": "#F3EBE0", "ink_soft": "#E6DBCB", "ink_mid": "#8A6E5A", "ink_muted": "#AB8E78",
            "bg": "#FAF6F0", "bg_alt": "#F3EBE0", "bg_deep": "#E6DBCB", "text": "#1F140E", "text_mid": "#4D3627", "text_muted": "#7A5E4D",
            "border": "rgba(120, 53, 15, 0.14)", "accent_dim": "rgba(120, 53, 15, 0.08)", "accent_border": "rgba(120, 53, 15, 0.25)",
            "nav_bg": "rgba(243, 235, 224, 0.92)", "shadow_sm": "0 4px 20px rgba(120, 53, 15, 0.06)",
            "shadow_md": "0 12px 48px rgba(120, 53, 15, 0.1)", "shadow_lg": "0 25px 80px rgba(31, 20, 14, 0.06)",
            "body_gradient": "linear-gradient(180deg, rgba(120, 53, 15, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F3EBE0 0%, var(--bg) 70%)"
        },
        "eyebrow": "Aged parchment · Editorial classic · Historical feel",
        "title": "Aged ivory page with <span>faded sepia ink</span>",
        "lede": "Inspired by historic books, classical text settings, and literary magazines. This design captures warm paper fibers, faded sepia ink, and classic high-contrast serif details.",
        "tags": ["Editorial & Literary", "Lifestyle & Organic", "Minimal & Brutalist"],
        "typography_desc": "EB Garamond displays rich historical typography weight. Spectral handles readable and calm paragraph layers.",
        "principles": [
            {"number": "01", "name": "Classic margins", "desc": "Rely on generous, classic editorial layouts and centered typographic blocks."},
            {"number": "02", "name": "Ink-washed details", "desc": "Keep colors warm and desaturated, referencing natural paper fibers."},
            {"number": "03", "name": "Serif hierarchy", "desc": "Emphasize headers with bold serif forms and delicate inline decorations."}
        ]
    },
    {
        "id": "10",
        "name": "Sakura Bloom",
        "slug": "sakura",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />',
        "font_primary": '"DM Serif Display", serif',
        "font_secondary": '"Inter", sans-serif',
        "accents": ["#EC4899", "#F472B6", "#F06292", "#FBCFE8"],
        "accent_names": ["Sakura Pink", "Cherry Blossom", "Rose Tint", "Budding Leaf"],
        "accent_uses": ["Primary highlight accents", "Buttons, micro-tags", "Interactive hover overlays", "Soft panel fills"],
        "dark": {
            "black": "#140A0C", "ink": "#1F0E13", "ink_soft": "#3B1A24", "ink_mid": "#6B2D40", "ink_muted": "#8A3C53",
            "bg": "#1F0E13", "bg_alt": "#3B1A24", "bg_deep": "#542533", "text": "#FFF1F2", "text_mid": "#FFE4E6", "text_muted": "#FDA4AF",
            "border": "rgba(236, 72, 153, 0.22)", "accent_dim": "rgba(236, 72, 153, 0.18)", "accent_border": "rgba(236, 72, 153, 0.4)",
            "nav_bg": "rgba(31, 14, 19, 0.92)", "shadow_sm": "0 4px 20px rgba(236, 72, 153, 0.2)",
            "shadow_md": "0 12px 48px rgba(236, 72, 153, 0.3)", "shadow_lg": "0 25px 80px rgba(20, 10, 12, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(236, 72, 153, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #3B1A24 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1F0E13", "ink": "#FFE4EC", "ink_soft": "#FFD1DF", "ink_mid": "#9C4260", "ink_muted": "#C26282",
            "bg": "#FFF5F7", "bg_alt": "#FFE4EC", "bg_deep": "#FFD1DF", "text": "#1F0E13", "text_mid": "#4A1B29", "text_muted": "#7A354A",
            "border": "rgba(236, 72, 153, 0.16)", "accent_dim": "rgba(236, 72, 153, 0.08)", "accent_border": "rgba(236, 72, 153, 0.25)",
            "nav_bg": "rgba(255, 228, 236, 0.92)", "shadow_sm": "0 4px 20px rgba(236, 72, 153, 0.08)",
            "shadow_md": "0 12px 48px rgba(236, 72, 153, 0.12)", "shadow_lg": "0 25px 80px rgba(31, 14, 19, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(236, 72, 153, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFE4EC 0%, var(--bg) 70%)"
        },
        "eyebrow": "Cherry blossom · Soft pastels · Playful contrast",
        "title": "Delicate pastel rose on <span>plum surfaces</span>",
        "lede": "Vivid pinks layered with deep, charcoal-plum fields. Bringing a fresh, creative, high-contrast feminine voice to modern apps and digital spaces.",
        "tags": ["Creative & Portfolios", "Editorial & Literary", "Lifestyle & Organic"],
        "typography_desc": "DM Serif Display brings soft, voluptuous serif styling. Inter provides a clean, neutral structural base.",
        "principles": [
            {"number": "01", "name": "Delicate contrast", "desc": "Keep the text extremely legible by contrasting light pinks with dark plum backgrounds."},
            {"number": "02", "name": "Curved forms", "desc": "Use rounded badges and soft pill shapes to match the flora theme."},
            {"number": "03", "name": "Glow transitions", "desc": "Hover highlights fade gently like falling blossoms using smooth delays."}
        ]
    },
    {
        "id": "11",
        "name": "Obsidian Gold",
        "slug": "obsidian",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />',
        "font_primary": '"Cinzel", serif',
        "font_secondary": '"Cormorant Garamond", serif',
        "accents": ["#D4AF37", "#F3E5AB", "#AA7C11", "#FCFAF2"],
        "accent_names": ["Gold Leaf", "Champagne Gold", "Burnished Bronze", "Ivory Light"],
        "accent_uses": ["Premium logos, borders", "Metadata accents, tags", "Hover actions", "Contrast overlays"],
        "dark": {
            "black": "#050505", "ink": "#0D0D0D", "ink_soft": "#262626", "ink_mid": "#595959", "ink_muted": "#8C8C8C",
            "bg": "#0D0D0D", "bg_alt": "#1A1A1A", "bg_deep": "#262626", "text": "#FCFAF2", "text_mid": "#EBE7D8", "text_muted": "#B5B099",
            "border": "rgba(212, 175, 55, 0.22)", "accent_dim": "rgba(212, 175, 55, 0.18)", "accent_border": "rgba(212, 175, 55, 0.45)",
            "nav_bg": "rgba(13, 13, 13, 0.92)", "shadow_sm": "0 4px 20px rgba(212, 175, 55, 0.2)",
            "shadow_md": "0 12px 48px rgba(212, 175, 55, 0.3)", "shadow_lg": "0 25px 80px rgba(5, 5, 5, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(212, 175, 55, 0.22) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #262626 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0D0D0D", "ink": "#F5F2E6", "ink_soft": "#EDE7D0", "ink_mid": "#8C8563", "ink_muted": "#ABA584",
            "bg": "#FCFBF7", "bg_alt": "#F5F2E6", "bg_deep": "#EDE7D0", "text": "#0D0D0D", "text_mid": "#3D392B", "text_muted": "#6E674F",
            "border": "rgba(212, 175, 55, 0.16)", "accent_dim": "rgba(212, 175, 55, 0.08)", "accent_border": "rgba(212, 175, 55, 0.28)",
            "nav_bg": "rgba(245, 242, 230, 0.92)", "shadow_sm": "0 4px 20px rgba(212, 175, 55, 0.08)",
            "shadow_md": "0 12px 48px rgba(212, 175, 55, 0.12)", "shadow_lg": "0 25px 80px rgba(13, 13, 13, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F5F2E6 0%, var(--bg) 70%)"
        },
        "eyebrow": "Ultra luxury · Obsidian dark · Polished gold",
        "title": "Burnished gold leaf on <span>onyx fields</span>",
        "lede": "A luxurious theme featuring polished gold metal highlights against obsidian dark surfaces. Tailored for luxury hotels, high fashion houses, and bespoke brand platforms.",
        "tags": ["Lifestyle & Organic", "Creative & Portfolios", "Minimal & Brutalist"],
        "typography_desc": "Cinzel delivers high-contrast classic roman display capitals. Cormorant Garamond provides luxury reading serif details.",
        "principles": [
            {"number": "01", "name": "Gold leaf rules", "desc": "Treat gold highlights with precision; apply to borders, active items, and icons only."},
            {"number": "02", "name": "Deep onyx backgrounds", "desc": "Keep dark surfaces near pure black (#0D0D0D) to let golden details shine."},
            {"number": "03", "name": "Serif restraint", "desc": "Cinzel display font works best in uppercase forms with generous letter-spacing."}
        ]
    },
    {
        "id": "12",
        "name": "Monochrome Swiss",
        "slug": "swiss",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Roboto:wght@700;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Roboto", sans-serif',
        "font_secondary": '"JetBrains Mono", monospace',
        "accents": ["#E11D48", "#FF0000", "#000000", "#FFFFFF"],
        "accent_names": ["Swiss Red", "Bright Scarlet", "Pure Ink", "Pure Chalk"],
        "accent_uses": ["Primary focal highlights", "Action buttons, hover status", "Text, labels", "Background tiles, tags"],
        "dark": {
            "black": "#040405", "ink": "#09090B", "ink_soft": "#18181B", "ink_mid": "#52525B", "ink_muted": "#71717A",
            "bg": "#09090B", "bg_alt": "#18181B", "bg_deep": "#27272A", "text": "#FAFAFA", "text_mid": "#E4E4E7", "text_muted": "#A1A1AA",
            "border": "rgba(225, 29, 72, 0.25)", "accent_dim": "rgba(225, 29, 72, 0.15)", "accent_border": "rgba(225, 29, 72, 0.45)",
            "nav_bg": "rgba(9, 9, 11, 0.92)", "shadow_sm": "0 4px 20px rgba(225, 29, 72, 0.15)",
            "shadow_md": "0 12px 48px rgba(0, 0, 0, 0.4)", "shadow_lg": "0 25px 80px rgba(4, 4, 5, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(225, 29, 72, 0.15) 0%, transparent 40%), radial-gradient(circle at 50% 30%, #18181B 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#09090B", "ink": "#F4F4F5", "ink_soft": "#E4E4E7", "ink_mid": "#71717A", "ink_muted": "#A1A1AA",
            "bg": "#FAFAFA", "bg_alt": "#F4F4F5", "bg_deep": "#E4E4E7", "text": "#09090B", "text_mid": "#27272A", "text_muted": "#52525B",
            "border": "rgba(225, 29, 72, 0.16)", "accent_dim": "rgba(225, 29, 72, 0.08)", "accent_border": "rgba(225, 29, 72, 0.28)",
            "nav_bg": "rgba(244, 244, 245, 0.92)", "shadow_sm": "0 4px 20px rgba(225, 29, 72, 0.06)",
            "shadow_md": "0 12px 48px rgba(225, 29, 72, 0.1)", "shadow_lg": "0 25px 80px rgba(9, 9, 11, 0.06)",
            "body_gradient": "linear-gradient(180deg, rgba(225, 29, 72, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F4F4F5 0%, var(--bg) 70%)"
        },
        "eyebrow": "Swiss design · Extreme clarity · Bauhaus system",
        "title": "Perfect clarity in <span>neutral grids</span>",
        "lede": "A highly disciplined system following iconic Swiss design and Bauhaus principles. Uses strict neutral backgrounds with high-contrast red accents.",
        "tags": ["Minimal & Brutalist", "Editorial & Literary", "SaaS & Enterprise"],
        "typography_desc": "Roboto represents high-discipline grotesque typeface structures. JetBrains Mono details clean annotations.",
        "principles": [
            {"number": "01", "name": "Typographic hierarchy", "desc": "Make sizes extremely clear; rely on massive scale contrast and bold weights."},
            {"number": "02", "name": "Strict structural grid", "desc": "Align all objects strictly. Do not use random padding offsets."},
            {"number": "03", "name": "Swiss red highlight", "desc": "Utilize red only to guide the reader to actions and crucial indicators."}
        ]
    },
    {
        "id": "13",
        "name": "Retro Arcade",
        "slug": "arcade",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />',
        "font_primary": '"Press Start 2P", cursive',
        "font_secondary": '"VT323", monospace',
        "accents": ["#FF007F", "#39FF14", "#FF00FF", "#00FFFF"],
        "accent_names": ["Arcade Pink", "Laser Lime", "Retro Magenta", "Cyber Cyan"],
        "accent_uses": ["Vibrant button borders", "Score count, micro-badges", "Active tag fills", "Link underlines"],
        "dark": {
            "black": "#0E001A", "ink": "#16002A", "ink_soft": "#251B37", "ink_mid": "#4E1A6B", "ink_muted": "#7A359C",
            "bg": "#16002A", "bg_alt": "#251B37", "bg_deep": "#3E2E5B", "text": "#FFF0F5", "text_mid": "#FADDF0", "text_muted": "#E5A3D0",
            "border": "rgba(255, 0, 127, 0.28)", "accent_dim": "rgba(255, 0, 127, 0.18)", "accent_border": "rgba(255, 0, 127, 0.5)",
            "nav_bg": "rgba(22, 0, 42, 0.92)", "shadow_sm": "0 4px 0px rgba(57, 255, 20, 0.3)",
            "shadow_md": "0 8px 0px rgba(255, 0, 127, 0.4)", "shadow_lg": "0 16px 0px rgba(14, 0, 26, 0.9)",
            "body_gradient": "linear-gradient(180deg, rgba(255, 0, 127, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #251B37 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#16002A", "ink": "#FFE3F1", "ink_soft": "#FFD2EB", "ink_mid": "#A83E7A", "ink_muted": "#C25D98",
            "bg": "#FFF5F9", "bg_alt": "#FFE3F1", "bg_deep": "#FFD2EB", "text": "#16002A", "text_mid": "#4E0C35", "text_muted": "#852662",
            "border": "rgba(255, 0, 127, 0.18)", "accent_dim": "rgba(255, 0, 127, 0.08)", "accent_border": "rgba(255, 0, 127, 0.3)",
            "nav_bg": "rgba(255, 227, 241, 0.92)", "shadow_sm": "0 3px 0px rgba(22, 0, 42, 1)",
            "shadow_md": "0 6px 0px rgba(22, 0, 42, 1)", "shadow_lg": "0 12px 0px rgba(22, 0, 42, 1)",
            "body_gradient": "linear-gradient(180deg, rgba(255, 0, 127, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFE3F1 0%, var(--bg) 70%)"
        },
        "eyebrow": "80s retro · Pixel game · Vaporwave grid",
        "title": "Insert coin to play <span>neon adventure</span>",
        "lede": "Glowing pink and lime neon accents on synthwave purple fields. Features pixel-art styling, blocky grid outlines, and high-energy 80s arcade vibes.",
        "tags": ["Retro & Gaming", "Technical & Dev Tools", "Creative & Portfolios"],
        "typography_desc": "Press Start 2P provides pure 8-bit classic gaming titles. VT323 delivers tall CRT-screen terminal annotations.",
        "principles": [
            {"number": "01", "name": "Pixel perfect block", "desc": "Keep corners square and wrap containers in solid thick border lines."},
            {"number": "02", "name": "High glow intensity", "desc": "Neon lime and pink accents carry maximum saturation; use them for buttons."},
            {"number": "03", "name": "CRT aesthetics", "desc": "Let VT323 typography flow for description details, imitating scan lines."}
        ]
    },
    {
        "id": "14",
        "name": "Matcha Latte",
        "slug": "matcha",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@700;800&family=Quicksand:wght@400;500;600&display=swap" rel="stylesheet" />',
        "font_primary": '"Lexend", sans-serif',
        "font_secondary": '"Quicksand", sans-serif',
        "accents": ["#65A30D", "#84CC16", "#A3E635", "#D9F99D"],
        "accent_names": ["Matcha Green", "Lime Leaf", "Bright Matcha", "Creamy Foam"],
        "accent_uses": ["Primary organic accents", "Tags, active states", "Interaction links", "Soft highlight tags"],
        "dark": {
            "black": "#0F110B", "ink": "#1A1D13", "ink_soft": "#2D3220", "ink_mid": "#5A6342", "ink_muted": "#7A875A",
            "bg": "#1A1D13", "bg_alt": "#2D3220", "bg_deep": "#3D432C", "text": "#F7FDF0", "text_mid": "#E8F5D8", "text_muted": "#C2DCA0",
            "border": "rgba(101, 163, 13, 0.22)", "accent_dim": "rgba(101, 163, 13, 0.15)", "accent_border": "rgba(101, 163, 13, 0.4)",
            "nav_bg": "rgba(26, 29, 19, 0.92)", "shadow_sm": "0 4px 20px rgba(101, 163, 13, 0.15)",
            "shadow_md": "0 12px 48px rgba(101, 163, 13, 0.25)", "shadow_lg": "0 25px 80px rgba(15, 17, 11, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(101, 163, 13, 0.2) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2D3220 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1A1D13", "ink": "#F0F6E3", "ink_soft": "#E2EDC8", "ink_mid": "#78875A", "ink_muted": "#9CB074",
            "bg": "#FAFDF5", "bg_alt": "#F0F6E3", "bg_deep": "#E2EDC8", "text": "#1A1D13", "text_mid": "#434B32", "text_muted": "#6E7A52",
            "border": "rgba(101, 163, 13, 0.16)", "accent_dim": "rgba(101, 163, 13, 0.08)", "accent_border": "rgba(101, 163, 13, 0.25)",
            "nav_bg": "rgba(240, 246, 227, 0.92)", "shadow_sm": "0 4px 20px rgba(101, 163, 13, 0.06)",
            "shadow_md": "0 12px 48px rgba(101, 163, 13, 0.12)", "shadow_lg": "0 25px 80px rgba(26, 29, 19, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(101, 163, 13, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F0F6E3 0%, var(--bg) 70%)"
        },
        "eyebrow": "Herbal matcha · Cream foam · Cozy aesthetics",
        "title": "Creamy latte foam with <span>herbal matcha</span>",
        "lede": "Soft herbal matcha greens paired with warm cream, milk, and oat colors. Delivers a highly comforting, cozy visual workspace ideal for organic lifestyle applications.",
        "tags": ["Lifestyle & Organic", "Minimal & Brutalist", "Creative & Portfolios"],
        "typography_desc": "Lexend provides friendly, wide, hyper-legible display titles. Quicksand adds soft rounded sans-serif details.",
        "principles": [
            {"number": "01", "name": "Rounded cozy edge", "desc": "Borders should use wider radii (8px–12px) to feel soft and accessible."},
            {"number": "02", "name": "Muted organic tints", "desc": "Keep colors warm and milk-toned, avoiding absolute cold greys."},
            {"number": "03", "name": "Comfort reading", "desc": "Generous line height (1.8) makes Quicksand body copy highly legible."}
        ]
    },
    {
        "id": "15",
        "name": "Steel Foundry",
        "slug": "steel",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800;900&family=Teko:wght@500;600&display=swap" rel="stylesheet" />',
        "font_primary": '"Barlow Condensed", sans-serif',
        "font_secondary": '"Teko", sans-serif',
        "accents": ["#F97316", "#EA580C", "#FB923C", "#FFEDD5"],
        "accent_names": ["Spelt Orange", "Forge Rust", "Fire Glow", "Molten Spark"],
        "accent_uses": ["Primary action buttons", "Tags, active states", "Link highlight hover", "Glow overlays"],
        "dark": {
            "black": "#0F141F", "ink": "#1E293B", "ink_soft": "#334155", "ink_mid": "#64748B", "ink_muted": "#94A3B8",
            "bg": "#1E293B", "bg_alt": "#334155", "bg_deep": "#475569", "text": "#F8FAFC", "text_mid": "#E2E8F0", "text_muted": "#CBD5E1",
            "border": "rgba(249, 115, 22, 0.22)", "accent_dim": "rgba(249, 115, 22, 0.15)", "accent_border": "rgba(249, 115, 22, 0.4)",
            "nav_bg": "rgba(30, 41, 59, 0.92)", "shadow_sm": "0 4px 20px rgba(249, 115, 22, 0.15)",
            "shadow_md": "0 12px 48px rgba(249, 115, 22, 0.25)", "shadow_lg": "0 25px 80px rgba(15, 20, 31, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(249, 115, 22, 0.2) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #334155 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1E293B", "ink": "#E2E8F0", "ink_soft": "#CBD5E1", "ink_mid": "#64748B", "ink_muted": "#94A3B8",
            "bg": "#F8FAFC", "bg_alt": "#E2E8F0", "bg_deep": "#CBD5E1", "text": "#1E293B", "text_mid": "#475569", "text_muted": "#64748B",
            "border": "rgba(249, 115, 22, 0.16)", "accent_dim": "rgba(249, 115, 22, 0.08)", "accent_border": "rgba(249, 115, 22, 0.25)",
            "nav_bg": "rgba(226, 232, 240, 0.92)", "shadow_sm": "0 4px 20px rgba(249, 115, 22, 0.06)",
            "shadow_md": "0 12px 48px rgba(249, 115, 22, 0.12)", "shadow_lg": "0 25px 80px rgba(30, 41, 59, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(249, 115, 22, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #E2E8F0 0%, var(--bg) 70%)"
        },
        "eyebrow": "Industrial iron · Forge orange · Heavy condensed",
        "title": "Raw iron sheets with <span>forge sparks</span>",
        "lede": "Industrious iron and steel slates accented by forge-spark orange highlights. A heavy-duty, high-performance look optimized for monitoring hubs and heavy machinery software.",
        "tags": ["Technical & Dev Tools", "Minimal & Brutalist", "SaaS & Enterprise"],
        "typography_desc": "Barlow Condensed delivers solid industrial display headers. Teko carries narrow, tall, technical secondary labels.",
        "principles": [
            {"number": "01", "name": "Heavy steel sheets", "desc": "Containers mimic heavy iron sheets — use thick dark borders and rigid slots."},
            {"number": "02", "name": "Spark highlights", "desc": "Forge orange is reserved for actions, statuses, and hot monitoring thresholds."},
            {"number": "03", "name": "Compact metadata", "desc": "Keep annotations narrow and capitalized using Barlow Condensed for indicators."}
        ]
    },
    {
        "id": "16",
        "name": "Orchid Nebula",
        "slug": "orchid",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Unbounded:wght@700;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Unbounded", sans-serif',
        "font_secondary": '"Syncopate", sans-serif',
        "accents": ["#A855F7", "#EC4899", "#C084FC", "#FBCFE8"],
        "accent_names": ["Orchid Violet", "Nebula Pink", "Cosmic Lilac", "Stardust White"],
        "accent_uses": ["Primary cosmic highlights", "Tags, secondary actions", "Active link glow", "Soft panel glows"],
        "dark": {
            "black": "#0B061A", "ink": "#0F0E26", "ink_soft": "#1E1B4B", "ink_mid": "#4F2B87", "ink_muted": "#7A4ABF",
            "bg": "#0F0E26", "bg_alt": "#1E1B4B", "bg_deep": "#2E297A", "text": "#F8F5FF", "text_mid": "#E9E2FA", "text_muted": "#C084FC",
            "border": "rgba(168, 85, 247, 0.25)", "accent_dim": "rgba(168, 85, 247, 0.18)", "accent_border": "rgba(168, 85, 247, 0.45)",
            "nav_bg": "rgba(15, 14, 38, 0.92)", "shadow_sm": "0 4px 20px rgba(168, 85, 247, 0.25)",
            "shadow_md": "0 12px 48px rgba(236, 72, 153, 0.35)", "shadow_lg": "0 25px 80px rgba(11, 6, 26, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(168, 85, 247, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1E1B4B 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0F0E26", "ink": "#F3E8FF", "ink_soft": "#E9D5FF", "ink_mid": "#8B5CF6", "ink_muted": "#A78BFA",
            "bg": "#FBF8FF", "bg_alt": "#F3E8FF", "bg_deep": "#E9D5FF", "text": "#0F0E26", "text_mid": "#4C1D95", "text_muted": "#7B2CBF",
            "border": "rgba(168, 85, 247, 0.16)", "accent_dim": "rgba(168, 85, 247, 0.08)", "accent_border": "rgba(168, 85, 247, 0.25)",
            "nav_bg": "rgba(243, 232, 255, 0.92)", "shadow_sm": "0 4px 20px rgba(168, 85, 247, 0.1)",
            "shadow_md": "0 12px 48px rgba(236, 72, 153, 0.16)", "shadow_lg": "0 25px 80px rgba(15, 14, 38, 0.1)",
            "body_gradient": "linear-gradient(180deg, rgba(168, 85, 247, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F3E8FF 0%, var(--bg) 70%)"
        },
        "eyebrow": "Cosmic orchid · Space immersive · Bold future",
        "title": "Ethereal orchid violet on <span>deep space</span>",
        "lede": "Vibrant space orchid violet and stardust pink highlights. Creates high-end immersive web experiences with deep orbital gradients and sleek futuristic display lines.",
        "tags": ["Creative & Portfolios", "Technical & Dev Tools", "Retro & Gaming"],
        "typography_desc": "Unbounded represents heavy, futuristic display headers. Syncopate provides wide, spaced-out annotations.",
        "principles": [
            {"number": "01", "name": "Orbital depth", "desc": "Layer backgrounds using translucent indigo glass elements over deep space fields."},
            {"number": "02", "name": "Nebula glow", "desc": "Utilize wide, blurred violet radial gradients to simulate stardust glows."},
            {"number": "03", "name": "Futuristic weight", "desc": "Use wide Unbounded display typefaces for key landing headlines."}
        ]
    },
    {
        "id": "17",
        "name": "Sunset Glow",
        "slug": "sunset",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Playfair Display", serif',
        "font_secondary": '"Outfit", sans-serif',
        "accents": ["#F43F5E", "#E11D48", "#FB7185", "#FECDD3"],
        "accent_names": ["Dusk Rose", "Sunset Red", "Horizon Pink", "Sky Blush"],
        "accent_uses": ["Primary sunset brand highlights", "Buttons, tags", "High impact links", "Soft highlight overlays"],
        "dark": {
            "black": "#120B12", "ink": "#1A101A", "ink_soft": "#311F2E", "ink_mid": "#5A3052", "ink_muted": "#7A436F",
            "bg": "#1A101A", "bg_alt": "#311F2E", "bg_deep": "#4A2E45", "text": "#FFF5F5", "text_mid": "#FFE4E6", "text_muted": "#F9A8D4",
            "border": "rgba(244, 63, 94, 0.22)", "accent_dim": "rgba(244, 63, 94, 0.18)", "accent_border": "rgba(244, 63, 94, 0.4)",
            "nav_bg": "rgba(26, 16, 26, 0.92)", "shadow_sm": "0 4px 20px rgba(244, 63, 94, 0.2)",
            "shadow_md": "0 12px 48px rgba(244, 63, 94, 0.3)", "shadow_lg": "0 25px 80px rgba(18, 11, 18, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(244, 63, 94, 0.22) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #311F2E 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1A101A", "ink": "#FFE5E9", "ink_soft": "#FFCCD4", "ink_mid": "#A84C60", "ink_muted": "#C26D82",
            "bg": "#FFF5F6", "bg_alt": "#FFE5E9", "bg_deep": "#FFCCD4", "text": "#1A101A", "text_mid": "#4A1B28", "text_muted": "#7A3548",
            "border": "rgba(244, 63, 94, 0.16)", "accent_dim": "rgba(244, 63, 94, 0.08)", "accent_border": "rgba(244, 63, 94, 0.25)",
            "nav_bg": "rgba(255, 229, 233, 0.92)", "shadow_sm": "0 4px 20px rgba(244, 63, 94, 0.08)",
            "shadow_md": "0 12px 48px rgba(244, 63, 94, 0.12)", "shadow_lg": "0 25px 80px rgba(26, 16, 26, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(244, 63, 94, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFE5E9 0%, var(--bg) 70%)"
        },
        "eyebrow": "Romantic sunset · Editorial serif · Dusky violet",
        "title": "Romantic dusk skies over <span>berry valleys</span>",
        "lede": "Dusk purples and sunset pinks merge to create a high-contrast editorial sunset landscape. Beautiful serif headings set a poetic, luxury tone.",
        "tags": ["Lifestyle & Organic", "Creative & Portfolios", "Retro & Gaming"],
        "typography_desc": "Playfair Display provides classic, romantic serif headlines. Outfit carries readable and geometric body text.",
        "principles": [
            {"number": "01", "name": "Dusk violet tints", "desc": "Keep neutrals heavily saturated with warm purple and dusky rose hues."},
            {"number": "02", "name": "Sunset highlights", "desc": "Use rose pink highlights for button states, active badges, and rule dividers."},
            {"number": "03", "name": "Serif romance", "desc": "Use italic headings frequently to set a warm, literary, romantic voice."}
        ]
    },
    {
        "id": "18",
        "name": "Sage Minimalist",
        "slug": "sage",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,700;1,6..72,400&family=Sora:wght@300;400;600&display=swap" rel="stylesheet" />',
        "font_primary": '"Newsreader", serif',
        "font_secondary": '"Sora", sans-serif',
        "accents": ["#475569", "#64748B", "#94A3B8", "#E2E8F0"],
        "accent_names": ["Slate Grey", "Muted Slate", "Mineral Grey", "Bone White"],
        "accent_uses": ["Primary slate rules, tags", "Hover actions", "Contrast tags", "Soft page overlays"],
        "dark": {
            "black": "#141917", "ink": "#1F2623", "ink_soft": "#2E3A35", "ink_mid": "#5A6E66", "ink_muted": "#7A8E85",
            "bg": "#1F2623", "bg_alt": "#2E3A35", "bg_deep": "#3E4E47", "text": "#F1F5F9", "text_mid": "#E2E8F0", "text_muted": "#CBD5E1",
            "border": "rgba(71, 85, 105, 0.22)", "accent_dim": "rgba(71, 85, 105, 0.15)", "accent_border": "rgba(71, 85, 105, 0.4)",
            "nav_bg": "rgba(31, 38, 35, 0.92)", "shadow_sm": "0 4px 20px rgba(71, 85, 105, 0.12)",
            "shadow_md": "0 12px 48px rgba(71, 85, 105, 0.2)", "shadow_lg": "0 25px 80px rgba(20, 25, 23, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(71, 85, 105, 0.18) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2E3A35 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1F2623", "ink": "#E6EBE8", "ink_soft": "#D5DDD9", "ink_mid": "#6A7D75", "ink_muted": "#8EA098",
            "bg": "#F4F6F5", "bg_alt": "#E6EBE8", "bg_deep": "#D5DDD9", "text": "#1F2623", "text_mid": "#414E49", "text_muted": "#5F706A",
            "border": "rgba(71, 85, 105, 0.14)", "accent_dim": "rgba(71, 85, 105, 0.08)", "accent_border": "rgba(71, 85, 105, 0.25)",
            "nav_bg": "rgba(230, 235, 232, 0.92)", "shadow_sm": "0 4px 20px rgba(71, 85, 105, 0.06)",
            "shadow_md": "0 12px 48px rgba(71, 85, 105, 0.1)", "shadow_lg": "0 25px 80px rgba(31, 38, 37, 0.06)",
            "body_gradient": "linear-gradient(180deg, rgba(71, 85, 105, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #E6EBE8 0%, var(--bg) 70%)"
        },
        "eyebrow": "Sage minimalist · Desaturated slate · Mineral Calm",
        "title": "Earthy desaturated sage on <span>mineral slate</span>",
        "lede": "Calming sage-infused slate surfaces and desaturated greys. Sage Minimalist is engineered for pure reading experience, zero distraction, and editorial authority.",
        "tags": ["Minimal & Brutalist", "Editorial & Literary", "Lifestyle & Organic"],
        "typography_desc": "Newsreader delivers organic, book-like serif styling. Sora provides a clean, geometric monospace-adjacent label hierarchy.",
        "principles": [
            {"number": "01", "name": "Pure reading comfort", "desc": "Keep borders extremely thin and margins wide. Let the typography breathe."},
            {"number": "02", "name": "Desaturated mineral hues", "desc": "Avoid raw primary colors; restrict the palette to slate grey and herbal green."},
            {"number": "03", "name": "Subtle shadows", "desc": "Shadows should be soft and desaturated, resembling light fog on hills."}
        ]
    },
    {
        "id": "19",
        "name": "Royal Velvet",
        "slug": "royal",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400&family=Urbanist:wght@400;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Fraunces", serif',
        "font_secondary": '"Urbanist", sans-serif',
        "accents": ["#D97706", "#B45309", "#F59E0B", "#FDE68A"],
        "accent_names": ["Royal Gold", "Imperial Bronze", "Champagne Gold", "Soft Velvet"],
        "accent_uses": ["Primary luxury accents", "Dividers, rules, buttons", "High contrast active states", "Decorative panels"],
        "dark": {
            "black": "#0B091C", "ink": "#0F0E2C", "ink_soft": "#1E1B4B", "ink_mid": "#4E4894", "ink_muted": "#6D64C2",
            "bg": "#0F0E2C", "bg_alt": "#1E1B4B", "bg_deep": "#2C2973", "text": "#F5F3FF", "text_mid": "#EAE5FA", "text_muted": "#C3B5F5",
            "border": "rgba(217, 119, 6, 0.22)", "accent_dim": "rgba(217, 119, 6, 0.18)", "accent_border": "rgba(217, 119, 6, 0.4)",
            "nav_bg": "rgba(15, 14, 44, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 119, 6, 0.2)",
            "shadow_md": "0 12px 48px rgba(217, 119, 6, 0.3)", "shadow_lg": "0 25px 80px rgba(11, 9, 28, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 119, 6, 0.22) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1E1B4B 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0F0E2C", "ink": "#EAE8F5", "ink_soft": "#DAD7ED", "ink_mid": "#736D99", "ink_muted": "#968FB5",
            "bg": "#F7F6FB", "bg_alt": "#EAE8F5", "bg_deep": "#DAD7ED", "text": "#0F0E2C", "text_mid": "#393359", "text_muted": "#5F5685",
            "border": "rgba(217, 119, 6, 0.16)", "accent_dim": "rgba(217, 119, 6, 0.08)", "accent_border": "rgba(217, 119, 6, 0.25)",
            "nav_bg": "rgba(234, 232, 245, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 119, 6, 0.08)",
            "shadow_md": "0 12px 48px rgba(217, 119, 6, 0.12)", "shadow_lg": "0 25px 80px rgba(15, 14, 44, 0.1)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 119, 6, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #EAE8F5 0%, var(--bg) 70%)"
        },
        "eyebrow": "Regal velvet · Imperial gold · Editorial display",
        "title": "Rich velvet indigo with <span>royal gold</span>",
        "lede": "Regal indigo velvet surfaces offset by polished royal gold. Ideal for high-end boutique storefronts, creative agencies, and portfolio showcases.",
        "tags": ["Creative & Portfolios", "Lifestyle & Organic", "Editorial & Literary"],
        "typography_desc": "Fraunces delivers expressive, heavy-serif display titles. Urbanist carries structural, clean geometric body layout.",
        "principles": [
            {"number": "01", "name": "Imperial gold leaf", "desc": "Gold details are applied sparingly, framing headers and action indicators."},
            {"number": "02", "name": "Velvet layers", "desc": "Muted indigo gradients give backgrounds the soft look of woven velvet fabrics."},
            {"number": "03", "name": "Serif expressiveness", "desc": "Leverage Fraunces' italic and high-contrast characters for maximum voice."}
        ]
    },
    {
        "id": "20",
        "name": "Copper Mine",
        "slug": "copper",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Space Grotesk", sans-serif',
        "font_secondary": '"DM Sans", sans-serif',
        "accents": ["#14B8A6", "#0D9488", "#0EA5E9", "#99F6E4"],
        "accent_names": ["Verdigris Teal", "Oxidized Copper", "Biolume Blue", "Mint Tint"],
        "accent_uses": ["Primary verdigris highlights", "Borders, secondary tags", "Interactive hover glow", "Highlight panels"],
        "dark": {
            "black": "#120B09", "ink": "#180F0D", "ink_soft": "#2C1E1A", "ink_mid": "#5A3D35", "ink_muted": "#7A5348",
            "bg": "#180F0D", "bg_alt": "#2C1E1A", "bg_deep": "#3E2B25", "text": "#F2FBF9", "text_mid": "#E0FAF5", "text_muted": "#99F6E4",
            "border": "rgba(20, 184, 166, 0.22)", "accent_dim": "rgba(20, 184, 166, 0.18)", "accent_border": "rgba(20, 184, 166, 0.4)",
            "nav_bg": "rgba(24, 15, 13, 0.92)", "shadow_sm": "0 4px 20px rgba(20, 184, 166, 0.18)",
            "shadow_md": "0 12px 48px rgba(20, 184, 166, 0.28)", "shadow_lg": "0 25px 80px rgba(18, 11, 9, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(20, 184, 166, 0.2) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2C1E1A 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#180F0D", "ink": "#F2EAE7", "ink_soft": "#E6D5D1", "ink_mid": "#7A5B52", "ink_muted": "#A88378",
            "bg": "#FAFDFD", "bg_alt": "#F2EAE7", "bg_deep": "#E6D5D1", "text": "#180F0D", "text_mid": "#4A3631", "text_muted": "#7A5E57",
            "border": "rgba(20, 184, 166, 0.16)", "accent_dim": "rgba(20, 184, 166, 0.08)", "accent_border": "rgba(20, 184, 166, 0.25)",
            "nav_bg": "rgba(242, 234, 231, 0.92)", "shadow_sm": "0 4px 20px rgba(20, 184, 166, 0.06)",
            "shadow_md": "0 12px 48px rgba(20, 184, 166, 0.12)", "shadow_lg": "0 25px 80px rgba(24, 15, 13, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(20, 184, 166, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F2EAE7 0%, var(--bg) 70%)"
        },
        "eyebrow": "Metallic copper · Oxidized verdigris · Tech raw",
        "title": "Oxidized verdigris on <span>metallic bronze</span>",
        "lede": "Vibrant turquoise verdigris accents on dark, warm metallic copper surfaces. An industrial and organic crossover that feels highly tactile and premium.",
        "tags": ["Creative & Portfolios", "Technical & Dev Tools", "Minimal & Brutalist"],
        "typography_desc": "Space Grotesk provides tech-forward, high-impact titles. DM Sans details paragraph columns.",
        "principles": [
            {"number": "01", "name": "Oxidized verdigris", "desc": "Use verdigris teal for actions, links, and borders, replicating natural oxidation."},
            {"number": "02", "name": "Metallic copper layers", "desc": "Give panels a warm copper metallic hue using linear bronze gradients."},
            {"number": "03", "name": "Raw technical spacing", "desc": "Keep borders thin and use Space Grotesk headings to set a tech voice."}
        ]
    },
    {
        "id": "21",
        "name": "Cyberpunk Grid",
        "slug": "cyberpunk",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Share+Tech+Mono&display=swap" rel="stylesheet" />',
        "font_primary": '"Archivo Black", sans-serif',
        "font_secondary": '"Share Tech Mono", monospace',
        "accents": ["#FDE047", "#E11D48", "#00FF66", "#38BDF8"],
        "accent_names": ["Toxic Yellow", "Glitch Red", "Matrix Green", "Ice Blue"],
        "accent_uses": ["Hazard warning rules, badges", "Active buttons, hover glow", "Micro metrics labels", "Soft background glares"],
        "dark": {
            "black": "#040404", "ink": "#0A0A0A", "ink_soft": "#171717", "ink_mid": "#404040", "ink_muted": "#525252",
            "bg": "#0A0A0A", "bg_alt": "#171717", "bg_deep": "#262626", "text": "#FDFDF2", "text_mid": "#E5E5D8", "text_muted": "#A3A39C",
            "border": "rgba(253, 224, 71, 0.28)", "accent_dim": "rgba(253, 224, 71, 0.18)", "accent_border": "rgba(253, 224, 71, 0.5)",
            "nav_bg": "rgba(10, 10, 10, 0.92)", "shadow_sm": "0 4px 0px rgba(253, 224, 71, 0.25)",
            "shadow_md": "0 8px 0px rgba(225, 29, 72, 0.35)", "shadow_lg": "0 16px 0px rgba(4, 4, 4, 0.9)",
            "body_gradient": "linear-gradient(180deg, rgba(253, 224, 71, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #171717 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0A0A0A", "ink": "#F5F5E6", "ink_soft": "#EBEBD0", "ink_mid": "#73735C", "ink_muted": "#8C8C70",
            "bg": "#FCFDF7", "bg_alt": "#F5F5E6", "bg_deep": "#EBEBD0", "text": "#0A0A0A", "text_mid": "#33332B", "text_muted": "#5C5C4E",
            "border": "rgba(253, 224, 71, 0.18)", "accent_dim": "rgba(253, 224, 71, 0.08)", "accent_border": "rgba(253, 224, 71, 0.3)",
            "nav_bg": "rgba(245, 245, 230, 0.92)", "shadow_sm": "0 3px 0px rgba(10, 10, 10, 1)",
            "shadow_md": "0 6px 0px rgba(10, 10, 10, 1)", "shadow_lg": "0 12px 0px rgba(10, 10, 10, 1)",
            "body_gradient": "linear-gradient(180deg, rgba(253, 224, 71, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F5F5E6 0%, var(--bg) 70%)"
        },
        "eyebrow": "Cyberpunk system · Toxic yellow · Rigid grid",
        "title": "Hazard warning indicators on <span>carbon sheets</span>",
        "lede": "Vibrant hazardous yellow and toxic neon accents on flat carbon sheets. Cyberpunk Grid uses heavy rigid outlines, monospaced tech specifications, and high-impact headlines.",
        "tags": ["Retro & Gaming", "SaaS & Enterprise", "Technical & Dev Tools"],
        "typography_desc": "Archivo Black provides massive, industrial headlines. Share Tech Mono displays strict telemetry metadata.",
        "principles": [
            {"number": "01", "name": "Hazardous framing", "desc": "Use yellow rules and borders to encase cards, simulating safety barriers."},
            {"number": "02", "name": "Telemetry telemetry", "desc": "Keep annotations monospaced to resemble realtime HUD telemetry feeds."},
            {"number": "03", "name": "Flat shapes", "desc": "Reject soft round borders; use zero-border-radius flat boxes with solid shadows."}
        ]
    },
    {
        "id": "22",
        "name": "Icelandic Geyser",
        "slug": "geyser",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />',
        "font_primary": '"Instrument Serif", serif',
        "font_secondary": '"Inter", sans-serif',
        "accents": ["#38BDF8", "#0284C7", "#00F5FF", "#B0E5FC"],
        "accent_names": ["Glacial Ice", "Volcanic Basalt", "Geyser Steam", "Soft Frost"],
        "accent_uses": ["Primary frozen highlights", "Secondary tags, rules", "Interactive hover glow", "Panel overlay fills"],
        "dark": {
            "black": "#070B13", "ink": "#0F172A", "ink_soft": "#1E293B", "ink_mid": "#3C4B6B", "ink_muted": "#5A6D94",
            "bg": "#0F172A", "bg_alt": "#1E293B", "bg_deep": "#2E3A52", "text": "#F0F9FF", "text_mid": "#D0E0E6", "text_muted": "#96BFCF",
            "border": "rgba(56, 189, 248, 0.22)", "accent_dim": "rgba(56, 189, 248, 0.18)", "accent_border": "rgba(56, 189, 248, 0.4)",
            "nav_bg": "rgba(15, 23, 42, 0.92)", "shadow_sm": "0 4px 20px rgba(56, 189, 248, 0.18)",
            "shadow_md": "0 12px 48px rgba(56, 189, 248, 0.28)", "shadow_lg": "0 25px 80px rgba(7, 11, 19, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(56, 189, 248, 0.2) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1E293B 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0F172A", "ink": "#E2ECF0", "ink_soft": "#D0E0E6", "ink_mid": "#5A6F75", "ink_muted": "#7A8F96",
            "bg": "#F8FBFC", "bg_alt": "#E2ECF0", "bg_deep": "#D0E0E6", "text": "#0F172A", "text_mid": "#324347", "text_muted": "#54686C",
            "border": "rgba(56, 189, 248, 0.16)", "accent_dim": "rgba(56, 189, 248, 0.08)", "accent_border": "rgba(56, 189, 248, 0.25)",
            "nav_bg": "rgba(226, 236, 240, 0.92)", "shadow_sm": "0 4px 20px rgba(56, 189, 248, 0.06)",
            "shadow_md": "0 12px 48px rgba(56, 189, 248, 0.12)", "shadow_lg": "0 25px 80px rgba(15, 23, 42, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #E2ECF0 0%, var(--bg) 70%)"
        },
        "eyebrow": "Glacial blue · Volcanic steam · Editorial serif",
        "title": "Glacial frost lines over <span>volcanic basalt</span>",
        "lede": "Freezing water blue highlights on warm volcanic ash and steam grey backgrounds. High-contrast typography pairs delicate serif headlines with technical body layouts.",
        "tags": ["Lifestyle & Organic", "Editorial & Literary", "Minimal & Brutalist"],
        "typography_desc": "Instrument Serif provides tall, delicate literary display headers. Inter frames body text with clean precision.",
        "principles": [
            {"number": "01", "name": "Glacial frost accents", "desc": "Frost blue highlights details like a glowing layer of ice on volcanic rocks."},
            {"number": "02", "name": "Basalt depth", "desc": "Keep neutral bases greyish-blue, replicating raw Icelandic basalt fields."},
            {"number": "03", "name": "Tall serif voice", "desc": "Maximize headings' size using italic Instrument Serif for poetic impact."}
        ]
    },
    {
        "id": "23",
        "name": "Terracotta Garden",
        "slug": "terracotta",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=Alice&display=swap" rel="stylesheet" />',
        "font_primary": '"Alice", serif',
        "font_secondary": '"Albert Sans", sans-serif',
        "accents": ["#C2410C", "#EA580C", "#D97706", "#FDBA74"],
        "accent_names": ["Mediterranean Clay", "Terracotta Red", "Sandy Amber", "Soft Ochre"],
        "accent_uses": ["Primary clay highlight, CTAs", "Secondary tags, rules", "High-contrast links", "Highlight panel fills"],
        "dark": {
            "black": "#0E120A", "ink": "#141A10", "ink_soft": "#262E20", "ink_mid": "#4E5C43", "ink_muted": "#6A7D5C",
            "bg": "#141A10", "bg_alt": "#262E20", "bg_deep": "#37422E", "text": "#FDF8F5", "text_mid": "#F3EADF", "text_muted": "#CBB8A1",
            "border": "rgba(194, 65, 12, 0.22)", "accent_dim": "rgba(194, 65, 12, 0.15)", "accent_border": "rgba(194, 65, 12, 0.4)",
            "nav_bg": "rgba(20, 26, 16, 0.92)", "shadow_sm": "0 4px 20px rgba(194, 65, 12, 0.15)",
            "shadow_md": "0 12px 48px rgba(194, 65, 12, 0.25)", "shadow_lg": "0 25px 80px rgba(14, 26, 16, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(194, 65, 12, 0.2) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #262E20 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#141A10", "ink": "#F1ECE3", "ink_soft": "#E5DCCD", "ink_mid": "#707A65", "ink_muted": "#8F9D82",
            "bg": "#FAF9F6", "bg_alt": "#F1ECE3", "bg_deep": "#E5DCCD", "text": "#141A10", "text_mid": "#3C4532", "text_muted": "#5B684C",
            "border": "rgba(194, 65, 12, 0.16)", "accent_dim": "rgba(194, 65, 12, 0.08)", "accent_border": "rgba(194, 65, 12, 0.25)",
            "nav_bg": "rgba(241, 236, 227, 0.92)", "shadow_sm": "0 4px 20px rgba(194, 65, 12, 0.06)",
            "shadow_md": "0 12px 48px rgba(194, 65, 12, 0.12)", "shadow_lg": "0 25px 80px rgba(20, 26, 16, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(194, 65, 12, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F1ECE3 0%, var(--bg) 70%)"
        },
        "eyebrow": "Mediterranean clay · Muted olive grove · Cozy editorial",
        "title": "Mediterranean clay tiles in <span>olive gardens</span>",
        "lede": "Muted clay terracotta highlights on desaturated olive green and warm stone backgrounds. Replicates Mediterranean rustic spaces for organic, lifestyle, or architectural journals.",
        "tags": ["Lifestyle & Organic", "Creative & Portfolios", "Minimal & Brutalist"],
        "typography_desc": "Alice displays classical, round, highly expressive serif headings. Albert Sans keeps reading simple and modern.",
        "principles": [
            {"number": "01", "name": "Terracotta warmth", "desc": "Clay orange accents provide focus, highlighting all important buttons and markers."},
            {"number": "02", "name": "Olive grove shades", "desc": "Keep bases olive-tinted, avoiding flat greys to replicate organic vegetation."},
            {"number": "03", "name": "Expressive curvature", "desc": "Alice display headings are full-bodied and rounded, adding warmth and personality."}
        ]
    },
    {
        "id": "24",
        "name": "Electric Lavender",
        "slug": "lavender",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />',
        "font_primary": '"Syne", sans-serif',
        "font_secondary": '"Sora", sans-serif',
        "accents": ["#8B5CF6", "#A78BFA", "#C084FC", "#DDD6FE"],
        "accent_names": ["Electric Lavender", "Soft Lilac", "Bright Orchid", "Lavender Fog"],
        "accent_uses": ["Primary brand buttons, CTAs", "Secondary tags, rules", "Interactive link glows", "Soft tag backgrounds"],
        "dark": {
            "black": "#0B0A09", "ink": "#0C0A09", "ink_soft": "#1C1917", "ink_mid": "#4E3E3B", "ink_muted": "#7A6865",
            "bg": "#0C0A09", "bg_alt": "#1C1917", "bg_deep": "#2A2624", "text": "#F5F3FF", "text_mid": "#EBE8F5", "text_muted": "#C4B5FD",
            "border": "rgba(139, 92, 246, 0.22)", "accent_dim": "rgba(139, 92, 246, 0.18)", "accent_border": "rgba(139, 92, 246, 0.4)",
            "nav_bg": "rgba(12, 10, 9, 0.92)", "shadow_sm": "0 4px 20px rgba(139, 92, 246, 0.2)",
            "shadow_md": "0 12px 48px rgba(139, 92, 246, 0.3)", "shadow_lg": "0 25px 80px rgba(11, 10, 9, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(139, 92, 246, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1C1917 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0C0A09", "ink": "#F1EEF5", "ink_soft": "#E3DDEB", "ink_mid": "#6D5E8C", "ink_muted": "#8F80B5",
            "bg": "#FAF9FB", "bg_alt": "#F1EEF5", "bg_deep": "#E3DDEB", "text": "#0C0A09", "text_mid": "#39334D", "text_muted": "#5F5680",
            "border": "rgba(139, 92, 246, 0.16)", "accent_dim": "rgba(139, 92, 246, 0.08)", "accent_border": "rgba(139, 92, 246, 0.25)",
            "nav_bg": "rgba(241, 238, 245, 0.92)", "shadow_sm": "0 4px 20px rgba(139, 92, 246, 0.08)",
            "shadow_md": "0 12px 48px rgba(139, 92, 246, 0.12)", "shadow_lg": "0 25px 80px rgba(12, 10, 9, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F1EEF5 0%, var(--bg) 70%)"
        },
        "eyebrow": "Electric lavender · Playful energetic · Stone base",
        "title": "Vibrant electric lavender on <span>stone blocks</span>",
        "lede": "Playful electric lavender and lilac highlights on stone-dark minimal backgrounds. A trendy, high-contrast, high-energy layout perfect for digital creators and modern portfolios.",
        "tags": ["Creative & Portfolios", "Retro & Gaming", "Lifestyle & Organic"],
        "typography_desc": "Syne provides expressive, quirky display headlines. Sora carries highly readable text details.",
        "principles": [
            {"number": "01", "name": "Electric lilac rules", "desc": "Lavender acts as a glowing wire; use it to outline active cards and button surfaces."},
            {"number": "02", "name": "Stone foundations", "desc": "Keep surface panels stone-dark and clean to maximize lavender's emission."},
            {"number": "03", "name": "Quirky type presence", "desc": "Emphasize header items using heavy, wide Syne display font settings."}
        ]
    },
    {
        "id": "25",
        "name": "Arctic Teal",
        "slug": "arctic",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet" />',
        "font_primary": '"Outfit", sans-serif',
        "font_secondary": '"DM Mono", monospace',
        "accents": ["#0D9488", "#2DD4BF", "#14B8A6", "#99F6E4"],
        "accent_names": ["Deep Teal", "Glacial Mint", "Bright Teal", "Frost Pale"],
        "accent_uses": ["Primary accent, rules, CTAs", "Hover states, secondary highlights", "Emphasis, badges, links", "Soft accents, decorative numbers"],
        "dark": {
            "black": "#060A09", "ink": "#0C1412", "ink_soft": "#1A2E2A", "ink_mid": "#2C4E46", "ink_muted": "#3E7268",
            "bg": "#0A1210", "bg_alt": "#11201D", "bg_deep": "#1A2E2A", "text": "#E6F5F0", "text_mid": "#B2D9CF", "text_muted": "#6BA398",
            "border": "rgba(13, 148, 136, 0.22)", "accent_dim": "rgba(13, 148, 136, 0.18)", "accent_border": "rgba(13, 148, 136, 0.45)",
            "nav_bg": "rgba(10, 18, 16, 0.92)", "shadow_sm": "0 4px 20px rgba(13, 148, 136, 0.25)",
            "shadow_md": "0 12px 48px rgba(13, 148, 136, 0.35)", "shadow_lg": "0 25px 80px rgba(6, 10, 9, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(13, 148, 136, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1A2E2A 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0C1A17", "ink": "#DFF0EB", "ink_soft": "#CCDFD9", "ink_mid": "#5A8A7E", "ink_muted": "#88B5AA",
            "bg": "#F2FAF7", "bg_alt": "#E4F2ED", "bg_deep": "#D0E8E1", "text": "#0C1A17", "text_mid": "#1E4D42", "text_muted": "#4A7A6E",
            "border": "rgba(13, 148, 136, 0.16)", "accent_dim": "rgba(13, 148, 136, 0.1)", "accent_border": "rgba(13, 148, 136, 0.28)",
            "nav_bg": "rgba(228, 242, 237, 0.92)", "shadow_sm": "0 4px 20px rgba(13, 148, 136, 0.12)",
            "shadow_md": "0 12px 48px rgba(13, 148, 136, 0.16)", "shadow_lg": "0 25px 80px rgba(12, 26, 23, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(13, 148, 136, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #E4F2ED 0%, var(--bg) 70%)"
        },
        "eyebrow": "Glacial depth · Split complement · Monospace precision",
        "title": "Frozen teal depths with <span>glacial light</span>",
        "lede": "A split-complementary palette built from deep teal with warm amber accents. Surfaces are tinted from the teal family — never pure grey. Toggle modes above to preview how the glacial surfaces and accent hierarchy adapt across contexts.",
        "tags": ["SaaS & Enterprise", "Technical & Dev Tools", "Minimal & Brutalist"],
        "typography_desc": "Outfit provides fluid, wide geometric display and body weights. DM Mono carries technical labels, metadata, and monospace annotations — doubling down on precision and utility.",
        "principles": [
            {"number": "01", "name": "Glacial depth", "desc": "Every surface is tinted from the teal family — dark modes use deep forest tones, not pure black."},
            {"number": "02", "name": "Split complement", "desc": "Teal primary with amber secondary creates dynamic contrast without visual vibration."},
            {"number": "03", "name": "Monospace precision", "desc": "DM Mono carries all technical labels, giving the UI a precise, data-driven feel."}
        ]
    },
    {
        "id": "26",
        "name": "Volcanic Ember",
        "slug": "volcanic",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Outfit", sans-serif',
        "font_secondary": '"Fira Code", monospace',
        "accents": ["#C2410C", "#EA580C", "#F97316", "#FDBA74"],
        "accent_names": ["Burnt Sienna", "Fire Orange", "Bright Ember", "Desert Sand"],
        "accent_uses": ["Primary accent, rules, CTAs", "Hover states, secondary highlights", "Emphasis, badges, links", "Soft accents, decorative numbers"],
        "dark": {
            "black": "#0C0604", "ink": "#140B06", "ink_soft": "#2A1A10", "ink_mid": "#4D3020", "ink_muted": "#7A4D35",
            "bg": "#0F0805", "bg_alt": "#1C110A", "bg_deep": "#2A1A10", "text": "#FFF0E6", "text_mid": "#E8D4C2", "text_muted": "#B8916E",
            "border": "rgba(194, 65, 12, 0.22)", "accent_dim": "rgba(194, 65, 12, 0.18)", "accent_border": "rgba(194, 65, 12, 0.45)",
            "nav_bg": "rgba(15, 8, 5, 0.92)", "shadow_sm": "0 4px 20px rgba(194, 65, 12, 0.25)",
            "shadow_md": "0 12px 48px rgba(194, 65, 12, 0.35)", "shadow_lg": "0 25px 80px rgba(12, 6, 4, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(194, 65, 12, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2A1A10 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1A0E07", "ink": "#FFF3E8", "ink_soft": "#FFE6D0", "ink_mid": "#A86B42", "ink_muted": "#CC9566",
            "bg": "#FFF9F4", "bg_alt": "#FFF3E8", "bg_deep": "#FFE6D0", "text": "#1A0E07", "text_mid": "#4D2B16", "text_muted": "#7A4D35",
            "border": "rgba(194, 65, 12, 0.16)", "accent_dim": "rgba(194, 65, 12, 0.1)", "accent_border": "rgba(194, 65, 12, 0.28)",
            "nav_bg": "rgba(255, 243, 232, 0.92)", "shadow_sm": "0 4px 20px rgba(194, 65, 12, 0.12)",
            "shadow_md": "0 12px 48px rgba(194, 65, 12, 0.16)", "shadow_lg": "0 25px 80px rgba(26, 14, 7, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(194, 65, 12, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFF3E8 0%, var(--bg) 70%)"
        },
        "eyebrow": "Molten earth · Monochromatic fire · Raw power",
        "title": "Burned sienna surfaces with <span>volcanic accents</span>",
        "lede": "A monochromatic warm palette built from burnt sienna and fire orange. Every surface is tinted from the ember family — dark modes use charred earth tones, not pure black.",
        "tags": ["Editorial & Literary", "Lifestyle & Organic", "Retro & Gaming"],
        "typography_desc": "Outfit delivers smooth geometric display and body weights. Fira Code carries technical monospace annotations for data and metadata.",
        "principles": [
            {"number": "01", "name": "Ember depth", "desc": "Dark surfaces use charred earth tones from the orange family. No pure black or cold grey."},
            {"number": "02", "name": "Monochromatic fire", "desc": "One hue family at varying saturations creates cohesion. The burnt base carries all emphasis."},
            {"number": "03", "name": "Raw materials", "desc": "Fira Code labels and heavy Outfit display type give the UI an artisan, handcrafted feel."}
        ]
    },
    {
        "id": "27",
        "name": "Midnight Indigo",
        "slug": "indigo",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />',
        "font_primary": '"Playfair Display", serif',
        "font_secondary": '"DM Sans", sans-serif',
        "accents": ["#4F46E5", "#6366F1", "#818CF8", "#C7D2FE"],
        "accent_names": ["Deep Indigo", "Violet Pulse", "Cosmic Glow", "Star Dust"],
        "accent_uses": ["Primary accent, rules, CTAs", "Hover states, secondary highlights", "Emphasis, badges, links", "Soft accents, decorative numbers"],
        "dark": {
            "black": "#060510", "ink": "#0A0918", "ink_soft": "#1A1840", "ink_mid": "#2E2B6B", "ink_muted": "#4A46A0",
            "bg": "#08071A", "bg_alt": "#12103A", "bg_deep": "#1E1B5C", "text": "#EDE9FE", "text_mid": "#C4B5FD", "text_muted": "#A78BFA",
            "border": "rgba(99, 102, 241, 0.22)", "accent_dim": "rgba(79, 70, 229, 0.18)", "accent_border": "rgba(79, 70, 229, 0.45)",
            "nav_bg": "rgba(8, 7, 26, 0.92)", "shadow_sm": "0 4px 20px rgba(79, 70, 229, 0.25)",
            "shadow_md": "0 12px 48px rgba(79, 70, 229, 0.35)", "shadow_lg": "0 25px 80px rgba(6, 5, 16, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(79, 70, 229, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1E1B5C 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0C0A24", "ink": "#EDE9FE", "ink_soft": "#DDD6FE", "ink_mid": "#6366F1", "ink_muted": "#818CF8",
            "bg": "#F5F3FF", "bg_alt": "#EDE9FE", "bg_deep": "#DDD6FE", "text": "#0C0A24", "text_mid": "#2E1065", "text_muted": "#4338CA",
            "border": "rgba(79, 70, 229, 0.16)", "accent_dim": "rgba(79, 70, 229, 0.1)", "accent_border": "rgba(79, 70, 229, 0.28)",
            "nav_bg": "rgba(237, 233, 254, 0.92)", "shadow_sm": "0 4px 20px rgba(79, 70, 229, 0.12)",
            "shadow_md": "0 12px 48px rgba(79, 70, 229, 0.16)", "shadow_lg": "0 25px 80px rgba(12, 10, 36, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(79, 70, 229, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #EDE9FE 0%, var(--bg) 70%)"
        },
        "eyebrow": "Deep indigo · Analogous violet · Night sky",
        "title": "Cosmic indigo depths with <span>violet glow</span>",
        "lede": "An analogous cool palette built from deep indigo and violet. Surfaces use dark blue-purple tones that feel like a midnight sky — immersive and authoritative.",
        "tags": ["SaaS & Enterprise", "Technical & Dev Tools", "Minimal & Brutalist"],
        "typography_desc": "Playfair Display brings high-contrast serif elegance to headlines. DM Sans provides a clean, neutral body foundation.",
        "principles": [
            {"number": "01", "name": "Night sky depth", "desc": "Surfaces use deep indigo-violet, never pure black. The whole UI feels like a midnight sky."},
            {"number": "02", "name": "Analogous flow", "desc": "Indigo and violet are adjacent hues — they flow naturally without contrast vibration."},
            {"number": "03", "name": "Serif authority", "desc": "Playfair Display gives headings a classic, authoritative presence in an otherwise modern UI."}
        ]
    },
    {
        "id": "28",
        "name": "Copper Sun",
        "slug": "ember",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />',
        "font_primary": '"Syne", sans-serif',
        "font_secondary": '"Space Grotesk", sans-serif',
        "accents": ["#B45309", "#D97706", "#F59E0B", "#FDE68A"],
        "accent_names": ["Deep Copper", "Warm Gold", "Bright Sun", "Pale Gold"],
        "accent_uses": ["Primary accent, rules, CTAs", "Hover states, secondary highlights", "Emphasis, badges, links", "Soft accents, decorative numbers"],
        "dark": {
            "black": "#0A0704", "ink": "#14100A", "ink_soft": "#2A2218", "ink_mid": "#5C4A33", "ink_muted": "#8A7050",
            "bg": "#0D0906", "bg_alt": "#1A150E", "bg_deep": "#2A2218", "text": "#FFF8EB", "text_mid": "#F0DFC0", "text_muted": "#C4A87A",
            "border": "rgba(245, 158, 11, 0.22)", "accent_dim": "rgba(180, 83, 9, 0.18)", "accent_border": "rgba(180, 83, 9, 0.45)",
            "nav_bg": "rgba(13, 9, 6, 0.92)", "shadow_sm": "0 4px 20px rgba(180, 83, 9, 0.25)",
            "shadow_md": "0 12px 48px rgba(180, 83, 9, 0.35)", "shadow_lg": "0 25px 80px rgba(10, 7, 4, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(245, 158, 11, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2A2218 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1A1208", "ink": "#FFF8EB", "ink_soft": "#FFF0D6", "ink_mid": "#A87B3A", "ink_muted": "#CC9E5E",
            "bg": "#FFFCF5", "bg_alt": "#FFF8EB", "bg_deep": "#FFF0D6", "text": "#1A1208", "text_mid": "#5C3D10", "text_muted": "#8A6030",
            "border": "rgba(180, 83, 9, 0.16)", "accent_dim": "rgba(180, 83, 9, 0.1)", "accent_border": "rgba(180, 83, 9, 0.28)",
            "nav_bg": "rgba(255, 248, 235, 0.92)", "shadow_sm": "0 4px 20px rgba(180, 83, 9, 0.12)",
            "shadow_md": "0 12px 48px rgba(180, 83, 9, 0.16)", "shadow_lg": "0 25px 80px rgba(26, 18, 8, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(180, 83, 9, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFF8EB 0%, var(--bg) 70%)"
        },
        "eyebrow": "Polished copper · Warm gold · Complementary warmth",
        "title": "Polished copper on <span>warm gold</span>",
        "lede": "A complementary warm palette built from deep copper and polished gold. Surfaces use rich amber-brown tones that evoke burnished metal and golden hour light.",
        "tags": ["Lifestyle & Organic", "Creative & Portfolios", "Retro & Gaming"],
        "typography_desc": "Syne delivers quirky, expressive display headers with high contrast. Space Grotesk provides clean, geometric body text.",
        "principles": [
            {"number": "01", "name": "Golden hour warmth", "desc": "Every surface carries amber undertones. The UI glows like burnished metal in sunset light."},
            {"number": "02", "name": "Copper and gold", "desc": "Deep copper base with gold emphasis creates a rich, premium complementary relationship."},
            {"number": "03", "name": "Expressive geometry", "desc": "Syne's quirky weight contrasts with Space Grotesk's precision for a dynamic typographic voice."}
        ]
    },
    {
        "id": "29",
        "name": "Glacial Moss",
        "slug": "moss",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Instrument Serif", serif',
        "font_secondary": '"DM Sans", sans-serif',
        "accents": ["#15803D", "#16A34A", "#22C55E", "#BBF7D0"],
        "accent_names": ["Forest Green", "Spring Leaf", "Bright Moss", "Pale Fern"],
        "accent_uses": ["Primary accent, rules, CTAs", "Hover states, secondary highlights", "Emphasis, badges, links", "Soft accents, decorative numbers"],
        "dark": {
            "black": "#040A06", "ink": "#081209", "ink_soft": "#142A1A", "ink_mid": "#2A5033", "ink_muted": "#3E7A50",
            "bg": "#060F08", "bg_alt": "#0D1E12", "bg_deep": "#142A1A", "text": "#ECFDF5", "text_mid": "#BBF7D0", "text_muted": "#6EE7B7",
            "border": "rgba(22, 163, 74, 0.22)", "accent_dim": "rgba(21, 128, 61, 0.18)", "accent_border": "rgba(21, 128, 61, 0.45)",
            "nav_bg": "rgba(6, 15, 8, 0.92)", "shadow_sm": "0 4px 20px rgba(21, 128, 61, 0.25)",
            "shadow_md": "0 12px 48px rgba(21, 128, 61, 0.35)", "shadow_lg": "0 25px 80px rgba(4, 10, 6, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(21, 128, 61, 0.28) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #142A1A 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0A1C10", "ink": "#ECFDF5", "ink_soft": "#D1FAE5", "ink_mid": "#4ADE80", "ink_muted": "#86EFAC",
            "bg": "#F0FDF4", "bg_alt": "#ECFDF5", "bg_deep": "#D1FAE5", "text": "#0A1C10", "text_mid": "#14532D", "text_muted": "#166534",
            "border": "rgba(22, 163, 74, 0.16)", "accent_dim": "rgba(22, 163, 74, 0.1)", "accent_border": "rgba(22, 163, 74, 0.28)",
            "nav_bg": "rgba(236, 253, 245, 0.92)", "shadow_sm": "0 4px 20px rgba(21, 128, 61, 0.12)",
            "shadow_md": "0 12px 48px rgba(21, 128, 61, 0.16)", "shadow_lg": "0 25px 80px rgba(10, 28, 16, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(21, 128, 61, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #ECFDF5 0%, var(--bg) 70%)"
        },
        "eyebrow": "Forest moss · Glacial green · Living earth",
        "title": "Deep forest moss on <span>glacial stone</span>",
        "lede": "An analogous cool-green palette built from deep forest moss and fresh spring growth. Surfaces use natural green-blacks that feel rooted in the earth.",
        "tags": ["Lifestyle & Organic", "Minimal & Brutalist", "Editorial & Literary"],
        "typography_desc": "Instrument Serif brings an elegant, book-like display voice. DM Sans provides clean, neutral body text with excellent readability.",
        "principles": [
            {"number": "01", "name": "Living surfaces", "desc": "Dark mode uses forest-black tones, never neutral grey. The UI feels alive and organic."},
            {"number": "02", "name": "Botanical harmony", "desc": "Greens at varying saturations create a cohesive nature-inspired palette without monotony."},
            {"number": "03", "name": "Serif calm", "desc": "Instrument Serif brings a gentle, literary presence that pairs with the organic palette."}
        ]
    },
    {
        "id": "30",
        "name": "Coral Reef",
        "slug": "coral",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Fraunces", serif',
        "font_secondary": '"Plus Jakarta Sans", sans-serif',
        "accents": ["#E11D48", "#F43F5E", "#FB7185", "#FECDD3"],
        "accent_names": ["Coral Red", "Sunset Rose", "Blush Pink", "Pale Coral"],
        "accent_uses": ["Primary accent, rules, CTAs", "Hover states, secondary highlights", "Emphasis, badges, links", "Soft accents, decorative numbers"],
        "dark": {
            "black": "#0A0507", "ink": "#140A0E", "ink_soft": "#2E1522", "ink_mid": "#5A2A42", "ink_muted": "#8A3D62",
            "bg": "#0D0609", "bg_alt": "#1C0F16", "bg_deep": "#2E1522", "text": "#FFF1F2", "text_mid": "#FECDD3", "text_muted": "#FDA4AF",
            "border": "rgba(244, 63, 94, 0.22)", "accent_dim": "rgba(225, 29, 72, 0.18)", "accent_border": "rgba(225, 29, 72, 0.45)",
            "nav_bg": "rgba(13, 6, 9, 0.92)", "shadow_sm": "0 4px 20px rgba(225, 29, 72, 0.25)",
            "shadow_md": "0 12px 48px rgba(225, 29, 72, 0.35)", "shadow_lg": "0 25px 80px rgba(10, 5, 7, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(225, 29, 72, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2E1522 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1C0A10", "ink": "#FFF1F2", "ink_soft": "#FFE4E6", "ink_mid": "#BE123C", "ink_muted": "#E11D48",
            "bg": "#FFF5F6", "bg_alt": "#FFE4E6", "bg_deep": "#FECDD3", "text": "#1C0A10", "text_mid": "#4C0519", "text_muted": "#881337",
            "border": "rgba(225, 29, 72, 0.16)", "accent_dim": "rgba(225, 29, 72, 0.1)", "accent_border": "rgba(225, 29, 72, 0.28)",
            "nav_bg": "rgba(255, 228, 230, 0.92)", "shadow_sm": "0 4px 20px rgba(225, 29, 72, 0.12)",
            "shadow_md": "0 12px 48px rgba(225, 29, 72, 0.16)", "shadow_lg": "0 25px 80px rgba(28, 10, 16, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(225, 29, 72, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFE4E6 0%, var(--bg) 70%)"
        },
        "eyebrow": "Warm coral · Split complement · Living reef",
        "title": "Warm coral surfaces with <span>reef depths</span>",
        "lede": "A split-complementary palette built from warm coral with deep rose and blush surfaces. The interplay of warm reds creates a living, vibrant atmosphere with organic depth.",
        "tags": ["Lifestyle & Organic", "Creative & Portfolios", "Retro & Gaming"],
        "typography_desc": "Fraunces provides elegant, variable serif headlines with personality. Plus Jakarta Sans carries clean, modern body text.",
        "principles": [
            {"number": "01", "name": "Reef depth", "desc": "Dark surfaces use deep rose-plum, never neutral grey. The palette feels like underwater coral gardens."},
            {"number": "02", "name": "Split warmth", "desc": "Coral red with rose-pink variants creates dynamic warmth without monotony."},
            {"number": "03", "name": "Organic serif", "desc": "Fraunces variable weight brings a living, breathing quality to the typography."}
        ]
    },
    {
        "id": "31",
        "name": "Citrus Punch",
        "slug": "citrus",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Lexend:wght@400;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Outfit", sans-serif',
        "font_secondary": '"Lexend", sans-serif',
        "accents": ["#A3E635", "#FACC15", "#E11D48", "#84CC16"],
        "accent_names": ["Lime Accent", "Lemon Glow", "Grapefruit Red", "Olive Accent"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badge", "Decorative accents, mid-tones"],
        "dark": {
            "black": "#070A05", "ink": "#0D120B", "ink_soft": "#24331C", "ink_mid": "#4A663A", "ink_muted": "#759E5D",
            "bg": "#0B0E09", "bg_alt": "#161E12", "bg_deep": "#24331C", "text": "#F7FEE7", "text_mid": "#D9F99D", "text_muted": "#A3E635",
            "border": "rgba(163, 230, 21, 0.22)", "accent_dim": "rgba(163, 230, 21, 0.14)", "accent_border": "rgba(163, 230, 21, 0.45)",
            "nav_bg": "rgba(11, 14, 9, 0.92)", "shadow_sm": "0 4px 20px rgba(163, 230, 21, 0.25)",
            "shadow_md": "0 12px 48px rgba(163, 230, 21, 0.35)", "shadow_lg": "0 25px 80px rgba(7, 10, 5, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(163, 230, 21, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #24331C 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1A2E05", "ink": "#ECFDF5", "ink_soft": "#E2E8F0", "ink_mid": "#4D7C0F", "ink_muted": "#65A30D",
            "bg": "#F7FEE7", "bg_alt": "#FFFFFF", "bg_deep": "#ECFDF5", "text": "#1A2E05", "text_mid": "#3F6212", "text_muted": "#4D7C0F",
            "border": "rgba(163, 230, 21, 0.16)", "accent_dim": "rgba(163, 230, 21, 0.08)", "accent_border": "rgba(163, 230, 21, 0.25)",
            "nav_bg": "rgba(247, 254, 231, 0.92)", "shadow_sm": "0 4px 20px rgba(163, 230, 21, 0.12)",
            "shadow_md": "0 12px 48px rgba(163, 230, 21, 0.16)", "shadow_lg": "0 25px 80px rgba(26, 46, 5, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(163, 230, 21, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #ECFDF5 0%, var(--bg) 70%)"
        },
        "eyebrow": "Citrus splash · High energy · Fresh startup",
        "title": "Zesty citrus highlights on <span>fresh greens</span>",
        "lede": "A highly punchy design theme combining crisp lime green accents with glowing yellow details. Built for energetic web products and tech startups looking to stand out.",
        "tags": ["SaaS & Enterprise", "Lifestyle & Organic", "Creative & Portfolios"],
        "typography_desc": "Outfit delivers wide, high-impact modern geometric headings. Lexend is built for extreme readability across tabular layouts and dashboards.",
        "principles": [
            {"number": "01", "name": "Zesty highlights", "desc": "Keep accents centered on neon lime and warning grapefruit rose to drive visual user flow."},
            {"number": "02", "name": "Earthy structure", "desc": "Balance high-key lime with deep warm olive-chunky lines and sandstone slate cards."},
            {"number": "03", "name": "Extreme readability", "desc": "Lexend is designed to reduce reader fatigue; utilize it for body copy and data panels."}
        ]
    },
    {
        "id": "32",
        "name": "Midnight Spruce",
        "slug": "spruce",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />',
        "font_primary": '"Cinzel", serif',
        "font_secondary": '"Lora", serif',
        "accents": ["#10B981", "#F59E0B", "#059669", "#FBBF24"],
        "accent_names": ["Spruce Teal", "Amber Gold", "Forest Green", "Sun Gold"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badge", "Soft accents, decorative details"],
        "dark": {
            "black": "#01120F", "ink": "#031F1B", "ink_soft": "#0C473E", "ink_mid": "#115E51", "ink_muted": "#1E8272",
            "bg": "#022C22", "bg_alt": "#064E3B", "bg_deep": "#0C473E", "text": "#ECFDF5", "text_mid": "#A7F3D0", "text_muted": "#34D399",
            "border": "rgba(16, 185, 129, 0.22)", "accent_dim": "rgba(16, 185, 129, 0.14)", "accent_border": "rgba(16, 185, 129, 0.45)",
            "nav_bg": "rgba(2, 44, 34, 0.92)", "shadow_sm": "0 4px 20px rgba(16, 185, 129, 0.25)",
            "shadow_md": "0 12px 48px rgba(16, 185, 129, 0.35)", "shadow_lg": "0 25px 80px rgba(1, 18, 15, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(16, 185, 129, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #0C473E 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#022C22", "ink": "#ECFDF5", "ink_soft": "#D1FAE5", "ink_mid": "#047857", "ink_muted": "#059669",
            "bg": "#F0FDF4", "bg_alt": "#FFFFFF", "bg_deep": "#D1FAE5", "text": "#022C22", "text_mid": "#064E3B", "text_muted": "#047857",
            "border": "rgba(16, 185, 129, 0.16)", "accent_dim": "rgba(16, 185, 129, 0.08)", "accent_border": "rgba(16, 185, 129, 0.25)",
            "nav_bg": "rgba(240, 253, 244, 0.92)", "shadow_sm": "0 4px 20px rgba(16, 185, 129, 0.12)",
            "shadow_md": "0 12px 48px rgba(16, 185, 129, 0.16)", "shadow_lg": "0 25px 80px rgba(2, 44, 34, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #D1FAE5 0%, var(--bg) 70%)"
        },
        "eyebrow": "Deep spruce · Gold leaf · High editorial",
        "title": "Deep woodland tones with <span>warm gold</span>",
        "lede": "A luxurious, moody palette matching deep pine green forest backgrounds with brushed amber-gold accents and classic roman serif headers. Ideal for upscale lifestyle brands, boutiques, and architectural firms.",
        "tags": ["Lifestyle & Organic", "Creative & Portfolios", "Minimal & Brutalist"],
        "typography_desc": "Cinzel creates classical display titles with historical prestige. Lora offers beautiful literary serif letters for long-form narrative.",
        "principles": [
            {"number": "01", "name": "Forest depth", "desc": "Surface blocks use tinted spruce navy-green, avoiding dry grey shades to retain woodland immersion."},
            {"number": "02", "name": "Gilded lines", "desc": "Amber accents behave like gold leaf rules; use them sparingly to spotlight user headers."},
            {"number": "03", "name": "Classical order", "desc": "Cinzel capitals look best in uppercase configurations with generous tracking."}
        ]
    },
    {
        "id": "33",
        "name": "Cyber Sunset",
        "slug": "sunset-cyber",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Syncopate", sans-serif',
        "font_secondary": '"JetBrains Mono", monospace',
        "accents": ["#D946EF", "#F97316", "#FF007F", "#C084FC"],
        "accent_names": ["Neon Violet", "Sunset Gold", "Hot Pink", "Soft Purple"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Accent link, flashing indicators", "Decorative details, code highlights"],
        "dark": {
            "black": "#0C071C", "ink": "#140D2B", "ink_soft": "#2D1D54", "ink_mid": "#5B3A9B", "ink_muted": "#8B5CF6",
            "bg": "#120B24", "bg_alt": "#1E123C", "bg_deep": "#2D1D54", "text": "#FDF4FF", "text_mid": "#E8D5FF", "text_muted": "#D946EF",
            "border": "rgba(217, 70, 239, 0.25)", "accent_dim": "rgba(217, 70, 239, 0.15)", "accent_border": "rgba(217, 70, 239, 0.45)",
            "nav_bg": "rgba(18, 11, 36, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 70, 239, 0.25)",
            "shadow_md": "0 12px 48px rgba(217, 70, 239, 0.35)", "shadow_lg": "0 25px 80px rgba(12, 7, 28, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 70, 239, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2D1D54 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#311042", "ink": "#FAF5FF", "ink_soft": "#F3E8FF", "ink_mid": "#A21CAF", "ink_muted": "#D946EF",
            "bg": "#FAF5FF", "bg_alt": "#FFFFFF", "bg_deep": "#F3E8FF", "text": "#311042", "text_mid": "#5B146F", "text_muted": "#A21CAF",
            "border": "rgba(217, 70, 239, 0.16)", "accent_dim": "rgba(217, 70, 239, 0.08)", "accent_border": "rgba(217, 70, 239, 0.25)",
            "nav_bg": "rgba(250, 245, 255, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 70, 239, 0.12)",
            "shadow_md": "0 12px 48px rgba(217, 70, 239, 0.16)", "shadow_lg": "0 25px 80px rgba(49, 16, 66, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 70, 239, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F3E8FF 0%, var(--bg) 70%)"
        },
        "eyebrow": "Grape base · Electric magenta · Neon horizon",
        "title": "Neon violet sunset with <span>grape depth</span>",
        "lede": "A high-key synthwave palette showing off electric violet magenta and hot pink accents over deep grape purple foundations. Designed for creative portfolios, festivals, and music interfaces.",
        "tags": ["Creative & Portfolios", "Retro & Gaming", "Technical & Dev Tools"],
        "typography_desc": "Syncopate is a wide, geometric, uppercase header font that captures digital structure. JetBrains Mono adds code details and precision layout metadata.",
        "principles": [
            {"number": "01", "name": "Synthwave glow", "desc": "Glow shadows use fuchsia and sunset orange to replicate a backlit CRT horizon screen."},
            {"number": "02", "name": "Mono spacing", "desc": "Use JetBrains Mono to keep metadata blocks clean and structured like digital readouts."},
            {"number": "03", "name": "Extreme display", "desc": "Syncopate headers require lowercase styling blocks to be completely turned off."}
        ]
    },
    {
        "id": "34",
        "name": "Pistachio Cream",
        "slug": "pistachio",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,700;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Newsreader", serif',
        "font_secondary": '"Plus Jakarta Sans", sans-serif',
        "accents": ["#84CC16", "#D9F99D", "#A3E635", "#65A30D"],
        "accent_names": ["Pistachio", "Cream Sage", "Neon Sage", "Forest Olive"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Decorative elements, mid-tones"],
        "dark": {
            "black": "#0B1305", "ink": "#121E0B", "ink_soft": "#2D4421", "ink_mid": "#4A6C38", "ink_muted": "#75A45E",
            "bg": "#12190E", "bg_alt": "#212B1C", "bg_deep": "#2D4421", "text": "#ECFDF5", "text_mid": "#D9F99D", "text_muted": "#84CC16",
            "border": "rgba(132, 204, 22, 0.22)", "accent_dim": "rgba(132, 204, 22, 0.14)", "accent_border": "rgba(132, 204, 22, 0.45)",
            "nav_bg": "rgba(18, 25, 14, 0.92)", "shadow_sm": "0 4px 20px rgba(132, 204, 22, 0.25)",
            "shadow_md": "0 12px 48px rgba(132, 204, 22, 0.35)", "shadow_lg": "0 25px 80px rgba(11, 19, 5, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(132, 204, 22, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2D4421 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1A2E05", "ink": "#F7FEE7", "ink_soft": "#ECFDF5", "ink_mid": "#4D7C0F", "ink_muted": "#65A30D",
            "bg": "#F7FEE7", "bg_alt": "#FFFFFF", "bg_deep": "#ECFDF5", "text": "#1A2E05", "text_mid": "#3F6212", "text_muted": "#4D7C0F",
            "border": "rgba(132, 204, 22, 0.16)", "accent_dim": "rgba(132, 204, 22, 0.08)", "accent_border": "rgba(132, 204, 22, 0.25)",
            "nav_bg": "rgba(247, 254, 231, 0.92)", "shadow_sm": "0 4px 20px rgba(132, 204, 22, 0.12)",
            "shadow_md": "0 12px 48px rgba(132, 204, 22, 0.16)", "shadow_lg": "0 25px 80px rgba(26, 46, 5, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(132, 204, 22, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #ECFDF5 0%, var(--bg) 70%)"
        },
        "eyebrow": "Cream base · Organic sage · Botanical editorial",
        "title": "Pistachio tones with <span>sage cream</span>",
        "lede": "A warm botanical theme with soft pistachio and sage cream colors. Pairs modern Jakarta sans layouts with elegant editorial roman serifs for organic bakeries, lifestyle blogs, and design portfolios.",
        "tags": ["Lifestyle & Organic", "Editorial & Literary", "Creative & Portfolios"],
        "typography_desc": "Newsreader delivers warm, reader-friendly editorial title formats with human weight. Plus Jakarta Sans handles clean modern content.",
        "principles": [
            {"number": "01", "name": "Cream base", "desc": "Keep the page warm and soft, relying on cream colors to replicate natural card pulp paper."},
            {"number": "02", "name": "Earthy borders", "desc": "Borders use olive and sage green transparency values, keeping boundaries natural and soft."},
            {"number": "03", "name": "Human voice", "desc": "Utilize Newsreader serifs in italicized formats to highlight narrative quotes."}
        ]
    },
    {
        "id": "35",
        "name": "Bordeaux Velvet",
        "slug": "bordeaux",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,600&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Playfair Display", serif',
        "font_secondary": '"Montserrat", sans-serif',
        "accents": ["#991B1B", "#F59E0B", "#EF4444", "#FEF3C7"],
        "accent_names": ["Bordeaux wine", "Champagne Gold", "Bright Velvet", "Cream Gold"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Decorative highlights, details"],
        "dark": {
            "black": "#100303", "ink": "#200606", "ink_soft": "#451010", "ink_mid": "#7F1D1D", "ink_muted": "#B91C1C",
            "bg": "#150404", "bg_alt": "#2A0909", "bg_deep": "#451010", "text": "#FEF2F2", "text_mid": "#FECACA", "text_muted": "#EF4444",
            "border": "rgba(239, 68, 68, 0.22)", "accent_dim": "rgba(239, 68, 68, 0.14)", "accent_border": "rgba(239, 68, 68, 0.45)",
            "nav_bg": "rgba(21, 4, 4, 0.92)", "shadow_sm": "0 4px 20px rgba(239, 68, 68, 0.25)",
            "shadow_md": "0 12px 48px rgba(239, 68, 68, 0.35)", "shadow_lg": "0 25px 80px rgba(16, 3, 3, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(239, 68, 68, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #451010 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#450A0A", "ink": "#FEF2F2", "ink_soft": "#FEE2E2", "ink_mid": "#991B1B", "ink_muted": "#EF4444",
            "bg": "#FFF5F5", "bg_alt": "#FFFFFF", "bg_deep": "#FEE2E2", "text": "#450A0A", "text_mid": "#7F1D1D", "text_muted": "#991B1B",
            "border": "rgba(239, 68, 68, 0.16)", "accent_dim": "rgba(239, 68, 68, 0.1)", "accent_border": "rgba(239, 68, 68, 0.28)",
            "nav_bg": "rgba(255, 245, 245, 0.92)", "shadow_sm": "0 4px 20px rgba(239, 68, 68, 0.12)",
            "shadow_md": "0 12px 48px rgba(239, 68, 68, 0.16)", "shadow_lg": "0 25px 80px rgba(69, 10, 10, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(239, 68, 68, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FEE2E2 0%, var(--bg) 70%)"
        },
        "eyebrow": "Wine base · Champagne accents · Luxury boutiques",
        "title": "Bordeaux velvet with <span>champagne highlights</span>",
        "lede": "A luxurious wine-red theme utilizing deep velvet crimson backgrounds with champagne gold highlights and roman headers. Tailored for creative writing, upscale culinary spaces, and boutique galleries.",
        "tags": ["Lifestyle & Organic", "Creative & Portfolios", "Editorial & Literary"],
        "typography_desc": "Playfair Display generates gorgeous, high-contrast serif headers with luxury curves. Montserrat handles readable dashboard body segments.",
        "principles": [
            {"number": "01", "name": "Wine depth", "desc": "Surfaces utilize warm rose-maroon shades, never cold greys. The environment feels high-end and velvet."},
            {"number": "02", "name": "Gilded borders", "desc": "Keep gold accents locked to rule lines and tags to replicate classic gilt-edge paper booklets."},
            {"number": "03", "name": "Editorial serif", "desc": "Playfair display weight offers luxury styling; leverage italic headers to create visual hierarchy."}
        ]
    },
    {
        "id": "36",
        "name": "Cobalt Tech",
        "slug": "cobalt",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet" />',
        "font_primary": '"Space Grotesk", sans-serif',
        "font_secondary": '"Fira Code", monospace',
        "accents": ["#2563EB", "#38BDF8", "#1D4ED8", "#93C5FD"],
        "accent_names": ["Cobalt Blue", "Sky Cyan", "Royal Cobalt", "Soft Ice"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Decorative accents, code block"],
        "dark": {
            "black": "#030712", "ink": "#090F24", "ink_soft": "#16224F", "ink_mid": "#253B8A", "ink_muted": "#3B82F6",
            "bg": "#0B112B", "bg_alt": "#161F4E", "bg_deep": "#16224F", "text": "#EFF6FF", "text_mid": "#BFDBFE", "text_muted": "#3B82F6",
            "border": "rgba(59, 130, 246, 0.22)", "accent_dim": "rgba(59, 130, 246, 0.14)", "accent_border": "rgba(59, 130, 246, 0.45)",
            "nav_bg": "rgba(11, 17, 43, 0.92)", "shadow_sm": "0 4px 20px rgba(59, 130, 246, 0.25)",
            "shadow_md": "0 12px 48px rgba(59, 130, 246, 0.35)", "shadow_lg": "0 25px 80px rgba(3, 7, 18, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(59, 130, 246, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #16224F 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1E3A8A", "ink": "#EFF6FF", "ink_soft": "#DBEAFE", "ink_mid": "#2563EB", "ink_muted": "#3B82F6",
            "bg": "#EFF6FF", "bg_alt": "#FFFFFF", "bg_deep": "#DBEAFE", "text": "#1E3A8A", "text_mid": "#1D4ED8", "text_muted": "#2563EB",
            "border": "rgba(59, 130, 246, 0.16)", "accent_dim": "rgba(59, 130, 246, 0.08)", "accent_border": "rgba(59, 130, 246, 0.25)",
            "nav_bg": "rgba(239, 246, 255, 0.92)", "shadow_sm": "0 4px 20px rgba(59, 130, 246, 0.12)",
            "shadow_md": "0 12px 48px rgba(59, 130, 246, 0.16)", "shadow_lg": "0 25px 80px rgba(30, 58, 138, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(59, 130, 246, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #DBEAFE 0%, var(--bg) 70%)"
        },
        "eyebrow": "Cobalt tech · Monospace metrics · Dev tools",
        "title": "High-voltage cobalt with <span>digital cyan</span>",
        "lede": "A technical UI theme pairing electric cobalt blue and cyan accents over clean slate and ice blue backgrounds. Uses Fira Code for structured tabular data, metrics, and developer tools.",
        "tags": ["Technical & Dev Tools", "SaaS & Enterprise", "Minimal & Brutalist"],
        "typography_desc": "Space Grotesk creates modern wide geometric headings. Fira Code adds tech monospace details to small labels, stats, and metadata.",
        "principles": [
            {"number": "01", "name": "Technical grid", "desc": "Keep cards flat or wrap them in thin blue borders to align elements strictly like code containers."},
            {"number": "02", "name": "Electric cyan", "desc": "Utilize neon cyan highlights for hovered button borders and interactive links."},
            {"number": "03", "name": "Structured data", "desc": "Fira Code provides tabular alignment; utilize monospace numerals for metrics tables."}
        ]
    },
    {
        "id": "37",
        "name": "Sandstone Studio",
        "slug": "sandstone",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />',
        "font_primary": '"DM Serif Display", serif',
        "font_secondary": '"DM Sans", sans-serif',
        "accents": ["#D97706", "#B45309", "#FBBF24", "#F59E0B"],
        "accent_names": ["Rust Orange", "Burnt Amber", "Honey Yellow", "Warm Honey"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Decorative highlights, details"],
        "dark": {
            "black": "#0F0D0C", "ink": "#1C1715", "ink_soft": "#3E2E28", "ink_mid": "#78584B", "ink_muted": "#A87C6C",
            "bg": "#141110", "bg_alt": "#241F1D", "bg_deep": "#3E2E28", "text": "#FAFAF9", "text_mid": "#E7E5E4", "text_muted": "#D97706",
            "border": "rgba(217, 119, 6, 0.22)", "accent_dim": "rgba(217, 119, 6, 0.14)", "accent_border": "rgba(217, 119, 6, 0.45)",
            "nav_bg": "rgba(20, 17, 16, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 119, 6, 0.25)",
            "shadow_md": "0 12px 48px rgba(217, 119, 6, 0.35)", "shadow_lg": "0 25px 80px rgba(15, 13, 12, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 119, 6, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #3E2E28 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#292524", "ink": "#FAF8F6", "ink_soft": "#F5F2EE", "ink_mid": "#78584B", "ink_muted": "#B45309",
            "bg": "#FAF9F6", "bg_alt": "#FFFFFF", "bg_deep": "#F5F2EE", "text": "#292524", "text_mid": "#44403C", "text_muted": "#78584B",
            "border": "rgba(217, 119, 6, 0.16)", "accent_dim": "rgba(217, 119, 6, 0.1)", "accent_border": "rgba(217, 119, 6, 0.28)",
            "nav_bg": "rgba(250, 249, 246, 0.92)", "shadow_sm": "0 4px 20px rgba(217, 119, 6, 0.12)",
            "shadow_md": "0 12px 48px rgba(217, 119, 6, 0.16)", "shadow_lg": "0 25px 80px rgba(41, 37, 36, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(217, 119, 6, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F5F2EE 0%, var(--bg) 70%)"
        },
        "eyebrow": "Sandstone tan · Raw earth · Minimalist studio",
        "title": "Minimalist sandstone with <span>rust accents</span>",
        "lede": "A warm, architectural design template featuring raw sandstone neutral backgrounds and warm rust orange highlights. Clean structural styling designed for ceramics, architecture, and minimal studios.",
        "tags": ["Creative & Portfolios", "Lifestyle & Organic", "Minimal & Brutalist"],
        "typography_desc": "DM Serif Display creates dramatic headings with clean, modern serif weights. DM Sans provides geometric readability for body paragraphs.",
        "principles": [
            {"number": "01", "name": "Sandstone blocks", "desc": "Align panels to replicate blocks of sandstone; use solid, flat background fills rather than complex gradients."},
            {"number": "02", "name": "Rust outlines", "desc": "Keep borders warm and colored with rust orange, avoiding cold dark rules."},
            {"number": "03", "name": "Minimalist hierarchy", "desc": "Rely on generous margins and massive display typography contrast to create empty space focus."}
        ]
    },
    {
        "id": "38",
        "name": "Orchid Dusk",
        "slug": "orchid-dusk",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400&family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Fraunces", serif',
        "font_secondary": '"Sora", sans-serif',
        "accents": ["#8B5CF6", "#EC4899", "#A78BFA", "#FBCFE8"],
        "accent_names": ["Orchid Violet", "Cotton Pink", "Lilac Glow", "Soft Orchid"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Soft highlights, details"],
        "dark": {
            "black": "#0B0410", "ink": "#140A1C", "ink_soft": "#2D153E", "ink_mid": "#5C2B7E", "ink_muted": "#8B5CF6",
            "bg": "#0D0512", "bg_alt": "#1D0C27", "bg_deep": "#2D153E", "text": "#FDF4FF", "text_mid": "#F3E8FF", "text_muted": "#8B5CF6",
            "border": "rgba(139, 92, 246, 0.22)", "accent_dim": "rgba(139, 92, 246, 0.14)", "accent_border": "rgba(139, 92, 246, 0.45)",
            "nav_bg": "rgba(13, 5, 18, 0.92)", "shadow_sm": "0 4px 20px rgba(139, 92, 246, 0.25)",
            "shadow_md": "0 12px 48px rgba(139, 92, 246, 0.35)", "shadow_lg": "0 25px 80px rgba(11, 4, 16, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(139, 92, 246, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2D153E 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#2E0A4E", "ink": "#FAF5FF", "ink_soft": "#F3E8FF", "ink_mid": "#7C3AED", "ink_muted": "#8B5CF6",
            "bg": "#FAF5FF", "bg_alt": "#FFFFFF", "bg_deep": "#F3E8FF", "text": "#2E0A4E", "text_mid": "#4C1D95", "text_muted": "#7C3AED",
            "border": "rgba(139, 92, 246, 0.16)", "accent_dim": "rgba(139, 92, 246, 0.08)", "accent_border": "rgba(139, 92, 246, 0.25)",
            "nav_bg": "rgba(250, 245, 255, 0.92)", "shadow_sm": "0 4px 20px rgba(139, 92, 246, 0.12)",
            "shadow_md": "0 12px 48px rgba(139, 92, 246, 0.16)", "shadow_lg": "0 25px 80px rgba(46, 10, 78, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(139, 92, 246, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F3E8FF 0%, var(--bg) 70%)"
        },
        "eyebrow": "Lilac base · Orchid violet · Creative portfolios",
        "title": "Ethereal lavender with <span>orchid dusk</span>",
        "lede": "A warm purple theme matching soft lilac drop surfaces with rich orchid violet and warm pink accents. Built with elegant serif headings and soft, rounded forms for boutique portfolios.",
        "tags": ["Creative & Portfolios", "Editorial & Literary", "Lifestyle & Organic"],
        "typography_desc": "Fraunces delivers expressive, fluid serif displays with historic warmth. Sora creates high-legibility geometric user interface buttons and tags.",
        "principles": [
            {"number": "01", "name": "Dusk violet", "desc": "Dark panels use warm grape violet tones, avoiding dry slate. The visual atmosphere feels like sunset sky shadows."},
            {"number": "02", "name": "Lilac highlights", "desc": "Use soft violet highlights on active menu tabs and cards to anchor reader focus gently."},
            {"number": "03", "name": "Human display", "desc": "Fraunces variable weight adds organic presence; apply to display headers and large numbers."}
        ]
    },
    {
        "id": "39",
        "name": "Charcoal Brass",
        "slug": "brass",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Archivo", sans-serif',
        "font_secondary": '"Courier Prime", monospace',
        "accents": ["#CA8A04", "#EAB308", "#854D0E", "#FEF08A"],
        "accent_names": ["Burnished Brass", "Yellow Gold", "Bronze Brown", "Light Brass"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Decorative highlights, detail"],
        "dark": {
            "black": "#0B0B0C", "ink": "#121213", "ink_soft": "#2D2D30", "ink_mid": "#5C5C62", "ink_muted": "#8A8A93",
            "bg": "#121214", "bg_alt": "#1C1C1E", "bg_deep": "#2D2D30", "text": "#F2F2F7", "text_mid": "#AEAEB2", "text_muted": "#CA8A04",
            "border": "rgba(202, 138, 4, 0.22)", "accent_dim": "rgba(202, 138, 4, 0.14)", "accent_border": "rgba(202, 138, 4, 0.45)",
            "nav_bg": "rgba(18, 18, 20, 0.92)", "shadow_sm": "0 4px 20px rgba(202, 138, 4, 0.25)",
            "shadow_md": "0 12px 48px rgba(202, 138, 4, 0.35)", "shadow_lg": "0 25px 80px rgba(11, 11, 12, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(202, 138, 4, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2D2D30 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1C1C1E", "ink": "#FAF9F6", "ink_soft": "#F2F2F7", "ink_mid": "#5C5C62", "ink_muted": "#854D0E",
            "bg": "#F2F2F7", "bg_alt": "#FFFFFF", "bg_deep": "#E5E5EA", "text": "#1C1C1E", "text_mid": "#3A3A3C", "text_muted": "#5C5C62",
            "border": "rgba(202, 138, 4, 0.16)", "accent_dim": "rgba(202, 138, 4, 0.08)", "accent_border": "rgba(202, 138, 4, 0.25)",
            "nav_bg": "rgba(242, 242, 247, 0.92)", "shadow_sm": "0 4px 20px rgba(202, 138, 4, 0.12)",
            "shadow_md": "0 12px 48px rgba(202, 138, 4, 0.16)", "shadow_lg": "0 25px 80px rgba(28, 28, 30, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(202, 138, 4, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #E5E5EA 0%, var(--bg) 70%)"
        },
        "eyebrow": "Charcoal grey · Brushed brass · Industrial tech",
        "title": "Industrial charcoal with <span>solid brass rules</span>",
        "lede": "A stark industrial theme pairing raw slate charcoal backgrounds with warm brushed brass-gold accents. Heavy block grids and typewriter spacing make it ideal for architectural blueprints, craft workshops, and developer reports.",
        "tags": ["Technical & Dev Tools", "Minimal & Brutalist", "SaaS & Enterprise"],
        "typography_desc": "Archivo creates blocky, heavy, high-impact sans-serif displays. Courier Prime provides industrial monospace type for labels and logs.",
        "principles": [
            {"number": "01", "name": "Heavy grid", "desc": "Utilize square layouts and solid gray fills to structure sections like steel frame containers."},
            {"number": "02", "name": "Burnished brass", "desc": "Keep gold accents locked to rule lines and tag labels to mirror brushed brass details."},
            {"number": "03", "name": "Typewriter details", "desc": "Courier monospace type structures all metadata tables and card parameters."}
        ]
    },
    {
        "id": "40",
        "name": "Glacier Melt",
        "slug": "glacier",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@700;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Albert Sans", sans-serif',
        "font_secondary": '"Space Grotesk", sans-serif',
        "accents": ["#06B6D4", "#0891B2", "#22D3EE", "#E0F2FE"],
        "accent_names": ["Glacier Teal", "Ice Cyan", "Ice Glow", "Snow White"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Soft highlights, details"],
        "dark": {
            "black": "#020A12", "ink": "#051624", "ink_soft": "#0C2E47", "ink_mid": "#154D74", "ink_muted": "#206D9F",
            "bg": "#082F49", "bg_alt": "#0C4A6E", "bg_deep": "#0C2E47", "text": "#F0F9FF", "text_mid": "#BAE6FD", "text_muted": "#06B6D4",
            "border": "rgba(6, 182, 212, 0.22)", "accent_dim": "rgba(6, 182, 212, 0.14)", "accent_border": "rgba(6, 182, 212, 0.45)",
            "nav_bg": "rgba(8, 47, 73, 0.92)", "shadow_sm": "0 4px 20px rgba(6, 182, 212, 0.25)",
            "shadow_md": "0 12px 48px rgba(6, 182, 212, 0.35)", "shadow_lg": "0 25px 80px rgba(2, 10, 18, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(6, 182, 212, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #0C2E47 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0C4A6E", "ink": "#F0F9FF", "ink_soft": "#E0F2FE", "ink_mid": "#0284C7", "ink_muted": "#0284C7",
            "bg": "#F0F9FF", "bg_alt": "#FFFFFF", "bg_deep": "#E0F2FE", "text": "#0C4A6E", "text_mid": "#0369A1", "text_muted": "#0284C7",
            "border": "rgba(6, 182, 212, 0.16)", "accent_dim": "rgba(6, 182, 212, 0.08)", "accent_border": "rgba(6, 182, 212, 0.25)",
            "nav_bg": "rgba(240, 249, 255, 0.92)", "shadow_sm": "0 4px 20px rgba(6, 182, 212, 0.12)",
            "shadow_md": "0 12px 48px rgba(6, 182, 212, 0.16)", "shadow_lg": "0 25px 80px rgba(12, 74, 110, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(6, 182, 212, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #E0F2FE 0%, var(--bg) 70%)"
        },
        "eyebrow": "Ice blue base · Glacier teal · Clean technology",
        "title": "Frozen cyan accents on <span>glacier slates</span>",
        "lede": "A crisp, fresh tech theme utilizing ice floe blue backgrounds with freezing teal and cyan highlights. Developed for green energy dashboards, climate platforms, and minimalist analytics interfaces.",
        "tags": ["SaaS & Enterprise", "Technical & Dev Tools", "Lifestyle & Organic"],
        "typography_desc": "Albert Sans provides bold, modern geometric headers. Space Grotesk offers wide, readable layouts for panels and button lists.",
        "principles": [
            {"number": "01", "name": "Glacier fields", "desc": "Keep backgrounds cold and light; avoid warm cream tones to preserve the arctic feel."},
            {"number": "02", "name": "Cyan glow", "desc": "Use neon cyan glow borders to guide readers to hovered button options and tags."},
            {"number": "03", "name": "Geometric logic", "desc": "Both fonts feature geometric structures; align items strictly on a clean block grid."}
        ]
    },
    {
        "id": "41",
        "name": "Plum Noir",
        "slug": "plum-noir",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,600;0,800;1,400&family=Urbanist:wght@400;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Spectral", serif',
        "font_secondary": '"Urbanist", sans-serif',
        "accents": ["#701A75", "#F472B6", "#A21CAF", "#FCE7F3"],
        "accent_names": ["Plum Violet", "Rose Glow", "Magenta Glow", "Soft Lilac"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Soft highlights, details"],
        "dark": {
            "black": "#0B040B", "ink": "#160616", "ink_soft": "#3A103A", "ink_mid": "#5C1D5C", "ink_muted": "#861F86",
            "bg": "#0F050F", "bg_alt": "#210B21", "bg_deep": "#3A103A", "text": "#FCE7F3", "text_mid": "#F472B6", "text_muted": "#701A75",
            "border": "rgba(112, 26, 117, 0.22)", "accent_dim": "rgba(112, 26, 117, 0.14)", "accent_border": "rgba(112, 26, 117, 0.45)",
            "nav_bg": "rgba(15, 5, 15, 0.92)", "shadow_sm": "0 4px 20px rgba(112, 26, 117, 0.25)",
            "shadow_md": "0 12px 48px rgba(112, 26, 117, 0.35)", "shadow_lg": "0 25px 80px rgba(11, 4, 11, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(112, 26, 117, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #3A103A 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#4A044E", "ink": "#FDF4FF", "ink_soft": "#FAE8FF", "ink_mid": "#A21CAF", "ink_muted": "#701A75",
            "bg": "#FDF4FF", "bg_alt": "#FFFFFF", "bg_deep": "#FAE8FF", "text": "#4A044E", "text_mid": "#701A75", "text_muted": "#A21CAF",
            "border": "rgba(112, 26, 117, 0.16)", "accent_dim": "rgba(112, 26, 117, 0.08)", "accent_border": "rgba(112, 26, 117, 0.25)",
            "nav_bg": "rgba(253, 244, 255, 0.92)", "shadow_sm": "0 4px 20px rgba(112, 26, 117, 0.12)",
            "shadow_md": "0 12px 48px rgba(112, 26, 117, 0.16)", "shadow_lg": "0 25px 80px rgba(74, 4, 78, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(112, 26, 117, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FAE8FF 0%, var(--bg) 70%)"
        },
        "eyebrow": "Deep plum · Warm magenta · High editorial style",
        "title": "Deep rich plum for <span>fashion and design</span>",
        "lede": "A sophisticated editorial theme built on deep plum and warm magenta tones. High-contrast display serifs paired with clean geometric body text create a premium aesthetic for magazines, design studios, and fashion journals.",
        "tags": ["Editorial & Literary", "Creative & Portfolios", "Minimal & Brutalist"],
        "typography_desc": "Spectral provides elegant, literary, high-contrast serif displays for editorial layouts. Urbanist handles clean, modern sans-serif body copy.",
        "principles": [
            {"number": "01", "name": "Plum base", "desc": "Keep dark surfaces rich and tinted in deep violet-plum to create a dramatic velvet environment."},
            {"number": "02", "name": "Magenta highlights", "desc": "Use glowing magenta details to highlight button hover states and call-to-actions."},
            {"number": "03", "name": "High fashion", "desc": "Spectral italic styles look highly sophisticated; apply to pull-quotes and display highlights."}
        ]
    },
    {
        "id": "42",
        "name": "Amber Woods",
        "slug": "amber-woods",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Cormorant Garamond", serif',
        "font_secondary": '"Outfit", sans-serif',
        "accents": ["#B45309", "#15803D", "#D97706", "#166534"],
        "accent_names": ["Amber Gold", "Spruce Green", "Honey Amber", "Forest Green"],
        "accent_uses": ["Primary accent, rules, CTAs", "Secondary highlights, hover states", "Link highlight, alert badges", "Decorative highlights, detail"],
        "dark": {
            "black": "#020D06", "ink": "#041B0D", "ink_soft": "#0F3D20", "ink_mid": "#1D753D", "ink_muted": "#2F9F5A",
            "bg": "#052E16", "bg_alt": "#14532D", "bg_deep": "#0F3D20", "text": "#F0FDF4", "text_mid": "#D1F2D9", "text_muted": "#B45309",
            "border": "rgba(21, 128, 61, 0.22)", "accent_dim": "rgba(21, 128, 61, 0.14)", "accent_border": "rgba(21, 128, 61, 0.45)",
            "nav_bg": "rgba(5, 46, 22, 0.92)", "shadow_sm": "0 4px 20px rgba(21, 128, 61, 0.25)",
            "shadow_md": "0 12px 48px rgba(21, 128, 61, 0.35)", "shadow_lg": "0 25px 80px rgba(2, 13, 6, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(21, 128, 61, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #0F3D20 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#14532D", "ink": "#F0FDF4", "ink_soft": "#DCFCE7", "ink_mid": "#166534", "ink_muted": "#B45309",
            "bg": "#F0FDF4", "bg_alt": "#FFFFFF", "bg_deep": "#DCFCE7", "text": "#14532D", "text_mid": "#166534", "text_muted": "#15803D",
            "border": "rgba(21, 128, 61, 0.16)", "accent_dim": "rgba(21, 128, 61, 0.08)", "accent_border": "rgba(21, 128, 61, 0.25)",
            "nav_bg": "rgba(240, 253, 244, 0.92)", "shadow_sm": "0 4px 20px rgba(21, 128, 61, 0.12)",
            "shadow_md": "0 12px 48px rgba(21, 128, 61, 0.16)", "shadow_lg": "0 25px 80px rgba(20, 83, 45, 0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(21, 128, 61, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #DCFCE7 0%, var(--bg) 70%)"
        },
        "eyebrow": "Amber honey · Spruce green · Craft brand heritage",
        "title": "Forest green matched with <span>golden amber</span>",
        "lede": "A warm heritage theme marrying deep forest greens with rich honey-amber accents and delicate editorial Garamond typography. Specially constructed for craft breweries, outdoor getaways, and artisanal brands.",
        "tags": ["Lifestyle & Organic", "Minimal & Brutalist", "Creative & Portfolios"],
        "typography_desc": "Cormorant Garamond creates highly refined, classic roman headlines with open kerning. Outfit handles clean, modern sans-serif body copy and labels.",
        "principles": [
            {"number": "01", "name": "Forest moss base", "desc": "Structure background panels in deep spruce green to give the brand a warm, forest-like presence."},
            {"number": "02", "name": "Honey amber rules", "desc": "Keep borders and rule highlights golden amber, driving the reader to links and highlights."},
            {"number": "03", "name": "Artisanal serif", "desc": "Cormorant Garamond details provide historic prestige; apply in centered formats."}
        ]
    },
    {
        "id": "43",
        "name": "Cobalt Amber",
        "slug": "cobalt-amber",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />',
        "font_primary": '"Outfit", system-ui, sans-serif',
        "font_secondary": '"JetBrains Mono", monospace',
        "accents": ["#2563EB", "#D97706", "#3B82F6", "#F59E0B"],
        "accent_names": ["Cobalt Blue", "Amber Gold", "Vivid Blue", "Bright Gold"],
        "accent_uses": ["Primary accent, tags, rules", "Secondary highlight, link hovers", "Badge accents", "Soft borders and underlines"],
        "dark": {
            "black": "#070B18", "ink": "#0D1527", "ink_soft": "#1E293B", "ink_mid": "#475569", "ink_muted": "#64748B",
            "bg": "#0B1120", "bg_alt": "#16223F", "bg_deep": "#0E172C", "text": "#F8FAFC", "text_mid": "#CBD5E1", "text_muted": "#94A3B8",
            "border": "rgba(37, 99, 235, 0.22)", "accent_dim": "rgba(37, 99, 235, 0.14)", "accent_border": "rgba(37, 99, 235, 0.45)",
            "nav_bg": "rgba(13, 21, 39, 0.92)", "shadow_sm": "0 4px 20px rgba(37, 99, 235, 0.15)",
            "shadow_md": "0 12px 48px rgba(37, 99, 235, 0.25)", "shadow_lg": "0 25px 80px rgba(7, 11, 24, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(37, 99, 235, 0.2) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1E293B 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#0F172A", "ink": "#F8FAFC", "ink_soft": "#F1F5F9", "ink_mid": "#64748B", "ink_muted": "#94A3B8",
            "bg": "#FAFBFD", "bg_alt": "#F1F4F9", "bg_deep": "#E2E8F0", "text": "#0F172A", "text_mid": "#334155", "text_muted": "#64748B",
            "border": "rgba(37, 99, 235, 0.16)", "accent_dim": "rgba(37, 99, 235, 0.08)", "accent_border": "rgba(37, 99, 235, 0.25)",
            "nav_bg": "rgba(241, 244, 249, 0.92)", "shadow_sm": "0 4px 20px rgba(37, 99, 235, 0.08)",
            "shadow_md": "0 12px 48px rgba(37, 99, 235, 0.12)", "shadow_lg": "0 25px 80px rgba(15, 23, 42, 0.08)",
            "body_gradient": "linear-gradient(180deg, rgba(37, 99, 235, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F1F4F9 0%, var(--bg) 70%)"
        },
        "eyebrow": "High contrast · Protan/Deuteran safe · Dynamic accessibility",
        "title": "Accessible cobalt on <span>vivid amber foundations</span>",
        "lede": "A colorblind-friendly theme optimized for red-green vision differences. Using high-contrast cobalt blue and amber gold, it offers exceptional readability and visual clarity.",
        "tags": ["SaaS & Enterprise", "Technical & Dev Tools", "Minimal & Brutalist"],
        "typography_desc": "Outfit handles geometric headlines and UI weights. JetBrains Mono delivers clear tabular labels and code blocks.",
        "principles": [
            {"number": "01", "name": "Accessibility first", "desc": "Maintain contrast above 7:1 for all primary text elements to ensure absolute legibility."},
            {"number": "02", "name": "Deuteranopia safe", "desc": "Avoid red/green pairings; rely on blue/yellow contrast to distinguish actions and highlights."},
            {"number": "03", "name": "Geometric precision", "desc": "Bold Outfit headers establish a clear visual hierarchy immediately."}
        ]
    },
    {
        "id": "44",
        "name": "Tritan Horizon",
        "slug": "tritan-horizon",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Grotesk:wght@400;600&display=swap" rel="stylesheet" />',
        "font_primary": '"Plus Jakarta Sans", system-ui, sans-serif',
        "font_secondary": '"Space Grotesk", sans-serif',
        "accents": ["#E11D48", "#06B6D4", "#F43F5E", "#0891B2"],
        "accent_names": ["Tritan Red", "Tritan Cyan", "Bright Coral", "Deep Teal"],
        "accent_uses": ["Primary brand accent, rules", "Secondary actions, hover highlights", "Badge highlights", "Soft borders and outlines"],
        "dark": {
            "black": "#0B0508", "ink": "#180D13", "ink_soft": "#2D1B24", "ink_mid": "#5C3A4D", "ink_muted": "#8A5C75",
            "bg": "#12070D", "bg_alt": "#250F1A", "bg_deep": "#180A11", "text": "#FFF0F5", "text_mid": "#E6D5DC", "text_muted": "#B39EAA",
            "border": "rgba(225, 29, 72, 0.22)", "accent_dim": "rgba(225, 29, 72, 0.15)", "accent_border": "rgba(225, 29, 72, 0.45)",
            "nav_bg": "rgba(24, 13, 19, 0.92)", "shadow_sm": "0 4px 20px rgba(225, 29, 72, 0.2)",
            "shadow_md": "0 12px 48px rgba(225, 29, 72, 0.3)", "shadow_lg": "0 25px 80px rgba(11, 5, 8, 0.85)",
            "body_gradient": "linear-gradient(180deg, rgba(225, 29, 72, 0.22) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #2D1B24 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#1F0F17", "ink": "#FFF5F8", "ink_soft": "#FFEBF2", "ink_mid": "#A67B8E", "ink_muted": "#C29CB0",
            "bg": "#FFFBFC", "bg_alt": "#FFEBF2", "bg_deep": "#FFDBE7", "text": "#1F0F17", "text_mid": "#4D2B3C", "text_muted": "#804C65",
            "border": "rgba(225, 29, 72, 0.16)", "accent_dim": "rgba(225, 29, 72, 0.08)", "accent_border": "rgba(225, 29, 72, 0.25)",
            "nav_bg": "rgba(255, 235, 242, 0.92)", "shadow_sm": "0 4px 20px rgba(225, 29, 72, 0.1)",
            "shadow_md": "0 12px 48px rgba(225, 29, 72, 0.15)", "shadow_lg": "0 25px 80px rgba(31, 15, 23, 0.1)",
            "body_gradient": "linear-gradient(180deg, rgba(225, 29, 72, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #FFEBF2 0%, var(--bg) 70%)"
        },
        "eyebrow": "Tritanopia friendly · Red-cyan contrast · Fluid tech layout",
        "title": "Vivid crimson paired with <span>digital cyan accents</span>",
        "lede": "A colorblind-friendly design optimized for blue-yellow vision differences (Tritanopia). Crimson and cyan accents combine to provide clear, high-contrast visibility.",
        "tags": ["SaaS & Enterprise", "Creative & Portfolios", "Technical & Dev Tools"],
        "typography_desc": "Plus Jakarta Sans delivers fluid, wide sans-serif display headers. Space Grotesk frames labels and secondary elements with geometric shapes.",
        "principles": [
            {"number": "01", "name": "Tritanopia optimized", "desc": "Ditch blue-yellow contrasts; rely on high-intensity red-cyan boundaries for visual separations."},
            {"number": "02", "name": "Engage through color", "desc": "Keep accents bold and responsive to enhance structural UI feedback."},
            {"number": "03", "name": "Responsive balance", "desc": "Leverage clean geometric space to allow the high-key accents to stand out clearly."}
        ]
    },
    {
        "id": "45",
        "name": "Noir Minimalist",
        "slug": "noir-minimalist",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Syne", sans-serif',
        "font_secondary": '"Courier Prime", monospace',
        "accents": ["#E2E8F0", "#64748B", "#F8FAFC", "#334155"],
        "accent_names": ["Silver Gray", "Slate Gray", "Vivid White", "Charcoal Slate"],
        "accent_uses": ["Primary highlight, metadata border", "Muted accents, border frames", "High contrast buttons", "Decorative elements"],
        "dark": {
            "black": "#08090A", "ink": "#121315", "ink_soft": "#1C1D21", "ink_mid": "#3E4048", "ink_muted": "#5B5E6A",
            "bg": "#0D0E10", "bg_alt": "#18191C", "bg_deep": "#101113", "text": "#F8FAFC", "text_mid": "#D1D5DB", "text_muted": "#9CA3AF",
            "border": "rgba(226, 232, 240, 0.2)", "accent_dim": "rgba(226, 232, 240, 0.12)", "accent_border": "rgba(226, 232, 240, 0.4)",
            "nav_bg": "rgba(18, 19, 21, 0.92)", "shadow_sm": "0 4px 20px rgba(226, 232, 240, 0.08)",
            "shadow_md": "0 12px 48px rgba(226, 232, 240, 0.12)", "shadow_lg": "0 25px 80px rgba(8, 9, 10, 0.9)",
            "body_gradient": "linear-gradient(180deg, rgba(226, 232, 240, 0.1) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1C1D21 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#111215", "ink": "#F3F4F6", "ink_soft": "#E5E7EB", "ink_mid": "#6B7280", "ink_muted": "#9CA3AF",
            "bg": "#F9FAFB", "bg_alt": "#F3F4F6", "bg_deep": "#E5E7EB", "text": "#111215", "text_mid": "#374151", "text_muted": "#6B7280",
            "border": "rgba(17, 18, 21, 0.12)", "accent_dim": "rgba(17, 18, 21, 0.06)", "accent_border": "rgba(17, 18, 21, 0.2)",
            "nav_bg": "rgba(243, 244, 246, 0.92)", "shadow_sm": "0 4px 20px rgba(17, 18, 21, 0.06)",
            "shadow_md": "0 12px 48px rgba(17, 18, 21, 0.08)", "shadow_lg": "0 25px 80px rgba(17, 18, 21, 0.06)",
            "body_gradient": "linear-gradient(180deg, rgba(17, 18, 21, 0.05) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F3F4F6 0%, var(--bg) 70%)"
        },
        "eyebrow": "Grayscale monochromatic · High contrast · Neo-brutalist typography",
        "title": "Minimalist monochrome on <span>pure structural slate</span>",
        "lede": "A pure grayscale monochromatic theme stripped of colored accents. Leveraging absolute contrast between whites, silvers, and charcoal blacks, it focuses purely on raw typography.",
        "tags": ["Minimal & Brutalist", "Editorial & Literary", "Creative & Portfolios"],
        "typography_desc": "Syne delivers bold, quirky, high-impact display titles. Courier Prime offers clinical typewriter monospace structure for copy.",
        "principles": [
            {"number": "01", "name": "Strip color entirely", "desc": "All accents are pure grays and silvers, focusing emphasis on letterforms and spatial layouts."},
            {"number": "02", "name": "Max contrast hierarchy", "desc": "Lean on dark charcoal wells against stark white text to establish clear borders and panels."},
            {"number": "03", "name": "Brutalist typewriter", "desc": "Monospace secondary tags and labels echo clinical utility and raw layout aesthetics."}
        ]
    },
    {
        "id": "46",
        "name": "Golden Aura Editorial",
        "slug": "aura-editorial",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />',
        "font_primary": '"Playfair Display", Georgia, serif',
        "font_secondary": '"DM Sans", sans-serif',
        "accents": ["#8C690B", "#D4AF37", "#2A220D", "#FAF7EF"],
        "accent_names": ["Editorial Gold", "Gold Leaf", "Deep Amber Shadow", "Warm Cream"],
        "accent_uses": ["Primary brand titles & kickers", "Interactive button hovers & highlights", "Card panels and wells", "Subtle text elements"],
        "dark": {
            "black": "#000000", "ink": "#070706", "ink_soft": "#12100C", "ink_mid": "#A99E8A", "ink_muted": "#5B5448",
            "bg": "#000000", "bg_alt": "#070706", "bg_deep": "#12100C", "text": "#FAF7EF", "text_mid": "#DED5C4", "text_muted": "#A99E8A",
            "border": "#242018", "accent_dim": "rgba(212, 175, 55, 0.08)", "accent_border": "#3A3325",
            "nav_bg": "rgba(0, 0, 0, 0.9)", "shadow_sm": "0 2px 8px rgba(0, 0, 0, 0.42)",
            "shadow_md": "0 12px 32px rgba(0, 0, 0, 0.36)", "shadow_lg": "0 20px 48px rgba(0, 0, 0, 0.5)",
            "body_gradient": "linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 30%, #12100C 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#050505", "ink": "#FFFFFF", "ink_soft": "#F3F2EC", "ink_mid": "#5B5448", "ink_muted": "#C5C2B8",
            "bg": "#FAFAF7", "bg_alt": "#FFFFFF", "bg_deep": "#F3F2EC", "text": "#050505", "text_mid": "#211F1A", "text_muted": "#5B5448",
            "border": "#E2E0D8", "accent_dim": "rgba(140, 105, 11, 0.08)", "accent_border": "#C5C2B8",
            "nav_bg": "rgba(250, 250, 247, 0.9)", "shadow_sm": "0 2px 6px rgba(0,0,0,0.05)",
            "shadow_md": "0 12px 32px rgba(0,0,0,0.08)", "shadow_lg": "0 20px 48px rgba(0,0,0,0.12)",
            "body_gradient": "linear-gradient(180deg, rgba(140, 105, 11, 0.05) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F3F2EC 0%, var(--bg) 70%)"
        },
        "eyebrow": "Editorial gold · Luxury serif · Symmetrical structure",
        "title": "Warm editorial gold on <span>pristine margins</span>",
        "lede": "A clean, high-precision layout celebrating warm paper-colored backdrops, rich gold-leaf highlight rules, and classic serif-driven typography hierarchies. Perfect for professional resumes, studios, and journals.",
        "tags": ["Editorial & Literary", "Creative & Portfolios", "Minimal & Brutalist"],
        "typography_desc": "Playfair Display delivers elegant, high-impact serif titles with sharp contrast. DM Sans provides geometric sans-serif legibility for body text.",
        "principles": [
            {"number": "01", "name": "Tactile paper warmth", "desc": "Keep surfaces slightly off-white and off-black to mimic natural materials."},
            {"number": "02", "name": "Generous symmetrical borders", "desc": "Align all components within clear grid structures with identical gutters on all screen sizes."},
            {"number": "03", "name": "Gold leaf focal points", "desc": "Accentuate key display headings and interactive tags with rich, warm gold leaf leaf-colors."}
        ]
    },
    {
        "id": "47",
        "name": "Aurablox Tech",
        "slug": "aurablox-tech",
        "font_import": '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />',
        "font_primary": '"DM Sans", sans-serif',
        "font_secondary": '"Fira Code", monospace',
        "accents": ["#B45309", "#D97706", "#F59E0B", "#FDE68A"],
        "accent_names": ["Amber Core", "Brilliant Orange", "Golden Sun", "Pale Glow"],
        "accent_uses": ["Primary UI action borders & status badges", "Interactive hovers", "Highlight accents", "Soft glowing overlays"],
        "dark": {
            "black": "#050403", "ink": "#0C0B0A", "ink_soft": "#1E1B18", "ink_mid": "#857C72", "ink_muted": "#524C46",
            "bg": "#0C0B0A", "bg_alt": "#141211", "bg_deep": "#070605", "text": "#FAF8F5", "text_mid": "#E3DDD5", "text_muted": "#8E867C",
            "border": "rgba(180, 83, 9, 0.22)", "accent_dim": "rgba(180, 83, 9, 0.1)", "accent_border": "rgba(180, 83, 9, 0.35)",
            "nav_bg": "rgba(12, 11, 10, 0.9)", "shadow_sm": "0 2px 8px rgba(180, 83, 9, 0.15)",
            "shadow_md": "0 12px 32px rgba(180, 83, 9, 0.22)", "shadow_lg": "0 20px 48px rgba(5, 4, 3, 0.8)",
            "body_gradient": "linear-gradient(180deg, rgba(180, 83, 9, 0.12) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #1E1B18 0%, var(--bg) 70%)"
        },
        "light": {
            "black": "#110F0E", "ink": "#FDFDFB", "ink_soft": "#F5F2EE", "ink_mid": "#7C7369", "ink_muted": "#B3ABA2",
            "bg": "#FDFDFB", "bg_alt": "#F7F4F0", "bg_deep": "#EBE7E2", "text": "#110F0E", "text_mid": "#2A2724", "text_muted": "#5C554E",
            "border": "rgba(180, 83, 9, 0.15)", "accent_dim": "rgba(180, 83, 9, 0.06)", "accent_border": "rgba(180, 83, 9, 0.25)",
            "nav_bg": "rgba(253, 253, 251, 0.9)", "shadow_sm": "0 2px 6px rgba(180, 83, 9, 0.08)",
            "shadow_md": "0 12px 32px rgba(180, 83, 9, 0.12)", "shadow_lg": "0 20px 48px rgba(180, 83, 9, 0.06)",
            "body_gradient": "linear-gradient(180deg, rgba(180, 83, 9, 0.06) 0%, transparent 40%), radial-gradient(circle at 50% 20%, #F5F2EE 0%, var(--bg) 70%)"
        },
        "eyebrow": "Amber core · High precision engineering · Blocky grids",
        "title": "Symmetrical amber grids on <span>AI-native foundations</span>",
        "lede": "A bold high-precision theme optimized for outcome-based strategy portfolios and AI engineering portals. Strict, blocky grid structures paired with glowing hot-amber indicators and monospace highlights.",
        "tags": ["SaaS & Enterprise", "Technical & Dev Tools", "Minimal & Brutalist"],
        "typography_desc": "DM Sans provides clean, heavy architectural headings. Fira Code renders technical monospace labels and code examples with machine accuracy.",
        "principles": [
            {"number": "01", "name": "Outcome-based grid hierarchy", "desc": "Format elements inside precise card boxes with clean, solid amber border lines."},
            {"number": "02", "name": "Precision monospace labels", "desc": "Use Fira Code for all micro-metadata, numbers, and stats to echo industrial precision."},
            {"number": "03", "name": "Symmetrical structure", "desc": "Keep content strictly aligned to the horizontal grid lines to maximize balance and white space."}
        ]
    }
]

more_themes_data = [   {   'accent_names': [   'Amazon Moss',
                            'Sage Bloom',
                            'Deep Forest',
                            'Tea Blossom'],
        'accent_uses': [   'Primary accent, borders',
                           'Metadata tags, highlights',
                           'Heavy titles, rules',
                           'Background glow, buttons'],
        'accents': ['#3B7A57', '#8FBC8F', '#2F5233', '#F4F9F4'],
        'dark': {   'accent_border': 'rgba(91, 162, 119, 0.4)',
                    'accent_dim': 'rgba(91, 162, 119, 0.12)',
                    'bg': '#141A16',
                    'bg_alt': '#1B221E',
                    'bg_deep': '#0F1310',
                    'black': '#141A16',
                    'body_gradient': 'linear-gradient(180deg, rgba(91, 162, '
                                     '119, 0.1) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#1B221E 0%, var(--bg) 70%)',
                    'border': 'rgba(91, 162, 119, 0.25)',
                    'ink': '#1B221E',
                    'ink_mid': '#8AA293',
                    'ink_muted': '#55685A',
                    'ink_soft': '#0F1310',
                    'nav_bg': 'rgba(20, 26, 22, 0.9)',
                    'shadow_lg': '0 25px 80px rgba(15, 19, 16, 0.85)',
                    'shadow_md': '0 12px 32px rgba(91, 162, 119, 0.16)',
                    'shadow_sm': '0 4px 20px rgba(91, 162, 119, 0.12)',
                    'text': '#ECF3EE',
                    'text_mid': '#C8D7CD',
                    'text_muted': '#8AA293'},
        'eyebrow': 'Botanical zen · Japanese precision · Moss stone',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600;800&family=Noto+Sans+JP:wght@300;400;500&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Noto Serif JP", serif',
        'font_secondary': '"Noto Sans JP", sans-serif',
        'id': '48',
        'lede': 'A quiet, highly disciplined layout inspired by Kyoto zen '
                'gardens. Gentle moss greens, tatami straw undertones, and '
                'structured stone grid frames foster meditative, highly '
                'readable layouts.',
        'light': {   'accent_border': 'rgba(59, 122, 87, 0.25)',
                     'accent_dim': 'rgba(59, 122, 87, 0.08)',
                     'bg': '#F3F6F4',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#E6ECE8',
                     'black': '#131A15',
                     'body_gradient': 'linear-gradient(180deg, rgba(59, 122, '
                                      '87, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#E6ECE8 0%, var(--bg) 70%)',
                     'border': 'rgba(59, 122, 87, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#55685A',
                     'ink_muted': '#C8D7CD',
                     'ink_soft': '#E6ECE8',
                     'nav_bg': 'rgba(243, 246, 244, 0.9)',
                     'shadow_lg': '0 16px 40px rgba(59, 122, 87, 0.08)',
                     'shadow_md': '0 8px 24px rgba(59, 122, 87, 0.1)',
                     'shadow_sm': '0 3px 12px rgba(59, 122, 87, 0.06)',
                     'text': '#131A15',
                     'text_mid': '#2E3A31',
                     'text_muted': '#55685A'},
        'name': 'Kyoto Moss Gardens',
        'principles': [   {   'desc': 'Keep surfaces slightly off-white and '
                                      'off-black to mimic natural materials.',
                              'name': 'Tactile paper warmth',
                              'number': '01'},
                          {   'desc': 'Align all components within clear grid '
                                      'structures with identical gutters on '
                                      'all screen sizes.',
                              'name': 'Generous symmetrical borders',
                              'number': '02'},
                          {   'desc': 'Use soft green borders and clean gray '
                                      'stone containers to partition display '
                                      'columns.',
                              'name': 'Moss-stone alignments',
                              'number': '03'}],
        'slug': 'kyoto-moss',
        'tags': ['Lifestyle & Organic', 'Minimal & Brutalist', 'Editorial & Literary'],
        'title': 'Muted moss on <span>symmetrical stone slabs</span>',
        'typography_desc': 'Noto Serif JP delivers organic display weight with '
                           'hand-brushed qualities. Noto Sans JP frames labels '
                           'and data points with geometry.'},
    {   'accent_names': [   'Faded Amber',
                            'Analogue Blue',
                            'Paper Cream',
                            'Dark Sepia'],
        'accent_uses': [   'Primary links, headers',
                           'Faded focus tags',
                           'Card body backgrounds',
                           'Typewriter text'],
        'accents': ['#C25E3A', '#4A6E82', '#E8DFD1', '#33261C'],
        'dark': {   'accent_border': 'rgba(194, 94, 58, 0.4)',
                    'accent_dim': 'rgba(194, 94, 58, 0.12)',
                    'bg': '#1F1A17',
                    'bg_alt': '#2E2520',
                    'bg_deep': '#161210',
                    'black': '#1F1A17',
                    'body_gradient': 'linear-gradient(180deg, rgba(194, 94, '
                                     '58, 0.15) 0%, transparent 40%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#2E2520 0%, var(--bg) 70%)',
                    'border': 'rgba(194, 94, 58, 0.25)',
                    'ink': '#2E2520',
                    'ink_mid': '#9E8C7D',
                    'ink_muted': '#5B4A3E',
                    'ink_soft': '#161210',
                    'nav_bg': 'rgba(31, 26, 23, 0.9)',
                    'shadow_lg': '0 16px 0px rgba(0, 0, 0, 1)',
                    'shadow_md': '0 8px 0px rgba(0, 0, 0, 1)',
                    'shadow_sm': '0 4px 0px rgba(0, 0, 0, 1)',
                    'text': '#E8DFD1',
                    'text_mid': '#D4C9BC',
                    'text_muted': '#9E8C7D'},
        'eyebrow': 'Analogue film · Retro typewriter · Raw borders',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Special Elite", cursive',
        'font_secondary': '"Courier Prime", monospace',
        'id': '49',
        'lede': 'A warm analogue theme recalling faded photographs and '
                'typewriter notes. Built around thick flat-shadowed frames, '
                'soft sepia ink, and classic slab-serif display weights.',
        'light': {   'accent_border': 'rgba(194, 94, 58, 0.28)',
                     'accent_dim': 'rgba(194, 94, 58, 0.08)',
                     'bg': '#EFECE5',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#E2DDD1',
                     'black': '#2E231C',
                     'body_gradient': 'linear-gradient(180deg, rgba(194, 94, '
                                      '58, 0.08) 0%, transparent 35%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#E2DDD1 0%, var(--bg) 70%)',
                     'border': 'rgba(194, 94, 58, 0.18)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#7A6B62',
                     'ink_muted': '#C5BEB0',
                     'ink_soft': '#E2DDD1',
                     'nav_bg': 'rgba(239, 236, 229, 0.9)',
                     'shadow_lg': '0 12px 0px rgba(46, 35, 28, 1)',
                     'shadow_md': '0 6px 0px rgba(46, 35, 28, 1)',
                     'shadow_sm': '0 3px 0px rgba(46, 35, 28, 1)',
                     'text': '#2E231C',
                     'text_mid': '#4A3C34',
                     'text_muted': '#7A6B62'},
        'name': 'Vintage Polaroid',
        'principles': [   {   'desc': 'Keep columns centered and box layouts '
                                      'simple, resembling stacked physical '
                                      'photo sheets.',
                              'name': 'Distressed alignments',
                              'number': '01'},
                          {   'desc': 'Frame components with solid 1px borders '
                                      'and deep black shadows for print-like '
                                      'depth.',
                              'name': 'Analogue borders',
                              'number': '02'},
                          {   'desc': 'Color metadata and borders with '
                                      'coffee-sepia hues to retain a vintage '
                                      'layout voice.',
                              'name': 'Sepia ink wash',
                              'number': '03'}],
        'slug': 'polaroid',
        'tags': ['Retro & Gaming', 'Creative & Portfolios', 'Minimal & Brutalist'],
        'title': 'Faded retro film on <span>inked typewriter</span>',
        'typography_desc': 'Special Elite renders bold, distressed, inked '
                           'display headlines. Courier Prime delivers '
                           'typewriter monospace structure.'},
    {   'accent_names': [   'Cabin Spruce',
                            'Warm Pine',
                            'Snow Mist',
                            'Hearth Fire'],
        'accent_uses': [   'Primary buttons, tags',
                           'Wood rules, dividers',
                           'Metadata, borders',
                           'Alerts, focus points'],
        'accents': ['#2C5E3B', '#C68B59', '#8FA89B', '#E05A47'],
        'dark': {   'accent_border': 'rgba(198, 139, 89, 0.4)',
                    'accent_dim': 'rgba(198, 139, 89, 0.12)',
                    'bg': '#0E1210',
                    'bg_alt': '#18201C',
                    'bg_deep': '#0A0D0B',
                    'black': '#0E1210',
                    'body_gradient': 'linear-gradient(180deg, rgba(198, 139, '
                                     '89, 0.1) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#18201C 0%, var(--bg) 70%)',
                    'border': 'rgba(198, 139, 89, 0.25)',
                    'ink': '#18201C',
                    'ink_mid': '#8FA89B',
                    'ink_muted': '#5B6E62',
                    'ink_soft': '#0A0D0B',
                    'nav_bg': 'rgba(14, 18, 16, 0.9)',
                    'shadow_lg': '0 25px 80px rgba(10, 13, 11, 0.85)',
                    'shadow_md': '0 12px 32px rgba(198, 139, 89, 0.16)',
                    'shadow_sm': '0 4px 20px rgba(198, 139, 89, 0.12)',
                    'text': '#ECF2EE',
                    'text_mid': '#C6D4CB',
                    'text_muted': '#8FA89B'},
        'eyebrow': 'Nordic forest · Scandinavian warm · Cabin pine',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;500;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Cinzel", serif',
        'font_secondary': '"Montserrat", sans-serif',
        'id': '50',
        'lede': 'A warm, rustic Scandi-minimalist layout marrying the deep '
                'greens of northern spruce forests with glowing pine wood '
                'accents and classic roman serif headlines.',
        'light': {   'accent_border': 'rgba(44, 94, 59, 0.25)',
                     'accent_dim': 'rgba(44, 94, 59, 0.08)',
                     'bg': '#F4F6F5',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#E5ECE9',
                     'black': '#121E16',
                     'body_gradient': 'linear-gradient(180deg, rgba(44, 94, '
                                      '59, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#E5ECE9 0%, var(--bg) 70%)',
                     'border': 'rgba(44, 94, 59, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#5B6E62',
                     'ink_muted': '#C6D4CB',
                     'ink_soft': '#E5ECE9',
                     'nav_bg': 'rgba(244, 246, 245, 0.9)',
                     'shadow_lg': '0 16px 40px rgba(44, 94, 59, 0.08)',
                     'shadow_md': '0 8px 24px rgba(44, 94, 59, 0.1)',
                     'shadow_sm': '0 3px 12px rgba(44, 94, 59, 0.06)',
                     'text': '#121E16',
                     'text_mid': '#233529',
                     'text_muted': '#5B6E62'},
        'name': 'Nordic Cabin',
        'principles': [   {   'desc': 'Keep content groupings compact and '
                                      'cozy, resembling a well-insulated '
                                      'alpine layout.',
                              'name': 'Forest density',
                              'number': '01'},
                          {   'desc': 'Highlight tags and icons with '
                                      'amber-pine colors to introduce warmth '
                                      'into cool slate surfaces.',
                              'name': 'Warm pine accents',
                              'number': '02'},
                          {   'desc': 'Establish a stark center-aligned title '
                                      'structure for display panels to deliver '
                                      'visual calm.',
                              'name': 'Symmetrical displays',
                              'number': '03'}],
        'slug': 'nordic-cabin',
        'tags': ['Lifestyle & Organic', 'Editorial & Literary', 'Minimal & Brutalist'],
        'title': 'Forest spruce on <span>pine wood slabs</span>',
        'typography_desc': 'Cinzel delivers ancient architectural serif '
                           'display headlines. Montserrat provides clean '
                           'modern geometric sans-serif copy.'},
    {   'accent_names': [   'Neon Rose',
                            'Cyber Cyan',
                            'Laser Violet',
                            'Vapor Gold'],
        'accent_uses': [   'Primary glow, alerts',
                           'Active links, tags',
                           'Borders, deep wells',
                           'Warm highlights'],
        'accents': ['#FF007F', '#00F0FF', '#9B30FF', '#FFDD00'],
        'dark': {   'accent_border': 'rgba(255, 0, 127, 0.45)',
                    'accent_dim': 'rgba(255, 0, 127, 0.15)',
                    'bg': '#0F051D',
                    'bg_alt': '#1C0D30',
                    'bg_deep': '#0A0314',
                    'black': '#0F051D',
                    'body_gradient': 'linear-gradient(180deg, rgba(255, 0, '
                                     '127, 0.25) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#1C0D30 0%, var(--bg) 70%)',
                    'border': 'rgba(255, 0, 127, 0.28)',
                    'ink': '#1C0D30',
                    'ink_mid': '#9E86B9',
                    'ink_muted': '#5C4A75',
                    'ink_soft': '#0A0314',
                    'nav_bg': 'rgba(15, 5, 29, 0.9)',
                    'shadow_lg': '0 25px 80px rgba(10, 3, 20, 0.9)',
                    'shadow_md': '0 12px 36px rgba(255, 0, 127, 0.35)',
                    'shadow_sm': '0 4px 12px rgba(255, 0, 127, 0.22)',
                    'text': '#00F0FF',
                    'text_mid': '#E0C3FC',
                    'text_muted': '#9E86B9'},
        'eyebrow': 'Nostalgic 80s · Synthwave neon · Digital sunset',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Grotesk:wght@400;600&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Orbitron", sans-serif',
        'font_secondary': '"Space Grotesk", sans-serif',
        'id': '51',
        'lede': 'A high-impact nostalgic digital sunset theme. Built around '
                'glowing neon magenta accents, cyber cyan highlights, and bold '
                'geometric display structures.',
        'light': {   'accent_border': 'rgba(255, 0, 127, 0.25)',
                     'accent_dim': 'rgba(255, 0, 127, 0.08)',
                     'bg': '#FFF0F5',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#F5D6EB',
                     'black': '#4D0039',
                     'body_gradient': 'linear-gradient(180deg, rgba(255, 0, '
                                      '127, 0.08) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#F5D6EB 0%, var(--bg) 70%)',
                     'border': 'rgba(255, 0, 127, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#9C5B8B',
                     'ink_muted': '#D2A2C6',
                     'ink_soft': '#F5D6EB',
                     'nav_bg': 'rgba(255, 240, 245, 0.9)',
                     'shadow_lg': '0 16px 40px rgba(255, 0, 127, 0.08)',
                     'shadow_md': '0 8px 24px rgba(255, 0, 127, 0.12)',
                     'shadow_sm': '0 3px 12px rgba(255, 0, 127, 0.08)',
                     'text': '#4D0039',
                     'text_mid': '#6C2557',
                     'text_muted': '#9C5B8B'},
        'name': 'Vaporwave Sunset',
        'principles': [   {   'desc': 'Keep layout borders high-intensity neon '
                                      'cyan and rose to map user paths '
                                      'explicitly.',
                              'name': 'Vibrant visual wireframes',
                              'number': '01'},
                          {   'desc': 'Use large transparent shadows to '
                                      'introduce a cathode-ray glowing '
                                      'ambience to text frames.',
                              'name': 'Synthwave glows',
                              'number': '02'},
                          {   'desc': 'Strictly align blocks along horizontal '
                                      'columns to match synthwave grid '
                                      'graphics.',
                              'name': 'Laser precision alignment',
                              'number': '03'}],
        'slug': 'vaporwave',
        'tags': ['Retro & Gaming', 'Creative & Portfolios', 'Lifestyle & Organic'],
        'title': 'Neon magenta on <span>retro cyber sunset</span>',
        'typography_desc': 'Orbitron renders high-impact, futuristic display '
                           'headings. Space Grotesk frames content with '
                           'geometric sans-serif precision.'},
    {   'accent_names': ['Dune Sand', 'Sun Gold', 'Palm Shade', 'Warm Silk'],
        'accent_uses': [   'Primary links, kickers',
                           'Borders, alerts',
                           'Fills, text-muted',
                           'Warm backdrops'],
        'accents': ['#C27D38', '#D97706', '#2D3B2E', '#FDF6EC'],
        'dark': {   'accent_border': 'rgba(217, 119, 6, 0.35)',
                    'accent_dim': 'rgba(217, 119, 6, 0.1)',
                    'bg': '#17120E',
                    'bg_alt': '#241C16',
                    'bg_deep': '#0F0C09',
                    'black': '#17120E',
                    'body_gradient': 'linear-gradient(180deg, rgba(217, 119, '
                                     '6, 0.15) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#241C16 0%, var(--bg) 70%)',
                    'border': 'rgba(217, 119, 6, 0.22)',
                    'ink': '#241C16',
                    'ink_mid': '#A8988C',
                    'ink_muted': '#5C4F44',
                    'ink_soft': '#0F0C09',
                    'nav_bg': 'rgba(23, 18, 14, 0.9)',
                    'shadow_lg': '0 20px 48px rgba(15, 12, 9, 0.85)',
                    'shadow_md': '0 12px 32px rgba(217, 119, 6, 0.22)',
                    'shadow_sm': '0 4px 20px rgba(217, 119, 6, 0.15)',
                    'text': '#FAF6F2',
                    'text_mid': '#E3D8CE',
                    'text_muted': '#A8988C'},
        'eyebrow': 'Warm terracotta · Sahara sands · Desert oasis',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Outfit:wght@300;400;500;600&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Cinzel", serif',
        'font_secondary': '"Outfit", sans-serif',
        'id': '52',
        'lede': 'A warm desert-inspired theme wrapping sand storm colors with '
                'golden sun highlights and high-contrast editorial typography. '
                'Gives a peaceful, organic, high-end travel portfolio feel.',
        'light': {   'accent_border': 'rgba(217, 119, 6, 0.25)',
                     'accent_dim': 'rgba(217, 119, 6, 0.06)',
                     'bg': '#FDF8F2',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#F5ECE2',
                     'black': '#2E1E12',
                     'body_gradient': 'linear-gradient(180deg, rgba(217, 119, '
                                      '6, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#F5ECE2 0%, var(--bg) 70%)',
                     'border': 'rgba(217, 119, 6, 0.15)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#7A6352',
                     'ink_muted': '#D6C7B7',
                     'ink_soft': '#F5ECE2',
                     'nav_bg': 'rgba(253, 248, 242, 0.9)',
                     'shadow_lg': '0 20px 48px rgba(217, 119, 6, 0.06)',
                     'shadow_md': '0 12px 32px rgba(217, 119, 6, 0.12)',
                     'shadow_sm': '0 2px 8px rgba(217, 119, 6, 0.08)',
                     'text': '#2E1E12',
                     'text_mid': '#4A3525',
                     'text_muted': '#7A6352'},
        'name': 'Sahara Dust',
        'principles': [   {   'desc': 'Align elements to strict grid '
                                      'parameters to evoke the calm structure '
                                      'of natural dunes.',
                              'name': 'Sands-of-time symmetry',
                              'number': '01'},
                          {   'desc': 'Keep card panels and buttons slightly '
                                      'tinted with warm wood sand hues to '
                                      'anchor layout components.',
                              'name': 'Oasis cooling wells',
                              'number': '02'},
                          {   'desc': 'Highlight editorial serifs with warm '
                                      'gold-amber to frame key headlines.',
                              'name': 'Sun-drenched type',
                              'number': '03'}],
        'slug': 'sahara',
        'tags': ['Lifestyle & Organic', 'Creative & Portfolios', 'Minimal & Brutalist'],
        'title': 'Terracotta dust on <span>golden sands</span>',
        'typography_desc': 'Cinzel renders display weights with classic roman '
                           'symmetry. Outfit handles body copy with modern '
                           'rounded precision.'},
    {   'accent_names': [   'Neon Abyss',
                            'Deep Coral',
                            'Sunken Pearl',
                            'Sub Wave'],
        'accent_uses': [   'Active tags, highlights',
                           'Borders, deep panels',
                           'Secondary text highlight',
                           'Deep body background'],
        'accents': ['#00F5D4', '#7B2CBF', '#FF70A6', '#00B4D8'],
        'dark': {   'accent_border': 'rgba(0, 245, 212, 0.4)',
                    'accent_dim': 'rgba(0, 245, 212, 0.12)',
                    'bg': '#030A16',
                    'bg_alt': '#07152D',
                    'bg_deep': '#01050B',
                    'black': '#030A16',
                    'body_gradient': 'linear-gradient(180deg, rgba(0, 245, '
                                     '212, 0.15) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#07152D 0%, var(--bg) 70%)',
                    'border': 'rgba(0, 245, 212, 0.25)',
                    'ink': '#07152D',
                    'ink_mid': '#6093B3',
                    'ink_muted': '#3B5C75',
                    'ink_soft': '#01050B',
                    'nav_bg': 'rgba(3, 10, 22, 0.9)',
                    'shadow_lg': '0 25px 80px rgba(1, 5, 11, 0.9)',
                    'shadow_md': '0 12px 36px rgba(0, 245, 212, 0.22)',
                    'shadow_sm': '0 4px 16px rgba(0, 245, 212, 0.15)',
                    'text': '#E0FCFF',
                    'text_mid': '#A2D8F2',
                    'text_muted': '#6093B3'},
        'eyebrow': 'Deep marine · Bioluminescent glow · Ocean abyss',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Grotesk:wght@400;600&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Syne", sans-serif',
        'font_secondary': '"Space Grotesk", sans-serif',
        'id': '53',
        'lede': 'A deep bioluminescent ocean theme with neon cyan borders and '
                'deep indigo slabs. Creates an immersive, underwater tech '
                'portal feel.',
        'light': {   'accent_border': 'rgba(0, 180, 216, 0.25)',
                     'accent_dim': 'rgba(0, 180, 216, 0.08)',
                     'bg': '#EAF8FA',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#D5EEF2',
                     'black': '#021B21',
                     'body_gradient': 'linear-gradient(180deg, rgba(0, 180, '
                                      '216, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#D5EEF2 0%, var(--bg) 70%)',
                     'border': 'rgba(0, 180, 216, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#4A6D75',
                     'ink_muted': '#91BFC7',
                     'ink_soft': '#D5EEF2',
                     'nav_bg': 'rgba(234, 248, 250, 0.9)',
                     'shadow_lg': '0 16px 40px rgba(0, 180, 216, 0.08)',
                     'shadow_md': '0 8px 24px rgba(0, 180, 216, 0.1)',
                     'shadow_sm': '0 3px 12px rgba(0, 180, 216, 0.06)',
                     'text': '#021B21',
                     'text_mid': '#1E3F47',
                     'text_muted': '#4A6D75'},
        'name': 'Deep Oceanic Trench',
        'principles': [   {   'desc': 'Stack cards with subtle blue borders '
                                      'and deep overlays to mimic underwater '
                                      'visual density.',
                              'name': 'Trench depth layering',
                              'number': '01'},
                          {   'desc': 'Highlight metadata chips and primary '
                                      'buttons with bright cyan to stand out '
                                      'against deep oceanic canvas.',
                              'name': 'Bioluminescent cues',
                              'number': '02'},
                          {   'desc': 'Maintain equal, wide margins to mirror '
                                      'the vastness of the sea floor.',
                              'name': 'Symmetric fluid layouts',
                              'number': '03'}],
        'slug': 'oceanic-trench',
        'tags': ['Technical & Dev Tools', 'Creative & Portfolios', 'Minimal & Brutalist'],
        'title': 'Bioluminescent cyan on <span>oceanic abyss</span>',
        'typography_desc': 'Syne provides wide, heavy organic shapes for '
                           'headers. Space Grotesk frames content with '
                           'geometric legibility.'},
    {   'accent_names': [   'Swiss Crimson',
                            'Stark Ink',
                            'Snow White',
                            'Helvetica Slate'],
        'accent_uses': [   'Primary red brand accents',
                           'Heavy titles, borders',
                           'Pristine fields',
                           'Subtle text metadata'],
        'accents': ['#E11D48', '#111827', '#FFFFFF', '#6B7280'],
        'dark': {   'accent_border': '#E11D48',
                    'accent_dim': 'rgba(225, 29, 72, 0.15)',
                    'bg': '#000000',
                    'bg_alt': '#111111',
                    'bg_deep': '#0A0A0A',
                    'black': '#000000',
                    'body_gradient': 'linear-gradient(180deg, rgba(225, 29, '
                                     '72, 0.1) 0%, transparent 40%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#111111 0%, var(--bg) 70%)',
                    'border': '#FFFFFF',
                    'ink': '#111111',
                    'ink_mid': '#9CA3AF',
                    'ink_muted': '#4B5563',
                    'ink_soft': '#0A0A0A',
                    'nav_bg': 'rgba(0, 0, 0, 0.95)',
                    'shadow_lg': '0 16px 0px rgba(255,255,255,1)',
                    'shadow_md': '0 8px 0px rgba(255,255,255,1)',
                    'shadow_sm': '0 4px 0px rgba(255,255,255,1)',
                    'text': '#FFFFFF',
                    'text_mid': '#E5E7EB',
                    'text_muted': '#9CA3AF'},
        'eyebrow': 'Swiss Bauhaus · Stark minimal · Heavy borders',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&family=Inter:wght@400;500;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Archivo", sans-serif',
        'font_secondary': '"Inter", sans-serif',
        'id': '54',
        'lede': 'An ultra-minimalist, high-impact design system inspired by '
                'classic Swiss editorial layouts. Stiff black borders, stark '
                'red highlights, and massive sans-serif type.',
        'light': {   'accent_border': '#E11D48',
                     'accent_dim': 'rgba(225, 29, 72, 0.08)',
                     'bg': '#FFFFFF',
                     'bg_alt': '#F3F4F6',
                     'bg_deep': '#E5E7EB',
                     'black': '#000000',
                     'body_gradient': 'linear-gradient(180deg, rgba(225, 29, '
                                      '72, 0.05) 0%, transparent 35%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#F3F4F6 0%, var(--bg) 70%)',
                     'border': '#000000',
                     'ink': '#FFFFFF',
                     'ink_mid': '#4B5563',
                     'ink_muted': '#E5E7EB',
                     'ink_soft': '#F3F4F6',
                     'nav_bg': 'rgba(255, 255, 255, 0.95)',
                     'shadow_lg': '0 12px 0px rgba(0,0,0,1)',
                     'shadow_md': '0 6px 0px rgba(0,0,0,1)',
                     'shadow_sm': '0 3px 0px rgba(0,0,0,1)',
                     'text': '#000000',
                     'text_mid': '#1F2937',
                     'text_muted': '#4B5563'},
        'name': 'Monochrome Swiss Bold',
        'principles': [   {   'desc': 'Keep cards completely rectangular with '
                                      'zero rounded corners and thick, blocky '
                                      'border outlines.',
                              'name': 'Swiss grid alignment',
                              'number': '01'},
                          {   'desc': 'Ditch multi-color schemes; use one '
                                      'high-intensity Swiss red accent color '
                                      'to command all visual focus.',
                              'name': 'Bauhaus red focal points',
                              'number': '02'},
                          {   'desc': 'Rely strictly on Archivo display '
                                      'headings set to maximum uppercase scale '
                                      'for a bold editorial voice.',
                              'name': 'Clinical type scale',
                              'number': '03'}],
        'slug': 'swiss-bold',
        'tags': ['Minimal & Brutalist', 'SaaS & Enterprise', 'Editorial & Literary'],
        'title': 'Stark crimson on <span>Bauhaus monoliths</span>',
        'typography_desc': 'Archivo delivers raw, ultra-condensed black weight '
                           'display. Inter provides clinical, neutral layout '
                           'copy.'},
    {   'accent_names': [   'Neon Orchid',
                            'Radioactive Green',
                            'Laser Cyan',
                            'Tokyo Dusk'],
        'accent_uses': [   'Primary hot actions',
                           'Status signals, tags',
                           'Highlights, links',
                           'Deep block wells'],
        'accents': ['#F000FF', '#00FF66', '#00E5FF', '#180A2B'],
        'dark': {   'accent_border': 'rgba(240, 0, 255, 0.45)',
                    'accent_dim': 'rgba(240, 0, 255, 0.12)',
                    'bg': '#0B0410',
                    'bg_alt': '#150C20',
                    'bg_deep': '#050208',
                    'black': '#0B0410',
                    'body_gradient': 'linear-gradient(180deg, rgba(240, 0, '
                                     '255, 0.18) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#150C20 0%, var(--bg) 70%)',
                    'border': 'rgba(240, 0, 255, 0.25)',
                    'ink': '#150C20',
                    'ink_mid': '#9478B8',
                    'ink_muted': '#5C4A75',
                    'ink_soft': '#050208',
                    'nav_bg': 'rgba(11, 4, 16, 0.9)',
                    'shadow_lg': '0 25px 80px rgba(5, 2, 8, 0.9)',
                    'shadow_md': '0 12px 36px rgba(240, 0, 255, 0.3)',
                    'shadow_sm': '0 4px 12px rgba(240, 0, 255, 0.2)',
                    'text': '#00FF66',
                    'text_mid': '#E3C8FF',
                    'text_muted': '#9478B8'},
        'eyebrow': 'Cyberpunk night · Tokyo neon · CRT terminal',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Fira+Code:wght@400;500;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Syncopate", sans-serif',
        'font_secondary': '"Fira Code", monospace',
        'id': '55',
        'lede': 'A high-voltage cyberpunk theme mirroring Tokyo neon '
                'streetlights. Built around rich orchid purple borders, '
                'technical radioactive green highlights, and horizontal grid '
                'alignment.',
        'light': {   'accent_border': 'rgba(240, 0, 255, 0.25)',
                     'accent_dim': 'rgba(240, 0, 255, 0.08)',
                     'bg': '#FBF8FE',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#EFE6FA',
                     'black': '#2E004B',
                     'body_gradient': 'linear-gradient(180deg, rgba(240, 0, '
                                      '255, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#EFE6FA 0%, var(--bg) 70%)',
                     'border': 'rgba(240, 0, 255, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#7A439C',
                     'ink_muted': '#C29AD9',
                     'ink_soft': '#EFE6FA',
                     'nav_bg': 'rgba(251, 248, 254, 0.9)',
                     'shadow_lg': '0 16px 40px rgba(240, 0, 255, 0.08)',
                     'shadow_md': '0 8px 24px rgba(240, 0, 255, 0.12)',
                     'shadow_sm': '0 3px 12px rgba(240, 0, 255, 0.08)',
                     'text': '#2E004B',
                     'text_mid': '#4A156B',
                     'text_muted': '#7A439C'},
        'name': 'Tokyo Neon Alley',
        'principles': [   {   'desc': 'Apply purple glowing shadows behind '
                                      'button blocks to resemble neon lights '
                                      'on wet street asphalt.',
                              'name': 'Rain-slicked reflections',
                              'number': '01'},
                          {   'desc': 'Render all buttons, values, and metrics '
                                      'in radioactive lime green for stark '
                                      'visibility.',
                              'name': 'Radioactive telemetry',
                              'number': '02'},
                          {   'desc': 'Keep secondary labels strictly '
                                      'monospaced to align with high-tech '
                                      'dashboard systems.',
                              'name': 'Command-line monospace',
                              'number': '03'}],
        'slug': 'tokyo-neon',
        'tags': ['Retro & Gaming', 'Technical & Dev Tools', 'Creative & Portfolios'],
        'title': 'Neon orchid on <span>slick tokyo asphalt</span>',
        'typography_desc': 'Syncopate provides wide uppercase displays. Fira '
                           'Code prints clean technical monospace copies.'},
    {   'accent_names': [   'Dusty Chalk',
                            'Beige Eraser',
                            'Slate Green',
                            'Stark White'],
        'accent_uses': [   'Primary display, rules',
                           'Metadata text',
                           'Deep chalkboard wells',
                           'High contrast labels'],
        'accents': ['#C2B080', '#F5F5DC', '#2D3E35', '#FFFFFF'],
        'dark': {   'accent_border': 'rgba(245, 245, 220, 0.35)',
                    'accent_dim': 'rgba(245, 245, 220, 0.1)',
                    'bg': '#16201B',
                    'bg_alt': '#1E2B25',
                    'bg_deep': '#0F1613',
                    'black': '#16201B',
                    'body_gradient': 'linear-gradient(180deg, rgba(245, 245, '
                                     '220, 0.12) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#1E2B25 0%, var(--bg) 70%)',
                    'border': 'rgba(245, 245, 220, 0.22)',
                    'ink': '#1E2B25',
                    'ink_mid': '#8FA097',
                    'ink_muted': '#52635A',
                    'ink_soft': '#0F1613',
                    'nav_bg': 'rgba(22, 32, 27, 0.9)',
                    'shadow_lg': '0 16px 0px rgba(0,0,0,0.9)',
                    'shadow_md': '0 8px 0px rgba(0,0,0,0.7)',
                    'shadow_sm': '0 4px 0px rgba(0,0,0,0.5)',
                    'text': '#F5F5DC',
                    'text_mid': '#E3E3D1',
                    'text_muted': '#8FA097'},
        'eyebrow': 'Academic slate · Chalkboard dust · Literary serif',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Courier+Prime:wght@400;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Playfair Display", Georgia, serif',
        'font_secondary': '"Courier Prime", monospace',
        'id': '56',
        'lede': 'A warm academic dark theme built on chalkboard slate green. '
                'Emulates manual blackboards with dusty-chalk white text, gold '
                'chalk rules, and literary typewriter copy.',
        'light': {   'accent_border': 'rgba(28, 43, 36, 0.25)',
                     'accent_dim': 'rgba(28, 43, 36, 0.08)',
                     'bg': '#F7F7F0',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#EAEAE2',
                     'black': '#1C2B24',
                     'body_gradient': 'linear-gradient(180deg, rgba(28, 43, '
                                      '36, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#EAEAE2 0%, var(--bg) 70%)',
                     'border': 'rgba(28, 43, 36, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#5C6F66',
                     'ink_muted': '#B5B5A7',
                     'ink_soft': '#EAEAE2',
                     'nav_bg': 'rgba(247, 247, 240, 0.9)',
                     'shadow_lg': '0 12px 0px rgba(28, 43, 36, 0.9)',
                     'shadow_md': '0 6px 0px rgba(28, 43, 36, 0.7)',
                     'shadow_sm': '0 3px 0px rgba(28, 43, 36, 0.5)',
                     'text': '#1C2B24',
                     'text_mid': '#2E3F37',
                     'text_muted': '#5C6F66'},
        'name': 'Chalkboard Editorial',
        'principles': [   {   'desc': 'Keep headings high-contrast, set to an '
                                      'elegant handwritten literary style '
                                      'resembling dry chalk notes.',
                              'name': 'Chalk-written displays',
                              'number': '01'},
                          {   'desc': 'Rest your eyes with slate green '
                                      'surfaces in both light and dark modes '
                                      'to avoid visual strain.',
                              'name': 'Slate green backdrops',
                              'number': '02'},
                          {   'desc': 'Offset panels using raw, flat, '
                                      'non-blurred shadows for vintage '
                                      'editorial authority.',
                              'name': 'Flat blackboard shadow',
                              'number': '03'}],
        'slug': 'chalkboard',
        'tags': ['Editorial & Literary', 'Technical & Dev Tools', 'Minimal & Brutalist'],
        'title': 'Chalkboard slate on <span>dusty chalk type</span>',
        'typography_desc': 'Playfair Display delivers reader-friendly '
                           'editorial displays. Courier Prime delivers '
                           'chalkboard typewriter structure.'},
    {   'accent_names': [   'Amethyst Violet',
                            'Opal Pink',
                            'Quartz Emerald',
                            'Sapphire Blue'],
        'accent_uses': [   'Primary crystal highlights',
                           'Interactive buttons',
                           'Active badges',
                           'Soft glowing shadows'],
        'accents': ['#8B5CF6', '#EC4899', '#10B981', '#3B82F6'],
        'dark': {   'accent_border': 'rgba(139, 92, 246, 0.35)',
                    'accent_dim': 'rgba(139, 92, 246, 0.1)',
                    'bg': '#0F0C1B',
                    'bg_alt': '#18132B',
                    'bg_deep': '#0A0812',
                    'black': '#0F0C1B',
                    'body_gradient': 'linear-gradient(180deg, rgba(139, 92, '
                                     '246, 0.15) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#18132B 0%, var(--bg) 70%)',
                    'border': 'rgba(139, 92, 246, 0.22)',
                    'ink': '#18132B',
                    'ink_mid': '#A89ECF',
                    'ink_muted': '#5C5385',
                    'ink_soft': '#0A0812',
                    'nav_bg': 'rgba(15, 12, 27, 0.9)',
                    'shadow_lg': '0 20px 48px rgba(10, 8, 18, 0.85)',
                    'shadow_md': '0 12px 32px rgba(139, 92, 246, 0.16)',
                    'shadow_sm': '0 4px 20px rgba(139, 92, 246, 0.12)',
                    'text': '#FAF9FE',
                    'text_mid': '#E3DEFA',
                    'text_muted': '#A89ECF'},
        'eyebrow': 'Iridescent quartz · Luxury design · Opaline crystal',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,700;1,6..72,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Newsreader", serif',
        'font_secondary': '"Plus Jakarta Sans", sans-serif',
        'id': '57',
        'lede': 'A soft holographic luxury theme styled around iridescent '
                'mineral textures. Perfect for jewelry designers, holistic '
                'wellness brands, and creative fashion studios.',
        'light': {   'accent_border': 'rgba(139, 92, 246, 0.25)',
                     'accent_dim': 'rgba(139, 92, 246, 0.06)',
                     'bg': '#FAF9FF',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#EFEBFC',
                     'black': '#1C0F3A',
                     'body_gradient': 'linear-gradient(180deg, rgba(139, 92, '
                                      '246, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#EFEBFC 0%, var(--bg) 70%)',
                     'border': 'rgba(139, 92, 246, 0.15)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#6A529C',
                     'ink_muted': '#B5A9D6',
                     'ink_soft': '#EFEBFC',
                     'nav_bg': 'rgba(250, 249, 255, 0.9)',
                     'shadow_lg': '0 20px 48px rgba(139, 92, 246, 0.06)',
                     'shadow_md': '0 12px 32px rgba(139, 92, 246, 0.12)',
                     'shadow_sm': '0 2px 8px rgba(139, 92, 246, 0.08)',
                     'text': '#1C0F3A',
                     'text_mid': '#331F5C',
                     'text_muted': '#6A529C'},
        'name': 'Aura Quartz',
        'principles': [   {   'desc': 'Keep layout surfaces tinted with soft, '
                                      'translucent violet and rose crystal '
                                      'shades.',
                              'name': 'Opaline mineral hues',
                              'number': '01'},
                          {   'desc': 'Color shadows with transparent amethyst '
                                      'and sapphire tones to resemble glowing '
                                      'crystals.',
                              'name': 'Prism light glows',
                              'number': '02'},
                          {   'desc': 'Couple strict grid containment lines '
                                      'with soft font shapes for organic yet '
                                      'structured layout weight.',
                              'name': 'Fluid precision',
                              'number': '03'}],
        'slug': 'aura-quartz',
        'tags': ['Lifestyle & Organic', 'Creative & Portfolios', 'Minimal & Brutalist'],
        'title': 'Opaline crystal on <span>iridescent quartz</span>',
        'typography_desc': 'Newsreader handles display serif titles with '
                           'elegant ligatures. Plus Jakarta Sans delivers '
                           'geometric body copy.'},
    {   'accent_names': [   'Dark Espresso',
                            'Steamed Caramel',
                            'Golden crema',
                            'Milk Foam'],
        'accent_uses': [   'Primary text, borders',
                           'Metadata tags, links',
                           'Crema active glow',
                           'Steamed milk background'],
        'accents': ['#78350F', '#D97706', '#F59E0B', '#FDF6EC'],
        'dark': {   'accent_border': 'rgba(217, 119, 6, 0.35)',
                    'accent_dim': 'rgba(217, 119, 6, 0.1)',
                    'bg': '#140C08',
                    'bg_alt': '#1E120C',
                    'bg_deep': '#0A0604',
                    'black': '#140C08',
                    'body_gradient': 'linear-gradient(180deg, rgba(217, 119, '
                                     '6, 0.15) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#1E120C 0%, var(--bg) 70%)',
                    'border': 'rgba(217, 119, 6, 0.22)',
                    'ink': '#1E120C',
                    'ink_mid': '#A8988C',
                    'ink_muted': '#5C4D44',
                    'ink_soft': '#0A0604',
                    'nav_bg': 'rgba(20, 12, 8, 0.9)',
                    'shadow_lg': '0 20px 48px rgba(10, 6, 4, 0.85)',
                    'shadow_md': '0 12px 32px rgba(217, 119, 6, 0.22)',
                    'shadow_sm': '0 4px 20px rgba(217, 119, 6, 0.15)',
                    'text': '#FAF6F2',
                    'text_mid': '#E3D5CA',
                    'text_muted': '#A8988C'},
        'eyebrow': 'Rich coffee roasted · Steamed milk · Warm cafe',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Fraunces", serif',
        'font_secondary': '"DM Sans", sans-serif',
        'id': '58',
        'lede': 'A warm, rich editorial theme wrapping coffee roasted color '
                'variables with steamed milk backdrops, golden crema '
                'highlights, and bold serif displays.',
        'light': {   'accent_border': 'rgba(217, 119, 6, 0.25)',
                     'accent_dim': 'rgba(217, 119, 6, 0.06)',
                     'bg': '#FAF6F2',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#EFE6DE',
                     'black': '#2E1E12',
                     'body_gradient': 'linear-gradient(180deg, rgba(217, 119, '
                                      '6, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#EFE6DE 0%, var(--bg) 70%)',
                     'border': 'rgba(217, 119, 6, 0.15)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#7A6352',
                     'ink_muted': '#D2C5B8',
                     'ink_soft': '#EFE6DE',
                     'nav_bg': 'rgba(250, 246, 242, 0.9)',
                     'shadow_lg': '0 20px 48px rgba(217, 119, 6, 0.06)',
                     'shadow_md': '0 12px 32px rgba(217, 119, 6, 0.12)',
                     'shadow_sm': '0 2px 8px rgba(217, 119, 6, 0.08)',
                     'text': '#2E1E12',
                     'text_mid': '#4A3525',
                     'text_muted': '#7A6352'},
        'name': 'Espresso Editorial',
        'principles': [   {   'desc': 'Set surface elements to pure milk-white '
                                      'against warm caramel-tinted coffee '
                                      'backdrops.',
                              'name': 'Steamed milk canvas',
                              'number': '01'},
                          {   'desc': 'Keep board borders and rules colored '
                                      'with rich dark espresso bean brown for '
                                      'clean editorial contrast.',
                              'name': 'Roasted bean lines',
                              'number': '02'},
                          {   'desc': 'Balance text blocks evenly inside wide '
                                      'grid containers for a pristine reading '
                                      'layout.',
                              'name': 'Symmetrical cafe style',
                              'number': '03'}],
        'slug': 'espresso',
        'tags': ['Lifestyle & Organic', 'Editorial & Literary', 'Minimal & Brutalist'],
        'title': 'Espresso crema on <span>steamed milk foam</span>',
        'typography_desc': 'Fraunces delivers warm, organic Display serif '
                           'titles. DM Sans handles clean geometric sans-serif '
                           'copy.'},
    {   'accent_names': ['Seal Red', 'Stone Wash', 'Stone Ink', 'Washi Cream'],
        'accent_uses': [   'Red seal highlights, alerts',
                           'Borders, deep panels',
                           'Secondary text',
                           'Washi backdrops'],
        'accents': ['#B45309', '#9A3412', '#292524', '#F5F5F4'],
        'dark': {   'accent_border': 'rgba(180, 83, 9, 0.35)',
                    'accent_dim': 'rgba(180, 83, 9, 0.1)',
                    'bg': '#1C1917',
                    'bg_alt': '#272522',
                    'bg_deep': '#12100F',
                    'black': '#1C1917',
                    'body_gradient': 'linear-gradient(180deg, rgba(180, 83, 9, '
                                     '0.15) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#272522 0%, var(--bg) 70%)',
                    'border': 'rgba(180, 83, 9, 0.22)',
                    'ink': '#272522',
                    'ink_mid': '#A8A6A1',
                    'ink_muted': '#5C5954',
                    'ink_soft': '#12100F',
                    'nav_bg': 'rgba(28, 25, 23, 0.9)',
                    'shadow_lg': '0 20px 48px rgba(18, 16, 15, 0.85)',
                    'shadow_md': '0 12px 32px rgba(180, 83, 9, 0.22)',
                    'shadow_sm': '0 4px 20px rgba(180, 83, 9, 0.15)',
                    'text': '#FAF9F6',
                    'text_mid': '#E3E1DC',
                    'text_muted': '#A8A6A1'},
        'eyebrow': 'Traditional washi · Bilingual layout · Red seal',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600;800&family=Inter:wght@400;500;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Noto Serif JP", serif',
        'font_secondary': '"Inter", sans-serif',
        'id': '59',
        'lede': 'A high-precision bilingual layout inspired by Japanese '
                'ink-wash calligraphy and washi paper textures. Bold stone '
                'slate, delicate red seal highlights, and precise grid '
                'balance.',
        'light': {   'accent_border': 'rgba(180, 83, 9, 0.25)',
                     'accent_dim': 'rgba(180, 83, 9, 0.06)',
                     'bg': '#FAF9F6',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#EFECE6',
                     'black': '#1C1917',
                     'body_gradient': 'linear-gradient(180deg, rgba(180, 83, '
                                      '9, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#EFECE6 0%, var(--bg) 70%)',
                     'border': 'rgba(180, 83, 9, 0.15)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#6B6663',
                     'ink_muted': '#C2BEB7',
                     'ink_soft': '#EFECE6',
                     'nav_bg': 'rgba(250, 249, 246, 0.9)',
                     'shadow_lg': '0 20px 48px rgba(180, 83, 9, 0.06)',
                     'shadow_md': '0 12px 32px rgba(180, 83, 9, 0.12)',
                     'shadow_sm': '0 2px 8px rgba(180, 83, 9, 0.08)',
                     'text': '#1C1917',
                     'text_mid': '#332F2D',
                     'text_muted': '#6B6663'},
        'name': 'Bilingual Zen',
        'principles': [   {   'desc': 'Keep typography layout and spacing '
                                      'identical across English and Japanese '
                                      'metadata structures.',
                              'name': 'Bilingual visual balance',
                              'number': '01'},
                          {   'desc': 'Keep panels light cream and grey to '
                                      'honor ink-brushed visual weight.',
                              'name': 'Ink-wash contrast',
                              'number': '02'},
                          {   'desc': 'Highlight primary buttons and '
                                      'interactive highlights with one warm '
                                      'vermilion hanko seal color.',
                              'name': 'Hanko red seal',
                              'number': '03'}],
        'slug': 'zen-bilingual',
        'tags': ['Minimal & Brutalist', 'Editorial & Literary', 'Lifestyle & Organic'],
        'title': 'Japanese seal red on <span>symmetrical washi</span>',
        'typography_desc': 'Noto Serif JP delivers brush-stroke display '
                           'headers. Inter provides clinical, neutral layout '
                           'copy.'},
    {   'accent_names': [   'Matrix Green',
                            'Arcade Pink',
                            'Laser Cyan',
                            'Insert Coin Yellow'],
        'accent_uses': [   'Primary text, borders',
                           'Focus tags, alerts',
                           'Active links, hovers',
                           'Soft highlights'],
        'accents': ['#39FF14', '#FF007F', '#00FFFF', '#FFFF00'],
        'dark': {   'accent_border': '#39FF14',
                    'accent_dim': 'rgba(57, 255, 20, 0.15)',
                    'bg': '#000000',
                    'bg_alt': '#0A0A0A',
                    'bg_deep': '#050505',
                    'black': '#000000',
                    'body_gradient': 'linear-gradient(180deg, rgba(57, 255, '
                                     '20, 0.2) 0%, transparent 40%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#0A0A0A 0%, var(--bg) 70%)',
                    'border': '#39FF14',
                    'ink': '#0A0A0A',
                    'ink_mid': '#007F00',
                    'ink_muted': '#004700',
                    'ink_soft': '#050505',
                    'nav_bg': 'rgba(0, 0, 0, 0.95)',
                    'shadow_lg': '0 16px 0px rgba(57, 255, 20, 0.8)',
                    'shadow_md': '0 8px 0px rgba(57, 255, 20, 0.5)',
                    'shadow_sm': '0 4px 0px rgba(57, 255, 20, 0.3)',
                    'text': '#39FF14',
                    'text_mid': '#00FF00',
                    'text_muted': '#007F00'},
        'eyebrow': 'CRT screen · 8-bit retro · Neon arcade',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Courier+Prime:wght@400;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Press Start 2P", cursive',
        'font_secondary': '"Courier Prime", monospace',
        'id': '60',
        'lede': 'A high-contrast 8-bit retro arcade theme. Emulates CRT '
                'terminals with matrix green text, scanline glows, and retro '
                'pixelated headlines.',
        'light': {   'accent_border': '#004F00',
                     'accent_dim': 'rgba(0, 79, 0, 0.08)',
                     'bg': '#FAFBF9',
                     'bg_alt': '#F0FAF3',
                     'bg_deep': '#E2ECE5',
                     'black': '#004F00',
                     'body_gradient': 'linear-gradient(180deg, rgba(0, 79, 0, '
                                      '0.05) 0%, transparent 35%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#F0FAF3 0%, var(--bg) 70%)',
                     'border': '#004F00',
                     'ink': '#FFFFFF',
                     'ink_mid': '#008000',
                     'ink_muted': '#8AA68E',
                     'ink_soft': '#E2ECE5',
                     'nav_bg': 'rgba(250, 251, 249, 0.95)',
                     'shadow_lg': '0 12px 0px rgba(0,79,0,1)',
                     'shadow_md': '0 6px 0px rgba(0,79,0,1)',
                     'shadow_sm': '0 3px 0px rgba(0,79,0,1)',
                     'text': '#004F00',
                     'text_mid': '#006600',
                     'text_muted': '#008000'},
        'name': 'Retro Arcade Neon',
        'principles': [   {   'desc': 'Frame all buttons with thick green '
                                      'borders and neon pixel-shadow offsets.',
                              'name': 'Scanline CRT borders',
                              'number': '01'},
                          {   'desc': 'Color metadata badges and warnings with '
                                      'pixel yellow and arcade pink alerts.',
                              'name': 'Insert Coin highlights',
                              'number': '02'},
                          {   'desc': 'Keep text columns precisely aligned, '
                                      'mimicking retro game HUD interfaces.',
                              'name': 'Strict monospace layouts',
                              'number': '03'}],
        'slug': 'arcade-neon',
        'tags': ['Retro & Gaming', 'Technical & Dev Tools', 'Creative & Portfolios'],
        'title': '8-bit matrix green on <span>CRT monitor grids</span>',
        'typography_desc': 'Press Start 2P renders classic retro 8-bit display '
                           'titles. Courier Prime handles technical monospace '
                           'annotations.'},
    {   'accent_names': [   'Pressed Sage',
                            'Dried Lavender',
                            'Walnut Ink',
                            'Linen Canvas'],
        'accent_uses': [   'Primary text highlighting',
                           'Decorative links, tags',
                           'Dividers, lines',
                           'Soft canvas backgrounds'],
        'accents': ['#2D5A27', '#7851A9', '#78350F', '#E6D9CC'],
        'dark': {   'accent_border': 'rgba(45, 90, 39, 0.4)',
                    'accent_dim': 'rgba(45, 90, 39, 0.12)',
                    'bg': '#14130F',
                    'bg_alt': '#1E1C16',
                    'bg_deep': '#0A0907',
                    'black': '#14130F',
                    'body_gradient': 'linear-gradient(180deg, rgba(45, 90, 39, '
                                     '0.1) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#1E1C16 0%, var(--bg) 70%)',
                    'border': 'rgba(45, 90, 39, 0.25)',
                    'ink': '#1E1C16',
                    'ink_mid': '#8A8A7A',
                    'ink_muted': '#5C5B52',
                    'ink_soft': '#0A0907',
                    'nav_bg': 'rgba(20, 19, 15, 0.9)',
                    'shadow_lg': '0 25px 80px rgba(10, 9, 7, 0.85)',
                    'shadow_md': '0 12px 32px rgba(45, 90, 39, 0.16)',
                    'shadow_sm': '0 4px 20px rgba(45, 90, 39, 0.12)',
                    'text': '#ECEDE2',
                    'text_mid': '#CFCFC0',
                    'text_muted': '#8A8A7A'},
        'eyebrow': 'Pressed flora · Vintage herbarium · Walnut ink',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Spectral:wght@300;400;600&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"EB Garamond", serif',
        'font_secondary': '"Spectral", serif',
        'id': '61',
        'lede': 'A quiet, historical theme themed around dried botanical '
                'illustrations. Soft linen canvases, pressed sage leaves, '
                'walnut ink lines, and elegant editorial serifs.',
        'light': {   'accent_border': 'rgba(45, 90, 39, 0.25)',
                     'accent_dim': 'rgba(45, 90, 39, 0.08)',
                     'bg': '#FAF6EE',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#EFEAE0',
                     'black': '#232B1A',
                     'body_gradient': 'linear-gradient(180deg, rgba(45, 90, '
                                      '39, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#EFEAE0 0%, var(--bg) 70%)',
                     'border': 'rgba(45, 90, 39, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#6B755E',
                     'ink_muted': '#C2C7BA',
                     'ink_soft': '#EFEAE0',
                     'nav_bg': 'rgba(250, 246, 238, 0.9)',
                     'shadow_lg': '0 16px 40px rgba(45, 90, 39, 0.08)',
                     'shadow_md': '0 8px 24px rgba(45, 90, 39, 0.1)',
                     'shadow_sm': '0 3px 12px rgba(45, 90, 39, 0.06)',
                     'text': '#232B1A',
                     'text_mid': '#3A452C',
                     'text_muted': '#6B755E'},
        'name': 'Botanical Herbarium',
        'principles': [   {   'desc': 'Center all headings and align grid '
                                      'elements symmetrically to mimic '
                                      'botanical archives.',
                              'name': 'Pressed canvas grids',
                              'number': '01'},
                          {   'desc': 'Keep borders tinted with warm pressed '
                                      'sage green and dried lavender flora '
                                      'accents.',
                              'name': 'Dried botanical accents',
                              'number': '02'},
                          {   'desc': 'Use thin, sharp rules colored with '
                                      'sepia walnut ink to separate content '
                                      'sections.',
                              'name': 'Walnut ink boundaries',
                              'number': '03'}],
        'slug': 'herbarium',
        'tags': ['Lifestyle & Organic', 'Editorial & Literary', 'Minimal & Brutalist'],
        'title': 'Pressed sage on <span>vintage linen canvas</span>',
        'typography_desc': 'EB Garamond provides historic display serif '
                           'styling. Spectral handles clean body copy.'},
    {   'accent_names': [   'Martian Rust',
                            'Dust Storm Orange',
                            'Titanium Silver',
                            'Terraform Glow'],
        'accent_uses': [   'Primary colony telemetry',
                           'Borders, grids',
                           'Symmetrical text, stats',
                           'Glowing alerts'],
        'accents': ['#C2410C', '#9A3412', '#E2E8F0', '#EA580C'],
        'dark': {   'accent_border': 'rgba(194, 65, 12, 0.4)',
                    'accent_dim': 'rgba(194, 65, 12, 0.12)',
                    'bg': '#0F0A08',
                    'bg_alt': '#1A110D',
                    'bg_deep': '#0A0605',
                    'black': '#0F0A08',
                    'body_gradient': 'linear-gradient(180deg, rgba(194, 65, '
                                     '12, 0.15) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#1A110D 0%, var(--bg) 70%)',
                    'border': 'rgba(194, 65, 12, 0.25)',
                    'ink': '#1A110D',
                    'ink_mid': '#94A3B8',
                    'ink_muted': '#5C4E49',
                    'ink_soft': '#0A0605',
                    'nav_bg': 'rgba(15, 10, 8, 0.9)',
                    'shadow_lg': '0 25px 80px rgba(10, 6, 5, 0.9)',
                    'shadow_md': '0 12px 36px rgba(194, 65, 12, 0.22)',
                    'shadow_sm': '0 4px 16px rgba(194, 65, 12, 0.15)',
                    'text': '#E2E8F0',
                    'text_mid': '#CBD5E1',
                    'text_muted': '#94A3B8'},
        'eyebrow': 'Martian colony · Space exploration · Space telemetry',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Fira+Code:wght@400;500;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Orbitron", sans-serif',
        'font_secondary': '"Fira Code", monospace',
        'id': '62',
        'lede': 'A high-contrast red-planet technical theme. Built around deep '
                'carbon dark mode, rusty Martian soil highlights, and '
                'high-precision telemetry monospace readouts.',
        'light': {   'accent_border': 'rgba(194, 65, 12, 0.25)',
                     'accent_dim': 'rgba(194, 65, 12, 0.08)',
                     'bg': '#FAF6F5',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#EFE6E2',
                     'black': '#2E1308',
                     'body_gradient': 'linear-gradient(180deg, rgba(194, 65, '
                                      '12, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#EFE6E2 0%, var(--bg) 70%)',
                     'border': 'rgba(194, 65, 12, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_soft': '#EFE6E2',
                     'nav_bg': 'rgba(250, 246, 245, 0.9)',
                     'shadow_lg': '0 16px 40px rgba(194, 65, 12, 0.08)',
                     'shadow_md': '0 8px 24px rgba(194, 65, 12, 0.1)',
                     'shadow_sm': '0 3px 12px rgba(194, 65, 12, 0.06)',
                     'text': '#2E1308',
                     'text_mid': '#4A2414',
                     'text_muted': '#7A422D',
                     'ink_mid': '#7A422D',
                     'ink_muted': '#EFE6E2'},
        'name': 'Mars Colony',
        'principles': [   {   'desc': 'Keep buttons and telemetry blocks '
                                      'rectangular with sharp borders and '
                                      'carbon shadow offsets.',
                              'name': 'Titanium frames',
                              'number': '01'},
                          {   'desc': 'Signal active elements with dust storm '
                                      'orange alerts against silver-gray '
                                      'surfaces.',
                              'name': 'Terraform indicators',
                              'number': '02'},
                          {   'desc': 'Set wide borders to organize data '
                                      'readouts logically across columns.',
                              'name': 'Symmetric space layout',
                              'number': '03'}],
        'slug': 'mars-colony',
        'tags': ['Technical & Dev Tools', 'Retro & Gaming', 'Creative & Portfolios'],
        'title': 'Martian rust on <span>titanium telemetry grids</span>',
        'typography_desc': 'Orbitron provides bold geometric display headings. '
                           'Fira Code prints clean technical monospace '
                           'readouts.'},
    {   'accent_names': [   'High Coral',
                            'Signal Cyan',
                            'Sunset Amber',
                            'Seafoam Glow'],
        'accent_uses': [   'Primary coral highlights',
                           'Interactive buttons, tags',
                           'Borders, lines',
                           'Soft seafoam overlays'],
        'accents': ['#EA580C', '#06B6D4', '#FDBA74', '#ECFDF5'],
        'dark': {   'accent_border': 'rgba(234, 88, 12, 0.4)',
                    'accent_dim': 'rgba(234, 88, 12, 0.12)',
                    'bg': '#070F1E',
                    'bg_alt': '#0D1B32',
                    'bg_deep': '#030812',
                    'black': '#070F1E',
                    'body_gradient': 'linear-gradient(180deg, rgba(234, 88, '
                                     '12, 0.15) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#0D1B32 0%, var(--bg) 70%)',
                    'border': 'rgba(234, 88, 12, 0.25)',
                    'ink': '#0D1B32',
                    'ink_mid': '#64748B',
                    'ink_muted': '#3D485C',
                    'ink_soft': '#030812',
                    'nav_bg': 'rgba(7, 15, 30, 0.9)',
                    'shadow_lg': '0 25px 80px rgba(3, 8, 18, 0.9)',
                    'shadow_md': '0 12px 36px rgba(234, 88, 12, 0.22)',
                    'shadow_sm': '0 4px 16px rgba(234, 88, 12, 0.15)',
                    'text': '#ECFDF5',
                    'text_mid': '#A7F3D0',
                    'text_muted': '#64748B'},
        'eyebrow': 'Tritanopia optimized · Marine theme · Accessibility',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;600&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Plus Jakarta Sans", system-ui, sans-serif',
        'font_secondary': '"Space Grotesk", sans-serif',
        'id': '63',
        'lede': 'A marine-inspired layout optimized for blue-yellow '
                'colorblindness (Tritanopia). Replaces blue-yellow boundaries '
                'with high-contrast red-cyan visual indicators.',
        'light': {   'accent_border': 'rgba(234, 88, 12, 0.25)',
                     'accent_dim': 'rgba(234, 88, 12, 0.08)',
                     'bg': '#F0FDFA',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#D1FAE5',
                     'black': '#064E3B',
                     'body_gradient': 'linear-gradient(180deg, rgba(234, 88, '
                                      '12, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#D1FAE5 0%, var(--bg) 70%)',
                     'border': 'rgba(234, 88, 12, 0.16)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#3B82F6',
                     'ink_muted': '#A2BEFA',
                     'ink_soft': '#D1FAE5',
                     'nav_bg': 'rgba(240, 253, 250, 0.9)',
                     'shadow_lg': '0 16px 40px rgba(234, 88, 12, 0.08)',
                     'shadow_md': '0 8px 24px rgba(234, 88, 12, 0.1)',
                     'shadow_sm': '0 3px 12px rgba(234, 88, 12, 0.06)',
                     'text': '#064E3B',
                     'text_mid': '#047857',
                     'text_muted': '#3B82F6'},
        'name': 'Tritanopia Marine',
        'principles': [   {   'desc': 'Keep visual indicators restricted to '
                                      'red/orange and cyan to ensure clear '
                                      'perception for tritanopia users.',
                              'name': 'Tritanopia contrast',
                              'number': '01'},
                          {   'desc': 'Layer light turquoise and emerald bases '
                                      'to evoke fresh marine air.',
                              'name': 'Pristine ocean frames',
                              'number': '02'},
                          {   'desc': 'Arrange all stats and labels on '
                                      'horizontal lines to provide consistent, '
                                      'clean reading focus.',
                              'name': 'Structured layouts',
                              'number': '03'}],
        'slug': 'tritan-marine',
        'tags': ['Technical & Dev Tools', 'Minimal & Brutalist', 'SaaS & Enterprise'],
        'title': 'Signal coral orange on <span>high-contrast ocean</span>',
        'typography_desc': 'Plus Jakarta Sans handles wide displays. Space '
                           'Grotesk frames labels with geometric shapes.'},
    {   'accent_names': [   'Opal Emerald',
                            'Pearl White',
                            'Onyx Green',
                            'Mint Hue'],
        'accent_uses': [   'Primary luxury borders',
                           'Metadata tags, text',
                           'Crema active highlights',
                           'Soft backgrounds'],
        'accents': ['#10B981', '#E2E8F0', '#059669', '#34D399'],
        'dark': {   'accent_border': 'rgba(16, 185, 129, 0.35)',
                    'accent_dim': 'rgba(16, 185, 129, 0.1)',
                    'bg': '#090C0A',
                    'bg_alt': '#111612',
                    'bg_deep': '#050705',
                    'black': '#090C0A',
                    'body_gradient': 'linear-gradient(180deg, rgba(16, 185, '
                                     '129, 0.15) 0%, transparent 45%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#111612 0%, var(--bg) 70%)',
                    'border': 'rgba(16, 185, 129, 0.22)',
                    'ink': '#111612',
                    'ink_mid': '#8AA293',
                    'ink_muted': '#55685A',
                    'ink_soft': '#050705',
                    'nav_bg': 'rgba(9, 12, 10, 0.9)',
                    'shadow_lg': '0 20px 48px rgba(5, 7, 5, 0.85)',
                    'shadow_md': '0 12px 32px rgba(16, 185, 129, 0.16)',
                    'shadow_sm': '0 4px 20px rgba(16, 185, 129, 0.12)',
                    'text': '#E6ECE8',
                    'text_mid': '#C2CFC7',
                    'text_muted': '#8AA293'},
        'eyebrow': 'Pearl luxury · Onyx emerald · Luxury editorial',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;500;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Cinzel", serif',
        'font_secondary': '"Montserrat", sans-serif',
        'id': '64',
        'lede': 'A high-end editorial luxury theme designed around deep '
                'emerald onyx and pearl white. Symmetrical, clean columns and '
                'roman serif typography create a premium designer portfolio '
                'tone.',
        'light': {   'accent_border': 'rgba(16, 185, 129, 0.25)',
                     'accent_dim': 'rgba(16, 185, 129, 0.06)',
                     'bg': '#F3F7F5',
                     'bg_alt': '#FFFFFF',
                     'bg_deep': '#E6ECE8',
                     'black': '#091E12',
                     'body_gradient': 'linear-gradient(180deg, rgba(16, 185, '
                                      '129, 0.06) 0%, transparent 40%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#E6ECE8 0%, var(--bg) 70%)',
                     'border': 'rgba(16, 185, 129, 0.15)',
                     'ink': '#FFFFFF',
                     'ink_mid': '#4F6E5C',
                     'ink_muted': '#C2CFC7',
                     'ink_soft': '#E6ECE8',
                     'nav_bg': 'rgba(243, 247, 245, 0.9)',
                     'shadow_lg': '0 20px 48px rgba(16, 185, 129, 0.06)',
                     'shadow_md': '0 12px 32px rgba(16, 185, 129, 0.12)',
                     'shadow_sm': '0 2px 8px rgba(16, 185, 129, 0.08)',
                     'text': '#091E12',
                     'text_mid': '#183A26',
                     'text_muted': '#4F6E5C'},
        'name': 'Opaline Luxury',
        'principles': [   {   'desc': 'Deliver extensive visual breathing '
                                      'room, allowing high-contrast emerald '
                                      'details to stand out.',
                              'name': 'Pearl-white luxury spacing',
                              'number': '01'},
                          {   'desc': 'Keep elements structured inside elegant '
                                      'cards with thin, high-precision emerald '
                                      'borders.',
                              'name': 'Onyx framing',
                              'number': '02'},
                          {   'desc': 'Keep details aligned strictly to the '
                                      'vertical columns to reflect designer '
                                      'precision.',
                              'name': 'Symmetrical design grids',
                              'number': '03'}],
        'slug': 'opaline',
        'tags': ['Lifestyle & Organic', 'Creative & Portfolios', 'Minimal & Brutalist'],
        'title': 'Opal emerald on <span>pearl white canvas</span>',
        'typography_desc': 'Cinzel provides classic roman displays. Montserrat '
                           'handles clean geometric sans-serif copy.'},
    {   'accent_names': [   'Hazard Orange',
                            'Galvanized Steel',
                            'Stark White',
                            'Industrial Slate'],
        'accent_uses': [   'Warning tags, highlight borders',
                           'Slab fills',
                           'Typewriter text',
                           'Heavy rules'],
        'accents': ['#F97316', '#9CA3AF', '#FFFFFF', '#374151'],
        'dark': {   'accent_border': '#F97316',
                    'accent_dim': 'rgba(249, 115, 22, 0.15)',
                    'bg': '#1E2022',
                    'bg_alt': '#2D3033',
                    'bg_deep': '#121314',
                    'black': '#121314',
                    'body_gradient': 'linear-gradient(180deg, rgba(249, 115, '
                                     '22, 0.1) 0%, transparent 40%), '
                                     'radial-gradient(circle at 50% 30%, '
                                     '#2D3033 0%, var(--bg) 70%)',
                    'border': '#F97316',
                    'ink': '#2D3033',
                    'ink_mid': '#9CA3AF',
                    'ink_muted': '#5C6370',
                    'ink_soft': '#121314',
                    'nav_bg': 'rgba(30, 32, 34, 0.92)',
                    'shadow_lg': '0 16px 0px rgba(0, 0, 0, 1)',
                    'shadow_md': '0 8px 0px rgba(0, 0, 0, 1)',
                    'shadow_sm': '0 4px 0px rgba(0, 0, 0, 1)',
                    'text': '#FFFFFF',
                    'text_mid': '#E5E7EB',
                    'text_muted': '#9CA3AF'},
        'eyebrow': 'Industrial rebar · Steel grid · Brutalist tech',
        'font_import': '<link '
                       'href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Courier+Prime:wght@400;700&display=swap" '
                       'rel="stylesheet" />',
        'font_primary': '"Archivo Black", sans-serif',
        'font_secondary': '"Courier Prime", monospace',
        'id': '65',
        'lede': 'A stiff, high-contrast industrial theme built on galvanized '
                'steel colors. Thick black grid boundaries, glowing warning '
                'hazard orange indicators, and raw monospace typing.',
        'light': {   'accent_border': '#000000',
                     'accent_dim': 'rgba(0, 0, 0, 0.08)',
                     'bg': '#D1D5DB',
                     'bg_alt': '#E5E7EB',
                     'bg_deep': '#9CA3AF',
                     'black': '#000000',
                     'body_gradient': 'linear-gradient(180deg, rgba(0, 0, 0, '
                                      '0.05) 0%, transparent 35%), '
                                      'radial-gradient(circle at 50% 20%, '
                                      '#E5E7EB 0%, var(--bg) 70%)',
                     'border': '#000000',
                     'ink': '#FFFFFF',
                     'ink_mid': '#374151',
                     'ink_muted': '#9CA3AF',
                     'ink_soft': '#E5E7EB',
                     'nav_bg': 'rgba(209, 213, 219, 0.92)',
                     'shadow_lg': '0 12px 0px rgba(0, 0, 0, 1)',
                     'shadow_md': '0 6px 0px rgba(0, 0, 0, 1)',
                     'shadow_sm': '0 3px 0px rgba(0, 0, 0, 1)',
                     'text': '#000000',
                     'text_mid': '#111827',
                     'text_muted': '#374151'},
        'name': 'Brutalist Steel Grid',
        'principles': [   {   'desc': 'Format surfaces with cool metallic gray '
                                      'blocks to resemble structural steel '
                                      'panels.',
                              'name': 'Galvanized steel plates',
                              'number': '01'},
                          {   'desc': 'Use warning hazard orange for active '
                                      'states, outlines, and metrics to focus '
                                      'visual pathways.',
                              'name': 'Hazard orange signals',
                              'number': '02'},
                          {   'desc': 'Frame components with solid black '
                                      'outlines and flat offset shadows for '
                                      'rigid industrial structure.',
                              'name': 'Monolith grid alignment',
                              'number': '03'}],
        'slug': 'steel-grid',
        'tags': ['Minimal & Brutalist', 'Technical & Dev Tools', 'SaaS & Enterprise'],
        'title': 'Industrial orange on <span>galvanized steel grids</span>',
        'typography_desc': 'Archivo Black delivers raw, heavy display headers. '
                           'Courier Prime delivers typewriter monospace '
                           'structure.'}]

themes.extend(remaining_themes_data)
themes.extend(more_themes_data)


# Let's read theme_template.html to extract the core HTML layout structure
with open('theme_template.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

# Let's turn crimson.html into a dynamic template. We'll do simple string replacements.
# First, let's identify parts to replace.

template = orig_html

# Let's replace the page title
template = re.sub(
    r'<title>Crimson Horizon — Theme Reference</title>',
    r'<title>{name} — Theme Reference</title>',
    template
)

# Let's replace the font link
template = template.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet" />',
    '{font_import}'
)

# Let's replace the entire style block variables from :root up to [data-theme="light"] {...}
# Let's find where the variables end. It ends before *, *::before, *::after
variables_pattern = r':root\s*\{[^}]*--ease-out:[^}]*\}\s*\[data-theme="dark"\]\s*\{[^}]*\}\s*\[data-theme="light"\]\s*\{[^}]*\}'

new_variables_block = """:root {
            --accent: {accent1};
            --accent-light: {accent2};
            --accent-bright: {accent3};
            --accent-pale: {accent4};

            --r-sm: 4px;
            --r-md: 8px;
            --r-lg: 14px;

            --sp-1: 4px;
            --sp-2: 8px;
            --sp-3: 12px;
            --sp-4: 16px;
            --sp-5: 24px;
            --sp-6: 32px;
            --sp-7: 48px;
            --sp-8: 64px;
            --sp-9: 96px;
            --sp-10: 128px;

            --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
        }

        [data-theme="dark"] {
            --accent-dim: {dark_accent_dim};
            --accent-border: {dark_accent_border};

            --black: {dark_black};
            --ink: {dark_ink};
            --ink-soft: {dark_ink_soft};
            --ink-mid: {dark_ink_mid};
            --ink-muted: {dark_ink_muted};

            --bg: {dark_bg};
            --bg-alt: {dark_bg_alt};
            --bg-deep: {dark_bg_deep};
            --text: {dark_text};
            --text-mid: {dark_text_mid};
            --text-muted: {dark_text_muted};
            --border: {dark_border};
            --nav-bg: {dark_nav_bg};

            --shadow-sm: {dark_shadow_sm};
            --shadow-md: {dark_shadow_md};
            --shadow-lg: {dark_shadow_lg};

            --body-gradient: {dark_body_gradient};

            --section-shell-bg: var(--bg-alt);
            --section-shell-bg-alt: var(--bg);
        }

        [data-theme="light"] {
            --accent-dim: {light_accent_dim};
            --accent-border: {light_accent_border};

            --black: {light_black};
            --ink: {light_ink};
            --ink-soft: {light_ink_soft};
            --ink-mid: {light_ink_mid};
            --ink-muted: {light_ink_muted};

            --bg: {light_bg};
            --bg-alt: {light_bg_alt};
            --bg-deep: {light_bg_deep};
            --text: {light_text};
            --text-mid: {light_text_mid};
            --text-muted: {light_text_muted};
            --border: {light_border};
            --nav-bg: {light_nav_bg};

            --shadow-sm: {light_shadow_sm};
            --shadow-md: {light_shadow_md};
            --shadow-lg: {light_shadow_lg};

            --body-gradient: {light_body_gradient};

            --section-shell-bg: var(--bg-alt);
            --section-shell-bg-alt: var(--bg);
        }"""

template = re.sub(variables_pattern, new_variables_block, template)

# Replace all occurrences of --crimson references in CSS to --accent references
template = template.replace('--crimson-light', '--accent-light')
template = template.replace('--crimson-bright', '--accent-bright')
template = template.replace('--crimson-pale', '--accent-pale')
template = template.replace('--crimson-dim', '--accent-dim')
template = template.replace('--crimson-border', '--accent-border')
template = template.replace('--crimson', '--accent')

# Replace the hardcoded card number color to use --accent-pale and opacity
template = template.replace('color: rgba(217, 45, 13, 0.35);', 'color: var(--accent-pale); opacity: 0.45;')

# Make the fonts in body and secondary styles dynamic
template = template.replace('font-family: "Montserrat", system-ui, -apple-system, sans-serif;', 'font-family: {font_primary_family};')
template = template.replace('font-family: "Josefin Sans", sans-serif;', 'font-family: {font_secondary_family};')
template = template.replace('font-family: "Josefin Sans", sans-serif, monospace;', 'font-family: {font_secondary_family}, monospace;')
template = template.replace('font-family: "Josefin Sans", monospace;', 'font-family: {font_secondary_family}, monospace;')

# Replace the Brand Title and Header Meta in the body
template = re.sub(
    r'<div class="page-header-brand">Crimson <span>Horizon</span></div>',
    r'<div class="page-header-brand">{brand_title_formatted}</div>',
    template
)

template = template.replace(
    'Crimson vibe — aesthetic and clean',
    '{style_vibe}'
)

# Replace the Hero Content
hero_copy_pattern = r'<section class="hero-panel section-shell" aria-labelledby="theme-hero">.*?<\/section>'
new_hero_copy = """<section class="hero-panel section-shell" aria-labelledby="theme-hero">
            <div class="section-inner">
                <div class="hero-copy">
                    <div class="eyebrow">{hero_eyebrow}</div>
                    <h1 id="theme-hero" class="hero-title">{hero_title}</h1>
                    <p class="hero-lede">
                        {hero_lede}
                    </p>
                    <div class="hero-tags">
                        <span class="tag tag-gold">{hero_tag1}</span>
                        <span class="tag tag-ink">{hero_tag2}</span>
                        <span class="tag tag-filled">{hero_tag3}</span>
                    </div>
                </div>
            </div>
        </section>"""
template = re.sub(hero_copy_pattern, new_hero_copy, template, flags=re.DOTALL)

# Accent palette swatches use {accent*} placeholders directly in theme_template.html

# Replace the Typography description and the specific font display blocks
template = template.replace(
    'Montserrat handles display and UI weight. Josefin Sans carries labels, metadata, and monospace-adjacent detail.',
    '{typography_desc}'
)
template = template.replace(
    '<strong>Display</strong>Montserrat Display',
    '<strong>Display</strong>{font_primary_name} Display'
)
template = template.replace(
    '<div class="display-type">Crimson <span>Horizon</span></div>',
    '<div class="display-type">{brand_title_formatted}</div>'
)
template = template.replace(
    '<strong>Heading 1</strong>Montserrat H1',
    '<strong>Heading 1</strong>{font_primary_name} H1'
)
template = template.replace(
    '<strong>Heading 2</strong>Montserrat H2',
    '<strong>Heading 2</strong>{font_primary_name} H2'
)
template = template.replace(
    '<strong>Body</strong>Montserrat Regular',
    '<strong>Body</strong>{font_primary_name} Regular'
)
template = template.replace(
    '<strong>Label</strong>Josefin Sans Medium',
    '<strong>Label</strong>{font_secondary_name} Medium'
)

# Replace the UI components brand name display
template = template.replace(
    '<div class="nav-brand">Crimson <span>Horizon</span></div>',
    '<div class="nav-brand">{brand_title_formatted}</div>'
)

# Replace the principles grid content
principles_pattern = r'<div class="principles-grid"[^>]*>.*?<\/div>\s*<\/div>\s*<\/section>'
new_principles = """<div class="principles-grid" style="margin-top:24px">
                <div class="principle-card">
                    <div class="principle-number">{p1_num}</div>
                    <div class="principle-name">{p1_name}</div>
                    <p class="principle-desc">{p1_desc}</p>
                </div>
                <div class="principle-card">
                    <div class="principle-number">{p2_num}</div>
                    <div class="principle-name">{p2_name}</div>
                    <p class="principle-desc">{p2_desc}</p>
                </div>
                <div class="principle-card">
                    <div class="principle-number">{p3_num}</div>
                    <div class="principle-name">{p3_name}</div>
                    <p class="principle-desc">{p3_desc}</p>
                </div>
            </div>
            </div>
        </section>"""
template = re.sub(principles_pattern, new_principles, template, flags=re.DOTALL)

# Replace the Footer Brand block
footer_brand_pattern = r'<div class="footer-brand">Crimson <span>Horizon</span></div>'
template = template.replace(
    footer_brand_pattern,
    '<div class="footer-brand">{brand_title_formatted}</div>'
)



# Let's fix Javascript THEME_TOKENS block
js_tokens_pattern = r'const THEME_TOKENS = \{.*?\}\s*;\s*function showToast'
new_js_tokens = """const THEME_TOKENS = {
            dark: {
                "--accent-dim": "{dark_accent_dim}",
                "--accent-border": "{dark_accent_border}",
                "--black": "{dark_black}",
                "--ink": "{dark_ink}",
                "--ink-soft": "{dark_ink_soft}",
                "--ink-mid": "{dark_ink_mid}",
                "--ink-muted": "{dark_ink_muted}",
                "--bg": "{dark_bg}",
                "--bg-alt": "{dark_bg_alt}",
                "--bg-deep": "{dark_bg_deep}",
                "--text": "{dark_text}",
                "--text-mid": "{dark_text_mid}",
                "--text-muted": "{dark_text_muted}",
                "--border": "{dark_border}",
            },
            light: {
                "--accent-dim": "{light_accent_dim}",
                "--accent-border": "{light_accent_border}",
                "--black": "{light_black}",
                "--ink": "{light_ink}",
                "--ink-soft": "{light_ink_soft}",
                "--ink-mid": "{light_ink_mid}",
                "--ink-muted": "{light_ink_muted}",
                "--bg": "{light_bg}",
                "--bg-alt": "{light_bg_alt}",
                "--bg-deep": "{light_bg_deep}",
                "--text": "{light_text}",
                "--text-mid": "{light_text_mid}",
                "--text-muted": "{light_text_muted}",
                "--border": "{light_border}",
            },
        };

        function showToast"""
template = re.sub(js_tokens_pattern, new_js_tokens, template, flags=re.DOTALL)

# Let's fix renderTokenBlock function in JS to output the correct shared accent variables
new_js_render_block = """function renderTokenBlock() {
            const accent = `  /* Accent — shared */
  --accent: {accent1};
  --accent-light: {accent2};
  --accent-bright: {accent3};
  --accent-pale: {accent4};`;

            function block(mode) {
                const tokens = THEME_TOKENS[mode];
                const lines = Object.entries(tokens).map(([key, val]) => `  ${key}: ${val};`);
                return `[data-theme="${mode}"] {\\n${lines.join("\\n")}\\n}`;
            }

            const html = `:root {\\n${accent}\\n}\\n\\n${block("dark")}\\n\\n${block("light")}`;
            tokenBlock.textContent = html;
        }"""
match_block = re.search(r'function renderTokenBlock\(\)\s*\{.*?tokenBlock\.textContent = html;\s*\}', template, flags=re.DOTALL)
if match_block:
    template = template[:match_block.start()] + new_js_render_block + template[match_block.end():]


# Now, generate each theme page!
for theme in themes:
    slug = theme["slug"]
    name = theme["name"]
    
    # Split the name into first word and the rest for brand spans: e.g. "Crimson Horizon" -> "Crimson <span>Horizon</span>"
    parts = name.split(" ", 1)
    if len(parts) > 1:
        brand_title_formatted = f'{parts[0]} <span>{parts[1]}</span>'
    else:
        brand_title_formatted = f'{name}'
        
    font_primary_name = theme["font_primary"].split(",")[0].replace('"', '').strip()
    font_secondary_name = theme["font_secondary"].split(",")[0].replace('"', '').strip()
    
    # Render variables via explicit dict replacement to avoid conflict with CSS curly braces
    replacements = {
        "{theme_json}": json.dumps(theme, indent=4),
        "{name}": name,
        "{slug}": slug,
        "{font_import}": theme["font_import"],
        "{font_primary_family}": theme["font_primary"],
        "{font_secondary_family}": theme["font_secondary"],
        "{font_primary_name}": font_primary_name,
        "{font_secondary_name}": font_secondary_name,
        
        "{accent1}": theme["accents"][0],
        "{accent2}": theme["accents"][1],
        "{accent3}": theme["accents"][2],
        "{accent4}": theme["accents"][3],
        
        "{accent1_name}": theme["accent_names"][0],
        "{accent2_name}": theme["accent_names"][1],
        "{accent3_name}": theme["accent_names"][2],
        "{accent4_name}": theme["accent_names"][3],
        
        "{accent1_use}": theme["accent_uses"][0],
        "{accent2_use}": theme["accent_uses"][1],
        "{accent3_use}": theme["accent_uses"][2],
        "{accent4_use}": theme["accent_uses"][3],
        
        "{dark_accent_dim}": theme["dark"]["accent_dim"],
        "{dark_accent_border}": theme["dark"]["accent_border"],
        "{dark_black}": theme["dark"]["black"],
        "{dark_ink}": theme["dark"]["ink"],
        "{dark_ink_soft}": theme["dark"]["ink_soft"],
        "{dark_ink_mid}": theme["dark"]["ink_mid"],
        "{dark_ink_muted}": theme["dark"]["ink_muted"],
        "{dark_bg}": theme["dark"]["bg"],
        "{dark_bg_alt}": theme["dark"]["bg_alt"],
        "{dark_bg_deep}": theme["dark"]["bg_deep"],
        "{dark_text}": theme["dark"]["text"],
        "{dark_text_mid}": theme["dark"]["text_mid"],
        "{dark_text_muted}": theme["dark"]["text_muted"],
        "{dark_border}": theme["dark"]["border"],
        "{dark_nav_bg}": theme["dark"]["nav_bg"],
        "{dark_shadow_sm}": theme["dark"]["shadow_sm"],
        "{dark_shadow_md}": theme["dark"]["shadow_md"],
        "{dark_shadow_lg}": theme["dark"]["shadow_lg"],
        "{dark_body_gradient}": theme["dark"]["body_gradient"],
        
        "{light_accent_dim}": theme["light"]["accent_dim"],
        "{light_accent_border}": theme["light"]["accent_border"],
        "{light_black}": theme["light"]["black"],
        "{light_ink}": theme["light"]["ink"],
        "{light_ink_soft}": theme["light"]["ink_soft"],
        "{light_ink_mid}": theme["light"]["ink_mid"],
        "{light_ink_muted}": theme["light"]["ink_muted"],
        "{light_bg}": theme["light"]["bg"],
        "{light_bg_alt}": theme["light"]["bg_alt"],
        "{light_bg_deep}": theme["light"]["bg_deep"],
        "{light_text}": theme["light"]["text"],
        "{light_text_mid}": theme["light"]["text_mid"],
        "{light_text_muted}": theme["light"]["text_muted"],
        "{light_border}": theme["light"]["border"],
        "{light_nav_bg}": theme["light"]["nav_bg"],
        "{light_shadow_sm}": theme["light"]["shadow_sm"],
        "{light_shadow_md}": theme["light"]["shadow_md"],
        "{light_shadow_lg}": theme["light"]["shadow_lg"],
        "{light_body_gradient}": theme["light"]["body_gradient"],
        
        "{brand_title_formatted}": brand_title_formatted,
        "{style_vibe}": theme["name"].split(" ")[0] + " vibe — aesthetic and clean",
        "{hero_eyebrow}": theme["eyebrow"],
        "{hero_title}": theme["title"],
        "{hero_lede}": theme["lede"],
        "{hero_tag1}": theme["tags"][0],
        "{hero_tag2}": theme["tags"][1],
        "{hero_tag3}": theme["tags"][2],
        "{typography_desc}": theme["typography_desc"],
        
        "{p1_num}": theme["principles"][0]["number"],
        "{p1_name}": theme["principles"][0]["name"],
        "{p1_desc}": theme["principles"][0]["desc"],
        "{p2_num}": theme["principles"][1]["number"],
        "{p2_name}": theme["principles"][1]["name"],
        "{p2_desc}": theme["principles"][1]["desc"],
        "{p3_num}": theme["principles"][2]["number"],
        "{p3_name}": theme["principles"][2]["name"],
        "{p3_desc}": theme["principles"][2]["desc"]
    }
    
    rendered = template
    for k, v in replacements.items():
        rendered = rendered.replace(k, str(v))
    
    file_path = f"{slug}.html"
    with open(file_path, "w", encoding="utf-8") as out:
        out.write(rendered)
        
    print(f"Generated: {file_path}")

print("All themes generated successfully!")

with open('builder_theme_shell.html', 'w', encoding='utf-8') as shell_out:
    shell_out.write(template)
print("Generated: builder_theme_shell.html")


# Now, generate index.html dynamically as a fullscreen dashboard!
print("Generating gallery index.html dashboard...")

cards_html = []
categories_dict = {}

for t in themes:
    slug = t["slug"]
    name = t["name"]
    desc = t["lede"]
    a1 = t["accents"][0]
    a2 = t["accents"][1]
    a3 = t["accents"][2] if len(t["accents"]) > 2 else a1
    a4 = t["accents"][3] if len(t["accents"]) > 3 else a2
    a1_name = t["accent_names"][0]
    a2_name = t["accent_names"][1]
    a3_name = t["accent_names"][2] if len(t["accent_names"]) > 2 else ""
    a4_name = t["accent_names"][3] if len(t["accent_names"]) > 3 else ""
    
    dark_bg = t["dark"]["bg"]
    dark_text = t["dark"]["text"]
    dark_border = t["dark"]["border"]
    
    light_bg = t["light"]["bg"]
    light_text = t["light"]["text"]
    light_border = t["light"]["border"]
    
    font_primary_family = t["font_primary"].replace('"', "'")
    
    categories_dict[slug] = t["tags"]
    
    f1_name = t["font_primary"].split(",")[0].replace('"', '').strip()
    f2_name = t["font_secondary"].split(",")[0].replace('"', '').strip()
    
    card_markup = f"""            <!-- {t['id']}: {name} -->
            <a href="{slug}.html" id="theme-{slug}" class="theme-card" data-id="{t['id']}" data-name="{name}" data-colors="{a1},{a2},{a3},{a4},{dark_bg},{light_bg}">
                <div class="theme-preview-wrapper" style="font-family: {font_primary_family};" aria-hidden="true">
                    <!-- Light Mode Panel -->
                    <div class="theme-preview-panel light-preview" style="background: {light_bg}; color: {light_text}; --preview-accent: {a1}; --preview-border: {light_border};">
                        <div class="mini-browser-header">
                            <span class="dot" style="background: {a1};"></span>
                            <span class="bar" style="background: {light_text}; opacity: 0.12;"></span>
                        </div>
                        <div class="mini-browser-body">
                            <div class="mini-left">
                                <div class="mini-font-spec">Aa</div>
                            </div>
                            <div class="mini-right">
                                <div class="mini-line long" style="background: {light_text}; opacity: 0.15;"></div>
                                <div class="mini-line short" style="background: {light_text}; opacity: 0.15;"></div>
                                <div class="mini-btn-group">
                                    <span class="mini-btn" style="background: {a1};"></span>
                                    <span class="mini-btn outline" style="border-color: {a2};"></span>
                                </div>
                            </div>
                        </div>
                        <div class="mini-swatch-row">
                            <span style="background: {a1};" title="{a1_name}"></span>
                            <span style="background: {a2};" title="{a2_name}"></span>
                            <span style="background: {a3};" title="{a3_name}"></span>
                        </div>
                    </div>
                    
                    <!-- Dark Mode Panel -->
                    <div class="theme-preview-panel dark-preview" style="background: {dark_bg}; color: {dark_text}; --preview-accent: {a1}; --preview-border: {dark_border};">
                        <div class="mini-browser-header">
                            <span class="dot" style="background: {a1};"></span>
                            <span class="bar" style="background: {dark_text}; opacity: 0.12;"></span>
                        </div>
                        <div class="mini-browser-body">
                            <div class="mini-left">
                                <div class="mini-font-spec">Aa</div>
                            </div>
                            <div class="mini-right">
                                <div class="mini-line long" style="background: {dark_text}; opacity: 0.15;"></div>
                                <div class="mini-line short" style="background: {dark_text}; opacity: 0.15;"></div>
                                <div class="mini-btn-group">
                                    <span class="mini-btn" style="background: {a1};"></span>
                                    <span class="mini-btn outline" style="border-color: {a2};"></span>
                                </div>
                            </div>
                        </div>
                        <div class="mini-swatch-row">
                            <span style="background: {a1};" title="{a1_name}"></span>
                            <span style="background: {a2};" title="{a2_name}"></span>
                            <span style="background: {a3};" title="{a3_name}"></span>
                        </div>
                    </div>
                </div>
                
                <!-- Theme Color Bar -->
                <div class="theme-color-bar" aria-hidden="true">
                    <span style="background: {a1};" title="{a1_name}: {a1}"></span>
                    <span style="background: {a2};" title="{a2_name}: {a2}"></span>
                    <span style="background: {a3};" title="{a3_name}: {a3}"></span>
                    <span style="background: {a4};" title="{a4_name}: {a4}"></span>
                    <span style="background: {dark_bg};" class="color-bar-surface" title="Dark BG: {dark_bg}"></span>
                    <span style="background: {light_bg};" class="color-bar-surface" title="Light BG: {light_bg}"></span>
                </div>

                <div class="theme-info">
                    <div class="theme-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <div class="theme-name">{name}</div>
                        <button type="button" class="btn-copy-json" data-slug="{slug}" title="Copy theme JSON" aria-label="Copy theme JSON">JSON</button>
                    </div>
                    <div class="theme-meta">{desc}</div>
                    <div class="theme-tags"></div>
                </div>
            </a>"""
    cards_html.append(card_markup)

grid_content = "\n\n".join(cards_html)

import json
categories_json = json.dumps(categories_dict, indent=12)
all_themes_json = json.dumps({t["slug"]: t for t in themes}, indent=12)

# Full dashboard template
index_template = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chromaverse — Color Theme Collection</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>
        :root {{
            --r-md: 8px;
            --r-lg: 12px;
            --sp-1: 4px;
            --sp-2: 8px;
            --sp-3: 12px;
            --sp-4: 16px;
            --sp-5: 24px;
            --sp-6: 32px;
            --sp-8: 64px;
            --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
        }}

        [data-theme="dark"] {{
            --bg: #0a0808;
            --bg-alt: #130f0f;
            --text: #ffffff;
            --text-mid: #ffffff;
            --text-muted: #ffffff;
            --border: #231c1a;
            --accent: #e03a3a;
            --accent-dim: rgba(224, 58, 58, 0.14);
            --accent-border: rgba(224, 58, 58, 0.4);
        }}

        [data-theme="light"] {{
            --bg: #faf7f5;
            --bg-alt: #ffffff;
            --text: #1c120e;
            --text-mid: #4a3c36;
            --text-muted: #786b66;
            --border: #eee5e0;
            --accent: #e03a3a;
            --accent-dim: rgba(224, 58, 58, 0.08);
            --accent-border: rgba(224, 58, 58, 0.25);
        }}

        *,
        *::before,
        *::after {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: "Inter", system-ui, sans-serif;
            background: var(--bg);
            color: var(--text-mid);
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            transition: background 0.2s var(--ease-out);
        }}
        
        .scroll-container {{
            width: 100vw;
            height: 100vh;
            overflow-y: scroll;
            scroll-snap-type: y mandatory;
            scroll-behavior: smooth;
        }}
        
        .chromaverse-banner {{
            height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            scroll-snap-align: start;
            scroll-snap-stop: always;
            background: #060505;
            padding: var(--sp-6);
            box-sizing: border-box;
            border-bottom: 1px solid var(--border);
        }}
        
        .banner-ambient-glow {{
            position: absolute;
            inset: 0;
            z-index: 1;
            opacity: 0.8;
            background: radial-gradient(circle at 10% 20%, rgba(224, 58, 58, 0.08) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(0, 136, 255, 0.08) 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, rgba(102, 51, 255, 0.06) 0%, transparent 50%);
            animation: moveGlow 25s infinite alternate ease-in-out;
        }}
        
        @keyframes moveGlow {{
            0% {{ transform: scale(1) translate(0, 0); }}
            50% {{ transform: scale(1.08) translate(1.5%, -2%); }}
            100% {{ transform: scale(1) translate(-1.5%, 1.5%); }}
        }}
        
        .banner-content {{
            position: relative;
            z-index: 2;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--sp-4);
        }}
        
        .banner-badge {{
            font-family: "JetBrains Mono", monospace;
            font-size: 0.72rem;
            letter-spacing: 0.25em;
            color: var(--accent);
            background: var(--accent-dim);
            padding: var(--sp-1) var(--sp-3);
            border-radius: 20px;
            border: 1px solid var(--accent-border);
            text-transform: uppercase;
            font-weight: 600;
        }}
        
        @keyframes bannerTitleIn {{
            0%   {{ opacity: 0; transform: translateY(20px); filter: blur(5px); }}
            100% {{ opacity: 1; transform: translateY(0);    filter: blur(0); }}
        }}

        @keyframes bannerFadeUp {{
            0%   {{ opacity: 0; transform: translateY(14px); }}
            100% {{ opacity: 1; transform: translateY(0); }}
        }}

        .banner-motion-title {{
            font-family: 'Inter', -apple-system, sans-serif;
            font-weight: 600;
            font-size: clamp(3.5rem, 10vw, 5.8rem);
            letter-spacing: -0.04em;
            text-transform: lowercase;
            line-height: 1.2;
            text-align: center;
            color: #ffffff;
            margin: 0 0 0.35rem;
            user-select: none;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.35);
            animation: bannerTitleIn 2.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }}

        .banner-motion-title .slash {{
            color: #c0392b;
        }}

        .banner-title {{
            font-size: clamp(3rem, 11vw, 7rem);
            font-weight: 800;
            color: #f8f9fc;
            letter-spacing: -0.06em;
            line-height: 0.95;
            text-transform: uppercase;
            margin: var(--sp-2) 0;
            white-space: nowrap;
            text-shadow:
                0 2px 4px rgba(0, 0, 0, 0.45),
                0 8px 32px rgba(0, 0, 0, 0.35);
        }}
        
        .banner-title span {{
            background: linear-gradient(135deg, #FF3366, #FF6633, #FFDD00, #00CC44, #0088FF, #6633FF, #CC00CC);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
            letter-spacing: inherit;
            filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.4));
        }}

        .banner-subtitle {{
            font-size: clamp(1.2rem, 3vw, 1.8rem);
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.02em;
            text-shadow: 0 2px 16px rgba(0, 0, 0, 0.45);
        }}
        
        .banner-desc {{
            font-size: clamp(0.9rem, 2vw, 1.05rem);
            color: #ffffff;
            line-height: 1.65;
            max-width: 700px;
            text-align: center;
            opacity: 1.0;
        }}
        
        .banner-stats {{
            display: flex;
            gap: var(--sp-4);
            margin-top: var(--sp-3);
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
        }}
        
        .banner-stat-card {{
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            padding: var(--sp-3) var(--sp-5);
            border-radius: 12px;
            min-width: 130px;
            display: flex;
            flex-direction: column;
            align-items: center;
            backdrop-filter: blur(10px);
            transition: border-color 0.3s, transform 0.3s;
        }}
        
        .banner-stat-card:hover {{
            border-color: var(--accent-border);
            transform: translateY(-2px);
        }}
        
        .stat-num {{
            font-size: 2rem;
            font-weight: 800;
            color: #ffffff;
            font-family: "JetBrains Mono", monospace;
            line-height: 1.2;
        }}
        
        .stat-label {{
            font-size: 0.74rem;
            color: #ffffff;
            opacity: 1.0;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 500;
        }}
        
        .banner-actions {{
            margin-top: var(--sp-4);
        }}
        
        .banner-cta {{
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.35);
            padding: 0.75rem 1.8rem;
            border-radius: 4px;
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 0.88rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--sp-2);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow:
                0 4px 16px rgba(0, 0, 0, 0.28),
                0 12px 36px rgba(0, 0, 0, 0.18);
            transition: border-color 0.2s var(--ease-out), background 0.2s var(--ease-out), color 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
        }}
        
        .banner-cta:hover {{
            border-color: #ffffff;
            background: rgba(255, 255, 255, 0.12);
            box-shadow:
                0 6px 22px rgba(0, 0, 0, 0.35),
                0 16px 44px rgba(0, 0, 0, 0.22);
        }}
        
        .banner-cta svg {{
            transition: transform 0.2s;
        }}
        
        .banner-cta:hover svg {{
            transform: translateX(4px);
        }}
        
        .banner-scroll-hint {{
            position: absolute;
            bottom: var(--sp-5);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--sp-1);
            color: var(--text-muted);
            font-size: 0.78rem;
            cursor: pointer;
            z-index: 10;
            transition: color 0.2s;
        }}
        
        .banner-scroll-hint:hover {{
            color: var(--text-mid);
        }}
        
        .scroll-arrow {{
            animation: bounce 1.8s infinite;
        }}
        
        @keyframes bounce {{
            0%, 20%, 50%, 80%, 100% {{ transform: translateY(0); }}
            40% {{ transform: translateY(-6px); }}
            60% {{ transform: translateY(-3px); }}
        }}

        .studio-workspace {{
            height: 100vh;
            width: 100vw;
            display: flex;
            position: relative;
            overflow: hidden;
            scroll-snap-align: start;
            scroll-snap-stop: always;
            padding: 0;
            box-sizing: border-box;
            background: var(--bg);
        }}

        .header-search-container {{
            display: flex;
            align-items: center;
            flex: 1;
            max-width: 680px;
            margin: 0 var(--sp-4);
            gap: var(--sp-3);
        }}
        
        .quick-color-filters {{
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
            background: var(--bg);
            padding: 4px 8px;
            border-radius: 20px;
            border: 1px solid var(--border);
        }}
        
        .color-filter-dot {{
            width: 14px;
            height: 14px;
            border-radius: 50%;
            cursor: pointer;
            border: 1px solid var(--border);
            transition: transform 0.15s var(--ease-out), border-color 0.15s;
            display: inline-block;
        }}
        
        .color-filter-dot:hover, .color-filter-dot.active {{
            transform: scale(1.25);
            border-color: var(--text);
            box-shadow: 0 0 0 2px var(--accent-dim);
        }}

        @media (max-width: 860px) {{
            .studio-workspace {{
                padding: 0;
            }}
        }}

        @media (max-width: 680px) {{
            .quick-color-filters {{
                display: none;
            }}
            .header-search-container {{
                margin: 0;
                width: 100%;
            }}
        }}

        body::before {{
            content: '';
            position: fixed;
            inset: 0;
            z-index: 9999;
            pointer-events: none;
            opacity: 0.025;
            mix-blend-mode: overlay;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            background-size: 140px 140px;
        }}

        [data-theme="dark"] body::before {{
            opacity: 0.045;
        }}

        /* Sidebar Styling */
        .sidebar {{
            width: 280px;
            background: var(--bg-alt);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            height: 100%;
            flex-shrink: 0;
            padding: var(--sp-5);
            box-sizing: border-box;
            transition: background 0.2s var(--ease-out), border-color 0.2s;
        }}

        .sidebar-brand {{
            margin-bottom: var(--sp-4);
            display: flex;
            align-items: center;
            gap: var(--sp-2);
        }}

        .sidebar-wordmark {{
            font-size: 1.1rem;
            font-weight: 800;
            letter-spacing: -0.04em;
            text-transform: uppercase;
            white-space: nowrap;
            line-height: 1;
            color: var(--text);
        }}

        .sidebar-wordmark > span {{
            background: linear-gradient(135deg, #FF3366, #FF6633, #FFDD00, #00CC44, #0088FF, #6633FF, #CC00CC);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
            letter-spacing: inherit;
        }}

        .sidebar-mode-row {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--sp-3);
        }}

        .sidebar-mode-label {{
            font-family: "JetBrains Mono", monospace;
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: var(--text-muted);
        }}

        .sidebar-mode-toggle {{
            margin: 0 !important;
        }}

        .sidebar-mode-toggle button {{
            font-size: 0.72rem;
            padding: 4px 10px;
        }}

        .sidebar-divider {{
            border-top: 1px solid var(--border);
            margin-bottom: var(--sp-4);
        }}

        .header-search {{
            position: relative;
            flex: 1;
        }}
        
        .header-search input {{
            width: 100%;
            padding: 10px 16px 10px 40px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            font-family: inherit;
            font-size: 0.9rem;
            outline: none;
            transition: all 0.2s var(--ease-out);
        }}
        
        .header-search input:focus {{
            border-color: var(--accent-border);
            background: var(--bg-alt);
            box-shadow: 0 0 0 3px var(--accent-dim);
        }}
        
        .header-search .search-icon {{
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            fill: var(--text-muted);
            pointer-events: none;
        }}
        
        #search-clear-btn {{
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            font-size: 1.2rem;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0 4px;
            line-height: 1;
        }}
        
        #search-clear-btn:hover {{
            color: var(--text);
        }}

        .sidebar-menu {{
            display: flex;
            flex-direction: column;
            gap: 4px;
            overflow-y: auto;
            flex: 1;
            margin-right: -10px;
            padding-right: 10px;
        }}

        .menu-label {{
            font-family: "JetBrains Mono", monospace;
            font-size: 0.74rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
            margin-top: var(--sp-4);
        }}

        .menu-item {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 9px 12px;
            border-radius: 6px;
            font-size: 0.88rem;
            font-weight: 500;
            color: var(--text-mid);
            cursor: pointer;
            transition: background 0.15s var(--ease-out), color 0.15s;
            border: none;
            background: transparent;
            text-align: left;
            width: 100%;
        }}

        .menu-item:hover, .menu-item.active {{
            background: var(--bg);
            color: var(--text);
        }}

        .menu-item.active {{
            border-left: 3px solid var(--accent);
            border-radius: 0 6px 6px 0;
            padding-left: 9px;
            background: var(--bg);
        }}

        .menu-count {{
            font-size: 0.76rem;
            color: var(--text-muted);
            background: var(--border);
            padding: 2px 7px;
            border-radius: 10px;
            font-family: "JetBrains Mono", monospace;
        }}

        /* Main Dashboard Styling */
        .main-content {{
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            background: var(--bg);
            transition: background 0.2s var(--ease-out);
        }}

        .dashboard-header {{
            height: 72px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 clamp(24px, 5vw, 64px);
            background: var(--bg-alt);
            flex-shrink: 0;
            transition: background 0.2s var(--ease-out), border-color 0.2s;
        }}

        .header-title {{
            display: none;
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--text);
            letter-spacing: -0.02em;
        }}

        .header-controls {{
            display: flex;
            align-items: center;
            gap: var(--sp-3);
        }}

        .grid-container {{
            flex: 1;
            overflow-y: auto;
            padding: clamp(24px, 5vw, 64px);
        }}

        .theme-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: var(--sp-5);
        }}

        /* Card Styling inspired by iconsclub app gallery */
        .theme-card {{
            display: flex;
            flex-direction: column;
            gap: var(--sp-4);
            padding: var(--sp-4);
            background: var(--bg-alt);
            border: 1px solid var(--border);
            border-radius: var(--r-lg);
            text-decoration: none;
            color: inherit;
            content-visibility: auto;
            contain-intrinsic-size: 320px 380px;
            transition: border-color 0.15s var(--ease-out), transform 0.15s var(--ease-out), box-shadow 0.15s;
        }}

        .theme-card:hover {{
            border-color: var(--accent-border);
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
        }}

        ::-webkit-scrollbar {{
            width: 6px;
            height: 6px;
        }}
        ::-webkit-scrollbar-track {{
            background: transparent;
        }}
        ::-webkit-scrollbar-thumb {{
            background: var(--border);
            border-radius: 3px;
        }}
        ::-webkit-scrollbar-thumb:hover {{
            background: var(--text-muted);
        }}

        .theme-color-bar {{
            display: flex;
            align-items: flex-end;
            height: 22px;
            width: 100%;
            gap: 3.5px;
            position: relative;
            flex-shrink: 0;
            margin-top: var(--sp-1);
            margin-bottom: var(--sp-1);
        }}
        
        .theme-color-bar span {{
            flex: 1;
            height: 22px;
            border-radius: 3px;
            transition: transform 0.2s var(--ease-out), box-shadow 0.2s;
            cursor: pointer;
            position: relative;
            border: 1px solid var(--border);
        }}
        
        
        .theme-color-bar span:hover {{
            transform: translateY(-4px) scale(1.12);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            border-radius: 4px;
            z-index: 5;
        }}

        .theme-preview-wrapper {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            height: 125px;
            border-radius: var(--r-md);
            overflow: hidden;
            border: 1px solid var(--border);
            position: relative;
            background: var(--bg-alt);
            flex-shrink: 0;
        }}
        
        .theme-preview-panel {{
            padding: var(--sp-2) var(--sp-3);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            transition: transform 0.4s var(--ease-out);
        }}
        
        .light-preview {{
            border-right: 1px solid var(--border);
        }}
        
        /* Browser Header Simulation */
        .mini-browser-header {{
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: var(--sp-1);
            padding-bottom: 4px;
            border-bottom: 1px solid var(--preview-border);
            flex-shrink: 0;
            width: 100%;
        }}
        
        .mini-browser-header .dot {{
            width: 4px;
            height: 4px;
            border-radius: 50%;
            display: inline-block;
        }}
        
        .mini-browser-header .bar {{
            height: 3px;
            width: 32px;
            border-radius: 1.5px;
            display: inline-block;
        }}
        
        /* Browser Body Simulation */
        .mini-browser-body {{
            display: flex;
            gap: var(--sp-2);
            align-items: center;
            flex: 1;
            margin-top: 2px;
            margin-bottom: 2px;
            width: 100%;
        }}
        
        .mini-left {{
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }}
        
        .mini-font-spec {{
            font-size: 1.6rem;
            font-weight: 800;
            line-height: 1;
            letter-spacing: -0.04em;
            transition: transform 0.3s var(--ease-out);
        }}
        
        .mini-right {{
            display: flex;
            flex-direction: column;
            gap: 3px;
            flex: 1;
        }}
        
        .mini-line {{
            height: 2px;
            border-radius: 1px;
        }}
        
        .mini-line.long {{ width: 100%; }}
        .mini-line.short {{ width: 60%; }}
        
        .mini-btn-group {{
            display: flex;
            gap: 3px;
            margin-top: 1px;
        }}
        
        .mini-btn {{
            height: 6px;
            width: 16px;
            border-radius: 1.5px;
            display: inline-block;
        }}
        
        .mini-btn.outline {{
            background: transparent;
            border: 1px solid;
            width: 12px;
        }}
        
        /* Swatch Row Simulation */
        .mini-swatch-row {{
            display: flex;
            gap: 3px;
            margin-top: auto;
            padding-top: var(--sp-1);
            flex-shrink: 0;
        }}
        
        .mini-swatch-row span {{
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: block;
            border: 1px solid var(--preview-border);
        }}

        .theme-card:hover .theme-preview-panel {{
            transform: scale(1.02);
        }}
        
        .theme-card:hover .mini-font-spec {{
            transform: translateY(-1px) scale(1.04);
        }}

        .theme-info {{
            display: flex;
            flex-direction: column;
            gap: var(--sp-1);
            flex: 1;
        }}

        .theme-name {{
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text);
            letter-spacing: -0.01em;
        }}

        .theme-meta {{
            font-size: 0.85rem;
            color: var(--text-mid);
            line-height: 1.45;
            min-height: 2.9em;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }}

        .theme-tags {{
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: auto;
            padding-top: var(--sp-1);
        }}

        .tag {{
            font-family: "JetBrains Mono", monospace;
            font-size: 0.72rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            padding: 3px 8px;
            border-radius: 4px;
            border: 1px solid var(--border);
            color: var(--text-muted);
            white-space: nowrap;
        }}

        .tag.tag-usecase {{
            border-color: var(--accent-border);
            background: var(--accent-dim);
            color: #ffffff;
            opacity: 1.0;
        }}

        [data-theme="light"] .tag.tag-usecase {{
            color: color-mix(in srgb, var(--accent) 75%, #000000);
        }}

        /* Mode Toggler Styling */
        .mode-toggle {{
            display: inline-flex;
            border: 1px solid var(--border);
            border-radius: 6px;
            overflow: hidden;
        }}

        .mode-toggle button {{
            font-family: "Inter", system-ui, sans-serif;
            font-size: 0.74rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            padding: 8px 12px;
            border: none;
            background: transparent;
            color: var(--text-muted);
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
        }}

        .mode-toggle button:hover {{
            color: var(--text);
        }}

        .mode-toggle button.active {{
            background: var(--accent);
            color: #fff;
        }}

        .mode-toggle button + button {{
            border-left: 1px solid var(--border);
        }}

        /* Sidebar Toggle for Mobile */
        .sidebar-toggle {{
            display: none;
            background: transparent;
            border: none;
            cursor: pointer;
            width: 38px;
            height: 38px;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            border: 1px solid var(--border);
            flex-shrink: 0;
        }}

        .sidebar-toggle svg {{
            width: 20px;
            height: 20px;
            fill: var(--text);
        }}

        .sidebar-overlay {{
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            z-index: 99;
        }}

        @media (max-width: 860px) {{
            .sidebar-toggle {{
                display: flex;
            }}
            .sidebar {{
                position: fixed;
                left: 0;
                top: 0;
                bottom: 0;
                z-index: 100;
                transform: translateX(-100%);
                transition: transform 0.25s cubic-bezier(0.23, 1, 0.32, 1);
                box-shadow: 0 0 30px rgba(0,0,0,0.15);
                background: var(--bg-alt);
            }}
            .sidebar.open {{
                transform: translateX(0);
            }}
            .sidebar-overlay.open {{
                display: block;
            }}
        }}

        /* View Toggle Styling */
        .view-toggle {{
            display: inline-flex;
            border: 1px solid var(--border);
            border-radius: 6px;
            overflow: hidden;
            background: var(--bg-alt);
        }}
        
        .view-toggle button {{
            background: transparent;
            border: none;
            padding: 8px 10px;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s, color 0.15s;
        }}
        
        .view-toggle button:hover {{
            color: var(--text);
        }}
        
        .view-toggle button.active {{
            background: var(--border);
            color: var(--text);
        }}
        
        .view-toggle button + button {{
            border-left: 1px solid var(--border);
        }}
        
        /* Sort Control Styling */
        .sort-control {{
            position: relative;
        }}
        
        .sort-control select {{
            appearance: none;
            background: var(--bg-alt);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 8px 32px 8px 12px;
            font-family: inherit;
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--text-mid);
            cursor: pointer;
            outline: none;
            transition: border-color 0.15s, color 0.15s;
        }}
        
        .sort-control select:focus, .sort-control select:hover {{
            border-color: var(--accent-border);
            color: var(--text);
        }}
        
        .sort-control::after {{
            content: "";
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 4px solid var(--text-muted);
            pointer-events: none;
        }}

        /* Compact Grid Styling */
        .theme-grid.compact {{
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--sp-3);
        }}
        
        .theme-grid.compact .theme-card {{
            padding: var(--sp-3);
            gap: var(--sp-2);
            border-radius: var(--r-md);
        }}
        
        .theme-grid.compact .theme-preview-wrapper {{
            height: 80px;
        }}
        
        .theme-grid.compact .mini-browser-header {{
            margin-bottom: 2px;
            padding-bottom: 2px;
        }}
        
        .theme-grid.compact .mini-font-spec {{
            font-size: 1.1rem;
        }}
        
        .theme-grid.compact .mini-btn {{
            height: 4px;
            width: 10px;
        }}
        
        .theme-grid.compact .mini-btn.outline {{
            width: 8px;
        }}
        
        .theme-grid.compact .mini-swatch-row span {{
            width: 6px;
            height: 6px;
        }}
        
        .theme-grid.compact .theme-meta {{
            display: none;
        }}
        
        .theme-grid.compact .theme-tags {{
            display: none;
        }}

        .theme-grid.compact .theme-color-bar {{
            height: 12px;
            gap: 2px;
            margin-top: 2px;
            margin-bottom: 2px;
        }}
        
        .theme-grid.compact .theme-color-bar span {{
            height: 12px;
            border-radius: 2px;
        }}

        @media (max-width: 580px) {{
            .dashboard-header {{
                height: auto;
                padding: var(--sp-3) var(--sp-4);
                flex-direction: column;
                gap: var(--sp-3);
                align-items: stretch;
            }}
            .header-controls {{
                justify-content: space-between;
                width: 100%;
            }}
        }}

        .btn-copy-json {{
            background: var(--bg);
            color: var(--text-mid);
            border: 1px solid var(--border);
            border-radius: var(--r-sm);
            padding: 3px 8px;
            font-family: "JetBrains Mono", monospace;
            font-size: 0.7rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s var(--ease-out);
            z-index: 10;
            margin-top: -2px;
        }}
        .btn-copy-json:hover {{
            background: var(--accent);
            color: var(--black);
            border-color: var(--accent);
        }}

/* Builder — single-viewport studio (no scroll) */
        .studio-workspace.builder-mode {{
            padding-bottom: 0;
        }}

        .main-content.builder-mode {{
            overflow: hidden;
        }}

        .builder-container {{
            display: none;
            flex-direction: column;
            animation: fadeIn 0.3s var(--ease-out);
            flex: 1;
            min-height: 0;
            overflow: hidden;
            height: 100%;
            padding: var(--sp-3) clamp(16px, 3vw, 32px) var(--sp-3);
            gap: var(--sp-3);
        }}

        .builder-toolbar {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-3);
            flex-shrink: 0;
            min-height: 44px;
            padding: 0 var(--sp-1);
        }}

        .builder-toolbar-left {{
            display: flex;
            align-items: center;
            gap: var(--sp-3);
            flex-shrink: 0;
        }}

        .builder-toolbar-right {{
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--sp-3);
            flex: 1;
            min-width: 0;
            flex-wrap: wrap;
        }}

        .builder-toolbar-title {{
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--text);
            letter-spacing: -0.02em;
            white-space: nowrap;
        }}

        .builder-tool-btn {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 34px;
            padding: 0 12px;
            border-radius: var(--r-md);
            border: 1px solid var(--border);
            background: var(--bg-alt);
            color: var(--text-mid);
            font-size: 0.76rem;
            font-weight: 600;
            cursor: pointer;
            transition: border-color 0.15s, color 0.15s, background 0.15s;
            white-space: nowrap;
        }}

        .builder-tool-btn:hover {{
            border-color: var(--accent-border);
            color: var(--text);
        }}

        .builder-tool-btn.primary {{
            background: var(--accent);
            border-color: var(--accent);
            color: var(--black);
        }}

        .builder-tool-btn.primary:hover {{
            filter: brightness(1.05);
        }}

        .builder-layout {{
            display: grid;
            grid-template-columns: minmax(240px, 280px) 1fr;
            gap: var(--sp-3);
            align-items: stretch;
            flex: 1;
            min-height: 0;
            overflow: hidden;
        }}

        .builder-controls-panel {{
            background: var(--bg-alt);
            border: 1px solid var(--border);
            border-radius: var(--r-lg);
            padding: var(--sp-4);
            display: flex;
            flex-direction: column;
            gap: var(--sp-3);
            height: 100%;
            min-height: 0;
            overflow: hidden;
        }}

        .builder-controls-scroll {{
            display: flex;
            flex-direction: column;
            gap: var(--sp-3);
            min-height: 0;
            overflow-y: auto;
            padding-right: 2px;
        }}

        .builder-section {{
            display: flex;
            flex-direction: column;
            gap: var(--sp-2);
        }}

        .builder-section-title {{
            font-family: "JetBrains Mono", monospace;
            font-size: 0.68rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted);
            border-bottom: 1px solid var(--border);
            padding-bottom: 6px;
        }}

        .builder-control-group {{
            display: flex;
            flex-direction: column;
            gap: 4px;
        }}

        .builder-control-group label {{
            font-size: 0.74rem;
            font-weight: 600;
            color: var(--text);
        }}

        .builder-control-group select,
        .builder-control-group input[type="text"] {{
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            color: var(--text);
            padding: 6px 10px;
            font-size: 0.78rem;
            outline: none;
            transition: border-color 0.15s;
        }}

        .builder-control-group select:focus,
        .builder-control-group input[type="text"]:focus {{
            border-color: var(--accent);
        }}

        .builder-presets-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--sp-2);
        }}

        .builder-presets-grid .builder-control-group {{
            min-width: 0;
        }}

        .color-picker-wrapper {{
            display: flex;
            gap: var(--sp-2);
        }}

        .color-picker-wrapper input[type="color"] {{
            border: none;
            width: 38px;
            height: 34px;
            padding: 0;
            background: none;
            cursor: pointer;
            border-radius: var(--r-md);
            overflow: hidden;
            flex-shrink: 0;
        }}

        .color-picker-wrapper input[type="text"] {{
            flex: 1;
            font-family: "JetBrains Mono", monospace;
        }}

        .builder-color-stack {{
            display: flex;
            flex-direction: column;
            gap: var(--sp-3);
        }}

        .builder-toggle-group {{
            display: flex;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            padding: 2px;
        }}

        .builder-toolbar-right .builder-toggle-group {{
            flex-shrink: 0;
            height: 36px;
            align-items: center;
        }}

        .builder-toggle-group.compact button {{
            padding: 5px 10px;
            font-size: 0.72rem;
        }}

        .builder-toggle-group button {{
            flex: 1;
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 6px 12px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            border-radius: calc(var(--r-md) - 2px);
            transition: all 0.15s;
        }}

        .builder-toggle-group button.active {{
            background: var(--bg-alt);
            color: var(--text);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }}

        .builder-preview-panel {{
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: var(--r-lg);
            background: var(--bg-alt);
        }}

        .builder-preview-chrome {{
            display: flex;
            align-items: center;
            gap: var(--sp-3);
            padding: 8px 14px;
            border-bottom: 1px solid var(--border);
            background: var(--bg);
            flex-shrink: 0;
        }}

        .preview-chrome-dots {{
            display: flex;
            gap: 6px;
        }}

        .preview-chrome-dots span {{
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--border);
        }}

        .preview-chrome-dots span:nth-child(1) {{ background: #ff5f57; }}
        .preview-chrome-dots span:nth-child(2) {{ background: #febc2e; }}
        .preview-chrome-dots span:nth-child(3) {{ background: #28c840; }}

        .preview-chrome-url {{
            flex: 1;
            font-family: "JetBrains Mono", monospace;
            font-size: 0.68rem;
            color: var(--text-muted);
            background: var(--bg-alt);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 5px 10px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}

        .builder-preview-viewport {{
            flex: 1;
            min-height: 0;
            overflow: hidden;
            display: flex;
            align-items: stretch;
            justify-content: stretch;
            padding: 0;
            position: relative;
        }}

        .builder-preview-canvas {{
            width: 100%;
            height: 100%;
            flex: 1;
            min-height: 0;
            border-radius: 0;
            padding: clamp(12px, 2vw, 20px);
            transition: background-color 0.25s, color 0.25s;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }}

        .preview-browser-frame {{
            display: flex;
            flex-direction: column;
            gap: var(--sp-3);
            flex: 1;
            min-height: 0;
            height: 100%;
        }}

        .preview-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-val);
            padding-bottom: var(--sp-3);
        }}

        .preview-logo {{
            font-size: 1.1rem;
            font-weight: 800;
            letter-spacing: -0.02em;
        }}

        .preview-nav {{
            display: flex;
            gap: var(--sp-3);
            font-size: 0.72rem;
            font-weight: 600;
            color: var(--text-mid);
        }}

        .preview-body-grid {{
            display: flex;
            flex-direction: column;
            gap: var(--sp-3);
            flex: 1;
            min-height: 0;
        }}

        .preview-hero {{
            display: flex;
            flex-direction: column;
            gap: var(--sp-1);
            flex-shrink: 0;
        }}

        .preview-hero-top {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-2);
            flex-wrap: wrap;
        }}

        .preview-eyebrow {{
            font-family: "JetBrains Mono", monospace;
            font-size: 0.6rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
        }}

        .preview-title {{
            font-size: clamp(1.1rem, 2.8vw, 1.65rem);
            font-weight: 900;
            line-height: 1.1;
            letter-spacing: -0.03em;
            margin: 0;
        }}

        .preview-lede {{
            font-size: clamp(0.72rem, 1.2vw, 0.82rem);
            line-height: 1.4;
            margin: 0;
            max-width: none;
        }}

        .preview-badges {{
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 0;
        }}

        .preview-badge {{
            font-size: 0.62rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 3px 8px;
        }}

        .preview-components {{
            display: grid;
            grid-template-columns: 1.4fr 0.9fr;
            gap: var(--sp-3);
            align-items: stretch;
            flex: 1;
            min-height: 0;
        }}

        .preview-preset-card {{
            padding: var(--sp-3);
            display: flex;
            flex-direction: column;
            gap: var(--sp-1);
            transition: all 0.2s;
            min-height: 0;
            justify-content: center;
            overflow: hidden;
            box-sizing: border-box;
        }}

        #builder-preview-canvas[data-pill-radius="true"] .preview-preset-card {{
            min-height: 96px;
            padding: clamp(14px, 3vw, 22px) clamp(18px, 4vw, 28px);
        }}

        #builder-preview-canvas[data-pill-radius="true"] .preview-metric {{
            justify-content: center;
            min-height: 56px;
            padding: 10px 14px;
            overflow: hidden;
        }}

        .preview-preset-card h3 {{
            font-size: 0.78rem;
            font-weight: 700;
            margin: 0;
        }}

        .preview-preset-card p {{
            font-size: 0.68rem;
            color: var(--text-mid);
            line-height: 1.35;
            margin: 0;
        }}

        .preview-btn-row {{
            display: flex;
            gap: 8px;
            margin-top: 4px;
        }}

        .preview-btn {{
            font-size: 0.74rem;
            font-weight: 600;
            padding: 7px 14px;
            cursor: pointer;
            border: none;
            transition: all 0.15s;
        }}

        .preview-metrics {{
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
            gap: var(--sp-2);
            min-height: 0;
        }}

        .preview-metric {{
            display: flex;
            flex-direction: column;
            gap: 2px;
            justify-content: center;
            overflow: hidden;
            box-sizing: border-box;
        }}

        .preview-metric .num {{
            font-size: 1rem;
            font-weight: 800;
            line-height: 1.2;
        }}

        .preview-metric .label {{
            font-size: 0.62rem;
            font-family: "JetBrains Mono", monospace;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }}

        /* Full theme page viewer */
        body.builder-viewer-active {{
            overflow: hidden;
        }}

        .builder-theme-viewer {{
            position: fixed;
            inset: 0;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            background: #0a0a0a;
        }}

        .builder-theme-viewer[hidden] {{
            display: none !important;
        }}

        .builder-viewer-toolbar {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-4);
            height: 52px;
            padding: 0 clamp(16px, 4vw, 32px);
            background: rgba(12, 12, 14, 0.96);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            flex-shrink: 0;
        }}

        .builder-viewer-title {{
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.72);
        }}

        .builder-viewer-actions {{
            display: flex;
            align-items: center;
            gap: var(--sp-3);
        }}

        .builder-viewer-btn {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.88);
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
        }}

        .builder-viewer-btn:hover {{
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
        }}

        .builder-viewer-btn.primary {{
            background: rgba(217, 45, 13, 0.85);
            border-color: rgba(217, 45, 13, 0.9);
            color: #fff;
        }}

        .builder-viewer-frame {{
            flex: 1;
            width: 100%;
            border: none;
            background: #111;
        }}

        @media (max-width: 900px) {{
            .builder-layout {{
                grid-template-columns: 1fr;
                grid-template-rows: auto 1fr;
            }}

            .builder-controls-panel {{
                max-height: 34vh;
            }}

            .preview-components {{
                grid-template-columns: 1fr;
                grid-template-rows: auto auto;
            }}

            .preview-metrics {{
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto;
            }}
        }}
        
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(8px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}

    </style>
</head>
<body>
    <div class="scroll-container">
        <!-- Fullscreen Banner -->
        <section class="chromaverse-banner" id="banner-section">
            <div class="banner-ambient-glow"></div>
            <canvas id="banner-shader-canvas" style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;"></canvas>
            <div class="banner-content">
                <p class="banner-motion-title"><span class="slash">/</span>motion</p>
                <h1 class="banner-title">CHROMA<span>VERSE</span></h1>
                <p class="banner-subtitle">Curated palettes and exportable design tokens.</p>
                <div class="banner-actions">
                    <button type="button" class="banner-cta" onclick="enterStudio()">
                        ENTER THE STUDIO
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill="currentColor"/></svg>
                    </button>
                </div>
            </div>
        </section>
        
        <!-- Studio Workspace -->
        <section class="studio-workspace" id="studio-section">
            <!-- Sidebar -->
            <aside class="sidebar">
        <div class="sidebar-brand">
            <svg viewBox="0 0 28 28" width="22" height="22" style="flex-shrink:0;">
                <defs>
                    <linearGradient id="spectrum" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FF3366"/>
                        <stop offset="16%" stop-color="#FF6633"/>
                        <stop offset="33%" stop-color="#FFDD00"/>
                        <stop offset="50%" stop-color="#00CC44"/>
                        <stop offset="66%" stop-color="#0088FF"/>
                        <stop offset="83%" stop-color="#6633FF"/>
                        <stop offset="100%" stop-color="#CC00CC"/>
                    </linearGradient>
                </defs>
                <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2zm0 3.5a8.5 8.5 0 110 17 8.5 8.5 0 010-17z" fill="url(#spectrum)"/>
                <path d="M14 7a7 7 0 100 14 7 7 0 000-14zm0 2.8a4.2 4.2 0 110 8.4 4.2 4.2 0 010-8.4z" fill="url(#spectrum)" opacity="0.7"/>
                <circle cx="14" cy="14" r="2" fill="url(#spectrum)"/>
            </svg>
            <span class="sidebar-wordmark">CHROMA<span>VERSE</span></span>
        </div>
        <div class="sidebar-mode-row">
            <span class="sidebar-mode-label">Appearance</span>
            <div class="mode-toggle sidebar-mode-toggle" role="group" aria-label="Color mode">
                <button type="button" class="active" data-mode="dark" aria-pressed="true">Dark</button>
                <button type="button" data-mode="light" aria-pressed="false">Light</button>
            </div>
        </div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-menu" id="sidebar-menu">
            <div class="menu-label">Categories</div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <header class="dashboard-header">
            <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0;">
                <button type="button" class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
                    <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                </button>
                <div class="header-title" id="header-title">All Themes</div>
            </div>
            
            <div class="header-search-container">
                <div class="header-search">
                    <svg viewBox="0 0 24 24" class="search-icon"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input type="text" id="header-search-input" placeholder="Search themes, fonts, colors (e.g. #D92D0D, moss)..." autocomplete="off" />
                    <button type="button" id="search-clear-btn" aria-label="Clear search" style="display: none;">&times;</button>
                </div>
                <div class="quick-color-filters">
                    <span class="color-filter-dot" data-color="red" style="background: #e03a3a;" title="Filter Red"></span>
                    <span class="color-filter-dot" data-color="orange" style="background: #EA580C;" title="Filter Orange"></span>
                    <span class="color-filter-dot" data-color="yellow" style="background: #D97706;" title="Filter Yellow"></span>
                    <span class="color-filter-dot" data-color="green" style="background: #059669;" title="Filter Green"></span>
                    <span class="color-filter-dot" data-color="blue" style="background: #2563EB;" title="Filter Blue"></span>
                    <span class="color-filter-dot" data-color="purple" style="background: #7C3AED;" title="Filter Purple"></span>
                    <span class="color-filter-dot" data-color="pink" style="background: #DB2777;" title="Filter Pink"></span>
                    <span class="color-filter-dot" data-color="monochrome" style="background: #6B7280;" title="Filter Monochrome"></span>
                </div>
            </div>
            <div class="header-controls">
                
                
                <div class="sort-control">
                    <select id="sort-select" aria-label="Sort themes">
                        <option value="id">Default (ID)</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                    </select>
                </div>

                <div class="view-toggle" role="group" aria-label="Layout density">
                    <button type="button" class="active" data-view="comfortable" aria-pressed="true" title="Comfortable View">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/></svg>
                    </button>
                    <button type="button" data-view="compact" aria-pressed="false" title="Compact View">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M4 4h2v2H4V4zm4 0h2v2H8V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4zM4 8h2v2H4V8zm4 0h2v2H8V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zM4 12h2v2H4v-2zm4 0h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM4 16h2v2H4v-2zm4 0h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM4 20h2v2H4v-2zm4 0h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>
                    </button>
                </div>


            </div>
        </header>

        <div class="grid-container">
            <div class="theme-grid">
{grid_content}
            </div>
        </div>

        <!-- Theme Builder Container -->
        <div class="builder-container" id="builder-container">
            <div class="builder-toolbar">
                <div class="builder-toolbar-left">
                    <span class="builder-toolbar-title">Theme Builder Studio</span>
                </div>
                <div class="builder-toolbar-right">
                    <div class="builder-toggle-group compact" id="builder-mode-toggle" role="group" aria-label="Preview mode">
                        <button type="button" class="active" data-mode="dark">Dark</button>
                        <button type="button" data-mode="light">Light</button>
                    </div>
                    <button type="button" id="builder-randomize-btn" class="builder-tool-btn" title="Randomize all builder presets">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
                        <span>Randomize</span>
                    </button>
                    <button type="button" id="builder-copy-css" class="builder-tool-btn" title="Copy CSS variables">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy CSS</span>
                    </button>
                    <button type="button" id="builder-copy-json" class="builder-tool-btn" title="Copy theme JSON">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy JSON</span>
                    </button>
                    <button type="button" id="builder-fullscreen-btn" class="builder-tool-btn primary" title="Open full theme preview">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        <span>Preview</span>
                    </button>
                </div>
            </div>
            <div class="builder-layout">
                <div class="builder-controls-panel">
                    <div class="builder-controls-scroll">
                        <div class="builder-section">
                            <div class="builder-section-title">Colors</div>
                            <div class="builder-color-stack">
                                <div class="builder-control-group">
                                    <label for="builder-accent-color">Primary</label>
                                    <div class="color-picker-wrapper">
                                        <input type="color" id="builder-accent-color" value="#D92D0D" />
                                        <input type="text" id="builder-accent-hex" value="#D92D0D" placeholder="#HEX" />
                                    </div>
                                </div>
                                <div class="builder-control-group">
                                    <label for="builder-accent-secondary-color">Secondary</label>
                                    <div class="color-picker-wrapper">
                                        <input type="color" id="builder-accent-secondary-color" value="#E44623" />
                                        <input type="text" id="builder-accent-secondary-hex" value="#E44623" placeholder="#HEX" />
                                    </div>
                                </div>
                                <div class="builder-control-group">
                                    <label for="builder-accent-tertiary-color">Tertiary</label>
                                    <div class="color-picker-wrapper">
                                        <input type="color" id="builder-accent-tertiary-color" value="#FC390D" />
                                        <input type="text" id="builder-accent-tertiary-hex" value="#FC390D" placeholder="#HEX" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="builder-section">
                            <div class="builder-section-title">Typography</div>
                            <div class="builder-control-group">
                                <label for="builder-font-pairing">Font Pairing</label>
                                <select id="builder-font-pairing">
                                    <option value="custom" selected>Custom (manual)</option>
                                </select>
                            </div>
                            <div class="builder-control-group">
                                <label for="builder-heading-preset">Heading Style</label>
                                <select id="builder-heading-preset">
                                    <option value="default" selected>Default — Bold display</option>
                                    <option value="editorial">Editorial — Serif italic</option>
                                    <option value="billboard">Billboard — Oversized impact</option>
                                    <option value="technical">Technical — Tight geometric</option>
                                    <option value="minimal">Minimal — Light & quiet</option>
                                    <option value="luxury">Luxury — Wide tracked caps</option>
                                </select>
                            </div>
                            <div class="builder-control-group">
                                <label for="builder-font-primary">Headings</label>
                                <select id="builder-font-primary"></select>
                            </div>
                            <div class="builder-control-group">
                                <label for="builder-font-secondary">Body & UI</label>
                                <select id="builder-font-secondary"></select>
                            </div>
                        </div>
                        <div class="builder-section">
                            <div class="builder-section-title">Components</div>
                            <div class="builder-presets-grid">
                                <div class="builder-control-group">
                                    <label for="builder-radius">Radius</label>
                                    <select id="builder-radius">
                                        <option value="0px">Sharp</option>
                                        <option value="4px">XS (4px)</option>
                                        <option value="8px" selected>MD (8px)</option>
                                        <option value="16px">LG (16px)</option>
                                        <option value="9999px">Pill</option>
                                    </select>
                                </div>
                                <div class="builder-control-group">
                                    <label for="builder-card-style">Card</label>
                                    <select id="builder-card-style">
                                        <option value="flat" selected>Flat</option>
                                        <option value="elevated">Elevated</option>
                                        <option value="bordered">Bordered</option>
                                        <option value="glass">Glass</option>
                                    </select>
                                </div>
                                <div class="builder-control-group">
                                    <label for="builder-btn-style">Button</label>
                                    <select id="builder-btn-style">
                                        <option value="filled" selected>Filled</option>
                                        <option value="outline">Outline</option>
                                        <option value="ghost">Ghost</option>
                                        <option value="glow">Glow</option>
                                    </select>
                                </div>
                                <div class="builder-control-group">
                                    <label for="builder-badge-style">Badge</label>
                                    <select id="builder-badge-style">
                                        <option value="filled" selected>Solid</option>
                                        <option value="tinted">Tinted</option>
                                        <option value="outline">Outline</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="builder-preview-panel">
                    <div class="builder-preview-chrome">
                        <div class="preview-chrome-dots" aria-hidden="true">
                            <span></span><span></span><span></span>
                        </div>
                        <div class="preview-chrome-url">preview.chromaverse.studio/theme-builder</div>
                    </div>
                    <div class="builder-preview-viewport" id="builder-preview-viewport">
                        <div class="builder-preview-canvas" id="builder-preview-canvas">
                            <div class="preview-browser-frame">
                                <div class="preview-header">
                                    <span class="preview-logo">Custom<span>Studio</span></span>
                                    <nav class="preview-nav">
                                        <span>Home</span>
                                        <span>Docs</span>
                                        <span>Contact</span>
                                    </nav>
                                </div>
                                <div class="preview-body-grid">
                                    <div class="preview-hero">
                                        <div class="preview-hero-top">
                                            <div class="preview-eyebrow">Live Theme Preview</div>
                                            <div class="preview-badges">
                                                <span class="preview-badge">Interactive</span>
                                                <span class="preview-badge">Realtime</span>
                                                <span class="preview-badge">Exportable</span>
                                            </div>
                                        </div>
                                        <h1 class="preview-title">Design your <span>own style</span></h1>
                                        <p class="preview-lede">Tune accent, typography, and component presets — changes apply instantly in this sandbox.</p>
                                    </div>
                                    <div class="preview-components">
                                        <div class="preview-preset-card">
                                            <h3>Component Card</h3>
                                            <p>Border radius, surface tint, and shadow presets render here.</p>
                                            <div class="preview-btn-row">
                                                <button type="button" class="preview-btn primary">Action</button>
                                                <button type="button" class="preview-btn secondary">Cancel</button>
                                            </div>
                                        </div>
                                        <div class="preview-metrics">
                                            <div class="preview-metric">
                                                <div class="num">65</div>
                                                <div class="label">Palettes</div>
                                            </div>
                                            <div class="preview-metric">
                                                <div class="num">AA+</div>
                                                <div class="label">Contrast</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

    </main>

    </section>
</div>

    <div id="builder-theme-viewer" class="builder-theme-viewer" hidden>
        <div class="builder-viewer-toolbar">
            <span class="builder-viewer-title">Live Theme Preview</span>
            <div class="builder-viewer-actions">
                <button type="button" id="builder-viewer-refresh" class="builder-viewer-btn" title="Refresh preview">Refresh</button>
                <button type="button" id="builder-viewer-close" class="builder-viewer-btn primary" title="Close preview">Close</button>
            </div>
        </div>
        <iframe id="builder-theme-iframe" class="builder-viewer-frame" title="Theme preview" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
    </div>

<script>
        const ALL_THEMES_DATA = {all_themes_json};
        const root = document.documentElement;
        const modeButtons = document.querySelectorAll(".mode-toggle button");
        const cards = document.querySelectorAll(".theme-card");
        const sidebar = document.querySelector(".sidebar");
        const toggleBtn = document.getElementById("sidebar-toggle");
        const dashboardHeader = document.querySelector(".dashboard-header");
        const mainContent = document.querySelector(".main-content");
        const studioSection = document.getElementById("studio-section");
        
        const overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);

        toggleBtn.addEventListener("click", () => {{
            sidebar.classList.toggle("open");
            overlay.classList.toggle("open");
        }});

        overlay.addEventListener("click", () => {{
            sidebar.classList.remove("open");
            overlay.classList.remove("open");
        }});

        // Categories Map generated by Python
        const THEME_CATEGORIES = {categories_json};

        // 1. Enrich cards with category tags
        cards.forEach((card) => {{
            const href = card.getAttribute("href");
            const slug = href.replace(".html", "");
            const categories = THEME_CATEGORIES[slug] || [];
            
            card.dataset.categories = categories.join(",").toLowerCase();
            
            const tagsContainer = card.querySelector(".theme-tags");
            if (tagsContainer) {{
                tagsContainer.innerHTML = "";
                categories.forEach(cat => {{
                    const pill = document.createElement("span");
                    pill.className = "tag tag-usecase";
                    pill.textContent = cat;
                    tagsContainer.appendChild(pill);
                }});
            }}
        }});

        // 2. Count and render sidebar categories dynamically
        const categoryCounts = {{}};
        Object.values(THEME_CATEGORIES).forEach(cats => {{
            cats.forEach(cat => {{
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            }});
        }});

        const sidebarMenu = document.getElementById("sidebar-menu");
        
        sidebarMenu.innerHTML = `
            <div class="menu-label">Categories</div>
            <button type="button" class="menu-item active" data-filter="all">
                <span>All Themes</span>
                <span class="menu-count">${{cards.length}}</span>
            </button>
        `;

        Object.keys(categoryCounts).sort().forEach(cat => {{
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "menu-item";
            btn.dataset.filter = cat.toLowerCase();
            btn.innerHTML = `
                <span>${{cat}}</span>
                <span class="menu-count">${{categoryCounts[cat]}}</span>
            `;
            sidebarMenu.appendChild(btn);
        }});

        // 3. Smart, Keyword, and Color Search helper functions
        function hexToRgb(hex) {{
            const shorthandRegex = /^#?([a-f\\d])([a-f\\d])([a-f\\d])$/i;
            const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(fullHex);
            return result ? {{
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            }} : null;
        }}

        const COLOR_KEYWORDS = {{
            "red": "#ff0000",
            "rose": "#ff007f",
            "crimson": "#dc143c",
            "orange": "#ff8000",
            "yellow": "#ffff00",
            "gold": "#ffd700",
            "green": "#00ff00",
            "emerald": "#50c878",
            "sage": "#87a96b",
            "moss": "#8a9a86",
            "matcha": "#8ba886",
            "blue": "#0000ff",
            "indigo": "#4b0082",
            "cyan": "#00ffff",
            "teal": "#008080",
            "purple": "#800080",
            "lavender": "#e6e6fa",
            "violet": "#ee82ee",
            "pink": "#ffc0cb",
            "magenta": "#ff00ff",
            "brown": "#8b4513",
            "copper": "#b87333",
            "terracotta": "#e2725b",
            "gray": "#808080",
            "grey": "#808080",
            "black": "#000000",
            "white": "#ffffff"
        }};

        function getColorDistance(rgb1, rgb2) {{
            return Math.sqrt(
                Math.pow(rgb1.r - rgb2.r, 2) +
                Math.pow(rgb1.g - rgb2.g, 2) +
                Math.pow(rgb1.b - rgb2.b, 2)
            );
        }}

        function scoreCard(card, query) {{
            if (!query) return 1;
            
            const terms = query.toLowerCase().split(/\\s+/).filter(t => t.length > 0);
            if (terms.length === 0) return 1;
            
            let totalScore = 0;
            
            const cardName = card.dataset.name.toLowerCase();
            const cardTags = card.dataset.categories || "";
            const cardContent = card.textContent.toLowerCase();
            const cardColors = (card.dataset.colors || "").split(",");
            
            for (const term of terms) {{
                let termScore = 0;
                
                // 1. Text checks
                if (cardName.includes(term)) {{
                    termScore += (cardName.startsWith(term) ? 15 : 10);
                }}
                if (cardTags.split(",").some(tag => tag.includes(term))) {{
                    termScore += 8;
                }}
                if (cardContent.includes(term)) {{
                    termScore += 3;
                }}
                
                // 2. Color checks
                let searchRgb = null;
                if (term.startsWith("#") || (term.length === 6 && /^[0-9a-f]{6}$/i.test(term)) || (term.length === 3 && /^[0-9a-f]{3}$/i.test(term))) {{
                    searchRgb = hexToRgb(term.startsWith("#") ? term : "#" + term);
                }} else if (COLOR_KEYWORDS[term]) {{
                    searchRgb = hexToRgb(COLOR_KEYWORDS[term]);
                }}
                
                if (searchRgb) {{
                    let minDistance = 999;
                    for (const colorHex of cardColors) {{
                        const colorRgb = hexToRgb(colorHex);
                        if (colorRgb) {{
                            const dist = getColorDistance(searchRgb, colorRgb);
                            if (dist < minDistance) {{
                                minDistance = dist;
                            }}
                        }}
                    }}
                    
                    if (minDistance < 90) {{
                        termScore += Math.max(0, 15 * (1 - minDistance / 90));
                    }}
                }}
                
                if (termScore === 0) {{
                    return 0; // One of the terms didn't match anything
                }}
                totalScore += termScore;
            }}
            
            return totalScore;
        }}

        let activeFilter = "all";

        const searchInput = document.getElementById("header-search-input");
        const clearBtn = document.getElementById("search-clear-btn");
        const headerTitle = document.getElementById("header-title");

        function filterGrid() {{
            const query = searchInput.value.trim();
            if (clearBtn) {{
                clearBtn.style.display = query ? "block" : "none";
            }}
            
            let visibleCount = 0;
            const scoredCards = [];
            
            cards.forEach((card) => {{
                const cardTags = card.dataset.categories || "";
                const matchesFilter = activeFilter === "all" || cardTags.split(",").includes(activeFilter);
                
                if (!matchesFilter) {{
                    card.style.display = "none";
                    return;
                }}
                
                const score = scoreCard(card, query);
                
                if (score > 0) {{
                    card.style.display = "";
                    visibleCount++;
                    scoredCards.push({{ card, score }});
                }} else {{
                    card.style.display = "none";
                }}
            }});
            
            if (query && scoredCards.length > 0) {{
                scoredCards.sort((a, b) => b.score - a.score);
                scoredCards.forEach(item => grid.appendChild(item.card));
            }} else {{
                applySelectedSort();
            }}
        }}

        function applySelectedSort() {{
            const val = sortSelect.value;
            const cardArray = Array.from(cards);
            
            cardArray.sort((a, b) => {{
                if (val === "name-asc") {{
                    return a.dataset.name.localeCompare(b.dataset.name);
                }} else if (val === "name-desc") {{
                    return b.dataset.name.localeCompare(a.dataset.name);
                }} else {{
                    return a.dataset.id.localeCompare(b.dataset.id);
                }}
            }});
            
            cardArray.forEach(card => grid.appendChild(card));
        }}

        sidebarMenu.addEventListener("click", (e) => {{
            const btn = e.target.closest(".menu-item");
            if (!btn) return;
            
            sidebarMenu.querySelectorAll(".menu-item").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            if (btn.id === "menu-builder-btn") {{
                gridContainer.style.display = "none";
                if (searchContainer) searchContainer.style.display = "none";
                if (sortSelect) sortSelect.parentElement.style.display = "none";
                if (viewToggle) viewToggle.style.display = "none";
                dashboardHeader.style.display = "none";
                builderContainer.style.display = "flex";
                setBuilderMode(true);
                studioSection.scrollIntoView({{ behavior: "smooth" }});
                headerTitle.textContent = "Theme Builder Studio";
                updatePreviewStyles();
                requestAnimationFrame(fitBuilderPreview);
            }} else {{
                builderContainer.style.display = "none";
                setBuilderMode(false);
                dashboardHeader.style.display = "";
                gridContainer.style.display = "";
                if (searchContainer) searchContainer.style.display = "";
                if (sortSelect) sortSelect.parentElement.style.display = "";
                if (viewToggle) viewToggle.style.display = "";
                
                activeFilter = btn.dataset.filter;
                headerTitle.textContent = activeFilter === "all" ? "All Themes" : btn.querySelector("span").textContent;
                
                filterGrid();
            }}
            
            sidebar.classList.remove("open");
            overlay.classList.remove("open");
        }});

        searchInput.addEventListener("input", () => {{
            filterGrid();
        }});

        if (clearBtn) {{
            clearBtn.addEventListener("click", () => {{
                searchInput.value = "";
                filterGrid();
                searchInput.focus();
            }});
        }}

        // 4. Color Theme Toggle
        const safeStorage = {{
            getItem(key) {{
                try {{ return localStorage.getItem(key); }} catch (e) {{ return null; }}
            }},
            setItem(key, value) {{
                try {{ localStorage.setItem(key, value); }} catch (e) {{}}
            }}
        }};

        function setTheme(mode) {{
            root.dataset.theme = mode;
            safeStorage.setItem("chromaverse-theme-mode", mode);
            modeButtons.forEach((btn) => {{
                const active = btn.dataset.mode === mode;
                btn.classList.toggle("active", active);
                btn.setAttribute("aria-pressed", String(active));
            }});
        }}

        modeButtons.forEach((btn) => {{
            btn.addEventListener("click", () => setTheme(btn.dataset.mode));
        }});

        // 5. View Sizer Toggle Handler
        const viewButtons = document.querySelectorAll(".view-toggle button");
        const grid = document.querySelector(".theme-grid");
        
        viewButtons.forEach(btn => {{
            btn.addEventListener("click", () => {{
                viewButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const density = btn.dataset.view;
                if (density === "compact") {{
                    grid.classList.add("compact");
                }} else {{
                    grid.classList.remove("compact");
                }}
                
                safeStorage.setItem("gallery-density", density);
            }});
        }});
        
        // Load saved density
        const savedDensity = safeStorage.getItem("gallery-density");
        if (savedDensity === "compact") {{
            const compactBtn = document.querySelector('[data-view="compact"]');
            if (compactBtn) {{
                compactBtn.click();
            }}
        }}

        // 6. Sort Handler
        const sortSelect = document.getElementById("sort-select");
        sortSelect.addEventListener("change", () => {{
            filterGrid();
        }});

                // JS extensions for banner and scroll snap
        function enterStudio() {{
            document.getElementById("studio-section").scrollIntoView({{ behavior: "smooth" }});
        }}
        
        function goToBanner() {{
            document.getElementById("banner-section").scrollIntoView({{ behavior: "smooth" }});
        }}
        
        // Color filter dots handler
        const filterDots = document.querySelectorAll(".color-filter-dot");
        filterDots.forEach(dot => {{
            dot.addEventListener("click", () => {{
                const colorName = dot.dataset.color;
                const searchInput = document.getElementById("header-search-input");
                
                if (dot.classList.contains("active")) {{
                    dot.classList.remove("active");
                    searchInput.value = "";
                }} else {{
                    filterDots.forEach(d => d.classList.remove("active"));
                    dot.classList.add("active");
                    searchInput.value = colorName;
                }}
                filterGrid();
            }});
        }});
        
        // Remove filter dot active class on text input
        searchInput.addEventListener("input", () => {{
            const val = searchInput.value.trim().toLowerCase();
            filterDots.forEach(dot => {{
                if (dot.dataset.color !== val) {{
                    dot.classList.remove("active");
                }} else {{
                    dot.classList.add("active");
                }}
            }});
        }});

        function initBannerShader(cv) {{
            const gl = cv.getContext("webgl") || cv.getContext("experimental-webgl");
            if (!gl) return;
            
            const vsSrc = `
                attribute vec2 a_pos;
                void main() {{ gl_Position = vec4(a_pos, 0.0, 1.0); }}
            `;
            
            const fsSrc = `
                precision highp float;
                uniform float u_time;
                uniform vec2  u_res;
                #define TAU 6.28318530718
                const float SEED = 3286.0;
                const float SPEED = 0.31, SCALE = 0.92, DENSITY = 0.00, DISTORT = 0.52, DETAIL = 0.49, GRAIN = 0.68;
                const vec3 C0 = vec3(0.0, 0.0, 0.0);
                const vec3 C1 = vec3(0.0, 1.0, 1.0);
                const vec3 C2 = vec3(1.0, 1.0, 0.0);
                const vec3 C3 = vec3(1.0, 0.0, 1.0);
                float hash21(vec2 p){{ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }}
                float vnoise(vec2 p){{ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
                  float a=hash21(i), b=hash21(i+vec2(1.0,0.0)), c=hash21(i+vec2(0.0,1.0)), d=hash21(i+vec2(1.0,1.0));
                  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }}
                float fbm(vec2 p){{ float v=0.0,a=0.5; mat2 r=mat2(0.80,0.60,-0.60,0.80);
                  for(int i=0;i<5;i++){{ v+=a*vnoise(p); p=r*p*2.1+vec2(1.7,9.2); a*=0.5; }} return v; }}
                vec2 loopOff(float ph){{ return vec2(cos(ph), sin(ph)) * (0.10 + 0.55 * SPEED); }}
                vec3 grad4(float t){{ t=clamp(t,0.0,1.0);
                  vec3 c=mix(C0,C1,smoothstep(0.00,0.35,t));
                  c=mix(c,C2,smoothstep(0.35,0.70,t));
                  c=mix(c,C3,smoothstep(0.70,1.00,t)); return c; }}
                void main(){{
                  vec2 uv = gl_FragCoord.xy / u_res; uv.y = 1.0 - uv.y;
                  float ar = u_res.x / u_res.y;
                  float ph = mod(u_time / 4.0 * TAU, TAU);
                  vec3 base = vec3(0.06, 0.04, 0.08);
                  float light = 0.0; vec3 tint = vec3(0.0);
                  for(int i=0;i<3;i++){{
                    float fi = float(i) + 1.0;
                    float xx = uv.x * ar * (1.0 + 0.35 * fi) + SEED * fi * 1.7;
                    float wave = fbm(vec2(xx * 0.6, fi * 4.0) + loopOff(ph) * 1.2) - 0.5;
                    float cy = 0.42 + 0.12 * fi + wave * 0.38;
                    float streak = fbm(vec2(xx * (3.0 + 4.0 * DETAIL), uv.y * (1.0 + 1.5 * SCALE)) + loopOff(ph));
                    float dist = uv.y - cy;
                    float band = exp(-dist * dist * (8.0 + 34.0 * DENSITY));
                    float inten = max(band * (0.25 + 0.95 * streak), 0.0);
                    light += inten / fi;
                    tint += grad4(clamp(0.1 + (1.0 - uv.y) * 1.35 + wave * 0.25, 0.0, 1.0)) * inten / fi;
                  }}
                  vec3 col = mix(base, tint * (1.3 + 1.0 * DISTORT), light * 0.7);
                  col += C3 * pow(clamp(light, 0.0, 1.0), 3.0) * 0.15;
                  col = clamp(col, 0.0, 1.0);
                  col += (hash21(gl_FragCoord.xy + vec2(ph * 91.3)) - 0.5) * GRAIN * 0.04;
                  vec2 v = uv * 2.0 - 1.0; col *= 1.0 - dot(v, v) * 0.08;
                  gl_FragColor = vec4(col, 1.0);
                }}
            `;
            
            function mkShader(type, src) {{
                const s = gl.createShader(type);
                gl.shaderSource(s, src);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {{
                    console.error(gl.getShaderInfoLog(s));
                    gl.deleteShader(s);
                    return null;
                }}
                return s;
            }}
            
            const vs = mkShader(gl.VERTEX_SHADER, vsSrc);
            const fs = mkShader(gl.FRAGMENT_SHADER, fsSrc);
            if (!vs || !fs) return;
            
            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
            
            const vbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
            const aPos = gl.getAttribLocation(prog, "a_pos");
            const uTime = gl.getUniformLocation(prog, "u_time");
            const uRes = gl.getUniformLocation(prog, "u_res");
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
            
            function resize() {{
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                cv.width = Math.round(cv.clientWidth * dpr);
                cv.height = Math.round(cv.clientHeight * dpr);
                gl.viewport(0, 0, cv.width, cv.height);
            }}
            window.addEventListener("resize", resize);
            resize();
            
            const t0 = performance.now();
            function frame(now) {{
                gl.useProgram(prog);
                gl.uniform1f(uTime, (now - t0) / 1000);
                gl.uniform2f(uRes, cv.width, cv.height);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                requestAnimationFrame(frame);
            }}
            requestAnimationFrame(frame);
        }}

        const bannerCanvas = document.getElementById("banner-shader-canvas");
        if (bannerCanvas) {{
            let bannerShaderStarted = false;
            const startBannerShader = () => {{
                if (bannerShaderStarted) return;
                bannerShaderStarted = true;
                initBannerShader(bannerCanvas);
            }};
            if ("IntersectionObserver" in window) {{
                const bannerObserver = new IntersectionObserver((entries) => {{
                    if (entries.some((entry) => entry.isIntersecting)) {{
                        startBannerShader();
                        bannerObserver.disconnect();
                    }}
                }}, {{ rootMargin: "120px" }});
                bannerObserver.observe(bannerCanvas);
            }} else {{
                startBannerShader();
            }}
        }}

        const saved = safeStorage.getItem("chromaverse-theme-mode");
        setTheme(saved === "light" ? "light" : "dark");
        filterGrid();


        // Copy theme JSON directly from the card cover
        document.querySelectorAll(".btn-copy-json").forEach(btn => {{
            btn.addEventListener("click", (e) => {{
                e.preventDefault();
                e.stopPropagation();
                const slug = btn.dataset.slug;
                const themeData = ALL_THEMES_DATA[slug];
                if (themeData) {{
                    navigator.clipboard.writeText(JSON.stringify(themeData, null, 4)).then(() => {{
                        const originalText = btn.textContent;
                        btn.textContent = "COPIED";
                        btn.style.background = "var(--accent)";
                        btn.style.color = "var(--black)";
                        setTimeout(() => {{
                            btn.textContent = originalText;
                            btn.style.background = "";
                            btn.style.color = "";
                        }}, 1000);
                    }});
                }}
            }});
        }});

        // --- Theme Builder Studio Logic ---

        let builderViewerActive = false;
        let builderThemeShellTemplate = null;

        function setBuilderMode(active) {{
            studioSection.classList.toggle("builder-mode", active);
            mainContent.classList.toggle("builder-mode", active);
            if (!active) setBuilderViewer(false);
        }}

        function fitBuilderPreview() {{
            const canvas = document.getElementById("builder-preview-canvas");
            if (canvas) {{
                canvas.style.transform = "none";
                canvas.style.marginTop = "0";
            }}
        }}

        function buildGoogleFontImport(primary, secondary) {{
            const family = (name) => `family=${{encodeURIComponent(name).replace(/%20/g, "+")}}:wght@300;400;500;600;700;800;900`;
            return `<link href="https://fonts.googleapis.com/css2?${{family(primary)}}&${{family(secondary)}}&display=swap" rel="stylesheet" />`;
        }}

        function accentHueLabel(h) {{
            if (h < 15 || h >= 345) return "Crimson";
            if (h < 45) return "Amber";
            if (h < 75) return "Gold";
            if (h < 150) return "Green";
            if (h < 195) return "Teal";
            if (h < 240) return "Blue";
            if (h < 285) return "Indigo";
            if (h < 315) return "Violet";
            return "Rose";
        }}

        function buildModeSurfaceTokens(hsl, rgb, mode) {{
            const {{ h }} = hsl;
            const {{ r, g, b }} = rgb;
            if (mode === "dark") {{
                const bg = hslToHex(h, 15, 6);
                const bgAlt = hslToHex(h, 12, 11);
                const bgDeep = hslToHex(h, 15, 17);
                const ink = hslToHex(h, 18, 6);
                return {{
                    accent_dim: `rgba(${{r}}, ${{g}}, ${{b}}, 0.18)`,
                    accent_border: `rgba(${{r}}, ${{g}}, ${{b}}, 0.45)`,
                    black: hslToHex(h, 20, 4),
                    ink,
                    ink_soft: bgDeep,
                    ink_mid: hslToHex(h, 12, 35),
                    ink_muted: hslToHex(h, 10, 55),
                    bg,
                    bg_alt: bgAlt,
                    bg_deep: bgDeep,
                    text: hslToHex(h, 10, 96),
                    text_mid: hslToHex(h, 12, 80),
                    text_muted: hslToHex(h, 10, 60),
                    border: `rgba(${{r}}, ${{g}}, ${{b}}, 0.22)`,
                    nav_bg: `rgba(${{parseInt(ink.slice(1, 3), 16)}}, ${{parseInt(ink.slice(3, 5), 16)}}, ${{parseInt(ink.slice(5, 7), 16)}}, 0.92)`,
                    shadow_sm: `0 4px 20px rgba(${{r}}, ${{g}}, ${{b}}, 0.25)`,
                    shadow_md: `0 12px 48px rgba(${{r}}, ${{g}}, ${{b}}, 0.35)`,
                    shadow_lg: `0 25px 80px rgba(10, 6, 4, 0.85)`,
                    body_gradient: `linear-gradient(180deg, rgba(${{r}}, ${{g}}, ${{b}}, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 30%, ${{bgDeep}} 0%, var(--bg) 70%)`
                }};
            }}
            const bg = hslToHex(h, 20, 98);
            const bgAlt = hslToHex(h, 15, 95);
            const bgDeep = hslToHex(h, 18, 88);
            const black = hslToHex(h, 15, 10);
            return {{
                accent_dim: `rgba(${{r}}, ${{g}}, ${{b}}, 0.1)`,
                accent_border: `rgba(${{r}}, ${{g}}, ${{b}}, 0.28)`,
                black,
                ink: hslToHex(h, 12, 92),
                ink_soft: hslToHex(h, 10, 88),
                ink_mid: hslToHex(h, 10, 48),
                ink_muted: hslToHex(h, 8, 62),
                bg,
                bg_alt: bgAlt,
                bg_deep: bgDeep,
                text: black,
                text_mid: hslToHex(h, 12, 28),
                text_muted: hslToHex(h, 10, 48),
                border: `rgba(${{r}}, ${{g}}, ${{b}}, 0.16)`,
                nav_bg: `rgba(${{parseInt(bgAlt.slice(1, 3), 16)}}, ${{parseInt(bgAlt.slice(3, 5), 16)}}, ${{parseInt(bgAlt.slice(5, 7), 16)}}, 0.92)`,
                shadow_sm: `0 4px 20px rgba(${{r}}, ${{g}}, ${{b}}, 0.12)`,
                shadow_md: `0 12px 48px rgba(${{r}}, ${{g}}, ${{b}}, 0.16)`,
                shadow_lg: `0 25px 80px rgba(28, 18, 14, 0.12)`,
                body_gradient: `linear-gradient(180deg, rgba(${{r}}, ${{g}}, ${{b}}, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 20%, ${{bgAlt}} 0%, var(--bg) 70%)`
            }};
        }}

        let builderAccentSecondaryCustom = false;
        let builderAccentTertiaryCustom = false;

        function readBuilderHex(colorId, hexId, fallback = "#000000") {{
            const picker = document.getElementById(colorId);
            const hexInput = document.getElementById(hexId);
            const raw = (hexInput?.value || picker?.value || fallback).trim();
            const normalized = raw.startsWith("#") ? raw.toUpperCase() : `#${{raw}}`.toUpperCase();
            return /^#[0-9A-F]{{6}}$/.test(normalized) ? normalized : fallback.toUpperCase();
        }}

        function setBuilderColorPair(colorId, hexId, hex, silent = false) {{
            const colorPicker = document.getElementById(colorId);
            const colorHexInput = document.getElementById(hexId);
            if (colorPicker && colorHexInput) {{
                colorPicker.value = hex;
                colorHexInput.value = hex;
            }}
            if (!silent) updatePreviewStyles();
        }}

        function deriveAccentVariants(primaryHex) {{
            const hsl = hexToHsl(primaryHex);
            return {{
                secondary: hslToHex(hsl.h, Math.min(100, hsl.s + 5), Math.min(90, hsl.l + 10)),
                tertiary: hslToHex(hsl.h, Math.min(100, hsl.s + 15), Math.min(90, hsl.l + 5))
            }};
        }}

        function syncAutoAccentVariants(primaryHex) {{
            const derived = deriveAccentVariants(primaryHex);
            if (!builderAccentSecondaryCustom) {{
                setBuilderColorPair("builder-accent-secondary-color", "builder-accent-secondary-hex", derived.secondary, true);
            }}
            if (!builderAccentTertiaryCustom) {{
                setBuilderColorPair("builder-accent-tertiary-color", "builder-accent-tertiary-hex", derived.tertiary, true);
            }}
        }}

        function bindBuilderColorInput(colorId, hexId, {{ markCustom = false, onPrimaryChange = null }} = {{}}) {{
            const picker = document.getElementById(colorId);
            const hexInput = document.getElementById(hexId);
            if (!picker || !hexInput) return;

            const handleChange = (hex) => {{
                if (markCustom === "secondary") builderAccentSecondaryCustom = true;
                if (markCustom === "tertiary") builderAccentTertiaryCustom = true;
                if (onPrimaryChange) onPrimaryChange(hex);
                updatePreviewStyles();
            }};

            picker.addEventListener("input", () => {{
                const hex = picker.value.toUpperCase();
                hexInput.value = hex;
                handleChange(hex);
            }});
            hexInput.addEventListener("input", () => {{
                const val = hexInput.value.trim();
                if (/^#[0-9A-F]{{6}}$/i.test(val)) {{
                    picker.value = val;
                    handleChange(val.toUpperCase());
                }}
            }});
        }}

        function randomBuilderHex() {{
            return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0").toUpperCase();
        }}

        function getBuilderThemeState() {{
            const primaryFont = document.getElementById("builder-font-primary").value;
            const secondaryFont = document.getElementById("builder-font-secondary").value;
            const accent = readBuilderHex("builder-accent-color", "builder-accent-hex", "#D92D0D");
            const accentSecondary = readBuilderHex("builder-accent-secondary-color", "builder-accent-secondary-hex", "#E44623");
            const accentTertiary = readBuilderHex("builder-accent-tertiary-color", "builder-accent-tertiary-hex", "#FC390D");
            const headingPresetKey = document.getElementById("builder-heading-preset").value;
            const radius = document.getElementById("builder-radius").value;
            const cardStyle = document.getElementById("builder-card-style").value;
            const btnStyle = document.getElementById("builder-btn-style").value;
            const badgeStyle = document.getElementById("builder-badge-style").value;
            const hsl = hexToHsl(accent);
            const rgb = {{
                r: parseInt(accent.slice(1, 3), 16),
                g: parseInt(accent.slice(3, 5), 16),
                b: parseInt(accent.slice(5, 7), 16)
            }};
            const accentLight = accentSecondary;
            const accentBright = accentTertiary;
            const accentPale = hslToHex(hsl.h, Math.max(0, hsl.s - 20), Math.min(98, hsl.l + 35));
            const hueLabel = accentHueLabel(hsl.h);
            const hueLabelSecondary = accentHueLabel(hexToHsl(accentSecondary).h);
            const hueLabelTertiary = accentHueLabel(hexToHsl(accentTertiary).h);
            const dark = buildModeSurfaceTokens(hsl, rgb, "dark");
            const light = buildModeSurfaceTokens(hsl, rgb, "light");
            const mode = builderPreviewMode;
            const surface = mode === "dark" ? dark : light;

            const themeJson = {{
                name: "Custom Studio",
                slug: "custom",
                font_primary: primaryFont,
                font_secondary: secondaryFont,
                accents: [accent, accentSecondary, accentTertiary, accentPale],
                accent_names: [hueLabel, hueLabelSecondary, hueLabelTertiary, `${{hueLabel}} Pale`],
                dark,
                light,
                presets: {{
                    radius,
                    box_style: cardStyle,
                    btn_style: btnStyle,
                    badge_style: badgeStyle,
                    heading_preset: headingPresetKey,
                    accent_primary: accent,
                    accent_secondary: accentSecondary,
                    accent_tertiary: accentTertiary
                }}
            }};

            return {{
                mode,
                accent,
                accentSecondary,
                accentTertiary,
                accentLight,
                accentBright,
                accentPale,
                hueLabel,
                hueLabelSecondary,
                hueLabelTertiary,
                primaryFont,
                secondaryFont,
                headingPresetKey,
                headingPreset: HEADING_PRESETS[headingPresetKey] || HEADING_PRESETS.default,
                radius,
                cardStyle,
                btnStyle,
                badgeStyle,
                dark,
                light,
                surface,
                themeJson,
                themeJsonText: JSON.stringify(themeJson, null, 4)
            }};
        }}

        async function loadBuilderThemeShell() {{
            if (builderThemeShellTemplate) return builderThemeShellTemplate;
            const embedded = document.getElementById("builder-theme-shell-template");
            if (embedded) {{
                builderThemeShellTemplate = embedded.innerHTML.trim();
                return builderThemeShellTemplate;
            }}
            try {{
                const response = await fetch("builder_theme_shell.html");
                if (response.ok) {{
                    builderThemeShellTemplate = await response.text();
                    return builderThemeShellTemplate;
                }}
            }} catch (e) {{
                /* fetch unavailable (e.g. file://) — fall through */
            }}
            throw new Error("Theme shell template not found on this page");
        }}

        function applyBuilderThemeReplacements(shell, state) {{
            const s = state;
            const d = s.dark;
            const l = s.light;
            const accentUses = [
                "Primary accent, rules, CTAs",
                "Hover states, secondary emphasis",
                "Active states, bright highlights",
                "Soft tint, decorative use"
            ];
            const replacements = {{
                "{{theme_json}}": s.themeJsonText,
                "{{name}}": "Custom Studio",
                "{{slug}}": "custom",
                "{{font_import}}": buildGoogleFontImport(s.primaryFont, s.secondaryFont),
                "{{font_primary_family}}": `"${{s.primaryFont}}", system-ui, -apple-system, sans-serif`,
                "{{font_secondary_family}}": `"${{s.secondaryFont}}", sans-serif`,
                "{{font_primary_name}}": s.primaryFont,
                "{{font_secondary_name}}": s.secondaryFont,
                "{{accent1}}": s.accent,
                "{{accent2}}": s.accentLight,
                "{{accent3}}": s.accentBright,
                "{{accent4}}": s.accentPale,
                "{{accent1_name}}": s.hueLabel,
                "{{accent2_name}}": s.hueLabelSecondary,
                "{{accent3_name}}": s.hueLabelTertiary,
                "{{accent4_name}}": `${{s.hueLabel}} Pale`,
                "{{accent1_use}}": accentUses[0],
                "{{accent2_use}}": accentUses[1],
                "{{accent3_use}}": accentUses[2],
                "{{accent4_use}}": accentUses[3],
                "{{dark_accent_dim}}": d.accent_dim,
                "{{dark_accent_border}}": d.accent_border,
                "{{dark_black}}": d.black,
                "{{dark_ink}}": d.ink,
                "{{dark_ink_soft}}": d.ink_soft,
                "{{dark_ink_mid}}": d.ink_mid,
                "{{dark_ink_muted}}": d.ink_muted,
                "{{dark_bg}}": d.bg,
                "{{dark_bg_alt}}": d.bg_alt,
                "{{dark_bg_deep}}": d.bg_deep,
                "{{dark_text}}": d.text,
                "{{dark_text_mid}}": d.text_mid,
                "{{dark_text_muted}}": d.text_muted,
                "{{dark_border}}": d.border,
                "{{dark_nav_bg}}": d.nav_bg,
                "{{dark_shadow_sm}}": d.shadow_sm,
                "{{dark_shadow_md}}": d.shadow_md,
                "{{dark_shadow_lg}}": d.shadow_lg,
                "{{dark_body_gradient}}": d.body_gradient,
                "{{light_accent_dim}}": l.accent_dim,
                "{{light_accent_border}}": l.accent_border,
                "{{light_black}}": l.black,
                "{{light_ink}}": l.ink,
                "{{light_ink_soft}}": l.ink_soft,
                "{{light_ink_mid}}": l.ink_mid,
                "{{light_ink_muted}}": l.ink_muted,
                "{{light_bg}}": l.bg,
                "{{light_bg_alt}}": l.bg_alt,
                "{{light_bg_deep}}": l.bg_deep,
                "{{light_text}}": l.text,
                "{{light_text_mid}}": l.text_mid,
                "{{light_text_muted}}": l.text_muted,
                "{{light_border}}": l.border,
                "{{light_nav_bg}}": l.nav_bg,
                "{{light_shadow_sm}}": l.shadow_sm,
                "{{light_shadow_md}}": l.shadow_md,
                "{{light_shadow_lg}}": l.shadow_lg,
                "{{light_body_gradient}}": l.body_gradient,
                "{{brand_title_formatted}}": 'Custom <span>Studio</span>',
                "{{hero_eyebrow}}": "Live preview · Dual mode · Builder",
                "{{hero_title}}": 'Your theme on <span>custom foundations</span>',
                "{{hero_lede}}": "A full theme reference page generated from your builder settings. Toggle light and dark modes, copy tokens, and explore every section exactly as it would appear in a published theme.",
                "{{hero_tag1}}": "Theme Builder",
                "{{hero_tag2}}": "Live preview",
                "{{hero_tag3}}": "Exportable",
                "{{typography_desc}}": `${{s.primaryFont}} handles display and UI weight. ${{s.secondaryFont}} carries labels, metadata, and monospace-adjacent detail.`
            }};

            let html = shell;
            Object.entries(replacements).forEach(([token, value]) => {{
                html = html.split(token).join(value);
            }});

            html = html.replace('<html lang="en" data-theme="dark">', `<html lang="en" data-theme="${{s.mode}}">`);
            html = html.replace(/href="index\.html#theme-custom"/g, 'href="#" data-builder-close="true"');
            html = html.replace(/href="index\.html#theme-\{{slug\}}"/g, 'href="#" data-builder-close="true"');

            const viewerBridge = "<scr" + "ipt>" +
                "document.querySelectorAll('[data-builder-close]').forEach(function(el){{" +
                "el.addEventListener('click',function(e){{e.preventDefault();parent.postMessage({{type:'closeBuilderViewer'}},'*');}});" +
                "}});" +
                "</scr" + "ipt>";
            html = html.replace("</body>", `${{viewerBridge}}</body>`);
            return html;
        }}

        async function renderBuilderThemeDocument() {{
            const shell = await loadBuilderThemeShell();
            const state = getBuilderThemeState();
            return applyBuilderThemeReplacements(shell, state);
        }}

        async function refreshThemeViewer() {{
            if (!builderViewerActive) return;
            const iframe = document.getElementById("builder-theme-iframe");
            try {{
                iframe.srcdoc = await renderBuilderThemeDocument();
            }} catch (error) {{
                iframe.srcdoc = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;padding:2rem;background:#111;color:#f5f5f5"><h1>Preview unavailable</h1><p>${{error.message}}</p></body></html>`;
            }}
        }}

        async function setBuilderViewer(active) {{
            builderViewerActive = active;
            const viewer = document.getElementById("builder-theme-viewer");
            const previewBtn = document.getElementById("builder-fullscreen-btn");
            const label = previewBtn.querySelector("span");
            viewer.hidden = !active;
            document.body.classList.toggle("builder-viewer-active", active);
            if (active) {{
                label.textContent = "Close";
                previewBtn.title = "Close theme preview";
                await refreshThemeViewer();
            }} else {{
                label.textContent = "Preview";
                previewBtn.title = "Open full theme preview";
                document.getElementById("builder-theme-iframe").srcdoc = "";
            }}
        }}

        document.getElementById("builder-fullscreen-btn").addEventListener("click", () => {{
            setBuilderViewer(!builderViewerActive);
        }});
        const builderViewerClose = document.getElementById("builder-viewer-close");
        const builderViewerRefresh = document.getElementById("builder-viewer-refresh");
        if (builderViewerClose) {{
            builderViewerClose.addEventListener("click", () => setBuilderViewer(false));
        }}
        if (builderViewerRefresh) {{
            builderViewerRefresh.addEventListener("click", () => refreshThemeViewer());
        }}

        window.addEventListener("message", (event) => {{
            if (event.data && event.data.type === "closeBuilderViewer") {{
                setBuilderViewer(false);
            }}
        }});

        document.addEventListener("keydown", (e) => {{
            if (e.key === "Escape" && builderViewerActive) {{
                setBuilderViewer(false);
            }}
        }});

        const builderPreviewViewport = document.getElementById("builder-preview-viewport");
        if (builderPreviewViewport && window.ResizeObserver) {{
            const previewResizeObserver = new ResizeObserver(() => fitBuilderPreview());
            previewResizeObserver.observe(builderPreviewViewport);
        }}
        window.addEventListener("resize", fitBuilderPreview);
        

        function hexToHsl(hex) {{
            let r = parseInt(hex.slice(1, 3), 16) / 255;
            let g = parseInt(hex.slice(3, 5), 16) / 255;
            let b = parseInt(hex.slice(5, 7), 16) / 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max == min) {{
                h = s = 0;
            }} else {{
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {{
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }}
                h /= 6;
            }}
            return {{ h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }};
        }}

        // Helper: HSL to Hex
        function hslToHex(h, s, l) {{
            s /= 100;
            l /= 100;
            let c = (1 - Math.abs(2 * l - 1)) * s;
            let x = c * (1 - Math.abs((h / 60) % 2 - 1));
            let m = l - c / 2;
            let r = 0, g = 0, b = 0;
            if (0 <= h && h < 60) {{ r = c; g = x; b = 0; }}
            else if (60 <= h && h < 120) {{ r = x; g = c; b = 0; }}
            else if (120 <= h && h < 180) {{ r = 0; g = c; b = x; }}
            else if (180 <= h && h < 240) {{ r = 0; g = x; b = c; }}
            else if (240 <= h && h < 300) {{ r = x; g = 0; b = c; }}
            else if (300 <= h && h < 360) {{ r = c; g = 0; b = x; }}
            let r_hex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
            let g_hex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
            let b_hex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
            return `#${{r_hex}}${{g_hex}}${{b_hex}}`.toUpperCase();
        }}

        const primarySelect = document.getElementById("builder-font-primary");
        const secondarySelect = document.getElementById("builder-font-secondary");
        const pairingSelect = document.getElementById("builder-font-pairing");

        const FONT_GROUPS = {{
            primary: {{
                "Display & Impact": ["Archivo Black", "Barlow Condensed", "Orbitron", "Press Start 2P", "Special Elite", "Syncopate", "Syne", "Unbounded"],
                "Sans": ["Albert Sans", "Archivo", "DM Sans", "Inter", "Lexend", "Montserrat", "Outfit", "Plus Jakarta Sans", "Roboto", "Sora", "Space Grotesk", "Urbanist"],
                "Serif & Editorial": ["Alice", "Cinzel", "Cormorant Garamond", "DM Serif Display", "EB Garamond", "Fraunces", "Instrument Serif", "Lora", "Newsreader", "Noto Serif JP", "Playfair Display", "Spectral"]
            }},
            secondary: {{
                "Sans": ["Albert Sans", "DM Sans", "Inter", "Josefin Sans", "Lexend", "Montserrat", "Noto Sans JP", "Outfit", "Plus Jakarta Sans", "Quicksand", "Sora", "Space Grotesk", "Teko", "Urbanist"],
                "Serif": ["Cormorant Garamond", "Lora", "Spectral"],
                "Monospace & Code": ["Courier Prime", "DM Mono", "Fira Code", "JetBrains Mono", "Share Tech Mono", "Syncopate", "VT323"]
            }}
        }};

        const FONT_PAIRINGS = [
            {{ id: "crimson", label: "Crimson Horizon", primary: "Montserrat", secondary: "Josefin Sans" }},
            {{ id: "nordic", label: "Nordic Frost", primary: "Inter", secondary: "Fira Code" }},
            {{ id: "solar", label: "Solar Flare", primary: "Syne", secondary: "Outfit" }},
            {{ id: "emerald", label: "Emerald Grove", primary: "Playfair Display", secondary: "Lora" }},
            {{ id: "neon", label: "Neon Cyber", primary: "Space Grotesk", secondary: "JetBrains Mono" }},
            {{ id: "desert", label: "Desert Dunes", primary: "Sora", secondary: "Plus Jakarta Sans" }},
            {{ id: "brutalist", label: "Brutalist Concrete", primary: "Archivo", secondary: "Courier Prime" }},
            {{ id: "parchment", label: "Vintage Parchment", primary: "EB Garamond", secondary: "Spectral" }},
            {{ id: "sakura", label: "Sakura Bloom", primary: "DM Serif Display", secondary: "Inter" }},
            {{ id: "obsidian", label: "Obsidian Gold", primary: "Cinzel", secondary: "Cormorant Garamond" }},
            {{ id: "arcade", label: "Retro Arcade", primary: "Press Start 2P", secondary: "VT323" }},
            {{ id: "velvet", label: "Royal Velvet", primary: "Fraunces", secondary: "Urbanist" }},
            {{ id: "geyser", label: "Icelandic Geyser", primary: "Instrument Serif", secondary: "Inter" }},
            {{ id: "cyberpunk", label: "Cyberpunk Grid", primary: "Archivo Black", secondary: "Share Tech Mono" }},
            {{ id: "orchid", label: "Orchid Nebula", primary: "Unbounded", secondary: "Syncopate" }},
            {{ id: "arctic", label: "Arctic Teal", primary: "Outfit", secondary: "DM Mono" }},
            {{ id: "sage", label: "Sage Minimalist", primary: "Newsreader", secondary: "Sora" }},
            {{ id: "sunset", label: "Sunset Glow", primary: "Playfair Display", secondary: "Outfit" }},
            {{ id: "copper", label: "Copper Mine", primary: "Space Grotesk", secondary: "DM Sans" }},
            {{ id: "lavender", label: "Electric Lavender", primary: "Syne", secondary: "Sora" }},
            {{ id: "terracotta", label: "Terracotta Garden", primary: "Alice", secondary: "Albert Sans" }},
            {{ id: "matcha", label: "Matcha Latte", primary: "Lexend", secondary: "Quicksand" }},
            {{ id: "steel", label: "Steel Foundry", primary: "Barlow Condensed", secondary: "Teko" }},
            {{ id: "swiss", label: "Monochrome Swiss", primary: "Roboto", secondary: "JetBrains Mono" }},
            {{ id: "ink", label: "Japanese Ink", primary: "Noto Serif JP", secondary: "Noto Sans JP" }},
            {{ id: "noir", label: "Typewriter Noir", primary: "Special Elite", secondary: "Courier Prime" }},
            {{ id: "hud", label: "Futurist HUD", primary: "Orbitron", secondary: "Fira Code" }}
        ];

        const HEADING_PRESETS = {{
            default: {{
                titleSize: "clamp(1.5rem, 4.5vw, 2.75rem)",
                titleWeight: "900",
                titleTracking: "-0.03em",
                titleLineHeight: "1.12",
                titleStyle: "normal",
                titleTransform: "none",
                logoSize: "1.15rem",
                logoWeight: "800",
                logoTracking: "-0.02em",
                cardTitleSize: "0.9rem",
                cardTitleWeight: "700",
                eyebrowTransform: "uppercase",
                eyebrowTracking: "0.05em"
            }},
            editorial: {{
                titleSize: "clamp(1.55rem, 4vw, 2.6rem)",
                titleWeight: "700",
                titleTracking: "-0.01em",
                titleLineHeight: "1.18",
                titleStyle: "italic",
                titleTransform: "none",
                logoSize: "1.1rem",
                logoWeight: "700",
                logoTracking: "0.02em",
                cardTitleSize: "0.92rem",
                cardTitleWeight: "600",
                eyebrowTransform: "uppercase",
                eyebrowTracking: "0.12em"
            }},
            billboard: {{
                titleSize: "clamp(1.75rem, 5.5vw, 3.25rem)",
                titleWeight: "900",
                titleTracking: "-0.04em",
                titleLineHeight: "1.05",
                titleStyle: "normal",
                titleTransform: "none",
                logoSize: "1.25rem",
                logoWeight: "900",
                logoTracking: "-0.03em",
                cardTitleSize: "0.95rem",
                cardTitleWeight: "800",
                eyebrowTransform: "uppercase",
                eyebrowTracking: "0.08em"
            }},
            technical: {{
                titleSize: "clamp(1.35rem, 3.5vw, 2.2rem)",
                titleWeight: "700",
                titleTracking: "0.02em",
                titleLineHeight: "1.2",
                titleStyle: "normal",
                titleTransform: "none",
                logoSize: "1rem",
                logoWeight: "700",
                logoTracking: "0.04em",
                cardTitleSize: "0.82rem",
                cardTitleWeight: "700",
                eyebrowTransform: "uppercase",
                eyebrowTracking: "0.1em"
            }},
            minimal: {{
                titleSize: "clamp(1.25rem, 3vw, 1.9rem)",
                titleWeight: "600",
                titleTracking: "-0.02em",
                titleLineHeight: "1.25",
                titleStyle: "normal",
                titleTransform: "none",
                logoSize: "0.95rem",
                logoWeight: "600",
                logoTracking: "0",
                cardTitleSize: "0.8rem",
                cardTitleWeight: "600",
                eyebrowTransform: "none",
                eyebrowTracking: "0.02em"
            }},
            luxury: {{
                titleSize: "clamp(1.5rem, 4vw, 2.5rem)",
                titleWeight: "500",
                titleTracking: "0.12em",
                titleLineHeight: "1.15",
                titleStyle: "normal",
                titleTransform: "uppercase",
                logoSize: "1.05rem",
                logoWeight: "600",
                logoTracking: "0.18em",
                cardTitleSize: "0.78rem",
                cardTitleWeight: "600",
                eyebrowTransform: "uppercase",
                eyebrowTracking: "0.2em"
            }}
        }};

        function populateFontSelect(selectEl, groups, defaultFont) {{
            selectEl.innerHTML = "";
            Object.entries(groups).forEach(([groupLabel, fonts]) => {{
                const group = document.createElement("optgroup");
                group.label = groupLabel;
                fonts.forEach(font => {{
                    const opt = document.createElement("option");
                    opt.value = font;
                    opt.textContent = font;
                    if (font === defaultFont) opt.selected = true;
                    group.appendChild(opt);
                }});
                selectEl.appendChild(group);
            }});
        }}

        function applyFontPairing(primary, secondary, resetPairingSelect = true) {{
            if (primarySelect.querySelector(`option[value="${{primary}}"]`)) {{
                primarySelect.value = primary;
            }}
            if (secondarySelect.querySelector(`option[value="${{secondary}}"]`)) {{
                secondarySelect.value = secondary;
            }}
            if (resetPairingSelect && pairingSelect) {{
                const match = FONT_PAIRINGS.find(p => p.primary === primary && p.secondary === secondary);
                pairingSelect.value = match ? match.id : "custom";
            }}
        }}

        populateFontSelect(primarySelect, FONT_GROUPS.primary, "Montserrat");
        populateFontSelect(secondarySelect, FONT_GROUPS.secondary, "Inter");

        const CURATED_COMPONENT_BUNDLES = {{
            editorial: {{ radius: "16px", cardStyle: "glass", btnStyle: "ghost", badgeStyle: "tinted", headingPreset: "editorial" }},
            minimal: {{ radius: "8px", cardStyle: "flat", btnStyle: "outline", badgeStyle: "outline", headingPreset: "minimal" }},
            technical: {{ radius: "4px", cardStyle: "elevated", btnStyle: "filled", badgeStyle: "filled", headingPreset: "technical" }},
            bold: {{ radius: "8px", cardStyle: "elevated", btnStyle: "filled", badgeStyle: "tinted", headingPreset: "billboard" }},
            neon: {{ radius: "8px", cardStyle: "elevated", btnStyle: "glow", badgeStyle: "filled", headingPreset: "billboard" }},
            brutal: {{ radius: "0px", cardStyle: "bordered", btnStyle: "outline", badgeStyle: "outline", headingPreset: "billboard" }},
            luxury: {{ radius: "4px", cardStyle: "flat", btnStyle: "outline", badgeStyle: "tinted", headingPreset: "luxury" }},
            soft: {{ radius: "16px", cardStyle: "elevated", btnStyle: "filled", badgeStyle: "tinted", headingPreset: "default" }},
            pill: {{ radius: "9999px", cardStyle: "elevated", btnStyle: "filled", badgeStyle: "filled", headingPreset: "default" }}
        }};

        const THEME_STYLE_VIBE = {{
            crimson: "bold", nordic: "technical", solar: "bold", emerald: "editorial",
            neon: "neon", desert: "soft", brutalist: "brutal", parchment: "editorial",
            sakura: "soft", obsidian: "luxury", arcade: "technical", velvet: "editorial",
            geyser: "editorial", cyberpunk: "neon", orchid: "neon", arctic: "minimal",
            sage: "minimal", sunset: "editorial", copper: "technical", lavender: "soft",
            terracotta: "soft", matcha: "pill", steel: "bold", swiss: "minimal",
            ink: "luxury", noir: "editorial", hud: "technical"
        }};

        function pickRandomItem(items) {{
            return items[Math.floor(Math.random() * items.length)];
        }}

        function parseThemeFontFamily(fontStack) {{
            if (!fontStack) return "Inter";
            const match = String(fontStack).match(/"([^"]+)"/);
            return match ? match[1] : String(fontStack).split(",")[0].trim().replace(/['"]/g, "");
        }}

        function setBuilderSelectValue(id, value) {{
            const el = document.getElementById(id);
            if (!el) return;
            const hasOption = Array.from(el.options).some((opt) => opt.value === value);
            if (hasOption) el.value = value;
        }}

        function applyCuratedRandomRecipe() {{
            const themePool = Object.values(ALL_THEMES_DATA || {{}}).filter((theme) => theme?.accents?.length);
            if (!themePool.length) return false;

            const theme = pickRandomItem(themePool);
            const slug = theme.slug || "";
            const accents = theme.accents;
            const primary = accents[0].toUpperCase();
            const derived = deriveAccentVariants(primary);
            const secondary = (accents[1] || derived.secondary).toUpperCase();
            const tertiary = (accents[2] || derived.tertiary).toUpperCase();

            builderAccentSecondaryCustom = true;
            builderAccentTertiaryCustom = true;
            setBuilderColorPair("builder-accent-color", "builder-accent-hex", primary, true);
            setBuilderColorPair("builder-accent-secondary-color", "builder-accent-secondary-hex", secondary, true);
            setBuilderColorPair("builder-accent-tertiary-color", "builder-accent-tertiary-hex", tertiary, true);

            const pairing = FONT_PAIRINGS.find((p) => p.id === slug);
            if (pairing) {{
                pairingSelect.value = pairing.id;
                applyFontPairing(pairing.primary, pairing.secondary, false);
            }} else {{
                applyFontPairing(
                    parseThemeFontFamily(theme.font_primary),
                    parseThemeFontFamily(theme.font_secondary),
                    true
                );
            }}

            const vibeKey = THEME_STYLE_VIBE[slug] || pickRandomItem(Object.keys(CURATED_COMPONENT_BUNDLES));
            const bundle = CURATED_COMPONENT_BUNDLES[vibeKey] || CURATED_COMPONENT_BUNDLES.soft;
            setBuilderSelectValue("builder-heading-preset", bundle.headingPreset);
            setBuilderSelectValue("builder-radius", bundle.radius);
            setBuilderSelectValue("builder-card-style", bundle.cardStyle);
            setBuilderSelectValue("builder-btn-style", bundle.btnStyle);
            setBuilderSelectValue("builder-badge-style", bundle.badgeStyle);
            return true;
        }}

        function randomizeBuilderPresets() {{
            if (!applyCuratedRandomRecipe()) {{
                const primary = randomBuilderHex();
                builderAccentSecondaryCustom = false;
                builderAccentTertiaryCustom = false;
                setBuilderColorPair("builder-accent-color", "builder-accent-hex", primary, true);
                syncAutoAccentVariants(primary);
            }}
            updatePreviewStyles();
        }}

        FONT_PAIRINGS.forEach(pairing => {{
            const opt = document.createElement("option");
            opt.value = pairing.id;
            opt.textContent = `${{pairing.label}} — ${{pairing.primary}} + ${{pairing.secondary}}`;
            pairingSelect.appendChild(opt);
        }});

        let builderPreviewMode = "dark";
        let builderGeneratedCss = "";
        let builderGeneratedJson = "";
        
        function updatePreviewStyles() {{
            const state = getBuilderThemeState();
            const {{
                primaryFont,
                secondaryFont,
                accent,
                accentLight,
                accentBright,
                accentPale,
                headingPreset,
                radius,
                cardStyle,
                btnStyle,
                badgeStyle,
                mode,
                dark,
                light,
                surface,
                themeJson
            }} = state;

            const bg = surface.bg;
            const bgAlt = surface.bg_alt;
            const text = surface.text;
            const textMid = surface.text_mid;
            const textMuted = surface.text_muted;
            const border = surface.border;
            const shadow = mode === "dark" ? dark.shadow_md : light.shadow_md;
            
            let cardCss = '';
            if (cardStyle === 'flat') {{
                cardCss = `background: ${{bgAlt}}; border: 1px solid ${{border}}; box-shadow: none;`;
            }} else if (cardStyle === 'elevated') {{
                cardCss = `background: ${{bgAlt}}; border: 1px solid ${{border}}; box-shadow: ${{shadow}};`;
            }} else if (cardStyle === 'bordered') {{
                cardCss = `background: ${{bgAlt}}; border: 3px double ${{accent}}; box-shadow: none;`;
            }} else if (cardStyle === 'glass') {{
                cardCss = `background: rgba(${{mode === 'dark' ? '20,20,20' : '240,240,240'}}, 0.45); backdrop-filter: blur(12px); border: 1px solid ${{border}}; box-shadow: ${{shadow}};`;
            }}
            
            let btnCss = '';
            if (btnStyle === 'filled') {{
                btnCss = `background: ${{accent}}; color: ${{mode === 'dark' ? '#000000' : '#ffffff'}}; border: none;`;
            }} else if (btnStyle === 'outline') {{
                btnCss = `background: transparent; color: ${{accent}}; border: 1.5px solid ${{accent}};`;
            }} else if (btnStyle === 'ghost') {{
                btnCss = `background: transparent; color: ${{accent}}; border: none;`;
            }} else if (btnStyle === 'glow') {{
                btnCss = `background: ${{accent}}; color: ${{mode === 'dark' ? '#000000' : '#ffffff'}}; border: none; box-shadow: 0 0 15px ${{accent}};`;
            }}
            
            let badgeCss = '';
            if (badgeStyle === 'filled') {{
                badgeCss = `background: ${{accent}}; color: ${{mode === 'dark' ? '#000000' : '#ffffff'}}; border: none;`;
            }} else if (badgeStyle === 'tinted') {{
                badgeCss = `background: ${{accentPale}}; color: ${{accent}}; border: none;`;
            }} else if (badgeStyle === 'outline') {{
                badgeCss = `background: transparent; color: ${{accent}}; border: 1px solid ${{accent}};`;
            }}
            
            const previewCanvas = document.getElementById("builder-preview-canvas");
            previewCanvas.style.backgroundColor = bg;
            previewCanvas.style.color = text;
            previewCanvas.style.fontFamily = secondaryFont;
            previewCanvas.dataset.pillRadius = radius === "9999px" ? "true" : "false";
            
            const styleEl = document.getElementById("builder-dynamic-styles") || document.createElement("style");
            styleEl.id = "builder-dynamic-styles";
            styleEl.innerHTML = `
                #builder-preview-canvas {{
                    --accent: ${{accent}};
                    --accent-light: ${{accentLight}};
                    --text-mid: ${{textMid}};
                    --text-muted: ${{textMuted}};
                    --border-val: ${{border}};
                    --radius-val: ${{radius}};
                }}
                #builder-preview-canvas .preview-logo {{
                    font-family: "${{primaryFont}}", sans-serif;
                    color: ${{text}};
                    font-size: ${{headingPreset.logoSize}};
                    font-weight: ${{headingPreset.logoWeight}};
                    letter-spacing: ${{headingPreset.logoTracking}};
                }}
                #builder-preview-canvas .preview-logo span {{
                    color: ${{accent}};
                }}
                #builder-preview-canvas .preview-title {{
                    font-family: "${{primaryFont}}", sans-serif;
                    color: ${{text}};
                    font-size: ${{headingPreset.titleSize}};
                    font-weight: ${{headingPreset.titleWeight}};
                    letter-spacing: ${{headingPreset.titleTracking}};
                    line-height: ${{headingPreset.titleLineHeight}};
                    font-style: ${{headingPreset.titleStyle}};
                    text-transform: ${{headingPreset.titleTransform}};
                }}
                #builder-preview-canvas .preview-title span {{
                    color: ${{accent}};
                }}
                #builder-preview-canvas .preview-eyebrow {{
                    color: ${{accent}};
                    text-transform: ${{headingPreset.eyebrowTransform}};
                    letter-spacing: ${{headingPreset.eyebrowTracking}};
                }}
                #builder-preview-canvas .preview-preset-card h3 {{
                    font-family: "${{primaryFont}}", sans-serif;
                    font-size: ${{headingPreset.cardTitleSize}};
                    font-weight: ${{headingPreset.cardTitleWeight}};
                }}
                #builder-preview-canvas .preview-lede {{
                    color: ${{textMid}};
                }}
                #builder-preview-canvas .preview-preset-card {{
                    border-radius: ${{radius}};
                    ${{cardCss}}
                }}
                #builder-preview-canvas .preview-btn {{
                    border-radius: ${{radius}};
                    font-family: "${{secondaryFont}}", monospace;
                }}
                #builder-preview-canvas .preview-btn.primary {{
                    ${{btnCss}}
                }}
                #builder-preview-canvas .preview-btn.secondary {{
                    background: transparent;
                    color: ${{textMid}};
                    border: 1px solid ${{border}};
                }}
                #builder-preview-canvas .preview-badge {{
                    border-radius: ${{radius === '0px' ? '0px' : '9999px'}};
                    font-family: "${{secondaryFont}}", monospace;
                    ${{badgeCss}}
                }}
                #builder-preview-canvas .preview-metric {{
                    border-left: 3px solid ${{accent}};
                    background: ${{bgAlt}};
                    border-radius: ${{radius}};
                    padding: 12px 16px;
                }}
                #builder-preview-canvas .preview-metric .num {{
                    color: ${{text}};
                    font-family: "${{primaryFont}}", sans-serif;
                }}
                #builder-preview-canvas .preview-metric .label {{
                    color: ${{textMuted}};
                }}
                #builder-preview-canvas .preview-principle-num {{
                    font-family: "${{primaryFont}}", sans-serif;
                    color: ${{accent}};
                }}
            `;
            if (!styleEl.parentNode) {{
                document.head.appendChild(styleEl);
            }}
            
            const cssText = `:root {{
  --accent: ${{accent}};
  --accent-light: ${{accentLight}};
  --accent-bright: ${{accentBright}};
  --accent-pale: ${{accentPale}};
  
  --r-sm: ${{radius === '0px' ? '0px' : '4px'}};
  --r-md: ${{radius}};
  --r-lg: ${{radius === '0px' ? '0px' : '14px'}};
}}

[data-theme="dark"] {{
  --bg: ${{dark.bg}};
  --bg-alt: ${{dark.bg_alt}};
  --bg-deep: ${{dark.bg_deep}};
  --text: ${{dark.text}};
  --text-mid: ${{dark.text_mid}};
  --text-muted: ${{dark.text_muted}};
  --border: ${{dark.border}};
}}

[data-theme="light"] {{
  --bg: ${{light.bg}};
  --bg-alt: ${{light.bg_alt}};
  --bg-deep: ${{light.bg_deep}};
  --text: ${{light.text}};
  --text-mid: ${{light.text_mid}};
  --text-muted: ${{light.text_muted}};
  --border: ${{light.border}};
}}`;

            builderGeneratedCss = cssText;
            builderGeneratedJson = JSON.stringify(themeJson, null, 4);
            requestAnimationFrame(fitBuilderPreview);
            if (builderViewerActive) {{
                refreshThemeViewer();
            }}
        }}}
        
        bindBuilderColorInput("builder-accent-color", "builder-accent-hex", {{
            onPrimaryChange: syncAutoAccentVariants
        }});
        bindBuilderColorInput("builder-accent-secondary-color", "builder-accent-secondary-hex", {{
            markCustom: "secondary"
        }});
        bindBuilderColorInput("builder-accent-tertiary-color", "builder-accent-tertiary-hex", {{
            markCustom: "tertiary"
        }});
        
        // Mode toggle
        const builderModeButtons = document.querySelectorAll("#builder-mode-toggle button");
        builderModeButtons.forEach(btn => {{
            btn.addEventListener("click", () => {{
                builderModeButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                builderPreviewMode = btn.dataset.mode;
                updatePreviewStyles();
            }});
        }});
        
        // Typography & component dropdowns
        pairingSelect.addEventListener("change", () => {{
            const pairing = FONT_PAIRINGS.find(p => p.id === pairingSelect.value);
            if (pairing) {{
                applyFontPairing(pairing.primary, pairing.secondary, false);
            }}
            updatePreviewStyles();
        }});

        document.getElementById("builder-font-primary").addEventListener("change", () => {{
            applyFontPairing(primarySelect.value, secondarySelect.value);
            updatePreviewStyles();
        }});
        document.getElementById("builder-font-secondary").addEventListener("change", () => {{
            applyFontPairing(primarySelect.value, secondarySelect.value);
            updatePreviewStyles();
        }});
        document.getElementById("builder-heading-preset").addEventListener("change", updatePreviewStyles);
        document.getElementById("builder-radius").addEventListener("change", updatePreviewStyles);
        document.getElementById("builder-card-style").addEventListener("change", updatePreviewStyles);
        document.getElementById("builder-btn-style").addEventListener("change", updatePreviewStyles);
        document.getElementById("builder-badge-style").addEventListener("change", updatePreviewStyles);
        
        document.getElementById("builder-randomize-btn").addEventListener("click", randomizeBuilderPresets);

        // Copy buttons
        document.getElementById("builder-copy-css").addEventListener("click", () => {{
            navigator.clipboard.writeText(builderGeneratedCss).then(() => {{
                const btn = document.getElementById("builder-copy-css");
                const originalHtml = btn.innerHTML;
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Copied!</span>
                `;
                setTimeout(() => {{
                    btn.innerHTML = originalHtml;
                }}, 1000);
            }});
        }});
        
        document.getElementById("builder-copy-json").addEventListener("click", () => {{
            navigator.clipboard.writeText(builderGeneratedJson).then(() => {{
                const btn = document.getElementById("builder-copy-json");
                const originalHtml = btn.innerHTML;
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Copied!</span>
                `;
                setTimeout(() => {{
                    btn.innerHTML = originalHtml;
                }}, 1000);
            }});
        }});

        // Append tools button to sidebar dynamically
        const divider = document.createElement("div");
        divider.className = "menu-divider";
        divider.style.margin = "12px 0";
        divider.style.borderTop = "1px solid var(--border)";
        sidebarMenu.appendChild(divider);

        const toolsLabel = document.createElement("div");
        toolsLabel.className = "menu-label";
        toolsLabel.textContent = "Tools";
        sidebarMenu.appendChild(toolsLabel);

        const builderBtn = document.createElement("button");
        builderBtn.type = "button";
        builderBtn.className = "menu-item";
        builderBtn.id = "menu-builder-btn";
        builderBtn.innerHTML = `<span>Theme Builder</span>`;
        sidebarMenu.appendChild(builderBtn);

        const builderContainer = document.getElementById("builder-container");
        const gridContainer = document.querySelector(".grid-container");
        const searchContainer = document.querySelector(".header-search-container");
        const viewToggle = document.querySelector(".view-toggle");


        // Scroll back to the specific theme card if hash exists
        const hash = window.location.hash;
        if (hash && hash.startsWith("#theme-")) {{
            const targetCard = document.querySelector(hash);
            if (targetCard) {{
                // Scroll the studio section into view immediately
                document.getElementById("studio-section").scrollIntoView({{ behavior: "auto" }});
                // Smoothly center the specific theme card inside the grid container
                setTimeout(() => {{
                    targetCard.scrollIntoView({{ behavior: "smooth", block: "center" }});
                    targetCard.style.outline = "2px dashed var(--accent)";
                    targetCard.style.outlineOffset = "4px";
                    setTimeout(() => {{
                        targetCard.style.outline = "";
                    }}, 2000);
                }}, 150);
            }}
        }}
    </script>
</body>
</html>"""

def embed_builder_theme_shell(html: str) -> str:
    if 'id="builder-theme-shell-template"' in html:
        return html
    shell_path = 'builder_theme_shell.html'
    try:
        with open(shell_path, 'r', encoding='utf-8') as shell_file:
            shell_html = shell_file.read()
    except OSError:
        return html
    template_block = (
        '    <template id="builder-theme-shell-template" hidden>\n'
        + shell_html
        + '\n    </template>\n\n'
    )
    marker = '\n<script>\n        const ALL_THEMES_DATA'
    if marker not in html:
        return html
    return html.replace(marker, '\n' + template_block + marker.lstrip('\n'), 1)


index_template = embed_builder_theme_shell(index_template)

with open("index.html", "w", encoding="utf-8") as index_out:
    index_out.write(index_template)
print("Generated: index.html dashboard successfully!")
