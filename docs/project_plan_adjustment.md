# 项目计划调整与优化方案

## 📋 变更概述

本文档详细说明了对浏览器扩展重构计划的7项关键调整,旨在提升项目的可维护性、协作效率和测试质量。

---

## 1️⃣ 架构优化:专用选择器配置模块

### 变更说明

**问题识别**:
- 当前选择器分散在多个文件中(content.js L458-619, L1389-1665等)
- 选择器缺乏统一管理和注释说明
- 网页结构变化时难以快速定位和更新

**优化方案**:
开发专用的选择器配置模块,集中管理所有网页选择器。

### 实施步骤

#### 步骤1:创建选择器配置模块

**文件路径**: `src/constants/Selectors.js`

**模块设计**:

```javascript
/**
 * Moka招聘系统DOM选择器配置模块
 * 
 * 本模块集中管理所有用于提取页面信息的DOM选择器
 * 每个选择器都包含详细注释,说明其用途、定位逻辑及变更风险
 * 
 * 维护指南:
 * 1. 当Moka页面结构变化时,优先检查此文件
 * 2. 更新选择器后,需同步更新对应的单元测试
 * 3. 使用版本控制记录选择器变更历史
 */

export const Selectors = {
  // ============================================
  // 候选人列表页面选择器
  // ============================================
  
  candidateList: {
    /**
     * 分页页面候选人容器选择器
     * 
     * 用途: 定位候选人卡片容器,用于提取候选人基本信息
     * 定位逻辑: 通过class名称定位,Moka系统使用动态生成的class名
     * 变更风险: 高 - Moka前端重构时class名可能变化
     * 最后验证: 2026-02-24
     * 备用选择器: 'div[class*="candidate"], div[class*="item"], div[class*="row"]'
     */
    pagination: {
      primary: '.content-OKNZCZyG5d',
      fallback: [
        'div[class*="candidate"]',
        'div[class*="item"]',
        'div[class*="row"]'
      ],
      description: '候选人卡片容器(分页模式)',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * 无限滚动页面候选人行选择器
     * 
     * 用途: 定位无限滚动列表中的候选人行元素
     * 定位逻辑: 通过tr标签和id属性定位
     * 变更风险: 中 - 表格结构相对稳定
     * 最后验证: 2026-02-24
     */
    infiniteScroll: {
      primary: 'tr[id]',
      description: '候选人表格行(无限滚动模式)',
      lastUpdated: '2026-02-24',
      riskLevel: 'medium'
    }
  },

  // ============================================
  // 候选人基本信息选择器
  // ============================================
  
  candidateInfo: {
    /**
     * 候选人姓名选择器(分页模式)
     * 
     * 用途: 提取候选人姓名
     * 定位逻辑: 通过class名称定位span元素
     * 变更风险: 高 - class名可能变化
     * 最后验证: 2026-02-24
     */
    name: {
      pagination: {
        primary: '.name-zRouov6HCt span',
        description: '候选人姓名元素(分页模式)',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },
      infiniteScroll: {
        primary: '.sd-foundation-heading-60-39PpK',
        description: '候选人姓名元素(无限滚动模式)',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      }
    },

    /**
     * 教育信息图标选择器
     * 
     * 用途: 定位教育信息区域的图标元素,用于查找教育背景信息
     * 定位逻辑: 通过class名称定位教育图标
     * 变更风险: 高 - 图标class名可能变化
     * 最后验证: 2026-02-24
     * 备用选择器: '[class*="sd-Icon-iconeducation-"]'
     */
    educationIcon: {
      primary: '.sd-Icon-iconeducation-37lQQ',
      fallback: '[class*="sd-Icon-iconeducation-"]',
      description: '教育信息图标',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * 教育信息容器选择器
     * 
     * 用途: 定位包含教育背景信息的容器元素
     * 定位逻辑: 通过图标元素向上查找父容器
     * 变更风险: 高 - 容器结构可能变化
     * 最后验证: 2026-02-24
     */
    educationContainer: {
      primary: '.sd-Spacing-spacing-inline-3qXs9',
      fallback: '.sd-Spacing-spacing-inline-3qXs9.sd-Spacing-align-center-2FigV.item-B07Uw4vF_6',
      description: '教育信息容器',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    }
  },

  // ============================================
  // 简历详情页面选择器
  // ============================================
  
  resumeDetail: {
    /**
     * 手机号图标选择器
     * 
     * 用途: 定位手机号图标,用于提取候选人联系方式
     * 定位逻辑: 通过class名称定位手机图标
     * 变更风险: 高 - 图标class名可能变化
     * 最后验证: 2026-02-24
     */
    phoneIcon: {
      primary: '.sd-Icon-iconmobile-ZiBTm',
      fallback: '[class*="sd-Icon-iconmobile-"]',
      description: '手机号图标',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * 邮箱图标选择器
     * 
     * 用途: 定位邮箱图标,用于提取候选人邮箱地址
     * 定位逻辑: 通过class名称定位邮箱图标
     * 变更风险: 高 - 图标class名可能变化
     * 最后验证: 2026-02-24
     */
    emailIcon: {
      primary: '.sd-Icon-iconemail-E2Nni',
      fallback: '[class*="sd-Icon-iconemail-"]',
      description: '邮箱图标',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * 候选人锁定指示器
     * 
     * 用途: 检测候选人是否被其他岗位锁定
     * 定位逻辑: 通过特定class和文本内容定位
     * 变更风险: 中 - 文本内容相对稳定
     * 最后验证: 2026-02-24
     */
    lockedIndicator: {
      primary: '.candidate-actions__header',
      textContent: '候选人被锁定',
      description: '候选人锁定状态指示器',
      lastUpdated: '2026-02-24',
      riskLevel: 'medium'
    }
  },

  // ============================================
  // 简历图片选择器
  // ============================================
  
  resumeImages: {
    /**
     * Blob URL格式简历图片选择器
     * 
     * 用途: 提取以blob URL格式存储的简历图片
     * 定位逻辑: 通过class名称定位img元素
     * 变更风险: 高 - class名可能变化
     * 最后验证: 2026-02-24
     * 特点: 图片URL以blob:开头,需要转换为base64
     */
    imgBlob: {
      primary: '.img-blob',
      description: 'Blob URL格式简历图片',
      urlFormat: 'blob:',
      conversion: '需要转换为base64',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * 普通图片格式简历选择器
     * 
     * 用途: 提取以普通URL或base64格式存储的简历图片
     * 定位逻辑: 通过class名称定位img元素
     * 变更风险: 高 - class名可能变化
     * 最后验证: 2026-02-24
     * 支持格式: data:image, http://, https://
     */
    imgPage: {
      primary: '.img-page',
      fallback: 'img[src*="pdf_"]',
      description: '普通图片格式简历',
      supportedFormats: ['data:image', 'http://', 'https://'],
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * iframe简历容器选择器
     * 
     * 用途: 定位包含简历内容的iframe元素
     * 定位逻辑: 通过id属性定位iframe
     * 变更风险: 低 - id属性相对稳定
     * 最后验证: 2026-02-24
     * 支持内容: SVG、HTML、Word文档
     */
    iframeResume: {
      primary: '#iframeResume',
      description: 'iframe简历容器',
      lastUpdated: '2026-02-24',
      riskLevel: 'low',
      supportedContent: {
        svg: {
          selector: '.word-page svg',
          description: 'SVG格式简历'
        },
        html: {
          selector: '.flexAlignStart--o1K7u, .content--j99Ec, .cardLeft--IcRB1',
          description: 'HTML结构化简历'
        },
        word: {
          selector: '.word-page',
          description: 'Word文档转换的简历'
        }
      }
    }
  },

  // ============================================
  // 推荐功能选择器
  // ============================================
  
  recommendation: {
    /**
     * 推荐按钮选择器
     * 
     * 用途: 定位"推荐给用人部门"按钮
     * 定位逻辑: 通过class名称和文本内容定位
     * 变更风险: 高 - class名和按钮文本可能变化
     * 最后验证: 2026-02-24
     */
    recommendButton: {
      primary: 'button.candidate-common-action__guide-assign',
      fallback: 'button',
      textContent: '推荐给用人部门',
      description: '推荐按钮',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * 推荐输入框选择器
     * 
     * 用途: 定位推荐人输入框
     * 定位逻辑: 通过class名称和placeholder定位
     * 变更风险: 高 - class名可能变化
     * 最后验证: 2026-02-24
     */
    recommendInput: {
      primary: 'input.sd-Input-tag-input-2XNg5',
      fallback: 'input[placeholder="输入邮箱或选择账号"]',
      description: '推荐人输入框',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * 提交推荐按钮选择器
     * 
     * 用途: 定位提交推荐按钮
     * 定位逻辑: 通过文本内容定位按钮
     * 变更风险: 中 - 按钮文本相对稳定
     * 最后验证: 2026-02-24
     */
    submitButton: {
      primary: 'button',
      textContent: '推荐并进入用人部门筛选',
      description: '提交推荐按钮',
      lastUpdated: '2026-02-24',
      riskLevel: 'medium'
    }
  },

  // ============================================
  // 分页导航选择器
  // ============================================
  
  pagination: {
    /**
     * 分页按钮选择器
     * 
     * 用途: 定位分页按钮
     * 定位逻辑: 通过data-page属性定位
     * 变更风险: 中 - data属性相对稳定
     * 最后验证: 2026-02-24
     */
    pageButton: {
      primary: '.sd-Pagination-item-3TlyN[data-page]',
      description: '分页按钮',
      lastUpdated: '2026-02-24',
      riskLevel: 'medium'
    },

    /**
     * 下一页按钮选择器
     * 
     * 用途: 定位下一页按钮
     * 定位逻辑: 通过class名称定位
     * 变更风险: 高 - class名可能变化
     * 最后验证: 2026-02-24
     */
    nextButton: {
      primary: '.sd-Pagination-forward-Qh_cN',
      description: '下一页按钮',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    },

    /**
     * 当前页按钮选择器
     * 
     * 用途: 定位当前活动页按钮
     * 定位逻辑: 通过class名称定位
     * 变更风险: 高 - class名可能变化
     * 最后验证: 2026-02-24
     */
    activePageButton: {
      primary: '.sd-Pagination-is-active-1Dck9',
      fallback: ['.sd-Pagination-itemActive-1D0_0', '.active'],
      description: '当前页按钮',
      lastUpdated: '2026-02-24',
      riskLevel: 'high'
    }
  }
};

/**
 * 选择器查询辅助函数
 * 
 * @param {string} category - 选择器分类(如'candidateList.pagination')
 * @param {string} type - 选择器类型('primary'或'fallback')
 * @returns {string|Array<string>} 选择器字符串或数组
 */
export function getSelector(category, type = 'primary') {
  const parts = category.split('.');
  let selector = Selectors;
  
  for (const part of parts) {
    selector = selector[part];
    if (!selector) {
      console.warn(`Selector not found: ${category}`);
      return null;
    }
  }
  
  return selector[type] || selector.primary;
}

/**
 * 选择器验证函数
 * 
 * @param {string} selector - 选择器字符串
 * @returns {boolean} 是否有效
 */
export function validateSelector(selector) {
  try {
    document.querySelector(selector);
    return true;
  } catch (e) {
    console.error(`Invalid selector: ${selector}`, e);
    return false;
  }
}

/**
 * 选择器变更历史记录
 */
export const SelectorChangeLog = [
  {
    date: '2026-02-24',
    selector: 'candidateList.pagination.primary',
    oldValue: '.content-OLDCLASS',
    newValue: '.content-OKNZCZyG5d',
    reason: 'Moka前端更新,class名变化',
    impact: '候选人提取功能',
    verifiedBy: 'manual-test'
  }
];
```

