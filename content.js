// 内存优化常量
const MAX_PROCESSED_IDS = 1000; // 最多保留1000个已处理的候选人ID

let config = null;
let isRunning = false;
let isPaused = false;
let isStopped = false;
let totalScreenedCount = 0;
let targetCount = 0;
let currentPage = 1;
let allCandidatesMap = {};
let processedCandidateIds = new Set();
let pageType = null;
let currentTabId = null;
let isInitialized = false;

// 等待配置加载完成
function waitForConfig(maxRetries = 50, interval = 100) {
  return new Promise((resolve) => {
    let retries = 0;
    const checkConfig = () => {
      if (typeof MokaScreeningConfig !== 'undefined') {
        resolve(true);
      } else if (retries >= maxRetries) {
        console.warn('Config not loaded after max retries, using fallback');
        resolve(false);
      } else {
        retries++;
        setTimeout(checkConfig, interval);
      }
    };
    checkConfig();
  });
}

// 备用配置（当 config.js 未加载时使用）
const FallbackConfig = {
  api: {
    defaultModel: 'gpt-4',
    requestConfig: {
      temperature: 0.3,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000
    }
  },
  systemPrompts: {
    initialScreening: '你是一个专业的招聘筛选助手。请根据用户提供的初筛标准，分析每个人选是否符合要求。',
    detailedEvaluation: '你是一个专业的招聘筛选助手。请根据用户提供的完整筛选标准，分析简历是否符合要求，并从简历中提取教育背景信息。'
  },
  userPrompts: {
    initialScreening: (screeningCriteria, candidates) => `初筛标准: ${screeningCriteria}\n\n人选信息: ${JSON.stringify(candidates, null, 2)}\n\n请返回一个JSON对象，包含符合初筛标准的人选索引列表和他们的详细信息，格式如下:\n{"qualifiedCandidates": [{"index": 0, "name": "姓名", "school": "学校", "major": "专业", "education": "学历", "graduationYear": "毕业年份"}]}`,
    detailedEvaluation: (fullScreeningCriteria) => `完整筛选标准: ${fullScreeningCriteria}\n\n请根据简历图片内容进行分析，并提取教育背景信息。请返回一个JSON对象，格式如下:\n{\n  "qualified": true/false,\n  "reason": "详细的评估理由",\n  "highestSchool": "最高学历院校",\n  "highestMajor": "最高学历专业",\n  "bachelorSchool": "本科院校",\n  "bachelorMajor": "本科专业"\n}\n\n如果只有一段教育经历，则最高学历和本科都填相同的信息。如果没有找到某项信息，请填空字符串。`
  }
};

// 获取配置（使用 config.js 或备用配置）
function getConfig() {
  return typeof MokaScreeningConfig !== 'undefined' ? MokaScreeningConfig : FallbackConfig;
}

if (window.__mokaScreeningExtensionInitialized) {
  console.warn('Content script already initialized, skipping duplicate load');
} else {
  window.__mokaScreeningExtensionInitialized = true;
  isInitialized = true;
  console.log('Content script initialized for the first time');
}

if (isInitialized) {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Content script received message:', request);
    
    // 处理 ping 消息，用于检测内容脚本是否已注入
    if (request.action === 'ping') {
      sendResponse({ success: true, initialized: true });
      return true;
    }
    
    if (request.action === 'startScreening') {
      currentTabId = request.tabId;
      console.log('Content script set currentTabId to:', currentTabId);
      
      if (currentTabId === null || currentTabId === undefined) {
        console.error('Content script: Invalid tabId, refusing to start!');
        sendResponse({ success: false, error: 'Invalid tabId' });
        return true;
      }
      
      startScreening(request.config);
      sendResponse({ success: true });
      return true;
    }
    
    if (currentTabId === null || currentTabId === undefined) {
      console.error('Content script: currentTabId is invalid, ignoring message:', request);
      sendResponse({ success: false, error: 'Invalid tabId' });
      return true;
    }
    
    switch (request.action) {
      case 'pauseScreening':
        isPaused = true;
        sendResponse({ success: true });
        break;
      case 'resumeScreening':
        isPaused = false;
        sendResponse({ success: true });
        break;
      case 'stopScreening':
        isStopped = true;
        isRunning = false;
        sendResponse({ success: true });
        break;
    }
    return true;
  });
} else {
  console.log('Content script is duplicate, not adding listener');
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.warn('Duplicate content script ignoring message:', request);
    sendResponse({ success: false, error: 'Duplicate content script' });
  });
}

async function startScreening(cfg) {
  console.log('startScreening called, currentTabId:', currentTabId);
  
  if (currentTabId === null || currentTabId === undefined) {
    console.error('startScreening: currentTabId is invalid, aborting!');
    return;
  }
  
  config = cfg;
  isRunning = true;
  isPaused = false;
  isStopped = false;
  totalScreenedCount = 0;
  targetCount = parseInt(cfg.targetCount) || 0;
  currentPage = 1;
  allCandidatesMap = {};
  processedCandidateIds = new Set();
  
  addLog('开始筛选流程，目标数量: ' + targetCount, 'info');
  
  pageType = detectPageType();
  addLog('检测到页面类型: ' + pageType, 'info');
  
  try {
    await mainScreeningFlow();
  } catch (error) {
    addLog('筛选出错: ' + error.message, 'error');
  }
  
  console.log('Screening complete, sending with tabId:', currentTabId);
  isRunning = false;
  if (currentTabId !== null && currentTabId !== undefined) {
    chrome.runtime.sendMessage({ action: 'screeningComplete', tabId: currentTabId });
  } else {
    console.error('screeningComplete: currentTabId is invalid');
  }
}

function detectPageType() {
  const hasPagination = document.querySelector('.sd-Pagination-forward-Qh_cN, [class*="Pagination-forward"], button[class*="next"]');
  const hasInfiniteScroll = document.querySelector('.candidate-main__infinite-scroll, .item-NpfQ8Ve_W4');
  
  if (hasInfiniteScroll && !hasPagination) {
    return 'infinite-scroll';
  }
  return 'pagination';
}

async function mainScreeningFlow() {
  if (pageType === 'infinite-scroll') {
    await mainScreeningFlowInfiniteScroll();
  } else {
    await mainScreeningFlowPagination();
  }
}

function isSameCandidate(candidate1, candidate2) {
  if (candidate1.name !== candidate2.name) return false;
  if (candidate1.school && candidate2.school && candidate1.school !== '未知' && candidate2.school !== '未知' && candidate1.school !== candidate2.school) return false;
  if (candidate1.major && candidate2.major && candidate1.major !== '未知' && candidate2.major !== '未知' && candidate1.major !== candidate2.major) return false;
  if (candidate1.graduationYear && candidate2.graduationYear && candidate1.graduationYear !== '未知' && candidate2.graduationYear !== '未知' && candidate1.graduationYear !== candidate2.graduationYear) return false;
  return true;
}

