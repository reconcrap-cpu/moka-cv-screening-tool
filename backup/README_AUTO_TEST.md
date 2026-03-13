# 🤖 Moka简历筛选自动化测试系统

## 📖 系统概述

这是一个完整的自动化测试解决方案，用于测试和验证Moka简历筛选Chrome扩展的稳定性。系统能够：

- ✅ 自动运行大规模筛选测试（500+人选）
- ✅ 实时监控筛选过程和性能
- ✅ 自动检测错误并智能暂停
- ✅ 分析错误原因并提供修复建议
- ✅ 自动尝试修复常见问题
- ✅ 生成详细的测试报告

---

## 🚀 快速开始

### 1. 安装扩展

1. 打开Chrome浏览器
2. 进入扩展管理页面：`chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

### 2. 启动测试

#### 方法A: 使用快捷命令（推荐）

1. 打开Moka候选人列表页面
2. 按F12打开开发者工具
3. 在控制台中运行：

```javascript
// 快速测试10人
quickTest.start10()

// 标准测试100人
quickTest.start100()

// 完整测试500人
quickTest.start500()

// 自定义测试数量
quickTest.custom(50)
```

#### 方法B: 使用完整命令

```javascript
// 开始测试
autoTest.start(500)

// 查看状态
autoTest.getStatus()

// 生成报告
autoTest.generateReport()
```

---

## 📊 监控界面

测试过程中会实时显示监控信息：

```
📊 进度报告 [15m 32s]
   已处理: 123/500 (24.6%)
   速度: 7.9 人/分钟
   预计剩余时间: 47.6 分钟
   错误次数: 1
   已修复: 1

👤 [监控] 开始处理候选人: 张三
📸 [监控] 开始提取简历图片...
✅ [监控] 简历提取成功: 3 张图片，耗时 1234ms
✅ [监控] 候选人处理完成: 张三 (进度: 124/500)
   ✓ 符合条件 - 清华大学
```

---

## 🚨 错误自动处理

### 错误检测

系统会自动检测以下类型的错误：

#### 1. 简历提取错误
- 无法获取简历图片
- 未能找到有效的简历图片
- 图片URL无效或过期

#### 2. 页面导航错误
- 无法进入详情页
- 页面加载超时
- DOM元素未找到

#### 3. API调用错误
- API请求失败
- 模型调用失败
- 结果解析失败

### 自动修复流程

当检测到错误时：

```
============================================================
🚨 检测到错误！
类别: resumeExtraction
消息: 无法获取简历图片
进度: 123/500
错误次数: 1
============================================================
⏸️  测试已暂停，等待分析和修复...

🔧 开始分析和修复...
📋 分析简历提取问题...
诊断结果: {...}
✅ 修复尝试完成
▶️ 测试已恢复
```

---

## 📈 测试报告

测试完成后会生成详细报告：

```
============================================================
📊 测试报告
============================================================
总耗时: 45 分 32 秒
目标数量: 500
已处理: 487
错误次数: 3
已修复: 3
成功率: 97.4%

错误详情:
  错误 1: 简历提取失败 (已修复)
  错误 2: API调用失败 (已修复)
  错误 3: 页面导航失败 (已修复)
============================================================
```

### 导出报告

```javascript
// 导出JSON格式报告
quickTest.exportReport()
```

---

## ⚙️ 配置选项

### 基本配置

```javascript
// 错误时是否暂停（默认: true）
autoTest.testConfig.pauseOnError = true

// 是否自动修复（默认: true）
autoTest.testConfig.autoFix = true

// 日志级别（默认: 'verbose'）
autoTest.testConfig.logLevel = 'verbose'  // 或 'normal'

// 目标数量
autoTest.testConfig.targetCount = 500
```

### 快捷配置命令

```javascript
// 日志配置
quickTest.config.verbose()     // 开启详细日志
quickTest.config.normal()      // 切换普通日志

// 自动修复配置
quickTest.config.autoFixOn()   // 开启自动修复
quickTest.config.autoFixOff()  // 关闭自动修复

// 错误暂停配置
quickTest.config.pauseOnErrorOn()   // 开启错误暂停
quickTest.config.pauseOnErrorOff()  // 关闭错误暂停
```

---

## 💡 使用场景

### 场景1: 开发调试

```javascript
// 1. 开启详细日志
quickTest.config.verbose()

// 2. 小规模测试
quickTest.start10()

// 3. 查看详细输出
// 4. 发现问题后手动修复
// 5. 重新测试
```

### 场景2: 功能验证

```javascript
// 1. 中等规模测试
quickTest.start100()

// 2. 开启自动修复
quickTest.config.autoFixOn()