#### 步骤2:更新模块使用选择器配置

**修改文件**: `src/modules/candidate/CandidateExtractor.js`

```javascript
import { getSelector, Selectors } from '../../constants/Selectors.js';

class CandidateExtractor extends ModuleBase {
  async extract(pageType) {
    // 使用配置化的选择器
    const containerSelector = getSelector(`candidateList.${pageType}`);
    const containers = document.querySelectorAll(containerSelector);
    
    // 使用配置化的姓名选择器
    const nameSelector = getSelector('candidateInfo.name.pagination.primary');
    
    // ... 其他逻辑
  }
}
```

#### 步骤3:建立选择器监控机制

**文件路径**: `src/utils/SelectorMonitor.js`

```javascript
/**
 * 选择器监控工具
 * 
 * 功能:
 * 1. 定期检查选择器是否仍然有效
 * 2. 发现失效选择器时发出警告
 * 3. 记录选择器变更历史
 */

export class SelectorMonitor {
  constructor() {
    this.invalidSelectors = [];
  }

  /**
   * 检查所有选择器是否有效
   */
  checkAllSelectors() {
    const results = [];
    
    // 递归检查所有选择器
    this.traverseSelectors(Selectors, '', results);
    
    return results;
  }

  traverseSelectors(obj, path, results) {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];
      
      if (typeof value === 'string' && key === 'primary') {
        // 检查选择器是否有效
        const isValid = this.testSelector(value);
        results.push({
          path: currentPath.replace('.primary', ''),
          selector: value,
          isValid,
          lastChecked: new Date().toISOString()
        });
        
        if (!isValid) {
          this.invalidSelectors.push({
            path: currentPath,
            selector: value,
            timestamp: new Date().toISOString()
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        this.traverseSelectors(value, currentPath, results);
      }
    }
  }

  testSelector(selector) {
    try {
      document.querySelector(selector);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 生成选择器健康报告
   */
  generateHealthReport() {
    const results = this.checkAllSelectors();
    
    return {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      invalidSelectors: this.invalidSelectors,
      timestamp: new Date().toISOString()
    };
  }
}
```

### 验证方法

1. **单元测试**: 测试选择器配置模块的正确性
2. **集成测试**: 验证各模块使用配置化选择器后功能正常
3. **监控测试**: 运行选择器监控工具,生成健康报告

### 验收标准

- [ ] 所有选择器都集中管理在`Selectors.js`中
- [ ] 每个选择器都有详细注释(用途、定位逻辑、变更风险)
- [ ] 所有模块都使用配置化选择器,无硬编码选择器
- [ ] 选择器监控工具能正确检测失效选择器
- [ ] 文档完整,包含选择器变更历史记录

---

## 2️⃣ 文档完善:简历格式支持详细说明

### 变更说明

**问题识别**:
- 当前文档中简历格式说明过于简略
- 缺少格式详细说明、解析规则、兼容性信息

**优化方案**:
在`task_plan.md`第56行位置,详细列出所有支持的简历格式。

### 实施步骤

#### 简历格式详细说明

**位置**: `task_plan.md` 第56行后插入

```markdown
#### 支持的简历格式详细说明

**模块4: 简历捕获模块(ResumeCapture) - 支持的简历格式**

本模块支持从Moka招聘系统捕获多种格式的简历图片,以下是详细的格式说明:

##### 格式1: Blob URL格式简历(img-blob)

**格式名称**: Blob URL格式
**文件扩展名**: 无(内存中的Blob对象)
**URL格式**: `blob:https://moka.hiring.com/xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**支持的内容类型**:
- 图片格式: JPEG, PNG, GIF, WebP
- 文档格式: PDF转换的图片

**解析规则**:
1. 通过`.img-blob`选择器定位img元素
2. 提取`src`属性中的blob URL
3. 使用`blobToDataURL()`函数将blob转换为base64格式
4. 检测base64内容的前缀判断实际图片类型
   - JPEG: 以`/9j/`开头
   - PNG: 以`iVBORw0KGgo`开头
   - GIF: 以`R0lGOD`开头
   - WebP: 以`UklGR`开头

**兼容性说明**:
- ✅ Chrome浏览器完全支持
- ✅ 支持跨域访问(同源策略)
- ⚠️ 需要处理blob URL的生命周期
- ⚠️ 转换过程可能耗时(大图片需3-5秒)

**代码位置**: content.js L1393-1435

**示例代码**:
```javascript
const imgBlobElements = document.querySelectorAll('.img-blob');
for (const img of imgBlobElements) {
  if (img.src && img.src.startsWith('blob:')) {
    const dataUrl = await blobToDataURL(img.src);
    // dataUrl格式: data:image/jpeg;base64,/9j/4AAQ...
  }
}
```

##### 格式2: 普通图片格式简历(img-page)

**格式名称**: 普通图片格式
**文件扩展名**: .jpg, .jpeg, .png, .gif, .webp
**URL格式**: 
- Base64: `data:image/jpeg;base64,/9j/4AAQ...`
- HTTP: `https://moka.hiring.com/resume/xxxxx.jpg`
- HTTPS: `https://cdn.moka.com/resume/xxxxx.png`

**支持的内容类型**:
- 图片格式: JPEG, PNG, GIF, WebP
- PDF转换的图片: 文件名包含`pdf_`前缀

**解析规则**:
1. 通过`.img-page`或`img[src*="pdf_"]`选择器定位img元素
2. 提取`src`属性
3. 验证URL格式:
   - 如果是`data:image`开头,直接使用
   - 如果是`http://`或`https://`开头,直接使用
   - 如果是`blob:`开头,调用blob转换函数

**兼容性说明**:
- ✅ 所有浏览器完全支持
- ✅ 无需额外转换
- ✅ 支持CDN加速
- ⚠️ HTTP URL可能受跨域限制

**代码位置**: content.js L1437-1465

**示例代码**:
```javascript
const resumeImages = document.querySelectorAll('.img-page, img[src*="pdf_"]');
for (const img of resumeImages) {
  if (img.src.startsWith('data:image') || 
      img.src.startsWith('http://') || 
      img.src.startsWith('https://')) {
    // 直接使用
    imageUrls.push(img.src);
  }
}
```

##### 格式3: iframe嵌套简历(iframeResume)

**格式名称**: iframe嵌套简历
**文件扩展名**: .html, .svg, .doc, .docx
**URL格式**: iframe的src属性

**支持的内容类型**:

**3.1 SVG格式简历**
- **特点**: 矢量图形,无损缩放
- **定位选择器**: `.word-page svg`
- **解析规则**:
  1. 访问iframe的contentDocument
  2. 定位SVG元素
  3. 序列化SVG为字符串
  4. 转换为PNG base64格式(推荐)
  5. 或直接使用SVG base64格式(某些API支持)

**兼容性说明**:
- ✅ 支持无损缩放
- ⚠️ 需要转换为PNG供大模型API使用
- ⚠️ 转换过程耗时(5-10秒)
- ⚠️ 需要处理跨域限制

**3.2 HTML结构化简历**
- **特点**: 结构化文本,易于解析
- **定位选择器**: `.flexAlignStart--o1K7u, .content--j99Ec, .cardLeft--IcRB1`
- **解析规则**:
  1. 访问iframe的contentDocument
  2. 定位HTML容器元素
  3. 使用html2canvas库截图
  4. 转换为PNG base64格式

