# 浏览器扩展重构计划 - 模块化架构设计

## 📋 项目概述

### 项目目标
将现有的Moka简历筛选Chrome扩展进行全面模块化重构,实现功能解耦、提升可维护性、支持多Agent协作开发。

### 重构范围
- **当前版本**: v2.0
- **目标架构**: 模块化、可扩展、易维护
- **预计周期**: 18周
- **开发模式**: MVP迭代 + 多Agent协作

---

## 📊 第一阶段:拓展现状分析(第1-2周)

### 1.1 功能模块梳理

#### 核心功能模块识别

**模块1: 候选人信息提取模块(CandidateExtractor)**
- **功能**: 从Moka页面提取候选人基本信息
- **输入**: DOM元素、页面类型(pagination/infinite-scroll)
- **输出**: 候选人对象数组(name, school, major, education, graduationYear)
- **依赖**: DOM选择器配置
- **代码位置**: content.js L458-619
- **代码行数**: ~160行
- **复杂度**: 中等(需要处理多种页面结构)

**模块2: 初筛分析模块(InitialScreener)**
- **功能**: 使用大模型API进行候选人初筛
- **输入**: 候选人列表、初筛标准、API配置
- **输出**: 符合条件的候选人列表
- **依赖**: LLM API客户端
- **代码位置**: content.js L691-791
- **代码行数**: ~100行
- **复杂度**: 中等(需要处理API调用和结果解析)

**模块3: 详细评估模块(DetailedEvaluator)**
- **功能**: 进入详情页、获取简历、使用大模型评估
- **输入**: 候选人对象、完整筛选标准、简历图片
- **输出**: 评估结果(qualified, reason, education info)
- **依赖**: 简历捕获模块、LLM API客户端
- **代码位置**: content.js L829-949, L1667-1794
- **代码行数**: ~250行
- **复杂度**: 高(涉及页面跳转、异步操作、图片处理)

**模块4: 简历捕获模块(ResumeCapture)**
- **功能**: 从详情页捕获简历图片
- **输入**: 页面DOM、等待时间配置
- **输出**: 简历图片URL数组(base64/http/blob)
- **依赖**: html2canvas库
- **代码位置**: content.js L1389-1665
- **代码行数**: ~280行
- **复杂度**: 高(需要处理多种简历格式:img-blob/img-page/iframe/svg)

**模块5: 推荐功能模块(Recommender)**
- **功能**: 将符合条件的候选人推荐给用人部门
- **输入**: 候选人详情页、推荐人列表
- **输出**: 推荐成功/失败状态
- **依赖**: DOM操作
- **代码位置**: content.js L951-1155
- **代码行数**: ~200行
- **复杂度**: 高(需要模拟用户交互、处理下拉菜单)

**模块6: 状态管理模块(StateManager)**
- **功能**: 管理筛选流程状态(运行/暂停/停止/完成)
- **输入**: 用户操作、筛选进度
- **输出**: 状态更新、持久化存储
- **依赖**: chrome.storage API
- **代码位置**: background.js L1-134, content.js L1-116
- **代码行数**: ~250行
- **复杂度**: 中等(需要处理多tab状态、持久化)

**模块7: 日志系统模块(Logger)**
- **功能**: 记录筛选过程日志、实时显示
- **输入**: 日志消息、类型(info/success/warning/error)
- **输出**: 日志显示、存储
- **依赖**: chrome.runtime消息传递
- **代码位置**: background.js L66-89, content.js L440-456, sidebar.js L476-503
- **代码行数**: ~100行
- **复杂度**: 低

**模块8: 配置管理模块(ConfigManager)**
- **功能**: 管理大模型配置、筛选标准
- **输入**: 用户输入
- **输出**: 配置对象、持久化存储
- **依赖**: chrome.storage API
- **代码位置**: config.js, sidebar.js L51-100
- **代码行数**: ~250行
- **复杂度**: 低

**模块9: 结果导出模块(ResultExporter)**
- **功能**: 导出筛选结果为CSV格式
- **输入**: 筛选结果数组
- **输出**: CSV文件下载
- **依赖**: 浏览器下载API
- **代码位置**: sidebar.js L254-366
- **代码行数**: ~110行
- **复杂度**: 低

**模块10: UI交互模块(UIController)**
- **功能**: 处理Sidebar界面交互
- **输入**: 用户操作
- **输出**: 界面更新、消息发送
- **依赖**: DOM操作、chrome.runtime消息
- **代码位置**: sidebar.js L127-253, L377-456
- **代码行数**: ~200行
- **复杂度**: 中等

**模块11: 页面导航模块(PageNavigator)**
- **功能**: 处理分页和无限滚动
- **输入**: 当前页码、目标页码
- **输出**: 页面跳转成功/失败
- **依赖**: DOM操作
- **代码位置**: content.js L1796-1946, L1948-2000
- **代码行数**: ~200行
- **复杂度**: 中等(需要处理页面加载等待)

**模块12: API客户端模块(LLMClient)**
- **功能**: 封装大模型API调用
- **输入**: API配置、请求参数
- **输出**: API响应
- **依赖**: fetch API
- **代码位置**: content.js L621-689
- **代码行数**: ~70行
- **复杂度**: 中等(需要处理重试、错误处理)

### 1.2 模块依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                        UI层(Sidebar)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │UIController│  │ConfigManager│  │ResultExporter│  │  Logger  │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │
└────────┼──────────────┼──────────────┼──────────────┼─────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                              │
                    chrome.runtime.sendMessage
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    后台层(Background)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              StateManager (状态管理)                   │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                chrome.tabs.sendMessage
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    内容层(Content)                            │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           MainController (主流程控制)                  │   │
│  └───┬──────────┬──────────┬──────────┬──────────┬------┘   │
│      │          │          │          │          │           │
│  ┌───┴────┐ ┌───┴────┐ ┌───┴────┐ ┌───┴────┐ ┌───┴────┐   │
│  │Candidate│ │Initial │ │Detailed│ │ Resume │ │Recommend│   │
│  │Extractor│ │Screener│ │Evaluator│ │Capture │ │  Module │   │
│  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘   │
│      │          │          │          │          │           │
│  ┌───┴──────────┴──────────┴──────────┴──────────┴──────┐   │
│  │              LLMClient (API客户端)                     │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────┐  ┌──────────────────────────┐    │
│  │   PageNavigator       │  │      Logger              │    │
│  └───────────────────────┘  └──────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### 1.3 代码质量评估

#### 代码度量指标

| 模块 | 代码行数 | 圈复杂度 | 耦合度 | 内聚性 | 可测试性 | 评分 |
|------|---------|---------|--------|--------|---------|------|
| CandidateExtractor | 160 | 中 | 高 | 高 | 中 | 6/10 |
| InitialScreener | 100 | 低 | 中 | 高 | 高 | 7/10 |
| DetailedEvaluator | 250 | 高 | 高 | 中 | 低 | 4/10 |
| ResumeCapture | 280 | 高 | 高 | 低 | 低 | 3/10 |
| Recommender | 200 | 高 | 中 | 中 | 低 | 4/10 |
| StateManager | 250 | 中 | 高 | 高 | 中 | 6/10 |
| Logger | 100 | 低 | 低 | 高 | 高 | 8/10 |
| ConfigManager | 250 | 低 | 低 | 高 | 高 | 8/10 |
| ResultExporter | 110 | 低 | 低 | 高 | 高 | 9/10 |
| UIController | 200 | 中 | 中 | 高 | 中 | 6/10 |
| PageNavigator | 200 | 中 | 中 | 高 | 中 | 6/10 |
| LLMClient | 70 | 低 | 低 | 高 | 高 | 8/10 |

