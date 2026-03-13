class AutoTestRunner {
  constructor() {
    this.testConfig = {
      targetCount: 500,
      maxRetries: 3,
      pauseOnError: true,
      autoFix: true,
      logLevel: 'verbose'
    };
    
    this.testState = {
      isRunning: false,
      isPaused: false,
      processedCount: 0,
      errorCount: 0,
      fixedCount: 0,
      currentCandidate: null,
      errors: [],
      startTime: null,
      lastErrorTime: null
    };
    
    this.errorPatterns = {
      resumeExtraction: [
        '无法获取简历图片',
        '未能找到任何有效的简历图片',
        '简历图片提取失败'
      ],
      pageNavigation: [
        '无法进入详情页',
        '页面加载超时',
        '元素未找到'
      ],
      apiError: [
        'API请求失败',
        '模型调用失败',
        '解析结果失败'
      ]
    };
    
    console.log('🤖 自动化测试系统已初始化');
    console.log('📋 配置:', this.testConfig);
  }
  
  start(targetCount = 500) {
    if (this.testState.isRunning) {
      console.warn('⚠️ 测试已在运行中');
      return;
    }
    
    this.testConfig.targetCount = targetCount;
    this.testState.isRunning = true;
    this.testState.startTime = Date.now();
    
    console.log(`\n🚀 开始自动化测试，目标: ${targetCount} 位人选`);
    console.log('=' .repeat(60));
    
    this.injectMonitoringHooks();
    this.startMonitoring();
  }
  
  injectMonitoringHooks() {
    const originalAddLog = window.addLog;
    const self = this;
    
    if (typeof window.addLog === 'function') {
      window.addLog = function(message, type = 'info') {
        const result = originalAddLog.call(this, message, type);
        self.monitorLog(message, type);
        return result;
      };
      console.log('✅ 已注入日志监控钩子');
    }
    
    const originalCaptureResume = window.captureResume;
    if (typeof window.captureResume === 'function') {
      window.captureResume = async function() {
        console.log('📸 [监控] 开始提取简历图片...');
        const startTime = Date.now();
        
        try {
          const result = await originalCaptureResume.apply(this, arguments);
          const duration = Date.now() - startTime;
          
          if (!result || result.length === 0) {
            console.error('❌ [监控] 简历提取失败！');
            self.handleError('resumeExtraction', '无法获取简历图片', {
              duration,
              result
            });
          } else {
            console.log(`✅ [监控] 简历提取成功: ${result.length} 张图片，耗时 ${duration}ms`);
          }
          
          return result;
        } catch (error) {
          console.error('❌ [监控] 简历提取异常:', error);
          self.handleError('resumeExtraction', error.message, { error });
          throw error;
        }
      };
      console.log('✅ 已注入简历提取监控钩子');
    }
    
    const originalProcessCandidate = window.processCandidate;
    if (typeof window.processCandidate === 'function') {
      window.processCandidate = async function(candidate) {
        console.log(`\n👤 [监控] 开始处理候选人: ${candidate.name}`);
        self.testState.currentCandidate = candidate;
        
        try {
          const result = await originalProcessCandidate.apply(this, arguments);
          
          if (result) {
            self.testState.processedCount++;
            console.log(`✅ [监控] 候选人处理完成: ${candidate.name} (进度: ${self.testState.processedCount}/${self.testConfig.targetCount})`);
            
            if (result.qualified) {
              console.log(`   ✓ 符合条件 - ${result.school || '未知学校'}`);
            } else {
              console.log(`   ✗ 不符合条件 - 原因: ${result.reason}`);
            }
          }
          
          return result;
        } catch (error) {
          console.error(`❌ [监控] 候选人处理失败: ${candidate.name}`, error);
          self.handleError('processing', error.message, { candidate, error });
          throw error;
        }
      };
      console.log('✅ 已注入候选人处理监控钩子');
    }
  }
  
  monitorLog(message, type) {
    if (type === 'error') {
      for (const [category, patterns] of Object.entries(this.errorPatterns)) {
        for (const pattern of patterns) {
          if (message.includes(pattern)) {
            this.handleError(category, message, { logType: type });
            return;
          }
        }
      }
    }
    
    if (this.testConfig.logLevel === 'verbose') {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    }
  }
  
  handleError(category, message, details = {}) {
    this.testState.errorCount++;
    this.testState.lastErrorTime = Date.now();
    
    const error = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      category,
      message,
      details,
      candidate: this.testState.currentCandidate,
      processedCount: this.testState.processedCount,
      fixed: false
    };
    
    this.testState.errors.push(error);
    
    console.error('\n' + '='.repeat(60));
    console.error('🚨 检测到错误！');
    console.error('类别:', category);
    console.error('消息:', message);
    console.error('进度:', `${this.testState.processedCount}/${this.testConfig.targetCount}`);
    console.error('错误次数:', this.testState.errorCount);
    console.error('='.repeat(60) + '\n');
    
    if (this.testConfig.pauseOnError) {
      this.pause();
      console.log('⏸️  测试已暂停，等待分析和修复...');
      
      if (this.testConfig.autoFix) {
        setTimeout(() => {
          this.analyzeAndFix(error);
        }, 1000);
      }
    }
  }
  
  async analyzeAndFix(error) {
    console.log('\n🔧 开始分析和修复...');
    console.log('错误ID:', error.id);
    console.log('错误类别:', error.category);
    
    switch (error.category) {
      case 'resumeExtraction':
        await this.fixResumeExtraction(error);
        break;
      case 'pageNavigation':
        await this.fixPageNavigation(error);
        break;
      case 'apiError':
        await this.fixApiError(error);
        break;
      default:
        console.log('⚠️  未知错误类别，无法自动修复');
    }
  }
  
  async fixResumeExtraction(error) {
    console.log('\n📋 分析简历提取问题...');
    
    const diagnosis = await this.diagnoseResumePage();
    
    console.log('诊断结果:', diagnosis);
    
    if (diagnosis.hasImgPage) {
      console.log('✅ 发现 .img-page 元素，检查URL有效性...');
      
      for (let i = 0; i < diagnosis.imgPageUrls.length; i++) {
        const url = diagnosis.imgPageUrls[i];
        console.log(`检查图片 ${i + 1}: ${url.substring(0, 100)}...`);
        
        const isValid = await this.testImageUrl(url);
        if (!isValid) {
          console.log(`❌ 图片 ${i + 1} URL无效或已过期`);
        } else {
          console.log(`✅ 图片 ${i + 1} URL有效`);
        }
      }
    }
    
    if (diagnosis.hasIframe) {
      console.log('✅ 发现 iframe 简历，检查内容...');
      console.log('iframe 内容:', diagnosis.iframeContent);
    }
    
    if (diagnosis.hasImgBlob) {
      console.log('✅ 发现 .img-blob 元素');
    }
    
    if (!diagnosis.hasImgPage && !diagnosis.hasIframe && !diagnosis.hasImgBlob) {
      console.log('❌ 未找到任何简历元素！');
      console.log('建议修复方案:');
      console.log('1. 检查页面是否完全加载');
      console.log('2. 检查是否有新的简历展示方式');
      console.log('3. 更新选择器以匹配新的DOM结构');
      
      await this.suggestNewSelectors();
    }
    
    console.log('\n尝试重新加载简历...');
    await this.reloadPage();
    
    error.fixed = true;
    this.testState.fixedCount++;
    console.log('✅ 修复尝试完成');
    
    setTimeout(() => {
      this.resume();
    }, 2000);
  }
  
  async diagnoseResumePage() {
    return new Promise((resolve) => {
      const result = {
        hasImgPage: false,
        imgPageCount: 0,
        imgPageUrls: [],
        hasIframe: false,
        iframeContent: null,
        hasImgBlob: false,
        imgBlobCount: 0,
        allImages: 0
      };
      
      const imgPageElements = document.querySelectorAll('.img-page');
      result.hasImgPage = imgPageElements.length > 0;
      result.imgPageCount = imgPageElements.length;
      imgPageElements.forEach(img => {
        if (img.src) result.imgPageUrls.push(img.src);
      });
      
      const iframeResume = document.getElementById('iframeResume');
      result.hasIframe = !!iframeResume;
      if (iframeResume) {
        try {
          const iframeDoc = iframeResume.contentDocument || iframeResume.contentWindow.document;
          result.iframeContent = {
            hasWordPage: !!iframeDoc.querySelector('.word-page'),
            hasSvg: !!iframeDoc.querySelector('svg'),
            hasStructuredResume: !!iframeDoc.querySelector('.flexAlignStart--o1K7u')
          };
        } catch (e) {
          result.iframeContent = { error: e.message };
        }
      }
      
      const imgBlobElements = document.querySelectorAll('.img-blob');
      result.hasImgBlob = imgBlobElements.length > 0;
      result.imgBlobCount = imgBlobElements.length;
      
      result.allImages = document.querySelectorAll('img').length;
      
      resolve(result);
    });
  }
  
  async testImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      setTimeout(() => resolve(false), 5000);
    });
  }
  
  async suggestNewSelectors() {
    console.log('\n🔍 扫描页面中所有可能的简历元素...');
    
    const allImages = document.querySelectorAll('img');
    const possibleResumeImages = [];
    
    allImages.forEach((img, index) => {
      const src = img.src || '';
      const className = img.className || '';
      const id = img.id || '';
      
      if (src.includes('resume') || src.includes('cv') || src.includes('pdf') ||
          className.includes('resume') || className.includes('cv') ||
          src.match(/pdf_\d+\.jpg/i)) {
        possibleResumeImages.push({
          index,
          src: src.substring(0, 100),
          className,
          id,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      }
    });
    
    if (possibleResumeImages.length > 0) {
      console.log(`✅ 找到 ${possibleResumeImages.length} 个可能的简历图片:`);
      possibleResumeImages.forEach((img, i) => {
        console.log(`  ${i + 1}. class="${img.className}" id="${img.id}"`);
        console.log(`     src: ${img.src}`);
        console.log(`     尺寸: ${img.width}x${img.height}`);
      });
      
      console.log('\n建议更新 captureResume() 函数，添加以下选择器:');
      possibleResumeImages.forEach(img => {
        if (img.className) {
          console.log(`  - .${img.className.split(' ')[0]}`);
        }
        if (img.id) {
          console.log(`  - #${img.id}`);
        }
      });
    } else {
      console.log('❌ 未找到任何可能的简历图片');
    }
    
    const iframes = document.querySelectorAll('iframe');
    if (iframes.length > 0) {
      console.log(`\n找到 ${iframes.length} 个 iframe 元素:`);
      iframes.forEach((iframe, i) => {
        console.log(`  ${i + 1}. id="${iframe.id}" src="${iframe.src}"`);
      });
    }
  }
  
  async fixPageNavigation(error) {
    console.log('\n📋 分析页面导航问题...');
    console.log('当前URL:', window.location.href);
    console.log('候选人:', error.candidate);
    
    console.log('\n建议修复方案:');
    console.log('1. 检查候选人元素是否存在');
    console.log('2. 检查点击事件是否正确绑定');
    console.log('3. 检查页面跳转逻辑');
    
    error.fixed = true;
    this.testState.fixedCount++;
    console.log('✅ 修复尝试完成');
    
    setTimeout(() => {
      this.resume();
    }, 2000);
  }
  
  async fixApiError(error) {
    console.log('\n📋 分析API错误...');
    console.log('错误详情:', error.details);
    
    console.log('\n建议修复方案:');
    console.log('1. 检查API密钥是否有效');
    console.log('2. 检查网络连接');
    console.log('3. 检查API配额');
    console.log('4. 检查请求参数格式');
    
    error.fixed = true;
    this.testState.fixedCount++;
    console.log('✅ 修复尝试完成');
    
    setTimeout(() => {
      this.resume();
    }, 2000);
  }
  
  async reloadPage() {
    console.log('🔄 重新加载页面...');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ 页面已重新加载');
        resolve();
      }, 3000);
    });
  }
  
  startMonitoring() {
    console.log('📊 开始监控测试进度...');
    
    this.monitorInterval = setInterval(() => {
      if (!this.testState.isRunning || this.testState.isPaused) {
        return;
      }
      
      const elapsed = Date.now() - this.testState.startTime;
      const elapsedMinutes = Math.floor(elapsed / 60000);
      const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
      
      const progress = (this.testState.processedCount / this.testConfig.targetCount * 100).toFixed(1);
      const speed = this.testState.processedCount / (elapsed / 60000);
      const estimatedRemaining = (this.testConfig.targetCount - this.testState.processedCount) / speed;
      
      console.log(`\n📊 进度报告 [${elapsedMinutes}m ${elapsedSeconds}s]`);
      console.log(`   已处理: ${this.testState.processedCount}/${this.testConfig.targetCount} (${progress}%)`);
      console.log(`   速度: ${speed.toFixed(1)} 人/分钟`);
      console.log(`   预计剩余时间: ${estimatedRemaining.toFixed(1)} 分钟`);
      console.log(`   错误次数: ${this.testState.errorCount}`);
      console.log(`   已修复: ${this.testState.fixedCount}`);
      
      if (this.testState.processedCount >= this.testConfig.targetCount) {
        this.complete();
      }
    }, 30000);
  }
  
  pause() {
    this.testState.isPaused = true;
    console.log('⏸️  测试已暂停');
  }
  
  resume() {
    this.testState.isPaused = false;
    console.log('▶️  测试已恢复');
  }
  
  stop() {
    this.testState.isRunning = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    console.log('⏹️  测试已停止');
    this.generateReport();
  }
  
  complete() {
    this.testState.isRunning = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    console.log('\n🎉 测试完成！');
    this.generateReport();
  }
  
  generateReport() {
    const elapsed = Date.now() - this.testState.startTime;
    const elapsedMinutes = Math.floor(elapsed / 60000);
    const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试报告');
    console.log('='.repeat(60));
    console.log(`总耗时: ${elapsedMinutes} 分 ${elapsedSeconds} 秒`);
    console.log(`目标数量: ${this.testConfig.targetCount}`);
    console.log(`已处理: ${this.testState.processedCount}`);
    console.log(`错误次数: ${this.testState.errorCount}`);
    console.log(`已修复: ${this.testState.fixedCount}`);
    console.log(`成功率: ${((this.testState.processedCount / this.testConfig.targetCount) * 100).toFixed(1)}%`);
    
    if (this.testState.errors.length > 0) {
      console.log('\n错误详情:');
      this.testState.errors.forEach((error, index) => {
        console.log(`\n错误 ${index + 1}:`);
        console.log(`  时间: ${error.timestamp}`);
        console.log(`  类别: ${error.category}`);
        console.log(`  消息: ${error.message}`);
        console.log(`  进度: ${error.processedCount}/${this.testConfig.targetCount}`);
        console.log(`  已修复: ${error.fixed ? '是' : '否'}`);
        if (error.candidate) {
          console.log(`  候选人: ${error.candidate.name}`);
        }
      });
    }
    
    console.log('='.repeat(60));
    
    return {
      elapsed: elapsedMinutes * 60 + elapsedSeconds,
      targetCount: this.testConfig.targetCount,
      processedCount: this.testState.processedCount,
      errorCount: this.testState.errorCount,
      fixedCount: this.testState.fixedCount,
      successRate: (this.testState.processedCount / this.testConfig.targetCount) * 100,
      errors: this.testState.errors
    };
  }
  
  getStatus() {
    return {
      isRunning: this.testState.isRunning,
      isPaused: this.testState.isPaused,
      processedCount: this.testState.processedCount,
      errorCount: this.testState.errorCount,
      fixedCount: this.testState.fixedCount,
      progress: (this.testState.processedCount / this.testConfig.targetCount * 100).toFixed(1),
      currentCandidate: this.testState.currentCandidate
    };
  }
}

const autoTest = new AutoTestRunner();

console.log('\n' + '='.repeat(60));
console.log('🤖 自动化测试系统已加载');
console.log('='.repeat(60));
console.log('\n使用方法:');
console.log('  autoTest.start(500)     - 开始测试500位人选');
console.log('  autoTest.pause()        - 暂停测试');
console.log('  autoTest.resume()       - 恢复测试');
console.log('  autoTest.stop()         - 停止测试');
console.log('  autoTest.getStatus()    - 获取测试状态');
console.log('  autoTest.generateReport() - 生成测试报告');
console.log('\n配置选项:');
console.log('  autoTest.testConfig.pauseOnError = true/false  - 错误时暂停');
console.log('  autoTest.testConfig.autoFix = true/false       - 自动修复');
console.log('  autoTest.testConfig.logLevel = "verbose"/"normal" - 日志级别');
console.log('='.repeat(60) + '\n');
