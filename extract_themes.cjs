const fs = require('fs');

const content = fs.readFileSync('chromaverse/generate_themes.py', 'utf8');

function parseList(varName) {
  const regex = new RegExp(varName + '\\s*=\\s*\\[');
  const match = content.match(regex);
  if (!match) {
    console.error(`Could not find declaration for ${varName}`);
    return [];
  }
  const openBracketIdx = match.index + match[0].length - 1;
  return parseBlockFrom(openBracketIdx);
}

function parseBlockFrom(openBracketIdx) {
  let depth = 0;
  let endIdx = -1;
  let inString = false;
  let quoteChar = '';

  for (let i = openBracketIdx; i < content.length; i++) {
    const c = content[i];
    if ((c === '"' || c === "'") && content[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        quoteChar = c;
      } else if (c === quoteChar) {
        inString = false;
      }
    }
    if (!inString) {
      if (c === '[') {
        depth++;
      } else if (c === ']') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
  }

  if (endIdx === -1) {
    throw new Error("Could not find matching bracket");
  }

  const rawText = content.substring(openBracketIdx, endIdx);
  return eval(rawText);
}

try {
  const list1 = parseList('themes');
  const list2 = parseList('remaining_themes_data');
  const list3 = parseList('more_themes_data');

  const allThemes = [...list1, ...list2, ...list3];

  const outputThemes = allThemes.map(t => {
    const accents = t.accents || [];
    const darkBg = (t.dark && t.dark.bg) || '#000000';
    
    const c0 = darkBg;
    const c1 = accents[2] || accents[0] || '#ffffff';
    const c2 = accents[0] || '#ffffff';
    const c3 = accents[3] || '#ffffff';
    
    return {
      name: t.name,
      slug: t.slug,
      colors: [c0, c1, c2, c3]
    };
  });

  const tsContent = `// ─────────────────────────────────────────────────────────
//  Chromaverse Themes — 65+ auto-extracted design system palettes
// ─────────────────────────────────────────────────────────

export interface ChromaverseTheme {
  name: string;
  slug: string;
  colors: [string, string, string, string];
}

export const CHROMAVERSE_THEMES: ChromaverseTheme[] = ${JSON.stringify(outputThemes, null, 2)};
`;

  fs.writeFileSync('src/studio/chromaverse_themes.ts', tsContent);
  console.log(`Extracted ${outputThemes.length} themes successfully!`);
} catch (err) {
  console.error("Error during extraction:", err);
  process.exit(1);
}