**总体评分: 6.3/10**

#### 主要问题

1. **高耦合度问题**:
   - content.js文件过大(~2000行),包含多个模块逻辑
   - 模块间直接调用,缺乏接口抽象
   - 状态管理分散在多个文件中

2. **可测试性差**:
   - 缺少单元测试
   - 函数依赖全局变量
   - 异步逻辑难以测试

3. **错误处理不统一**:
   - 各模块错误处理方式不一致
   - 缺少统一的错误上报机制
   - 用户友好的错误提示不足

4. **配置管理分散**:
   - 配置项分布在多个文件
   - 缺少配置验证机制
   - 默认值管理不规范

### 1.4 技术栈分析

#### 当前技术栈

| 技术 | 版本/规范 | 用途 | 评估 |
|------|----------|------|------|
| Chrome Extension Manifest | V3 | 扩展架构 | ✅ 最新标准 |
| JavaScript | ES6+ | 主要开发语言 | ⚠️ 缺少TypeScript类型安全 |
| Chrome APIs | - | 扩展能力 | ✅ 使用合理 |
| html2canvas | - | 简历截图 | ⚠️ 依赖外部库 |
| Fetch API | - | HTTP请求 | ✅ 原生支持 |

#### 技术债务

1. **缺少TypeScript**: 代码缺少类型定义,容易引入运行时错误
2. **缺少构建工具**: 没有使用Webpack/Rollup等构建工具,无法使用模块化特性
3. **缺少测试框架**: 没有单元测试和集成测试
4. **缺少代码规范工具**: 没有ESLint/Prettier配置

### 1.5 输出物清单

#### 1.5.1 浏览器拓展现状分析报告

**文件路径**: `docs/extension_analysis_report.md`

**内容大纲**:
1. 项目概述
2. 功能模块清单
3. 代码质量评估
4. 技术栈分析
5. 存在问题总结
6. 改进建议

#### 1.5.2 现有模块依赖关系图谱

**文件路径**: `docs/module_dependency_graph.md`

**内容大纲**:
1. 模块依赖关系图
2. 模块接口定义
3. 数据流向图
4. 消息传递机制

#### 1.5.3 模块接口文档

**文件路径**: `docs/module_interface_spec.md`

**内容大纲**:
1. 各模块输入输出参数
2. 核心算法说明
3. 模块间交互方式
4. API接口规范

---

## 🏗️ 第二阶段:模块化设计(第3-5周)

### 2.1 模块化架构方案

#### 2.1.1 架构设计原则

1. **单一职责原则**: 每个模块只负责一个功能
2. **开闭原则**: 对扩展开放,对修改关闭
3. **依赖倒置原则**: 依赖抽象而非具体实现
4. **接口隔离原则**: 使用小而专一的接口
5. **迪米特法则**: 最少知识原则

#### 2.1.2 新架构设计

```
moka-screening-extension/
├── src/
│   ├── core/                    # 核心层
│   │   ├── EventEmitter.js      # 事件发射器
│   │   ├── ModuleBase.js        # 模块基类
│   │   └── DependencyInjector.js # 依赖注入容器
│   │
│   ├── modules/                 # 功能模块层
│   │   ├── candidate/           # 候选人模块
│   │   │   ├── CandidateExtractor.js
│   │   │   ├── CandidateValidator.js
│   │   │   └── index.js
│   │   │
│   │   ├── screening/           # 筛选模块
│   │   │   ├── InitialScreener.js
│   │   │   ├── DetailedEvaluator.js
│   │   │   ├── ScreeningCriteria.js
│   │   │   └── index.js
│   │   │
│   │   ├── resume/              # 简历模块
│   │   │   ├── ResumeCapture.js
│   │   │   ├── ResumeParser.js
│   │   │   ├── ImageConverter.js
│   │   │   └── index.js
│   │   │
│   │   ├── recommendation/      # 推荐模块
│   │   │   ├── Recommender.js
│   │   │   ├── RecommendDialog.js
│   │   │   └── index.js
│   │   │
│   │   ├── navigation/          # 导航模块
│   │   │   ├── PageNavigator.js
│   │   │   ├── InfiniteScroller.js
│   │   │   └── index.js
│   │   │
│   │   ├── api/                 # API模块
│   │   │   ├── LLMClient.js
│   │   │   ├── APIErrorHandler.js
│   │   │   ├── RetryStrategy.js
│   │   │   └── index.js
│   │   │
│   │   ├── state/               # 状态管理模块
│   │   │   ├── StateManager.js
│   │   │   ├── StatePersister.js
│   │   │   ├── StateValidator.js
│   │   │   └── index.js
│   │   │
│   │   ├── config/              # 配置模块
│   │   │   ├── ConfigManager.js
│   │   │   ├── ConfigValidator.js
│   │   │   ├── DefaultConfig.js
│   │   │   └── index.js
│   │   │
│   │   ├── export/              # 导出模块
│   │   │   ├── ResultExporter.js
│   │   │   ├── CSVGenerator.js
│   │   │   └── index.js
│   │   │
│   │   └── logger/              # 日志模块
│   │       ├── Logger.js
│   │       ├── LogFormatter.js
│   │       ├── LogTransport.js
│   │       └── index.js
│   │
│   ├── controllers/             # 控制器层
│   │   ├── MainController.js    # 主流程控制器
│   │   ├── ScreeningController.js
│   │   └── UIController.js
│   │
│   ├── views/                   # 视图层
│   │   ├── sidebar/
│   │   │   ├── SidebarView.js
│   │   │   ├── ConfigPanel.js
│   │   │   ├── ControlPanel.js
│   │   │   ├── LogPanel.js
│   │   │   └── index.js
│   │   └── components/
│   │       ├── Button.js
│   │       ├── Input.js
│   │       ├── TextArea.js
│   │       └── StatusBadge.js
│   │
│   ├── services/                # 服务层
│   │   ├── MessageService.js    # 消息服务
│   │   ├── StorageService.js    # 存储服务
│   │   ├── TabService.js        # Tab管理服务
│   │   └── NotificationService.js
│   │
│   ├── utils/                   # 工具层
│   │   ├── DOMHelper.js
│   │   ├── AsyncHelper.js
│   │   ├── DataHelper.js
│   │   └── Validator.js
│   │
│   ├── constants/               # 常量定义
│   │   ├── ActionTypes.js
│   │   ├── ErrorCodes.js
│   │   ├── ConfigKeys.js
│   │   └── Selectors.js
│   │
│   └── background/              # Background Script
│       ├── BackgroundScript.js
│       ├── MessageRouter.js
│       └── KeepAlive.js
│
├── tests/                       # 测试目录
│   ├── unit/                    # 单元测试
│   │   ├── modules/
│   │   ├── controllers/
│   │   └── utils/
│   │
│   ├── integration/             # 集成测试
│   │   ├── screening-flow.test.js
│   │   ├── recommendation-flow.test.js
│   │   └── export-flow.test.js
│   │
│   └── e2e/                     # 端到端测试
│       ├── basic-screening.test.js
│       └── full-workflow.test.js
│
├── docs/                        # 文档目录
│   ├── api/                     # API文档
│   ├── architecture/            # 架构文档
│   └── guides/                  # 使用指南
│
├── scripts/                     # 构建脚本
│   ├── build.js
│   ├── test.js
│   └── lint.js
│
├── manifest.json
├── package.json
├── webpack.config.js
├── .eslintrc.js
├── .prettierrc.js
├── tsconfig.json
└── README.md
```

