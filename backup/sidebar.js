let currentTabId = null;

document.addEventListener('DOMContentLoaded', async function() {
  await getCurrentTab();
  loadConfig();
  loadState();
  setupEventListeners();
  setupMessageListeners();
  setupTabChangeListener();
  updateRecommendToInputState();
});

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    currentTabId = tab.id;
    console.log('Sidebar bound to tab:', currentTabId);
  }
}

function setupTabChangeListener() {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('=== TAB ACTIVATED ===');
    console.log('Old tabId:', currentTabId, 'New activeInfo:', activeInfo);
    
    const oldTabId = currentTabId;
    await getCurrentTab();
    console.log('After getCurrentTab, currentTabId:', currentTabId);
    
    if (oldTabId !== currentTabId) {
      console.log('Tab changed, clearing log and loading state');
      clearLog();
      loadState();
    }
    console.log('=== END TAB ACTIVATED ===');
  });
  
  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    console.log('=== WINDOW FOCUS CHANGED ===');
    console.log('Window ID:', windowId);
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
      await getCurrentTab();
      console.log('After getCurrentTab, currentTabId:', currentTabId);
      clearLog();
      loadState();
    }
    console.log('=== END WINDOW FOCUS CHANGED ===');
  });
}

function loadConfig() {
  chrome.storage.local.get([
    'modelType', 'apiKey', 'baseUrl', 
    'screeningCriteria', 'fullScreeningCriteria', 'targetCount',
    'autoRecommend', 'recommendTo'
  ], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Failed to load config:', chrome.runtime.lastError.message);
      return;
    }
    if (result.modelType) document.getElementById('modelType').value = result.modelType;
    if (result.apiKey) document.getElementById('apiKey').value = result.apiKey;
    if (result.baseUrl) document.getElementById('baseUrl').value = result.baseUrl;
    if (result.screeningCriteria) document.getElementById('screeningCriteria').value = result.screeningCriteria;
    if (result.fullScreeningCriteria) document.getElementById('fullScreeningCriteria').value = result.fullScreeningCriteria;
    if (result.targetCount) document.getElementById('targetCount').value = result.targetCount;
    if (result.autoRecommend !== undefined) document.getElementById('autoRecommend').checked = result.autoRecommend;
    if (result.recommendTo) document.getElementById('recommendTo').value = result.recommendTo;
    
    updateRecommendToInputState();
  });
}

function updateRecommendToInputState() {
  const autoRecommend = document.getElementById('autoRecommend').checked;
  const recommendToInput = document.getElementById('recommendTo');
  recommendToInput.disabled = !autoRecommend;
}

function saveConfig() {
  const config = {
    modelType: document.getElementById('modelType').value,
    apiKey: document.getElementById('apiKey').value,
    baseUrl: document.getElementById('baseUrl').value,
    screeningCriteria: document.getElementById('screeningCriteria').value,
    fullScreeningCriteria: document.getElementById('fullScreeningCriteria').value,
    targetCount: document.getElementById('targetCount').value,
    autoRecommend: document.getElementById('autoRecommend').checked,
    recommendTo: document.getElementById('recommendTo').value
  };
  
  chrome.storage.local.set(config, function() {
    if (chrome.runtime.lastError) {
      console.error('Failed to save config:', chrome.runtime.lastError.message);
      addLog('配置保存失败: ' + chrome.runtime.lastError.message, 'error');
      return;
    }
    addLog('配置已保存', 'success');
  });
}

function loadState() {
  console.log('=== LOAD STATE ===');
  console.log('Current tab ID:', currentTabId);
  if (!currentTabId) return;
  
  chrome.runtime.sendMessage({ action: 'getState', tabId: currentTabId }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Failed to get state:', chrome.runtime.lastError.message);
      return;
    }
    console.log('Get state response:', response);
    if (response && response.state) {
      console.log('State loaded:', response.state);
      console.log('State isRunning:', response.state.isRunning);
      console.log('State isStopped:', response.state.isStopped);
      console.log('State logs:', response.state.logs);
      console.log('State results:', response.state.results);
      console.log('State results length:', response.state.results ? response.state.results.length : 0);
      updateUIState(response.state);
      response.state.logs.forEach(log => addLogToUI(log));
    }
    console.log('================');
  });
}

