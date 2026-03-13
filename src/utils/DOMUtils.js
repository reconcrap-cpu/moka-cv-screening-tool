/**
 * DOM操作工具模块
 * 
 * 提供DOM元素查找、操作、事件处理等工具函数
 * 集成选择器配置模块，支持主备选择器自动降级
 */

var MokaDOMUtils = (function() {
  function querySelector(category, context) {
    context = context || document;
    
    if (typeof MokaSelectors === 'undefined') {
      console.warn('[DOMUtils] MokaSelectors not loaded, using direct selector');
      if (typeof category === 'string' && category.startsWith('.')) {
        return context.querySelector(category);
      }
      return null;
    }
    
    return MokaSelectors.queryWithFallback(category, context);
  }

  function querySelectorAll(category, context) {
    context = context || document;
    
    if (typeof MokaSelectors === 'undefined') {
      console.warn('[DOMUtils] MokaSelectors not loaded, using direct selector');
      if (typeof category === 'string' && category.startsWith('.')) {
        return context.querySelectorAll(category);
      }
      return [];
    }
    
    return MokaSelectors.queryAllWithFallback(category, context);
  }

  function waitForElement(selector, options) {
    options = options || {};
    var timeout = options.timeout || 10000;
    var interval = options.interval || 100;
    var context = options.context || document;
    
    return new Promise(function(resolve, reject) {
      var startTime = Date.now();
      
      function check() {
        var element;
        if (typeof selector === 'string') {
          if (typeof MokaSelectors !== 'undefined') {
            element = MokaSelectors.queryWithFallback(selector, context);
          } else {
            element = context.querySelector(selector);
          }
        } else {
          element = selector();
        }
        
        if (element) {
          resolve(element);
          return;
        }
        
        if (Date.now() - startTime >= timeout) {
          reject(new Error('Element not found within timeout: ' + selector));
          return;
        }
        
        setTimeout(check, interval);
      }
      
      check();
    });
  }

  function waitForElements(selector, options) {
    options = options || {};
    var timeout = options.timeout || 10000;
    var interval = options.interval || 100;
    var minCount = options.minCount || 1;
    var context = options.context || document;
    
    return new Promise(function(resolve, reject) {
      var startTime = Date.now();
      
      function check() {
        var elements;
        if (typeof selector === 'string') {
          if (typeof MokaSelectors !== 'undefined') {
            elements = MokaSelectors.queryAllWithFallback(selector, context);
          } else {
            elements = context.querySelectorAll(selector);
          }
        } else {
          elements = selector();
        }
        
        if (elements && elements.length >= minCount) {
          resolve(elements);
          return;
        }
        
        if (Date.now() - startTime >= timeout) {
          reject(new Error('Elements not found within timeout: ' + selector));
          return;
        }
        
        setTimeout(check, interval);
      }
      
      check();
    });
  }

  function clickElement(element, options) {
    options = options || {};
    
    if (!element) {
      return false;
    }
    
    try {
      if (options.scrollIntoView !== false) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      if (options.delay) {
        return new Promise(function(resolve) {
          setTimeout(function() {
            element.click();
            resolve(true);
          }, options.delay);
        });
      }
      
      element.click();
      return true;
    } catch (e) {
      console.error('[DOMUtils] Click failed:', e);
      return false;
    }
  }

  function getTextContent(element, options) {
    options = options || {};
    
    if (!element) {
      return options.defaultValue || '';
    }
    
    var text = element.textContent || '';
    
    if (options.trim !== false) {
      text = text.trim();
    }
    
    if (options.removeExtraSpaces) {
      text = text.replace(/\s+/g, ' ');
    }
    
    return text;
  }

  function getAttributeValue(element, attribute) {
    if (!element || !attribute) {
      return null;
    }
    
    return element.getAttribute(attribute);
  }

  function findParent(element, selector) {
    if (!element || !selector) {
      return null;
    }
    
    var current = element.parentElement;
    
    while (current) {
      if (current.matches && current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  function findClosest(element, selector) {
    if (!element) {
      return null;
    }
    
    if (element.closest) {
      return element.closest(selector);
    }
    
    return findParent(element, selector);
  }

  function isVisible(element) {
    if (!element) {
      return false;
    }
    
    var style = window.getComputedStyle(element);
    
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  function scrollToElement(element, options) {
    options = options || {};
    
    if (!element) {
      return false;
    }
    
    var behavior = options.behavior || 'smooth';
    var block = options.block || 'center';
    
    element.scrollIntoView({ behavior: behavior, block: block });
    return true;
  }

  function scrollToBottom(container) {
    container = container || document.documentElement;
    
    if (container === document.documentElement) {
      window.scrollTo(0, document.documentElement.scrollHeight);
    } else {
      container.scrollTop = container.scrollHeight;
    }
    
    return true;
  }

  function simulateInput(element, value, options) {
    options = options || {};
    
    if (!element) {
      return false;
    }
    
    element.focus();
    
    if (options.clear !== false) {
      element.value = '';
    }
    
    if (options.charByChar) {
      return new Promise(function(resolve) {
        var chars = value.split('');
        var index = 0;
        
        function typeChar() {
          if (index < chars.length) {
            element.value += chars[index];
            element.dispatchEvent(new Event('input', { bubbles: true }));
            index++;
            setTimeout(typeChar, options.charDelay || 50);
          } else {
            resolve(true);
          }
        }
        
        typeChar();
      });
    }
    
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  function simulateKeyPress(element, key, options) {
    options = options || {};
    
    if (!element) {
      return false;
    }
    
    var keyCode = options.keyCode || key.charCodeAt(0);
    
    var keydownEvent = new KeyboardEvent('keydown', {
      key: key,
      code: key,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true
    });
    
    var keyupEvent = new KeyboardEvent('keyup', {
      key: key,
      code: key,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true
    });
    
    element.dispatchEvent(keydownEvent);
    element.dispatchEvent(keyupEvent);
    
    return true;
  }

  function extractTextByPattern(text, pattern, groupIndex) {
    groupIndex = groupIndex || 1;
    
    if (!text || !pattern) {
      return null;
    }
    
    var match = text.match(pattern);
    
    if (match && match[groupIndex]) {
      return match[groupIndex];
    }
    
    return null;
  }

  function parseDelimitedText(text, delimiter) {
    delimiter = delimiter || '|';
    
    if (!text) {
      return [];
    }
    
    return text.split(delimiter).map(function(part) {
      return part.trim();
    }).filter(function(part) {
      return part.length > 0;
    });
  }

  return {
    querySelector: querySelector,
    querySelectorAll: querySelectorAll,
    waitForElement: waitForElement,
    waitForElements: waitForElements,
    clickElement: clickElement,
    getTextContent: getTextContent,
    getAttributeValue: getAttributeValue,
    findParent: findParent,
    findClosest: findClosest,
    isVisible: isVisible,
    scrollToElement: scrollToElement,
    scrollToBottom: scrollToBottom,
    simulateInput: simulateInput,
    simulateKeyPress: simulateKeyPress,
    extractTextByPattern: extractTextByPattern,
    parseDelimitedText: parseDelimitedText
  };
})();

if (typeof window !== 'undefined') {
  window.MokaDOMUtils = MokaDOMUtils;
}