### 2.2 模块接口规范

#### 2.2.1 模块基类设计

```javascript
// src/core/ModuleBase.js
class ModuleBase {
  constructor(name, dependencies = {}) {
    this.name = name;
    this.dependencies = dependencies;
    this.eventEmitter = dependencies.eventEmitter;
    this.logger = dependencies.logger;
    this.state = {};
  }

  async initialize() {
    this.logger?.info(`${this.name} module initialized`);
  }

  async destroy() {
    this.logger?.info(`${this.name} module destroyed`);
  }

  emit(event, data) {
    this.eventEmitter?.emit(event, data);
  }

  on(event, handler) {
    this.eventEmitter?.on(event, handler);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.emit(`${this.name}:stateChanged`, this.state);
  }
}
```

#### 2.2.2 核心模块接口定义

**候选人提取模块接口**:

```javascript
// src/modules/candidate/CandidateExtractor.js
class CandidateExtractor extends ModuleBase {
  constructor(dependencies) {
    super('CandidateExtractor', dependencies);
  }

  /**
   * 从页面提取候选人信息
   * @param {string} pageType - 页面类型: 'pagination' | 'infinite-scroll'
   * @returns {Promise<Array<Candidate>>} 候选人数组
   */
  async extract(pageType) {
    // 实现细节
  }

  /**
   * 验证候选人数据完整性
   * @param {Candidate} candidate - 候选人对象
   * @returns {boolean} 是否有效
   */
  validate(candidate) {
    // 实现细节
  }
}

/**
 * @typedef {Object} Candidate
 * @property {string} id - 候选人ID
 * @property {string} name - 姓名
 * @property {string} school - 学校
 * @property {string} major - 专业
 * @property {string} education - 学历
 * @property {string} graduationYear - 毕业年份
 * @property {HTMLElement} elementRef - DOM元素引用
 */
```

**初筛模块接口**:

```javascript
// src/modules/screening/InitialScreener.js
class InitialScreener extends ModuleBase {
  constructor(dependencies) {
    super('InitialScreener', dependencies);
    this.llmClient = dependencies.llmClient;
  }

  /**
   * 执行初筛
   * @param {Array<Candidate>} candidates - 候选人列表
   * @param {string} criteria - 初筛标准
   * @param {ScreeningConfig} config - 筛选配置
   * @returns {Promise<ScreeningResult>} 筛选结果
   */
  async screen(candidates, criteria, config) {
    // 实现细节
  }
}

/**
 * @typedef {Object} ScreeningResult
 * @property {boolean} success - 是否成功
 * @property {Array<QualifiedCandidate>} qualifiedCandidates - 符合条件的候选人
 * @property {string} [error] - 错误信息
 */
```

**简历捕获模块接口**:

```javascript
// src/modules/resume/ResumeCapture.js
class ResumeCapture extends ModuleBase {
  constructor(dependencies) {
    super('ResumeCapture', dependencies);
  }

  /**
   * 捕获简历图片
   * @param {CaptureOptions} options - 捕获选项
   * @returns {Promise<Array<string>>} 图片URL数组
   */
  async capture(options = {}) {
    // 实现细节
  }

  /**
   * 检测简历类型
   * @returns {ResumeType} 简历类型
   */
  detectType() {
    // 实现细节
  }
}

/**
 * @typedef {Object} CaptureOptions
 * @property {number} delay - 等待延迟(毫秒)
 * @property {string} format - 输出格式: 'base64' | 'url'
 */

/**
 * @typedef {string} ResumeType
 * @enum {'img-blob' | 'img-page' | 'iframe' | 'svg' | 'html'}
 */
```

### 2.3 模块间通信协议

#### 2.3.1 事件驱动架构

```javascript
// src/core/EventEmitter.js
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  off(event, handler) {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}
```

#### 2.3.2 标准事件定义

```javascript
// src/constants/EventTypes.js
export const EventTypes = {
  // 筛选流程事件
  SCREENING_START: 'screening:start',
  SCREENING_PAUSE: 'screening:pause',
  SCREENING_RESUME: 'screening:resume',
  SCREENING_STOP: 'screening:stop',
  SCREENING_COMPLETE: 'screening:complete',
  
  // 候选人处理事件
  CANDIDATE_EXTRACTED: 'candidate:extracted',
  CANDIDATE_SCREENED: 'candidate:screened',
  CANDIDATE_EVALUATED: 'candidate:evaluated',
  CANDIDATE_RECOMMENDED: 'candidate:recommended',
  
  // 进度更新事件
  PROGRESS_UPDATE: 'progress:update',
  
  // 错误事件
  ERROR_OCCURRED: 'error:occurred',
  ERROR_RECOVERED: 'error:recovered',
  
  // 状态变化事件
  STATE_CHANGED: 'state:changed',
  CONFIG_UPDATED: 'config:updated'
};
```

#### 2.3.3 消息格式规范

```javascript
// src/constants/MessageTypes.js
export const MessageTypes = {
  // Background <-> Content Script
  START_SCREENING: 'START_SCREENING',
  PAUSE_SCREENING: 'PAUSE_SCREENING',
  RESUME_SCREENING: 'RESUME_SCREENING',
  STOP_SCREENING: 'STOP_SCREENING',
  
  // Content Script -> Background
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  ADD_RESULT: 'ADD_RESULT',
  ADD_LOG: 'ADD_LOG',
  SCREENING_COMPLETE: 'SCREENING_COMPLETE',
  
  // Background -> Sidebar
  LOG_UPDATE: 'LOG_UPDATE',
  STATUS_UPDATE: 'STATUS_UPDATE',
  
  // Sidebar -> Background
  GET_STATE: 'GET_STATE',
  EXPORT_RESULTS: 'EXPORT_RESULTS',
  CLEAR_STATE: 'CLEAR_STATE'
};

// 标准消息格式
export class Message {
  constructor(type, payload, metadata = {}) {
    this.type = type;
    this.payload = payload;
    this.metadata = {
      timestamp: Date.now(),
      tabId: metadata.tabId,
      source: metadata.source,
      ...metadata
    };
  }
}
```

### 2.4 MVP功能清单与验收标准

#### 2.4.1 MVP阶段划分

**MVP-1: 核心筛选功能(第6-7周)**
- ✅ 候选人信息提取
- ✅ 初筛分析
- ✅ 基本状态管理
- ✅ 日志显示

**MVP-2: 完整筛选流程(第8-9周)**
- ✅ 详细评估
- ✅ 简历捕获
- ✅ 结果导出

**MVP-3: 高级功能(第10-11周)**
- ✅ 推荐功能
- ✅ 分页/无限滚动
- ✅ 错误恢复

**MVP-4: 优化与完善(第12-13周)**
- ✅ 性能优化
- ✅ 错误处理完善
- ✅ 用户体验优化

#### 2.4.2 验收标准

**MVP-1验收标准**:

| 功能点 | 验收标准 | 测试方法 |
|--------|---------|---------|
| 候选人提取 | 能正确提取候选人姓名、学校、专业等信息 | 单元测试 + 手动验证 |
| 初筛分析 | 能调用大模型API并返回符合条件的候选人 | 集成测试 |
| 状态管理 | 能正确保存和恢复筛选状态 | 单元测试 |
| 日志显示 | 能实时显示筛选日志 | 手动验证 |

