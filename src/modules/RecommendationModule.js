/**
 * 推荐功能模块
 * 
 * 负责将候选人推荐给用人部门
 */

var MokaRecommendationModule = (function() {
  function recommendToTeam(recommendToNames) {
    try {
      var cleanedInput = recommendToNames.replace(/\s+/g, '');
      var names = cleanedInput.split(/[,，]/).filter(function(n) { return n; });
      
      if (names.length === 0) {
        return Promise.resolve({ success: false, message: '未指定推荐人' });
      }
      
      return findAndClickRecommendButton()
        .then(function(result) {
          if (!result.success) {
            return result;
          }
          
          return inputRecommendNames(names);
        })
        .then(function(result) {
          if (!result.success) {
            return result;
          }
          
          return clickSubmitButton();
        });
    } catch (error) {
      return Promise.resolve({ success: false, message: error.message });
    }
  }

  function findAndClickRecommendButton() {
    return new Promise(function(resolve) {
      var recommendBtn = MokaDOMUtils.querySelector('recommendation.recommendButton');
      
      if (!recommendBtn) {
        var allButtons = document.querySelectorAll('button');
        
        for (var i = 0; i < allButtons.length; i++) {
          var btn = allButtons[i];
          if (MokaDOMUtils.getTextContent(btn) === '推荐给用人部门') {
            recommendBtn = btn;
            break;
          }
        }
      }
      
      if (!recommendBtn) {
        resolve({ success: false, message: '未找到推荐按钮', noRecommendButton: true });
        return;
      }
      
      MokaDOMUtils.clickElement(recommendBtn);
      
      setTimeout(function() {
        resolve({ success: true });
      }, 2000);
    });
  }

  function inputRecommendNames(names) {
    return new Promise(function(resolve) {
      var currentIndex = 0;
      
      function inputNextName() {
        if (currentIndex >= names.length) {
          resolve({ success: true });
          return;
        }
        
        var name = names[currentIndex];
        MokaLogger.info('正在输入第 ' + (currentIndex + 1) + '/' + names.length + ' 人: ' + name);
        
        findRecommendInput()
          .then(function(input) {
            if (!input) {
              resolve({ success: false, message: '未找到推荐输入框' });
              return;
            }
            
            return fillInput(input, name);
          })
          .then(function(result) {
            if (!result.success) {
              resolve(result);
              return;
            }
            
            return verifyInput(name);
          })
          .then(function(result) {
            if (!result.success) {
              resolve(result);
              return;
            }
            
            currentIndex++;
            setTimeout(inputNextName, 1000);
          });
      }
      
      inputNextName();
    });
  }

  function findRecommendInput() {
    return new Promise(function(resolve) {
      var input = null;
      
      var allElements = document.querySelectorAll('*');
      for (var i = 0; i < allElements.length; i++) {
        var el = allElements[i];
        if (MokaDOMUtils.getTextContent(el) === '推荐到') {
          var parent = el.parentElement;
          var depth = 0;
          
          while (parent && depth < 10) {
            var inputs = parent.querySelectorAll('input[type="text"]');
            
            for (var j = 0; j < inputs.length; j++) {
              var inp = inputs[j];
              if (inp.className && inp.className.indexOf('tag-input') !== -1) {
                input = inp;
                break;
              }
            }
            
            if (input) break;
            parent = parent.parentElement;
            depth++;
          }
          
          if (input) break;
        }
      }
      
      if (!input) {
        var tagInputs = document.querySelectorAll('input.sd-Input-tag-input-2XNg5');
        
        for (var k = 0; k < tagInputs.length; k++) {
          var inp2 = tagInputs[k];
          var rect = inp2.getBoundingClientRect();
          
          if (rect.width > 0 && rect.height > 0 && rect.top < 400) {
            if (!inp2.placeholder || inp2.placeholder.indexOf('抄送') === -1) {
              input = inp2;
              break;
            }
          }
        }
      }
      
      if (!input) {
        input = document.querySelector('input[placeholder="输入邮箱或选择账号"]');
      }
      
      resolve(input);
    });
  }

  function fillInput(input, name) {
    return new Promise(function(resolve) {
      input.focus();
      input.click();
      
      setTimeout(function() {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(function() {
          MokaDOMUtils.simulateInput(input, name, { charByChar: true, charDelay: 100 })
            .then(function() {
              setTimeout(function() {
                MokaDOMUtils.simulateKeyPress(input, 'Enter');
                
                setTimeout(function() {
                  resolve({ success: true });
                }, 2000);
              }, 1500);
            });
        }, 300);
      }, 500);
    });
  }

  function verifyInput(name) {
    return new Promise(function(resolve) {
      var tagElements = MokaDOMUtils.querySelectorAll('recommendation.tagElement');
      var foundTag = false;
      
      if (tagElements && tagElements.length > 0) {
        for (var i = 0; i < tagElements.length; i++) {
          var tag = tagElements[i];
          if (MokaDOMUtils.getTextContent(tag) === name) {
            foundTag = true;
            break;
          }
        }
      }
      
      if (foundTag) {
        MokaLogger.success('成功添加: ' + name);
        resolve({ success: true });
      } else {
        resolve({ success: false, message: '输入框中显示的名字与输入不一致，期望: ' + name });
      }
    });
  }

  function clickSubmitButton() {
    return new Promise(function(resolve) {
      var submitBtn = null;
      
      var allButtons = document.querySelectorAll('button');
      for (var i = 0; i < allButtons.length; i++) {
        var btn = allButtons[i];
        var btnText = MokaDOMUtils.getTextContent(btn);
        
        if (btnText === '推荐并进入用人部门筛选') {
          submitBtn = btn;
          break;
        }
      }
      
      if (!submitBtn) {
        var dropdownContainer = MokaDOMUtils.querySelector('recommendation.dropdownContainer');
        
        if (dropdownContainer) {
          var buttons = dropdownContainer.querySelectorAll('button');
          
          for (var j = 0; j < buttons.length; j++) {
            var btn2 = buttons[j];
            var btnText2 = MokaDOMUtils.getTextContent(btn2);
            
            if (btnText2 === '推荐并进入用人部门筛选') {
              submitBtn = btn2;
              break;
            }
          }
        }
      }
      
      if (!submitBtn) {
        var primaryButtons = MokaDOMUtils.querySelectorAll('recommendation.primaryButton');
        
        if (primaryButtons && primaryButtons.length > 0) {
          for (var k = 0; k < primaryButtons.length; k++) {
            var btn3 = primaryButtons[k];
            var btnText3 = MokaDOMUtils.getTextContent(btn3);
            
            if (btnText3.indexOf('推荐并进入') !== -1) {
              submitBtn = btn3;
              break;
            }
          }
        }
      }
      
      if (!submitBtn) {
        resolve({ success: false, message: '未找到提交按钮' });
        return;
      }
      
      if (submitBtn.disabled) {
        resolve({ success: false, message: '提交按钮被禁用' });
        return;
      }
      
      MokaDOMUtils.scrollToElement(submitBtn);
      
      setTimeout(function() {
        MokaDOMUtils.clickElement(submitBtn);
        
        setTimeout(function() {
          MokaLogger.success('推荐成功');
          resolve({ success: true });
        }, 3000);
      }, 500);
    });
  }

  return {
    recommendToTeam: recommendToTeam,
    findAndClickRecommendButton: findAndClickRecommendButton,
    inputRecommendNames: inputRecommendNames,
    clickSubmitButton: clickSubmitButton
  };
})();

if (typeof window !== 'undefined') {
  window.MokaRecommendationModule = MokaRecommendationModule;
}
