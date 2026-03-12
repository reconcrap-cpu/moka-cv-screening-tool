# 模块测试详细流程

## 1. 测试环境准备

### 1.1 加载扩展

1. 打开Chrome浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录：`c:\Users\yaolin\Documents\trae_projects\moka_chrome extension tool 2.0`

### 1.2 验证扩展加载

打开任意网页，按F12打开开发者工具，在Console中执行：
```javascript
console.log('扩展加载检测:');
console.log('- MokaSelectors:', typeof MokaSelectors);
console.log('- MokaDOMUtils:', typeof MokaDOMUtils);
console.log('- MokaLogger:', typeof MokaLogger);
```

预期输出：
```
扩展加载检测:
- MokaSelectors: object
- MokaDOMUtils: object
- MokaLogger: object
```

---

## 2. 第一阶段：工具模块测试

### 2.1 Selectors.js 测试

**测试位置**：任意网页控制台

**测试步骤**：

```javascript
// 测试1：验证模块加载
console.log('=== Selectors.js 测试 ===');
console.log('1. 模块加载:', typeof MokaSelectors !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：查看选择器配置结构
console.log('2. 选择器配置结构:');
console.log('   - candidateList:', typeof MokaSelectors.Selectors.candidateList);
console.log('   - candidateInfo:', typeof MokaSelectors.Selectors.candidateInfo);
console.log('   - resumeDetail:', typeof MokaSelectors.Selectors.resumeDetail);
console.log('   - resumeImages:', typeof MokaSelectors.Selectors.resumeImages);
console.log('   - recommendation:', typeof MokaSelectors.Selectors.recommendation);
console.log('   - pagination:', typeof MokaSelectors.Selectors.pagination);

// 测试3：获取单个选择器
var selector = MokaSelectors.getSelector('candidateList.pagination');
console.log('3. 获取选择器:', selector ? '✅ 通过' : '❌ 失败');
console.log('   返回值:', selector);

// 测试4：获取带降级的选择器
var selectors = MokaSelectors.getSelectorWithFallback('candidateList.pagination');
console.log('4. 获取降级选择器:', selectors ? '✅ 通过' : '❌ 失败');
console.log('   返回值:', selectors);

// 测试5：验证选择器语法
var isValid = MokaSelectors.validateSelector('.content-OKNZCZyG5d');
console.log('5. 验证选择器语法:', isValid ? '✅ 通过' : '❌ 失败');

// 测试6：查看变更日志
console.log('6. 变更日志记录数:', MokaSelectors.SelectorChangeLog.length);
```

**预期结果**：
```
=== Selectors.js 测试 ===
1. 模块加载: ✅ 通过
2. 选择器配置结构:
   - candidateList: object
   - candidateInfo: object
   - resumeDetail: object
   - resumeImages: object
   - recommendation: object
   - pagination: object
3. 获取选择器: ✅ 通过
   返回值: .content-OKNZCZyG5d
4. 获取降级选择器: ✅ 通过
   返回值: ['.content-OKNZCZyG5d', 'div[class*="candidate"]', ...]
5. 验证选择器语法: ✅ 通过
6. 变更日志记录数: 1
```

---

### 2.2 SelectorMonitor.js 测试

**测试位置**：任意网页控制台

**测试步骤**：

```javascript
// 测试1：验证模块加载
console.log('=== SelectorMonitor.js 测试 ===');
console.log('1. 模块加载:', typeof MokaSelectorMonitor !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：快速检查单个选择器
var quickResult = MokaSelectorMonitor.quickCheck('candidateList.pagination');
console.log('2. 快速检查:', quickResult ? '✅ 通过' : '❌ 失败');
console.log('   结果:', quickResult);

// 测试3：测试选择器有效性
var testResult = MokaSelectorMonitor.testSelector('body');
console.log('3. 测试选择器:', testResult.valid ? '✅ 通过' : '❌ 失败');
console.log('   匹配数量:', testResult.count);

// 测试4：生成健康报告
console.log('4. 生成健康报告:');
var report = MokaSelectorMonitor.generateHealthReport();
console.log('   - 总计:', report.summary.total);
console.log('   - 有效:', report.summary.valid);
console.log('   - 失效:', report.summary.invalid);
console.log('   - 健康率:', report.summary.healthRate);

// 测试5：打印完整报告
console.log('5. 打印完整报告:');
MokaSelectorMonitor.printReport();
```

