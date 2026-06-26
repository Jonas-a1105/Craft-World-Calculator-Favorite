/* Craft World Dashboard Application Controller - Powered by anime.js */

// Emojis for each factory type to make it visually premium
const EMOJI_MAP = {
  "ACID": "🧪", "ALGAE": "🌿", "BOLTS": "🔩", "BONESOUP": "🍲", "BOWL": "🥣", 
  "BURGER": "🍔", "CEMENT": "🧱", "CERAMICKEY": "🔑", "CERAMICS": "🏺", "CLAY": "🧱", 
  "COPPER": "🪙", "DANGO": "🍡", "DUMPLING": "🥟", "DYNAMITE": "🧨", "DYNODESSERT": "🧁", 
  "DYNOKEY": "🗝️", "ENERGY": "⚡", "FIBERGLASS": "🧪", "FISHBONE": "🦴", "FUEL": "⛽", 
  "FUGU": "🐡", "GAS": "☁️", "GLASS": "🍷", "GLASSKEY": "🔑", "HEAT": "🔥", 
  "HYDROGEN": "🎈", "KEY": "🔑", "LAVA": "🌋", "LOBSTER": "🦞", "MEATBALL": "🧆", 
  "MUD": "🟫", "MYSTICWEAPON": "🔮", "NINJASTAR": "🌟", "OIL": "🛢️", "OXYGEN": "🫧", 
  "PANCAKE": "🥞", "PLASTICS": "🧬", "PLUNGER": "🪠", "RAWRMEN": "🍜", "RAWRVIOLI": "🥟", 
  "SAND": "⏳", "SASHIMI": "🍣", "SCREWS": "🔩", "SEAWATER": "🌊", "SPOON": "🥄", 
  "STEAM": "💨", "STEEL": "⚔️", "STONE": "🪨", "SULFUR": "🟡", "SUSHI": "🍣", 
  "SWORD": "⚔️", "TAPE": "🎗️", "TARGET": "🎯", "TOYHAMMER": "🔨", "WAGYU": "🥩"
};

// Classification helpers
const RAW_RESOURCES = ["EARTH", "WATER", "FIRE", "DYNOFISH", "MAGICSHARD", "BURNTRICE"];
const KEYS_RESOURCES = ["KEY", "GLASSKEY", "CERAMICKEY", "DYNOKEY"];

function getFactoryCategory(name) {
  if (KEYS_RESOURCES.includes(name)) return "keys";
  
  // Basic if it only requires raw resources
  const levels = FACTORIES_DATA[name];
  if (levels && levels.length > 0) {
    const firstLvl = levels[0];
    const inputs = [firstLvl.input1, firstLvl.input2].filter(Boolean);
    const onlyRaw = inputs.every(inp => RAW_RESOURCES.includes(inp));
    if (onlyRaw) return "basic";
  }
  
  return "crafted";
}

function getCategoryLabelSpan(category) {
  if (category === "basic") return '<span class="factory-type-badge bg-badge-basic">Recurso Base</span>';
  if (category === "keys") return '<span class="factory-type-badge bg-badge-keys">Llave / Especial</span>';
  return '<span class="factory-type-badge bg-badge-crafted">Crafteado</span>';
}

// Global state variables
let currentFactory = "MUD";
let currentLevel = 1;
let prevStats = { output: 0, durationSec: 0, power: 0, xp: 0, dailyOut: 0, dailyXp: 0, upgradeAmt: 0 };

document.addEventListener("DOMContentLoaded", () => {
  initAnimations();
  buildFactoriesList();
  selectFactory("MUD");
  
  // Set up event listeners
  document.getElementById("search-input").addEventListener("input", filterFactories);
  
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      filterFactories();
    });
  });

  const slider = document.getElementById("level-range");
  slider.addEventListener("input", (e) => {
    currentLevel = parseInt(e.target.value);
    updateLevelStats();
  });

  document.getElementById("calc-target-input").addEventListener("input", calculateTargetInsumos);
});

