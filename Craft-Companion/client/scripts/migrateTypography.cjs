// scripts/migrateTypography.cjs — Floor tipográfico 11px + contraste (LP6)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');

const MAP = {
  'text-[8px]': 'text-[11px]',
  'text-[9px]': 'text-[11px]',
  'text-[10px]': 'text-[11px]',
  'text-slate-600': 'text-slate-400',
  'text-slate-500': 'text-slate-400',
  'text-zinc-600': 'text-zinc-400',
  'text-zinc-500': 'text-zinc-400',
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
          replCount += content.split(from).length - 1;
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
console.log(`LP6 typography: ${replCount} reemplazos en ${fileCount} archivos.`);
