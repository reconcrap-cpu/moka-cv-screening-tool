# 模块测试与Bug定位计划

## 1. 问题分析

### 1.1 用户关心的问题

1. **集成后Bug定位**：集成测试发现bug时，能否定位到具体模块？
2. **模块独立测试**：现在是否能直接测试各个模块MVP是否可行？

### 1.2 当前测试能力评估

| 模块 | 独立测试能力 | 测试方法 | 问题定位能力 |
|------|-------------|----------|-------------|
| Selectors.js | ✅ 可测试 | 控制台调用MokaSelectors | ✅ 有详细日志 |
| SelectorMonitor.js | ✅ 可测试 | 控制台调用MokaSelectorMonitor | ✅ 有健康报告 |
| DOMUtils.js | ✅ 可测试 | 控制台调用MokaDOMUtils | ⚠️ 日志较少 |
| Logger.js | ✅ 可测试 | 控制台调用MokaLogger | ✅ 有缓冲区 |
| StorageUtils.js | ✅ 可测试 | 控制台调用MokaStorageUtils | ⚠️ 日志较少 |
| CandidateListModule.js | ⚠️ 需要页面环境 | 需要在Moka页面测试 | ✅ 有详细日志 |
| ResumeDetailModule.js | ⚠️ 需要详情页 | 需要在详情页测试 | ✅ 有详细日志 |
| ResumeImageModule.js | ⚠️ 需要简历页 | 需要在简历页测试 | ✅ 有详细日志 |
| RecommendationModule.js | ⚠️ 需要完整流程 | 需要完整流程测试 | ✅ 有详细日志 |

## 2. 模块独立测试方案

### 2.1 工具模块测试（可在任意页面测试）

#### Selectors.js 测试
```javascript
// 在浏览器控制台执行
MokaSelectors.Selectors                    // 查看所有选择器
MokaSelectors.getSelector('candidateList.pagination')  // 获取单个选择器
MokaSelectors.validateSelector('.content-OKNZCZyG5d')  // 验证选择器
```

#### SelectorMonitor.js 测试
```javascript
MokaSelectorMonitor.quickCheck('candidateList.pagination')  // 快速检查
MokaSelectorMonitor.printReport()                           // 打印健康报告
```

#### DOMUtils.js 测试
```javascript
MokaDOMUtils.querySelector('body')              // 查询元素
MokaDOMUtils.waitForElement('body', {timeout: 1000})  // 等待元素
MokaDOMUtils.getTextContent(document.body)      // 获取文本
```

#### Logger.js 测试
```javascript
MokaLogger.setTabId(1)           // 设置tabId
MokaLogger.info('测试信息')       // 测试info日志
MokaLogger.success('测试成功')    // 测试success日志
MokaLogger.error('测试错误')      // 测试error日志
MokaLogger.getLogBuffer()        // 查看日志缓冲区
```

#### StorageUtils.js 测试
```javascript
MokaStorageUtils.set('test_key', 'test_value')  // 存储数据
MokaStorageUtils.get('test_key')                 // 读取数据
MokaStorageUtils.getStorageUsage()               // 查看存储使用情况
```

### 2.2 业务模块测试（需要在Moka页面测试）

#### CandidateListModule.js 测试
```javascript
// 在Moka候选人列表页执行
MokaCandidateListModule.detectPageType()           // 检测页面类型
MokaCandidateListModule.extractCandidates()        // 提取候选人
```

#### ResumeDetailModule.js 测试
```javascript
// 在Moka候选人详情页执行
MokaResumeDetailModule.extractContactInfo()        // 提取联系方式
MokaResumeDetailModule.isCandidateLocked()         // 检查是否锁定
```

#### ResumeImageModule.js 测试
```javascript
// 在Moka简历页执行
MokaResumeImageModule.captureResume()              // 获取简历图片
```

#### RecommendationModule.js 测试
```javascript
// 在Moka详情页执行（需要先点击推荐按钮）
MokaRecommendationModule.recommendToTeam('测试人名')
```

## 3. Bug定位策略

### 3.1 日志追踪机制

每个模块都有日志输出，格式为 `[模块名] 操作信息`：