// App startup animations
function initAnimations() {
  // Title text animation (staggered character slide-up)
  anime.timeline()
    .add({
      targets: '.title-letters .char',
      translateY: [-30, 0],
      opacity: [0, 1],
      easing: "easeOutElastic(1.2, 0.6)",
      delay: anime.stagger(40),
      duration: 1000
    })
    .add({
      targets: '.subtitle',
      opacity: [0, 1],
      translateY: [-10, 0],
      easing: 'easeOutQuad',
      duration: 600
    }, '-=500');

  // Bento Grid cards animate in
  anime({
    targets: '.bento-card',
    opacity: [0, 1],
    translateY: [40, 0],
    scale: [0.95, 1],
    easing: 'spring(1, 80, 12, 0)',
    delay: anime.stagger(80)
  });
}

// Build list of factories in Left Panel
function buildFactoriesList() {
  const container = document.getElementById("factories-container");
  container.innerHTML = "";
  
  const sortedNames = Object.keys(FACTORIES_DATA).sort();
  document.getElementById("factories-count").textContent = sortedNames.length;
  
  sortedNames.forEach(name => {
    const data = FACTORIES_DATA[name];
    const category = getFactoryCategory(name);
    const emoji = EMOJI_MAP[name] || "🏭";
    
    const div = document.createElement("div");
    div.className = `factory-item`;
    div.dataset.name = name;
    div.dataset.category = category;
    
    div.innerHTML = `
      <div class="item-left">
        <span class="item-icon">${emoji}</span>
        <div>
          <span class="item-name">${name}</span>
          <div class="item-level">${data.length} niveles</div>
        </div>
      </div>
      <span class="badge ${category === 'basic' ? 'bg-badge-basic' : category === 'keys' ? 'bg-badge-keys' : 'bg-badge-crafted'}">
        ${category === 'basic' ? 'Base' : category === 'keys' ? 'Llave' : 'Craft'}
      </span>
    `;
    
    div.addEventListener("click", () => selectFactory(name));
    container.appendChild(div);
  });
}

// Select a factory and show details
function selectFactory(name) {
  if (!FACTORIES_DATA[name]) return;
  
  currentFactory = name;
  currentLevel = 1;
  
  // Highlight active item
  const items = document.querySelectorAll(".factory-item");
  items.forEach(item => {
    if (item.dataset.name === name) {
      item.classList.add("active");
      // Scroll into view gently
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      item.classList.remove("active");
    }
  });
  
  // Load levels details
  const levels = FACTORIES_DATA[name];
  const maxLvl = levels.length;
  
  // Update slider configuration
  const slider = document.getElementById("level-range");
  slider.max = maxLvl;
  slider.value = 1;
  document.getElementById("max-level-label").textContent = `Lvl ${maxLvl}`;
  
  // Update header details of the factory card
  const category = getFactoryCategory(name);
  document.getElementById("det-name").textContent = name;
  document.getElementById("det-type").innerHTML = getCategoryLabelSpan(category);
  document.getElementById("det-max-level").textContent = maxLvl;
  document.getElementById("factory-icon").textContent = EMOJI_MAP[name] || "🏭";
  
  // Reset prevStats to animate from 0 for new factory
  prevStats = { output: 0, durationSec: 0, power: 0, xp: 0, dailyOut: 0, dailyXp: 0, upgradeAmt: 0 };
  
  // Animate change of details card content
  anime({
    targets: '#card-details',
    scale: [0.98, 1],
    duration: 300,
    easing: 'easeOutQuad'
  });
  
  updateLevelStats();
  renderProgressionChart();
  updateRelationsPanel();
}

