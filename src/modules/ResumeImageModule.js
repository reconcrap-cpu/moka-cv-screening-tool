/**
 * 简历图片模块
 * 
 * 负责从Moka候选人详情页提取简历图片
 * 支持多种格式：blob URL、普通图片、SVG、HTML简历
 */

var MokaResumeImageModule = (function() {
  function captureResume() {
    MokaLogger.info('开始获取简历图片...');
    
    return captureResumeImages()
      .then(function(urls) {
        if (urls && urls.length > 0) {
          MokaLogger.success('成功获取 ' + urls.length + ' 张简历图片');
          return urls;
        }
        
        MokaLogger.error('未能找到任何有效的简历图片');
        return null;
      })
      .catch(function(err) {
        MokaLogger.error('获取简历图片失败: ' + err.message);
        return null;
      });
  }

  function captureResumeImages() {
    return tryBlobImages()
      .then(function(result) {
        if (result && result.length > 0) return result;
        return tryPageImages();
      })
      .then(function(result) {
        if (result && result.length > 0) return result;
        return tryIframeResume();
      })
      .then(function(result) {
        if (result && result.length > 0) return result;
        return tryOtherImages();
      });
  }

  function tryBlobImages() {
    var imgBlobElements = MokaDOMUtils.querySelectorAll('resumeImages.imgBlob');
    
    if (!imgBlobElements || imgBlobElements.length === 0) {
      return Promise.resolve(null);
    }
    
    MokaLogger.info('找到 ' + imgBlobElements.length + ' 个 blob 图片元素');
    
    var promises = Array.from(imgBlobElements).map(function(img, index) {
      return processBlobImage(img, index);
    });
    
    return Promise.all(promises)
      .then(function(results) {
        var validUrls = results.filter(function(url) { return url !== null; });
        return validUrls.length > 0 ? validUrls : null;
      });
  }

  function processBlobImage(img, index) {
    return new Promise(function(resolve) {
      if (!img.src) {
        resolve(null);
        return;
      }
      
      if (img.src.startsWith('data:image') || img.src.startsWith('http')) {
        resolve(img.src);
        return;
      }
      
      if (!img.src.startsWith('blob:')) {
        resolve(null);
        return;
      }
      
      blobToDataURL(img.src)
        .then(function(dataUrl) {
          if (dataUrl && dataUrl.startsWith('data:image')) {
            MokaLogger.success('第 ' + (index + 1) + ' 张 blob 图片转换成功');
            resolve(dataUrl);
          } else {
            MokaLogger.warning('第 ' + (index + 1) + ' 张 blob 图片转换后格式不正确');
            resolve(null);
          }
        })
        .catch(function(err) {
          MokaLogger.error('第 ' + (index + 1) + ' 张 blob 图片转换失败: ' + err.message);
          resolve(null);
        });
    });
  }

  function blobToDataURL(blobUrl) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', blobUrl, true);
      xhr.responseType = 'blob';
      xhr.timeout = 30000;
      
      xhr.onload = function() {
        if (this.status === 200) {
          var blob = this.response;
          var reader = new FileReader();
          
          reader.onloadend = function() {
            var result = reader.result;
            
            if (result && result.startsWith('data:')) {
              var fixedResult = fixMimeType(result, blob);
              resolve(fixedResult);
            } else {
              reject(new Error('转换后的URL不是有效的data URL格式'));
            }
          };
          
          reader.onerror = function(e) {
            reject(new Error('FileReader读取失败: ' + e.message));
          };
          
          reader.readAsDataURL(blob);
        } else {
          reject(new Error('获取blob失败，状态码: ' + this.status));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('XHR请求失败'));
      };
      
      xhr.ontimeout = function() {
        reject(new Error('XHR请求超时'));
      };
      
      xhr.send();
    });
  }

  function fixMimeType(result, blob) {
    if (blob.type && blob.type.startsWith('image/')) {
      return result;
    }
    
    var base64Content = result.split(',')[1];
    
    if (!base64Content) {
      return result;
    }
    
    if (base64Content.startsWith('/9j/')) {
      return result.replace('data:text/plain;base64,', 'data:image/jpeg;base64,')
                   .replace('data:application/octet-stream;base64,', 'data:image/jpeg;base64,');
    }
    
    if (base64Content.startsWith('iVBORw0KGgo')) {
      return result.replace('data:text/plain;base64,', 'data:image/png;base64,')
                   .replace('data:application/octet-stream;base64,', 'data:image/png;base64,');
    }
    
    if (base64Content.startsWith('R0lGOD')) {
      return result.replace('data:text/plain;base64,', 'data:image/gif;base64,')
                   .replace('data:application/octet-stream;base64,', 'data:image/gif;base64,');
    }
    
    if (base64Content.startsWith('UklGR')) {
      return result.replace('data:text/plain;base64,', 'data:image/webp;base64,')
                   .replace('data:application/octet-stream;base64,', 'data:image/webp;base64,');
    }
    
    return result;
  }

  function tryPageImages() {
    // 支持多种简历图片格式：
    // 1. .img-page - 主要格式
    // 2. .resume-XXXXX - 动态类名格式（如 .resume-2IjJ_）
    // 3. img[src*="pdf_"] - PDF转换的图片
    var imgPageElements = document.querySelectorAll('.img-page, img[src*="pdf_"]');
    
    // 查找所有带 resume- 前缀类名的图片
    var allImages = document.querySelectorAll('img');
    var resumeImages = [];
    for (var i = 0; i < allImages.length; i++) {
      var img = allImages[i];
      if (img.className && (
        img.className.indexOf('resume-') === 0 ||
        img.className.indexOf(' resume-') !== -1
      )) {
        resumeImages.push(img);
      }
    }
    
    // 合并所有简历图片
    var allResumeElements = Array.from(imgPageElements).concat(resumeImages);
    
    if (!allResumeElements || allResumeElements.length === 0) {
      return Promise.resolve(null);
    }
    
    MokaLogger.info('找到 ' + allResumeElements.length + ' 个简历图片元素');
    
    var validUrls = [];
    
    for (var j = 0; j < allResumeElements.length; j++) {
      var img2 = allResumeElements[j];
      
      if (img2.src) {
        if (img2.src.startsWith('data:image') || img2.src.startsWith('http')) {
          validUrls.push(img2.src);
        } else if (img2.src.startsWith('blob:')) {
          // 将在后面处理
        }
      }
    }
    
    return Promise.resolve(validUrls.length > 0 ? validUrls : null);
  }

  function tryIframeResume() {
    var iframeResume = document.getElementById('iframeResume');
    
    if (!iframeResume) {
      return Promise.resolve(null);
    }
    
    MokaLogger.info('检测到 iframe 简历，尝试提取...');
    
    try {
      var iframeDoc = iframeResume.contentDocument || iframeResume.contentWindow.document;
      
      // 优先检测 SVG 格式简历（.word-page svg 或直接 svg）
      var svgElement = iframeDoc.querySelector('.word-page svg') || iframeDoc.querySelector('svg');
      
      if (svgElement) {
        return svgToPngBase64(svgElement)
          .then(function(pngBase64) {
            MokaLogger.success('SVG 转 PNG 成功');
            return [pngBase64];
          })
          .catch(function(err) {
            MokaLogger.error('SVG 转 PNG 失败: ' + err.message);
            return tryIframeHtml(iframeDoc);
          });
      }
      
      // 检测 .word-page 容器（可能包含其他格式）
      var wordPage = iframeDoc.querySelector('.word-page');
      if (wordPage) {
        MokaLogger.info('检测到 .word-page 容器');
        // 尝试将整个容器转为图片
        if (typeof html2canvas !== 'undefined') {
          return html2canvas(wordPage, {
            backgroundColor: '#FFFFFF',
            scale: 2,
            useCORS: true,
            allowTaint: true
          }).then(function(canvas) {
            var dataUrl = canvas.toDataURL('image/png');
            MokaLogger.success('word-page 截图成功');
            return [dataUrl];
          }).catch(function(err) {
            MokaLogger.error('word-page 截图失败: ' + err.message);
            return tryIframeHtml(iframeDoc);
          });
        }
      }
      
      return tryIframeHtml(iframeDoc);
    } catch (e) {
      MokaLogger.error('访问 iframe 失败: ' + e.message);
      return Promise.resolve(null);
    }
  }

  function tryIframeHtml(iframeDoc) {
    var structuredResume = iframeDoc.querySelector('.flexAlignStart--o1K7u, .content--j99Ec, .cardLeft--IcRB1, #water-mark-wrap, .cardLeft--ZsR4w, .board--CYPTx');
    
    if (structuredResume && typeof html2canvas !== 'undefined') {
      return html2canvas(structuredResume, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
        allowTaint: true
      }).then(function(canvas) {
        var dataUrl = canvas.toDataURL('image/png');
        MokaLogger.success('html2canvas 截图成功');
        return [dataUrl];
      }).catch(function(err) {
        MokaLogger.error('html2canvas 失败: ' + err.message);
        return null;
      });
    }
    
    return Promise.resolve(null);
  }

  function svgToPngBase64(svgElement) {
    return new Promise(function(resolve, reject) {
      try {
        var rect = svgElement.getBoundingClientRect();
        var width = rect.width || parseInt(svgElement.getAttribute('width')) || 800;
        var height = Math.min(rect.height || parseInt(svgElement.getAttribute('height')) || 1000, 3000);
        
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        var svgData = new XMLSerializer().serializeToString(svgElement);
        var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(svgBlob);
        
        var img = new Image();
        
        img.onload = function() {
          try {
            ctx.drawImage(img, 0, 0, width, height);
            var pngBase64 = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            
            if (pngBase64 && pngBase64.startsWith('data:image/png')) {
              resolve(pngBase64);
            } else {
              reject(new Error('Canvas 导出格式不正确'));
            }
          } catch (e) {
            reject(new Error('Canvas 绘制失败: ' + e.message));
          }
        };
        
        img.onerror = function() {
          URL.revokeObjectURL(url);
          reject(new Error('SVG 图片加载失败'));
        };
        
        img.src = url;
      } catch (e) {
        reject(new Error('SVG 转 PNG 失败: ' + e.message));
      }
    });
  }

  function tryOtherImages() {
    var allImages = document.querySelectorAll('img');
    var possibleResumeImages = [];
    
    for (var i = 0; i < allImages.length; i++) {
      var img = allImages[i];
      
      if (img.src && (
        img.src.indexOf('resume') !== -1 ||
        img.src.indexOf('cv') !== -1 ||
        img.src.indexOf('pdf') !== -1 ||
        img.className.indexOf('resume') !== -1 ||
        img.className.indexOf('cv') !== -1
      )) {
        possibleResumeImages.push(img);
      }
    }
    
    if (possibleResumeImages.length === 0) {
      return Promise.resolve(null);
    }
    
    MokaLogger.info('找到 ' + possibleResumeImages.length + ' 个可能的简历图片');
    
    var validUrls = [];
    
    for (var j = 0; j < possibleResumeImages.length; j++) {
      var img2 = possibleResumeImages[j];
      
      if (img2.src.startsWith('data:image') || img2.src.startsWith('http')) {
        validUrls.push(img2.src);
      }
    }
    
    return Promise.resolve(validUrls.length > 0 ? validUrls : null);
  }

  return {
    captureResume: captureResume,
    blobToDataURL: blobToDataURL,
    svgToPngBase64: svgToPngBase64
  };
})();

if (typeof window !== 'undefined') {
  window.MokaResumeImageModule = MokaResumeImageModule;
}
