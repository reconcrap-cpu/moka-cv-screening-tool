/**
 * 存储工具模块
 * 
 * 提供Chrome Storage API封装，支持同步/异步存储、缓存、数据迁移
 */

var MokaStorageUtils = (function() {
  var memoryCache = {};
  var cacheEnabled = true;
  var cacheTTL = 5 * 60 * 1000;

  function isStorageAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }

  function setCacheEnabled(enabled) {
    cacheEnabled = enabled;
  }

  function setCacheTTL(ttl) {
    cacheTTL = ttl;
  }

  function getFromCache(key) {
    if (!cacheEnabled) {
      return null;
    }
    
    var cached = memoryCache[key];
    
    if (!cached) {
      return null;
    }
    
    if (Date.now() - cached.timestamp > cacheTTL) {
      delete memoryCache[key];
      return null;
    }
    
    return cached.value;
  }

  function setToCache(key, value) {
    if (!cacheEnabled) {
      return;
    }
    
    memoryCache[key] = {
      value: value,
      timestamp: Date.now()
    };
  }

  function removeFromCache(key) {
    delete memoryCache[key];
  }

  function clearCache() {
    memoryCache = {};
  }

  function get(key, defaultValue) {
    defaultValue = defaultValue || null;
    
    var cached = getFromCache(key);
    if (cached !== null) {
      return Promise.resolve(cached);
    }
    
    if (!isStorageAvailable()) {
      return Promise.resolve(defaultValue);
    }
    
    return new Promise(function(resolve) {
      chrome.storage.local.get([key], function(result) {
        var value = result[key];
        
        if (value === undefined) {
          resolve(defaultValue);
          return;
        }
        
        setToCache(key, value);
        resolve(value);
      });
    });
  }

  function getSync(key, defaultValue) {
    defaultValue = defaultValue || null;
    
    var cached = getFromCache(key);
    if (cached !== null) {
      return cached;
    }
    
    return defaultValue;
  }

  function set(key, value) {
    setToCache(key, value);
    
    if (!isStorageAvailable()) {
      return Promise.resolve();
    }
    
    return new Promise(function(resolve, reject) {
      var data = {};
      data[key] = value;
      
      chrome.storage.local.set(data, function() {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  function setSync(key, value) {
    setToCache(key, value);
    
    if (isStorageAvailable()) {
      var data = {};
      data[key] = value;
      chrome.storage.local.set(data);
    }
  }

  function remove(key) {
    removeFromCache(key);
    
    if (!isStorageAvailable()) {
      return Promise.resolve();
    }
    
    return new Promise(function(resolve, reject) {
      chrome.storage.local.remove([key], function() {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  function removeSync(key) {
    removeFromCache(key);
    
    if (isStorageAvailable()) {
      chrome.storage.local.remove([key]);
    }
  }

  function clear() {
    clearCache();
    
    if (!isStorageAvailable()) {
      return Promise.resolve();
    }
    
    return new Promise(function(resolve, reject) {
      chrome.storage.local.clear(function() {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  function getMultiple(keys, defaultValues) {
    defaultValues = defaultValues || {};
    
    var result = {};
    var keysToFetch = [];
    
    keys.forEach(function(key) {
      var cached = getFromCache(key);
      if (cached !== null) {
        result[key] = cached;
      } else {
        keysToFetch.push(key);
      }
    });
    
    if (keysToFetch.length === 0) {
      return Promise.resolve(result);
    }
    
    if (!isStorageAvailable()) {
      keysToFetch.forEach(function(key) {
        result[key] = defaultValues[key] || null;
      });
      return Promise.resolve(result);
    }
    
    return new Promise(function(resolve) {
      chrome.storage.local.get(keysToFetch, function(storageResult) {
        keysToFetch.forEach(function(key) {
          var value = storageResult[key];
          
          if (value === undefined) {
            value = defaultValues[key] || null;
          } else {
            setToCache(key, value);
          }
          
          result[key] = value;
        });
        
        resolve(result);
      });
    });
  }

  function setMultiple(data) {
    Object.keys(data).forEach(function(key) {
      setToCache(key, data[key]);
    });
    
    if (!isStorageAvailable()) {
      return Promise.resolve();
    }
    
    return new Promise(function(resolve, reject) {
      chrome.storage.local.set(data, function() {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  function getStorageUsage() {
    if (!isStorageAvailable()) {
      return Promise.resolve({ bytesInUse: 0, quota: 0 });
    }
    
    return new Promise(function(resolve) {
      chrome.storage.local.getBytesInUse(null, function(bytesInUse) {
        resolve({
          bytesInUse: bytesInUse,
          quota: chrome.storage.local.QUOTA_BYTES || 5242880
        });
      });
    });
  }

  function migrateData(oldKey, newKey, transformer) {
    return get(oldKey).then(function(oldValue) {
      if (oldValue === null) {
        return false;
      }
      
      var newValue = transformer ? transformer(oldValue) : oldValue;
      
      return set(newKey, newValue).then(function() {
        return remove(oldKey).then(function() {
          return true;
        });
      });
    });
  }

  function backupData(keys) {
    return getMultiple(keys).then(function(data) {
      var backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: data
      };
      
      return set('backup_' + Date.now(), backup);
    });
  }

  function restoreData(backupKey) {
    return get(backupKey).then(function(backup) {
      if (!backup || !backup.data) {
        throw new Error('Invalid backup data');
      }
      
      return setMultiple(backup.data);
    });
  }

  function watch(key, callback) {
    if (!isStorageAvailable()) {
      return null;
    }
    
    var listener = function(changes, areaName) {
      if (areaName === 'local' && changes[key]) {
        var oldValue = changes[key].oldValue;
        var newValue = changes[key].newValue;
        
        removeFromCache(key);
        
        callback(newValue, oldValue);
      }
    };
    
    chrome.storage.onChanged.addListener(listener);
    
    return function unwatch() {
      chrome.storage.onChanged.removeListener(listener);
    };
  }

  return {
    setCacheEnabled: setCacheEnabled,
    setCacheTTL: setCacheTTL,
    clearCache: clearCache,
    get: get,
    getSync: getSync,
    set: set,
    setSync: setSync,
    remove: remove,
    removeSync: removeSync,
    clear: clear,
    getMultiple: getMultiple,
    setMultiple: setMultiple,
    getStorageUsage: getStorageUsage,
    migrateData: migrateData,
    backupData: backupData,
    restoreData: restoreData,
    watch: watch
  };
})();

if (typeof window !== 'undefined') {
  window.MokaStorageUtils = MokaStorageUtils;
}