**预期结果**：
```
=== SelectorMonitor.js 测试 ===
1. 模块加载: ✅ 通过
2. 快速检查: ✅ 通过
   结果: {category: 'candidateList.pagination', results: [...], hasValid: true}
3. 测试选择器: ✅ 通过
   匹配数量: 1
4. 生成健康报告:
   - 总计: 20+
   - 有效: X
   - 失效: Y
   - 健康率: XX%
5. 打印完整报告:
   ========== Moka选择器健康报告 ==========
   ...
```

---

### 2.3 DOMUtils.js 测试

**测试位置**：任意网页控制台

**测试步骤**：

```javascript
// 测试1：验证模块加载
console.log('=== DOMUtils.js 测试 ===');
console.log('1. 模块加载:', typeof MokaDOMUtils !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：querySelector测试
var body = MokaDOMUtils.querySelector('body');
console.log('2. querySelector:', body ? '✅ 通过' : '❌ 失败');

// 测试3：querySelectorAll测试
var allDivs = MokaDOMUtils.querySelectorAll('div');
console.log('3. querySelectorAll:', allDivs.length > 0 ? '✅ 通过' : '❌ 失败');
console.log('   找到div数量:', allDivs.length);

// 测试4：getTextContent测试
var text = MokaDOMUtils.getTextContent(body);
console.log('4. getTextContent:', text.length > 0 ? '✅ 通过' : '❌ 失败');
console.log('   文本长度:', text.length);

// 测试5：waitForElement测试
console.log('5. waitForElement测试...');
MokaDOMUtils.waitForElement('body', {timeout: 1000})
  .then(function(el) {
    console.log('   waitForElement: ✅ 通过');
  })
  .catch(function(err) {
    console.log('   waitForElement: ❌ 失败 -', err.message);
  });

// 测试6：findClosest测试
var closest = MokaDOMUtils.findClosest(body, 'html');
console.log('6. findClosest:', closest ? '✅ 通过' : '❌ 失败');

// 测试7：isVisible测试
var visible = MokaDOMUtils.isVisible(body);
console.log('7. isVisible:', visible ? '✅ 通过' : '❌ 失败');

// 测试8：parseDelimitedText测试
var parts = MokaDOMUtils.parseDelimitedText('学校|专业|学历|年份', '|');
console.log('8. parseDelimitedText:', parts.length === 4 ? '✅ 通过' : '❌ 失败');
console.log('   解析结果:', parts);

// 测试9：extractTextByPattern测试
var year = MokaDOMUtils.extractTextByPattern('2020-2024', /\d{4}/g, 0);
console.log('9. extractTextByPattern:', year === '2020' ? '✅ 通过' : '❌ 失败');
console.log('   提取年份:', year);
```

**预期结果**：
```
=== DOMUtils.js 测试 ===
1. 模块加载: ✅ 通过
2. querySelector: ✅ 通过
3. querySelectorAll: ✅ 通过
   找到div数量: X
4. getTextContent: ✅ 通过
   文本长度: X
5. waitForElement测试...
   waitForElement: ✅ 通过
6. findClosest: ✅ 通过
7. isVisible: ✅ 通过
8. parseDelimitedText: ✅ 通过
   解析结果: ['学校', '专业', '学历', '年份']
9. extractTextByPattern: ✅ 通过
   提取年份: 2020
```

---

### 2.4 Logger.js 测试

**测试位置**：任意网页控制台

**测试步骤**：

