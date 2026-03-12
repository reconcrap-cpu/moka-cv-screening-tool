# 任务分配矩阵

## 1. Agent角色与职责

| Agent角色 | 主要职责 | 技能领域 |
|-----------|----------|----------|
| PMO-webcrawler | 项目管理、进度跟踪、跨Agent协调 | 项目规划、风险管理、验收交付 |
| PM-webcrawler | 产品需求定义、功能设计、PRD编写 | 需求分析、交互设计、验收标准 |
| architect-webcrawler | 技术架构设计、模块划分、接口定义 | 架构设计、性能优化、技术选型 |
| antiscraping-webcrawler | 反爬虫策略、请求伪装、验证处理 | 反检测、指纹隐藏、风控规避 |
| developer-webcrawler | 代码开发、功能实现、Bug修复 | 编码实现、单元测试、代码优化 |
| codereview-webcrawler | 代码审查、合规检查、安全审计 | 代码质量、安全漏洞、最佳实践 |
| test-webcrawler | 功能测试、回归测试、问题复现 | 自动化测试、性能测试、兼容性测试 |
| deployment-webcrawler | 打包发布、文档编写、交付准备 | 构建打包、版本管理、用户文档 |
| gitcontroller | Git操作、版本控制、分支管理 | 代码提交、PR管理、冲突解决 |

## 2. 第0周任务分配（前置验证阶段）

| 任务编号 | 任务名称 | 负责Agent | 协作Agent | 状态 |
|----------|----------|-----------|-----------|------|
| 任务1 | GitHub MCP功能验证 | gitcontroller | PMO-webcrawler | ✅ 已完成 |
| 任务2 | 准备实际环境测试数据 | PM-webcrawler | test-webcrawler | ✅ 已完成 |
| 任务3 | 开发选择器配置模块 | developer-webcrawler | architect-webcrawler | ✅ 已完成 |
| 任务4 | 创建选择器监控工具 | developer-webcrawler | test-webcrawler | ✅ 已完成 |
| 任务5 | 更新模块使用选择器配置 | developer-webcrawler | - | ✅ 已完成 |
| 任务6 | 完善简历格式文档 | architect-webcrawler | PM-webcrawler | ✅ 已完成 |
| 任务7 | 定义Git Controller Agent角色 | PMO-webcrawler | gitcontroller | ✅ 已完成 |
| 任务8 | 更新任务分配矩阵 | PMO-webcrawler | - | ✅ 已完成 |
| 任务9 | 建立Git操作工作流程 | gitcontroller | PMO-webcrawler | ✅ 已完成 |
| 任务10 | 设计并行开发协作机制 | PMO-webcrawler | architect-webcrawler | ✅ 已完成 |
| 任务11 | 制定并行开发时间表 | PMO-webcrawler | 所有Agent | 待执行 |

## 3. 第1周任务分配（核心开发阶段）

| 任务编号 | 任务名称 | 负责Agent | 协作Agent | 优先级 |
|----------|----------|-----------|-----------|--------|
| 任务12 | 开发DOMUtils工具模块 | developer-webcrawler | architect-webcrawler | P0 |
| 任务13 | 开发Logger工具模块 | developer-webcrawler | - | P1 |
| 任务14 | 开发StorageUtils工具模块 | developer-webcrawler | - | P1 |
| 任务15 | 开发候选人列表模块 | developer-webcrawler | antiscraping-webcrawler | P0 |
| 任务16 | 开发简历详情模块 | developer-webcrawler | antiscraping-webcrawler | P0 |
| 任务17 | 开发简历图片模块 | developer-webcrawler | - | P0 |
| 任务18 | 开发推荐功能模块 | developer-webcrawler | antiscraping-webcrawler | P1 |
| 任务19 | 单元测试编写 | test-webcrawler | developer-webcrawler | P0 |
| 任务20 | 代码审查 | codereview-webcrawler | - | P0 |

## 4. 第2周任务分配（集成测试阶段）

