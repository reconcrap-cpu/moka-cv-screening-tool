// 扩展诊断脚本
// 在Console中运行此脚本来诊断扩展加载问题

console.log('\n' + '='.repeat(70));
console.log('🔍 Chrome扩展诊断工具');
console.log('='.repeat(70));

// 1. 检查当前URL
console.log('\n📍 当前页面信息:');
console.log('  URL:', window.location.href);
console.log('  协议:', window.location.protocol);
console.log('  域名:', window.location.hostname);

// 2. 检查扩展是否加载
console.log('\n🔌 扩展加载状态:');
console.log('  startScreening:', typeof startScreening !== 'undefined' ? '✅ 已加载' : '❌ 未加载');
console.log('  isRunning:', typeof isRunning !== 'undefined' ? '✅ 已加载' : '❌ 未加载');
console.log('  config:', typeof config !== 'undefined' ? '✅ 已加载' : '❌ 未加载');
console.log('  addLog:', typeof addLog !== 'undefined' ? '✅ 已加载' : '❌ 未加载');
console.log('  captureResume:', typeof captureResume !== 'undefined' ? '✅ 已加载' : '❌ 未加载');
console.log('  processCandidate:', typeof processCandidate !== 'undefined' ? '✅ 已加载' : '❌ 未加载');

// 3. 检查测试系统
console.log('\n🧪 测试系统状态:');
console.log('  autoTest:', typeof autoTest !== 'undefined' ? '✅ 已加载' : '❌ 未加载');
console.log('  quickTest:', typeof quickTest !== 'undefined' ? '✅ 已加载' : '❌ 未加载');

// 4. 检查DOM
console.log('\n📄 DOM状态:');
console.log('  文档状态:', document.readyState);
console.log('  Body元素:', document.body ? '✅ 存在' : '❌ 不存在');
console.log('  Head元素:', document.head ? '✅ 存在' : '❌ 不存在');

// 5. 检查已加载的脚本
console.log('\n📜 已加载的脚本数量:', document.querySelectorAll('script').length);

// 6. 检查Chrome API
console.log('\n🔧 Chrome API:');
console.log('  chrome.runtime:', typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined' ? '✅ 可用' : '❌ 不可用');
if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
  console.log('  扩展ID:', chrome.runtime.id || '未知');
}

// 7. 诊断结果
console.log('\n' + '='.repeat(70));
console.log('📋 诊断结果:');
console.log('='.repeat(70));

const hasContentScript = typeof startScreening !== 'undefined';

if (!hasContentScript) {
  console.log('\n❌ 问题: Content Script未加载');
  console.log('\n可能的原因:');
  console.log('  1. 扩展未正确加载');
  console.log('  2. 扩展被禁用');
  console.log('  3. manifest.json配置有误');
  console.log('  4. 页面URL不匹配content_scripts的matches规则');
  
  console.log('\n✅ 解决方案:');
  console.log('  1. 打开 chrome://extensions/');
  console.log('  2. 确认扩展已启用');
  console.log('  3. 点击扩展的"刷新"按钮 🔄');
  console.log('  4. 刷新当前页面 (F5)');
  console.log('  5. 重新运行此诊断脚本');
  
  console.log('\n💡 快速修复:');
  console.log('  如果刷新扩展后仍然不工作，请检查:');
  console.log('  - manifest.json中的content_scripts配置');
  console.log('  - 扩展是否有错误提示');
  console.log('  - 是否需要特殊权限');
} else {
  console.log('\n✅ Content Script已正确加载！');
  console.log('\n🎉 扩展工作正常，可以开始使用筛选功能了！');
}

console.log('='.repeat(70) + '\n');

// 返回诊断结果
({
  hasContentScript: hasContentScript,
  hasTestSystem: typeof autoTest !== 'undefined',
  hasQuickTest: typeof quickTest !== 'undefined',
  url: window.location.href,
  timestamp: new Date().toISOString()
});
