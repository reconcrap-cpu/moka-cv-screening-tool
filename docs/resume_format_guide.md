# Moka平台简历格式处理文档

## 1. 简历格式概述

Moka招聘系统支持多种简历格式，本扩展需要能够识别和处理所有格式以提取完整的简历信息。

## 2. 支持的简历格式

### 2.1 图片格式简历

#### 2.1.1 Blob URL 图片 (`.img-blob`)

**特征**:
- 使用 `blob:` 协议的临时URL
- 通常用于动态生成的图片
- 需要转换为 base64 格式才能发送给API

**处理流程**:
```
1. 检测 .img-blob 元素
2. 获取 blob: URL
3. 使用 XMLHttpRequest 获取 blob 数据
4. 使用 FileReader 转换为 data URL
5. 修复 MIME 类型（如需要）
6. 发送给API进行识别
```

**代码示例**:
```javascript
const imgBlobElements = document.querySelectorAll('.img-blob');
for (const img of imgBlobElements) {
  if (img.src && img.src.startsWith('blob:')) {
    const dataUrl = await blobToDataURL(img.src);
    // dataUrl 现在是 base64 格式
  }
}
```

**注意事项**:
- Blob URL 可能返回错误的 MIME 类型（如 `text/plain`）
- 需要根据文件头检测实际图片类型
- 支持的图片类型：JPEG、PNG、GIF、WebP

#### 2.1.2 普通图片 (`.img-page`)

**特征**:
- 使用标准 data URL 或 http/https URL
- 通常用于 PDF 转换后的图片
- 可直接使用

**处理流程**:
```
1. 检测 .img-page 或 img[src*="pdf_"] 元素
2. 验证 URL 格式
3. 直接使用或转换 blob URL
```

### 2.2 iframe 嵌入式简历

#### 2.2.1 SVG 格式简历

**特征**:
- 嵌入在 `#iframeResume` 中
- Word 文档转换后的 SVG 格式
- 需要转换为 PNG 格式

**处理流程**:
```
1. 获取 iframe 文档
2. 查找 .word-page svg 元素
3. 序列化 SVG
4. 创建 canvas 绘制
5. 导出为 PNG base64
```

**代码示例**:
```javascript
const iframeResume = document.getElementById('iframeResume');
const iframeDoc = iframeResume.contentDocument || iframeResume.contentWindow.document;
const svgElement = iframeDoc.querySelector('.word-page svg');
const pngBase64 = await svgToPngBase64(svgElement);
```

**注意事项**:
- SVG 尺寸可能很大，需要限制 canvas 大小
- 需要填充白色背景
- 超时处理（30秒）

#### 2.2.2 HTML 结构化简历

**特征**:
- 嵌入在 iframe 中
- 结构化的 HTML 内容
- 需要使用 html2canvas 截图

**处理流程**:
```
1. 获取 iframe 文档
2. 查找结构化内容元素
3. 使用 html2canvas 截图
4. 导出为 PNG
```

**支持的选择器**:
- `.flexAlignStart--o1K7u`
- `.content--j99Ec`
- `.cardLeft--IcRB1`
- `#water-mark-wrap`
- `.cardLeft--ZsR4w`
- `.board--CYPTx`

### 2.3 纯 HTML 简历

**特征**:
- 包含工作经历、教育经历等文本
- 可能是猎聘邮件模板或 Moka 人才库详情页

**处理流程**:
```
1. 检测简历内容关键词
2. 使用 html2canvas 截图
3. 备用方案：canvas 绘制文本
```

**检测关键词**:
- 工作经历
- 教育经历
- 基本信息
- 求职意向

## 3. 格式检测优先级

```
1. .img-blob (Blob URL 图片)
   ↓ 未找到
2. .img-page (普通图片)
   ↓ 未找到
3. #iframeResume (iframe 简历)
   ├── .word-page svg (SVG 格式)
   ├── 结构化 HTML
   └── 纯 HTML
   ↓ 未找到
4. 页面所有图片 (兜底方案)
```

## 4. 图片格式修复

### 4.1 MIME 类型修复

当 blob 返回错误的 MIME 类型时，根据文件头检测实际类型：

| 文件头 (Base64) | 实际类型 |
|-----------------|----------|
| `/9j/` | JPEG |
| `iVBORw0KGgo` | PNG |
| `R0lGOD` | GIF |
| `UklGR` | WebP |

### 4.2 修复代码

```javascript
function fixMimeType(result, blob) {
  const base64Content = result.split(',')[1];
  
  if (!blob.type || !blob.type.startsWith('image/')) {
    if (base64Content.startsWith('/9j/')) {
      return result.replace('data:text/plain;base64,', 'data:image/jpeg;base64,');
    }
    if (base64Content.startsWith('iVBORw0KGgo')) {
      return result.replace('data:text/plain;base64,', 'data:image/png;base64,');
    }
    // ... 其他类型
  }
  
  return result;
}
```

## 5. API 支持的图片格式

LLM API 支持以下图片格式：

| 格式 | 支持情况 | 说明 |
|------|----------|------|
| base64 (data:image) | ✅ 完全支持 | 推荐格式 |
| http/https URL | ✅ 支持 | 需要公网可访问 |
| blob URL | ❌ 不支持 | 需要转换 |
| SVG base64 | ⚠️ 部分支持 | 建议转换为 PNG |

## 6. 错误处理

### 6.1 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| blob 转换失败 | 跨域或网络问题 | 重试或使用备用方案 |
| SVG 转换超时 | SVG 过大 | 限制尺寸，设置超时 |
| html2canvas 失败 | 库未加载 | 检查加载顺序 |
| MIME 类型错误 | blob.type 不正确 | 根据文件头修复 |

### 6.2 日志记录

所有简历处理步骤都会记录详细日志：

```javascript
addLog('开始获取简历图片...', 'info');
addLog(`找到 ${imgBlobElements.length} 个 .img-blob 元素`, 'info');
addLog(`第 ${i + 1} 张图片转换成功`, 'success');
addLog(`第 ${i + 1} 张图片转换失败: ${e.message}`, 'error');
```

## 7. 性能优化

### 7.1 并行处理

多张简历图片可以并行处理：

```javascript
const dataUrls = await Promise.all(
  imgBlobElements.map(img => blobToDataURL(img.src))
);
```

### 7.2 尺寸限制

- SVG 转换最大高度：3000px
- Canvas 默认宽度：800px
- 超时时间：30秒

### 7.3 缓存策略

对于同一候选人的简历，避免重复获取：

```javascript
if (processedCandidateIds.has(candidate.id)) {
  continue;
}
```

## 8. 测试验证

### 8.1 测试场景

| 场景 | 预期结果 |
|------|----------|
| Blob URL 图片 | 成功转换为 base64 |
| SVG 简历 | 成功转换为 PNG |
| HTML 简历 | 成功截图 |
| 多张图片 | 全部获取 |
| 无简历图片 | 返回 null，记录错误 |

### 8.2 验证命令

在浏览器控制台执行：

```javascript
// 检查选择器
MokaSelectorMonitor.quickCheck('resumeImages.imgBlob');
MokaSelectorMonitor.quickCheck('resumeImages.iframeResume');

// 生成健康报告
MokaSelectorMonitor.printReport();
```

## 9. 更新记录

| 日期 | 变更内容 | 影响范围 |
|------|----------|----------|
| 2026-02-24 | 初始版本创建 | 简历处理模块 |
| 2026-02-24 | 添加 MIME 类型修复 | blob 转换 |
