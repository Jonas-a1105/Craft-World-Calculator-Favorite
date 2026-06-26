(function () {
  'use strict';

  let CONFIG;
  let provider;
  let multicallContract;
  let gameInterface;
  let countdownInterval;

  const CACHE_KEY = 'craftWorldFactoryCache';
  const CACHE_META_KEY = 'craftWorldCacheMeta';
  const CACHE_DURATION = 5 * 60 * 1000;

  const DOM = {};

  async function loadConfig() {
    const res = await fetch(chrome.runtime.getURL('juegoABI.json'));
    CONFIG = await res.json();
    provider = new ethers.JsonRpcProvider(CONFIG.roninRpc, CONFIG.chainId, { static: true });
    const multicallAbi = [
      {
        type: 'function',
        name: 'aggregate3',
        inputs: [
          {
            type: 'tuple[]',
            components: [
              { name: 'target', type: 'address' },
              { name: 'allowFailure', type: 'bool' },
              { name: 'callData', type: 'bytes' }
            ]
          }
        ],
        outputs: [
          {
            type: 'tuple[]',
            components: [
              { name: 'success', type: 'bool' },
              { name: 'returnData', type: 'bytes' }
            ]
          }
        ],
        stateMutability: 'view'
      }
    ];
    multicallContract = new ethers.Contract(CONFIG.multicall3Address, multicallAbi, provider);
    gameInterface = new ethers.Interface(CONFIG.abi);
  }

  function cache() {
    return chrome.storage.local;
  }

  function showElement(el) {
    el.classList.remove('hidden');
  }

  function hideElement(el) {
    el.classList.add('hidden');
  }

  function showLoading() {
    hideElement(DOM.emptyState);
    hideElement(DOM.factoryList);
    showElement(DOM.loadingState);
  }

  function showEmpty() {
    hideElement(DOM.loadingState);
    hideElement(DOM.factoryList);
    showElement(DOM.emptyState);
  }

  function showStatus(type, msg) {
    DOM.statusBar.textContent = msg;
    DOM.statusBar.className = 'status-bar ' + type;
    showElement(DOM.statusBar);
    clearTimeout(DOM.statusBar._timer);
    DOM.statusBar._timer = setTimeout(() => hideElement(DOM.statusBar), 4000);
  }

  function hideStatus() {
    hideElement(DOM.statusBar);
    clearTimeout(DOM.statusBar._timer);
  }

  function namehash(name) {
    let node = ethers.ZeroHash;
    if (name) {
      const labels = name.toLowerCase().split('.');
      for (let i = labels.length - 1; i >= 0; i--) {
        const labelHash = ethers.keccak256(ethers.toUtf8Bytes(labels[i]));
        node = ethers.keccak256(ethers.concat([ethers.getBytes(node), ethers.getBytes(labelHash)]));
      }
    }
    return node;
  }

  async function resolveRNS(name) {
    const cleanName = name.trim().toLowerCase();
    if (ethers.isAddress(cleanName)) {
      return ethers.getAddress(cleanName);
    }

    const registryAbi = ['function resolver(bytes32 node) view returns (address)'];
    const resolverAbi = ['function addr(bytes32 node) view returns (address)'];
    const registry = new ethers.Contract(CONFIG.rnsRegistry, registryAbi, provider);

    const node = namehash(cleanName);
    let resolverAddress = ethers.ZeroAddress;

    try {
      resolverAddress = await registry.resolver(node);
    } catch (_) { }

    if (resolverAddress === ethers.ZeroAddress) {
      resolverAddress = CONFIG.rnsResolver;
    }

    const resolver = new ethers.Contract(resolverAddress, resolverAbi, provider);
    const addr = await resolver.addr(node);

    if (addr === ethers.ZeroAddress) {
      throw new Error('Nombre .ronin no resuelto');
    }
    return ethers.getAddress(addr);
  }

  function getFactorySymbol(id) {
    return CONFIG.factoryIdToSymbol[id.toString()] || 'ID_' + id;
  }

  async function fetchFactoryData(address) {
    const maxId = CONFIG.maxFactoryId;
    const calls = [];
    const funcName = CONFIG.functions.getFactoryLevel.split('(')[0].trim();

    for (let id = 1; id <= maxId; id++) {
      calls.push({
        target: CONFIG.contractAddress,
        allowFailure: true,
        callData: gameInterface.encodeFunctionData(funcName, [address, id])
      });
    }

    const results = await multicallContract.aggregate3(calls);
    const factories = [];

    for (let i = 0; i < maxId; i++) {
      const id = i + 1;
      const res = results[i];
      let level = 0;

      if (res.success && res.returnData !== '0x') {
        try {
          const decoded = gameInterface.decodeFunctionResult(funcName, res.returnData);
          level = Number(decoded[0]);
        } catch (_) { }
      }

      factories.push({
        id: id,
        symbol: getFactorySymbol(id),
        level: level,
        active: level > 0
      });
    }

    return factories;
  }

  function renderFactories(factories) {
    hideElement(DOM.loadingState);
    hideElement(DOM.emptyState);

    const owned = factories.filter(f => f.active);
    const display = owned.length > 0 ? owned : factories;
    const isOwnedFilter = owned.length > 0;

    let html = '<div class="factory-header"><span>Fábrica</span><span>Nivel</span></div>';
    html += display.map(f => {
      const cls = f.active ? 'factory-card active' : 'factory-card inactive';
      const levelStr = f.active ? String(f.level) : '--';
      const meta = isOwnedFilter ? 'ID ' + f.id : 'No poseída';
      return `<div class="${cls}">
        <div class="factory-id">${f.id}</div>
        <div class="factory-info">
          <div class="factory-symbol">${f.symbol}</div>
          <div class="factory-meta">${meta}</div>
        </div>
        <div class="factory-level">
          <span class="level-number">${levelStr}</span>
          <span class="level-label">Nivel</span>
        </div>
      </div>`;
    }).join('');

    DOM.factoryList.innerHTML = html;
    showElement(DOM.factoryList);
  }

  function startCooldown(ms) {
    showElement(DOM.cooldownBar);
    DOM.updateBtn.disabled = true;
    DOM.updateBtn.textContent = 'Esperar';

    clearInterval(countdownInterval);

    function tick() {
      const remaining = Math.max(0, ms);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      DOM.countdown.textContent = minutes + ':' + String(seconds).padStart(2, '0');

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        hideElement(DOM.cooldownBar);
        DOM.updateBtn.disabled = false;
        DOM.updateBtn.textContent = 'Actualizar';
      }
    }

    tick();
    const start = Date.now();

    countdownInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = CACHE_DURATION - elapsed;
      if (remaining <= 0) {
        ms = 0;
        tick();
      } else {
        ms = remaining;
        tick();
      }
    }, 200);
  }

  async function checkCache() {
    try {
      const data = await cache().get([CACHE_KEY, CACHE_META_KEY]);
      if (data[CACHE_KEY] && data[CACHE_META_KEY]) {
        const elapsed = Date.now() - data[CACHE_META_KEY].timestamp;
        if (elapsed < CACHE_DURATION) {
          renderFactories(data[CACHE_KEY]);
          startCooldown(CACHE_DURATION - elapsed);
          if (data[CACHE_META_KEY].addressDisplay) {
            DOM.walletInput.value = data[CACHE_META_KEY].addressDisplay;
          }
          return true;
        }
      }
    } catch (_) { }
    return false;
  }

  async function handleUpdate() {
    const input = DOM.walletInput.value.trim();
    if (!input) return;

    hideStatus();
    DOM.updateBtn.disabled = true;
    DOM.updateBtn.textContent = 'Consultando...';
    showLoading();

    try {
      const address = await resolveRNS(input);
      const factories = await fetchFactoryData(address);

      await cache().set({
        [CACHE_KEY]: factories,
        [CACHE_META_KEY]: {
          timestamp: Date.now(),
          address: address,
          addressDisplay: input
        }
      });

      renderFactories(factories);
      startCooldown(CACHE_DURATION);
      showStatus('success', 'Datos actualizados');
    } catch (err) {
      showEmpty();
      if (input.endsWith('.ronin')) {
        showStatus('error', 'Error: ' + err.message);
      } else {
        showStatus('error', 'Error: ' + err.message);
      }
      DOM.updateBtn.disabled = false;
      DOM.updateBtn.textContent = 'Actualizar';
    }
  }

  async function init() {
    DOM.walletInput = document.getElementById('walletInput');
    DOM.updateBtn = document.getElementById('updateBtn');
    DOM.results = document.getElementById('results');
    DOM.statusBar = document.getElementById('statusBar');
    DOM.cooldownBar = document.getElementById('cooldownBar');
    DOM.countdown = document.getElementById('countdown');
    DOM.emptyState = document.getElementById('emptyState');
    DOM.loadingState = document.getElementById('loadingState');
    DOM.factoryList = document.getElementById('factoryList');

    await loadConfig();

    const prev = await cache().get(['lastAddress']);
    if (prev.lastAddress) {
      DOM.walletInput.value = prev.lastAddress;
    }

    const hasCache = await checkCache();
    if (!hasCache) {
      showEmpty();
    }

    DOM.updateBtn.addEventListener('click', handleUpdate);
    DOM.walletInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUpdate();
    });
    DOM.walletInput.addEventListener('input', () => {
      hideStatus();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