```javascript
// 测试1：验证模块加载
console.log('=== Logger.js 测试 ===');
console.log('1. 模块加载:', typeof MokaLogger !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：设置tabId
MokaLogger.setTabId(1);
console.log('2. setTabId: ✅ 已设置');

// 测试3：测试各级别日志
console.log('3. 测试各级别日志:');
MokaLogger.debug('这是debug日志');
MokaLogger.info('这是info日志');
MokaLogger.success('这是success日志');
MokaLogger.warning('这是warning日志');
MokaLogger.error('这是error日志');

// 测试4：查看日志缓冲区
var buffer = MokaLogger.getLogBuffer();
console.log('4. getLogBuffer:', buffer.length > 0 ? '✅ 通过' : '❌ 失败');
console.log('   缓冲区记录数:', buffer.length);

// 测试5：按类型获取日志
var errorLogs = MokaLogger.getLogBufferByType('error');
console.log('5. getLogBufferByType:', errorLogs.length >= 0 ? '✅ 通过' : '❌ 失败');
console.log('   error日志数:', errorLogs.length);

// 测试6：导出日志
var exported = MokaLogger.exportLogBuffer('json');
console.log('6. exportLogBuffer:', exported.length > 0 ? '✅ 通过' : '❌ 失败');

// 测试7：测试日志级别控制
MokaLogger.setLevel('WARNING');
MokaLogger.info('这条info日志不应该显示');
MokaLogger.warning('这条warning日志应该显示');
MokaLogger.setLevel('INFO'); // 恢复
console.log('7. 日志级别控制: ✅ 通过');

// 测试8：清空缓冲区
MokaLogger.clearLogBuffer();
var clearedBuffer = MokaLogger.getLogBuffer();
console.log('8. clearLogBuffer:', clearedBuffer.length === 0 ? '✅ 通过' : '❌ 失败');
```

**预期结果**：
```
=== Logger.js 测试 ===
1. 模块加载: ✅ 通过
2. setTabId: ✅ 已设置
3. 测试各级别日志:
   [时间] [DEBUG] 这是debug日志
   [时间] [INFO] 这是info日志
   [时间] [SUCCESS] 这是success日志 (绿色)
   [时间] [WARNING] 这是warning日志
   [时间] [ERROR] 这是error日志
4. getLogBuffer: ✅ 通过
   缓冲区记录数: 5
5. getLogBufferByType: ✅ 通过
   error日志数: 1
6. exportLogBuffer: ✅ 通过
7. 日志级别控制: ✅ 通过
8. clearLogBuffer: ✅ 通过
```

---

### 2.5 StorageUtils.js 测试

**测试位置**：任意网页控制台（需要扩展环境）

**测试步骤**：

```javascript
// 测试1：验证模块加载
console.log('=== StorageUtils.js 测试 ===');
console.log('1. 模块加载:', typeof MokaStorageUtils !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：同步存储测试
MokaStorageUtils.setSync('test_sync_key', 'test_sync_value');
var syncValue = MokaStorageUtils.getSync('test_sync_key');
console.log('2. 同步存储:', syncValue === 'test_sync_value' ? '✅ 通过' : '❌ 失败');
console.log('   读取值:', syncValue);

// 测试3：异步存储测试
console.log('3. 异步存储测试...');
MokaStorageUtils.set('test_async_key', {name: '测试', value: 123})
  .then(function() {
    console.log('   set: ✅ 通过');
    return MokaStorageUtils.get('test_async_key');
  })
  .then(function(value) {
    console.log('   get: ✅ 通过');
    console.log('   读取值:', value);
  })
  .catch(function(err) {
    console.log('   ❌ 失败:', err.message);
  });

// 测试4：缓存测试
MokaStorageUtils.setToCache('test_cache', 'cached_value');
var cached = MokaStorageUtils.getFromCache('test_cache');
console.log('4. 缓存测试:', cached === 'cached_value' ? '✅ 通过' : '❌ 失败');

// 测试5：存储使用量
MokaStorageUtils.getStorageUsage()
  .then(function(usage) {
    console.log('5. getStorageUsage: ✅ 通过');
    console.log('   已用字节:', usage.bytesInUse);
    console.log('   配额:', usage.quota);
  });

// 测试6：批量存储
console.log('6. 批量存储测试...');
MokaStorageUtils.setMultiple({
  key1: 'value1',
  key2: 'value2',
  key3: 'value3'
}).then(function() {
  return MokaStorageUtils.getMultiple(['key1', 'key2', 'key3']);
}).then(function(result) {
  console.log('   批量存储: ✅ 通过');
  console.log('   结果:', result);
});

// 测试7：删除测试
console.log('7. 删除测试...');
MokaStorageUtils.remove('test_async_key')
  .then(function() {
    return MokaStorageUtils.get('test_async_key');
  })
  .then(function(value) {
    console.log('   remove: ✅ 通过');
    console.log('   删除后读取:', value);
  });
```