async function mainScreeningFlowPagination() {
  // 记录当前页已处理的候选人索引（用于进度计算）
  let pageProcessedCount = 0;
  
  while (isRunning && !isStopped && totalScreenedCount < targetCount) {
    await checkPause();
    if (isStopped) break;
    
    addLog(`处理第 ${currentPage} 页...`, 'info');
    
    const candidates = extractCandidateInfo();
    addLog(`本页找到 ${candidates.length} 位候选人`, 'info');
    
    if (candidates.length === 0) {
      addLog('未找到候选人，结束筛选', 'warning');
      break;
    }
    
    candidates.forEach(candidate => {
      allCandidatesMap[candidate.id] = candidate;
    });
    
    // 内存优化：清理allCandidatesMap中旧的数据
    const mapKeys = Object.keys(allCandidatesMap);
    if (mapKeys.length > 200) {
      // 只保留最新的200个候选人
      const keysToRemove = mapKeys.slice(0, mapKeys.length - 200);
      keysToRemove.forEach(key => delete allCandidatesMap[key]);
      console.log(`Memory optimization: Cleaned allCandidatesMap, removed ${keysToRemove.length} old entries, current size: ${Object.keys(allCandidatesMap).length}`);
    }
    
    const remainingCount = targetCount - totalScreenedCount;
    const candidatesToProcess = candidates.slice(0, remainingCount);
    
    const analysisResult = await analyzeWithLLM(candidatesToProcess, config.screeningCriteria);
    
    if (!analysisResult.success || !analysisResult.data.qualifiedCandidates) {
      addLog('初筛分析失败', 'error');
      break;
    }
    
    const qualifiedList = analysisResult.data.qualifiedCandidates;
    addLog(`本页 ${candidatesToProcess.length} 人初筛，通过 ${qualifiedList.length} 人`, 'success');
    
    // 重置当前页处理计数
    pageProcessedCount = 0;
    
    for (const qualifiedInfo of qualifiedList) {
      await checkPause();
      if (isStopped) break;
      if (totalScreenedCount >= targetCount) break;
      
      let matchedCandidate = null;
      
      if (typeof qualifiedInfo.index !== undefined && qualifiedInfo.index !== null && qualifiedInfo.index >= 0) {
        matchedCandidate = candidatesToProcess[qualifiedInfo.index];
      }
      
      if (!matchedCandidate) {
        matchedCandidate = candidatesToProcess.find(c => isSameCandidate(c, qualifiedInfo));
      }
      
      if (!matchedCandidate) {
        matchedCandidate = candidatesToProcess.find(c => c.name === (qualifiedInfo.name || qualifiedInfo));
      }
      
      if (matchedCandidate) {
        const result = await processCandidate(matchedCandidate);
        
        if (result) {
          console.log('Sending addResult, tabId:', currentTabId, 'result:', result);
          if (currentTabId === null || currentTabId === undefined) {
            console.error('addResult: currentTabId is invalid, skipping');
          } else {
            chrome.runtime.sendMessage({
              action: 'addResult',
              tabId: currentTabId,
              result: result
            });
          }
        }
        
        // 更新当前页处理到的位置
        pageProcessedCount = Math.max(pageProcessedCount, qualifiedInfo.index + 1);
        
        // 每次完整筛选完一位人选后立即更新进度
        const currentProgress = totalScreenedCount + pageProcessedCount;
        updateProgressWithValue(currentProgress);
      }
    }
    
    // 如果本页没有通过初筛的人选，也要更新进度为整页完成
    if (qualifiedList.length === 0) {
      pageProcessedCount = candidatesToProcess.length;
      const currentProgress = totalScreenedCount + pageProcessedCount;
      updateProgressWithValue(currentProgress);
    } else {
      // 确保最后进度更新为整页完成（处理通过初筛的人选可能不是最后几个的情况）
      pageProcessedCount = candidatesToProcess.length;
      const currentProgress = totalScreenedCount + pageProcessedCount;
      updateProgressWithValue(currentProgress);
    }
    
    totalScreenedCount += candidatesToProcess.length;
    
    // 内存优化：分页模式下，翻页前清理processedCandidateIds
    if (pageType === 'pagination') {
      processedCandidateIds.clear();
      console.log('Memory optimization: Cleared processedCandidateIds before page change');
    }
    
    if (totalScreenedCount >= targetCount) {
      addLog('已达到目标筛选数量', 'success');
      break;
    }
    
    const hasNextPage = await goToNextPage();
    if (!hasNextPage) {
      addLog('已到达最后一页', 'info');
      break;
    }
    
    // 翻页后等待页面内容加载
    console.log('[Moka翻页调试] 翻页成功，等待页面内容加载...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 等待候选人列表加载完成
    let retryCount = 0;
    let candidateContainers = document.querySelectorAll('.content-OKNZCZyG5d');
    while (candidateContainers.length === 0 && retryCount < 5) {
      console.log('[Moka翻页调试] 等待候选人列表加载，重试次数:', retryCount);
      await new Promise(resolve => setTimeout(resolve, 500));
      candidateContainers = document.querySelectorAll('.content-OKNZCZyG5d');
      retryCount++;
    }
    console.log('[Moka翻页调试] 候选人容器数量:', candidateContainers.length);
    
    currentPage++;
  }
}

async function mainScreeningFlowInfiniteScroll() {
  await loadCandidatesViaInfiniteScroll(targetCount);
  
  const candidates = extractCandidateInfo();
  addLog(`共找到 ${candidates.length} 位候选人`, 'info');
  
  if (candidates.length === 0) {
    addLog('未找到候选人，结束筛选', 'warning');
    return;
  }
  
  candidates.forEach(candidate => {
    allCandidatesMap[candidate.id] = candidate;
  });
  
  const remainingCount = targetCount - totalScreenedCount;
  const candidatesToProcess = candidates.slice(0, remainingCount);
  
  addLog(`开始处理 ${candidatesToProcess.length} 位候选人`, 'info');
  
  const analysisResult = await analyzeWithLLM(candidatesToProcess, config.screeningCriteria);
  
  if (!analysisResult.success || !analysisResult.data.qualifiedCandidates) {
    addLog('初筛分析失败', 'error');
    return;
  }
  
  const qualifiedList = analysisResult.data.qualifiedCandidates;
  addLog(`${candidatesToProcess.length} 人初筛，通过 ${qualifiedList.length} 人`, 'success');
  
  // 记录当前批次已处理的候选人索引（用于进度计算）
  let batchProcessedCount = 0;
  // 记录最后一个通过初筛的候选人索引
  let lastQualifiedIndex = -1;
  
  for (const qualifiedInfo of qualifiedList) {
    await checkPause();
    if (isStopped) break;
    if (totalScreenedCount >= targetCount) break;
    
    let matchedCandidate = null;
    
    if (typeof qualifiedInfo.index !== undefined && qualifiedInfo.index !== null && qualifiedInfo.index >= 0) {
      matchedCandidate = candidatesToProcess[qualifiedInfo.index];
    }
    
    if (!matchedCandidate) {
      matchedCandidate = candidatesToProcess.find(c => isSameCandidate(c, qualifiedInfo));
    }
    
    if (!matchedCandidate) {
      matchedCandidate = candidatesToProcess.find(c => c.name === (qualifiedInfo.name || qualifiedInfo));
    }
    
    if (matchedCandidate) {
      const result = await processCandidate(matchedCandidate);
      
      if (result) {
        console.log('Sending addResult (infinite scroll), tabId:', currentTabId, 'result:', result);
        if (currentTabId === null || currentTabId === undefined) {
          console.error('addResult (infinite scroll): currentTabId is invalid, skipping');
        } else {
          chrome.runtime.sendMessage({
            action: 'addResult',
            tabId: currentTabId,
            result: result
          });
        }
        processedCandidateIds.add(matchedCandidate.id);
        
        // 内存优化：定期清理processedCandidateIds
        if (processedCandidateIds.size > MAX_PROCESSED_IDS) {
          // 清理最早的一半
          const idsArray = Array.from(processedCandidateIds);
          const toRemove = idsArray.slice(0, Math.floor(idsArray.length / 2));
          toRemove.forEach(id => processedCandidateIds.delete(id));
          console.log(`Memory optimization: Cleaned processedCandidateIds, removed ${toRemove.length} old IDs, current size: ${processedCandidateIds.size}`);
        }
      }
      
      // 更新当前批次处理到的位置
      batchProcessedCount = Math.max(batchProcessedCount, qualifiedInfo.index + 1);
      lastQualifiedIndex = qualifiedInfo.index;
      
      // 每次完整筛选完一位人选后立即更新进度
      const currentProgress = totalScreenedCount + batchProcessedCount;
      updateProgressWithValue(currentProgress);
    }
  }
  
  // 如果这是最后一个通过初筛的人选，或者没有通过初筛的人选
  // 进度应该更新为总目标数（表示全部完成）
  if (qualifiedList.length === 0) {
    // 没有通过初筛的人选，进度更新为整批完成
    batchProcessedCount = candidatesToProcess.length;
    const currentProgress = totalScreenedCount + batchProcessedCount;
    updateProgressWithValue(currentProgress);
  } else {
    // 有通过初筛的人选，最后一个处理完后更新为总目标数
    // 因为这是最后一个需要完整筛选的人选
    batchProcessedCount = candidatesToProcess.length;
    const currentProgress = totalScreenedCount + batchProcessedCount;
    updateProgressWithValue(currentProgress);
    
    // 如果是最后一个符合条件的候选人，直接更新到目标总数
    if (lastQualifiedIndex === qualifiedList[qualifiedList.length - 1].index) {
      updateProgressWithValue(targetCount);
    }
  }
  
  totalScreenedCount += candidatesToProcess.length;
  
  addLog('筛选完成', 'success');
}

async function checkPause() {
  while (isPaused && !isStopped) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

function updateProgress() {
  updateProgressWithValue(totalScreenedCount);
}

function updateProgressWithValue(currentValue) {
  console.log('Content updateProgress, tabId:', currentTabId, 'current:', currentValue, 'total:', targetCount);
  if (currentTabId === null || currentTabId === undefined) {
    console.error('updateProgress: currentTabId is invalid, skipping');
    return;
  }
  chrome.runtime.sendMessage({
    action: 'updateProgress',
    tabId: currentTabId,
    progress: {
      current: currentValue,
      total: targetCount,
      page: currentPage
    }
  });
}

function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  
  if (currentTabId === null || currentTabId === undefined) {
    console.error('addLog: currentTabId is invalid, skipping');
    return;
  }
  chrome.runtime.sendMessage({
    action: 'addLog',
    tabId: currentTabId,
    message: message,
    type: type
  }).catch(err => {
    console.error('Failed to send log message:', err);
  });
}

function extractCandidateInfo() {
  if (pageType === 'infinite-scroll') {
    return extractCandidateInfoInfiniteScroll();
  }
  return extractCandidateInfoPagination();
}

function extractCandidateInfoPagination() {
  const candidates = [];
  
  // 尝试多种容器选择器以兼容新旧结构
  let candidateContainers = document.querySelectorAll('.content-OKNZCZyG5d');
  
  // 如果新结构未找到，回退到旧结构选择器
  if (candidateContainers.length === 0) {
    candidateContainers = document.querySelectorAll('div[class*="candidate"], div[class*="item"], div[class*="row"]');
  }
  
  candidateContainers.forEach((container, index) => {
    // 为容器添加唯一ID（如果没有）
    if (!container.id) {
      container.id = `candidate_${Date.now()}_${index}`;
    }
    
    const candidate = {
      id: container.id,
      // elementRef: container, // 移除DOM引用，避免内存泄漏
      name: '未知',
      school: '未知',
      major: '未知',
      education: '未知',
      graduationYear: '未知'
    };
    
    const nameElement = container.querySelector('.name-zRouov6HCt span');
    if (nameElement) {
      candidate.name = nameElement.textContent.trim();
    }
    
    let eduParentElement = container.querySelector('.sd-Icon-iconeducation-37lQQ');
    if (!eduParentElement) {
      eduParentElement = container.querySelector('[class*="sd-Icon-iconeducation-"]');
    }
    if (!eduParentElement) {
      eduParentElement = container.querySelector('.sd-Icon-container-3D6ec[class*="sd-Icon-iconeducation-"]');
    }
    
    if (eduParentElement) {
      // 尝试新结构：更宽松的选择器
      let eduContainer = eduParentElement.closest('.sd-Spacing-spacing-inline-3qXs9');
      
      // 如果新结构未找到，回退到旧结构
      if (!eduContainer) {
        eduContainer = eduParentElement.closest('.sd-Spacing-spacing-inline-3qXs9.sd-Spacing-align-center-2FigV.item-B07Uw4vF_6');
      }
      
      if (eduContainer) {
        // 尝试从子元素获取（旧结构）
        let eduElement = eduContainer.querySelector('.sd-Spacing-spacing-inline-3qXs9.sd-Spacing-align-center-2FigV.ellipsis-vKhHFawJzy');
        
        // 如果未找到，直接使用 eduContainer 的文本（新结构）
        if (!eduElement) {
          eduElement = eduContainer;
        }
        
        if (eduElement) {
          const eduText = eduElement.textContent.trim();
          const eduParts = eduText.split('|').map(part => part.trim());
          if (eduParts.length >= 4) {
            candidate.school = eduParts[0];
            candidate.major = eduParts[1];
            candidate.education = eduParts[2];
            const yearRange = eduParts[3];
            const years = yearRange.match(/\d{4}/g);
            if (years && years.length >= 2) {
              candidate.graduationYear = years[1];
            } else if (years && years.length === 1) {
              candidate.graduationYear = years[0];
            }
          } else if (eduParts.length >= 3) {
            candidate.school = eduParts[0];
            candidate.major = eduParts[1];
            candidate.education = eduParts[2];
          }
        }
      }
    }
    
    if (candidate.name !== '未知') {
      candidates.push(candidate);
    }
  });
  
  return candidates;
}

function extractCandidateInfoInfiniteScroll() {
  const candidates = [];
  const items = document.querySelectorAll('tr[id]');
  
  items.forEach((item, index) => {
    // 为行添加唯一ID（如果没有）
    if (!item.id) {
      item.id = `candidate_${Date.now()}_${index}`;
    }
    
    const candidate = {
      id: item.id,
      // elementRef: item, // 移除DOM引用，避免内存泄漏
      name: '未知',
      school: '未知',
      major: '未知',
      education: '未知',
      graduationYear: '未知'
    };
    
    const nameElement = item.querySelector('.sd-foundation-heading-60-39PpK');
    if (nameElement) {
      const nameText = nameElement.textContent.trim();
      const nameMatch = nameText.match(/^[\u4e00-\u9fa5]+/);
      if (nameMatch) {
        candidate.name = nameMatch[0];
      }
    }
    
    const eduElements = item.querySelectorAll('.list-item-N6cWsfhbS8');
    eduElements.forEach(eduEl => {
      const hasEduIcon = eduEl.querySelector('.sd-Icon-iconeducation-37lQQ, [class*="sd-Icon-iconeducation-"]');
      if (hasEduIcon) {
        const splitElements = eduEl.querySelectorAll('.split-qbqyESLfBC');
        if (splitElements.length >= 4) {
          candidate.school = splitElements[0].textContent.trim();
          candidate.major = splitElements[1].textContent.trim();
          candidate.education = splitElements[2].textContent.trim();
          const yearRange = splitElements[3].textContent.trim();
          const years = yearRange.match(/\d{4}/g);
          if (years && years.length >= 2) {
            candidate.graduationYear = years[1];
          } else if (years && years.length === 1) {
            candidate.graduationYear = years[0];
          }
        } else if (splitElements.length >= 3) {
          candidate.school = splitElements[0].textContent.trim();
          candidate.major = splitElements[1].textContent.trim();
          candidate.education = splitElements[2].textContent.trim();
        } else {
          // 如果没有 split-qbqyESLfBC 元素，尝试直接从文本中提取
          const eduText = eduEl.textContent.trim();
          const parts = eduText.split(/[\s|]+/).filter(p => p.length > 0);
          if (parts.length >= 4) {
            candidate.school = parts[0];
            candidate.major = parts.slice(1, -2).join(' ');
            candidate.education = parts[parts.length - 2];
            const yearRange = parts[parts.length - 1];
            const years = yearRange.match(/\d{4}/g);
            if (years && years.length >= 2) {
              candidate.graduationYear = years[1];
            } else if (years && years.length === 1) {
              candidate.graduationYear = years[0];
            }
          }
        }
      }
    });
    
    if (candidate.name !== '未知' && !processedCandidateIds.has(candidate.id)) {
      candidates.push(candidate);
    }
  });
  
  return candidates;
}

async function callLLMWithRetry(url, options, maxRetries = 3) {
  let lastError = null;
  const requestInfo = JSON.parse(options.body || '{}');
  const modelName = requestInfo.model || 'unknown';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '无法读取错误响应体');
        let errorDetail = '';
        try {
          const errorJson = JSON.parse(errorBody);
          errorDetail = errorJson.error?.message || errorJson.message || errorJson.error || errorBody;
        } catch {
          errorDetail = errorBody;
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || Math.pow(2, attempt);
          addLog(`API 速率限制 (429)，模型: ${modelName}，${retryAfter}秒后重试...`, 'warning');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          lastError = new Error(`API 速率限制 (429): ${errorDetail}`);
          continue;
        }

        const statusMessages = {
          400: '请求参数错误',
          401: 'API密钥无效或已过期',
          403: '没有权限访问该API',
          404: 'API端点不存在',
          408: '请求超时',
          500: '服务器内部错误',
          502: '网关错误',
          503: '服务不可用',
          504: '网关超时'
        };
        const statusText = statusMessages[response.status] || `HTTP错误 ${response.status}`;
        throw new Error(`${statusText}: ${errorDetail}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      let errorType = '网络错误';
      if (error.message.includes('Failed to fetch')) {
        errorType = '网络连接失败';
      } else if (error.message.includes('timeout') || error.message.includes('超时')) {
        errorType = '请求超时';
      } else if (error.message.includes('abort')) {
        errorType = '请求被中断';
      } else if (error.message.includes('CORS')) {
        errorType = '跨域错误';
      }

      addLog(`API 请求失败 [${errorType}] (尝试 ${attempt}/${maxRetries}): ${error.message}`, 'warning');

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        addLog(`等待 ${delay/1000} 秒后重试...`, 'info');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

async function analyzeWithLLM(candidates, screeningCriteria) {
  const candidatesWithIndex = candidates.map((c, index) => ({
    ...c,
    index: index
  }));

  // 使用配置文件中的模型和提示词
  const screeningConfig = getConfig();
  const modelName = config.modelType || screeningConfig.api.defaultModel;
  const systemPrompt = screeningConfig.systemPrompts.initialScreening;
  const userPrompt = screeningConfig.userPrompts.initialScreening(screeningCriteria, candidatesWithIndex);
  
  const requestData = {
    model: modelName,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: screeningConfig.api.requestConfig.temperature
  };

  try {
    addLog(`开始初筛分析，模型: ${modelName}，候选人数量: ${candidates.length}`, 'info');

    const response = await callLLMWithRetry(config.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.apiKey
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const responseContent = data.choices[0].message.content;
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);

          let qualifiedList = [];
          if (result.qualifiedCandidates && Array.isArray(result.qualifiedCandidates)) {
            if (result.qualifiedCandidates.length > 0 && typeof result.qualifiedCandidates[0].index !== undefined) {
              qualifiedList = result.qualifiedCandidates;
            } else if (Array.isArray(result.qualifiedCandidates) && typeof result.qualifiedCandidates[0] === 'string') {
              qualifiedList = result.qualifiedCandidates.map((name, idx) => ({
                index: candidates.findIndex(c => c.name === name),
                name: name,
                school: candidates.find(c => c.name === name)?.school || '',
                major: candidates.find(c => c.name === name)?.major || '',
                education: candidates.find(c => c.name === name)?.education || '',
                graduationYear: candidates.find(c => c.name === name)?.graduationYear || ''
              }));
            }
          }

          addLog(`初筛分析完成，通过 ${qualifiedList.length}/${candidates.length} 人`, 'success');
          return {
            success: true,
            data: {
              qualifiedCandidates: qualifiedList
            }
          };
        } catch (e) {
          addLog(`解析初筛结果失败: ${e.message}`, 'error');
          return {
            success: false,
            message: '解析结果失败: ' + e.message
          };
        }
      } else {
        addLog('模型返回格式不正确，无法找到JSON内容', 'error');
        return {
          success: false,
          message: '模型返回格式不正确'
        };
      }
    } else {
      const errorMsg = data.error?.message || '未知的API错误';
      addLog(`模型调用失败: ${errorMsg}`, 'error');
      return {
        success: false,
        message: '模型调用失败: ' + errorMsg
      };
    }
  } catch (error) {
    addLog(`初筛API请求失败: ${error.message}`, 'error');
    return {
      success: false,
      message: '请求失败: ' + error.message
    };
  }
}

function extractCandidateContactInfo() {
  let phone = '';
  let email = '';
  
  const mobileIcon = document.querySelector('.sd-Icon-iconmobile-ZiBTm, [class*="sd-Icon-iconmobile-"]');
  if (mobileIcon) {
    const mobileContainer = mobileIcon.closest('.sd-Spacing-spacing-inline-3qXs9, .candidate-header-info-item-iIpckHaTor, .sd-Dropdown-container-2K__m');
    if (mobileContainer) {
      const phoneText = mobileContainer.textContent.trim();
      const phoneMatch = phoneText.match(/(\+?\d[\d\s-]{7,}\d)/);
      if (phoneMatch) {
        phone = phoneMatch[1].replace(/\s/g, '');
      }
    }
  }
  
  const emailIcon = document.querySelector('.sd-Icon-iconemail-E2Nni, [class*="sd-Icon-iconemail-"]');
  if (emailIcon) {
    const emailContainer = emailIcon.closest('.sd-Spacing-spacing-inline-3qXs9, .candidate-header-info-item-iIpckHaTor, .sd-Dropdown-container-2K__m');
    if (emailContainer) {
      const emailLink = emailContainer.querySelector('a[href^="mailto:"]');
      if (emailLink) {
        email = emailLink.textContent.trim();
      } else {
        const emailText = emailContainer.textContent.trim();
        const emailMatch = emailText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          email = emailMatch[0];
        }
      }
    }
  }
  
  return { phone, email };
}

function isDetailPageUrl(url) {
  if (!url) url = window.location.href;
  // 支持两种详情页URL格式：
  // 1. /application/{id}/info - 完整详情页
  // 2. /application/{id} - 简化详情页（没有 /info）
  // 关键是 URL 中包含 /application/ 且后面跟着数字
  const hasApplicationPattern = /\/application\/\d+/.test(url);
  const isCandidatePage = url.includes('/candidates/application/');
  return hasApplicationPattern || isCandidatePage;
}

function isListPageUrl(url) {
  if (!url) url = window.location.href;
  // 列表页：包含 /talent_pool/view/ 或 /candidates 但不包含 /application/
  const isTalentPool = url.includes('/talent_pool/view/') && !url.includes('/application/');
  const isCandidatesList = url.includes('/candidates?') || url.includes('/candidates&');
  return isTalentPool || isCandidatesList;
}

function hasUrlDuplication(url) {
  if (!url) url = window.location.href;
  const patterns = ['/info/info', '/application/application', '/view/view'];
  for (const pattern of patterns) {
    if (url.includes(pattern)) {
      return true;
    }
  }
  return false;
}

function extractCorrectDetailUrl(duplicatedUrl) {
  if (!duplicatedUrl) return null;
  
  const match = duplicatedUrl.match(/^(https?:\/\/[^\/]+\/talent_pool\/view\/\d+\/application\/\d+\/info)/);
  if (match) {
    return match[1];
  }
  
  const infoIndex = duplicatedUrl.indexOf('/info');
  if (infoIndex !== -1) {
    return duplicatedUrl.substring(0, infoIndex + 5);
  }
  
  return null;
}

async function navigateToCorrectUrl(correctUrl) {
  if (!correctUrl) return false;
  
  try {
    addLog('检测到URL重复拼接，正在导航到正确的URL: ' + correctUrl, 'warning');
    window.location.href = correctUrl;
    await new Promise(resolve => setTimeout(resolve, 3000));
    return true;
  } catch (error) {
    addLog('导航到正确URL失败: ' + error.message, 'error');
    return false;
  }
}

async function waitForDetailPageLoad(timeout) {
  timeout = timeout || 8000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const hasDetailHeader = document.querySelector('.candidate-actions__header, .candidate-header-info-item-iIpckHaTor');
    const hasResumeContent = document.querySelector('.img-page, img[class*="resume-"], #iframeResume, .img-blob');
    
    if (hasDetailHeader || hasResumeContent) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return false;
}

async function verifyReturnToListPage(originalListUrl, timeout) {
  timeout = timeout || 5000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const currentUrl = window.location.href;
    
    if (isListPageUrl(currentUrl)) {
      const hasListContainer = document.querySelector('.content-OKNZCZyG5d, tr[id]');
      if (hasListContainer) {
        return true;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  addLog('返回列表页验证失败，当前URL: ' + window.location.href, 'warning');
  return false;
}

async function waitForUrlChange(expectedUrlPattern, timeout) {
  timeout = timeout || 8000;
  const startTime = Date.now();
  const initialUrl = window.location.href;
  
  while (Date.now() - startTime < timeout) {
    const currentUrl = window.location.href;
    
    // URL 已经变化
    if (currentUrl !== initialUrl) {
      // 检查是否匹配期望的模式
      if (expectedUrlPattern) {
        if (typeof expectedUrlPattern === 'function') {
          if (expectedUrlPattern(currentUrl)) {
            return { changed: true, url: currentUrl };
          }
        } else if (currentUrl.includes(expectedUrlPattern)) {
          return { changed: true, url: currentUrl };
        }
      } else {
        return { changed: true, url: currentUrl };
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return { changed: false, url: window.location.href };
}

async function waitForPageLoad(selector, timeout) {
  timeout = timeout || 8000;
  const startTime = Date.now();
  
  const selectors = Array.isArray(selector) ? selector : [selector];
  
  while (Date.now() - startTime < timeout) {
    for (const sel of selectors) {
      const element = document.querySelector(sel);
      if (element) {
        return true;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return false;
}

async function processCandidate(candidate) {
  addLog('处理候选人: ' + candidate.name, 'info');
  
  const listPageUrl = window.location.href;
  const navigated = navigateToCandidateDetail(candidate);
  if (!navigated) {
    addLog('无法进入详情页: ' + candidate.name, 'error');
    return {
      name: candidate.name,
      qualified: false,
      apiFailed: false,
      reason: '无法进入详情页',
      detailUrl: listPageUrl,
      school: '',
      major: '',
      bachelorSchool: '',
      bachelorMajor: '',
      phone: '',
      email: ''
    };
  }
  
  // 动态等待 URL 变化为详情页
  const urlResult = await waitForUrlChange(isDetailPageUrl, 8000);
  
  if (!urlResult.changed) {
    addLog('导航后URL未变化或未变为详情页: ' + window.location.href, 'warning');
    // 额外等待并重试
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  let candidateDetailUrl = window.location.href;
  
  if (hasUrlDuplication(candidateDetailUrl)) {
    addLog('检测到URL重复拼接: ' + candidateDetailUrl, 'warning');
    const correctUrl = extractCorrectDetailUrl(candidateDetailUrl);
    if (correctUrl) {
      const navigated = await navigateToCorrectUrl(correctUrl);
      if (navigated) {
        candidateDetailUrl = correctUrl;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        addLog('无法导航到正确的详情页URL，跳过该候选人', 'error');
        window.history.back();
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          name: candidate.name,
          qualified: false,
          apiFailed: false,
          reason: 'URL重复拼接无法修复',
          detailUrl: candidateDetailUrl,
          school: '',
          major: '',
          bachelorSchool: '',
          bachelorMajor: '',
          phone: '',
          email: ''
        };
      }
    }
  }
  
  // 再次验证 URL 是否为详情页（支持两种格式）
  if (!isDetailPageUrl(candidateDetailUrl)) {
    addLog('导航后URL不是详情页: ' + candidateDetailUrl, 'error');
    // 尝试等待更长时间
    const retryUrlResult = await waitForUrlChange(isDetailPageUrl, 5000);
    candidateDetailUrl = window.location.href;
    
    if (!isDetailPageUrl(candidateDetailUrl)) {
      addLog('重试后URL仍不是详情页，跳过该候选人', 'error');
      window.history.back();
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        name: candidate.name,
        qualified: false,
        apiFailed: false,
        reason: '导航失败，未进入详情页',
        detailUrl: candidateDetailUrl,
        school: '',
        major: '',
        bachelorSchool: '',
        bachelorMajor: '',
        phone: '',
        email: ''
      };
    }
  }
  
  const detailPageLoaded = await waitForDetailPageLoad(8000);
  if (!detailPageLoaded) {
    addLog('详情页加载超时: ' + candidate.name, 'error');
    window.history.back();
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      name: candidate.name,
      qualified: false,
      apiFailed: false,
      reason: '详情页加载超时',
      detailUrl: candidateDetailUrl,
      school: '',
      major: '',
      bachelorSchool: '',
      bachelorMajor: '',
      phone: '',
      email: ''
    };
  }
  
  const contactInfo = extractCandidateContactInfo();
  
  const isLocked = document.querySelector('.candidate-actions__header') && 
                   document.querySelector('.candidate-actions__header').textContent.trim() === '候选人被锁定';
  if (isLocked) {
    addLog('候选人 ' + candidate.name + ' 已被其他岗位锁定', 'warning');
  }
  
  const resumeImageUrls = await captureResume();
  if (!resumeImageUrls || resumeImageUrls.length === 0) {
    addLog('无法获取简历图片: ' + candidate.name, 'error');
    window.history.back();
    await verifyReturnToListPage(listPageUrl, 5000);
    return {
      name: candidate.name,
      qualified: false,
      apiFailed: false,
      reason: '无法获取简历图片',
      detailUrl: candidateDetailUrl,
      school: '',
      major: '',
      bachelorSchool: '',
      bachelorMajor: '',
      phone: contactInfo.phone,
      email: contactInfo.email
    };
  }
  
  addLog(`获取到 ${resumeImageUrls.length} 张简历图片: ${candidate.name}`, 'info');
  if (contactInfo.phone) addLog(`获取到手机号: ${contactInfo.phone}`, 'info');
  if (contactInfo.email) addLog(`获取到邮箱: ${contactInfo.email}`, 'info');
  
  const evaluationResult = await evaluateWithFullCriteria(resumeImageUrls, candidate.name);
  
  if (evaluationResult.success) {
    addLog('候选人 ' + candidate.name + ' 评估完成: ' + (evaluationResult.data.qualified ? '符合' : '不符合'), evaluationResult.data.qualified ? 'success' : 'warning');
    
    if (evaluationResult.data.qualified && config.autoRecommend && config.recommendTo && pageType === 'infinite-scroll' && !isLocked) {
      addLog('开始推荐候选人 ' + candidate.name + ' 给用人部门...', 'info');
      const recommendResult = await recommendToTeam(config.recommendTo);
      if (recommendResult.success) {
        addLog('成功推荐候选人 ' + candidate.name, 'success');
      } else if (recommendResult.noRecommendButton) {
        addLog('候选人 ' + candidate.name + ' 符合条件但无法推荐（无推荐按钮）', 'warning');
        evaluationResult.data.cannotRecommend = true;
      } else {
        addLog('推荐候选人 ' + candidate.name + ' 失败: ' + recommendResult.message, 'error');
      }
    } else if (evaluationResult.data.qualified && config.autoRecommend && config.recommendTo && pageType !== 'infinite-scroll') {
      addLog('此页面类型不支持推荐功能，仅保存筛选结果: ' + candidate.name, 'info');
    } else if (evaluationResult.data.qualified && isLocked) {
      addLog('候选人 ' + candidate.name + ' 符合条件但已被锁定，跳过推荐', 'warning');
      evaluationResult.data.isLocked = true;
    }
  } else {
    addLog('候选人 ' + candidate.name + ' 评估失败: ' + evaluationResult.message, 'error');
  }
  
  window.history.back();
  const returnedToList = await verifyReturnToListPage(listPageUrl, 5000);
  if (!returnedToList) {
    addLog('返回列表页可能失败，尝试直接导航: ' + candidate.name, 'warning');
    if (listPageUrl && isListPageUrl(listPageUrl)) {
      window.location.href = listPageUrl;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  if (evaluationResult.success) {
    return {
      name: candidate.name,
      qualified: evaluationResult.data.qualified,
      apiFailed: false,
      reason: evaluationResult.data.reason,
      detailUrl: candidateDetailUrl,
      school: evaluationResult.data.highestSchool || '',
      major: evaluationResult.data.highestMajor || '',
      bachelorSchool: evaluationResult.data.bachelorSchool || '',
      bachelorMajor: evaluationResult.data.bachelorMajor || '',
      phone: contactInfo.phone,
      email: contactInfo.email,
      cannotRecommend: evaluationResult.data.cannotRecommend || false,
      isLocked: evaluationResult.data.isLocked || isLocked
    };
  } else {
    return {
      name: candidate.name,
      qualified: false,
      apiFailed: !evaluationResult.success,
      reason: '评估失败: ' + evaluationResult.message,
      detailUrl: candidateDetailUrl,
      school: '',
      major: '',
      bachelorSchool: '',
      bachelorMajor: '',
      phone: contactInfo.phone,
      email: contactInfo.email,
      cannotRecommend: false,
      isLocked: isLocked
    };
  }
}

async function recommendToTeam(recommendToNames) {
  try {
    // 预处理用户输入：去除所有空格，然后按逗号分割（支持中英文逗号）
    const cleanedInput = recommendToNames.replace(/\s+/g, '');
    const names = cleanedInput.split(/[,，]/).filter(n => n);
    if (names.length === 0) {
      return { success: false, message: '未指定推荐人' };
    }
    
    // 查找并点击"推荐给用人部门"按钮
    let recommendBtn = document.querySelector('button.candidate-common-action__guide-assign');
    if (!recommendBtn) {
      // 备用查找方式
      const allButtons = document.querySelectorAll('button');
      for (const btn of allButtons) {
        if (btn.textContent && btn.textContent.trim() === '推荐给用人部门') {
          recommendBtn = btn;
          break;
        }
      }
    }

    if (!recommendBtn) {
      // 没有推荐按钮，返回特殊标记
      return { success: false, message: '未找到推荐按钮', noRecommendButton: true };
    }
    
    recommendBtn.click();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addLog('开始推荐，共 ' + names.length + ' 人: ' + names.join(', '), 'info');

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      addLog('正在输入第 ' + (i + 1) + '/' + names.length + ' 人: ' + name, 'info');

      // 每次输入前都重新查找输入框
      // 方法1: 通过"推荐到"标签查找对应的输入框
      let input = null;
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.textContent && el.textContent.trim() === '推荐到') {
          // 找到"推荐到"标签，向上查找父元素，找到包含输入框的容器
          let parent = el.parentElement;
          let depth = 0;
          while (parent && depth < 10) {
            const inputs = parent.querySelectorAll('input[type="text"]');
            if (inputs.length > 0) {
              // 找到第一个tag类型的输入框
              for (const inp of inputs) {
                if (inp.className && inp.className.includes('tag-input')) {
                  input = inp;
                  break;
                }
              }
              if (input) break;
            }
            parent = parent.parentElement;
            depth++;
          }
          if (input) break;
        }
      }

      // 方法2: 如果方法1失败，通过类名和位置查找
      if (!input) {
        const tagInputs = document.querySelectorAll('input.sd-Input-tag-input-2XNg5');
        for (const inp of tagInputs) {
          const rect = inp.getBoundingClientRect();
          // 选择位置在弹窗内的输入框（top < 400）
          if (rect.width > 0 && rect.height > 0 && rect.top < 400) {
            // 排除"抄送"输入框（placeholder包含"抄送"）
            if (!inp.placeholder || !inp.placeholder.includes('抄送')) {
              input = inp;
              break;
            }
          }
        }
      }

      // 方法3: 通过placeholder查找（备用）
      if (!input) {
        input = document.querySelector('input[placeholder="输入邮箱或选择账号"]');
      }

      if (!input) {
        return { success: false, message: '未找到推荐输入框' };
      }

      // 聚焦并点击输入框
      input.focus();
      input.click();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 清空输入框
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 300));

      // 逐个字符输入，模拟真实输入
      for (const char of name) {
        input.value += char;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 等待下拉菜单出现
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 触发Enter键选择第一个匹配项
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));

      // 等待选择生效
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 验证输入框中显示的名字是否和用户输入的一致
      // 查找已选择的标签（Tag）
      const tagElements = document.querySelectorAll('.sd-Tag-text-2F-n3, .sd-Tag-container-3G3Yk, [class*="Tag-text"], [class*="Tag-container"]');
      let foundTag = false;

      for (const tag of tagElements) {
        if (tag.textContent && tag.textContent.trim() === name) {
          foundTag = true;
          break;
        }
      }

      if (!foundTag) {
        return { success: false, message: '输入框中显示的名字与输入不一致，期望: ' + name };
      }

      addLog('成功添加: ' + name, 'success');

      // 在输入下一个人名前等待一下，确保UI更新完成
      if (i < names.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 等待一下确保所有选择都完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 查找并点击提交按钮
    let submitBtn = null;
    
    // 方法1: 通过精确文本内容查找"推荐并进入用人部门筛选"按钮
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
      const btnText = btn.textContent ? btn.textContent.trim() : '';
      if (btnText === '推荐并进入用人部门筛选') {
        submitBtn = btn;
        break;
      }
    }
    
    // 方法2: 在sd-Dropdown-container-2K__m父元素内查找
    if (!submitBtn) {
      const dropdownContainer = document.querySelector('.sd-Dropdown-container-2K__m, [class*="Dropdown-container"]');
      if (dropdownContainer) {
        const buttons = dropdownContainer.querySelectorAll('button');
        for (const btn of buttons) {
          const btnText = btn.textContent ? btn.textContent.trim() : '';
          if (btnText === '推荐并进入用人部门筛选') {
            submitBtn = btn;
            break;
          }
        }
      }
    }
    
    // 方法3: 使用特定类名组合查找
    if (!submitBtn) {
      const buttons = document.querySelectorAll('button.sd-Button-primary-2asGu.sd-Button-lg-DhBhW');
      for (const btn of buttons) {
        const btnText = btn.textContent ? btn.textContent.trim() : '';
        if (btnText.includes('推荐并进入')) {
          submitBtn = btn;
          break;
        }
      }
    }
    
    if (!submitBtn) {
      return { success: false, message: '未找到提交按钮' };
    }
    
    // 确保按钮可点击
    if (submitBtn.disabled) {
      return { success: false, message: '提交按钮被禁用' };
    }
    
    // 滚动到按钮位置确保可见
    submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 点击提交按钮
    submitBtn.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function navigateToCandidateDetail(candidate) {
  if (pageType === 'infinite-scroll') {
    return navigateToCandidateDetailInfiniteScroll(candidate);
  }
  return navigateToCandidateDetailPagination(candidate);
}

function navigateToCandidateDetailPagination(candidate) {
  // 优先通过ID查找元素（避免DOM引用）
  if (candidate.id) {
    const element = document.getElementById(candidate.id);
    if (element) {
      element.click();
      return true;
    }
  }
  
  // 备用方案：通过姓名查找
  const containers = document.querySelectorAll('.content-OKNZCZyG5d');
  
  for (const container of containers) {
    const nameElement = container.querySelector('.name-zRouov6HCt span');
    if (nameElement && nameElement.textContent.trim() === candidate.name) {
      container.click();
      return true;
    }
  }
  
  return false;
}

function navigateToCandidateDetailInfiniteScroll(candidate) {
  // 优先通过ID查找元素（避免DOM引用）
  if (candidate.id) {
    const trElement = document.getElementById(candidate.id);
    if (trElement) {
      const itemElement = trElement.querySelector('.item-NpfQ8Ve_W4');
      if (itemElement) {
        itemElement.click();
        return true;
      }
      trElement.click();
      return true;
    }
  }
  
  // 备用方案：通过姓名查找
  const items = document.querySelectorAll('.item-NpfQ8Ve_W4');
  
  for (const item of items) {
    const nameElement = item.querySelector('.sd-foundation-heading-60-39PpK');
    if (nameElement) {
      const nameText = nameElement.textContent.trim();
      const nameMatch = nameText.match(/^[\u4e00-\u9fa5]+/);
      if (nameMatch && nameMatch[0] === candidate.name) {
        item.click();
        return true;
      }
    }
  }
  
  return false;
}

function svgToDataUrl(svgElement) {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(svgBlob);
}

// 将 SVG 元素转换为 PNG base64
async function svgToPngBase64(svgElement) {
  return new Promise((resolve, reject) => {
    try {
      // 获取 SVG 尺寸
      const rect = svgElement.getBoundingClientRect();
      const width = rect.width || parseInt(svgElement.getAttribute('width')) || 800;
      const height = rect.height || parseInt(svgElement.getAttribute('height')) || 1000;

      addLog(`SVG 尺寸: ${width}x${height}`, 'info');

      // 创建 canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 填充白色背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 序列化 SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);

      // 创建 Image 对象
      const img = new Image();

      img.onload = function() {
        try {
          // 绘制到 canvas
          ctx.drawImage(img, 0, 0, width, height);

          // 导出为 PNG base64
          const pngBase64 = canvas.toDataURL('image/png');

          if (pngBase64 && pngBase64.startsWith('data:image/png')) {
            addLog(`SVG 转 PNG 成功，大小: ${Math.round(pngBase64.length / 1024)}KB`, 'success');
            resolve(pngBase64);
          } else {
            reject(new Error('Canvas 导出格式不正确'));
          }
        } catch (e) {
          reject(new Error('Canvas 绘制失败: ' + e.message));
        }
      };

      img.onerror = function() {
        reject(new Error('SVG 图片加载失败'));
      };

      // 设置超时
      const timeout = setTimeout(() => {
        reject(new Error('SVG 转 PNG 超时'));
      }, 30000);

      img.onload = function() {
        clearTimeout(timeout);
        try {
          ctx.drawImage(img, 0, 0, width, height);
          const pngBase64 = canvas.toDataURL('image/png');
          if (pngBase64 && pngBase64.startsWith('data:image/png')) {
            addLog(`SVG 转 PNG 成功，大小: ${Math.round(pngBase64.length / 1024)}KB`, 'success');
            resolve(pngBase64);
          } else {
            reject(new Error('Canvas 导出格式不正确'));
          }
        } catch (e) {
          reject(new Error('Canvas 绘制失败: ' + e.message));
        }
      };

      // 使用 blob URL 加载 SVG
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;

    } catch (e) {
      reject(new Error('SVG 转 PNG 失败: ' + e.message));
    }
  });
}

async function blobToDataURL(blobUrl) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', blobUrl, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (this.status === 200) {
        const blob = this.response;
        console.log('[Moka扩展调试] blob.type:', blob.type, 'blob.size:', blob.size);
        const reader = new FileReader();
        reader.onloadend = function() {
          const result = reader.result;
          console.log('[Moka扩展调试] FileReader result 前100字符:', result ? result.substring(0, 100) : 'null');
          console.log('[Moka扩展调试] result.startsWith("data:"):', result ? result.startsWith('data:') : false);
          
          // 验证返回的是否是有效的 data URL
          if (result && result.startsWith('data:')) {
            // 检查 MIME 类型是否正确，如果不正确则尝试修复
            // blob.type 可能是 text/plain，但实际内容可能是图片
            let fixedResult = result;
            
            console.log('[Moka扩展调试] blob.type 检查: blob.type=' + blob.type + ', isImage=' + (blob.type && blob.type.startsWith('image/')));
            
            if (!blob.type || !blob.type.startsWith('image/')) {
              // 从 base64 内容检测图片类型
              const base64Content = result.split(',')[1];
              console.log('[Moka扩展调试] base64Content 前20字符:', base64Content ? base64Content.substring(0, 20) : 'null');
              if (base64Content) {
                // JPEG 文件以 FF D8 FF 开头
                if (base64Content.startsWith('/9j/')) {
                  console.log('[Moka扩展调试] 检测到 JPEG 图片，修复 MIME 类型');
                  fixedResult = result.replace('data:text/plain;base64,', 'data:image/jpeg;base64,');
                  fixedResult = fixedResult.replace('data:application/octet-stream;base64,', 'data:image/jpeg;base64,');
                }
                // PNG 文件以 89 50 4E 47 开头
                else if (base64Content.startsWith('iVBORw0KGgo')) {
                  console.log('[Moka扩展调试] 检测到 PNG 图片，修复 MIME 类型');
                  fixedResult = result.replace('data:text/plain;base64,', 'data:image/png;base64,');
                  fixedResult = fixedResult.replace('data:application/octet-stream;base64,', 'data:image/png;base64,');
                }
                // GIF 文件以 47 49 46 38 开头
                else if (base64Content.startsWith('R0lGOD')) {
                  console.log('[Moka扩展调试] 检测到 GIF 图片，修复 MIME 类型');
                  fixedResult = result.replace('data:text/plain;base64,', 'data:image/gif;base64,');
                  fixedResult = fixedResult.replace('data:application/octet-stream;base64,', 'data:image/gif;base64,');
                }
                // WebP 文件以 52 49 46 46 ... 57 45 42 50 开头
                else if (base64Content.startsWith('UklGR')) {
                  console.log('[Moka扩展调试] 检测到 WebP 图片，修复 MIME 类型');
                  fixedResult = result.replace('data:text/plain;base64,', 'data:image/webp;base64,');
                  fixedResult = fixedResult.replace('data:application/octet-stream;base64,', 'data:image/webp;base64,');
                }
              }
            }
            
            console.log('[Moka扩展调试] fixedResult 前100字符:', fixedResult ? fixedResult.substring(0, 100) : 'null');
            console.log('[Moka扩展调试] fixedResult.startsWith("data:image"):', fixedResult ? fixedResult.startsWith('data:image') : false);
            resolve(fixedResult);
          } else {
            reject(new Error('转换后的URL不是有效的data URL格式'));
          }
        };
        reader.onerror = function(e) {
          reject(new Error('FileReader读取失败: ' + e.message));
        };
        reader.readAsDataURL(blob);
      } else {
        reject(new Error('获取blob失败，状态码: ' + this.status));
      }
    };
    xhr.onerror = function() {
      reject(new Error('XHR请求失败，可能是跨域或网络问题'));
    };
    xhr.ontimeout = function() {
      reject(new Error('XHR请求超时'));
    };
    xhr.timeout = 30000; // 30秒超时
    xhr.send();
  });
}

async function captureResume() {
  addLog('开始获取简历图片...', 'info');
  await new Promise(resolve => setTimeout(resolve, 4000));

  // 方法1: 处理 .img-blob 元素 (blob URL)
  const imgBlobElements = document.querySelectorAll('.img-blob');
  addLog(`找到 ${imgBlobElements.length} 个 .img-blob 元素`, 'info');
  if (imgBlobElements.length > 0) {
    const dataUrls = [];
    for (let i = 0; i < imgBlobElements.length; i++) {
      const img = imgBlobElements[i];
      addLog(`处理第 ${i + 1}/${imgBlobElements.length} 张图片, src类型: ${img.src ? img.src.substring(0, 30) + '...' : '无src'}`, 'info');

      if (img.src && img.src.startsWith('blob:')) {
        try {
          addLog(`转换 blob URL 为 base64...`, 'info');
          const dataUrl = await blobToDataURL(img.src);
          addLog(`第 ${i + 1} 张图片转换结果: ${dataUrl ? dataUrl.substring(0, 80) + '...' : 'null'}`, 'info');
          addLog(`第 ${i + 1} 张图片 dataUrl 类型检查: startsWith('data:image')=${dataUrl ? dataUrl.startsWith('data:image') : false}`, 'info');
          if (dataUrl && dataUrl.startsWith('data:image')) {
            dataUrls.push(dataUrl);
            addLog(`第 ${i + 1} 张图片转换成功`, 'success');
          } else {
            addLog(`第 ${i + 1} 张图片转换后格式不正确`, 'warning');
          }
        } catch (e) {
          addLog(`第 ${i + 1} 张图片转换失败: ${e.message}`, 'error');
        }
      } else if (img.src && img.src.startsWith('data:image')) {
        // 已经是 base64 格式
        dataUrls.push(img.src);
        addLog(`第 ${i + 1} 张图片已是 base64 格式`, 'info');
      } else if (img.src && (img.src.startsWith('http://') || img.src.startsWith('https://'))) {
        // 是 http/https URL，直接使用
        dataUrls.push(img.src);
        addLog(`第 ${i + 1} 张图片是 http/https URL`, 'info');
      } else {
        addLog(`第 ${i + 1} 张图片格式不支持: ${img.src ? img.src.substring(0, 50) : '无src'}`, 'warning');
      }
    }
    if (dataUrls.length > 0) {
      addLog(`成功获取 ${dataUrls.length}/${imgBlobElements.length} 张简历图片`, 'success');
      return dataUrls;
    } else {
      addLog('未能成功转换任何图片', 'error');
    }
  }

  // 方法2: 处理 .img-page 元素
  const resumeImages = document.querySelectorAll('.img-page, img[src*="pdf_"]');
  addLog(`找到 ${resumeImages.length} 个 .img-page 元素`, 'info');
  if (resumeImages.length > 0) {
    const validUrls = [];
    for (let i = 0; i < resumeImages.length; i++) {
      const img = resumeImages[i];
      if (img.src) {
        if (img.src.startsWith('data:image') || img.src.startsWith('http://') || img.src.startsWith('https://')) {
          validUrls.push(img.src);
          addLog(`第 ${i + 1} 张图片 URL 格式有效`, 'info');
        } else if (img.src.startsWith('blob:')) {
          try {
            const dataUrl = await blobToDataURL(img.src);
            validUrls.push(dataUrl);
            addLog(`第 ${i + 1} 张 blob 图片转换成功`, 'success');
          } catch (e) {
            addLog(`第 ${i + 1} 张 blob 图片转换失败: ${e.message}`, 'error');
          }
        } else {
          addLog(`第 ${i + 1} 张图片格式不支持: ${img.src.substring(0, 50)}`, 'warning');
        }
      }
    }
    if (validUrls.length > 0) {
      addLog(`成功获取 ${validUrls.length} 张简历图片`, 'success');
      return validUrls;
    }
  }

  // 方法3: 处理 iframe 中的简历
  const iframeResume = document.getElementById('iframeResume');
  if (iframeResume) {
    addLog('检测到 iframe 简历，尝试提取...', 'info');
    try {
      const iframeDoc = iframeResume.contentDocument || iframeResume.contentWindow.document;
      const wordPage = iframeDoc.querySelector('.word-page');
      if (wordPage) {
        const svgElement = wordPage.querySelector('svg');
        if (svgElement) {
          addLog('找到 SVG 简历，转换为 PNG...', 'info');
          // 将 SVG 转换为 PNG base64
          try {
            const pngBase64 = await svgToPngBase64(svgElement);
            addLog('SVG 转 PNG 成功', 'success');
            return [pngBase64];
          } catch (e) {
            addLog(`SVG 转 PNG 失败: ${e.message}，尝试备用方案...`, 'error');
            // 备用方案：尝试直接序列化为 SVG base64（某些API可能支持）
            try {
              const svgData = new XMLSerializer().serializeToString(svgElement);
              const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
              addLog('使用备用方案：SVG base64', 'warning');
              return [svgBase64];
            } catch (svgError) {
              addLog(`备用方案也失败: ${svgError.message}`, 'error');
            }
          }
        }
      }

      let structuredResume = iframeDoc.querySelector('.flexAlignStart--o1K7u, .content--j99Ec, .cardLeft--IcRB1');
      if (!structuredResume) {
        structuredResume = iframeDoc.querySelector('#water-mark-wrap, .cardLeft--ZsR4w, .board--CYPTx');
      }

      if (structuredResume) {
        addLog('找到结构化简历，尝试使用 html2canvas...', 'info');
        try {
          if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(structuredResume, {
              backgroundColor: '#FFFFFF',
              scale: 2,
              useCORS: true,
              allowTaint: true
            });
            const dataUrl = canvas.toDataURL('image/png');
            addLog('html2canvas 截图成功', 'success');
            return [dataUrl];
          } else {
            addLog('html2canvas 未加载，无法截图', 'warning');
          }
        } catch (e) {
          addLog(`html2canvas 失败: ${e.message}`, 'error');
        }
      }

      // 方法3.3: 处理纯 HTML 格式的简历（如猎聘邮件模板、Moka 人才库详情页）
      addLog('尝试处理 HTML 格式简历...', 'info');
      try {
        const body = iframeDoc.body;
        if (body) {
          // 检查是否有简历内容
          // 放宽条件：只要有工作经历或教育经历，就认为是简历
          const bodyText = body.innerText;
          const hasResumeContent = bodyText.includes('工作经历') || 
                                   bodyText.includes('教育经历') || 
                                   bodyText.includes('基本信息') ||
                                   bodyText.includes('求职意向') ||
                                   body.querySelector('.resume-detail--bordered, .resume-content, [class*="resume"]') !== null;
          
          if (hasResumeContent) {
            addLog('检测到 HTML table 格式简历，尝试截图...', 'info');
            
            // 尝试使用 html2canvas 截图整个 body
            if (typeof html2canvas !== 'undefined') {
              try {
                const canvas = await html2canvas(body, {
                  backgroundColor: '#FFFFFF',
                  scale: 2,
                  useCORS: true,
                  allowTaint: true,
                  logging: false
                });
                const dataUrl = canvas.toDataURL('image/png');
                addLog('HTML 简历截图成功', 'success');
                return [dataUrl];
              } catch (canvasError) {
                addLog(`html2canvas 截图失败: ${canvasError.message}，尝试备用方案...`, 'error');
              }
            }
            
            // 备用方案：创建一个新的 canvas 来绘制 HTML 内容
            try {
              addLog('尝试使用备用方案生成图片...', 'info');
              const width = 800;
              const height = Math.min(body.scrollHeight, 3000); // 限制最大高度
              
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              
              // 填充白色背景
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              
              // 绘制文本内容
              ctx.fillStyle = '#333333';
              ctx.font = '14px Arial';
              
              const text = body.innerText;
              const lines = text.split('\n').filter(line => line.trim());
              let y = 30;
              const lineHeight = 20;
              const maxLines = Math.floor((height - 60) / lineHeight);
              
              for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
                const line = lines[i].trim();
                if (line) {
                  // 处理长文本换行
                  const maxWidth = width - 40;
                  let currentLine = '';
                  
                  for (let char of line) {
                    const testLine = currentLine + char;
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && currentLine.length > 0) {
                      ctx.fillText(currentLine, 20, y);
                      y += lineHeight;
                      currentLine = char;
                    } else {
                      currentLine = testLine;
                    }
                  }
                  
                  if (currentLine) {
                    ctx.fillText(currentLine, 20, y);
                    y += lineHeight;
                  }
                }
              }
              
              const dataUrl = canvas.toDataURL('image/png');
              addLog('备用方案生成图片成功', 'success');
              return [dataUrl];
            } catch (fallbackError) {
              addLog(`备用方案也失败: ${fallbackError.message}`, 'error');
            }
          }
        }
      } catch (htmlError) {
        addLog(`处理 HTML 简历失败: ${htmlError.message}`, 'error');
      }
    } catch (e) {
      addLog(`访问 iframe 失败: ${e.message}`, 'error');
    }
  }

  // 方法4: 尝试查找页面中所有图片
  addLog('尝试查找页面中所有可能的简历图片...', 'info');
  const allImages = document.querySelectorAll('img');
  const possibleResumeImages = [];
  for (const img of allImages) {
    if (img.src && (
      img.src.includes('resume') ||
      img.src.includes('cv') ||
      img.src.includes('pdf') ||
      img.className.includes('resume') ||
      img.className.includes('cv')
    )) {
      possibleResumeImages.push(img);
    }
  }

  if (possibleResumeImages.length > 0) {
    addLog(`找到 ${possibleResumeImages.length} 个可能的简历图片`, 'info');
    const validUrls = [];
    for (let i = 0; i < possibleResumeImages.length; i++) {
      const img = possibleResumeImages[i];
      if (img.src.startsWith('data:image') || img.src.startsWith('http')) {
        validUrls.push(img.src);
      } else if (img.src.startsWith('blob:')) {
        try {
          const dataUrl = await blobToDataURL(img.src);
          validUrls.push(dataUrl);
        } catch (e) {
          addLog(`图片 ${i + 1} 转换失败: ${e.message}`, 'error');
        }
      }
    }
    if (validUrls.length > 0) {
      return validUrls;
    }
  }

  addLog('未能找到任何有效的简历图片', 'error');
  return null;
}

async function evaluateWithFullCriteria(imageUrls, candidateName) {
  // 使用配置文件中的模型和提示词
  const screeningConfig = getConfig();
  const modelName = config.modelType || screeningConfig.api.defaultModel;
  const systemPrompt = screeningConfig.systemPrompts.detailedEvaluation;
  const userPrompt = screeningConfig.userPrompts.detailedEvaluation(config.fullScreeningCriteria);

  // 验证并过滤图片 URL
  const validImageUrls = [];
  const invalidUrls = [];

  for (const url of imageUrls) {
    if (url && (
      url.startsWith('data:image') ||
      url.startsWith('http://') ||
      url.startsWith('https://')
    )) {
      validImageUrls.push(url);
    } else {
      invalidUrls.push(url ? url.substring(0, 50) + '...' : '空URL');
    }
  }

  if (invalidUrls.length > 0) {
    addLog(`发现 ${invalidUrls.length} 个无效的图片 URL: ${invalidUrls.join(', ')}`, 'warning');
  }

  if (validImageUrls.length === 0) {
    addLog('没有有效的图片 URL 可供评估', 'error');
    return {
      success: false,
      message: '没有有效的简历图片URL，API只支持 base64、http 或 https 格式的图片'
    };
  }

  addLog(`使用 ${validImageUrls.length}/${imageUrls.length} 张有效图片进行评估`, 'info');

  let messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];

  const userContent = [
    {
      type: 'text',
      text: userPrompt
    }
  ];

  validImageUrls.forEach((url, index) => {
    const urlType = url.startsWith('data:image') ? 'base64' : (url.startsWith('http') ? 'http' : 'other');
    addLog(`添加第 ${index + 1} 张图片到请求，类型: ${urlType}`, 'info');
    userContent.push({
      type: 'image_url',
      image_url: {
        url: url
      }
    });
  });

  messages.push({
    role: 'user',
    content: userContent
  });

  const requestData = {
    model: modelName,
    messages: messages,
    temperature: screeningConfig.api.requestConfig.temperature
  };

  try {
    addLog(`开始评估候选人 ${candidateName}，模型: ${modelName}，简历图片: ${imageUrls.length} 张`, 'info');

    const response = await callLLMWithRetry(config.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.apiKey
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const responseContent = data.choices[0].message.content;
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          addLog(`候选人 ${candidateName} 评估完成，结果: ${result.qualified ? '符合' : '不符合'}`, result.qualified ? 'success' : 'info');
          return {
            success: true,
            data: result
          };
        } catch (e) {
          addLog(`解析候选人 ${candidateName} 评估结果失败: ${e.message}`, 'error');
          return {
            success: false,
            message: '解析结果失败: ' + e.message
          };
        }
      } else {
        addLog(`候选人 ${candidateName} 评估返回格式不正确`, 'error');
        return {
          success: false,
          message: '模型返回格式不正确'
        };
      }
    } else {
      const errorMsg = data.error?.message || '未知的API错误';
      addLog(`候选人 ${candidateName} 模型调用失败: ${errorMsg}`, 'error');
      return {
        success: false,
        message: '模型调用失败: ' + errorMsg
      };
    }
  } catch (error) {
    addLog(`候选人 ${candidateName} 评估API请求失败: ${error.message}`, 'error');
    return {
      success: false,
      message: '请求失败: ' + error.message
    };
  }
}

async function getCurrentPage() {
  const pageButtons = document.querySelectorAll('.sd-Pagination-item-3TlyN[data-page]');
  console.log('[Moka翻页调试] 找到分页按钮数量:', pageButtons.length);
  
  for (const btn of pageButtons) {
    const isActive = btn.classList.contains('sd-Pagination-is-active-1Dck9') || 
                     btn.classList.contains('sd-Pagination-itemActive-1D0_0') || 
                     btn.classList.contains('active') || 
                     btn.getAttribute('aria-current') === 'page';
    console.log('[Moka翻页调试] 按钮检查:', {
      dataPage: btn.getAttribute('data-page'),
      textContent: btn.textContent,
      className: btn.className,
      isActive: isActive
    });
    
    if (isActive) {
      const page = parseInt(btn.getAttribute('data-page')) || parseInt(btn.textContent);
      console.log('[Moka翻页调试] 找到活动页码:', page);
      return page;
    }
  }
  
  const activeBtn = document.querySelector('.sd-Pagination-item-3TlyN.active, .sd-Pagination-itemActive-1D0_0, .sd-Pagination-is-active-1Dck9');
  if (activeBtn) {
    const page = parseInt(activeBtn.getAttribute('data-page')) || parseInt(activeBtn.textContent);
    console.log('[Moka翻页调试] 通过备用选择器找到活动页码:', page);
    return page;
  }
  
  const firstPageBtn = document.querySelector('.sd-Pagination-item-3TlyN[data-page="1"]');
  if (firstPageBtn && firstPageBtn === document.querySelector('.sd-Pagination-item-3TlyN')) {
    console.log('[Moka翻页调试] 默认返回第1页');
    return 1;
  }
  
  console.log('[Moka翻页调试] 未找到活动页码，默认返回1');
  return 1;
}

async function waitForPage(pageNum, maxRetries = 5, delayMs = 500) {
  for (let i = 0; i < maxRetries; i++) {
    const currentPage = await getCurrentPage();
    if (currentPage === pageNum) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
}

async function goToNextPage() {
  const targetPage = currentPage + 1;
  console.log('[Moka翻页调试] 准备翻到第', targetPage, '页, 当前currentPage变量:', currentPage);
  
  let pageButton = document.querySelector(`.sd-Pagination-item-3TlyN[data-page="${targetPage}"]`);
  console.log('[Moka翻页调试] 目标页按钮是否存在:', !!pageButton);
  
  if (!pageButton) {
    const nextButton = document.querySelector('.sd-Pagination-forward-Qh_cN');
    console.log('[Moka翻页调试] 下一页按钮是否存在:', !!nextButton, '是否禁用:', nextButton?.disabled);
    if (!nextButton || nextButton.disabled) {
      console.log('[Moka翻页调试] 没有下一页，返回false');
      return false;
    }
    addLog('目标页按钮不存在，尝试使用下一页按钮...', 'info');
    nextButton.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    return true;
  }
  
  addLog(`翻到第 ${targetPage} 页...`, 'info');
  console.log('[Moka翻页调试] 点击前按钮状态:', {
    dataPage: pageButton.getAttribute('data-page'),
    className: pageButton.className,
    textContent: pageButton.textContent,
    href: pageButton.getAttribute('href'),
    tagName: pageButton.tagName,
    parentClassName: pageButton.parentElement?.className
  });
  
  console.log('[Moka翻页调试] 点击前URL:', window.location.href);
  
  // 检查按钮是否是链接，如果是则阻止默认行为
  if (pageButton.tagName === 'A' && pageButton.getAttribute('href')) {
    console.log('[Moka翻页调试] 警告：按钮是链接元素，href=', pageButton.getAttribute('href'));
  }
  
  pageButton.click();
  console.log('[Moka翻页调试] 已点击翻页按钮');
  console.log('[Moka翻页调试] 点击后URL:', window.location.href);
  
  // 等待页面开始加载（分页按钮消失表示正在加载）
  console.log('[Moka翻页调试] 等待页面开始加载...');
  let loadStartRetries = 0;
  while (loadStartRetries < 10) {
    const buttons = document.querySelectorAll('.sd-Pagination-item-3TlyN[data-page]');
    if (buttons.length === 0) {
      console.log('[Moka翻页调试] 页面开始加载，分页按钮已消失');
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    loadStartRetries++;
  }
  
  // 等待页面加载完成（分页按钮重新出现）
  console.log('[Moka翻页调试] 等待页面加载完成...');
  let loadCompleteRetries = 0;
  while (loadCompleteRetries < 30) {
    const buttons = document.querySelectorAll('.sd-Pagination-item-3TlyN[data-page]');
    const candidates = document.querySelectorAll('.content-OKNZCZyG5d');
    if (buttons.length > 0 && candidates.length > 0) {
      console.log('[Moka翻页调试] 页面加载完成，分页按钮数量:', buttons.length, '候选人数量:', candidates.length);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    loadCompleteRetries++;
  }
  
  // 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const pageReached = await waitForPage(targetPage, 8, 500);
  console.log('[Moka翻页调试] waitForPage结果:', pageReached);
  
  const actualPage = await getCurrentPage();
  addLog(`当前页面已翻到第 ${actualPage} 页`, 'info');
  
  if (!pageReached || actualPage !== targetPage) {
    addLog(`警告：期望翻到第 ${targetPage} 页，实际在第 ${actualPage} 页，准备重试...`, 'warning');
    
    pageButton = document.querySelector(`.sd-Pagination-item-3TlyN[data-page="${targetPage}"]`);
    if (pageButton) {
      console.log('[Moka翻页调试] 重试点击翻页按钮');
      pageButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await waitForPage(targetPage, 8, 500);
      const retryPage = await getCurrentPage();
      addLog(`重试后当前页面: 第 ${retryPage} 页`, 'info');
      
      // 如果重试后仍然失败，返回false
      if (retryPage !== targetPage) {
        console.log('[Moka翻页调试] 重试后仍然失败，返回false');
        return false;
      }
    }
  }
  
  console.log('[Moka翻页调试] 翻页成功，返回true');
  return true;
}

async function loadCandidatesViaInfiniteScroll(targetNum) {
  addLog('开始通过无限滚动加载候选人，目标: ' + targetNum, 'info');
  
  let lastCount = 0;
  let noNewCount = 0;
  const maxRetries = 5;
  
  while (isRunning && !isStopped) {
    await checkPause();
    if (isStopped) break;
    
    const currentCount = document.querySelectorAll('tr[id]').length;
    
    if (currentCount >= targetNum) {
      addLog('已加载足够的候选人: ' + currentCount, 'success');
      break;
    }
    
    if (currentCount === lastCount) {
      noNewCount++;
      if (noNewCount >= maxRetries) {
        addLog('无法加载更多候选人，当前数量: ' + currentCount, 'warning');
        break;
      }
    } else {
      noNewCount = 0;
      lastCount = currentCount;
    }
    
    addLog('当前已加载 ' + currentCount + ' 位候选人，继续滚动...', 'info');
    await performScroll();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return document.querySelectorAll('tr[id]').length;
}

async function performScroll() {
  const tbody = document.querySelector('tbody');
  if (tbody) {
    tbody.scrollTop = tbody.scrollHeight;
    return true;
  }
  
  const mainPanel = document.querySelector('.main-panel');
  if (mainPanel) {
    mainPanel.scrollTop = mainPanel.scrollHeight;
    return true;
  }
  
  window.scrollTo(0, document.documentElement.scrollHeight);
  return true;
}
