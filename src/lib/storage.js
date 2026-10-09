// GPATek — thin wrapper around chrome.storage.local, shared by content and popup.
// Tolerant: works without chrome.* (page previews, tests).
(function (root) {
  'use strict';

  const store = {
    get(keys) {
      return new Promise((resolve) => {
        try { chrome.storage.local.get(keys, (v) => resolve(v || {})); } catch (_) { resolve({}); }
      });
    },
    set(obj) {
      try { chrome.storage.local.set(obj); } catch (_) { /* preview */ }
    },
    clear() {
      return new Promise((resolve) => {
        try { chrome.storage.local.clear(resolve); } catch (_) { resolve(); }
      });
    },
    // Calls cb(newValue) whenever `key` changes in local storage.
    onChange(key, cb) {
      try {
        chrome.storage.onChanged.addListener((changes, area) => {
          if (area === 'local' && changes[key]) cb(changes[key].newValue);
        });
      } catch (_) { /* preview */ }
    },
  };

  root.GpaTekStore = store;
})(globalThis);
