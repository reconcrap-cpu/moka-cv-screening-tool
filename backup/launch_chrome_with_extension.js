const { chromium } = require('playwright');
const path = require('path');

async function launchChromeWithExtension() {
  // 扩展的绝对路径
  const extensionPath = path.resolve(__dirname);
  
  console.log('扩展路径:', extensionPath);
  
  // 启动带有扩展的 Chrome
  const browserContext = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--load-extension=${extensionPath}`,
      `--disable-extensions-except=${extensionPath}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
    viewport: { width: 1280, height: 720 }
  });
  
  // 获取所有页面
  const pages = browserContext.pages();
  const page = pages[0] || await browserContext.newPage();
  
  console.log('Chrome 已启动，扩展已加载');
  console.log('页面 URL:', page.url());
  
  // 打开扩展的 background page（如果有）
  const backgroundPages = browserContext.backgroundPages();
  console.log('Background pages:', backgroundPages.length);
  
  // 导航到目标页面
  await page.goto('https://app.mokahr.com/talent_pool');
  
  console.log('已导航到 Moka 人才库页面');
  console.log('请手动登录后，扩展将自动工作');
  
  // 保持浏览器打开
  // await browserContext.close();
}

launchChromeWithExtension().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