**预期结果**：
```
=== StorageUtils.js 测试 ===
1. 模块加载: ✅ 通过
2. 同步存储: ✅ 通过
   读取值: test_sync_value
3. 异步存储测试...
   set: ✅ 通过
   get: ✅ 通过
   读取值: {name: '测试', value: 123}
4. 缓存测试: ✅ 通过
5. getStorageUsage: ✅ 通过
   已用字节: X
   配额: 5242880
6. 批量存储测试...
   批量存储: ✅ 通过
   结果: {key1: 'value1', key2: 'value2', key3: 'value3'}
7. 删除测试...
   remove: ✅ 通过
   删除后读取: null
```

---

## 3. 第二阶段：业务模块测试

### 3.1 测试环境要求

业务模块需要在Moka招聘系统页面上测试：

| 模块 | 测试页面 | URL示例 |
|------|----------|---------|
| CandidateListModule | 候选人列表页 | https://xxx.mokahr.com/candidates |
| ResumeDetailModule | 候选人详情页 | 点击候选人进入 |
| ResumeImageModule | 简历页 | 详情页中的简历区域 |
| RecommendationModule | 详情页 | 详情页中的推荐功能 |

### 3.2 CandidateListModule.js 测试

**测试位置**：Moka候选人列表页

**测试步骤**：

```javascript
// 确保在Moka候选人列表页
console.log('=== CandidateListModule.js 测试 ===');

// 测试1：验证模块加载
console.log('1. 模块加载:', typeof MokaCandidateListModule !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：检测页面类型
var pageType = MokaCandidateListModule.detectPageType();
console.log('2. detectPageType: ✅ 通过');
console.log('   页面类型:', pageType);

// 测试3：获取页面类型
var currentType = MokaCandidateListModule.getPageType();
console.log('3. getPageType:', currentType ? '✅ 通过' : '❌ 失败');
console.log('   当前类型:', currentType);

// 测试4：提取候选人
console.log('4. 提取候选人测试...');
var candidates = MokaCandidateListModule.extractCandidates();
console.log('   extractCandidates:', candidates.length > 0 ? '✅ 通过' : '❌ 失败');
console.log('   候选人数量:', candidates.length);

// 测试5：查看候选人详情
if (candidates.length > 0) {
  console.log('5. 第一个候选人信息:');
  console.log('   - ID:', candidates[0].id);
  console.log('   - 姓名:', candidates[0].name);
  console.log('   - 学校:', candidates[0].school);
  console.log('   - 专业:', candidates[0].major);
  console.log('   - 学历:', candidates[0].education);
  console.log('   - 毕业年份:', candidates[0].graduationYear);
}

// 测试6：导航测试（不实际执行，只验证函数存在）
console.log('6. navigateToCandidate函数:', typeof MokaCandidateListModule.navigateToCandidate === 'function' ? '✅ 通过' : '❌ 失败');
```

**预期结果**：
```
=== CandidateListModule.js 测试 ===
1. 模块加载: ✅ 通过
2. detectPageType: ✅ 通过
   页面类型: pagination 或 infinite-scroll
3. getPageType: ✅ 通过
   当前类型: pagination 或 infinite-scroll
4. 提取候选人测试...
   [MokaLogger] 分页模式提取到 X 位候选人
   extractCandidates: ✅ 通过
   候选人数量: X
5. 第一个候选人信息:
   - ID: candidate_xxx
   - 姓名: 张三
   - 学校: XX大学
   - 专业: XX专业
   - 学历: 本科
   - 毕业年份: 2024
6. navigateToCandidate函数: ✅ 通过
```

