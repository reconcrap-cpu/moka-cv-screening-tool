# 🤖 自动化测试系统使用指南

## 📋 功能概述

这个自动化测试系统可以：
- ✅ 自动运行大规模筛选测试（如500位人选）
- ✅ 实时监控筛选过程
- ✅ 自动检测错误并暂停
- ✅ 智能分析错误原因
- ✅ 自动尝试修复问题
- ✅ 生成详细的测试报告

---

## 🚀 快速开始

### 1. 加载测试系统

在浏览器控制台（F12）中执行：

```javascript
// 方法1: 直接加载脚本文件
const script = document.createElement('script');
script.src = chrome.runtime.getURL('auto-test.js');
document.head.appendChild(script);

// 方法2: 如果已经在content script中，直接使用
// autoTest对象会自动创建
```

### 2. 启动测试

```javascript
// 开始测试500位人选
autoTest.start(500);

// 开始测试100位人选（快速测试）
autoTest.start(100);
```

### 3. 控制测试

```javascript
// 暂停测试
autoTest.pause();

// 恢复测试
autoTest.resume();

// 停止测试
autoTest.stop();

// 获取当前状态
autoTest.getStatus();

// 生成测试报告
autoTest.generateReport();
```

---

## ⚙️ 配置选项

### 基本配置

```javascript
// 错误时是否暂停（默认: true）
autoTest.testConfig.pauseOnError = true;

// 是否自动修复（默认: true）
autoTest.testConfig.autoFix = true;

// 日志级别（默认: 'verbose'）
autoTest.testConfig.logLevel = 'verbose';  // 或 'normal'

// 目标数量
autoTest.testConfig.targetCount = 500;
```

### 高级配置

```javascript
// 最大重试次数
autoTest.testConfig.maxRetries = 3;
```

---

## 📊 监控指标

测试系统会自动监控以下指标：

### 1. 进度监控
- 已处理人选数量
- 处理速度（人/分钟）
- 预计剩余时间
- 完成百分比

### 2. 错误监控
- 错误总数
- 错误类别分布
- 错误发生时间
- 修复成功率

### 3. 性能监控
- 简历提取耗时
- API调用耗时
- 页面导航耗时

---

## 🔍 错误检测与修复

### 自动检测的错误类型

#### 1. 简历提取错误
```
- 无法获取简历图片
- 未能找到任何有效的简历图片
- 简历图片提取失败
```

**自动修复流程：**
1. 诊断当前页面简历元素
2. 检查图片URL有效性
3. 扫描新的简历元素选择器
4. 建议代码修复方案
5. 尝试重新加载页面

#### 2. 页面导航错误
```
- 无法进入详情页
- 页面加载超时
- 元素未找到
```

**自动修复流程：**
1. 检查候选人元素是否存在
2. 验证点击事件绑定
3. 检查页面跳转逻辑

#### 3. API错误
```
- API请求失败
- 模型调用失败
- 解析结果失败
```

**自动修复流程：**
1. 检查API密钥有效性
2. 检查网络连接
3. 检查API配额
4. 验证请求参数格式

---

## 📈 测试报告示例

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

错误 1:
  时间: 2025-01-15T10:23:45.123Z
  类别: resumeExtraction
  消息: 无法获取简历图片
  进度: 123/500
  已修复: 是
  候选人: 张三

错误 2:
  时间: 2025-01-15T10:45:12.456Z
  类别: apiError
  消息: API请求失败
  进度: 256/500
  已修复: 是
  候选人: 李四

错误 3:
  时间: 2025-01-15T11:02:33.789Z
  类别: pageNavigation
  消息: 无法进入详情页
  进度: 389/500
  已修复: 是
  候选人: 王五
============================================================
```

---

## 🛠️ 实时监控示例

测试过程中会输出实时监控信息：

```
📊 进度报告 [15m 32s]
   已处理: 123/500 (24.6%)
   速度: 7.9 人/分钟
   预计剩余时间: 47.6 分钟
   错误次数: 1
   已修复: 1

👤 [监控] 开始处理候选人: 张三
✅ [监控] 简历提取成功: 3 张图片，耗时 1234ms
✅ [监控] 候选人处理完成: 张三 (进度: 124/500)
   ✓ 符合条件 - 清华大学
```

---

## 🚨 错误处理流程

当检测到错误时，系统会：

### 1. 立即暂停测试
```
============================================================
🚨 检测到错误！
类别: resumeExtraction
消息: 无法获取简历图片
进度: 123/500
错误次数: 1
============================================================
⏸️  测试已暂停，等待分析和修复...
```

### 2. 开始分析
```
🔧 开始分析和修复...
错误ID: 1705315425123
错误类别: resumeExtraction

