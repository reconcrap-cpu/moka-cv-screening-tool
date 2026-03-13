/**
 * 候选人列表模块
 * 
 * 负责从Moka候选人列表页面提取候选人信息
 * 支持分页模式和无限滚动模式
 */

var MokaCandidateListModule = (function() {
  var pageType = null;

  function detectPageType() {
    var hasPagination = MokaDOMUtils.querySelector('pagination.nextButton');
    var hasInfiniteScroll = MokaDOMUtils.querySelector('infiniteScroll.container');
    
    if (hasInfiniteScroll && !hasPagination) {
      pageType = 'infinite-scroll';
      return 'infinite-scroll';
    }
    
    pageType = 'pagination';
    return 'pagination';
  }

  function getPageType() {
    if (!pageType) {
      detectPageType();
    }
    return pageType;
  }

  function extractCandidates() {
    var type = getPageType();
    
    if (type === 'infinite-scroll') {
      return extractCandidatesInfiniteScroll();
    }
    
    return extractCandidatesPagination();
  }

  function extractCandidatesPagination() {
    var candidates = [];
    
    var containers = MokaDOMUtils.querySelectorAll('candidateList.pagination');
    
    if (!containers || containers.length === 0) {
      MokaLogger.warning('未找到候选人容器');
      return candidates;
    }
    
    containers.forEach(function(container, index) {
      var candidate = extractCandidateFromContainer(container, index);
      
      if (candidate && candidate.name !== '未知') {
        candidates.push(candidate);
      }
    });
    
    MokaLogger.info('分页模式提取到 ' + candidates.length + ' 位候选人');
    return candidates;
  }

  function extractCandidatesInfiniteScroll() {
    var candidates = [];
    
    var items = MokaDOMUtils.querySelectorAll('candidateList.infiniteScroll');
    
    if (!items || items.length === 0) {
      MokaLogger.warning('未找到候选人表格行');
      return candidates;
    }
    
    items.forEach(function(item, index) {
      var candidate = extractCandidateFromTableRow(item, index);
      
      if (candidate && candidate.name !== '未知') {
        candidates.push(candidate);
      }
    });
    
    MokaLogger.info('无限滚动模式提取到 ' + candidates.length + ' 位候选人');
    return candidates;
  }

  function extractCandidateFromContainer(container, index) {
    var candidate = {
      id: container.id || 'candidate_' + Date.now() + '_' + index,
      elementRef: container,
      name: '未知',
      school: '未知',
      major: '未知',
      education: '未知',
      graduationYear: '未知'
    };
    
    var nameElement = MokaDOMUtils.querySelector('candidateInfo.name.pagination', container);
    if (nameElement) {
      candidate.name = MokaDOMUtils.getTextContent(nameElement);
    }
    
    var eduParentElement = MokaDOMUtils.querySelector('candidateInfo.educationIcon', container);
    
    if (eduParentElement) {
      var eduContainer = MokaDOMUtils.findClosest(eduParentElement, '.sd-Spacing-spacing-inline-3qXs9');
      
      if (eduContainer) {
        var eduElement = MokaDOMUtils.querySelector('candidateInfo.educationInline', eduContainer);
        
        if (!eduElement) {
          eduElement = eduContainer;
        }
        
        if (eduElement) {
          var eduText = MokaDOMUtils.getTextContent(eduElement);
          parseEducationInfo(candidate, eduText);
        }
      }
    }
    
    return candidate;
  }

  function extractCandidateFromTableRow(row, index) {
    var candidate = {
      id: row.id || 'candidate_' + Date.now() + '_' + index,
      elementRef: row,
      name: '未知',
      school: '未知',
      major: '未知',
      education: '未知',
      graduationYear: '未知'
    };
    
    var nameElement = MokaDOMUtils.querySelector('candidateInfo.name.infiniteScroll', row);
    if (nameElement) {
      var nameText = MokaDOMUtils.getTextContent(nameElement);
      var nameMatch = nameText.match(/^[\u4e00-\u9fa5]+/);
      if (nameMatch) {
        candidate.name = nameMatch[0];
      }
    }
    
    var listItems = MokaDOMUtils.querySelectorAll('candidateInfo.listItem', row);
    
    if (listItems && listItems.length > 0) {
      listItems.forEach(function(item) {
        var hasEduIcon = MokaDOMUtils.querySelector('candidateInfo.educationIcon', item);
        
        if (hasEduIcon) {
          var splitElements = MokaDOMUtils.querySelectorAll('candidateInfo.splitElement', item);
          
          if (splitElements && splitElements.length >= 3) {
            candidate.school = MokaDOMUtils.getTextContent(splitElements[0]);
            candidate.major = MokaDOMUtils.getTextContent(splitElements[1]);
            candidate.education = MokaDOMUtils.getTextContent(splitElements[2]);
            
            if (splitElements.length >= 4) {
              var yearRange = MokaDOMUtils.getTextContent(splitElements[3]);
              var years = yearRange.match(/\d{4}/g);
              
              if (years && years.length >= 2) {
                candidate.graduationYear = years[1];
              } else if (years && years.length === 1) {
                candidate.graduationYear = years[0];
              }
            }
          } else {
            var eduText = MokaDOMUtils.getTextContent(item);
            parseEducationInfoFromText(candidate, eduText);
          }
        }
      });
    }
    
    return candidate;
  }

  function parseEducationInfo(candidate, text) {
    var parts = MokaDOMUtils.parseDelimitedText(text, '|');
    
    if (parts.length >= 4) {
      candidate.school = parts[0];
      candidate.major = parts[1];
      candidate.education = parts[2];
      
      var yearRange = parts[3];
      var years = yearRange.match(/\d{4}/g);
      
      if (years && years.length >= 2) {
        candidate.graduationYear = years[1];
      } else if (years && years.length === 1) {
        candidate.graduationYear = years[0];
      }
    } else if (parts.length >= 3) {
      candidate.school = parts[0];
      candidate.major = parts[1];
      candidate.education = parts[2];
    }
  }

  function parseEducationInfoFromText(candidate, text) {
    var parts = text.split(/[\s|]+/).filter(function(p) { return p.length > 0; });
    
    if (parts.length >= 4) {
      candidate.school = parts[0];
      candidate.major = parts.slice(1, -2).join(' ');
      candidate.education = parts[parts.length - 2];
      
      var yearRange = parts[parts.length - 1];
      var years = yearRange.match(/\d{4}/g);
      
      if (years && years.length >= 2) {
        candidate.graduationYear = years[1];
      } else if (years && years.length === 1) {
        candidate.graduationYear = years[0];
      }
    }
  }

  function navigateToCandidate(candidate) {
    var type = getPageType();
    
    if (type === 'infinite-scroll') {
      return navigateToCandidateInfiniteScroll(candidate);
    }
    
    return navigateToCandidatePagination(candidate);
  }

  function navigateToCandidatePagination(candidate) {
    if (candidate.elementRef) {
      MokaDOMUtils.clickElement(candidate.elementRef);
      MokaLogger.info('点击候选人卡片进入详情页: ' + candidate.name);
      return true;
    }
    
    var containers = MokaDOMUtils.querySelectorAll('candidateList.pagination');
    
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      var nameElement = MokaDOMUtils.querySelector('candidateInfo.name.pagination', container);
      if (nameElement && MokaDOMUtils.getTextContent(nameElement) === candidate.name) {
        MokaDOMUtils.clickElement(container);
        MokaLogger.info('通过姓名查找并点击候选人卡片: ' + candidate.name);
        return true;
      }
    }
    
    MokaLogger.warning('无法导航到候选人详情页: ' + candidate.name);
    return false;
  }

  function navigateToCandidateInfiniteScroll(candidate) {
    if (candidate.elementRef) {
      MokaDOMUtils.clickElement(candidate.elementRef);
      MokaLogger.info('点击候选人行进入详情页: ' + candidate.name);
      return true;
    }
    
    var items = MokaDOMUtils.querySelectorAll('candidateList.infiniteScroll');
    
    for (var i = 0; i < items.length; i++) {
      var tr = items[i];
      var nameElement = MokaDOMUtils.querySelector('candidateInfo.name.infiniteScroll', tr);
      
      if (nameElement) {
        var nameText = MokaDOMUtils.getTextContent(nameElement);
        var nameMatch = nameText.match(/^[\u4e00-\u9fa5]+/);
        
        if (nameMatch && nameMatch[0] === candidate.name) {
          MokaDOMUtils.clickElement(tr);
          MokaLogger.info('通过姓名查找并点击候选人行: ' + candidate.name);
          return true;
        }
      }
    }
    
    MokaLogger.warning('无法导航到候选人详情页: ' + candidate.name);
    return false;
  }

  return {
    detectPageType: detectPageType,
    getPageType: getPageType,
    extractCandidates: extractCandidates,
    extractCandidatesPagination: extractCandidatesPagination,
    extractCandidatesInfiniteScroll: extractCandidatesInfiniteScroll,
    navigateToCandidate: navigateToCandidate
  };
})();

if (typeof window !== 'undefined') {
  window.MokaCandidateListModule = MokaCandidateListModule;
}