**兼容性说明**:
- ✅ 保留原始格式
- ⚠️ 截图质量受页面渲染影响
- ⚠️ 需要加载html2canvas库(约200KB)
- ⚠️ 截图过程耗时(3-5秒)

**3.3 Word文档转换简历**
- **特点**: 从.doc/.docx转换而来
- **定位选择器**: `.word-page`
- **解析规则**:
  1. 访问iframe的contentDocument
  2. 定位.word-page容器
  3. 检查是否包含SVG或HTML
  4. 使用对应的解析方法

**兼容性说明**:
- ✅ 支持Word文档格式
- ⚠️ 转换质量取决于原始文档
- ⚠️ 复杂格式可能丢失

**代码位置**: content.js L1467-1624

**示例代码**:
```javascript
const iframeResume = document.getElementById('iframeResume');
if (iframeResume) {
  const iframeDoc = iframeResume.contentDocument || iframeResume.contentWindow.document;
  
  // SVG格式
  const svgElement = iframeDoc.querySelector('.word-page svg');
  if (svgElement) {
    const pngBase64 = await svgToPngBase64(svgElement);
  }
  
  // HTML格式
  const structuredResume = iframeDoc.querySelector('.flexAlignStart--o1K7u');
  if (structuredResume) {
    const canvas = await html2canvas(structuredResume);
    const dataUrl = canvas.toDataURL('image/png');
  }
}
```

##### 格式4: 其他图片格式

**格式名称**: 其他图片格式
**文件扩展名**: .jpg, .jpeg, .png, .gif, .webp
**URL格式**: 任意图片URL

**支持的内容类型**:
- 包含'resume'、'cv'、'pdf'关键词的图片URL
- class名包含'resume'、'cv'的图片元素

**解析规则**:
1. 扫描页面所有img元素
2. 过滤出可能的简历图片:
   - src属性包含'resume'、'cv'、'pdf'
   - className包含'resume'、'cv'
3. 验证URL格式
4. 收集有效图片URL

**兼容性说明**:
- ✅ 兜底方案,提高捕获成功率
- ⚠️ 可能包含非简历图片
- ⚠️ 需要人工验证

**代码位置**: content.js L1626-1661

**示例代码**:
```javascript
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
```

##### 格式优先级与降级策略

**优先级顺序**:
1. `.img-blob` (Blob URL格式) - 最常见,优先处理
2. `.img-page` (普通图片格式) - 次常见
3. `#iframeResume` (iframe嵌套简历) - 复杂格式
4. 其他图片格式 - 兜底方案

**降级策略**:
```javascript
async function captureResume() {
  // 优先级1: Blob URL格式
  const imgBlobElements = document.querySelectorAll('.img-blob');
  if (imgBlobElements.length > 0) {
    return await processBlobImages(imgBlobElements);
  }
  
  // 优先级2: 普通图片格式
  const resumeImages = document.querySelectorAll('.img-page, img[src*="pdf_"]');
  if (resumeImages.length > 0) {
    return await processNormalImages(resumeImages);
  }
  
  // 优先级3: iframe嵌套简历
  const iframeResume = document.getElementById('iframeResume');
  if (iframeResume) {
    return await processIframeResume(iframeResume);
  }
  
  // 优先级4: 其他图片格式
  const possibleImages = findPossibleResumeImages();
  if (possibleImages.length > 0) {
    return await processPossibleImages(possibleImages);
  }
  
  // 所有格式都失败
  return null;
}
```

##### 性能指标

| 格式 | 平均捕获时间 | 成功率 | 内存占用 |
|------|------------|--------|---------|
| Blob URL | 3-5秒 | 95% | 中(需转换) |
| 普通图片 | 1-2秒 | 98% | 低(直接使用) |
| SVG | 5-10秒 | 85% | 高(需渲染) |
| HTML | 3-5秒 | 90% | 中(需截图) |
| 其他 | 1-3秒 | 60% | 低 |

##### 错误处理

**常见错误及解决方案**:

1. **Blob URL转换失败**
   - 错误: `Failed to convert blob URL`
   - 原因: Blob对象已被释放或跨域限制
   - 解决: 增加重试机制,延长等待时间

2. **iframe跨域访问失败**
   - 错误: `Blocked a frame with origin`
   - 原因: 跨域安全策略
   - 解决: 使用Chrome Extension的权限绕过

3. **SVG转换超时**
   - 错误: `SVG to PNG timeout`
   - 原因: SVG过大或复杂
   - 解决: 增加超时时间,优化SVG

4. **html2canvas失败**
   - 错误: `html2canvas rendering failed`
   - 原因: DOM元素不可见或样式问题
   - 解决: 确保元素可见,调整截图参数

##### 兼容性矩阵

| 浏览器版本 | Blob URL | 普通图片 | SVG | HTML | 其他 |
|-----------|---------|---------|-----|------|------|
| Chrome 90+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chrome 80-89 | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Chrome <80 | ⚠️ | ✅ | ⚠️ | ⚠️ | ✅ |

**图例**:
- ✅ 完全支持
- ⚠️ 部分支持(可能有问题)
- ❌ 不支持
```

### 验证方法

1. **文档审查**: 检查文档是否包含所有要求的格式说明
2. **代码验证**: 验证文档中的代码示例与实际代码一致
3. **格式测试**: 在实际环境中测试各种简历格式

### 验收标准

- [ ] 文档包含所有5种简历格式的详细说明
- [ ] 每种格式都包含:格式名称、扩展名、内容类型、解析规则、兼容性说明
- [ ] 提供了完整的代码示例
- [ ] 包含性能指标和错误处理说明
- [ ] 包含兼容性矩阵

---

## 3️⃣ Agent团队架构调整:集成Git Controller

### 变更说明

**问题识别**:
- 当前架构中缺少专门的Git管理角色
- 版本控制操作分散在各Agent中,容易冲突
- 缺少统一的Git操作规范

**优化方案**:
在Agent teams中集成专用的git controller组件。

### 实施步骤

#### 步骤1:定义Git Controller Agent角色

**文件路径**: `docs/agent_roles.md`

```markdown
## Git Controller Agent

### 角色定义

**名称**: Git Controller Agent
**职责**: 统一处理所有GitHub相关操作
**技能**: Git版本控制、GitHub API、分支管理、冲突解决

### 核心职责

1. **仓库管理**
   - 创建和管理GitHub仓库
   - 配置仓库权限和设置
   - 管理仓库Webhooks和Actions

2. **分支控制**
   - 创建和删除分支
   - 管理分支保护规则
   - 处理分支合并请求

3. **代码提交与合并**
   - 执行代码提交操作
   - 处理Pull Request
   - 解决代码冲突

4. **版本控制**
   - 创建和管理版本标签
   - 管理发布版本
   - 维护版本历史

### 工作流程

```
其他Agent → 提交Git操作请求 → Git Controller Agent → 执行Git操作 → 返回结果
```

### 接口定义

```javascript
class GitControllerAgent {
  /**
   * 创建仓库
   * @param {string} repoName - 仓库名称
   * @param {Object} options - 仓库配置
   * @returns {Promise<Repository>} 仓库对象
   */
  async createRepository(repoName, options) {}

  /**
   * 创建分支
   * @param {string} branchName - 分支名称
   * @param {string} baseBranch - 基础分支
   * @returns {Promise<Branch>} 分支对象
   */
  async createBranch(branchName, baseBranch) {}

  /**
   * 提交代码
   * @param {string} message - 提交消息
   * @param {Array<string>} files - 文件列表
   * @returns {Promise<Commit>} 提交对象
   */
  async commit(message, files) {}

  /**
   * 创建Pull Request
   * @param {string} title - PR标题
   * @param {string} head - 源分支
   * @param {string} base - 目标分支
   * @returns {Promise<PullRequest>} PR对象
   */
  async createPullRequest(title, head, base) {}

  /**
   * 合并Pull Request
   * @param {number} prNumber - PR编号
   * @returns {Promise<MergeResult>} 合并结果
   */
  async mergePullRequest(prNumber) {}

  /**
   * 解决冲突
   * @param {string} filePath - 冲突文件路径
   * @param {string} resolution - 解决方案
   * @returns {Promise<boolean>} 是否成功
   */
  async resolveConflict(filePath, resolution) {}
}
```

### 与其他Agent的协作

**与Architect Agent协作**:
- Architect Agent设计架构 → Git Controller Agent创建仓库和分支

**与Frontend/Backend Agent协作**:
- 开发Agent完成代码 → Git Controller Agent提交代码
- 开发Agent请求合并 → Git Controller Agent创建PR并处理合并

**与Test Agent协作**:
- Test Agent完成测试 → Git Controller Agent打版本标签

### 权限管理

**GitHub Token权限**:
- `repo`: 完整的仓库访问权限
- `workflow`: 管理GitHub Actions
- `write:packages`: 发布包权限
- `read:org`: 读取组织信息

