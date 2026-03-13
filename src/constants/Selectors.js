/**
 * Moka招聘系统DOM选择器配置模块
 * 
 * 本模块集中管理所有用于提取页面信息的DOM选择器
 * 每个选择器都包含详细注释,说明其用途、定位逻辑及潜在变更风险
 * 
 * 维护指南:
 * 1. 当Moka页面结构变化时,优先检查此文件
 * 2. 更新选择器后,需同步更新对应的单元测试
 * 3. 使用版本控制记录选择器变更历史
 */

var MokaSelectors = (function() {
  const Selectors = {
    candidateList: {
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

      infiniteScroll: {
        primary: 'tr[id]',
        description: '候选人表格行(无限滚动模式)',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      }
    },

    candidateInfo: {
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

      educationIcon: {
        primary: '.sd-Icon-iconeducation-37lQQ',
        fallback: '[class*="sd-Icon-iconeducation-"]',
        description: '教育信息图标',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      educationContainer: {
        primary: '.sd-Spacing-spacing-inline-3qXs9',
        fallback: '.sd-Spacing-spacing-inline-3qXs9.sd-Spacing-align-center-2FigV.item-B07Uw4vF_6',
        description: '教育信息容器',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      educationInline: {
        primary: '.sd-Spacing-spacing-inline-3qXs9.sd-Spacing-align-center-2FigV.ellipsis-vKhHFawJzy',
        description: '教育信息内联元素',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      listItem: {
        primary: '.list-item-N6cWsfhbS8',
        description: '列表项(无限滚动模式)',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      },

      splitElement: {
        primary: '.split-qbqyESLfBC',
        description: '分割元素',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      },

      topElement: {
        primary: '.top-I0hDlGQcuR',
        description: '顶部点击区域(分页模式)',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      itemElement: {
        primary: '.item-NpfQ8Ve_W4',
        description: '候选人项元素(无限滚动模式)',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      container: {
        primary: '.container-i9WQ6tolSM',
        description: '候选人容器',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      }
    },

    resumeDetail: {
      phoneIcon: {
        primary: '.sd-Icon-iconmobile-ZiBTm',
        fallback: '[class*="sd-Icon-iconmobile-"]',
        description: '手机号图标',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      emailIcon: {
        primary: '.sd-Icon-iconemail-E2Nni',
        fallback: '[class*="sd-Icon-iconemail-"]',
        description: '邮箱图标',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      lockedIndicator: {
        primary: '.candidate-actions__header',
        textContent: '候选人被锁定',
        description: '候选人锁定状态指示器',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      },

      contactContainer: {
        primary: '.sd-Spacing-spacing-inline-3qXs9, .candidate-header-info-item-iIpckHaTor, .sd-Dropdown-container-2K__m',
        description: '联系方式容器',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      }
    },

    resumeImages: {
      imgBlob: {
        primary: '.img-blob',
        description: 'Blob URL格式简历图片',
        urlFormat: 'blob:',
        conversion: '需要转换为base64',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      imgPage: {
        primary: '.img-page',
        fallback: 'img[src*="pdf_"]',
        description: '普通图片格式简历',
        supportedFormats: ['data:image', 'http://', 'https://'],
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

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
      },

      other: {
        primary: 'img',
        description: '其他图片格式简历',
        supportedFormats: ['data:image', 'http://', 'https://'],
        lastUpdated: '2026-02-24',
        riskLevel: 'low'
      }
    },

    recommendation: {
      recommendButton: {
        primary: 'button.candidate-common-action__guide-assign',
        fallback: 'button',
        textContent: '推荐给用人部门',
        description: '推荐按钮',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      recommendInput: {
        primary: 'input.sd-Input-tag-input-2XNg5',
        fallback: 'input[placeholder="输入邮箱或选择账号"]',
        description: '推荐人输入框',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      submitButton: {
        primary: 'button',
        textContent: '推荐并进入用人部门筛选',
        description: '提交推荐按钮',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      },

      tagElement: {
        primary: '.sd-Tag-text-2F-n3, .sd-Tag-container-3G3Yk, [class*="Tag-text"], [class*="Tag-container"]',
        description: '标签元素',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      },

      dropdownContainer: {
        primary: '.sd-Dropdown-container-2K__m, [class*="Dropdown-container"]',
        description: '下拉容器',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      },

      primaryButton: {
        primary: 'button.sd-Button-primary-2asGu.sd-Button-lg-DhBhW',
        description: '主要按钮',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      }
    },

    pagination: {
      pageButton: {
        primary: '.sd-Pagination-item-3TlyN[data-page]',
        description: '分页按钮',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      },

      nextButton: {
        primary: '.sd-Pagination-forward-Qh_cN',
        fallback: '[class*="Pagination-forward"], button[class*="next"]',
        description: '下一页按钮',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      },

      activePageButton: {
        primary: '.sd-Pagination-is-active-1Dck9',
        fallback: ['.sd-Pagination-itemActive-1D0_0', '.active'],
        description: '当前页按钮',
        lastUpdated: '2026-02-24',
        riskLevel: 'high'
      }
    },

    infiniteScroll: {
      container: {
        primary: '.candidate-main__infinite-scroll, .item-NpfQ8Ve_W4',
        description: '无限滚动容器',
        lastUpdated: '2026-02-24',
        riskLevel: 'medium'
      }
    }
  };

  const SelectorChangeLog = [
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

  function getSelector(category, type) {
    type = type || 'primary';
    var parts = category.split('.');
    var selector = Selectors;
    
    for (var i = 0; i < parts.length; i++) {
      selector = selector[parts[i]];
      if (!selector) {
        console.warn('[MokaSelectors] Selector not found: ' + category);
        return null;
      }
    }
    
    return selector[type] || selector.primary;
  }

  function getSelectorWithFallback(category) {
    var parts = category.split('.');
    var selector = Selectors;
    
    for (var i = 0; i < parts.length; i++) {
      selector = selector[parts[i]];
      if (!selector) {
        console.warn('[MokaSelectors] Selector not found: ' + category);
        return null;
      }
    }
    
    if (typeof selector === 'string') {
      return [selector];
    }
    
    var selectors = [selector.primary];
    if (selector.fallback) {
      if (Array.isArray(selector.fallback)) {
        selectors = selectors.concat(selector.fallback);
      } else {
        selectors.push(selector.fallback);
      }
    }
    
    return selectors;
  }

  function queryWithFallback(category, context) {
    context = context || document;
    var selectors = getSelectorWithFallback(category);
    if (!selectors) return null;
    
    for (var i = 0; i < selectors.length; i++) {
      try {
        var element = context.querySelector(selectors[i]);
        if (element) return element;
      } catch (e) {
        console.warn('[MokaSelectors] Invalid selector: ' + selectors[i], e);
      }
    }
    
    return null;
  }

  function queryAllWithFallback(category, context) {
    context = context || document;
    var selectors = getSelectorWithFallback(category);
    if (!selectors) return [];
    
    for (var i = 0; i < selectors.length; i++) {
      try {
        var elements = context.querySelectorAll(selectors[i]);
        if (elements.length > 0) return elements;
      } catch (e) {
        console.warn('[MokaSelectors] Invalid selector: ' + selectors[i], e);
      }
    }
    
    return [];
  }

  function validateSelector(selector) {
    try {
      document.querySelector(selector);
      return true;
    } catch (e) {
      console.error('[MokaSelectors] Invalid selector: ' + selector, e);
      return false;
    }
  }

  return {
    Selectors: Selectors,
    SelectorChangeLog: SelectorChangeLog,
    getSelector: getSelector,
    getSelectorWithFallback: getSelectorWithFallback,
    queryWithFallback: queryWithFallback,
    queryAllWithFallback: queryAllWithFallback,
    validateSelector: validateSelector
  };
})();

if (typeof window !== 'undefined') {
  window.MokaSelectors = MokaSelectors;
}