---

### 3.3 ResumeDetailModule.js 测试

**测试位置**：Moka候选人详情页

**测试步骤**：

```javascript
// 确保在Moka候选人详情页
console.log('=== ResumeDetailModule.js 测试 ===');

// 测试1：验证模块加载
console.log('1. 模块加载:', typeof MokaResumeDetailModule !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：提取联系方式
console.log('2. 提取联系方式测试...');
var contactInfo = MokaResumeDetailModule.extractContactInfo();
console.log('   extractContactInfo: ✅ 通过');
console.log('   - 手机号:', contactInfo.phone || '未找到');
console.log('   - 邮箱:', contactInfo.email || '未找到');

// 测试3：检查锁定状态
var isLocked = MokaResumeDetailModule.isCandidateLocked();
console.log('3. isCandidateLocked: ✅ 通过');
console.log('   是否锁定:', isLocked);

// 测试4：获取详情URL
var detailUrl = MokaResumeDetailModule.getDetailUrl();
console.log('4. getDetailUrl:', detailUrl ? '✅ 通过' : '❌ 失败');
console.log('   URL:', detailUrl);

// 测试5：提取所有详情
var allDetails = MokaResumeDetailModule.extractAllDetails();
console.log('5. extractAllDetails: ✅ 通过');
console.log('   完整信息:', allDetails);

// 测试6：验证函数存在
console.log('6. 其他函数验证:');
console.log('   - goBack:', typeof MokaResumeDetailModule.goBack === 'function' ? '✅' : '❌');
console.log('   - waitForDetailPage:', typeof MokaResumeDetailModule.waitForDetailPage === 'function' ? '✅' : '❌');
```

**预期结果**：
```
=== ResumeDetailModule.js 测试 ===
1. 模块加载: ✅ 通过
2. 提取联系方式测试...
   extractContactInfo: ✅ 通过
   - 手机号: 138xxxx1234
   - 邮箱: test@example.com
3. isCandidateLocked: ✅ 通过
   是否锁定: false
4. getDetailUrl: ✅ 通过
   URL: https://xxx.mokahr.com/...
5. extractAllDetails: ✅ 通过
   完整信息: {phone: '...', email: '...', isLocked: false, detailUrl: '...'}
6. 其他函数验证:
   - goBack: ✅
   - waitForDetailPage: ✅
```

---

### 3.4 ResumeImageModule.js 测试

**测试位置**：Moka简历页（详情页中的简历区域）

**测试步骤**：

```javascript
// 确保在Moka简历页
console.log('=== ResumeImageModule.js 测试 ===');

// 测试1：验证模块加载
console.log('1. 模块加载:', typeof MokaResumeImageModule !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：获取简历图片
console.log('2. 获取简历图片测试...');
MokaResumeImageModule.captureResume()
  .then(function(urls) {
    if (urls && urls.length > 0) {
      console.log('   captureResume: ✅ 通过');
      console.log('   图片数量:', urls.length);
      console.log('   第一张图片类型:', urls[0].substring(0, 30) + '...');
    } else {
      console.log('   captureResume: ⚠️ 未找到简历图片');
    }
  })
  .catch(function(err) {
    console.log('   captureResume: ❌ 失败 -', err.message);
  });

// 测试3：blob转换测试（如果有blob URL）
console.log('3. blobToDataURL函数:', typeof MokaResumeImageModule.blobToDataURL === 'function' ? '✅ 通过' : '❌ 失败');

// 测试4：SVG转换测试
console.log('4. svgToPngBase64函数:', typeof MokaResumeImageModule.svgToPngBase64 === 'function' ? '✅ 通过' : '❌ 失败');
```

