/* =====================================================
   RoviSoft.net — Storage Module
   GNU AGPL v3 — https://github.com/airvzxf/rovisoft-web

   Persistence layer using localStorage (accepted)
   or sessionStorage (rejected/volatile).
   ===================================================== */

(function () {
  'use strict';

  var KEYS = {
    ACCEPTED: 'rs_config_accepted',
    STATE: 'rs_state',
    VERSION: 'rs_version',
    FIRST_VISIT: 'rs_first_visit'
  };

  function isAccepted() {
    var val = localStorage.getItem(KEYS.ACCEPTED);
    if (val === null) return null;
    return val === 'true';
  }

  function getStore() {
    return isAccepted() ? localStorage : sessionStorage;
  }

  function accept() {
    localStorage.setItem(KEYS.ACCEPTED, 'true');

    var keysToMigrate = [KEYS.STATE, KEYS.VERSION, KEYS.FIRST_VISIT];
    for (var i = 0; i < keysToMigrate.length; i++) {
      var key = keysToMigrate[i];
      var val = sessionStorage.getItem(key);
      if (val !== null) {
        localStorage.setItem(key, val);
        sessionStorage.removeItem(key);
      }
    }
  }

  function reject() {
    localStorage.setItem(KEYS.ACCEPTED, 'false');

    var storedVersion = localStorage.getItem(KEYS.VERSION);
    var storedFirstVisit = localStorage.getItem(KEYS.FIRST_VISIT);

    localStorage.removeItem(KEYS.STATE);

    if (storedVersion !== null) {
      localStorage.setItem(KEYS.VERSION, storedVersion);
    }
    if (storedFirstVisit !== null) {
      localStorage.setItem(KEYS.FIRST_VISIT, storedFirstVisit);
    }

    sessionStorage.removeItem(KEYS.STATE);
  }

  function save(state) {
    var store = getStore();
    var data = {
      user: state.user,
      cwd: state.cwd,
      history: state.history
    };
    try {
      store.setItem(KEYS.STATE, JSON.stringify(data));
    } catch (e) {
      data.history = data.history.slice(-50);
      try {
        store.setItem(KEYS.STATE, JSON.stringify(data));
      } catch (e2) {
        // silent fail
      }
    }
  }

  function load() {
    var store = getStore();
    var raw = store.getItem(KEYS.STATE);
    if (!raw) {
      var rawLocal = localStorage.getItem(KEYS.STATE);
      if (rawLocal) {
        raw = rawLocal;
      }
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveVersion(version) {
    var store = getStore();
    store.setItem(KEYS.VERSION, version);
  }

  function loadVersion() {
    var val = getStore().getItem(KEYS.VERSION);
    if (!val) {
      val = localStorage.getItem(KEYS.VERSION);
    }
    return val;
  }

  function saveFirstVisit(timestamp) {
    var store = getStore();
    store.setItem(KEYS.FIRST_VISIT, String(timestamp));
  }

  function loadFirstVisit() {
    var val = getStore().getItem(KEYS.FIRST_VISIT);
    if (!val) {
      val = localStorage.getItem(KEYS.FIRST_VISIT);
    }
    return val ? parseInt(val, 10) : null;
  }

  function reset() {
    localStorage.removeItem(KEYS.STATE);
    localStorage.removeItem(KEYS.ACCEPTED);
    localStorage.removeItem(KEYS.FIRST_VISIT);
    localStorage.removeItem(KEYS.VERSION);
    sessionStorage.removeItem(KEYS.STATE);
    sessionStorage.removeItem(KEYS.FIRST_VISIT);
    sessionStorage.removeItem(KEYS.VERSION);
  }

  function getStatus() {
    var accepted = isAccepted();
    var store = getStore();
    var storeName = accepted === true ? 'localStorage' : 'sessionStorage';
    var firstVisit = loadFirstVisit();

    return {
      accepted: accepted,
      storeName: storeName,
      versionStored: loadVersion(),
      firstVisit: firstVisit
    };
  }

  function getStorageInfo() {
    var store = isAccepted() ? localStorage : sessionStorage;
    var allKeys = [];
    var totalBytes = 0;

    for (var i = 0; i < store.length; i++) {
      var key = store.key(i);
      if (key.indexOf('rs_') === 0) {
        allKeys.push(key);
        var val = store.getItem(key);
        totalBytes += (key.length + (val ? val.length : 0)) * 2;
      }
    }

    return {
      keys: allKeys,
      keysCount: allKeys.length,
      totalBytes: totalBytes
    };
  }

  window.Storage = {
    isAccepted: isAccepted,
    accept: accept,
    reject: reject,
    save: save,
    load: load,
    saveVersion: saveVersion,
    loadVersion: loadVersion,
    saveFirstVisit: saveFirstVisit,
    loadFirstVisit: loadFirstVisit,
    reset: reset,
    getStatus: getStatus,
    getStorageInfo: getStorageInfo
  };

})();