**MVP-2验收标准**:

| 功能点 | 验收标准 | 测试方法 |
|--------|---------|---------|
| 详细评估 | 能进入详情页并评估简历 | 集成测试 |
| 简历捕获 | 能捕获多种格式的简历图片 | 单元测试 + 手动验证 |
| 结果导出 | 能导出CSV格式的筛选结果 | 单元测试 |

**MVP-3验收标准**:

| 功能点 | 验收标准 | 测试方法 |
|--------|---------|---------|
| 推荐功能 | 能成功推荐候选人给用人部门 | 集成测试 |
| 分页导航 | 能正确翻页并加载新候选人 | 单元测试 |
| 错误恢复 | 能从错误中恢复并继续筛选 | 单元测试 |

**MVP-4验收标准**:

| 功能点 | 验收标准 | 测试方法 |
|--------|---------|---------|
| 性能优化 | 筛选速度提升30%以上 | 性能测试 |
| 错误处理 | 所有错误都有友好的提示 | 手动验证 |
| 用户体验 | 用户操作路径清晰,无明显卡顿 | 用户测试 |

### 2.5 输出物清单

#### 2.5.1 模块化架构设计方案

**文件路径**: `docs/modular_architecture_design.md`

**内容大纲**:
1. 架构设计原则
2. 模块划分方案
3. 目录结构设计
4. 模块职责定义

#### 2.5.2 模块接口规范文档

**文件路径**: `docs/module_interface_specification.md`

**内容大纲**:
1. 模块基类设计
2. 各模块接口定义
3. 数据类型定义
4. 接口使用示例

#### 2.5.3 MVP功能清单与验收标准

**文件路径**: `docs/mvp_feature_list.md`

**内容大纲**:
1. MVP阶段划分
2. 各阶段功能清单
3. 验收标准
4. 测试方法

---

## 🤝 第三阶段:多Agent协作开发规划(第6周)

### 3.1 多Agent协作框架

#### 3.1.1 Agent角色定义

**Agent 1: 架构师(Architect Agent)**
- **职责**: 负责整体架构设计、模块接口定义、技术选型
- **技能**: 系统架构、设计模式、技术决策
- **交付物**: 架构设计文档、接口规范文档

**Agent 2: 前端开发(Frontend Agent)**
- **职责**: 负责UI模块开发、视图层实现、用户交互
- **技能**: HTML/CSS/JavaScript、UI/UX设计
- **交付物**: UI组件、视图模块

**Agent 3: 后端开发(Backend Agent)**
- **职责**: 负责核心业务逻辑、API集成、数据处理
- **技能**: JavaScript、异步编程、API设计
- **交付物**: 业务模块、API客户端

**Agent 4: 测试工程师(Test Agent)**
- **职责**: 负责测试用例编写、测试执行、质量保障
- **技能**: 单元测试、集成测试、E2E测试
- **交付物**: 测试用例、测试报告

**Agent 5: DevOps工程师(DevOps Agent)**
- **职责**: 负责构建配置、CI/CD流程、部署脚本
- **技能**: Webpack、CI/CD、自动化部署
- **交付物**: 构建配置、部署脚本

#### 3.1.2 任务分配矩阵

| 模块 | Architect | Frontend | Backend | Test | DevOps |
|------|-----------|----------|---------|------|--------|
| CandidateExtractor | 设计 | - | 开发 | 测试 | - |
| InitialScreener | 设计 | - | 开发 | 测试 | - |
| DetailedEvaluator | 设计 | - | 开发 | 测试 | - |
| ResumeCapture | 设计 | - | 开发 | 测试 | - |
| Recommender | 设计 | - | 开发 | 测试 | - |
| StateManager | 设计 | - | 开发 | 测试 | - |
| Logger | 设计 | - | 开发 | 测试 | - |
| ConfigManager | 设计 | UI开发 | 逻辑开发 | 测试 | - |
| ResultExporter | 设计 | - | 开发 | 测试 | - |
| UIController | 设计 | 开发 | - | 测试 | - |
| PageNavigator | 设计 | - | 开发 | 测试 | - |
| LLMClient | 设计 | - | 开发 | 测试 | - |
| 构建配置 | 设计 | - | - | - | 开发 |
| 测试框架 | 设计 | - | - | 开发 | 配置 |

### 3.2 协作工作流程

#### 3.2.1 开发流程

```
┌─────────────────────────────────────────────────────────────┐
│                     需求分析阶段                              │
│  Architect Agent: 分析需求、设计架构、定义接口                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     任务分解阶段                              │
│  Architect Agent: 将任务分解为独立模块、分配给各Agent         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     并行开发阶段                              │
│  Frontend Agent: 开发UI组件                                  │
│  Backend Agent: 开发业务模块                                 │
│  DevOps Agent: 配置构建环境                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     集成测试阶段                              │
│  Test Agent: 执行单元测试、集成测试                          │
│  各Agent: 修复测试发现的问题                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     验收交付阶段                              │
│  Architect Agent: 验收架构设计                               │
│  Test Agent: 验收测试覆盖率                                  │
│  DevOps Agent: 验收构建流程                                  │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.2 沟通机制

**每日站会(Daily Standup)**
- 时间: 每天上午10:00
- 参与者: 所有Agent
- 内容: 
  - 昨天完成了什么
  - 今天计划做什么
  - 遇到什么阻碍

**周例会(Weekly Review)**
- 时间: 每周五下午16:00
- 参与者: 所有Agent
- 内容:
  - 本周进度回顾
  - 下周计划安排
  - 风险识别与应对

**技术评审(Tech Review)**
- 时间: 每完成一个模块
- 参与者: Architect Agent + 相关开发Agent
- 内容:
  - 代码质量评审
  - 架构符合性检查
  - 性能优化建议

### 3.3 版本控制规范

#### 3.3.1 Git分支管理策略

```
master (生产分支)
  │
  ├── develop (开发分支)
  │     │
  │     ├── feature/candidate-extractor (功能分支)
  │     ├── feature/initial-screener (功能分支)
  │     ├── feature/detailed-evaluator (功能分支)
  │     ├── feature/resume-capture (功能分支)
  │     ├── feature/recommender (功能分支)
  │     ├── feature/state-manager (功能分支)
  │     ├── feature/logger (功能分支)
  │     ├── feature/config-manager (功能分支)
  │     ├── feature/result-exporter (功能分支)
  │     ├── feature/ui-controller (功能分支)
  │     ├── feature/page-navigator (功能分支)
  │     └── feature/llm-client (功能分支)
  │
  ├── release/v3.0.0 (发布分支)
  │
  └── hotfix/bug-fix (热修复分支)
```

#### 3.3.2 提交规范

**提交消息格式**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(candidate-extractor): 实现候选人信息提取功能

- 支持分页和无限滚动两种页面类型
- 添加候选人数据验证
- 优化DOM选择器性能

Closes #123
```

#### 3.3.3 代码合并流程

1. **功能开发完成**
   - 开发Agent提交Pull Request到develop分支
   - 填写PR模板(功能描述、测试情况、影响范围)

2. **代码评审**
   - Architect Agent评审架构符合性
   - Test Agent评审测试覆盖率
   - 其他相关Agent评审代码质量

3. **测试验证**
   - 自动化测试通过
   - 手动测试验证

4. **合并代码**
   - 至少2个Agent Approve
   - Squash merge到develop分支

### 3.4 输出物清单