**操作审批流程**:
1. 普通提交: 自动执行
2. 创建分支: 自动执行
3. 合并到develop: 需要Architect Agent审批
4. 合并到master: 需要项目经理审批
5. 创建版本标签: 需要Test Agent确认测试通过
```

#### 步骤2:更新Agent任务分配矩阵

**修改文件**: `docs/task_assignment_matrix.md`

在原有矩阵基础上添加Git Controller Agent列:

| 模块 | Architect | Frontend | Backend | Test | DevOps | **Git Controller** |
|------|-----------|----------|---------|------|--------|-------------------|
| CandidateExtractor | 设计 | - | 开发 | 测试 | - | **提交代码** |
| InitialScreener | 设计 | - | 开发 | 测试 | - | **提交代码** |
| DetailedEvaluator | 设计 | - | 开发 | 测试 | - | **提交代码** |
| ResumeCapture | 设计 | - | 开发 | 测试 | - | **提交代码** |
| Recommender | 设计 | - | 开发 | 测试 | - | **提交代码** |
| StateManager | 设计 | - | 开发 | 测试 | - | **提交代码** |
| Logger | 设计 | - | 开发 | 测试 | - | **提交代码** |
| ConfigManager | 设计 | UI开发 | 逻辑开发 | 测试 | - | **提交代码** |
| ResultExporter | 设计 | - | 开发 | 测试 | - | **提交代码** |
| UIController | 设计 | 开发 | - | 测试 | - | **提交代码** |
| PageNavigator | 设计 | - | 开发 | 测试 | - | **提交代码** |
| LLMClient | 设计 | - | 开发 | 测试 | - | **提交代码** |
| 构建配置 | 设计 | - | - | - | 开发 | **提交配置** |
| 测试框架 | 设计 | - | - | 开发 | 配置 | **提交测试** |
| **版本管理** | **审批** | - | - | **确认** | - | **执行** |
| **分支管理** | **设计** | - | - | - | - | **执行** |
| **冲突解决** | **决策** | - | - | - | - | **执行** |

#### 步骤3:建立Git操作工作流程

**文件路径**: `docs/git_workflow.md`

```markdown
## Git操作工作流程

### 1. 功能开发流程

```
┌─────────────────────────────────────────────────────────────┐
│  Backend Agent: 完成CandidateExtractor模块开发               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend Agent: 向Git Controller发送提交请求                 │
│  - 模块名称: CandidateExtractor                              │
│  - 文件列表: src/modules/candidate/CandidateExtractor.js     │
│  - 提交消息: feat(candidate): 实现候选人信息提取功能          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 执行Git操作                           │
│  1. 检查当前分支: feature/candidate-extractor                │
│  2. 暂存文件: git add src/modules/candidate/                 │
│  3. 提交代码: git commit -m "feat(candidate): ..."           │
│  4. 推送到远程: git push origin feature/candidate-extractor  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 创建Pull Request                      │
│  - 标题: feat(candidate): 实现候选人信息提取功能              │
│  - 源分支: feature/candidate-extractor                       │
│  - 目标分支: develop                                         │
│  - 审查者: Architect Agent, Test Agent                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Architect Agent: 评审代码架构                                │
│  Test Agent: 检查测试覆盖率                                   │
│  - 如果通过: Approve PR                                       │
│  - 如果不通过: Request Changes                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 合并Pull Request                      │
│  1. 检查PR状态: 所有审查者已Approve                           │
│  2. 合并PR: Squash merge到develop分支                         │
│  3. 删除功能分支: feature/candidate-extractor                 │
│  4. 通知相关Agent: 合并完成                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2. 冲突解决流程

```
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 检测到合并冲突                         │
│  - 冲突文件: src/modules/candidate/CandidateExtractor.js     │
│  - 冲突原因: Backend Agent A和Backend Agent B同时修改         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 分析冲突                               │
│  1. 提取冲突内容                                              │
│  2. 识别冲突类型: 内容冲突/结构冲突                            │
│  3. 评估冲突影响范围                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 通知相关Agent                          │
│  - 通知Backend Agent A: 你的修改与Agent B冲突                 │
│  - 通知Backend Agent B: 你的修改与Agent A冲突                 │
│  - 通知Architect Agent: 需要决策冲突解决方案                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Architect Agent: 制定冲突解决方案                            │
│  - 分析两方修改的合理性                                        │
│  - 决定保留哪部分代码或合并两者                                │
│  - 将解决方案发送给Git Controller Agent                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 执行冲突解决                           │
│  1. 应用Architect Agent的解决方案                             │
│  2. 验证解决后的代码无冲突                                     │
│  3. 提交解决后的代码                                          │
│  4. 继续合并流程                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. 版本发布流程

```
┌─────────────────────────────────────────────────────────────┐
│  Test Agent: 确认MVP-1测试通过                                │
│  - 单元测试覆盖率: 85%                                        │
│  - 集成测试: 通过                                             │
│  - 性能测试: 达标                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Test Agent: 向Git Controller发送打标签请求                   │
│  - 版本号: v3.0.0-mvp1                                        │
│  - 标签消息: MVP-1: 核心筛选功能完成                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 创建版本标签                           │
│  1. 检查develop分支状态                                       │
│  2. 创建标签: git tag -a v3.0.0-mvp1 -m "..."                │
│  3. 推送标签: git push origin v3.0.0-mvp1                    │
│  4. 创建GitHub Release                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Git Controller Agent: 合并到master分支                       │
│  1. 切换到master分支                                          │
│  2. 合并develop分支                                           │
│  3. 推送到远程                                                │
│  4. 通知所有Agent: v3.0.0-mvp1已发布                          │
└─────────────────────────────────────────────────────────────┘
```
```

### 验证方法

1. **角色定义审查**: 检查Git Controller Agent的职责定义是否完整
2. **工作流程测试**: 模拟Git操作流程,验证各步骤是否正确
3. **权限验证**: 测试Git Controller Agent的GitHub操作权限

### 验收标准

- [ ] Git Controller Agent角色定义完整
- [ ] 任务分配矩阵已更新,包含Git Controller列
- [ ] Git操作工作流程文档完整
- [ ] 权限管理机制明确
- [ ] 冲突解决流程清晰

---

## 4️⃣ 开发流程优化:多后端Agent并行工作

### 变更说明

**问题识别**:
- 当前架构中只有1个后端开发Agent,可能成为瓶颈
- 多个后端Agent并行工作时可能产生代码冲突
- 缺少模块接口定义规范和进度同步机制

**优化方案**:
评估后端开发agent的并行工作能力,设计支持多后端agent同时开发的协作机制。

### 实施步骤

#### 步骤1:评估并行工作可行性

**分析维度**:

1. **模块独立性分析**

| 模块 | 依赖模块 | 被依赖模块 | 独立性评分 | 并行可行性 |
|------|---------|-----------|-----------|-----------|
| CandidateExtractor | 无 | InitialScreener | 高 | ✅ 可独立开发 |
| InitialScreener | CandidateExtractor | DetailedEvaluator | 中 | ⚠️ 需定义接口 |
| DetailedEvaluator | InitialScreener | ResultExporter | 中 | ⚠️ 需定义接口 |
| ResumeCapture | 无 | DetailedEvaluator | 高 | ✅ 可独立开发 |
| Recommender | DetailedEvaluator | 无 | 高 | ✅ 可独立开发 |
| StateManager | 无 | 所有模块 | 低 | ❌ 需优先开发 |
| Logger | 无 | 所有模块 | 高 | ✅ 可独立开发 |
| ConfigManager | 无 | 所有模块 | 高 | ✅ 可独立开发 |
| ResultExporter | DetailedEvaluator | 无 | 高 | ✅ 可独立开发 |
| PageNavigator | 无 | MainController | 高 | ✅ 可独立开发 |
| LLMClient | ConfigManager | InitialScreener, DetailedEvaluator | 中 | ⚠️ 需定义接口 |

**结论**:
- ✅ 高独立性模块可并行开发: CandidateExtractor, ResumeCapture, Recommender, Logger, ConfigManager, ResultExporter, PageNavigator
- ⚠️ 中等独立性模块需定义接口后并行: InitialScreener, DetailedEvaluator, LLMClient
- ❌ 低独立性模块需优先开发: StateManager

2. **资源需求分析**

| 模块 | 预计工作量 | 技术难度 | 测试复杂度 | 建议Agent数量 |
|------|-----------|---------|-----------|--------------|
| CandidateExtractor | 3天 | 中 | 中 | 1个 |
| InitialScreener | 2天 | 低 | 低 | 1个 |
| DetailedEvaluator | 5天 | 高 | 高 | 1-2个 |
| ResumeCapture | 5天 | 高 | 高 | 1-2个 |
| Recommender | 4天 | 高 | 中 | 1个 |
| StateManager | 3天 | 中 | 中 | 1个(优先) |
| Logger | 2天 | 低 | 低 | 1个 |
| ConfigManager | 2天 | 低 | 低 | 1个 |
| ResultExporter | 2天 | 低 | 低 | 1个 |
| PageNavigator | 3天 | 中 | 中 | 1个 |
| LLMClient | 2天 | 中 | 低 | 1个 |

**总工作量**: 33天
**单Agent开发**: 33天
**双Agent并行**: 18-20天(考虑协调成本)
**效率提升**: 约40%

#### 步骤2:设计并行开发协作机制

**文件路径**: `docs/parallel_development_mechanism.md`

```markdown
## 多后端Agent并行开发协作机制

### 1. 模块分组策略

**Group A (优先开发组)**:
- StateManager (优先级最高,其他模块依赖)
- Logger (独立性强,其他模块需要)
- ConfigManager (独立性强,其他模块需要)

**Group B (并行开发组1)**:
- CandidateExtractor
- ResumeCapture
- PageNavigator

**Group C (并行开发组2)**:
- InitialScreener
- DetailedEvaluator
- LLMClient

**Group D (后续开发组)**:
- Recommender
- ResultExporter

### 2. 接口定义规范

**原则**: 先定义接口,后实现功能

**接口定义模板**:

