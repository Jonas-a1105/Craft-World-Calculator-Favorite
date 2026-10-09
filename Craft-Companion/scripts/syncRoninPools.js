/**
 * Automated ETL Pipeline for Ronin Pools (Katana DEX Market Data)
 * Source: https://docs.google.com/spreadsheets/d/1Vc-kQFi2cPaKj6IbG_FI78V6oDqdNKfRUXdXIzoirc0/
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1Vc-kQFi2cPaKj6IbG_FI78V6oDqdNKfRUXdXIzoirc0';

const GIDS = {
  price1d: '541589947',
  price7d: '498020300',
  price30d: '1204807989',
  liq1d: '534843817',
  coin1d: '1690360280'
};

function fetchCsv(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  return execSync(`curl.exe -s -L "${url}"`, { maxBuffer: 15 * 1024 * 1024 }).toString('utf8');
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const next = line[i + 1];
    if (c === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  result.push(cur);
  return result;
}

function parseNum(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[$,]/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parsePriceContent(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 10) return null;

  // Line index 2 is SYMBOL
  const symbolLine = parseCsvLine(lines[2]);
  const symbols = [];
  for (let col = 1; col < symbolLine.length; col++) {
    const s = symbolLine[col].trim();
    if (s) symbols.push({ col, symbol: s });
  }

  const avgLine = parseCsvLine(lines[3]);
  const medLine = parseCsvLine(lines[4]);
  const athLine = parseCsvLine(lines[5]);
  const atlLine = parseCsvLine(lines[6]);

  const stats = {};
  symbols.forEach(({ col, symbol }) => {
    stats[symbol] = {
      average: parseNum(avgLine[col]),
      median: parseNum(medLine[col]),
      ath: parseNum(athLine[col]),
      atl: parseNum(atlLine[col]),
      history: []
    };
  });

  // Data rows start from line 10 (index 9)
  for (let r = 9; r < lines.length; r++) {
    const row = parseCsvLine(lines[r]);
    const dt = (row[0] || '').trim();
    if (!dt) continue;
    symbols.forEach(({ col, symbol }) => {
      const val = parseNum(row[col]);
      if (stats[symbol]) {
        stats[symbol].history.push({
          timestamp: dt,
          price: val
        });
      }
    });
  }

  // Reverse history so it is chronological (oldest to newest)
  Object.keys(stats).forEach(sym => {
    stats[sym].history.reverse();
  });

  return { symbols: symbols.map(s => s.symbol), stats };
}

function parseLiqContent(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 7) return {};

  const symbolLine = parseCsvLine(lines[2]);
  const symbols = [];
  for (let col = 1; col < symbolLine.length; col++) {
    const s = symbolLine[col].trim();
    if (s) symbols.push({ col, symbol: s });
  }

  const avgLine = parseCsvLine(lines[3]);
  const medLine = parseCsvLine(lines[4]);
  const athLine = parseCsvLine(lines[5]);
  const atlLine = parseCsvLine(lines[6]);

  const liq = {};
  symbols.forEach(({ col, symbol }) => {
    liq[symbol] = {
      average: parseNum(avgLine[col]),
      median: parseNum(medLine[col]),
      ath: parseNum(athLine[col]),
      atl: parseNum(atlLine[col]),
    };
  });
  return liq;
}

function parseCoinContent(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 7) return {};

  const symbolLine = parseCsvLine(lines[2]);
  const symbols = [];
  for (let col = 1; col < symbolLine.length; col++) {
    const s = symbolLine[col].trim();
    if (s) symbols.push({ col, symbol: s });
  }

  const avgLine = parseCsvLine(lines[3]);
  const medLine = parseCsvLine(lines[4]);
  const athLine = parseCsvLine(lines[5]);
  const atlLine = parseCsvLine(lines[6]);

  const coinRates = {};
  symbols.forEach(({ col, symbol }) => {
    coinRates[symbol] = {
      average: parseNum(avgLine[col]),
      median: parseNum(medLine[col]),
      ath: parseNum(athLine[col]),
      atl: parseNum(atlLine[col]),
    };
  });
  return coinRates;
}

function run() {
  console.log('Fetching 1d Price from Google Sheets...');
  const csv1d = fetchCsv(GIDS.price1d);
  const data1d = parsePriceContent(csv1d);
  console.log('Found', data1d.symbols.length, 'symbols in 1d Price.');

  console.log('Fetching 7d Price from Google Sheets...');
  const csv7d = fetchCsv(GIDS.price7d);
  const data7d = parsePriceContent(csv7d);

  console.log('Fetching 30d Price from Google Sheets...');
  const csv30d = fetchCsv(GIDS.price30d);
  const data30d = parsePriceContent(csv30d);

  console.log('Fetching 1d Liquidity from Google Sheets...');
  const csvLiq1d = fetchCsv(GIDS.liq1d);
  const liq1d = parseLiqContent(csvLiq1d);

  console.log('Fetching 1d Coin Rate from Google Sheets...');
  const csvCoin1d = fetchCsv(GIDS.coin1d);
  const coin1d = parseCoinContent(csvCoin1d);

  const consolidated = {
    updatedAt: new Date().toISOString(),
    resourceCount: data1d.symbols.length,
    resources: {}
  };

  data1d.symbols.forEach(symbol => {
    const s1 = data1d.stats[symbol] || {};
    const s7 = data7d ? (data7d.stats[symbol] || {}) : {};
    const s30 = data30d ? (data30d.stats[symbol] || {}) : {};
    const l1 = liq1d[symbol] || {};
    const c1 = coin1d[symbol] || {};

    consolidated.resources[symbol] = {
      symbol,
      price1d: {
        average: s1.average || 0,
        median: s1.median || 0,
        ath: s1.ath || 0,
        atl: s1.atl || 0,
        history: s1.history || []
      },
      price7d: {
        average: s7.average || 0,
        median: s7.median || 0,
        ath: s7.ath || 0,
        atl: s7.atl || 0,
        history: (s7.history || []).filter((_, idx, arr) => {
          if (arr.length <= 35) return true;
          const step = Math.ceil(arr.length / 32);
          return idx % step === 0 || idx === arr.length - 1;
        })
      },
      price30d: {
        average: s30.average || 0,
        median: s30.median || 0,
        ath: s30.ath || 0,
        atl: s30.atl || 0,
        history: (s30.history || []).filter((_, idx, arr) => {
          if (arr.length <= 35) return true;
          const step = Math.ceil(arr.length / 32);
          return idx % step === 0 || idx === arr.length - 1;
        })
      },
      liquidity: {
        average: l1.average || 0,
        median: l1.median || 0,
        ath: l1.ath || 0,
        atl: l1.atl || 0
      },
      coinRate: {
        average: c1.average || 0,
        median: c1.median || 0,
        ath: c1.ath || 0,
        atl: c1.atl || 0
      }
    };
  });

  const outPath = path.join(__dirname, '..', 'client', 'public', 'data', 'ronin_pools.json');
  fs.writeFileSync(outPath, JSON.stringify(consolidated));
  console.log('Successfully wrote', outPath, `(${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

run();