#### 3.4.1 多Agent协作开发指南

**文件路径**: `docs/multi_agent_collaboration_guide.md`

**内容大纲**:
1. Agent角色定义
2. 协作工作流程
3. 沟通机制
4. 冲突解决机制

#### 3.4.2 任务分配矩阵

**文件路径**: `docs/task_assignment_matrix.md`

**内容大纲**:
1. 模块与Agent对应关系
2. 任务优先级
3. 任务依赖关系
4. 交付时间节点

#### 3.4.3 版本控制规范

**文件路径**: `docs/version_control_specification.md`

**内容大纲**:
1. Git分支管理策略
2. 提交规范
3. 代码合并流程
4. 冲突解决机制

---

## ⚠️ 第四阶段:重构影响分析(第7-8周)

### 4.1 风险评估矩阵

#### 4.1.1 风险识别

| 风险ID | 风险描述 | 风险类型 | 影响程度 | 发生概率 | 风险等级 |
|--------|---------|---------|---------|---------|---------|
| R001 | 模块拆分导致功能回归 | 技术风险 | 高 | 中 | 高 |
| R002 | 接口设计不合理导致返工 | 设计风险 | 高 | 中 | 高 |
| R003 | 多Agent协作沟通成本高 | 管理风险 | 中 | 高 | 中 |
| R004 | 测试覆盖不足导致质量下降 | 质量风险 | 高 | 中 | 高 |
| R005 | 性能下降 | 技术风险 | 中 | 低 | 低 |
| R006 | 用户操作习惯改变 | 用户体验风险 | 中 | 中 | 中 |
| R007 | 第三方库兼容性问题 | 技术风险 | 中 | 低 | 低 |
| R008 | Chrome API变更 | 外部风险 | 高 | 低 | 中 |

#### 4.1.2 风险应对策略

**R001: 模块拆分导致功能回归**
- **应对策略**: 
  1. 建立完整的回归测试套件
  2. 采用增量重构策略,逐步替换模块
  3. 保留旧代码作为备份
- **触发条件**: 测试覆盖率低于80%
- **执行流程**: 
  1. 发现功能回归 → 2. 定位问题模块 → 3. 回滚到稳定版本 → 4. 修复问题 → 5. 重新测试

**R002: 接口设计不合理导致返工**
- **应对策略**:
  1. 架构师提前进行接口评审
  2. 编写接口文档和示例代码
  3. 进行小规模原型验证
- **触发条件**: 接口变更超过3次
- **执行流程**:
  1. 发现接口问题 → 2. 架构师重新设计 → 3. 评审通过 → 4. 更新文档 → 5. 通知相关Agent

**R003: 多Agent协作沟通成本高**
- **应对策略**:
  1. 建立清晰的沟通机制和工具
  2. 使用项目管理工具跟踪进度
  3. 定期举行技术评审会议
- **触发条件**: 任务延期超过2天
- **执行流程**:
  1. 发现协作问题 → 2. 召开紧急会议 → 3. 调整任务分配 → 4. 优化沟通流程

**R004: 测试覆盖不足导致质量下降**
- **应对策略**:
  1. 制定测试覆盖率目标(≥80%)
  2. Test Agent提前介入开发过程
  3. 自动化测试集成到CI/CD流程
- **触发条件**: 测试覆盖率低于目标值
- **执行流程**:
  1. 发现测试不足 → 2. Test Agent补充测试用例 → 3. 开发Agent修复问题 → 4. 重新测试

### 4.2 回滚方案

#### 4.2.1 代码回滚策略

**Git标签管理**:
```bash
# 在每个重要节点打标签
git tag -a v2.0-backup -m "Backup before refactoring"
git tag -a v3.0-mvp1 -m "MVP-1 complete"
git tag -a v3.0-mvp2 -m "MVP-2 complete"
git tag -a v3.0-mvp3 -m "MVP-3 complete"
git tag -a v3.0-mvp4 -m "MVP-4 complete"
```

**回滚操作流程**:
```bash
# 1. 发现严重问题,需要回滚
# 2. 停止所有开发工作
# 3. 回滚到上一个稳定版本
git checkout v2.0-backup
git checkout -b hotfix/rollback-to-v2.0

# 4. 验证回滚后的功能
# 5. 如果确认回滚,合并到master
git checkout master
git merge hotfix/rollback-to-v2.0
git tag -a v2.0.1 -m "Rollback to v2.0 due to critical issues"

# 6. 通知所有Agent
# 7. 分析问题原因
# 8. 制定修复计划
```

#### 4.2.2 数据回滚策略

**配置数据备份**:
```javascript
// 在ConfigManager中添加备份功能
class ConfigManager {
  async backup() {
    const config = await this.load();
    const backup = {
      timestamp: Date.now(),
      version: this.version,
      data: config
    };
    await chrome.storage.local.set({
      [`config_backup_${backup.timestamp}`]: backup
    });
  }

  async restore(timestamp) {
    const backup = await chrome.storage.local.get(`config_backup_${timestamp}`);
    if (backup) {
      await this.save(backup.data);
      return true;
    }
    return false;
  }
}
```

**状态数据备份**:
```javascript
// 在StateManager中添加备份功能
class StateManager {
  async backupState() {
    const state = await this.getState();
    const backup = {
      timestamp: Date.now(),
      tabId: this.tabId,
      state: state
    };
    await chrome.storage.local.set({
      [`state_backup_${backup.timestamp}`]: backup
    });
  }
}
```

### 4.3 性能影响分析

#### 4.3.1 性能基准指标

| 指标 | 当前版本 | 目标版本 | 优化目标 |
|------|---------|---------|---------|
| 候选人提取速度 | 100人/分钟 | 150人/分钟 | +50% |
| 初筛API响应时间 | 2秒/次 | 1.5秒/次 | -25% |
| 简历捕获时间 | 4秒/份 | 3秒/份 | -25% |
| 内存占用 | 150MB | 120MB | -20% |
| 扩展加载时间 | 500ms | 300ms | -40% |

#### 4.3.2 性能优化方案

**优化点1: 候选人提取性能**
- **问题**: DOM查询频繁,选择器复杂
- **方案**: 
  1. 缓存DOM查询结果
  2. 使用更高效的选择器
  3. 批量处理候选人数据
- **预期提升**: 50%

**优化点2: API调用性能**
- **问题**: 串行调用,等待时间长
- **方案**:
  1. 实现请求队列和并发控制
  2. 使用请求缓存
  3. 优化重试策略
- **预期提升**: 25%

**优化点3: 简历捕获性能**
- **问题**: 等待时间固定,未根据实际情况调整
- **方案**:
  1. 实现智能等待机制
  2. 并行处理多张图片
  3. 使用Web Worker处理图片转换
- **预期提升**: 25%

**优化点4: 内存占用**
- **问题**: 日志和状态数据累积
- **方案**:
  1. 限制日志条目数量
  2. 定期清理过期状态
  3. 使用WeakMap存储临时数据
- **预期降低**: 20%

### 4.4 输出物清单

#### 4.4.1 重构风险评估报告

**文件路径**: `docs/refactoring_risk_assessment.md`

**内容大纲**:
1. 风险识别清单
2. 风险评估矩阵
3. 风险应对策略
4. 风险监控机制

#### 4.4.2 风险应对与回滚方案

**文件路径**: `docs/risk_mitigation_rollback_plan.md`

**内容大纲**:
1. 代码回滚策略
2. 数据回滚策略
3. 回滚操作流程
4. 回滚验证方法