// Update stats for the currently selected level of factory
function updateLevelStats() {
  const levels = FACTORIES_DATA[currentFactory];
  const index = currentLevel - 1;
  if (index < 0 || index >= levels.length) return;
  
  const data = levels[index];
  
  // Update Level display badge
  document.getElementById("level-display").textContent = currentLevel;
  
  // Insumos list updating
  const inputsContainer = document.getElementById("det-inputs-list");
  inputsContainer.innerHTML = "";
  
  const inputs = [];
  if (data.input1) inputs.push({ name: data.input1, amount: data.input1_amt });
  if (data.input2) inputs.push({ name: data.input2, amount: data.input2_amt });
  
  if (inputs.length === 0) {
    inputsContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">Sin insumos (Entrada libre)</span>';
  } else {
    inputs.forEach(inp => {
      const emoji = EMOJI_MAP[inp.name] || "📦";
      const span = document.createElement("div");
      span.className = "input-badge";
      span.innerHTML = `
        <span class="input-badge-name">${emoji} ${inp.name}</span>
        <span class="input-badge-amt">${inp.amount.toLocaleString('es-ES')}</span>
      `;
      inputsContainer.appendChild(span);
    });
  }
  
  // Upgrades Box update
  const upgradeBox = document.getElementById("upgrade-box");
  if (data.cost_symbol && data.cost_amount > 0) {
    upgradeBox.style.display = "flex";
    document.getElementById("upgrade-symbol").textContent = data.cost_symbol;
    
    // Animate Upgrade cost number
    animateNumber("#upgrade-amount", prevStats.upgradeAmt, data.cost_amount);
    prevStats.upgradeAmt = data.cost_amount;
  } else {
    upgradeBox.style.display = "none";
  }
  
  // Base energy update
  document.getElementById("det-base-power").textContent = `${levels[0].power_cost} W`;
  
  // Animate dynamic stats counters
  animateNumber("#stat-output", prevStats.output, data.output);
  animateNumber("#stat-power", prevStats.power, data.power_cost);
  animateNumber("#stat-xp", prevStats.xp, data.xp_per_output);
  animateNumber("#calc-daily-out", prevStats.dailyOut, Math.round(data.production_per_day));
  animateNumber("#calc-daily-xp", prevStats.dailyXp, Math.round(data.xp_per_day));
  
  // For duration, animate duration seconds counter and format text
  animateNumberFunc(prevStats.durationSec, data.duration_sec, (val) => {
    document.getElementById("stat-duration-sec").textContent = `${Math.round(val)} segundos`;
  });
  document.getElementById("stat-duration").textContent = data.duration;
  
  // Save previous stats
  prevStats.output = data.output;
  prevStats.power = data.power_cost;
  prevStats.xp = data.xp_per_output;
  prevStats.durationSec = data.duration_sec;
  prevStats.dailyOut = Math.round(data.production_per_day);
  prevStats.dailyXp = Math.round(data.xp_per_day);
  
  // Recalculate daily inputs targets
  calculateTargetInsumos();
}

// Anime.js number animator helper
function animateNumber(targetId, fromVal, toVal) {
  const obj = { val: fromVal };
  anime({
    targets: obj,
    val: toVal,
    round: 1,
    duration: 600,
    easing: 'easeOutQuad',
    update: () => {
      document.querySelector(targetId).textContent = obj.val.toLocaleString('es-ES');
    }
  });
}

function animateNumberFunc(fromVal, toVal, updateFn) {
  const obj = { val: fromVal };
  anime({
    targets: obj,
    val: toVal,
    duration: 600,
    easing: 'easeOutQuad',
    update: () => {
      updateFn(obj.val);
    }
  });
}

// Filter and Search factories in left list
function filterFactories() {
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
  const items = document.querySelectorAll(".factory-item");
  
  let visibleCount = 0;
  
  items.forEach(item => {
    const name = item.dataset.name;
    const category = item.dataset.category;
    
    // Check if name or inputs match search query
    const levels = FACTORIES_DATA[name];
    const firstLvl = levels[0];
    const inputsStr = [firstLvl.input1, firstLvl.input2].filter(Boolean).join(" ").toLowerCase();
    
    const matchesQuery = name.toLowerCase().includes(query) || inputsStr.includes(query);
    const matchesFilter = activeFilter === "all" || category === activeFilter;
    
    if (matchesQuery && matchesFilter) {
      item.style.display = "flex";
      visibleCount++;
    } else {
      item.style.display = "none";
    }
  });
  
  document.getElementById("factories-count").textContent = visibleCount;
  
  // Animate the list items showing up
  anime({
    targets: '.factory-item[style="display: flex;"]',
    opacity: [0, 1],
    scale: [0.95, 1],
    translateY: [10, 0],
    delay: anime.stagger(15),
    duration: 300,
    easing: 'easeOutQuad'
  });
}

