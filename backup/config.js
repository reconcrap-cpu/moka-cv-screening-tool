// ============================================
// 招聘筛选助手 - 统一配置文件
// 所有大模型配置和提示词集中管理
// ============================================

const MokaScreeningConfig = {
  // ============================================
  // 1. 大模型 API 配置
  // ============================================
  
  api: {
    // 默认模型类型
    defaultModel: 'gpt-4o',
    
    // 支持的模型列表（用于下拉选择）
    supportedModels: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
    ],
    
    // API 请求配置
    requestConfig: {
      temperature: 0.3,
      maxRetries: 3,
      retryDelay: 1000, // 基础重试延迟（毫秒）
      timeout: 30000 // 请求超时时间（毫秒）
    }
  },

  // ============================================
  // 2. 系统提示词 (System Prompts)
  // ============================================
  
  systemPrompts: {
    // 初筛阶段系统提示词
    initialScreening: `你是一个专业的招聘筛选助手。请根据用户提供的初筛标准，分析每个人选是否符合要求。

注意事项：
1. 仔细对比候选人的学校、专业、学历、毕业年份与筛选标准
2. 只有明显不符合条件的候选人才排除
3. 保持客观公正，避免主观偏见
4. 返回格式必须严格遵循用户要求的 JSON 格式`,

    // 详细评估阶段系统提示词
    detailedEvaluation: `你是一个专业的招聘筛选助手。请根据用户提供的完整筛选标准，分析简历是否符合要求，并从简历中提取教育背景信息。

评估要求：
1. 仔细阅读简历内容，对照筛选标准逐项评估
2. 提取最高学历和本科教育背景信息
3. 给出详细的评估理由，说明符合或不符合的具体原因
4. 如果只有一段教育经历，则最高学历和本科信息填写相同内容
5. 返回格式必须严格遵循用户要求的 JSON 格式`
  },

  // ============================================
  // 3. 用户提示词模板 (User Prompt Templates)
  // ============================================
  
  userPrompts: {
    // 初筛阶段提示词模板
    initialScreening: (screeningCriteria, candidates) => `初筛标准: ${screeningCriteria}

人选信息: ${JSON.stringify(candidates, null, 2)}

请返回一个JSON对象，包含符合初筛标准的人选索引列表和他们的详细信息，格式如下:
{
  "qualifiedCandidates": [
    {
      "index": 0,
      "name": "姓名",
      "school": "学校",
      "major": "专业",
      "education": "学历",
      "graduationYear": "毕业年份"
    }
  ]
}`,

    // 详细评估阶段提示词模板
    detailedEvaluation: (fullScreeningCriteria) => `完整筛选标准: ${fullScreeningCriteria}

请根据简历图片内容进行分析，并提取教育背景信息。请返回一个JSON对象，控制在199token以内，格式如下:
{
  "qualified": true/false,
  "reason": "详细的评估理由",
  "highestSchool": "最高学历院校",
  "highestMajor": "最高学历专业",
  "bachelorSchool": "本科院校",
  "bachelorMajor": "本科专业"
}

如果只有一段教育经历，则最高学历和本科都填相同的信息。如果没有找到某项信息，请填空字符串。`
  },

  // ============================================
  // 4. 页面选择器配置 (用于提取候选人信息)
  // ============================================
  
  selectors: {
    // 分页页面选择器
    pagination: {
      candidateContainers: 'div[class*="candidate"], div[class*="item"], div[class*="row"]',
      nameElement: '.name-zRouov6HCt span',
      educationIcon: '.sd-Icon-iconeducation-37lQQ, [class*="sd-Icon-iconeducation-"]',
      educationContainer: '.sd-Spacing-spacing-inline-3qXs9.sd-Spacing-align-center-2FigV.item-B07Uw4vF_6',
      educationText: '.sd-Spacing-spacing-inline-3qXs9.sd-Spacing-align-center-2FigV.ellipsis-vKhHFawJzy',
      nextPageButton: '.sd-Pagination-forward-Qh_cN',
      pageButton: '.sd-Pagination-item-3TlyN[data-page]',
      activePageButton: '.sd-Pagination-is-active-1Dck9, .sd-Pagination-itemActive-1D0_0, .active'
    },
    
    // 无限滚动页面选择器
    infiniteScroll: {
      candidateRows: 'tr[id]',
      nameElement: '.sd-foundation-heading-60-39PpK',
      educationItem: '.list-item-N6cWsfhbS8',
      educationIcon: '.sd-Icon-iconeducation-37lQQ, [class*="sd-Icon-iconeducation-"]',
      splitElements: '.split-qbqyESLfBC',
      clickTarget: '.item-NpfQ8Ve_W4'
    },
    
    // 候选人详情页选择器
    detailPage: {
      phoneIcon: '.sd-Icon-iconmobile-ZiBTm, [class*="sd-Icon-iconmobile-"]',
      emailIcon: '.sd-Icon-iconemail-E2Nni, [class*="sd-Icon-iconemail-"]',
      lockedIndicator: '.candidate-actions__header',
      recommendButton: 'button.candidate-common-action__guide-assign',
      submitRecommendButton: 'button',
      tagInput: 'input.sd-Input-tag-input-2XNg5',
      tagText: '.sd-Tag-text-2F-n3, .sd-Tag-container-3G3Yk, [class*="Tag-text"], [class*="Tag-container"]'
    },
    
    // 简历图片选择器
    resumeImages: {
      imgBlob: '.img-blob',
      imgPage: '.img-page, img[src*="pdf_"]',
      iframeResume: '#iframeResume',
      wordPage: '.word-page',
      svgElement: 'svg',
      structuredResume: '.flexAlignStart--o1K7u, .content--j99Ec, .cardLeft--IcRB1, #water-mark-wrap, .cardLeft--ZsR4w, .board--CYPTx'
    }
  },

  // ============================================
  // 5. 流程控制配置
  // ============================================
  
  flowControl: {
    // 页面切换等待时间（毫秒）
    pageTransitionDelay: 3000,
    backNavigationDelay: 2000,
    
    // 简历截图等待时间
    resumeCaptureDelay: 4000,
    
    // 无限滚动配置
    infiniteScroll: {
      maxRetries: 5,
      scrollDelay: 2000,
      checkInterval: 500
    },
    
    // 推荐功能配置
    recommendation: {
      inputDelay: 100, // 字符输入间隔
      dropdownWaitDelay: 1500, // 下拉菜单等待时间
      selectionDelay: 2000, // 选择后等待时间
      submitDelay: 3000 // 提交后等待时间
    }
  },

  // ============================================
  // 6. 日志配置
  // ============================================
  
  logging: {
    maxLogEntries: 500, // 最大日志条目数
    enableConsoleLog: true, // 是否启用控制台日志
    logLevel: 'info' // 日志级别: debug, info, warn, error
  },

  // ============================================
  // 7. 默认筛选标准示例
  // ============================================
  
  defaultCriteria: {
    initialScreening: `1. 学历要求：本科及以上
2. 毕业年份：2024年及以后
3. 学校要求：985/211院校优先
4. 专业要求：计算机相关专业`,

    fullScreening: `1. 学历：本科及以上学历
2. 专业：计算机科学、软件工程、信息技术等相关专业
3. 技能要求：
   - 熟悉至少一种编程语言（Java/Python/Go等）
   - 了解常用数据结构和算法
   - 有项目经验或实习经历优先
4. 其他：
   - 良好的沟通能力
   - 学习能力强
   - 对技术有热情`
  },

  // ============================================
  // 8. 导出配置
  // ============================================
  
  export: {
    csvHeaders: [
      '姓名',
      '手机号',
      '邮箱',
      '详情页URL',
      '通过筛选原因',
      '最高学历院校',
      '最高学历专业',
      '本科院校',
      '本科专业',
      '备注'
    ],
    filenamePrefix: {
      qualified: '合格候选人',
      failed: 'API失败候选人'
    }
  }
};

// ============================================
// 导出配置（用于不同的模块加载方式）
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MokaScreeningConfig;
}