function setupEventListeners() {
  document.getElementById('saveConfig').addEventListener('click', saveConfig);
  document.getElementById('startBtn').addEventListener('click', startScreening);
  document.getElementById('pauseBtn').addEventListener('click', pauseScreening);
  document.getElementById('resumeBtn').addEventListener('click', resumeScreening);
  document.getElementById('stopBtn').addEventListener('click', stopScreening);
  document.getElementById('exportBtn').addEventListener('click', exportResults);
  document.getElementById('autoRecommend').addEventListener('change', updateRecommendToInputState);
}

function setupMessageListeners() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Sidebar received message:', request);
    if (request.tabId !== currentTabId) {
      console.log('Ignoring message for different tab:', request.tabId, 'current:', currentTabId);
      return;
    }
    
    switch (request.action) {
      case 'logUpdate':
        addLogToUI(request.log);
        break;
      case 'statusUpdate':
        updateStatus(request.status, request.progress);
        break;
      case 'screeningComplete':
        showExportButton();
        break;
    }
  });
}

async function startScreening() {
  console.log('=== START SCREENING DEBUG ===');
  console.log('Before getCurrentTab, currentTabId:', currentTabId);
  
  const config = {
    modelType: document.getElementById('modelType').value,
    apiKey: document.getElementById('apiKey').value,
    baseUrl: document.getElementById('baseUrl').value,
    screeningCriteria: document.getElementById('screeningCriteria').value,
    fullScreeningCriteria: document.getElementById('fullScreeningCriteria').value,
    targetCount: document.getElementById('targetCount').value,
    autoRecommend: document.getElementById('autoRecommend').checked,
    recommendTo: document.getElementById('recommendTo').value
  };
  
  if (!config.apiKey || !config.baseUrl) {
    alert('请先配置大模型API信息');
    return;
  }
  
  if (!config.screeningCriteria || !config.fullScreeningCriteria) {
    alert('请输入筛选标准');
    return;
  }
  
  if (!config.targetCount) {
    alert('请输入需要筛选的简历数量');
    return;
  }
  
  saveConfig();
  
  await getCurrentTab();
  console.log('After getCurrentTab, currentTabId:', currentTabId);
  
  if (!currentTabId) {
    alert('请先打开候选人列表页面');
    return;
  }
  
  console.log('Starting screening on tab:', currentTabId);
  
  clearLog();
  
  console.log('About to send addLog message with tabId:', currentTabId);
  chrome.runtime.sendMessage({
    action: 'addLog',
    tabId: currentTabId,
    message: '开始筛选...',
    type: 'info'
  }).catch(err => console.error('Failed to send addLog:', err));

  console.log('Sending startScreening message with tabId:', currentTabId);
  chrome.runtime.sendMessage({
    action: 'startScreening',
    config: config,
    tabId: currentTabId
  }).catch(err => {
    console.error('Failed to start screening:', err);
    alert('启动筛选失败，请重试');
  });
  
  showRunningButtons();
  console.log('=== END START SCREENING DEBUG ===');
}

async function pauseScreening() {
  await getCurrentTab();
  if (!currentTabId) return;
  console.log('Pausing screening on tab:', currentTabId);
  chrome.runtime.sendMessage({ action: 'pauseScreening', tabId: currentTabId })
    .catch(err => console.error('Failed to pause screening:', err));
  showPausedButtons();
}

