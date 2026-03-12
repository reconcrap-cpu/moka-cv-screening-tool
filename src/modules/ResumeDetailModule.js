/**
 * 简历详情模块
 * 
 * 负责从Moka候选人详情页提取联系方式和状态信息
 */

var MokaResumeDetailModule = (function() {
  function extractContactInfo() {
    var phone = '';
    var email = '';
    
    var mobileIcon = MokaDOMUtils.querySelector('resumeDetail.phoneIcon');
    
    if (mobileIcon) {
      var mobileContainer = MokaDOMUtils.findClosest(mobileIcon, '.sd-Spacing-spacing-inline-3qXs9, .candidate-header-info-item-iIpckHaTor, .sd-Dropdown-container-2K__m');
      
      if (mobileContainer) {
        var phoneText = MokaDOMUtils.getTextContent(mobileContainer);
        var phoneMatch = phoneText.match(/(\+?\d[\d\s-]{7,}\d)/);
        
        if (phoneMatch) {
          phone = phoneMatch[1].replace(/\s/g, '');
        }
      }
    }
    
    var emailIcon = MokaDOMUtils.querySelector('resumeDetail.emailIcon');
    
    if (emailIcon) {
      var emailContainer = MokaDOMUtils.findClosest(emailIcon, '.sd-Spacing-spacing-inline-3qXs9, .candidate-header-info-item-iIpckHaTor, .sd-Dropdown-container-2K__m');
      
      if (emailContainer) {
        var emailLink = emailContainer.querySelector('a[href^="mailto:"]');
        
        if (emailLink) {
          email = MokaDOMUtils.getTextContent(emailLink);
        } else {
          var emailText = MokaDOMUtils.getTextContent(emailContainer);
          var emailMatch = emailText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          
          if (emailMatch) {
            email = emailMatch[0];
          }
        }
      }
    }
    
    return {
      phone: phone,
      email: email
    };
  }

  function isCandidateLocked() {
    var lockedIndicator = MokaDOMUtils.querySelector('resumeDetail.lockedIndicator');
    
    if (lockedIndicator) {
      var text = MokaDOMUtils.getTextContent(lockedIndicator);
      return text.indexOf('候选人被锁定') !== -1;
    }
    
    return false;
  }

  function getDetailUrl() {
    return window.location.href;
  }

  function goBack() {
    window.history.back();
    return true;
  }

  function waitForDetailPage(timeout) {
    timeout = timeout || 5000;
    
    return MokaDOMUtils.waitForElement('.candidate-actions__header, .candidate-header-info-item-iIpckHaTor', {
      timeout: timeout
    }).then(function() {
      return true;
    }).catch(function() {
      return false;
    });
  }

  function extractAllDetails() {
    var contactInfo = extractContactInfo();
    var isLocked = isCandidateLocked();
    var detailUrl = getDetailUrl();
    
    return {
      phone: contactInfo.phone,
      email: contactInfo.email,
      isLocked: isLocked,
      detailUrl: detailUrl
    };
  }

  return {
    extractContactInfo: extractContactInfo,
    isCandidateLocked: isCandidateLocked,
    getDetailUrl: getDetailUrl,
    goBack: goBack,
    waitForDetailPage: waitForDetailPage,
    extractAllDetails: extractAllDetails
  };
})();

if (typeof window !== 'undefined') {
  window.MokaResumeDetailModule = MokaResumeDetailModule;
}