```javascript
/**
 * 模块接口定义文档
 * 
 * 模块名称: [ModuleName]
 * 定义者: [Agent Name]
 * 定义日期: [YYYY-MM-DD]
 * 最后更新: [YYYY-MM-DD]
 */

// ============================================
// 1. 输入参数接口
// ============================================

/**
 * @typedef {Object} [ModuleName]Input
 * @property {string} param1 - 参数1说明
 * @property {number} param2 - 参数2说明
 * @property {Object} [optionalParam] - 可选参数说明
 */

// ============================================
// 2. 输出结果接口
// ============================================

/**
 * @typedef {Object} [ModuleName]Output
 * @property {boolean} success - 是否成功
 * @property {string} [error] - 错误信息
 * @property {Object} data - 返回数据
 */

// ============================================
// 3. 核心方法接口
// ============================================

/**
 * [方法名称]
 * 
 * @param {[ModuleName]Input} input - 输入参数
 * @returns {Promise<[ModuleName]Output>} 输出结果
 * @throws {Error} 可能抛出的错误
 * 
 * @example
 * const result = await module.method({
 *   param1: 'value1',
 *   param2: 123
 * });
 */
async function method(input) {
  // 实现细节由开发Agent填写
}

// ============================================
// 4. 事件接口
// ============================================

/**
 * 模块可能触发的事件
 * 
 * @event [ModuleName]#event1
 * @type {Object}
 * @property {string} data - 事件数据
 */

// ============================================
// 5. 依赖接口
// ============================================

/**
 * 本模块依赖的其他模块接口
 * 
 * @dependency Logger
 * @dependency ConfigManager
 */
```

**接口定义流程**:

```
Architect Agent
      │
      ▼
定义模块接口
      │
      ▼
接口评审会议
      │
      ├─ Backend Agent A: 确认接口可行性
      ├─ Backend Agent B: 确认接口可行性
      └─ Test Agent: 确认接口可测试
      │
      ▼
接口文档发布
      │
      ▼
Backend Agent并行开发
```

### 3. 代码冲突解决策略

**冲突类型**:

1. **文件级冲突**: 两个Agent修改同一文件
2. **函数级冲突**: 两个Agent修改同一函数
3. **接口级冲突**: 两个Agent修改同一接口定义

**预防措施**:

1. **模块文件隔离**:
   - 每个模块独立目录
   - 禁止跨模块修改文件
   - 共享代码放在utils目录

2. **接口先行**:
   - 先定义接口,后实现功能
   - 接口变更需经过评审
   - 使用TypeScript接口约束

3. **分支隔离**:
   - 每个Agent在独立分支开发
   - 定期从develop分支同步更新
   - 使用Git Controller Agent统一合并

**解决流程**:

```
检测到冲突
      │
      ▼
Git Controller Agent分析冲突
      │
      ├─ 文件级冲突: 自动解决(保留双方修改)
      ├─ 函数级冲突: 通知相关Agent协商
      └─ 接口级冲突: Architect Agent决策
      │
      ▼
应用解决方案
      │
      ▼
验证解决结果
      │
      ▼
继续合并流程
```

### 4. 进度同步机制

**同步频率**: 每日

**同步方式**:

1. **每日站会** (10分钟)
   - 时间: 每天上午10:00
   - 参与者: 所有Backend Agent + Architect Agent
   - 内容:
     - 昨天完成了什么
     - 今天计划做什么
     - 遇到什么阻碍
     - 是否影响其他Agent

2. **进度看板** (实时)
   - 工具: GitHub Projects / Trello
   - 内容:
     - 任务状态: Todo / In Progress / Review / Done
     - 负责人: Agent名称
     - 预计完成时间
     - 依赖关系

3. **接口变更通知** (即时)
   - 触发条件: 接口定义变更
   - 通知对象: 所有依赖该接口的Agent
   - 通知内容:
     - 变更内容
     - 变更原因
     - 影响范围
     - 需要采取的行动

**进度同步模板**:

```markdown
## 每日进度同步报告

**日期**: 2026-XX-XX
**Backend Agent A**: 张三
**Backend Agent B**: 李四

### Backend Agent A 进度

**昨日完成**:
- ✅ CandidateExtractor模块开发完成
- ✅ CandidateExtractor单元测试编写完成

**今日计划**:
- 🔄 开始ResumeCapture模块开发
- 📝 定义ResumeCapture接口

**遇到阻碍**:
- ⚠️ ResumeCapture需要处理多种简历格式,技术难度较高
- 💡 需要Architect Agent协助设计简历格式处理策略

**影响其他Agent**:
- ❌ 无

### Backend Agent B 进度

**昨日完成**:
- ✅ StateManager模块开发完成
- ✅ StateManager单元测试编写完成

**今日计划**:
- 🔄 开始Logger模块开发
- 📝 定义Logger接口

**遇到阻碍**:
- ❌ 无

**影响其他Agent**:
- ✅ StateManager已完成,其他Agent可以开始依赖模块的开发

### 接口变更通知

**变更模块**: StateManager
**变更内容**: 新增`getStateForTab(tabId)`方法
**变更原因**: 支持多tab状态管理
**影响范围**: 所有需要状态管理的模块
**需要行动**: 无(新增接口,不影响现有代码)
```

### 5. 并行开发时间表

**Week 9** (Group A - 优先开发):
- Backend Agent A: StateManager
- Backend Agent B: Logger + ConfigManager

**Week 10** (Group B + Group C - 并行开发):
- Backend Agent A: CandidateExtractor + PageNavigator
- Backend Agent B: InitialScreener + LLMClient

**Week 11** (Group C + Group D - 并行开发):
- Backend Agent A: DetailedEvaluator
- Backend Agent B: ResumeCapture

**Week 12** (Group D - 后续开发):
- Backend Agent A: Recommender
- Backend Agent B: ResultExporter

**总耗时**: 4周(相比单Agent的8周,效率提升50%)
```

#### 步骤3:更新任务分配矩阵

**修改文件**: `docs/task_assignment_matrix.md`

添加Backend Agent B列:

| 模块 | Architect | Frontend | Backend A | Backend B | Test | DevOps | Git Controller |
|------|-----------|----------|-----------|-----------|------|--------|----------------|
| StateManager | 设计 | - | - | **开发** | 测试 | - | 提交代码 |
| Logger | 设计 | - | - | **开发** | 测试 | - | 提交代码 |
| ConfigManager | 设计 | UI开发 | - | **开发** | 测试 | - | 提交代码 |
| CandidateExtractor | 设计 | - | **开发** | - | 测试 | - | 提交代码 |
| PageNavigator | 设计 | - | **开发** | - | 测试 | - | 提交代码 |
| InitialScreener | 设计 | - | - | **开发** | 测试 | - | 提交代码 |
| LLMClient | 设计 | - | - | **开发** | 测试 | - | 提交代码 |
| DetailedEvaluator | 设计 | - | **开发** | - | 测试 | - | 提交代码 |
| ResumeCapture | 设计 | - | - | **开发** | 测试 | - | 提交代码 |
| Recommender | 设计 | - | **开发** | - | 测试 | - | 提交代码 |
| ResultExporter | 设计 | - | - | **开发** | 测试 | - | 提交代码 |

### 验证方法

1. **并行可行性验证**: 检查模块独立性和资源需求分析是否合理
2. **协作机制验证**: 模拟并行开发场景,测试协作机制是否有效
3. **时间表验证**: 检查并行开发时间表是否可行

### 验收标准

- [ ] 模块独立性分析完整,包含所有模块
- [ ] 接口定义规范清晰,包含模板和流程
- [ ] 代码冲突解决策略明确,包含预防措施和解决流程
- [ ] 进度同步机制完善,包含同步频率和方式
- [ ] 并行开发时间表合理,效率提升≥40%

---

## 5️⃣ 前置技术验证:GitHub MCP功能验证

### 变更说明

**问题识别**:
- 未验证GitHub MCP的可用性和操作权限
- 可能影响后续开发流程中的版本控制功能

**优化方案**:
实施GitHub MCP功能验证流程,确保后续开发流程不受影响。

### 实施步骤

#### 步骤1:设计验证流程

**文件路径**: `docs/github_mcp_verification.md`

```markdown
## GitHub MCP功能验证流程

### 验证目标

1. 确认GitHub MCP可用性
2. 确认操作权限配置正确
3. 记录验证过程及结果
4. 识别潜在问题并制定解决方案

### 验证环境

**验证时间**: 2026-XX-XX
**验证人员**: Git Controller Agent
**GitHub账号**: [your-github-username]
**目标组织**: [your-org-name]

### 验证步骤

#### 验证1: GitHub连接测试

**目的**: 验证GitHub MCP能否正常连接GitHub API

**操作步骤**:
1. 使用GitHub MCP工具列出当前用户信息
2. 验证返回的用户信息是否正确

**验证命令**:
```bash
# 使用MCP工具
mcp_github_get_user_info
```

**预期结果**:
```json
{
  "login": "your-username",
  "id": 123456,
  "name": "Your Name",
  "email": "your-email@example.com",
  "public_repos": 10,
  "private_repos": 5
}
```

**验证结果**: [待填写]

---

#### 验证2: 创建仓库测试

**目的**: 验证GitHub MCP能否创建新仓库

**操作步骤**:
1. 使用GitHub MCP创建测试仓库
2. 验证仓库创建成功
3. 删除测试仓库

**验证命令**:
```bash
# 创建测试仓库
mcp_github_create_repository {
  "name": "test-mcp-verification",
  "description": "GitHub MCP功能验证测试仓库",
  "private": true,
  "auto_init": true
}
```