// 3. 观察自动修复效果
// 4. 查看测试报告
quickTest.report()
```

### 场景3: 生产环境测试

```javascript
// 1. 大规模测试
quickTest.start500()

// 2. 关闭详细日志提升性能
quickTest.config.normal()

// 3. 开启错误暂停和自动修复
quickTest.config.pauseOnErrorOn()
quickTest.config.autoFixOn()

// 4. 定期检查状态
setInterval(() => {
  quickTest.status()
}, 60000)

// 5. 完成后导出报告
quickTest.exportReport()
```

---

## 🔧 高级功能

### 1. 页面诊断

```javascript
// 诊断当前页面的简历元素
quickTest.diagnose()
```

输出示例：
```json
{
  "hasImgPage": true,
  "imgPageCount": 3,
  "imgPageUrls": ["https://..."],
  "hasIframe": false,
  "hasImgBlob": false,
  "allImages": 3
}
```

### 2. 错误分析

```javascript
// 查看所有错误
console.log(autoTest.testState.errors)

// 按类别统计
const errorsByCategory = {}
autoTest.testState.errors.forEach(error => {
  errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1
})
console.log(errorsByCategory)
```

### 3. 性能分析

```javascript
// 查看处理速度
const status = autoTest.getStatus()
const elapsed = (Date.now() - autoTest.testState.startTime) / 60000
const speed = status.processedCount / elapsed
console.log(`处理速度: ${speed.toFixed(1)} 人/分钟`)
```

---

## 📁 文件结构

```
chrome extension tool 2.0/
├── manifest.json          # 扩展配置
├── content.js            # 主要筛选逻辑
├── auto-test.js          # 自动化测试系统
├── quick-start.js        # 快速启动脚本
├── AUTO_TEST_GUIDE.md    # 详细使用指南
├── README_AUTO_TEST.md   # 本文件
├── background.js         # 后台服务
├── sidebar.js            # 侧边栏UI
├── config.js             # 配置文件
└── html2canvas.min.js    # 截图库
```

---

## 🐛 故障排查

### 问题1: autoTest未定义

**解决方案：**
```javascript
// 检查是否加载
console.log(typeof autoTest)

// 如果未定义，刷新页面
location.reload()
```

### 问题2: 钩子未注入

**解决方案：**
```javascript
// 手动注入钩子
autoTest.injectMonitoringHooks()
```

### 问题3: 测试不启动

**解决方案：**
```javascript
// 检查状态
autoTest.getStatus()

// 如果已在运行，先停止
autoTest.stop()

// 重新启动
autoTest.start(500)
```

---

## 📊 性能优化建议

### 1. 提升处理速度
```javascript
// 关闭详细日志
quickTest.config.normal()

// 关闭错误暂停（连续运行）
quickTest.config.pauseOnErrorOff()
```

### 2. 减少内存占用
```javascript
// 定期清理日志
autoTest.testState.logs = []

// 导出并清理结果
quickTest.exportReport()
autoTest.testState.results = []
```

### 3. 避免API限流
```javascript
// 分批测试
quickTest.start(100)
// 等待完成后
quickTest.start(100)
```

---

## 🎯 最佳实践

### 1. 测试流程
```
1. 小规模验证 (10人)
   ↓
2. 中等规模测试 (100人)
   ↓
3. 大规模测试 (500人)
   ↓
4. 分析报告并优化
```

### 2. 错误处理
```
1. 开启错误暂停
2. 开启自动修复
3. 观察修复效果
4. 必要时手动干预
5. 记录修复方案
```

### 3. 性能监控
```
1. 定期检查处理速度
2. 监控错误率
3. 分析瓶颈
4. 优化配置
```

---

## 📞 技术支持

### 日志位置
- 浏览器控制台：F12 → Console
- 扩展后台页：chrome://extensions/ → 查看视图

### 常见问题
1. 查看详细指南：`AUTO_TEST_GUIDE.md`
2. 检查配置：`autoTest.testConfig`
3. 查看状态：`quickTest.status()`

---

## 🎉 开始使用

现在你已经了解了所有功能，开始你的自动化测试吧！

```javascript
// 一键启动
quickTest.start500()

// 或者分步操作
quickTest.start10()    // 先测试10人
quickTest.status()     // 查看状态
quickTest.report()     // 生成报告
```

祝测试顺利！🚀

---

## 📝 更新日志

### v1.0.0 (2025-01-15)
- ✅ 初始版本发布
- ✅ 支持自动化测试
- ✅ 支持错误检测和修复
- ✅ 支持测试报告生成
- ✅ 支持快捷命令

---

## 📄 许可证

本项目仅供内部使用，请勿外传。
