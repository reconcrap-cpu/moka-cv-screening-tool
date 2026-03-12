# 🚀 浏览器扩展重构项目 - 新工作空间启动指南

> **文档版本**: v1.0  
> **创建日期**: 2026-03-12  
> **适用场景**: 在新工作空间开始执行项目任务

---

## 📋 目录

1. [项目概述](#项目概述)
2. [项目状态](#项目状态)
3. [关键文档索引](#关键文档索引)
4. [技术栈与环境](#技术栈与环境)
5. [核心决策与原则](#核心决策与原则)
6. [完整任务清单](#完整任务清单)
7. [快速启动指南](#快速启动指南)
8. [风险与注意事项](#风险与注意事项)

---

## 项目概述

### 项目背景

**项目名称**: Moka简历筛选Chrome扩展模块化重构  
**当前版本**: v2.0  
**目标版本**: v3.0  
**项目周期**: 18周  

### 项目目标

将现有的Moka简历筛选Chrome扩展进行全面模块化重构,实现:
- ✅ 功能模块化,提升可维护性
- ✅ 支持多Agent协作开发
- ✅ 提升性能和用户体验
- ✅ 建立完善的测试和变更管理体系

### 核心价值

- **代码可维护性提升**: 50%以上
- **功能模块化程度**: 90%以上
- **测试覆盖率**: 80%以上
- **性能提升**: 30%以上
- **用户满意度**: 4分以上(5分制)

---

## 项目状态

### 当前阶段

**阶段**: 第0周 - 前置验证阶段  
**状态**: 准备开始执行任务清单

### 已完成工作

1. ✅ 完成拓展现状分析
   - 识别了12个核心功能模块
   - 代码质量评估: 6.3/10
   - 技术栈分析完成

2. ✅ 完成模块化架构设计
   - 设计了分层架构(核心层→模块层→控制器层→视图层→服务层)
   - 定义了模块接口规范
   - 制定了MVP迭代计划

3. ✅ 完成项目计划调整
   - 7项关键优化方案
   - Git Controller Agent集成方案
   - 多Agent并行开发机制
   - 实际环境测试方案

### 待执行工作

按照本文档的[完整任务清单](#完整任务清单)执行35个具体任务。

---

## 关键文档索引

### 📁 项目规划文档

| 文档名称 | 文件路径 | 用途 | 重要程度 |
|---------|---------|------|---------|
| 主计划文档 | `task_plan.md` | 完整的18周重构计划,包含6个阶段详细规划 | ⭐⭐⭐⭐⭐ |
| 优化方案文档 | `docs/project_plan_adjustment.md` | 7项关键优化的详细实施方案 | ⭐⭐⭐⭐⭐ |
| 项目启动指南 | `docs/project_startup_guide.md` | 本文档,新工作空间启动指南 | ⭐⭐⭐⭐⭐ |

### 📁 现有代码文件

| 文件名称 | 文件路径 | 代码行数 | 说明 |
|---------|---------|---------|------|
| manifest.json | `manifest.json` | 34行 | Chrome扩展配置文件 |
| background.js | `background.js` | 391行 | 后台脚本,状态管理 |
| content.js | `content.js` | 2000行 | 内容脚本,核心业务逻辑 |
| sidebar.js | `sidebar.js` | 503行 | 侧边栏脚本,UI交互 |
| sidebar.html | `sidebar.html` | 306行 | 侧边栏HTML界面 |
| config.js | `config.js` | 239行 | 配置文件,大模型配置和提示词 |

### 📁 待创建文档

以下文档将在执行任务清单时创建:

| 文档名称 | 文件路径 | 创建任务 |
|---------|---------|---------|
| 选择器配置模块 | `src/constants/Selectors.js` | 任务3 |
| 选择器监控工具 | `src/utils/SelectorMonitor.js` | 任务4 |
| Git Controller角色定义 | `docs/agent_roles.md` | 任务7 |
| Git工作流程 | `docs/git_workflow.md` | 任务9 |
| 并行开发机制 | `docs/parallel_development_mechanism.md` | 任务10 |
| 实际环境测试方案 | `docs/real_environment_test_plan.md` | 任务12 |
| 变更文档模板 | `docs/change_document_template.md` | 任务16 |
| 变更追踪机制 | `docs/change_tracking.md` | 任务17 |
| 变更追踪工具 | `scripts/change_tracker.js` | 任务18 |

---

## 技术栈与环境

### 当前技术栈

| 技术 | 版本/规范 | 用途 | 状态 |
|------|----------|------|------|
| Chrome Extension Manifest | V3 | 扩展架构 | ✅ 最新标准 |
| JavaScript | ES6+ | 主要开发语言 | ⚠️ 缺少TypeScript |
| Chrome APIs | - | 扩展能力 | ✅ 使用合理 |
| html2canvas | - | 简历截图 | ⚠️ 外部依赖 |
| Fetch API | - | HTTP请求 | ✅ 原生支持 |

### 目标技术栈

| 技术 | 版本 | 用途 | 优先级 |
|------|------|------|--------|
| TypeScript | 5.x | 类型安全 | 高 |
| Webpack | 5.x | 模块打包 | 高 |
| Jest | 29.x | 单元测试 | 高 |
| ESLint | 8.x | 代码规范 | 中 |
| Prettier | 3.x | 代码格式化 | 中 |

### 开发环境要求

**必需环境**:
- ✅ Node.js >= 16.x
- ✅ npm >= 8.x
- ✅ Chrome浏览器最新版本
- ✅ Git版本控制工具
- ✅ 代码编辑器(VSCode推荐)

**推荐工具**:
- VSCode扩展: ESLint, Prettier, GitLens
- Chrome扩展: React DevTools(如使用React)
- 终端工具: PowerShell 5+ / Git Bash

### GitHub环境

**仓库信息**:
- 仓库地址: [待创建]
- 默认分支: `main`
- 开发分支: `develop`
- 功能分支: `feature/*`

**权限要求**:
- GitHub Token权限: `repo`, `workflow`, `write:packages`, `read:org`
- 需要在任务1中验证GitHub MCP功能

---

## 核心决策与原则

### 架构设计原则

1. **单一职责原则**: 每个模块只负责一个功能
2. **开闭原则**: 对扩展开放,对修改关闭
3. **依赖倒置原则**: 依赖抽象而非具体实现
4. **接口隔离原则**: 使用小而专一的接口
5. **迪米特法则**: 最少知识原则

### 开发原则

1. **MVP迭代**: 每个模块先设计MVP版本,验证后再完整开发
2. **接口先行**: 先定义接口,后实现功能
3. **实际环境测试**: 所有测试均在实际环境中执行,禁止模拟环境
4. **文档同步**: 代码变更必须同步更新文档

### 协作原则

1. **Git Controller统一管理**: 所有Git操作由Git Controller Agent统一执行
2. **并行开发**: Backend Agent A和B并行开发,效率提升40%
3. **每日同步**: 每日站会同步进度和问题
4. **代码审查**: 所有代码合并前必须经过审查

### 测试原则

1. **实际环境**: 禁止使用模拟DOM环境测试
2. **真实数据**: 使用用户提供的真实简历信息测试
3. **覆盖率目标**: 单元测试覆盖率≥80%
4. **测试一致性**: 所有测试必须在相同环境中执行

---

## 完整任务清单

### 📊 任务统计

- **总任务数**: 35个
- **高优先级(P0)**: 21个
- **中优先级(P1)**: 13个
- **低优先级(P2)**: 1个

### 🔴 第0周 - 前置验证阶段 (2个任务)

#### 任务1: 执行GitHub MCP功能验证 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 1天  
**负责人**: Git Controller Agent

**任务描述**:
验证GitHub MCP的可用性和操作权限,确保后续开发流程不受版本控制功能影响。

**验证内容**:
1. GitHub连接测试
2. 创建仓库测试
3. 文件操作测试
4. 分支操作测试
5. Pull Request操作测试

**执行步骤**:
1. 参考`docs/project_plan_adjustment.md`第5节"前置技术验证"
2. 按照验证文档逐项执行验证
3. 记录每项验证的实际结果
4. 编写验证总结报告

**验收标准**:
- [ ] 所有验证项都已执行
- [ ] 验证结果已记录
- [ ] 发现的问题已解决或有解决方案
- [ ] 验证总结报告已完成

**输出物**:
- GitHub MCP验证报告

---

#### 任务2: 准备实际环境测试数据 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 2天  
**负责人**: Test Agent

**任务描述**:
收集真实候选人信息和简历文件,用于后续实际环境测试。

**数据要求**:

**基本信息**(至少10条):
- 候选人姓名
- 学校
- 专业
- 学历
- 毕业年份
- 手机号
- 邮箱

**详情页URL**(至少10个):
- 候选人详情页URL
- 包含不同简历格式的详情页

**简历文件**(至少5份):
- 不同格式: PDF, Word, 图片
- 包含完整教育背景和工作经历

**执行步骤**:
1. 参考`docs/project_plan_adjustment.md`第6节"测试策略升级"
2. 按照JSON或CSV格式收集数据
3. 准备不同格式的简历文件
4. 创建测试数据文件

**验收标准**:
- [ ] 候选人基本信息≥10条
- [ ] 详情页URL≥10个
- [ ] 不同格式简历≥5份
- [ ] 数据格式正确

**输出物**:
- `tests/test_data.json` 或 `tests/test_data.csv`
- `tests/resumes/` 目录下的简历文件

---

### 🟠 第1周 - 架构优化与团队调整 (9个任务)

#### 任务3: 开发选择器配置模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 2天  
**负责人**: Backend Agent A

**任务描述**:
创建专用的选择器配置模块,集中管理所有网页选择器,为每个选择器添加详细注释说明其用途、定位逻辑及潜在变更风险。

**执行步骤**:
1. 创建文件 `src/constants/Selectors.js`
2. 参考`docs/project_plan_adjustment.md`第1节"架构优化"中的代码示例
3. 将现有代码中的所有选择器迁移到配置模块
4. 为每个选择器添加详细注释

**验收标准**:
- [ ] 所有选择器都集中管理在`Selectors.js`中
- [ ] 每个选择器都有详细注释
- [ ] 包含备用选择器
- [ ] 包含选择器变更历史记录

**输出物**:
- `src/constants/Selectors.js`

---

#### 任务4: 创建选择器监控工具 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 1天  
**负责人**: Backend Agent A

**任务描述**:
开发选择器监控工具,实现选择器有效性检查和健康报告生成。

**执行步骤**:
1. 创建文件 `src/utils/SelectorMonitor.js`
2. 参考`docs/project_plan_adjustment.md`第1节中的代码示例
3. 实现选择器有效性检查功能
4. 实现健康报告生成功能

**验收标准**:
- [ ] 能检查所有选择器是否有效
- [ ] 能生成选择器健康报告
- [ ] 能记录失效选择器

**输出物**:
- `src/utils/SelectorMonitor.js`

---

#### 任务5: 更新模块使用选择器配置 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 1天  
**负责人**: Backend Agent A

**任务描述**:
修改CandidateExtractor、ResumeCapture等模块,使用配置化选择器替代硬编码。

**执行步骤**:
1. 修改 `src/modules/candidate/CandidateExtractor.js`
2. 修改 `src/modules/resume/ResumeCapture.js`
3. 导入选择器配置模块
4. 替换所有硬编码选择器

**验收标准**:
- [ ] 所有模块都使用配置化选择器
- [ ] 无硬编码选择器
- [ ] 功能测试通过

**输出物**:
- 更新后的模块文件

---

#### 任务6: 完善简历格式文档 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 0.5天  
**负责人**: Architect Agent

**任务描述**:
在task_plan.md第56行后插入详细的简历格式支持说明,包括5种格式的详细信息。

**执行步骤**:
1. 参考`docs/project_plan_adjustment.md`第2节"文档完善"
2. 在`task_plan.md`第56行后插入简历格式详细说明
3. 包含格式名称、扩展名、内容类型、解析规则、兼容性说明

**验收标准**:
- [ ] 文档包含所有5种简历格式的详细说明
- [ ] 每种格式都包含完整信息
- [ ] 提供了代码示例

**输出物**:
- 更新后的 `task_plan.md`

---

#### 任务7: 定义Git Controller Agent角色 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 1天  
**负责人**: Git Controller Agent

**任务描述**:
编写Git Controller Agent角色定义文档,明确职责、工作流程、接口定义。

**执行步骤**:
1. 创建文件 `docs/agent_roles.md`
2. 参考`docs/project_plan_adjustment.md`第3节"Agent团队架构调整"
3. 定义Git Controller Agent的职责
4. 定义工作流程
5. 定义接口

**验收标准**:
- [ ] 角色定义完整
- [ ] 职责明确
- [ ] 工作流程清晰
- [ ] 接口定义完整

**输出物**:
- `docs/agent_roles.md`

---

#### 任务8: 更新任务分配矩阵 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 0.5天  
**负责人**: Git Controller Agent

**任务描述**:
在任务分配矩阵中添加Git Controller Agent列,明确各模块的Git操作责任人。

**执行步骤**:
1. 创建或更新文件 `docs/task_assignment_matrix.md`
2. 参考`docs/project_plan_adjustment.md`第3节中的任务分配矩阵
3. 添加Git Controller Agent列
4. 填写各模块的Git操作责任人

**验收标准**:
- [ ] 任务分配矩阵已更新
- [ ] 包含Git Controller Agent列
- [ ] 所有模块都有Git操作责任人

**输出物**:
- `docs/task_assignment_matrix.md`

---

#### 任务9: 建立Git操作工作流程 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 1天  
**负责人**: Git Controller Agent

**任务描述**:
编写Git操作工作流程文档,定义功能开发、冲突解决、版本发布流程。

**执行步骤**:
1. 创建文件 `docs/git_workflow.md`
2. 参考`docs/project_plan_adjustment.md`第3节中的工作流程
3. 定义功能开发流程
4. 定义冲突解决流程
5. 定义版本发布流程

**验收标准**:
- [ ] 工作流程文档完整
- [ ] 包含功能开发流程
- [ ] 包含冲突解决流程
- [ ] 包含版本发布流程

**输出物**:
- `docs/git_workflow.md`

---

#### 任务10: 设计并行开发协作机制 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 1天  
**负责人**: Architect Agent

**任务描述**:
编写并行开发协作机制文档,包含模块分组、接口定义规范、冲突解决策略、进度同步机制。

**执行步骤**:
1. 创建文件 `docs/parallel_development_mechanism.md`
2. 参考`docs/project_plan_adjustment.md`第4节"开发流程优化"
3. 设计模块分组策略
4. 定义接口定义规范
5. 制定冲突解决策略
6. 设计进度同步机制

**验收标准**:
- [ ] 模块分组策略清晰
- [ ] 接口定义规范完整
- [ ] 冲突解决策略明确
- [ ] 进度同步机制完善

**输出物**:
- `docs/parallel_development_mechanism.md`

---

#### 任务11: 制定并行开发时间表 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 0.5天  
**负责人**: Architect Agent

**任务描述**:
规划Backend Agent A和Backend Agent B的任务分配,制定详细的并行开发时间表,预计效率提升40%。

**执行步骤**:
1. 更新 `docs/parallel_development_mechanism.md`
2. 参考`docs/project_plan_adjustment.md`第4节中的时间表
3. 制定Week 3-6的详细任务分配
4. 明确每个Agent的任务和时间节点

**验收标准**:
- [ ] 时间表详细完整
- [ ] 任务分配合理
- [ ] 效率提升≥40%

**输出物**:
- 更新后的 `docs/parallel_development_mechanism.md`

---

### 🟡 第2周 - 测试准备与变更管理 (7个任务)

#### 任务12: 设计实际环境测试方案 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 1天  
**负责人**: Test Agent

**任务描述**:
编写实际环境测试方案文档,明确测试原则、环境、数据要求、测试用例设计、测试执行流程。

**执行步骤**:
1. 创建文件 `docs/real_environment_test_plan.md`
2. 参考`docs/project_plan_adjustment.md`第6节"测试策略升级"
3. 定义测试原则
4. 明确测试环境要求
5. 定义测试数据要求
6. 设计测试用例模板
7. 定义测试执行流程

**验收标准**:
- [ ] 测试方案文档完整
- [ ] 测试原则明确
- [ ] 测试数据要求清晰
- [ ] 测试用例模板完整

**输出物**:
- `docs/real_environment_test_plan.md`

---

#### 任务13: 设计测试用例模板 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 0.5天  
**负责人**: Test Agent

**任务描述**:
创建标准测试用例模板,包含测试信息、目标、步骤、预期输出、实际输出。

**执行步骤**:
1. 更新 `docs/real_environment_test_plan.md`
2. 参考`docs/project_plan_adjustment.md`第6节中的测试用例模板
3. 设计标准测试用例模板
4. 包含所有必要字段

**验收标准**:
- [ ] 测试用例模板完整
- [ ] 包含测试信息、目标、步骤、预期输出、实际输出
- [ ] 格式清晰易用

**输出物**:
- 更新后的 `docs/real_environment_test_plan.md`

---

#### 任务14: 编写测试用例示例 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 1天  
**负责人**: Test Agent

**任务描述**:
至少编写5个核心功能的测试用例,包括候选人提取、简历捕获、初筛、详细评估、结果导出。

**执行步骤**:
1. 更新 `docs/real_environment_test_plan.md`
2. 参考`docs/project_plan_adjustment.md`第6节中的测试用例示例
3. 编写候选人提取测试用例
4. 编写简历捕获测试用例
5. 编写初筛测试用例
6. 编写详细评估测试用例
7. 编写结果导出测试用例

**验收标准**:
- [ ] 至少编写5个测试用例
- [ ] 每个测试用例都完整
- [ ] 包含测试步骤和预期输出

**输出物**:
- 更新后的 `docs/real_environment_test_plan.md`

---

#### 任务15: 准备测试数据模板 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 0.5天  
**负责人**: Test Agent

**任务描述**:
创建测试数据模板文件,指导用户填写测试数据。

**执行步骤**:
1. 创建文件 `tests/test_data_template.json`
2. 参考`docs/project_plan_adjustment.md`第6节中的测试数据模板
3. 定义JSON格式
4. 添加填写说明

**验收标准**:
- [ ] 测试数据模板完整
- [ ] 包含填写说明
- [ ] 格式清晰易用

**输出物**:
- `tests/test_data_template.json`

---

#### 任务16: 定义变更文档标准 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 0.5天  
**负责人**: Architect Agent

**任务描述**:
编写变更文档标准模板,包含变更基本信息、说明、实施步骤、验证方法、验收标准。

**执行步骤**:
1. 创建文件 `docs/change_document_template.md`
2. 参考`docs/project_plan_adjustment.md`第7节"交付标准"
3. 定义变更文档模板
4. 包含所有必要字段

**验收标准**:
- [ ] 变更文档模板完整
- [ ] 包含变更基本信息、说明、实施步骤、验证方法
- [ ] 格式清晰易用

**输出物**:
- `docs/change_document_template.md`

---

#### 任务17: 建立变更追踪机制 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 0.5天  
**负责人**: Architect Agent

**任务描述**:
编写变更追踪机制文档,定义变更追踪流程、表格、统计。

**执行步骤**:
1. 创建文件 `docs/change_tracking.md`
2. 参考`docs/project_plan_adjustment.md`第7节中的变更追踪机制
3. 定义变更追踪流程
4. 设计变更追踪表格
5. 定义变更统计方法

**验收标准**:
- [ ] 变更追踪流程清晰
- [ ] 变更追踪表格完整
- [ ] 变更统计方法明确

**输出物**:
- `docs/change_tracking.md`

---

#### 任务18: 开发变更追踪工具 ⭐⭐⭐

**优先级**: 低  
**预计耗时**: 1天  
**负责人**: Backend Agent A

**任务描述**:
创建变更追踪工具,实现变更记录、状态更新、报告生成功能。

**执行步骤**:
1. 创建文件 `scripts/change_tracker.js`
2. 参考`docs/project_plan_adjustment.md`第7节中的代码示例
3. 实现变更记录功能
4. 实现状态更新功能
5. 实现报告生成功能

**验收标准**:
- [ ] 变更追踪工具可用
- [ ] 能记录变更
- [ ] 能更新状态
- [ ] 能生成报告

**输出物**:
- `scripts/change_tracker.js`

---

### 🟢 第3-6周 - 并行开发阶段 (11个任务)

#### 任务19: Backend Agent B开发StateManager模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 3天  
**负责人**: Backend Agent B  
**依赖**: 无(优先级最高)

**任务描述**:
开发StateManager模块,管理筛选流程状态(运行/暂停/停止/完成),支持多tab状态管理和持久化。

**执行步骤**:
1. 创建文件 `src/modules/state/StateManager.js`
2. 参考`task_plan.md`第2节中的接口定义
3. 实现状态管理功能
4. 实现持久化功能
5. 定义状态接口

**验收标准**:
- [ ] 状态管理功能完整
- [ ] 支持多tab状态管理
- [ ] 支持持久化
- [ ] 接口定义清晰

**输出物**:
- `src/modules/state/StateManager.js`
- `src/modules/state/index.js`

---

#### 任务20: Backend Agent B开发Logger模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 2天  
**负责人**: Backend Agent B  
**依赖**: 无

**任务描述**:
开发Logger模块,记录筛选过程日志、实时显示,支持多种日志类型(info/success/warning/error)。

**执行步骤**:
1. 创建文件 `src/modules/logger/Logger.js`
2. 参考`task_plan.md`第2节中的接口定义
3. 实现日志记录功能
4. 实现实时显示功能
5. 定义日志接口

**验收标准**:
- [ ] 日志记录功能完整
- [ ] 支持多种日志类型
- [ ] 支持实时显示
- [ ] 接口定义清晰

**输出物**:
- `src/modules/logger/Logger.js`
- `src/modules/logger/index.js`

---

#### 任务21: Backend Agent B开发ConfigManager模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 2天  
**负责人**: Backend Agent B  
**依赖**: 无

**任务描述**:
开发ConfigManager模块,管理大模型配置、筛选标准,支持配置验证和持久化。

**执行步骤**:
1. 创建文件 `src/modules/config/ConfigManager.js`
2. 参考`task_plan.md`第2节中的接口定义
3. 实现配置管理功能
4. 实现配置验证功能
5. 定义配置接口

**验收标准**:
- [ ] 配置管理功能完整
- [ ] 支持配置验证
- [ ] 支持持久化
- [ ] 接口定义清晰

**输出物**:
- `src/modules/config/ConfigManager.js`
- `src/modules/config/index.js`

---

#### 任务22: Backend Agent A开发CandidateExtractor模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 3天  
**负责人**: Backend Agent A  
**依赖**: 任务3(选择器配置)

**任务描述**:
开发CandidateExtractor模块,从Moka页面提取候选人基本信息,支持分页和无限滚动两种页面类型。

**执行步骤**:
1. 创建文件 `src/modules/candidate/CandidateExtractor.js`
2. 使用选择器配置模块
3. 实现候选人提取功能
4. 实现数据验证功能
5. 定义候选人接口

**验收标准**:
- [ ] 候选人提取功能完整
- [ ] 支持分页和无限滚动
- [ ] 数据验证功能完整
- [ ] 接口定义清晰

**输出物**:
- `src/modules/candidate/CandidateExtractor.js`
- `src/modules/candidate/index.js`

---

#### 任务23: Backend Agent A开发PageNavigator模块 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 3天  
**负责人**: Backend Agent A  
**依赖**: 无

**任务描述**:
开发PageNavigator模块,处理分页和无限滚动,实现页面导航功能。

**执行步骤**:
1. 创建文件 `src/modules/navigation/PageNavigator.js`
2. 实现分页导航功能
3. 实现无限滚动功能
4. 定义导航接口

**验收标准**:
- [ ] 分页导航功能完整
- [ ] 无限滚动功能完整
- [ ] 接口定义清晰

**输出物**:
- `src/modules/navigation/PageNavigator.js`
- `src/modules/navigation/index.js`

---

#### 任务24: Backend Agent B开发InitialScreener模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 2天  
**负责人**: Backend Agent B  
**依赖**: 任务22(CandidateExtractor接口)

**任务描述**:
开发InitialScreener模块,使用大模型API进行候选人初筛,返回符合条件的候选人列表。

**执行步骤**:
1. 创建文件 `src/modules/screening/InitialScreener.js`
2. 依赖CandidateExtractor接口
3. 实现初筛分析功能
4. 定义初筛接口

**验收标准**:
- [ ] 初筛分析功能完整
- [ ] 接口定义清晰
- [ ] 测试通过

**输出物**:
- `src/modules/screening/InitialScreener.js`
- `src/modules/screening/index.js`

---

#### 任务25: Backend Agent B开发LLMClient模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 2天  
**负责人**: Backend Agent B  
**依赖**: 任务21(ConfigManager接口)

**任务描述**:
开发LLMClient模块,封装大模型API调用,实现重试和错误处理。

**执行步骤**:
1. 创建文件 `src/modules/api/LLMClient.js`
2. 依赖ConfigManager接口
3. 实现API调用功能
4. 实现重试机制
5. 实现错误处理

**验收标准**:
- [ ] API调用功能完整
- [ ] 重试机制完善
- [ ] 错误处理完善
- [ ] 接口定义清晰

**输出物**:
- `src/modules/api/LLMClient.js`
- `src/modules/api/index.js`

---

#### 任务26: Backend Agent A开发DetailedEvaluator模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 5天  
**负责人**: Backend Agent A  
**依赖**: 任务27(ResumeCapture接口)

**任务描述**:
开发DetailedEvaluator模块,进入详情页、获取简历、使用大模型评估,返回评估结果。

**执行步骤**:
1. 创建文件 `src/modules/screening/DetailedEvaluator.js`
2. 依赖ResumeCapture接口
3. 实现详细评估功能
4. 定义评估接口

**验收标准**:
- [ ] 详细评估功能完整
- [ ] 接口定义清晰
- [ ] 测试通过

**输出物**:
- `src/modules/screening/DetailedEvaluator.js`

---

#### 任务27: Backend Agent B开发ResumeCapture模块 ⭐⭐⭐⭐⭐

**优先级**: 高  
**预计耗时**: 5天  
**负责人**: Backend Agent B  
**依赖**: 任务3(选择器配置)

**任务描述**:
开发ResumeCapture模块,从详情页捕获简历图片,支持5种简历格式(img-blob/img-page/iframe/svg/html)。

**执行步骤**:
1. 创建文件 `src/modules/resume/ResumeCapture.js`
2. 使用选择器配置模块
3. 实现5种简历格式捕获
4. 定义简历捕获接口

**验收标准**:
- [ ] 支持5种简历格式
- [ ] 捕获功能完整
- [ ] 接口定义清晰
- [ ] 测试通过

**输出物**:
- `src/modules/resume/ResumeCapture.js`
- `src/modules/resume/index.js`

---

#### 任务28: Backend Agent A开发Recommender模块 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 4天  
**负责人**: Backend Agent A  
**依赖**: 任务26(DetailedEvaluator接口)

**任务描述**:
开发Recommender模块,将符合条件的候选人推荐给用人部门,模拟用户交互。

**执行步骤**:
1. 创建文件 `src/modules/recommendation/Recommender.js`
2. 依赖DetailedEvaluator接口
3. 实现推荐功能
4. 模拟用户交互
5. 定义推荐接口

**验收标准**:
- [ ] 推荐功能完整
- [ ] 用户交互模拟完善
- [ ] 接口定义清晰
- [ ] 测试通过

**输出物**:
- `src/modules/recommendation/Recommender.js`
- `src/modules/recommendation/index.js`

---

#### 任务29: Backend Agent B开发ResultExporter模块 ⭐⭐⭐⭐

**优先级**: 中  
**预计耗时**: 2天  
**负责人**: Backend Agent B  
**依赖**: 任务26(DetailedEvaluator接口)

**任务描述**:
开发ResultExporter模块,导出筛选结果为CSV格式,格式化输出。

**执行步骤**:
1. 创建文件 `src/modules/export/ResultExporter.js`
2. 依赖DetailedEvaluator接口
3. 实现CSV导出功能
4. 实现格式化输出
5. 定义导出接口

**验收标准**:
- [ ] CSV导出功能完整
- [ ] 格式化输出完善
- [ ] 接口定义清晰
- [ ] 测试通过

**输出物**:
- `src/modules/export/ResultExporter.js`
- `src/modules/export/index.js`

---

### 🔵 持续任务 (6个任务)

#### 任务30: Backend Agent A和B参加每日站会 ⭐⭐⭐⭐⭐

**优先级**: 高  
**频率**: 每日  
**时间**: 每天上午10:00  
**时长**: 10分钟

**任务描述**:
Backend Agent A和B参加每日站会,汇报进度、讨论阻碍、同步接口变更。

**会议内容**:
1. 昨天完成了什么
2. 今天计划做什么
3. 遇到什么阻碍
4. 是否影响其他Agent

**输出物**:
- 每日站会记录

---

#### 任务31: Git Controller Agent执行代码合并 ⭐⭐⭐⭐⭐

**优先级**: 高  
**频率**: 按需  
**负责人**: Git Controller Agent

**任务描述**:
Git Controller Agent执行代码合并,检查PR状态、解决冲突、合并到develop分支。

**执行步骤**:
1. 检查PR状态
2. 解决冲突(如有)
3. 合并到develop分支
4. 通知相关Agent

**输出物**:
- 合并记录

---

#### 任务32: Test Agent执行实际环境测试 ⭐⭐⭐⭐⭐

**优先级**: 高  
**频率**: 每完成一个模块  
**负责人**: Test Agent

**任务描述**:
Test Agent执行实际环境测试,使用真实数据测试各模块功能,记录测试结果。

**执行步骤**:
1. 准备测试环境
2. 执行测试用例
3. 记录测试结果
4. 编写测试报告

**输出物**:
- 测试报告

---

#### 任务33: 更新变更追踪表格 ⭐⭐⭐⭐

**优先级**: 中  
**频率**: 每周五  
**负责人**: Architect Agent

**任务描述**:
更新变更追踪表格,记录本周完成的变更、实施中的变更、下周计划。

**执行步骤**:
1. 收集本周变更信息
2. 更新变更追踪表格
3. 编写变更回顾会议记录

**输出物**:
- 更新后的 `docs/change_tracking.md`

---

#### 任务34: 检查测试覆盖率 ⭐⭐⭐⭐⭐

**优先级**: 高  
**频率**: 每周五  
**负责人**: Test Agent

**任务描述**:
检查测试覆盖率,确保单元测试覆盖率≥80%,集成测试通过。

**执行步骤**:
1. 运行测试覆盖率检查
2. 分析覆盖率报告
3. 补充缺失的测试用例

**输出物**:
- 测试覆盖率报告

---

#### 任务35: 更新项目文档 ⭐⭐⭐⭐

**优先级**: 中  
**频率**: 每周五  
**负责人**: 所有Agent

**任务描述**:
更新项目文档,同步代码变更到文档,确保文档与代码一致。

**执行步骤**:
1. 检查代码变更
2. 更新相关文档
3. 确保文档与代码一致

**输出物**:
- 更新后的项目文档

---

## 快速启动指南

### 🚀 立即开始(今天)

#### 步骤1: 验证开发环境

```bash
# 检查Node.js版本
node --version  # 应该 >= 16.x

# 检查npm版本
npm --version   # 应该 >= 8.x

# 检查Git版本
git --version

# 检查Chrome浏览器
# 确保已安装最新版本的Chrome浏览器
```

#### 步骤2: 克隆或创建项目

```bash
# 如果已有仓库,克隆项目
git clone [repository-url]
cd moka_chrome_extension_tool_2.0

# 如果没有仓库,初始化项目
mkdir moka-screening-extension
cd moka-screening-extension
git init
```

#### 步骤3: 阅读关键文档

**必读文档**(按顺序):
1. 本文档 `docs/project_startup_guide.md`
2. 主计划文档 `task_plan.md`
3. 优化方案文档 `docs/project_plan_adjustment.md`

#### 步骤4: 执行任务1 - GitHub MCP功能验证

**目标**: 验证GitHub MCP的可用性和操作权限

**验证内容**:
1. GitHub连接测试
2. 创建仓库测试
3. 文件操作测试
4. 分支操作测试
5. Pull Request操作测试

**详细步骤**: 参考`docs/project_plan_adjustment.md`第5节

**预期耗时**: 1天

#### 步骤5: 执行任务2 - 准备实际环境测试数据

**目标**: 收集真实候选人信息和简历文件

**数据要求**:
- 候选人基本信息 ≥ 10条
- 候选人详情页URL ≥ 10个
- 不同格式简历 ≥ 5份

**详细步骤**: 参考`docs/project_plan_adjustment.md`第6节

**预期耗时**: 2天

### 📅 本周计划(第1周)

完成第1周的9个任务:

**优先级排序**:
1. 任务3: 开发选择器配置模块 (高优先级,2天)
2. 任务7: 定义Git Controller Agent角色 (高优先级,1天)
3. 任务10: 设计并行开发协作机制 (高优先级,1天)
4. 任务4: 创建选择器监控工具 (高优先级,1天)
5. 任务9: 建立Git操作工作流程 (高优先级,1天)
6. 任务5: 更新模块使用选择器配置 (高优先级,1天)
7. 任务6: 完善简历格式文档 (中优先级,0.5天)
8. 任务8: 更新任务分配矩阵 (中优先级,0.5天)
9. 任务11: 制定并行开发时间表 (中优先级,0.5天)

**时间安排**:
- Day 1-2: 任务3(选择器配置模块)
- Day 3: 任务7(Git Controller角色) + 任务10(并行开发机制)
- Day 4: 任务4(选择器监控工具) + 任务9(Git工作流程)
- Day 5: 任务5(更新模块) + 任务6-8-11(文档任务)

### 📅 下周计划(第2周)

完成第2周的7个任务:

**优先级排序**:
1. 任务12: 设计实际环境测试方案 (高优先级,1天)
2. 任务14: 编写测试用例示例 (中优先级,1天)
3. 任务16: 定义变更文档标准 (中优先级,0.5天)
4. 任务17: 建立变更追踪机制 (中优先级,0.5天)
5. 任务13: 设计测试用例模板 (中优先级,0.5天)
6. 任务15: 准备测试数据模板 (中优先级,0.5天)
7. 任务18: 开发变更追踪工具 (低优先级,1天)

**时间安排**:
- Day 1: 任务12(测试方案)
- Day 2: 任务14(测试用例)
- Day 3: 任务16-17(变更管理)
- Day 4: 任务13-15(测试模板)
- Day 5: 任务18(变更追踪工具)

---

## 风险与注意事项

### ⚠️ 高风险项

#### 风险1: GitHub MCP功能验证失败

**风险描述**: GitHub MCP功能不可用或权限不足,影响后续版本控制操作

**影响程度**: 高  
**发生概率**: 中

**应对措施**:
1. 提前检查GitHub Token权限配置
2. 准备备用方案:手动Git操作
3. 联系GitHub管理员申请必要权限

**触发条件**: 任务1验证失败

**回滚方案**: 使用传统Git命令行工具替代MCP

---

#### 风险2: 测试数据准备不足

**风险描述**: 无法收集足够的真实候选人信息和简历文件,影响实际环境测试

**影响程度**: 高  
**发生概率**: 中

**应对措施**:
1. 提前联系用户提供测试数据
2. 准备模拟数据作为备用
3. 调整测试数据数量要求

**触发条件**: 任务2无法完成

**回滚方案**: 使用脱敏的模拟数据进行初步测试

---

#### 风险3: 选择器失效

**风险描述**: Moka页面结构变化,导致选择器失效,影响候选人提取和简历捕获

**影响程度**: 高  
**发生概率**: 高

**应对措施**:
1. 使用选择器监控工具定期检查
2. 为每个选择器准备备用选择器
3. 建立选择器变更快速响应机制

**触发条件**: 选择器监控工具检测到失效选择器

**回滚方案**: 使用备用选择器或手动更新选择器配置

---

### ⚠️ 中风险项

#### 风险4: 多Agent并行开发冲突

**风险描述**: Backend Agent A和B同时修改同一文件或接口,导致代码冲突

**影响程度**: 中  
**发生概率**: 中

**应对措施**:
1. 严格执行接口先行原则
2. 使用Git Controller Agent统一管理代码合并
3. 每日站会同步接口变更

**触发条件**: Git Controller Agent检测到代码冲突

**回滚方案**: 按照冲突解决流程处理

---

#### 风险5: 测试覆盖率不达标

**风险描述**: 单元测试覆盖率低于80%,影响代码质量

**影响程度**: 中  
**发生概率**: 中

**应对措施**:
1. 每周检查测试覆盖率
2. 补充缺失的测试用例
3. 将测试覆盖率纳入验收标准

**触发条件**: 任务34检查发现覆盖率不达标

**回滚方案**: 暂停新功能开发,优先补充测试用例

---

### ⚠️ 低风险项

#### 风险6: 文档与代码不一致

**风险描述**: 代码变更后未同步更新文档,导致文档过时

**影响程度**: 低  
**发生概率**: 高

**应对措施**:
1. 每周更新项目文档
2. 将文档更新纳入任务验收标准
3. 代码审查时检查文档同步

**触发条件**: 发现文档与代码不一致

**回滚方案**: 立即更新文档

---

### 📝 注意事项

#### 1. 测试原则

**核心原则**: 所有测试均在实际环境中执行,禁止使用任何模拟环境进行验证

**原因**:
- 模拟DOM环境与真实环境差异大
- 无法模拟Chrome Extension API
- 无法发现真实场景中的问题
- 测试结果可信度低

**违规处理**:
- 发现使用模拟环境测试,测试结果作废
- 要求重新在实际环境中测试
- 记录违规情况,纳入质量考核

---

#### 2. 接口定义原则

**原则**: 先定义接口,后实现功能

**原因**:
- 支持多Agent并行开发
- 减少接口变更导致的返工
- 提高代码可维护性

**接口定义流程**:
1. Architect Agent定义接口
2. 相关开发Agent确认接口可行性
3. Test Agent确认接口可测试
4. 接口文档发布
5. 开发Agent开始实现

---

#### 3. Git操作原则

**原则**: 所有Git操作由Git Controller Agent统一执行

**原因**:
- 避免代码冲突
- 规范版本控制流程
- 统一代码合并标准

**违规处理**:
- 发现其他Agent自行执行Git操作,要求回滚
- 由Git Controller Agent重新执行
- 记录违规情况,纳入质量考核

---

#### 4. 文档同步原则

**原则**: 代码变更必须同步更新文档

**原因**:
- 保持文档与代码一致
- 方便后续维护和交接
- 提高项目可维护性

**文档更新清单**:
- 接口定义文档
- 架构设计文档
- 测试文档
- 用户手册

---

## 📞 联系与支持

### 项目团队

| 角色 | 姓名 | 职责 | 联系方式 |
|------|------|------|---------|
| 项目经理 | [待填写] | 项目管理、进度跟踪 | [待填写] |
| 架构师 | [待填写] | 架构设计、技术决策 | [待填写] |
| Backend Agent A | [待填写] | 模块开发 | [待填写] |
| Backend Agent B | [待填写] | 模块开发 | [待填写] |
| Frontend Agent | [待填写] | UI开发 | [待填写] |
| Test Agent | [待填写] | 测试执行 | [待填写] |
| Git Controller Agent | [待填写] | 版本控制 | [待填写] |
| DevOps Agent | [待填写] | 构建配置 | [待填写] |

### 文档反馈

如发现文档问题或有改进建议,请:
1. 在项目仓库创建Issue
2. 标签: `documentation`
3. 描述问题和建议

---

## 📚 附录

### A. 术语表

| 术语 | 说明 |
|------|------|
| MVP | Minimum Viable Product,最小可行产品 |
| Agent | 智能代理,负责特定任务的开发角色 |
| MCP | Model Context Protocol,模型上下文协议 |
| DOM | Document Object Model,文档对象模型 |
| API | Application Programming Interface,应用程序编程接口 |
| PR | Pull Request,拉取请求 |
| CI/CD | Continuous Integration/Continuous Deployment,持续集成/持续部署 |

### B. 参考资源

**Chrome Extension开发**:
- [Chrome Extension官方文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)

**JavaScript最佳实践**:
- [Airbnb JavaScript风格指南](https://github.com/airbnb/javascript)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

**Git工作流程**:
- [Git Flow工作流程](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [GitHub Flow工作流程](https://docs.github.com/en/get-started/quickstart/github-flow)

---

**文档结束**

> 💡 **提示**: 本文档是新工作空间启动的核心指南,请务必仔细阅读并按照任务清单执行。如有任何疑问,请参考详细文档或联系项目团队。

> 🎯 **目标**: 通过执行本任务清单,完成浏览器扩展的模块化重构,提升代码可维护性、开发效率和用户体验。