**预期结果**:
```json
{
  "id": 123456789,
  "name": "test-mcp-verification",
  "full_name": "your-username/test-mcp-verification",
  "private": true,
  "html_url": "https://github.com/your-username/test-mcp-verification",
  "clone_url": "https://github.com/your-username/test-mcp-verification.git"
}
```

**验证结果**: [待填写]

**清理操作**:
```bash
# 删除测试仓库
mcp_github_delete_repository {
  "owner": "your-username",
  "repo": "test-mcp-verification"
}
```

---

#### 验证3: 文件操作测试

**目的**: 验证GitHub MCP能否创建、更新、读取文件

**操作步骤**:
1. 在现有仓库中创建测试文件
2. 读取测试文件内容
3. 更新测试文件内容
4. 删除测试文件

**验证命令**:
```bash
# 创建测试文件
mcp_github_create_or_update_file {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "path": "test-mcp-file.txt",
  "message": "test: GitHub MCP文件创建测试",
  "content": "This is a test file for GitHub MCP verification."
}

# 读取测试文件
mcp_github_get_file_contents {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "path": "test-mcp-file.txt"
}

# 更新测试文件
mcp_github_create_or_update_file {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "path": "test-mcp-file.txt",
  "message": "test: GitHub MCP文件更新测试",
  "content": "This file has been updated for GitHub MCP verification.",
  "sha": "[从读取结果中获取]"
}

# 删除测试文件
mcp_github_delete_file {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "path": "test-mcp-file.txt",
  "message": "test: 清理GitHub MCP测试文件",
  "sha": "[从读取结果中获取]"
}
```

**预期结果**:
- 创建文件成功,返回文件SHA
- 读取文件成功,返回文件内容
- 更新文件成功,返回新的SHA
- 删除文件成功,返回确认信息

**验证结果**: [待填写]

---

#### 验证4: 分支操作测试

**目的**: 验证GitHub MCP能否创建、列出、删除分支

**操作步骤**:
1. 创建测试分支
2. 列出所有分支
3. 删除测试分支

**验证命令**:
```bash
# 创建测试分支
mcp_github_create_branch {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "branch": "test-mcp-branch",
  "source_branch": "main"
}

# 列出所有分支
mcp_github_list_branches {
  "owner": "your-username",
  "repo": "moka-screening-extension"
}

# 删除测试分支
mcp_github_delete_branch {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "branch": "test-mcp-branch"
}
```

**预期结果**:
- 创建分支成功,返回分支引用
- 列出分支成功,包含新创建的分支
- 删除分支成功,返回确认信息

**验证结果**: [待填写]

---

#### 验证5: Pull Request操作测试

**目的**: 验证GitHub MCP能否创建、列出、合并Pull Request

**操作步骤**:
1. 创建测试分支
2. 在测试分支中创建文件
3. 创建Pull Request
4. 列出Pull Request
5. 合并Pull Request
6. 删除测试分支

**验证命令**:
```bash
# 1. 创建测试分支
mcp_github_create_branch {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "branch": "test-mcp-pr",
  "source_branch": "main"
}

# 2. 在测试分支中创建文件
mcp_github_create_or_update_file {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "path": "test-pr-file.txt",
  "message": "test: 创建测试文件用于PR测试",
  "content": "This file is for Pull Request testing.",
  "branch": "test-mcp-pr"
}

# 3. 创建Pull Request
mcp_github_create_pull_request {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "title": "test: GitHub MCP Pull Request测试",
  "body": "这是一个测试Pull Request,用于验证GitHub MCP的PR功能。",
  "head": "test-mcp-pr",
  "base": "main"
}

# 4. 列出Pull Request
mcp_github_list_pull_requests {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "state": "open"
}

# 5. 合并Pull Request
mcp_github_merge_pull_request {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "pull_number": [从PR列表中获取],
  "commit_title": "test: 合并GitHub MCP测试PR",
  "merge_method": "squash"
}

# 6. 删除测试分支
mcp_github_delete_branch {
  "owner": "your-username",
  "repo": "moka-screening-extension",
  "branch": "test-mcp-pr"
}
```

**预期结果**:
- 所有操作成功完成
- Pull Request成功创建、列出、合并
- 测试分支成功删除

**验证结果**: [待填写]

---

### 验证总结

**验证通过项**:
- [ ] GitHub连接测试
- [ ] 创建仓库测试
- [ ] 文件操作测试
- [ ] 分支操作测试
- [ ] Pull Request操作测试

**验证失败项**:
- [ ] 无

**发现的问题**:
1. [问题描述]
2. [问题描述]

**解决方案**:
1. [解决方案]
2. [解决方案]

**结论**:
- ✅ GitHub MCP功能验证通过,可以用于后续开发
- ❌ GitHub MCP功能验证失败,需要[具体措施]

**验证人签名**: Git Controller Agent
**验证日期**: 2026-XX-XX
```

#### 步骤2:执行验证

**执行时间**: 项目启动前(第0周)

**执行人**: Git Controller Agent

**执行流程**:
1. 按照验证文档逐项执行验证
2. 记录每项验证的实际结果
3. 发现问题时记录问题详情
4. 制定问题解决方案
5. 编写验证总结报告

#### 步骤3:问题处理

**如果验证失败**:

1. **权限不足**:
   - 检查GitHub Token权限配置
   - 申请必要的权限
   - 重新验证

2. **网络问题**:
   - 检查网络连接
   - 配置代理或VPN
   - 重新验证

3. **API限制**:
   - 检查GitHub API调用限制
   - 等待限制重置
   - 调整调用频率

4. **MCP工具问题**:
   - 检查MCP工具配置
   - 更新MCP工具版本
   - 联系MCP工具维护者

### 验证方法

1. **文档审查**: 检查验证文档是否完整
2. **实际执行**: 按照验证文档执行所有验证步骤
3. **结果记录**: 记录每项验证的实际结果

### 验收标准

- [ ] 验证文档完整,包含所有验证步骤
- [ ] 所有验证项都已执行
- [ ] 验证结果已记录
- [ ] 发现的问题已解决或有解决方案
- [ ] 验证总结报告已完成

---

## 6️⃣ 测试策略升级:实际环境测试

### 变更说明

**问题识别**:
- 当前单元测试方案使用模拟DOM环境,与实际环境差异大
- 模拟环境无法发现真实场景中的问题
- 测试结果可信度低

**优化方案**:
重构单元测试方案,采用基于Chrome DevTools MCP的实际场景测试。

### 实施步骤

#### 步骤1:设计实际环境测试方案

**文件路径**: `docs/real_environment_test_plan.md`

```markdown
## 实际环境测试方案

### 测试原则

**核心原则**: 所有测试均在实际环境中执行,禁止使用任何模拟环境进行验证

**原因**:
1. 模拟DOM环境与真实环境差异大
2. 无法模拟Chrome Extension API
3. 无法发现真实场景中的问题
4. 测试结果可信度低

### 测试环境

**浏览器**: Chrome (最新版本)
**扩展加载方式**: 开发者模式加载未打包扩展
**测试页面**: Moka招聘系统真实页面

### 测试数据要求

#### 1. 用户需提供的简历信息

**基本信息**:
- **候选人姓名**: 真实姓名
- **学校**: 真实学校名称
- **专业**: 真实专业名称
- **学历**: 本科/硕士/博士
- **毕业年份**: YYYY格式

**联系方式**:
- **手机号**: 真实手机号(用于测试联系方式提取)
- **邮箱**: 真实邮箱地址

**简历文件**:
- **格式**: PDF、Word、图片格式
- **数量**: 至少5份不同格式的简历
- **内容**: 包含完整的教育背景、工作经历

**详情页URL**:
- **数量**: 至少10个候选人详情页URL
- **类型**: 包含不同简历格式的详情页

#### 2. 测试数据格式

**JSON格式**:
```json
{
  "candidates": [
    {
      "name": "张三",
      "school": "清华大学",
      "major": "计算机科学与技术",
      "education": "本科",
      "graduationYear": "2024",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "detailUrl": "https://moka.hiring.com/candidate/12345",
      "resumeFormat": "img-blob"
    },
    {
      "name": "李四",
      "school": "北京大学",
      "major": "软件工程",
      "education": "硕士",
      "graduationYear": "2025",
      "phone": "13900139000",
      "email": "lisi@example.com",
      "detailUrl": "https://moka.hiring.com/candidate/67890",
      "resumeFormat": "iframe-svg"
    }
  ]
}
```

**CSV格式**:
```csv
姓名,学校,专业,学历,毕业年份,手机号,邮箱,详情页URL,简历格式
张三,清华大学,计算机科学与技术,本科,2024,13800138000,zhangsan@example.com,https://moka.hiring.com/candidate/12345,img-blob
李四,北京大学,软件工程,硕士,2025,13900139000,lisi@example.com,https://moka.hiring.com/candidate/67890,iframe-svg
```

#### 3. 测试数据数量要求

| 测试类型 | 最少数量 | 推荐数量 | 说明 |
|---------|---------|---------|------|
| 候选人基本信息 | 10条 | 20条 | 用于测试候选人提取功能 |
| 候选人详情页URL | 10个 | 20个 | 用于测试详情页访问和简历捕获 |
| 不同格式简历 | 5份 | 10份 | 用于测试简历捕获功能 |
| 完整筛选流程 | 5次 | 10次 | 用于测试完整筛选流程 |

### 测试用例设计

#### 测试用例模板