```
[MokaSelectors] Selector not found: xxx
[DOMUtils] Click failed: xxx
[Logger] Failed to send log to background: xxx
[CandidateListModule] 未找到候选人容器
[ResumeImageModule] 找到 X 个 blob 图片元素
[RecommendationModule] 未找到推荐按钮
```

### 3.2 Bug定位流程

```
1. 发现问题
   ↓
2. 查看控制台日志（按模块名过滤）
   ↓
3. 定位到具体模块
   ↓
4. 检查该模块的输入参数
   ↓
5. 检查该模块的依赖模块
   ↓
6. 确定问题根源
```

### 3.3 模块依赖关系

```
CandidateListModule
    └── DOMUtils
            └── Selectors

ResumeDetailModule
    └── DOMUtils
            └── Selectors

ResumeImageModule
    └── Logger
    └── DOMUtils
            └── Selectors

RecommendationModule
    └── Logger
    └── DOMUtils
            └── Selectors
```

### 3.4 常见问题定位表

| 问题现象 | 可能模块 | 排查方法 |
|----------|----------|----------|
| 提取不到候选人 | CandidateListModule | 检查选择器是否有效 |
| 选择器失效 | Selectors | 运行SelectorMonitor.printReport() |
| 日志不显示 | Logger | 检查setTabId是否调用 |
| 存储失败 | StorageUtils | 检查chrome.storage是否可用 |
| 简历图片获取失败 | ResumeImageModule | 检查blob转换日志 |
| 推荐失败 | RecommendationModule | 检查按钮查找日志 |

## 4. 测试脚本

### 4.1 一键测试脚本

```javascript
// 在浏览器控制台执行此脚本，测试所有工具模块
(function testAllModules() {
  console.log('========== 开始模块测试 ==========');
  
  // 测试Selectors
  console.log('\n--- 测试 Selectors ---');
  console.log('Selectors加载:', typeof MokaSelectors !== 'undefined' ? '✅' : '❌');
  
  // 测试SelectorMonitor
  console.log('\n--- 测试 SelectorMonitor ---');
  console.log('SelectorMonitor加载:', typeof MokaSelectorMonitor !== 'undefined' ? '✅' : '❌');
  
  // 测试DOMUtils
  console.log('\n--- 测试 DOMUtils ---');
  console.log('DOMUtils加载:', typeof MokaDOMUtils !== 'undefined' ? '✅' : '❌');
  if (typeof MokaDOMUtils !== 'undefined') {
    console.log('querySelector测试:', MokaDOMUtils.querySelector('body') ? '✅' : '❌');
  }
  
  // 测试Logger
  console.log('\n--- 测试 Logger ---');
  console.log('Logger加载:', typeof MokaLogger !== 'undefined' ? '✅' : '❌');
  if (typeof MokaLogger !== 'undefined') {
    MokaLogger.info('Logger测试成功');
  }
  
  // 测试StorageUtils
  console.log('\n--- 测试 StorageUtils ---');
  console.log('StorageUtils加载:', typeof MokaStorageUtils !== 'undefined' ? '✅' : '❌');
  
  // 测试业务模块
  console.log('\n--- 测试业务模块 ---');
  console.log('CandidateListModule加载:', typeof MokaCandidateListModule !== 'undefined' ? '✅' : '❌');
  console.log('ResumeDetailModule加载:', typeof MokaResumeDetailModule !== 'undefined' ? '✅' : '❌');
  console.log('ResumeImageModule加载:', typeof MokaResumeImageModule !== 'undefined' ? '✅' : '❌');
  console.log('RecommendationModule加载:', typeof MokaRecommendationModule !== 'undefined' ? '✅' : '❌');
  
  console.log('\n========== 测试完成 ==========');
})();
```

## 5. 结论

### 5.1 Bug定位能力

**是的，可以定位到具体模块**，原因：
1. 每个模块都有独立的命名空间（MokaXxxModule）
2. 每个模块都有详细的日志输出
3. 日志格式统一，包含模块名前缀
4. 模块依赖关系清晰，便于追踪

### 5.2 模块独立测试

**是的，现在可以直接测试各个模块**：
1. 工具模块可在任意页面测试
2. 业务模块需要在Moka对应页面测试
3. 提供了一键测试脚本

### 5.3 建议

1. **先测试工具模块**：确保基础功能正常
2. **再测试业务模块**：在Moka页面逐个测试
3. **最后集成测试**：验证模块间协作