async function resumeScreening() {
  await getCurrentTab();
  if (!currentTabId) return;
  console.log('Resuming screening on tab:', currentTabId);
  chrome.runtime.sendMessage({ action: 'resumeScreening', tabId: currentTabId })
    .catch(err => console.error('Failed to resume screening:', err));
  showRunningButtons();
}

async function stopScreening() {
  await getCurrentTab();
  if (!currentTabId) return;
  console.log('Stopping screening on tab:', currentTabId);
  if (confirm('确定要停止筛选吗？')) {
    chrome.runtime.sendMessage({ action: 'stopScreening', tabId: currentTabId })
      .catch(err => console.error('Failed to stop screening:', err));
    showStoppedButtons();
  }
}

async function exportResults() {
  await getCurrentTab();
  
  if (!currentTabId) {
    alert('无法确定当前页面，请重新选择');
    return;
  }
  
  console.log('Exporting results for tab:', currentTabId);
  
  chrome.runtime.sendMessage({ action: 'exportResults', tabId: currentTabId }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Failed to export results:', chrome.runtime.lastError.message);
      alert('获取筛选结果失败: ' + chrome.runtime.lastError.message);
      return;
    }
    console.log('Export response:', response);
    if (response && response.results) {
      console.log('Results to export:', response.results);
      downloadCSV(response.results);
    } else {
      alert('获取筛选结果失败');
    }
  });
}

function downloadCSV(results) {
  console.log('All results:', results);
  const qualifiedResults = results.filter(r => r.qualified);
  const apiFailedResults = results.filter(r => r.apiFailed === true);
  console.log('Qualified results:', qualifiedResults);
  console.log('API Failed results:', apiFailedResults);
  
  if (qualifiedResults.length === 0 && apiFailedResults.length === 0) {
    alert('没有符合条件的候选人，也没有API失败的候选人。共 ' + results.length + ' 条结果。');
    return;
  }
  
  const headers = [
    '姓名',
    '手机号',
    '邮箱',
    '详情页URL',
    '通过筛选原因',
    '最高学历院校',
    '最高学历专业',
    '本科院校',
    '本科专业',
    '备注'
  ];

  function buildCSV(data) {
    const csvRows = [headers.join(',')];
    data.forEach(result => {
      let remark = '';
      if (result.isLocked) {
        remark = '推荐不成功，已被其他岗位锁定';
      } else if (result.cannotRecommend) {
        remark = '符合条件但无法推荐';
      }
      const row = [
        escapeCSV(result.name || ''),
        escapeCSV(result.phone || ''),
        escapeCSV(result.email || ''),
        escapeCSV(result.detailUrl || ''),
        escapeCSV(result.reason || ''),
        escapeCSV(result.school || ''),
        escapeCSV(result.major || ''),
        escapeCSV(result.bachelorSchool || ''),
        escapeCSV(result.bachelorMajor || ''),
        escapeCSV(remark)
      ];
      csvRows.push(row.join(','));
    });
    return '\uFEFF' + csvRows.join('\n');
  }
  
  function downloadSingleCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  const dateStr = new Date().toISOString().slice(0, 10);
  
  if (qualifiedResults.length > 0) {
    const qualifiedCSV = buildCSV(qualifiedResults);
    downloadSingleCSV(qualifiedCSV, `合格候选人_${dateStr}.csv`);
  }
  
  if (apiFailedResults.length > 0) {
    const failedCSV = buildCSV(apiFailedResults);
    downloadSingleCSV(failedCSV, `API失败候选人_${dateStr}.csv`);
  }
  
  let message = '';
  if (qualifiedResults.length > 0) {
    message += `合格候选人: ${qualifiedResults.length} 人已导出到 "合格候选人_${dateStr}.csv"`;
  }
  if (apiFailedResults.length > 0) {
    if (message) message += '\n';
    message += `API失败候选人: ${apiFailedResults.length} 人已导出到 "API失败候选人_${dateStr}.csv"`;
  }
  
  alert(message);
  addLog('CSV文件已下载', 'success');
}

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function updateUIState(state) {
  console.log('=== UPDATE UI STATE ===');
  console.log('updateUIState called with state:', state);
  console.log('state.isRunning:', state.isRunning);
  console.log('state.isPaused:', state.isPaused);
  console.log('state.isStopped:', state.isStopped);
  console.log('state.isCompleted:', state.isCompleted);
  console.log('state.results:', state.results);
  console.log('state.results.length:', state.results ? state.results.length : 'no results');
  
  // 检查是否有结果（向后兼容：即使 isCompleted 不存在，只要有结果就显示导出按钮）
  const hasResults = state.results && Array.isArray(state.results) && state.results.length > 0;
  const isCompletedFlag = state.isCompleted === true;
  
  console.log('hasResults:', hasResults, 'isCompletedFlag:', isCompletedFlag);
  
  if (state.isRunning) {
    console.log('Showing running/paused buttons');
    if (state.isPaused) {
      showPausedButtons();
    } else {
      showRunningButtons();
    }
    updateStatus('running', state.progress);
  } else if (isCompletedFlag || hasResults) {
    console.log('Showing export button - isCompleted:', isCompletedFlag, 'hasResults:', hasResults);
    showExportButton();
    if (isCompletedFlag) {
      updateStatus('completed', state.progress);
    }
  } else if (state.isStopped) {
    console.log('Showing stopped buttons');
    showStoppedButtons();
  } else {
    console.log('Showing idle buttons');
    showIdleButtons();
  }
  console.log('=== END UPDATE UI STATE ===');
}