📋 分析简历提取问题...
诊断结果: {
  hasImgPage: true,
  imgPageCount: 3,
  imgPageUrls: [...],
  hasIframe: false,
  hasImgBlob: false,
  allImages: 3
}

✅ 发现 .img-page 元素，检查URL有效性...
检查图片 1: https://moka-co-oss.mokahr.com/.../pdf_1.jpg...
✅ 图片 1 URL有效
```

### 3. 尝试修复
```
🔄 重新加载页面...
✅ 页面已重新加载
✅ 修复尝试完成
▶️ 测试已恢复
```

---

## 💡 使用技巧

### 1. 快速验证修复
```javascript
// 先测试少量人选验证修复效果
autoTest.start(10);

// 如果成功，再进行大规模测试
autoTest.start(500);
```

### 2. 调试模式
```javascript
// 开启详细日志
autoTest.testConfig.logLevel = 'verbose';

// 关闭自动修复，手动分析
autoTest.testConfig.autoFix = false;
autoTest.testConfig.pauseOnError = true;
```

### 3. 性能优化
```javascript
// 关闭详细日志提升性能
autoTest.testConfig.logLevel = 'normal';

// 关闭暂停和自动修复，让测试连续运行
autoTest.testConfig.pauseOnError = false;
autoTest.testConfig.autoFix = false;
```

### 4. 错误分析
```javascript
// 查看所有错误
console.log(autoTest.testState.errors);

// 按类别统计错误
const errorsByCategory = {};
autoTest.testState.errors.forEach(error => {
  errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
});
console.log(errorsByCategory);
```

---

## 🔧 集成到现有代码

### 方法1: 在manifest.json中添加

```json
{
  "content_scripts": [
    {
      "matches": ["https://app.mokahr.com/*"],
      "js": [
        "config.js",
        "html2canvas.min.js",
        "content.js",
        "auto-test.js"
      ],
      "run_at": "document_end"
    }
  ]
}
```

### 方法2: 在content.js中动态加载

```javascript
// 在content.js开头添加
if (typeof window.autoTest === 'undefined') {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('auto-test.js');
  script.onload = function() {
    console.log('✅ 自动测试系统已加载');
  };
  document.head.appendChild(script);
}
```

---

## 📝 注意事项

### 1. 性能影响
- 监控钩子会增加少量性能开销
- 建议在生产环境关闭详细日志

### 2. 数据保存
- 测试状态保存在内存中
- 页面刷新会丢失测试进度
- 建议定期生成报告保存结果

### 3. 错误修复
- 自动修复基于常见错误模式
- 复杂问题可能需要手动干预
- 修复后会自动恢复测试

### 4. API限制
- 注意API调用频率限制
- 大规模测试可能触发限流
- 建议在非高峰时段运行

---

## 🎯 最佳实践

### 1. 分阶段测试
```javascript
// 阶段1: 小规模验证
autoTest.start(10);
// 等待完成，检查结果

// 阶段2: 中规模测试
autoTest.start(50);
// 等待完成，检查结果

// 阶段3: 大规模测试
autoTest.start(500);
```

### 2. 错误监控
```javascript
// 定期检查错误
setInterval(() => {
  const status = autoTest.getStatus();
  if (status.errorCount > 10) {
    console.warn('错误次数过多，建议停止检查');
    autoTest.stop();
  }
}, 60000);
```

### 3. 结果导出
```javascript
// 测试完成后导出报告
const report = autoTest.generateReport();
const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `test-report-${Date.now()}.json`;
a.click();
```

---

## 🐛 故障排查

### 问题1: 脚本未加载
```javascript
// 检查autoTest对象是否存在
console.log(typeof autoTest);  // 应该输出 'object'

// 如果未定义，手动加载
const script = document.createElement('script');
script.src = chrome.runtime.getURL('auto-test.js');
document.head.appendChild(script);
```

### 问题2: 钩子未注入
```javascript
// 检查钩子是否注入
console.log(typeof window.addLog);  // 应该输出 'function'
console.log(typeof window.captureResume);  // 应该输出 'function'

// 如果未注入，手动调用
autoTest.injectMonitoringHooks();
```

### 问题3: 测试不暂停
```javascript
// 检查配置
console.log(autoTest.testConfig.pauseOnError);  // 应该为 true

// 手动暂停
autoTest.pause();
```

---

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台日志
2. 测试状态报告
3. 错误详情列表

---

## 🎉 开始使用

现在你可以开始自动化测试了！

```javascript
// 1. 加载测试系统
// (已在content script中自动加载)

// 2. 开始测试
autoTest.start(500);

// 3. 监控进度
autoTest.getStatus();

// 4. 查看报告
autoTest.generateReport();
```

祝测试顺利！🚀