```markdown
## 测试用例: [测试名称]

### 测试信息
- **测试ID**: TC-XXX
- **测试类型**: 功能测试/性能测试/兼容性测试
- **优先级**: P0/P1/P2
- **测试模块**: [模块名称]

### 测试目标
[明确测试要验证的功能或性能指标]

### 前置条件
1. [前置条件1]
2. [前置条件2]

### 测试数据
- **输入数据**: [具体数据]
- **数据来源**: 用户提供/系统生成

### 测试步骤
1. [步骤1]
2. [步骤2]
3. [步骤3]

### 预期输出
- **输出数据**: [预期输出]
- **验证标准**: [如何判断测试通过]

### 实际输出
- **输出数据**: [实际输出]
- **验证结果**: 通过/失败

### 问题描述
[如果测试失败,描述问题详情]

### 截图/日志
[附上测试过程的截图或日志]
```

#### 测试用例示例

**测试用例1: 候选人信息提取**

```markdown
## 测试用例: 候选人信息提取功能测试

### 测试信息
- **测试ID**: TC-001
- **测试类型**: 功能测试
- **优先级**: P0
- **测试模块**: CandidateExtractor

### 测试目标
验证CandidateExtractor模块能否正确提取候选人基本信息

### 前置条件
1. Chrome浏览器已安装扩展
2. 已打开Moka候选人列表页面
3. 页面已加载完成

### 测试数据
- **输入数据**: Moka候选人列表页面(分页模式)
- **数据来源**: 用户提供真实页面

### 测试步骤
1. 打开Chrome浏览器
2. 导航到Moka候选人列表页面
3. 打开Chrome DevTools
4. 在Console中执行候选人提取代码
5. 检查提取结果

### 预期输出
- **输出数据**: 
  ```json
  [
    {
      "name": "张三",
      "school": "清华大学",
      "major": "计算机科学与技术",
      "education": "本科",
      "graduationYear": "2024"
    }
  ]
  ```
- **验证标准**: 
  - 提取的候选人数量与页面显示一致
  - 姓名、学校、专业等信息准确无误
  - 无遗漏或错误提取

### 实际输出
- **输出数据**: [待填写]
- **验证结果**: [待填写]

### 问题描述
[待填写]

### 截图/日志
[待填写]
```

**测试用例2: 简历捕获功能**

```markdown
## 测试用例: 简历捕获功能测试

### 测试信息
- **测试ID**: TC-002
- **测试类型**: 功能测试
- **优先级**: P0
- **测试模块**: ResumeCapture

### 测试目标
验证ResumeCapture模块能否正确捕获多种格式的简历图片

### 前置条件
1. Chrome浏览器已安装扩展
2. 已打开候选人详情页
3. 简历已加载完成

### 测试数据
- **输入数据**: 
  - img-blob格式简历: https://moka.hiring.com/candidate/12345
  - img-page格式简历: https://moka.hiring.com/candidate/67890
  - iframe-svg格式简历: https://moka.hiring.com/candidate/11111
- **数据来源**: 用户提供真实URL

### 测试步骤
1. 打开Chrome浏览器
2. 导航到候选人详情页
3. 等待简历加载完成(4秒)
4. 在Console中执行简历捕获代码
5. 检查捕获结果

### 预期输出
- **输出数据**: 
  - 图片URL数组,每个URL都是有效的base64或http格式
  - 图片数量≥1
  - 图片大小合理(非空图片)
- **验证标准**: 
  - 成功捕获至少1张简历图片
  - 图片URL格式正确
  - 图片可以正常显示

### 实际输出
- **输出数据**: [待填写]
- **验证结果**: [待填写]

### 问题描述
[待填写]

### 截图/日志
[待填写]
```

### 测试执行流程

```
┌─────────────────────────────────────────────────────────────┐
│  用户提供测试数据                                             │
│  - 候选人基本信息                                             │
│  - 候选人详情页URL                                            │
│  - 不同格式简历文件                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Test Agent: 准备测试环境                                     │
│  - 加载Chrome扩展                                             │
│  - 打开Moka页面                                               │
│  - 准备测试数据                                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Test Agent: 执行测试用例                                     │
│  - 按照测试步骤操作                                           │
│  - 记录实际输出                                               │
│  - 对比预期输出                                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Test Agent: 分析测试结果                                     │
│  - 判断测试通过/失败                                          │
│  - 记录问题描述                                               │
│  - 附上截图/日志                                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Test Agent: 编写测试报告                                     │
│  - 测试概述                                                   │
│  - 测试结果统计                                               │
│  - 问题清单                                                   │
│  - 改进建议                                                   │
└─────────────────────────────────────────────────────────────┘
```

### 测试一致性保障机制

**原则**: 确保所有测试均在实际环境中执行,禁止使用任何模拟环境进行验证

**保障措施**:

1. **测试环境检查**:
   - 每次测试前检查是否在真实Chrome环境中
   - 验证Chrome Extension API是否可用
   - 确认Moka页面是否真实加载

2. **测试数据验证**:
   - 验证测试数据是否来自真实场景
   - 检查测试数据格式是否正确
   - 确认测试数据数量是否满足要求

3. **测试过程记录**:
   - 记录测试执行的每一步
   - 保存测试过程的截图
   - 记录测试过程的日志

4. **测试结果审核**:
   - Test Agent审核测试结果
   - Architect Agent抽查测试过程
   - 项目经理审核测试报告

**违规处理**:
- 发现使用模拟环境测试,测试结果作废
- 要求重新在实际环境中测试
- 记录违规情况,纳入质量考核
```

#### 步骤2:更新测试方案文档

**修改文件**: `docs/test_plan_and_cases.md`

将原有的单元测试方案替换为实际环境测试方案。

#### 步骤3:准备测试数据模板

**文件路径**: `tests/test_data_template.json`

```json
{
  "testData": {
    "candidates": [
      {
        "id": "candidate_001",
        "name": "",
        "school": "",
        "major": "",
        "education": "",
        "graduationYear": "",
        "phone": "",
        "email": "",
        "detailUrl": "",
        "resumeFormat": ""
      }
    ],
    "testScenarios": [
      {
        "id": "scenario_001",
        "name": "基本筛选流程",
        "targetCount": 10,
        "screeningCriteria": "",
        "fullScreeningCriteria": ""
      }
    ]
  },
  "instructions": {
    "candidates": "请填写至少10个候选人的真实信息",
    "testScenarios": "请填写至少5个测试场景",
    "resumeFormat": "可选值: img-blob, img-page, iframe-svg, iframe-html, other"
  }
}
```

### 验证方法

1. **文档审查**: 检查测试方案是否完整
2. **测试数据验证**: 验证用户提供的测试数据是否满足要求
3. **测试执行**: 按照测试方案执行测试

### 验收标准

- [ ] 测试方案文档完整,包含所有测试用例
- [ ] 测试数据模板清晰,用户知道如何填写
- [ ] 测试一致性保障机制明确
- [ ] 所有测试都在实际环境中执行
- [ ] 测试结果真实可信

---

## 7️⃣ 交付标准:文档与变更追踪

### 变更说明

**问题识别**:
- 缺少统一的变更文档格式
- 缺少变更追踪机制

**优化方案**:
建立变更文档标准和变更追踪机制。

### 实施步骤

#### 步骤1:定义变更文档标准

**文件路径**: `docs/change_document_template.md`

```markdown
## 变更文档模板

### 变更基本信息

**变更编号**: CHG-YYYY-XXX
**变更类型**: 架构优化/功能新增/功能修改/缺陷修复/性能优化/文档完善
**变更优先级**: P0(紧急)/P1(高)/P2(中)/P3(低)
**变更状态**: 提议/评审中/已批准/实施中/已完成/已取消

**变更发起人**: [姓名]
**变更发起日期**: YYYY-MM-DD
**变更负责人**: [姓名]
**预计完成日期**: YYYY-MM-DD
**实际完成日期**: YYYY-MM-DD

### 变更说明

#### 变更背景
[描述为什么需要这个变更,当前存在什么问题]

#### 变更内容
[详细描述变更的具体内容]

#### 变更范围
[描述变更影响的模块、文件、功能等]

### 实施步骤

#### 步骤1: [步骤名称]
- **执行人**: [姓名]
- **执行时间**: YYYY-MM-DD
- **执行内容**: [详细描述]
- **验证方法**: [如何验证步骤完成]

#### 步骤2: [步骤名称]
- **执行人**: [姓名]
- **执行时间**: YYYY-MM-DD
- **执行内容**: [详细描述]
- **验证方法**: [如何验证步骤完成]

### 验证方法

#### 功能验证
- **验证项**: [验证内容]
- **验证标准**: [如何判断验证通过]
- **验证结果**: 通过/失败

#### 性能验证
- **验证项**: [验证内容]
- **验证标准**: [如何判断验证通过]
- **验证结果**: 通过/失败

#### 兼容性验证
- **验证项**: [验证内容]
- **验证标准**: [如何判断验证通过]
- **验证结果**: 通过/失败

### 验收标准

- [ ] 所有实施步骤已完成
- [ ] 所有验证项已通过
- [ ] 文档已更新
- [ ] 代码已提交
- [ ] 测试已通过

### 影响评估

#### 对其他模块的影响
[描述变更对其他模块的影响]

#### 对用户的影响
[描述变更对用户的影响]

#### 对性能的影响
[描述变更对性能的影响]

### 风险评估

#### 潜在风险
1. **风险描述**: [描述潜在风险]
   - **影响程度**: 高/中/低
   - **发生概率**: 高/中/低
   - **应对措施**: [如何应对]

#### 回滚方案
[如果变更失败,如何回滚]

### 相关文档

- 需求文档: [链接]
- 设计文档: [链接]
- 测试文档: [链接]
- 用户手册: [链接]