**预期结果**：
```
=== ResumeImageModule.js 测试 ===
1. 模块加载: ✅ 通过
2. 获取简历图片测试...
   [MokaLogger] 开始获取简历图片...
   [MokaLogger] 找到 X 个 blob 图片元素
   [MokaLogger] 第 1 张 blob 图片转换成功
   [MokaLogger] 成功获取 X 张简历图片
   captureResume: ✅ 通过
   图片数量: X
   第一张图片类型: data:image/png;base64,iVBORw0KGgo...
3. blobToDataURL函数: ✅ 通过
4. svgToPngBase64函数: ✅ 通过
```

---

### 3.5 RecommendationModule.js 测试

**测试位置**：Moka候选人详情页

**测试步骤**：

```javascript
// 确保在Moka候选人详情页
console.log('=== RecommendationModule.js 测试 ===');

// 测试1：验证模块加载
console.log('1. 模块加载:', typeof MokaRecommendationModule !== 'undefined' ? '✅ 通过' : '❌ 失败');

// 测试2：验证函数存在
console.log('2. 函数验证:');
console.log('   - recommendToTeam:', typeof MokaRecommendationModule.recommendToTeam === 'function' ? '✅' : '❌');
console.log('   - findAndClickRecommendButton:', typeof MokaRecommendationModule.findAndClickRecommendButton === 'function' ? '✅' : '❌');
console.log('   - inputRecommendNames:', typeof MokaRecommendationModule.inputRecommendNames === 'function' ? '✅' : '❌');
console.log('   - clickSubmitButton:', typeof MokaRecommendationModule.clickSubmitButton === 'function' ? '✅' : '❌');

// 测试3：查找推荐按钮测试（不点击）
console.log('3. 查找推荐按钮测试...');
var recommendBtn = document.querySelector('button.candidate-common-action__guide-assign');
if (!recommendBtn) {
  var allButtons = document.querySelectorAll('button');
  for (var i = 0; i < allButtons.length; i++) {
    if (allButtons[i].textContent.trim() === '推荐给用人部门') {
      recommendBtn = allButtons[i];
      break;
    }
  }
}
console.log('   推荐按钮:', recommendBtn ? '✅ 找到' : '⚠️ 未找到（可能无权限）');

// 测试4：完整推荐流程（注释掉，避免误操作）
// console.log('4. 完整推荐流程测试...');
// MokaRecommendationModule.recommendToTeam('测试人名')
//   .then(function(result) {
//     console.log('   推荐结果:', result);
//   });
console.log('4. 完整推荐流程: ⏭️ 跳过（避免误操作）');
```

**预期结果**：
```
=== RecommendationModule.js 测试 ===
1. 模块加载: ✅ 通过
2. 函数验证:
   - recommendToTeam: ✅
   - findAndClickRecommendButton: ✅
   - inputRecommendNames: ✅
   - clickSubmitButton: ✅
3. 查找推荐按钮测试...
   推荐按钮: ✅ 找到
4. 完整推荐流程: ⏭️ 跳过（避免误操作）
```

---

## 4. 第三阶段：集成测试

### 4.1 模块依赖测试

```javascript
console.log('=== 模块依赖测试 ===');

// 测试CandidateListModule依赖
console.log('1. CandidateListModule依赖:');
console.log('   - DOMUtils:', typeof MokaDOMUtils !== 'undefined' ? '✅' : '❌');
console.log('   - Selectors:', typeof MokaSelectors !== 'undefined' ? '✅' : '❌');
console.log('   - Logger:', typeof MokaLogger !== 'undefined' ? '✅' : '❌');

// 测试ResumeDetailModule依赖
console.log('2. ResumeDetailModule依赖:');
console.log('   - DOMUtils:', typeof MokaDOMUtils !== 'undefined' ? '✅' : '❌');
console.log('   - Selectors:', typeof MokaSelectors !== 'undefined' ? '✅' : '❌');

// 测试ResumeImageModule依赖
console.log('3. ResumeImageModule依赖:');
console.log('   - DOMUtils:', typeof MokaDOMUtils !== 'undefined' ? '✅' : '❌');
console.log('   - Logger:', typeof MokaLogger !== 'undefined' ? '✅' : '❌');

// 测试RecommendationModule依赖
console.log('4. RecommendationModule依赖:');
console.log('   - DOMUtils:', typeof MokaDOMUtils !== 'undefined' ? '✅' : '❌');
console.log('   - Logger:', typeof MokaLogger !== 'undefined' ? '✅' : '❌');
```

