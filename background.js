let screeningStatesByTab = {};
let injectedTabs = new Set();

function keepAlive() {
  setInterval(() => {
    chrome.storage.local.get('ping', () => {});
  }, 20000);
}

async function saveState() {
  await chrome.storage.local.set({
    screeningStatesByTab: screeningStatesByTab
  });
}

async function loadState() {
  const result = await chrome.storage.local.get('screeningStatesByTab');
  if (result.screeningStatesByTab) {
    screeningStatesByTab = result.screeningStatesByTab;
  }
}

function getStateForTab(tabId) {
  console.log('getStateForTab called with tabId:', tabId, 'type:', typeof tabId);
  console.log('Current screeningStatesByTab keys:', Object.keys(screeningStatesByTab));
  
  if (tabId === null || tabId === undefined || tabId === 'undefined') {
    console.error('Invalid tabId!', tabId);
    return null;
  }
  
  const tabIdStr = String(tabId);
  
  if (!screeningStatesByTab[tabIdStr]) {
    console.log('Creating new state for tab:', tabIdStr);
    screeningStatesByTab[tabIdStr] = {
      isRunning: false,
      isPaused: false,
      isStopped: false,
      isCompleted: false,
      config: null,
      progress: {
        total: 0,
        current: 0,
        page: 1
      },
      results: [],
      logs: []
    };
  } else {
    console.log('Using existing state for tab:', tabIdStr);
    console.log('Existing state results:', screeningStatesByTab[tabIdStr].results);
    console.log('Existing state isCompleted:', screeningStatesByTab[tabIdStr].isCompleted);
    
    // 向后兼容：如果旧状态没有 isCompleted 字段，根据 results 推断
    if (screeningStatesByTab[tabIdStr].isCompleted === undefined) {
      screeningStatesByTab[tabIdStr].isCompleted = 
        screeningStatesByTab[tabIdStr].results && 
        screeningStatesByTab[tabIdStr].results.length > 0;
      console.log('Backward compatibility: set isCompleted to', screeningStatesByTab[tabIdStr].isCompleted);
    }
  }
  return screeningStatesByTab[tabIdStr];
}

function addLog(tabId, message, type = 'info') {
  const state = getStateForTab(tabId);
  if (!state) {
    console.error('addLog: state is null for tabId', tabId);
    return;
  }
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = { timestamp, message, type };
  state.logs.push(logEntry);
  
  if (state.logs.length > 500) {
    state.logs = state.logs.slice(-500);
  }
  
  saveState();
  
  chrome.runtime.sendMessage({
    action: 'logUpdate',
    tabId: tabId,
    log: logEntry
  }).catch(err => {
    console.warn('Failed to send log to sidebar (tab may not be open):', err.message);
  });
}

function updateStatus(tabId, status) {
  const state = getStateForTab(tabId);
  if (!state) {
    console.error('updateStatus: state is null for tabId', tabId);
    return;
  }
  chrome.runtime.sendMessage({
    action: 'statusUpdate',
    tabId: tabId,
    status: status,
    progress: state.progress
  }).catch(err => {
    console.warn('Failed to send status update:', err.message);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  keepAlive();
  loadState();
});

chrome.runtime.onStartup.addListener(() => {
  keepAlive();
  loadState();
});

chrome.action.onClicked.addListener((tab) => {
  // 使用回调确保 setOptions 完成后再 open，保持在用户手势上下文中
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: 'sidebar.html',
    enabled: true
  }, () => {
    chrome.sidePanel.open({ tabId: tab.id });
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('Tab removed:', tabId);
  injectedTabs.delete(tabId);
  const tabIdStr = String(tabId);
  delete screeningStatesByTab[tabIdStr];
  saveState();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.action, 'tabId:', request.tabId);
  
  const tabId = request.tabId;
  if (tabId === null || tabId === undefined || tabId === 'undefined') {
    console.error('Invalid tabId in message!', request);
    sendResponse({ success: false, error: 'Invalid tabId' });
    return true;
  }
  
  switch (request.action) {
    case 'startScreening':
      startScreening(request.config, tabId);
      sendResponse({ success: true });
      break;
      
    case 'pauseScreening':
      pauseScreening(tabId);
      sendResponse({ success: true });
      break;
      
    case 'resumeScreening':
      resumeScreening(tabId);
      sendResponse({ success: true });
      break;
      
    case 'stopScreening':
      stopScreening(tabId);
      sendResponse({ success: true });
      break;
      
    case 'getState':
      sendResponse({ state: getStateForTab(tabId) });
      break;
      
    case 'updateProgress':
      {
        const state = getStateForTab(tabId);
        if (!state) {
          sendResponse({ success: false });
          break;
        }
        state.progress = { ...state.progress, ...request.progress };
        saveState();
        updateStatus(tabId, 'running');
        sendResponse({ success: true });
      }
      break;
      
    case 'addResult':
      {
        console.log('Adding result for tab:', tabId, 'Result:', request.result);
        const state = getStateForTab(tabId);
        if (!state) {
          sendResponse({ success: false });
          break;
        }
        state.results.push(request.result);
        console.log('Results for tab', tabId, 'now:', state.results);
        saveState();
        sendResponse({ success: true });
      }
      break;
      
    case 'addLog':
      addLog(tabId, request.message, request.type || 'info');
      sendResponse({ success: true });
      break;
      
    case 'screeningComplete':
      screeningComplete(tabId);
      sendResponse({ success: true });
      break;
      
    case 'exportResults':
      {
        console.log('=== EXPORT DEBUG ===');
        console.log('Export request for tab:', tabId);
        console.log('All screeningStatesByTab:', screeningStatesByTab);
        console.log('Keys in states:', Object.keys(screeningStatesByTab));
        const state = getStateForTab(tabId);
        console.log('State for tab', tabId, ':', state);
        console.log('State results:', state ? state.results : 'null');
        console.log('================');
        sendResponse({ results: state ? state.results : [] });
      }
      break;
      
    case 'clearState':
      clearState(tabId);
      sendResponse({ success: true });
      break;
  }
  
  return true;
});

