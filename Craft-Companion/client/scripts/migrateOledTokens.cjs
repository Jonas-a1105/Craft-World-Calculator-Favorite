// Scripts/../scripts/migrateOledTokens.cjs — Migra hexes hardcodeados a tokens OLED (LP1)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');

// Mapeo conservador: bg-*/hover:bg-* exactos → tokens oled.* definidos en tailwind.config.js
const MAP = {
  'bg-[#141415]': 'bg-oled-canvas',
  'bg-[#18181c]': 'bg-oled-card',
  'bg-[#18181b]': 'bg-oled-card',
  'bg-[#141416]': 'bg-oled-cardInner',
  'bg-[#141417]': 'bg-oled-cardInner',
  'bg-[#131316]': 'bg-oled-cardInner',
  'bg-[#151518]': 'bg-oled-cardInner',
  'bg-[#161618]': 'bg-oled-cardInner',
  'bg-[#121215]': 'bg-oled-cardInner',
  'bg-[#1c1c20]': 'bg-oled-850',
  'bg-[#1c1c21]': 'bg-oled-850',
  'bg-[#1c1c22]': 'bg-oled-850',
  'bg-[#1c1d24]': 'bg-oled-850',
  'bg-[#1a1a1e]': 'bg-oled-850',
  'bg-[#202024]': 'bg-oled-pill',
  'bg-[#222226]': 'bg-oled-pill',
  'bg-[#222228]': 'bg-oled-pill',
  'bg-[#22222a]': 'bg-oled-pill',
  'bg-[#232329]': 'bg-oled-pill',
  'bg-[#24242a]': 'bg-oled-pill',
  'bg-[#24252e]': 'bg-oled-pill',
  'bg-[#27272a]': 'bg-oled-pill',
  'bg-[#27272e]': 'bg-oled-pill',
  'bg-[#282932]': 'bg-oled-pill',
  'hover:bg-[#18181c]': 'hover:bg-oled-pill',
  'hover:bg-[#202026]': 'hover:bg-oled-pillHover',
  'hover:bg-[#2d2f3a]': 'hover:bg-oled-pillHover',
  'hover:bg-[#2e303a]': 'hover:bg-oled-pillHover',
  'hover:bg-[#2c2c36]': 'hover:bg-oled-pillHover',
  'hover:bg-[#32323a]': 'hover:bg-oled-pillHover',
  'hover:bg-[#313139]': 'hover:bg-oled-pillHover',
};

let fileCount = 0;
let replCount = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(full);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.test.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [from, to] of Object.entries(MAP)) {
        if (content.includes(from)) {
          const occurrences = content.split(from).length - 1;
          replCount += occurrences;
          content = content.split(from).join(to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        fileCount++;
      }
    }
  }
}

walk(root);
console.log(`LP1 tokens: ${replCount} reemplazos en ${fileCount} archivos.`);