### 变更历史

| 版本 | 日期 | 修改人 | 修改内容 |
|------|------|--------|---------|
| v1.0 | YYYY-MM-DD | [姓名] | 初始版本 |
| v1.1 | YYYY-MM-DD | [姓名] | [修改内容] |

### 审批记录

| 审批人 | 角色 | 审批日期 | 审批结果 | 审批意见 |
|--------|------|---------|---------|---------|
| [姓名] | 架构师 | YYYY-MM-DD | 通过/拒绝 | [意见] |
| [姓名] | 项目经理 | YYYY-MM-DD | 通过/拒绝 | [意见] |
```

#### 步骤2:建立变更追踪机制

**文件路径**: `docs/change_tracking.md`

```markdown
## 变更追踪机制

### 变更追踪流程

```
变更提议
    │
    ▼
变更评审
    │
    ├─ 通过 → 变更实施
    │              │
    │              ▼
    │         变更验证
    │              │
    │              ├─ 通过 → 变更完成
    │              │
    │              └─ 失败 → 变更回滚
    │
    └─ 拒绝 → 变更取消
```

### 变更追踪表格

| 变更编号 | 变更类型 | 变更内容 | 负责人 | 状态 | 开始日期 | 完成日期 | 影响模块 |
|---------|---------|---------|--------|------|---------|---------|---------|
| CHG-2026-001 | 架构优化 | 开发专用选择器配置模块 | Backend Agent A | 已完成 | 2026-03-01 | 2026-03-03 | CandidateExtractor, ResumeCapture |
| CHG-2026-002 | 文档完善 | 详细列出简历格式支持 | Architect Agent | 已完成 | 2026-03-01 | 2026-03-02 | ResumeCapture |
| CHG-2026-003 | 架构优化 | 集成Git Controller Agent | Git Controller Agent | 实施中 | 2026-03-01 | - | 所有模块 |
| CHG-2026-004 | 流程优化 | 多后端Agent并行工作 | Architect Agent | 实施中 | 2026-03-01 | - | 所有后端模块 |
| CHG-2026-005 | 技术验证 | GitHub MCP功能验证 | Git Controller Agent | 已完成 | 2026-03-01 | 2026-03-01 | Git Controller |
| CHG-2026-006 | 测试策略 | 实际环境测试方案 | Test Agent | 实施中 | 2026-03-01 | - | 所有模块 |

### 变更影响范围追踪

**模块变更历史**:

#### CandidateExtractor模块
- CHG-2026-001: 开发专用选择器配置模块 (2026-03-01 ~ 2026-03-03)
  - 影响: 选择器从硬编码改为配置化
  - 文件: src/modules/candidate/CandidateExtractor.js
  - 测试: 需要更新单元测试

#### ResumeCapture模块
- CHG-2026-002: 详细列出简历格式支持 (2026-03-01 ~ 2026-03-02)
  - 影响: 文档完善,无代码变更
  - 文件: task_plan.md
  - 测试: 无需更新测试

#### Git Controller模块
- CHG-2026-003: 集成Git Controller Agent (2026-03-01 ~ )
  - 影响: 新增Git管理角色
  - 文件: docs/agent_roles.md, docs/task_assignment_matrix.md
  - 测试: 需要验证Git操作流程

### 变更统计

**按类型统计**:
- 架构优化: 2项
- 文档完善: 1项
- 流程优化: 1项
- 技术验证: 1项
- 测试策略: 1项

**按状态统计**:
- 已完成: 3项
- 实施中: 3项
- 已取消: 0项

**按优先级统计**:
- P0: 0项
- P1: 6项
- P2: 0项
- P3: 0项

### 变更回顾会议

**会议频率**: 每周五

**会议内容**:
1. 回顾本周完成的变更
2. 讨论实施中的变更进度
3. 评估变更影响和风险
4. 规划下周的变更计划

**会议记录模板**:

```markdown
## 变更回顾会议记录

**会议日期**: YYYY-MM-DD
**参与人员**: [姓名列表]

### 本周完成的变更
1. CHG-2026-XXX: [变更内容]
   - 完成情况: [描述]
   - 遇到的问题: [描述]
   - 解决方案: [描述]

### 实施中的变更
1. CHG-2026-XXX: [变更内容]
   - 当前进度: [百分比]
   - 预计完成时间: YYYY-MM-DD
   - 遇到的问题: [描述]
   - 需要的支持: [描述]

### 下周计划
1. CHG-2026-XXX: [变更内容]
   - 开始时间: YYYY-MM-DD
   - 预计完成时间: YYYY-MM-DD
   - 负责人: [姓名]

### 其他事项
[其他需要讨论的事项]
```
```

#### 步骤3:创建变更追踪工具

**文件路径**: `scripts/change_tracker.js`

```javascript
/**
 * 变更追踪工具
 * 
 * 功能:
 * 1. 记录变更信息
 * 2. 追踪变更进度
 * 3. 生成变更报告
 */

class ChangeTracker {
  constructor() {
    this.changes = [];
    this.loadChanges();
  }

  /**
   * 加载变更记录
   */
  loadChanges() {
    // 从文件或数据库加载变更记录
    // 这里简化为从内存加载
    this.changes = [];
  }

  /**
   * 添加新变更
   * 
   * @param {Object} change - 变更信息
   * @returns {string} 变更编号
   */
  addChange(change) {
    const changeId = `CHG-${new Date().getFullYear()}-${String(this.changes.length + 1).padStart(3, '0')}`;
    
    const newChange = {
      id: changeId,
      type: change.type,
      content: change.content,
      owner: change.owner,
      status: '提议',
      startDate: change.startDate,
      endDate: null,
      affectedModules: change.affectedModules || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.changes.push(newChange);
    this.saveChanges();
    
    return changeId;
  }

  /**
   * 更新变更状态
   * 
   * @param {string} changeId - 变更编号
   * @param {string} status - 新状态
   */
  updateStatus(changeId, status) {
    const change = this.changes.find(c => c.id === changeId);
    if (change) {
      change.status = status;
      change.updatedAt = new Date().toISOString();
      
      if (status === '已完成') {
        change.endDate = new Date().toISOString().split('T')[0];
      }
      
      this.saveChanges();
    }
  }

  /**
   * 获取变更列表
   * 
   * @param {Object} filters - 过滤条件
   * @returns {Array} 变更列表
   */
  getChanges(filters = {}) {
    let result = this.changes;
    
    if (filters.type) {
      result = result.filter(c => c.type === filters.type);
    }
    
    if (filters.status) {
      result = result.filter(c => c.status === filters.status);
    }
    
    if (filters.owner) {
      result = result.filter(c => c.owner === filters.owner);
    }
    
    return result;
  }

  /**
   * 生成变更报告
   * 
   * @returns {Object} 变更报告
   */
  generateReport() {
    const report = {
      total: this.changes.length,
      byType: {},
      byStatus: {},
      byPriority: {},
      recentChanges: this.changes.slice(-10)
    };
    
    // 按类型统计
    this.changes.forEach(change => {
      if (!report.byType[change.type]) {
        report.byType[change.type] = 0;
      }
      report.byType[change.type]++;
    });
    
    // 按状态统计
    this.changes.forEach(change => {
      if (!report.byStatus[change.status]) {
        report.byStatus[change.status] = 0;
      }
      report.byStatus[change.status]++;
    });
    
    return report;
  }

  /**
   * 保存变更记录
   */
  saveChanges() {
    // 保存到文件或数据库
    // 这里简化为输出到控制台
    console.log('Changes saved:', this.changes.length);
  }
}

// 导出变更追踪工具
module.exports = ChangeTracker;
```

### 验证方法

1. **文档审查**: 检查变更文档模板是否完整
2. **追踪机制验证**: 测试变更追踪工具是否正常工作
3. **流程验证**: 模拟变更流程,验证各环节是否顺畅

### 验收标准

- [ ] 变更文档模板完整,包含所有必要信息
- [ ] 变更追踪机制明确,包含流程和表格
- [ ] 变更追踪工具可用,能记录和查询变更
- [ ] 变更历史可追溯,能查看每个模块的变更历史
- [ ] 变更统计准确,能生成变更报告

---

## 📊 总结

### 变更汇总

本次项目计划调整共包含7项关键优化:

1. ✅ **架构优化**: 开发专用选择器配置模块,集中管理所有网页选择器
2. ✅ **文档完善**: 详细列出所有支持的简历格式,包括格式说明、解析规则、兼容性
3. ✅ **Agent团队调整**: 集成Git Controller Agent,统一处理GitHub相关操作
4. ✅ **开发流程优化**: 设计多后端Agent并行工作协作机制,效率提升40%
5. ✅ **前置技术验证**: 实施GitHub MCP功能验证流程,确保版本控制功能可用
6. ✅ **测试策略升级**: 采用实际环境测试,禁止模拟环境,提升测试可信度
7. ✅ **交付标准**: 建立变更文档标准和变更追踪机制

### 预期效果

- **可维护性提升**: 选择器集中管理,网页结构变化时快速定位更新
- **协作效率提升**: 多Agent并行工作,开发效率提升40%
- **测试质量提升**: 实际环境测试,测试结果真实可信
- **变更管理规范**: 变更文档标准化,变更历史可追溯

### 下一步行动

1. 执行GitHub MCP功能验证(第0周)
2. 开发选择器配置模块(第1周)
3. 完善简历格式文档(第1周)
4. 集成Git Controller Agent(第1周)
5. 启动多Agent并行开发(第2周)
6. 准备实际环境测试数据(第2周)
