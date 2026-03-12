/**
 * 日志工具模块
 * 
 * 提供统一的日志记录功能，支持多级别日志、时间戳、消息发送
 */

var MokaLogger = (function() {
  var LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    SUCCESS: 2,
    WARNING: 3,
    ERROR: 4
  };

  var currentLevel = LOG_LEVELS.INFO;
  var currentTabId = null;
  var logBuffer = [];
  var maxBufferSize = 1000;

  function setTabId(tabId) {
    currentTabId = tabId;
  }

  function setLevel(level) {
    if (typeof level === 'string') {
      level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    }
    currentLevel = level;
  }

  function getTimestamp() {
    return new Date().toLocaleTimeString();
  }

  function formatMessage(message, type) {
    var timestamp = getTimestamp();
    return '[' + timestamp + '] [' + type.toUpperCase() + '] ' + message;
  }

  function addToBuffer(message, type) {
    var entry = {
      timestamp: new Date().toISOString(),
      type: type,
      message: message
    };
    
    logBuffer.push(entry);
    
    if (logBuffer.length > maxBufferSize) {
      logBuffer.shift();
    }
  }

  function sendToBackground(message, type) {
    if (typeof chrome !== 'undefined' && chrome.runtime && currentTabId !== null) {
      try {
        chrome.runtime.sendMessage({
          action: 'addLog',
          tabId: currentTabId,
          message: message,
          type: type
        }).catch(function(err) {
          console.error('[Logger] Failed to send log to background:', err);
        });
      } catch (e) {
        console.error('[Logger] Failed to send log:', e);
      }
    }
  }

  function log(message, type) {
    type = type || 'info';
    var level = LOG_LEVELS[type.toUpperCase()] || LOG_LEVELS.INFO;
    
    if (level < currentLevel) {
      return;
    }
    
    var formattedMessage = formatMessage(message, type);
    
    switch (type.toLowerCase()) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'success':
        console.log('%c' + formattedMessage, 'color: green; font-weight: bold;');
        break;
      case 'warning':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
    
    addToBuffer(message, type);
    sendToBackground(message, type);
  }

  function debug(message) {
    log(message, 'debug');
  }

  function info(message) {
    log(message, 'info');
  }

  function success(message) {
    log(message, 'success');
  }

  function warning(message) {
    log(message, 'warning');
  }

  function error(message) {
    log(message, 'error');
  }

  function getLogBuffer() {
    return logBuffer.slice();
  }

  function clearLogBuffer() {
    logBuffer = [];
  }

  function getLogBufferByType(type) {
    return logBuffer.filter(function(entry) {
      return entry.type === type;
    });
  }

  function getLogBufferSince(timestamp) {
    return logBuffer.filter(function(entry) {
      return new Date(entry.timestamp) >= new Date(timestamp);
    });
  }

  function exportLogBuffer(format) {
    format = format || 'json';
    
    if (format === 'json') {
      return JSON.stringify(logBuffer, null, 2);
    }
    
    if (format === 'text') {
      return logBuffer.map(function(entry) {
        return '[' + entry.timestamp + '] [' + entry.type.toUpperCase() + '] ' + entry.message;
      }).join('\n');
    }
    
    if (format === 'csv') {
      var header = 'timestamp,type,message\n';
      var rows = logBuffer.map(function(entry) {
        return entry.timestamp + ',' + entry.type + ',"' + entry.message.replace(/"/g, '""') + '"';
      });
      return header + rows.join('\n');
    }
    
    return logBuffer;
  }

  function group(label) {
    console.group(label);
  }

  function groupEnd() {
    console.groupEnd();
  }

  function table(data) {
    console.table(data);
  }

  function time(label) {
    console.time(label);
  }

  function timeEnd(label) {
    console.timeEnd(label);
  }

  function profile(label) {
    if (console.profile) {
      console.profile(label);
    }
  }

  function profileEnd(label) {
    if (console.profileEnd) {
      console.profileEnd(label);
    }
  }

  return {
    LEVELS: LOG_LEVELS,
    setTabId: setTabId,
    setLevel: setLevel,
    log: log,
    debug: debug,
    info: info,
    success: success,
    warning: warning,
    error: error,
    getLogBuffer: getLogBuffer,
    clearLogBuffer: clearLogBuffer,
    getLogBufferByType: getLogBufferByType,
    getLogBufferSince: getLogBufferSince,
    exportLogBuffer: exportLogBuffer,
    group: group,
    groupEnd: groupEnd,
    table: table,
    time: time,
    timeEnd: timeEnd,
    profile: profile,
    profileEnd: profileEnd
  };
})();

if (typeof window !== 'undefined') {
  window.MokaLogger = MokaLogger;
}