// Render dynamic progression SVG chart using SVG dash drawing animation
function renderProgressionChart() {
  const levels = FACTORIES_DATA[currentFactory];
  const maxLvl = levels.length;
  
  const gridLinesContainer = document.getElementById("svg-grid-lines");
  const pointsContainer = document.getElementById("svg-points");
  
  gridLinesContainer.innerHTML = "";
  pointsContainer.innerHTML = "";
  
  if (maxLvl <= 1) {
    document.getElementById("svg-path-output").setAttribute("d", "");
    document.getElementById("svg-path-duration").setAttribute("d", "");
    return;
  }
  
  // Find min/max values for scaling
  const maxOutput = Math.max(...levels.map(l => l.output));
  const minOutput = Math.min(...levels.map(l => l.output));
  
  const maxDuration = Math.max(...levels.map(l => l.duration_sec));
  const minDuration = Math.min(...levels.map(l => l.duration_sec));
  
  // Chart dimensions (viewBox is 0 0 500 220)
  const paddingX = 40;
  const paddingY = 20;
  const width = 500 - paddingX * 2;
  const height = 220 - paddingY * 2;
  
  // Draw grid lines (horizontal and vertical)
  const gridCols = Math.min(5, maxLvl);
  for (let i = 0; i < gridCols; i++) {
    const x = paddingX + (width / (gridCols - 1)) * i;
    const levelVal = Math.round(1 + ((maxLvl - 1) / (gridCols - 1)) * i);
    
    // Vertical line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x);
    line.setAttribute("y1", paddingY);
    line.setAttribute("x2", x);
    line.setAttribute("y2", paddingY + height);
    line.setAttribute("class", "grid-line");
    gridLinesContainer.appendChild(line);
    
    // Label level
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", x);
    txt.setAttribute("y", paddingY + height + 12);
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("class", "grid-label");
    txt.textContent = `Lvl ${levelVal}`;
    gridLinesContainer.appendChild(txt);
  }
  
  // Build path strings
  let outputD = "";
  let durationD = "";
  
  levels.forEach((l, idx) => {
    const x = paddingX + (width / (maxLvl - 1)) * idx;
    
    // Scale Output (Y rises up, so height - scaledVal)
    const outRange = maxOutput - minOutput || 1;
    const outY = paddingY + height - ((l.output - minOutput) / outRange) * height;
    
    // Scale Duration
    const durRange = maxDuration - minDuration || 1;
    const durY = paddingY + height - ((l.duration_sec - minDuration) / durRange) * height;
    
    if (idx === 0) {
      outputD = `M ${x} ${outY}`;
      durationD = `M ${x} ${durY}`;
    } else {
      outputD += ` L ${x} ${outY}`;
      durationD += ` L ${x} ${durY}`;
    }
    
    // Create points for hovering/clicking (only for important levels or small lists)
    if (maxLvl <= 15 || idx === 0 || idx === maxLvl - 1 || idx === Math.floor(maxLvl / 2)) {
      // Point Output
      const circOut = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circOut.setAttribute("cx", x);
      circOut.setAttribute("cy", outY);
      circOut.setAttribute("r", 4);
      circOut.setAttribute("class", "chart-point point-out");
      circOut.innerHTML = `<title>Nivel ${l.level}: ${l.output} unidades</title>`;
      circOut.addEventListener("click", () => {
        document.getElementById("level-range").value = l.level;
        currentLevel = l.level;
        updateLevelStats();
      });
      pointsContainer.appendChild(circOut);
      
      // Point Duration
      const circDur = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circDur.setAttribute("cx", x);
      circDur.setAttribute("cy", durY);
      circDur.setAttribute("r", 4);
      circDur.setAttribute("class", "chart-point point-dur");
      circDur.innerHTML = `<title>Nivel ${l.level}: ${l.duration}</title>`;
      circDur.addEventListener("click", () => {
        document.getElementById("level-range").value = l.level;
        currentLevel = l.level;
        updateLevelStats();
      });
      pointsContainer.appendChild(circDur);
    }
  });
  
  // Set paths attributes
  const outPath = document.getElementById("svg-path-output");
  const durPath = document.getElementById("svg-path-duration");
  
  outPath.setAttribute("d", outputD);
  durPath.setAttribute("d", durationD);
  
  // Anime.js Line Drawing Animation
  animatePathDrawing(outPath);
  animatePathDrawing(durPath);
}

function animatePathDrawing(pathEl) {
  const length = pathEl.getTotalLength();
  pathEl.setAttribute("stroke-dasharray", length);
  
  anime({
    targets: pathEl,
    strokeDashoffset: [length, 0],
    easing: 'easeOutCubic',
    duration: 1000
  });
}