#### 4.4.3 性能优化方案

**文件路径**: `docs/performance_optimization_plan.md`

**内容大纲**:
1. 性能基准指标
2. 性能瓶颈分析
3. 优化方案设计
4. 性能测试方法

---

## 🚀 第五阶段:模块独立开发与集成(第9-16周)

### 5.1 开发时间表

#### 5.1.1 MVP-1开发计划(第9-10周)

**第9周**:
- Day 1-2: 架构师搭建项目框架、配置构建环境
- Day 3-4: Backend Agent开发CandidateExtractor模块
- Day 5: Test Agent编写CandidateExtractor单元测试

**第10周**:
- Day 1-2: Backend Agent开发InitialScreener模块
- Day 3: Backend Agent开发StateManager模块
- Day 4: Frontend Agent开发Logger UI组件
- Day 5: Test Agent编写集成测试、进行MVP-1验收

#### 5.1.2 MVP-2开发计划(第11-12周)

**第11周**:
- Day 1-2: Backend Agent开发ResumeCapture模块
- Day 3-4: Backend Agent开发DetailedEvaluator模块
- Day 5: Test Agent编写单元测试

**第12周**:
- Day 1-2: Backend Agent开发ResultExporter模块
- Day 3: Frontend Agent开发导出UI组件
- Day 4: Test Agent编写集成测试
- Day 5: 进行MVP-2验收

#### 5.1.3 MVP-3开发计划(第13-14周)

**第13周**:
- Day 1-2: Backend Agent开发Recommender模块
- Day 3-4: Backend Agent开发PageNavigator模块
- Day 5: Test Agent编写单元测试

**第14周**:
- Day 1-2: Backend Agent开发LLMClient模块
- Day 3: Frontend Agent开发推荐UI组件
- Day 4: Test Agent编写集成测试
- Day 5: 进行MVP-3验收

#### 5.1.4 MVP-4开发计划(第15-16周)

**第15周**:
- Day 1-2: 性能优化(所有Agent)
- Day 3-4: 错误处理完善(Backend Agent)
- Day 5: 用户体验优化(Frontend Agent)

**第16周**:
- Day 1-2: 代码审查和重构(所有Agent)
- Day 3-4: 全面测试(Test Agent)
- Day 5: 进行MVP-4验收、准备发布

### 5.2 测试方案

#### 5.2.1 单元测试方案

**测试框架**: Jest

**测试覆盖率目标**: ≥80%

**测试用例示例**:

```javascript
// tests/unit/modules/candidate/CandidateExtractor.test.js
describe('CandidateExtractor', () => {
  let extractor;
  let mockDOM;

  beforeEach(() => {
    // 准备模拟DOM环境
    mockDOM = createMockDOM({
      pageType: 'pagination',
      candidates: [
        { name: '张三', school: '清华大学', major: '计算机科学' }
      ]
    });
    extractor = new CandidateExtractor({
      logger: mockLogger
    });
  });

  describe('extract()', () => {
    it('should extract candidate info from pagination page', async () => {
      const candidates = await extractor.extract('pagination');
      expect(candidates).toHaveLength(1);
      expect(candidates[0].name).toBe('张三');
      expect(candidates[0].school).toBe('清华大学');
    });

    it('should handle empty candidate list', async () => {
      mockDOM = createMockDOM({ pageType: 'pagination', candidates: [] });
      const candidates = await extractor.extract('pagination');
      expect(candidates).toHaveLength(0);
    });
  });

  describe('validate()', () => {
    it('should validate complete candidate data', () => {
      const candidate = {
        name: '张三',
        school: '清华大学',
        major: '计算机科学',
        education: '本科',
        graduationYear: '2024'
      };
      expect(extractor.validate(candidate)).toBe(true);
    });

    it('should reject candidate without name', () => {
      const candidate = {
        school: '清华大学',
        major: '计算机科学'
      };
      expect(extractor.validate(candidate)).toBe(false);
    });
  });
});
```

#### 5.2.2 集成测试方案

**测试场景**:

1. **完整筛选流程测试**
   - 从候选人列表页面开始
   - 提取候选人信息
   - 执行初筛
   - 进入详情页
   - 捕获简历
   - 执行详细评估
   - 导出结果

2. **推荐流程测试**
   - 筛选出符合条件的候选人
   - 执行推荐操作
   - 验证推荐成功

3. **错误恢复测试**
   - 模拟API错误
   - 验证重试机制
   - 验证错误提示

**测试用例示例**:

```javascript
// tests/integration/screening-flow.test.js
describe('Screening Flow Integration Test', () => {
  let mainController;
  let mockPage;

  beforeAll(async () => {
    mockPage = await createMockMokaPage();
    mainController = new MainController();
  });

  test('complete screening flow', async () => {
    // 1. 启动筛选
    await mainController.startScreening({
      targetCount: 5,
      screeningCriteria: '985院校',
      fullScreeningCriteria: '211或QS前100'
    });

    // 2. 验证候选人提取
    expect(mainController.state.candidates).toHaveLength(5);

    // 3. 验证初筛结果
    expect(mainController.state.screenedCandidates.length).toBeGreaterThan(0);

    // 4. 验证详细评估
    const evaluatedCandidates = mainController.state.results.filter(r => r.qualified);
    expect(evaluatedCandidates.length).toBeGreaterThan(0);

    // 5. 验证导出
    const csvContent = await mainController.exportResults();
    expect(csvContent).toContain('姓名');
    expect(csvContent).toContain('手机号');
  }, 60000); // 设置60秒超时
});
```

#### 5.2.3 E2E测试方案

**测试工具**: Puppeteer

**测试场景**:

1. **用户完整操作流程**
   - 安装扩展
   - 打开Moka页面
   - 配置API信息
   - 设置筛选标准
   - 开始筛选
   - 查看日志
   - 导出结果

**测试用例示例**:

```javascript
// tests/e2e/basic-screening.test.js
describe('E2E: Basic Screening', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
    page = await browser.newPage();
  });

  test('user can complete basic screening workflow', async () => {
    // 1. 打开Moka页面
    await page.goto('https://moka.hiring.com/candidates');
    await page.waitForSelector('.candidate-list');

    // 2. 打开扩展Sidebar
    const [sidebar] = await Promise.all([
      browser.waitForTarget(target => target.url().includes('sidebar.html')),
      page.click('[aria-label="Moka简历筛选Agent"]')
    ]);

    const sidebarPage = await sidebar.page();

    // 3. 配置API信息
    await sidebarPage.type('#apiKey', 'test-api-key');
    await sidebarPage.type('#baseUrl', 'https://api.example.com');
    await sidebarPage.click('#saveConfig');

    // 4. 设置筛选标准
    await sidebarPage.type('#screeningCriteria', '985院校');
    await sidebarPage.type('#fullScreeningCriteria', '211或QS前100');
    await sidebarPage.type('#targetCount', '10');

    // 5. 开始筛选
    await sidebarPage.click('#startBtn');

    // 6. 等待筛选完成
    await sidebarPage.waitForSelector('#exportBtn', { timeout: 120000 });

    // 7. 导出结果
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      sidebarPage.click('#exportBtn')
    ]);

    expect(download.suggestedFilename()).toMatch(/合格候选人_\d{4}-\d{2}-\d{2}\.csv/);
  }, 180000); // 设置3分钟超时

  afterAll(async () => {
    await browser.close();
  });
});
```

### 5.3 集成策略

