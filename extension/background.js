chrome.runtime.onInstalled.addListener(() => {
  console.log('[Craft World Tracker] Extensión instalada/actualizada.');
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cacheCleanup') {
    chrome.storage.local.get(['craftWorldCacheMeta'], (data) => {
      if (data.craftWorldCacheMeta) {
        const elapsed = Date.now() - data.craftWorldCacheMeta.timestamp;
        if (elapsed >= 5 * 60 * 1000) {
          chrome.storage.local.remove(['craftWorldFactoryCache', 'craftWorldCacheMeta'], () => {
            console.log('[Craft World Tracker] Caché expirada eliminada.');
          });
        }
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLEAR_CACHE') {
    chrome.storage.local.remove(['craftWorldFactoryCache', 'craftWorldCacheMeta'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