// Daily target calculator
function calculateTargetInsumos() {
  const targetVal = parseFloat(document.getElementById("calc-target-input").value) || 0;
  const container = document.getElementById("calc-results-container");
  container.innerHTML = "";
  
  const levels = FACTORIES_DATA[currentFactory];
  const data = levels[currentLevel - 1];
  
  if (targetVal <= 0 || !data) {
    container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">Ingresa una meta diaria para calcular</span>';
    return;
  }
  
  const inputs = [];
  if (data.input1) inputs.push({ name: data.input1, amount: data.input1_amt });
  if (data.input2) inputs.push({ name: data.input2, amount: data.input2_amt });
  
  if (inputs.length === 0) {
    container.innerHTML = '<span style="color: var(--color-green); font-weight: 500; font-size: 0.95rem;">✨ Esta fábrica es autónoma. ¡No requiere insumos diarios!</span>';
    return;
  }
  
  // Calculate daily cycles and factors
  const dailyCycles = data.production_per_day / data.output;
  const totalCyclesRequired = targetVal / data.output;
  
  inputs.forEach(inp => {
    // Total input amount required to make targetVal units
    const totalRequired = totalCyclesRequired * inp.amount;
    const emoji = EMOJI_MAP[inp.name] || "📦";
    
    const div = document.createElement("div");
    div.className = "calc-res-item";
    div.innerHTML = `
      <span class="calc-res-name">${emoji} ${inp.name}</span>
      <span class="calc-res-amt" data-val="${totalRequired}">${Math.round(totalRequired).toLocaleString('es-ES')} unidades</span>
    `;
    container.appendChild(div);
  });
  
  // Anime.js calculator results stagger slide-in
  anime({
    targets: '.calc-res-item',
    opacity: [0, 1],
    translateX: [-20, 0],
    easing: 'easeOutQuad',
    duration: 400,
    delay: anime.stagger(50)
  });
}

// Update dependency relations explorer
function updateRelationsPanel() {
  document.getElementById("rel-current").textContent = `${EMOJI_MAP[currentFactory] || "🏭"} ${currentFactory}`;
  
  // Find parents (materials required by currentFactory)
  const parentsContainer = document.getElementById("rel-parents");
  parentsContainer.innerHTML = "";
  
  const firstLvl = FACTORIES_DATA[currentFactory][0];
  const parents = [firstLvl.input1, firstLvl.input2].filter(Boolean);
  
  if (parents.length === 0) {
    parentsContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Sin dependencias</span>';
  } else {
    parents.forEach(p => {
      const isFactory = FACTORIES_DATA[p] !== undefined;
      const div = document.createElement("div");
      div.className = "relation-item-node";
      div.innerHTML = `${EMOJI_MAP[p] || "📦"} ${p} ${isFactory ? '' : '<br><small>(Base)</small>'}`;
      if (isFactory) {
        div.addEventListener("click", () => selectFactory(p));
      } else {
        div.style.cursor = "default";
        div.style.borderColor = "var(--text-muted)";
        div.style.color = "var(--text-muted)";
      }
      parentsContainer.appendChild(div);
    });
  }
  
  // Find children (factories that require currentFactory as input)
  const childrenContainer = document.getElementById("rel-children");
  childrenContainer.innerHTML = "";
  
  const children = [];
  Object.keys(FACTORIES_DATA).forEach(name => {
    if (name === currentFactory) return;
    const lvl = FACTORIES_DATA[name][0];
    if (lvl.input1 === currentFactory || lvl.input2 === currentFactory) {
      children.push(name);
    }
  });
  
  if (children.length === 0) {
    childrenContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Ninguna fábrica lo usa</span>';
  } else {
    children.forEach(c => {
      const div = document.createElement("div");
      div.className = "relation-item-node";
      div.innerHTML = `${EMOJI_MAP[c] || "🏭"} ${c}`;
      div.addEventListener("click", () => selectFactory(c));
      childrenContainer.appendChild(div);
    });
  }
  
  // Relations slide animation
  anime({
    targets: '.relation-item-node',
    scale: [0.85, 1],
    opacity: [0, 1],
    delay: anime.stagger(40),
    easing: 'easeOutQuad',
    duration: 300
  });
}
