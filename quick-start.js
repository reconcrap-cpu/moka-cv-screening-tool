// 快速启动自动化测试脚本
// 在浏览器控制台中运行此脚本即可启动测试

(function() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Moka简历筛选自动化测试系统');
  console.log('='.repeat(70));
  
  // 检查autoTest是否已加载
  if (typeof autoTest === 'undefined') {
    console.error('❌ 自动测试系统未加载！');
    console.log('\n请先加载测试系统：');
    console.log('1. 确保manifest.json中包含 auto-test.js');
    console.log('2. 刷新页面');
    console.log('3. 重新运行此脚本');
    return;
  }
  
  // 显示当前状态
  console.log('\n📊 当前测试状态:');
  const status = autoTest.getStatus();
  console.log('  运行中:', status.isRunning);
  console.log('  已暂停:', status.isPaused);
  console.log('  已处理:', status.processedCount);
  console.log('  错误数:', status.errorCount);
  console.log('  已修复:', status.fixedCount);
  
  // 显示配置
  console.log('\n⚙️ 当前配置:');
  console.log('  目标数量:', autoTest.testConfig.targetCount);
  console.log('  错误时暂停:', autoTest.testConfig.pauseOnError);
  console.log('  自动修复:', autoTest.testConfig.autoFix);
  console.log('  日志级别:', autoTest.testConfig.logLevel);
  
  // 显示使用选项
  console.log('\n💡 快速操作:');
  console.log('  autoTest.start(500)    - 开始测试500人');
  console.log('  autoTest.start(100)    - 开始测试100人');
  console.log('  autoTest.pause()       - 暂停测试');
  console.log('  autoTest.resume()      - 恢复测试');
  console.log('  autoTest.stop()        - 停止测试');
  console.log('  autoTest.getStatus()   - 查看状态');
  console.log('  autoTest.generateReport() - 生成报告');
  
  // 询问用户
  console.log('\n❓ 请选择操作:');
  console.log('  1. 快速测试 (10人)');
  console.log('  2. 标准测试 (100人)');
  console.log('  3. 完整测试 (500人)');
  console.log('  4. 自定义测试');
  console.log('  5. 查看当前状态');
  console.log('  6. 生成测试报告');
  console.log('  7. 停止测试');
  
  // 创建全局辅助函数
  window.quickTest = {
    start10: () => {
      console.log('\n🚀 开始快速测试 (10人)...');
      autoTest.start(10);
    },
    start100: () => {
      console.log('\n🚀 开始标准测试 (100人)...');
      autoTest.start(100);
    },
    start500: () => {
      console.log('\n🚀 开始完整测试 (500人)...');
      autoTest.start(500);
    },
    custom: (count) => {
      console.log(`\n🚀 开始自定义测试 (${count}人)...`);
      autoTest.start(count);
    },
    status: () => {
      const s = autoTest.getStatus();
      console.log('\n📊 测试状态:');
      console.log('  运行中:', s.isRunning);
      console.log('  已暂停:', s.isPaused);
      console.log('  进度:', s.progress + '%');
      console.log('  已处理:', s.processedCount);
      console.log('  错误数:', s.errorCount);
      console.log('  已修复:', s.fixedCount);
      if (s.currentCandidate) {
        console.log('  当前人选:', s.currentCandidate.name);
      }
      return s;
    },
    report: () => {
      console.log('\n📊 生成测试报告...');
      return autoTest.generateReport();
    },
    stop: () => {
      console.log('\n⏹️  停止测试...');
      autoTest.stop();
    },
    pause: () => {
      console.log('\n⏸️  暂停测试...');
      autoTest.pause();
    },
    resume: () => {
      console.log('\n▶️  恢复测试...');
      autoTest.resume();
    },
    config: {
      verbose: () => {
        autoTest.testConfig.logLevel = 'verbose';
        console.log('✅ 已开启详细日志');
      },
      normal: () => {
        autoTest.testConfig.logLevel = 'normal';
        console.log('✅ 已切换到普通日志');
      },
      autoFixOn: () => {
        autoTest.testConfig.autoFix = true;
        console.log('✅ 已开启自动修复');
      },
      autoFixOff: () => {
        autoTest.testConfig.autoFix = false;
        console.log('✅ 已关闭自动修复');
      },
      pauseOnErrorOn: () => {
        autoTest.testConfig.pauseOnError = true;
        console.log('✅ 已开启错误时暂停');
      },
      pauseOnErrorOff: () => {
        autoTest.testConfig.pauseOnError = false;
        console.log('✅ 已关闭错误时暂停');
      }
    },
    diagnose: async () => {
      console.log('\n🔍 诊断当前页面...');
      const diagnosis = await autoTest.diagnoseResumePage();
      console.log('诊断结果:', diagnosis);
      return diagnosis;
    },
    exportReport: () => {
      const report = autoTest.generateReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moka-test-report-${Date.now()}.json`;
      a.click();
      console.log('✅ 报告已导出');
    }
  };
  
  console.log('\n💡 快捷命令已创建:');
  console.log('  quickTest.start10()      - 快速测试10人');
  console.log('  quickTest.start100()     - 标准测试100人');
  console.log('  quickTest.start500()     - 完整测试500人');
  console.log('  quickTest.custom(50)     - 自定义测试50人');
  console.log('  quickTest.status()       - 查看状态');
  console.log('  quickTest.report()       - 生成报告');
  console.log('  quickTest.stop()         - 停止测试');
  console.log('  quickTest.pause()        - 暂停测试');
  console.log('  quickTest.resume()       - 恢复测试');
  console.log('  quickTest.diagnose()     - 诊断当前页面');
  console.log('  quickTest.exportReport() - 导出报告');
  console.log('\n配置命令:');
  console.log('  quickTest.config.verbose()        - 开启详细日志');
  console.log('  quickTest.config.normal()         - 切换普通日志');
  console.log('  quickTest.config.autoFixOn()      - 开启自动修复');
  console.log('  quickTest.config.autoFixOff()     - 关闭自动修复');
  console.log('  quickTest.config.pauseOnErrorOn() - 开启错误暂停');
  console.log('  quickTest.config.pauseOnErrorOff()- 关闭错误暂停');
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ 测试系统已就绪！输入 quickTest.start10() 开始测试');
  console.log('='.repeat(70) + '\n');
  
})();
