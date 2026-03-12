# 下一阶段开发计划

## 目标
完成Extension集成和GUI界面开发，使Chrome扩展可以正常加载使用

## 当前状态
- ✅ Phase 0: 前置验证完成
- ✅ Phase 1: 核心模块开发完成
- ✅ Phase 2: 真实环境测试通过

## Phase 3: 模块优化与集成

### 任务列表

#### 3.1 修复发现的问题
- [ ] 更新 `CandidateListModule.navigateToCandidate()` - 移除对 `.top-I0hDlGQcuR` 的依赖
- [ ] 测试修复后的导航功能

#### 3.2 创建Extension入口文件
- [ ] 创建 `content.js` - 主入口脚本
- [ ] 创建 `background.js` - Service Worker
- [ ] 创建 `popup.html` 和 `popup.js` - 弹出界面

#### 3.3 创建GUI组件
- [ ] 创建控制面板UI
- [ ] 实现候选人列表显示
- [ ] 实现操作按钮（提取、导出等）

#### 3.4 集成测试
- [ ] 在Chrome中加载扩展
- [ ] 测试完整工作流程
- [ ] 修复集成问题

## 优先级
1. 高：修复导航函数
2. 高：创建Extension入口文件
3. 中：创建GUI组件
4. 中：集成测试

## 风险
- Moka页面DOM结构可能变化
- Chrome扩展权限问题
- 跨域请求限制