#### 5.3.1 增量集成策略

**阶段1: 核心模块集成**
- 集成CandidateExtractor + InitialScreener + StateManager
- 验证基本筛选流程
- 测试覆盖率≥80%

**阶段2: 完整流程集成**
- 集成ResumeCapture + DetailedEvaluator + ResultExporter
- 验证完整筛选流程
- 测试覆盖率≥80%

**阶段3: 高级功能集成**
- 集成Recommender + PageNavigator + LLMClient
- 验证高级功能
- 测试覆盖率≥80%

**阶段4: 整体优化集成**
- 性能优化
- 错误处理完善
- 用户体验优化
- 最终测试覆盖率≥80%

#### 5.3.2 集成测试检查清单

**功能完整性检查**:
- [ ] 所有功能模块都已集成
- [ ] 所有接口都能正常调用
- [ ] 所有UI组件都能正常显示
- [ ] 所有用户操作都能正常响应

**性能检查**:
- [ ] 候选人提取速度达标
- [ ] API响应时间达标
- [ ] 简历捕获时间达标
- [ ] 内存占用达标

**稳定性检查**:
- [ ] 连续运行1小时无崩溃
- [ ] 处理100个候选人无错误
- [ ] 网络异常能正确处理
- [ ] 内存泄漏测试通过

**兼容性检查**:
- [ ] Chrome最新版本兼容
- [ ] 不同Moka页面类型兼容
- [ ] 不同简历格式兼容

### 5.4 用户测试计划

#### 5.4.1 MVP用户测试方案

**测试目标**:
- 验证功能正确性
- 收集用户反馈
- 发现易用性问题

**测试用户**: 5-10名招聘专员

**测试场景**:

| 场景 | 操作步骤 | 预期结果 |
|------|---------|---------|
| 基本筛选 | 1. 配置API<br>2. 设置筛选标准<br>3. 开始筛选<br>4. 导出结果 | 成功筛选并导出结果 |
| 暂停继续 | 1. 开始筛选<br>2. 暂停<br>3. 继续 | 能正确暂停和恢复 |
| 错误处理 | 1. 输入错误的API Key<br>2. 开始筛选 | 显示友好的错误提示 |
| 结果查看 | 1. 筛选完成<br>2. 查看日志<br>3. 导出结果 | 日志清晰,结果准确 |

**反馈收集**:
- 功能是否满足需求
- 操作是否流畅
- 界面是否友好
- 有哪些改进建议

#### 5.4.2 用户测试反馈报告模板

**文件路径**: `docs/mvp_user_test_feedback_report.md`

**内容大纲**:
1. 测试概述
   - 测试时间
   - 测试用户
   - 测试环境
2. 测试结果
   - 功能正确性
   - 易用性评分
   - 性能表现
3. 问题清单
   - 功能问题
   - 易用性问题
   - 性能问题
4. 改进建议
   - 功能改进
   - 界面改进
   - 性能优化

### 5.5 输出物清单

#### 5.5.1 模块开发时间表

**文件路径**: `docs/module_development_schedule.md`

**内容大纲**:
1. MVP阶段划分
2. 每周开发计划
3. 里程碑节点
4. 交付物清单

#### 5.5.2 测试方案与用例

**文件路径**: `docs/test_plan_and_cases.md`

**内容大纲**:
1. 单元测试方案
2. 集成测试方案
3. E2E测试方案
4. 测试用例清单

#### 5.5.3 集成测试报告

**文件路径**: `docs/integration_test_report.md`

**内容大纲**:
1. 集成测试概述
2. 测试执行情况
3. 问题发现与修复
4. 测试结论

#### 5.5.4 MVP用户测试反馈报告

**文件路径**: `docs/mvp_user_test_feedback_report.md`

**内容大纲**:
1. 测试概述
2. 测试结果
3. 问题清单
4. 改进建议

---

## ✅ 第六阶段:质量保障与验收(第17-18周)

### 6.1 功能验证标准

#### 6.1.1 原有功能验证清单

| 功能模块 | 验证项 | 验证方法 | 验收标准 |
|---------|--------|---------|---------|
| 候选人提取 | 分页页面提取 | 手动测试 | 能正确提取候选人信息 |
| 候选人提取 | 无限滚动页面提取 | 手动测试 | 能正确提取候选人信息 |
| 初筛分析 | API调用 | 自动化测试 | 能正确调用大模型API |
| 初筛分析 | 结果解析 | 自动化测试 | 能正确解析API返回结果 |
| 详细评估 | 进入详情页 | 手动测试 | 能正确进入候选人详情页 |
| 详细评估 | 简历捕获 | 手动测试 | 能正确捕获简历图片 |
| 详细评估 | 大模型评估 | 手动测试 | 能正确评估简历 |
| 推荐功能 | 推荐操作 | 手动测试 | 能成功推荐候选人 |
| 状态管理 | 状态持久化 | 自动化测试 | 切换tab后状态保持 |
| 状态管理 | 暂停/继续 | 手动测试 | 能正确暂停和继续 |
| 状态管理 | 停止 | 手动测试 | 能正确停止筛选 |
| 结果导出 | CSV导出 | 自动化测试 | 能正确导出CSV文件 |

#### 6.1.2 新增功能验证清单

| 功能模块 | 验证项 | 验证方法 | 验收标准 |
|---------|--------|---------|---------|
| 错误处理 | API错误提示 | 手动测试 | 显示友好的错误提示 |
| 错误处理 | 网络错误重试 | 自动化测试 | 能自动重试失败的请求 |
| 性能优化 | 候选人提取速度 | 性能测试 | 速度提升≥50% |
| 性能优化 | 内存占用 | 性能测试 | 内存占用降低≥20% |
| 用户体验 | 操作流畅度 | 用户测试 | 无明显卡顿 |
| 用户体验 | 日志清晰度 | 用户测试 | 日志信息清晰易懂 |

### 6.2 性能基准与优化目标

#### 6.2.1 性能测试方案

**测试工具**: Chrome DevTools + Lighthouse

**测试场景**:

1. **加载性能测试**
   - 测试扩展加载时间
   - 测试Sidebar打开时间
   - 测试首次运行时间

2. **运行时性能测试**
   - 测试候选人提取速度
   - 测试API调用响应时间
   - 测试简历捕获时间
   - 测试内存占用

3. **稳定性测试**
   - 连续运行测试(1小时)
   - 大数据量测试(100个候选人)
   - 网络异常测试

#### 6.2.2 性能基准报告模板

**文件路径**: `docs/performance_test_report.md`

**内容大纲**:
1. 测试环境
   - 浏览器版本
   - 操作系统
   - 硬件配置
2. 测试结果
   - 加载性能
   - 运行时性能
   - 稳定性
3. 性能对比
   - 与v2.0版本对比
   - 优化效果分析
4. 性能瓶颈
   - 识别的性能瓶颈
   - 优化建议

### 6.3 用户体验测试方案

#### 6.3.1 可用性测试

**测试方法**: 用户体验测试

**测试用户**: 10名招聘专员

**测试任务**:

1. **任务1: 首次使用**
   - 安装扩展
   - 配置API信息
   - 完成第一次筛选

2. **任务2: 日常使用**
   - 打开扩展
   - 设置筛选标准
   - 开始筛选
   - 查看结果

3. **任务3: 错误处理**
   - 输入错误的配置
   - 查看错误提示
   - 修正配置

**评估指标**:
- 任务完成率
- 任务完成时间
- 错误次数
- 用户满意度(1-5分)