async function startScreening(config, tabId) {
  console.log('=== BACKGROUND START SCREENING ===');
  console.log('startScreening called with tabId:', tabId, 'type:', typeof tabId);
  console.log('Already injected tabs:', Array.from(injectedTabs));
  
  const state = getStateForTab(tabId);
  if (!state) {
    console.error('startScreening: state is null for tabId', tabId);
    return;
  }
  
  console.log('Resetting state for tab:', tabId);
  state.isRunning = true;
  state.isPaused = false;
  state.isStopped = false;
  state.isCompleted = false;
  state.config = config;
  state.progress = {
    total: parseInt(config.targetCount) || 0,
    current: 0,
    page: 1
  };
  state.results = [];
  state.logs = [];
  
  console.log('State after reset, results should be empty:', state.results);
  
  await saveState();
  
  addLog(tabId, '开始筛选流程', 'info');
  updateStatus(tabId, 'running');
  
  // 检查内容脚本是否已注入
  let needsInjection = !injectedTabs.has(tabId);
  
  // 额外检查：尝试向内容脚本发送ping消息
  if (!needsInjection) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      if (response && response.success) {
        console.log('Content script already active in tab:', tabId);
        needsInjection = false;
      }
    } catch (err) {
      console.log('Content script not responding, needs re-injection:', err.message);
      needsInjection = true;
    }
  }
  
  if (needsInjection) {
    console.log('Injecting all content scripts into tab:', tabId);
    try {
      // 注入所有依赖文件
      const scriptsToInject = [
        'html2canvas.min.js',
        'config.js',
        'src/constants/Selectors.js',
        'src/utils/SelectorMonitor.js',
        'src/utils/DOMUtils.js',
        'src/utils/Logger.js',
        'src/utils/StorageUtils.js',
        'src/modules/CandidateListModule.js',
        'src/modules/ResumeDetailModule.js',
        'src/modules/ResumeImageModule.js',
        'src/modules/RecommendationModule.js',
        'content.js',
        'auto-test.js'
      ];
      
      for (const script of scriptsToInject) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: [script]
          });
          console.log('Injected:', script);
        } catch (scriptErr) {
          console.warn('Failed to inject', script, ':', scriptErr.message);
        }
      }
      
      injectedTabs.add(tabId);
      addLog(tabId, 'Content script已注入', 'info');
      
      // 等待脚本初始化
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      addLog(tabId, 'Content script注入失败: ' + err.message, 'error');
      return;
    }
  } else {
    console.log('Content script already injected for tab:', tabId, ', skipping injection');
    addLog(tabId, '使用已注入的Content script', 'info');
  }
  
  console.log('Sending startScreening message to tab:', tabId);
  chrome.tabs.sendMessage(tabId, {
    action: 'startScreening',
    config: config,
    tabId: tabId
  }).catch(err => {
    addLog(tabId, '发送开始命令失败: ' + err.message, 'error');
    addLog(tabId, '请确保已在候选人列表页面，然后重新点击开始', 'warning');
  });
  console.log('=== END BACKGROUND START SCREENING ===');
}

function pauseScreening(tabId) {
  const state = getStateForTab(tabId);
  if (!state || !state.isRunning) return;
  
  state.isPaused = true;
  saveState();
  
  addLog(tabId, '已暂停筛选', 'warning');
  updateStatus(tabId, 'paused');
  
  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'pauseScreening'
    }).catch(err => {
      console.warn('Failed to send pause command to content script:', err.message);
    });
  }
}

function resumeScreening(tabId) {
  const state = getStateForTab(tabId);
  if (!state || !state.isRunning || !state.isPaused) return;
  
  state.isPaused = false;
  saveState();
  
  addLog(tabId, '继续筛选', 'info');
  updateStatus(tabId, 'running');
  
  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'resumeScreening'
    }).catch(err => {
      console.warn('Failed to send resume command to content script:', err.message);
    });
  }
}

function stopScreening(tabId) {
  const state = getStateForTab(tabId);
  if (!state) return;
  state.isStopped = true;
  state.isRunning = false;
  saveState();
  
  addLog(tabId, '已停止筛选', 'error');
  updateStatus(tabId, 'stopped');
  
  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'stopScreening'
    }).catch(err => {
      console.warn('Failed to send stop command to content script:', err.message);
    });
  }
}

function screeningComplete(tabId) {
  const state = getStateForTab(tabId);
  if (!state) return;
  state.isRunning = false;
  state.isCompleted = true;
  saveState();
  
  addLog(tabId, '筛选完成！', 'success');
  updateStatus(tabId, 'completed');
  
  chrome.runtime.sendMessage({
    action: 'screeningComplete',
    tabId: tabId
  }).catch(err => {
    console.warn('Failed to send screening complete message:', err.message);
  });
}

function clearState(tabId) {
  const tabIdStr = String(tabId);
  screeningStatesByTab[tabIdStr] = {
    isRunning: false,
    isPaused: false,
    isStopped: false,
    isCompleted: false,
    config: null,
    progress: {
      total: 0,
      current: 0,
      page: 1
    },
    results: [],
    logs: []
  };
  saveState();
}

loadState();
keepAlive();