function showIdleButtons() {
  document.getElementById('startBtn').classList.remove('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('resumeBtn').classList.add('hidden');
  document.getElementById('stopBtn').classList.add('hidden');
  hideExportButton();
}

function showRunningButtons() {
  document.getElementById('startBtn').classList.add('hidden');
  document.getElementById('pauseBtn').classList.remove('hidden');
  document.getElementById('resumeBtn').classList.add('hidden');
  document.getElementById('stopBtn').classList.remove('hidden');
  hideExportButton();
}

function showPausedButtons() {
  document.getElementById('startBtn').classList.add('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('resumeBtn').classList.remove('hidden');
  document.getElementById('stopBtn').classList.remove('hidden');
  hideExportButton();
}

function showStoppedButtons() {
  document.getElementById('startBtn').classList.remove('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('resumeBtn').classList.add('hidden');
  document.getElementById('stopBtn').classList.add('hidden');
}

function showExportButton() {
  document.getElementById('exportBtn').classList.remove('hidden');
  showStoppedButtons();
}

function hideExportButton() {
  document.getElementById('exportBtn').classList.add('hidden');
}

function updateStatus(status, progress) {
  const statusText = document.getElementById('statusText');
  const countText = document.getElementById('countText');
  
  const statusMap = {
    'idle': '待开始',
    'running': '运行中',
    'paused': '已暂停',
    'stopped': '已停止',
    'completed': '已完成'
  };
  
  statusText.textContent = statusMap[status] || '待开始';
  
  if (progress) {
    countText.textContent = `已筛选: ${progress.current || 0} / ${progress.total || 0}`;
  }
}

function addLog(message, type = 'info') {
  if (!currentTabId) return;
  chrome.runtime.sendMessage({
    action: 'addLog',
    tabId: currentTabId,
    message: message,
    type: type
  }).catch(err => console.error('Failed to add log:', err));
}

function addLogToUI(log) {
  const container = document.getElementById('logContainer');
  const div = document.createElement('div');
  div.className = `log-line ${log.type}`;
  div.textContent = `[${log.timestamp}] ${log.message}`;
  container.appendChild(div);
  
  while (container.children.length > 200) {
    container.removeChild(container.firstChild);
  }
  
  container.scrollTop = container.scrollHeight;
}

function clearLog() {
  const container = document.getElementById('logContainer');
  container.innerHTML = '';
}