### 4.2 完整流程测试

```javascript
console.log('=== 完整流程测试 ===');

// 模拟完整筛选流程
async function testFullFlow() {
  try {
    // 步骤1：提取候选人
    console.log('步骤1：提取候选人...');
    var candidates = MokaCandidateListModule.extractCandidates();
    console.log('找到候选人:', candidates.length);
    
    if (candidates.length === 0) {
      console.log('⚠️ 无候选人，跳过后续测试');
      return;
    }
    
    // 步骤2：导航到详情页
    console.log('步骤2：导航到第一个候选人详情页...');
    var navigated = MokaCandidateListModule.navigateToCandidate(candidates[0]);
    console.log('导航结果:', navigated ? '✅' : '❌');
    
    if (!navigated) {
      console.log('⚠️ 导航失败，跳过后续测试');
      return;
    }
    
    // 等待详情页加载
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 步骤3：提取联系方式
    console.log('步骤3：提取联系方式...');
    var contactInfo = MokaResumeDetailModule.extractContactInfo();
    console.log('联系方式:', contactInfo);
    
    // 步骤4：获取简历图片
    console.log('步骤4：获取简历图片...');
    var resumeImages = await MokaResumeImageModule.captureResume();
    console.log('简历图片数量:', resumeImages ? resumeImages.length : 0);
    
    // 步骤5：返回列表
    console.log('步骤5：返回列表...');
    MokaResumeDetailModule.goBack();
    
    console.log('=== 完整流程测试完成 ===');
  } catch (err) {
    console.error('流程测试出错:', err);
  }
}

// 执行测试
testFullFlow();
```

---

## 5. 测试报告模板

### 5.1 测试结果汇总表

| 模块 | 加载测试 | 功能测试 | 依赖测试 | 状态 |
|------|----------|----------|----------|------|
| Selectors.js | ✅/❌ | ✅/❌ | N/A | 通过/失败 |
| SelectorMonitor.js | ✅/❌ | ✅/❌ | Selectors | 通过/失败 |
| DOMUtils.js | ✅/❌ | ✅/❌ | Selectors | 通过/失败 |
| Logger.js | ✅/❌ | ✅/❌ | N/A | 通过/失败 |
| StorageUtils.js | ✅/❌ | ✅/❌ | N/A | 通过/失败 |
| CandidateListModule.js | ✅/❌ | ✅/❌ | DOMUtils,Logger,Selectors | 通过/失败 |
| ResumeDetailModule.js | ✅/❌ | ✅/❌ | DOMUtils,Selectors | 通过/失败 |
| ResumeImageModule.js | ✅/❌ | ✅/❌ | DOMUtils,Logger,Selectors | 通过/失败 |
| RecommendationModule.js | ✅/❌ | ✅/❌ | DOMUtils,Logger,Selectors | 通过/失败 |

### 5.2 Bug记录模板

| Bug编号 | 模块 | 问题描述 | 重现步骤 | 严重程度 | 状态 |
|---------|------|----------|----------|----------|------|
| BUG-001 | XXXModule | 描述 | 步骤1,2,3 | 高/中/低 | 待修复 |

---

## 6. 测试执行顺序建议

```
1. 工具模块测试（任意页面）
   ├── Selectors.js
   ├── SelectorMonitor.js
   ├── DOMUtils.js
   ├── Logger.js
   └── StorageUtils.js

2. 业务模块测试（Moka页面）
   ├── CandidateListModule.js（列表页）
   ├── ResumeDetailModule.js（详情页）
   ├── ResumeImageModule.js（简历页）
   └── RecommendationModule.js（详情页）

3. 集成测试（Moka完整流程）
   └── 完整筛选流程测试
```