| 任务编号 | 任务名称 | 负责Agent | 协作Agent | 优先级 |
|----------|----------|-----------|-----------|--------|
| 任务21 | content.js集成重构 | developer-webcrawler | architect-webcrawler | P0 |
| 任务22 | background.js优化 | developer-webcrawler | - | P1 |
| 任务23 | 反爬虫策略集成 | antiscraping-webcrawler | developer-webcrawler | P0 |
| 任务24 | 集成测试 | test-webcrawler | - | P0 |
| 任务25 | 真实环境测试 | test-webcrawler | PM-webcrawler | P0 |
| 任务26 | 性能优化 | architect-webcrawler | developer-webcrawler | P1 |
| 任务27 | Bug修复 | developer-webcrawler | test-webcrawler | P0 |

## 5. 第3周任务分配（发布准备阶段）

| 任务编号 | 任务名称 | 负责Agent | 协作Agent | 优先级 |
|----------|----------|-----------|-----------|--------|
| 任务28 | 最终代码审查 | codereview-webcrawler | - | P0 |
| 任务29 | 回归测试 | test-webcrawler | - | P0 |
| 任务30 | 用户文档编写 | deployment-webcrawler | PM-webcrawler | P1 |
| 任务31 | 安装指南编写 | deployment-webcrawler | - | P1 |
| 任务32 | 版本发布打包 | deployment-webcrawler | - | P0 |
| 任务33 | Chrome Web Store准备 | deployment-webcrawler | PMO-webcrawler | P1 |
| 任务34 | 项目验收 | PMO-webcrawler | 所有Agent | P0 |
| 任务35 | 项目交付 | PMO-webcrawler | - | P0 |

## 6. Agent协作规则

### 6.1 任务交接

```
上游Agent完成任务 → 通知PMO → PMO分配给下游Agent → 下游Agent确认接收
```

### 6.2 阻塞处理

1. Agent遇到阻塞 → 立即通知PMO
2. PMO评估影响 → 协调资源或调整计划
3. 解决方案确定 → 通知相关Agent执行

### 6.3 代码提交流程

```
developer完成开发 → codereview审查 → 审查通过 → gitcontroller提交
                                    → 审查不通过 → 返回developer修改
```

### 6.4 测试反馈流程

```
test发现问题 → 创建Issue → developer修复 → test验证 → 关闭Issue
```

## 7. 优先级定义

| 优先级 | 定义 | 响应时间 |
|--------|------|----------|
| P0 | 阻塞项目进度，必须立即处理 | 2小时内 |
| P1 | 重要但不阻塞，当天处理 | 8小时内 |
| P2 | 一般任务，本周内处理 | 24小时内 |
| P3 | 低优先级，可延后处理 | 3天内 |

## 8. 状态定义

| 状态 | 定义 |
|------|------|
| 待执行 | 任务已分配，等待开始 |
| 进行中 | 任务正在执行 |
| 已完成 | 任务已完成并通过验证 |
| 阻塞中 | 任务因外部原因暂停 |
| 需协调 | 任务需要其他Agent配合 |

## 9. 里程碑节点

| 里程碑 | 目标日期 | 关键交付物 | 负责Agent |
|--------|----------|------------|-----------|
| M1: 前置验证完成 | 第0周末 | 选择器配置、监控工具、协作机制 | PMO-webcrawler |
| M2: 核心开发完成 | 第1周末 | 所有模块代码、单元测试 | developer-webcrawler |
| M3: 集成测试通过 | 第2周末 | 集成测试报告、性能报告 | test-webcrawler |
| M4: 发布就绪 | 第3周末 | 发布包、用户文档 | deployment-webcrawler |
| M5: 项目交付 | 第3周末 | 完整交付物、验收报告 | PMO-webcrawler |

## 10. 风险与应对

| 风险 | 可能性 | 影响 | 应对措施 | 负责Agent |
|------|--------|------|----------|-----------|
| 选择器失效 | 高 | 高 | 监控工具预警、快速修复 | developer-webcrawler |
| 反爬虫升级 | 中 | 高 | 策略库更新、备用方案 | antiscraping-webcrawler |
| 进度延期 | 中 | 中 | 每日跟踪、资源调整 | PMO-webcrawler |
| 测试覆盖不足 | 中 | 中 | 强制测试用例、代码审查 | test-webcrawler |
| 文档不完整 | 低 | 低 | 文档模板、审查流程 | deployment-webcrawler |

## 11. 更新记录

| 日期 | 更新内容 | 更新人 |
|------|----------|--------|
| 2026-02-24 | 初始版本创建 | PMO-webcrawler |
| 2026-02-24 | 完成第0周任务状态更新 | PMO-webcrawler |