#### 6.3.2 用户满意度调查

**调查问卷**:

1. 功能完整性(1-5分)
   - 是否满足工作需求
   - 功能是否齐全

2. 易用性(1-5分)
   - 操作是否简单
   - 界面是否清晰

3. 性能(1-5分)
   - 响应速度
   - 稳定性

4. 整体满意度(1-5分)
   - 是否愿意继续使用
   - 是否愿意推荐给同事

5. 改进建议
   - 最喜欢的功能
   - 最需要改进的地方
   - 其他建议

### 6.4 质量验收标准

#### 6.4.1 功能验收标准

| 验收项 | 标准 | 验证方法 |
|--------|------|---------|
| 功能完整性 | 所有原有功能正常工作 | 功能测试 |
| 功能正确性 | 筛选结果准确率≥95% | 结果验证 |
| 稳定性 | 连续运行1小时无崩溃 | 稳定性测试 |
| 兼容性 | 支持Chrome最新3个版本 | 兼容性测试 |

#### 6.4.2 性能验收标准

| 验收项 | 标准 | 验证方法 |
|--------|------|---------|
| 加载性能 | 扩展加载时间≤300ms | 性能测试 |
| 运行性能 | 候选人提取速度≥150人/分钟 | 性能测试 |
| 内存占用 | 内存占用≤120MB | 性能测试 |
| 响应时间 | UI操作响应时间≤100ms | 性能测试 |

#### 6.4.3 质量验收标准

| 验收项 | 标准 | 验证方法 |
|--------|------|---------|
| 代码质量 | ESLint检查无错误 | 代码检查 |
| 测试覆盖率 | 单元测试覆盖率≥80% | 测试报告 |
| 文档完整性 | 所有模块都有文档 | 文档检查 |
| 用户满意度 | 整体满意度≥4分 | 用户调查 |

### 6.5 输出物清单

#### 6.5.1 质量验收标准文档

**文件路径**: `docs/quality_acceptance_criteria.md`

**内容大纲**:
1. 功能验收标准
2. 性能验收标准
3. 质量验收标准
4. 验收流程

#### 6.5.2 性能测试报告

**文件路径**: `docs/performance_test_report.md`

**内容大纲**:
1. 测试环境
2. 测试结果
3. 性能对比
4. 性能瓶颈

#### 6.5.3 用户体验测试报告

**文件路径**: `docs/user_experience_test_report.md`

**内容大纲**:
1. 测试概述
2. 可用性测试结果
3. 用户满意度调查
4. 改进建议

---

## 📅 项目时间节点与里程碑

### 时间轴总览

```
Week 1-2:  拓展现状分析
Week 3-5:  模块化设计
Week 6:    多Agent协作规划
Week 7-8:  重构影响分析
Week 9-16: 模块开发与集成
Week 17-18: 质量保障与验收
```

### 关键里程碑

| 里程碑 | 时间节点 | 交付物 | 验收标准 |
|--------|---------|--------|---------|
| M1: 现状分析完成 | 第2周末 | 分析报告、依赖图、接口文档 | 文档完整、分析准确 |
| M2: 架构设计完成 | 第5周末 | 架构方案、接口规范、MVP清单 | 设计合理、评审通过 |
| M3: 协作规划完成 | 第6周末 | 协作指南、任务矩阵、版本规范 | 计划清晰、可执行 |
| M4: 风险评估完成 | 第8周末 | 风险报告、回滚方案、优化方案 | 风险识别全面、应对措施可行 |
| M5: MVP-1完成 | 第10周末 | 核心筛选功能 | 功能正确、测试通过 |
| M6: MVP-2完成 | 第12周末 | 完整筛选流程 | 功能正确、测试通过 |
| M7: MVP-3完成 | 第14周末 | 高级功能 | 功能正确、测试通过 |
| M8: MVP-4完成 | 第16周末 | 优化完善 | 性能达标、体验优化 |
| M9: 项目验收 | 第18周末 | 最终版本 | 所有验收标准通过 |

---

## 📊 资源分配方案

### 人力资源分配

| 角色 | 人数 | 工作内容 | 工作量 |
|------|------|---------|--------|
| 架构师 | 1 | 架构设计、技术决策、代码评审 | 100% |
| 前端开发 | 1 | UI开发、视图层实现 | 100% |
| 后端开发 | 2 | 业务逻辑、API集成 | 100% |
| 测试工程师 | 1 | 测试用例、测试执行 | 100% |
| DevOps工程师 | 1 | 构建配置、CI/CD | 50% |
| 项目经理 | 1 | 项目管理、进度跟踪 | 50% |

### 工具资源分配

| 工具类型 | 工具名称 | 用途 | 成本 |
|---------|---------|------|------|
| 代码管理 | GitHub | 代码托管、版本控制 | 免费 |
| 项目管理 | Jira/Trello | 任务管理、进度跟踪 | 免费 |
| 文档协作 | Confluence/Notion | 文档编写、知识管理 | 免费 |
| 设计工具 | Figma | UI设计、原型制作 | 免费 |
| 测试工具 | Jest/Puppeteer | 单元测试、E2E测试 | 免费 |
| CI/CD | GitHub Actions | 自动化构建、测试 | 免费 |

### 环境资源分配

| 环境类型 | 配置 | 用途 | 成本 |
|---------|------|------|------|
| 开发环境 | 本地Chrome | 日常开发 | 免费 |
| 测试环境 | 测试Chrome配置 | 功能测试 | 免费 |
| 生产环境 | 正式Chrome配置 | 用户使用 | 免费 |

---

## 🔄 进度跟踪与调整机制

### 每周进度跟踪

**跟踪内容**:
- 本周完成任务
- 下周计划任务
- 遇到的问题和风险
- 需要的支持和资源

**跟踪方式**:
- 每日站会(10分钟)
- 周例会(1小时)
- 项目看板更新

### 进度调整机制

**调整触发条件**:
- 任务延期超过2天
- 发现重大技术问题
- 需求变更
- 资源调整

**调整流程**:
1. 识别调整需求
2. 评估影响范围
3. 制定调整方案
4. 评审调整方案
5. 执行调整
6. 更新项目计划

### 风险监控机制

**监控频率**: 每周

**监控内容**:
- 风险状态更新
- 新风险识别
- 风险应对措施执行情况

**监控方式**:
- 风险清单更新
- 风险报告编写
- 风险评审会议

---

## 📝 总结

本重构计划通过系统性的分析和设计,制定了详细的模块化重构方案。计划涵盖了从现状分析到最终验收的完整流程,包括:

1. **全面的分析阶段**: 深入分析现有代码结构、识别问题、评估风险
2. **科学的设计阶段**: 基于设计原则制定模块化架构、定义接口规范
3. **高效的协作机制**: 建立多Agent协作框架、明确任务分工
4. **完善的风险管理**: 识别风险、制定应对策略、建立回滚机制
5. **渐进的开发策略**: 采用MVP迭代方式、逐步验证和完善
6. **严格的质量保障**: 建立验收标准、进行性能测试、用户体验测试

通过执行本计划,预期实现:
- ✅ 代码可维护性提升50%以上
- ✅ 功能模块化程度达到90%以上
- ✅ 测试覆盖率达到80%以上
- ✅ 性能提升30%以上
- ✅ 用户满意度达到4分以上(5分制)

重构后的扩展将具备更好的可维护性、可扩展性和稳定性,为后续功能迭代和优化奠定坚实基础。
