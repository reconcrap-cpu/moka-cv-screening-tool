/**
 * Moka招聘系统选择器监控工具
 * 
 * 用于检测页面DOM选择器的有效性，当选择器失效时发出警告
 * 帮助开发者及时发现Moka页面结构变化导致的功能异常
 */

var MokaSelectorMonitor = (function() {
  var results = {
    total: 0,
    valid: 0,
    invalid: 0,
    warnings: []
  };

  function checkAllSelectors() {
    if (typeof MokaSelectors === 'undefined') {
      console.error('[SelectorMonitor] MokaSelectors not loaded');
      return { error: 'MokaSelectors not loaded' };
    }

    results = {
      total: 0,
      valid: 0,
      invalid: 0,
      warnings: [],
      timestamp: new Date().toISOString()
    };

    var selectors = MokaSelectors.Selectors;
    traverseSelectors(selectors, '', results);

    console.log('[SelectorMonitor] Check completed:', {
      total: results.total,
      valid: results.valid,
      invalid: results.invalid
    });

    return results;
  }

  function traverseSelectors(obj, path, results) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var currentPath = path ? path + '.' + key : key;
        var value = obj[key];

        if (typeof value === 'string' && isSelectorString(value)) {
          results.total++;
          var testResult = testSelector(value);
          if (testResult.valid) {
            results.valid++;
          } else {
            results.invalid++;
            results.warnings.push({
              path: currentPath,
              selector: value,
              error: testResult.error,
              suggestion: '请检查页面结构是否发生变化'
            });
          }
        } else if (typeof value === 'object' && value !== null) {
          if (value.primary) {
            results.total++;
            var primaryResult = testSelector(value.primary);
            if (primaryResult.valid) {
              results.valid++;
            } else {
              if (value.fallback) {
                var fallbackSelectors = Array.isArray(value.fallback) ? value.fallback : [value.fallback];
                var fallbackValid = false;
                for (var i = 0; i < fallbackSelectors.length; i++) {
                  var fallbackResult = testSelector(fallbackSelectors[i]);
                  if (fallbackResult.valid) {
                    fallbackValid = true;
                    results.valid++;
                    break;
                  }
                }
                if (!fallbackValid) {
                  results.invalid++;
                  results.warnings.push({
                    path: currentPath,
                    selector: value.primary,
                    fallback: value.fallback,
                    error: 'Primary and all fallbacks failed',
                    suggestion: '请检查页面结构是否发生变化'
                  });
                }
              } else {
                results.invalid++;
                results.warnings.push({
                  path: currentPath,
                  selector: value.primary,
                  error: primaryResult.error,
                  suggestion: '请检查页面结构是否发生变化'
                });
              }
            }
          } else {
            traverseSelectors(value, currentPath, results);
          }
        }
      }
    }
  }

  function isSelectorString(str) {
    if (typeof str !== 'string') return false;
    if (str.length === 0) return false;
    if (str.startsWith('http')) return false;
    if (str.startsWith('blob:')) return false;
    if (str.startsWith('data:')) return false;
    return /^[.#\[\w]/.test(str);
  }

  function testSelector(selector) {
    try {
      var elements = document.querySelectorAll(selector);
      return {
        valid: true,
        count: elements.length,
        selector: selector
      };
    } catch (e) {
      return {
        valid: false,
        error: e.message,
        selector: selector
      };
    }
  }

  function generateHealthReport() {
    var checkResult = checkAllSelectors();
    
    var report = {
      timestamp: checkResult.timestamp,
      summary: {
        total: checkResult.total,
        valid: checkResult.valid,
        invalid: checkResult.invalid,
        healthRate: checkResult.total > 0 ? 
          Math.round((checkResult.valid / checkResult.total) * 100) + '%' : 'N/A'
      },
      warnings: checkResult.warnings,
      recommendations: []
    };

    if (checkResult.invalid > 0) {
      report.recommendations.push({
        priority: 'high',
        message: '发现 ' + checkResult.invalid + ' 个选择器失效，请立即检查'
      });
    }

    var highRiskSelectors = checkResult.warnings.filter(function(w) {
      return w.path.indexOf('candidateList') !== -1 || 
             w.path.indexOf('candidateInfo') !== -1;
    });

    if (highRiskSelectors.length > 0) {
      report.recommendations.push({
        priority: 'critical',
        message: '核心功能选择器失效，候选人提取功能可能无法正常工作'
      });
    }

    return report;
  }

  function printReport() {
    var report = generateHealthReport();
    
    console.log('\n========== Moka选择器健康报告 ==========');
    console.log('时间:', report.timestamp);
    console.log('总计:', report.summary.total);
    console.log('有效:', report.summary.valid);
    console.log('失效:', report.summary.invalid);
    console.log('健康率:', report.summary.healthRate);
    
    if (report.warnings.length > 0) {
      console.log('\n--- 失效选择器详情 ---');
      report.warnings.forEach(function(w, i) {
        console.log((i + 1) + '. ' + w.path);
        console.log('   选择器: ' + w.selector);
        console.log('   错误: ' + w.error);
        console.log('   建议: ' + w.suggestion);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n--- 建议 ---');
      report.recommendations.forEach(function(r) {
        console.log('[' + r.priority.toUpperCase() + '] ' + r.message);
      });
    }
    
    console.log('\n========================================\n');
    
    return report;
  }

  function quickCheck(category) {
    if (typeof MokaSelectors === 'undefined') {
      return { error: 'MokaSelectors not loaded' };
    }

    var selector = MokaSelectors.getSelectorWithFallback(category);
    if (!selector) {
      return { error: 'Selector category not found: ' + category };
    }

    var selectors = Array.isArray(selector) ? selector : [selector];
    var results = [];

    for (var i = 0; i < selectors.length; i++) {
      var result = testSelector(selectors[i]);
      results.push({
        selector: selectors[i],
        valid: result.valid,
        count: result.count || 0,
        error: result.error || null
      });
    }

    return {
      category: category,
      results: results,
      hasValid: results.some(function(r) { return r.valid; })
    };
  }

  return {
    checkAllSelectors: checkAllSelectors,
    generateHealthReport: generateHealthReport,
    printReport: printReport,
    quickCheck: quickCheck,
    testSelector: testSelector
  };
})();

if (typeof window !== 'undefined') {
  window.MokaSelectorMonitor = MokaSelectorMonitor;
}
