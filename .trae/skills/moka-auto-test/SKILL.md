---
name: "moka-auto-test"
description: "Automated testing for Moka Chrome extension. Injects test scripts into browser, monitors console logs, analyzes errors, and auto-investigates missing resume cases. Invoke when testing extension functionality or debugging resume detection issues."
---

# Moka Extension Automated Testing

Automated testing workflow for Moka Chrome extension using browser script injection and log analysis.

## When to Use

- Testing extension functionality in real browser environment
- Debugging resume detection issues
- Running stress tests on candidate processing
- Investigating "no resume" false negatives

## Workflow

### Phase 1: Navigate and Inject

1. **Navigate to target page** (Pagination or Infinite Scroll candidate list)
2. **Inject test module** via `mcp_Chrome_DevTools_MCP_evaluate_script`

```javascript
window.MokaTest = {
  results: [],
  running: false,
  
  // Resume format detection - supports multiple formats
  detectResume() {
    const formats = {
      imgPage: document.querySelectorAll('img.img-page').length,
      resumePrefix: (() => {
        const imgs = document.querySelectorAll('img');
        let count = 0;
        imgs.forEach(img => {
          if (img.className && (img.className.startsWith('resume-') || img.className.includes(' resume-'))) {
            count++;
          }
        });
        return count;
      })(),
      iframe: document.querySelectorAll('#iframeResume').length,
      imgBlob: document.querySelectorAll('img.img-blob').length,
      // SVG format inside iframe
      iframeSvg: (() => {
        const iframe = document.querySelector('#iframeResume');
        if (!iframe) return 0;
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          if (!iframeDoc) return 0;
          const svgs = iframeDoc.querySelectorAll('svg');
          const wordPages = iframeDoc.querySelectorAll('.word-page');
          return Math.max(svgs.length, wordPages.length);
        } catch (e) { return 0; }
      })()
    };
    return formats;
  },
  
  // Get visible candidates
  getCandidates() {
    // Pagination mode: tr[id]
    // Infinite Scroll mode: .item-NpfQ8Ve_W4
    const items = document.querySelectorAll('.item-NpfQ8Ve_W4, tr[id]');
    return Array.from(items).map(item => {
      const nameEl = item.querySelector('[class*="heading-"]') || 
                     item.querySelector('td:nth-child(2) span');
      return {
        element: item,
        name: nameEl ? nameEl.textContent.trim() : 'Unknown'
      };
    }).filter(c => c.name !== 'Unknown');
  },
  
  // Wait for URL change
  async waitForUrlChange(expectedPattern, timeout = 8000) {
    const startTime = Date.now();
    const initialUrl = window.location.href;
    while (Date.now() - startTime < timeout) {
      const currentUrl = window.location.href;
      if (currentUrl !== initialUrl) {
        if (expectedPattern) {
          if (typeof expectedPattern === 'function') {
            if (expectedPattern(currentUrl)) return { changed: true, url: currentUrl };
          } else if (currentUrl.includes(expectedPattern)) {
            return { changed: true, url: currentUrl };
          }
        } else {
          return { changed: true, url: currentUrl };
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }
    return { changed: false, url: window.location.href };
  },
  
  // Check if detail page
  isDetailPage(url) {
    if (!url) url = window.location.href;
    return /\/application\/\d+/.test(url);
  },
  
  // Test single candidate
  async testCandidate(candidate) {
    const result = {
      name: candidate.name,
      listUrl: window.location.href,
      detailUrl: null,
      isDetailPage: false,
      hasResume: false,
      errors: [],
      resumeCount: 0,
      resumeFormats: null
    };
    
    try {
      candidate.element.click();
      const urlResult = await this.waitForUrlChange(url => this.isDetailPage(url), 8000);
      
      if (!urlResult.changed) {
        result.errors.push('URL did not change to detail page');
        return result;
      }
      
      result.detailUrl = urlResult.url;
      result.isDetailPage = this.isDetailPage();
      
      await new Promise(r => setTimeout(r, 1500));
      
      const formats = this.detectResume();
      result.resumeFormats = formats;
      const totalResume = formats.imgPage + formats.resumePrefix + formats.iframeSvg + formats.imgBlob;
      result.hasResume = totalResume > 0;
      result.resumeCount = totalResume;
      
    } catch (e) {
      result.errors.push('Exception: ' + e.message);
    }
    
    return result;
  },
  
  // Run test
  async runTest(count = 50) {
    this.results = [];
    this.running = true;
    console.log(`[MokaTest] Starting test for ${count} candidates...`);
    
    for (let i = 0; i < count && this.running; i++) {
      const candidates = this.getCandidates();
      if (candidates.length === 0) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      
      const testedNames = this.results.map(r => r.name);
      const candidate = candidates.find(c => !testedNames.includes(c.name));
      
      if (!candidate) {
        // Scroll to load more
        const listContainer = document.querySelector('.list-3nXWqE8qKd');
        if (listContainer) listContainer.scrollTop = listContainer.scrollHeight;
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      
      console.log(`[MokaTest] Testing ${i + 1}/${count}: ${candidate.name}`);
      const result = await this.testCandidate(candidate);
      this.results.push(result);
      
      if (result.errors.length > 0) {
        console.warn(`[MokaTest] ${candidate.name} has errors:`, result.errors);
      } else {
        console.log(`[MokaTest] ${candidate.name} passed - Resume: ${result.resumeCount} pages`);
      }
      
      await new Promise(r => setTimeout(r, 500));
    }
    
    this.running = false;
    
    const stats = {
      total: this.results.length,
      success: this.results.filter(r => r.errors.length === 0).length,
      hasResume: this.results.filter(r => r.hasResume).length,
      noResume: this.results.filter(r => !r.hasResume).length
    };
    
    console.log('[MokaTest] Test completed!', stats);
    return stats;
  },
  
  stop() {
    this.running = false;
    console.log('[MokaTest] Test stopped');
  }
};

console.log('[MokaTest] Module injected. Use await MokaTest.runTest(N) to start N-person test');
```

### Phase 2: Run Test and Monitor

1. **Start test**: `MokaTest.runTest(50)`
2. **Monitor progress** via periodic checks:
   ```javascript
   MokaTest.results.length  // Completed count
   MokaTest.running         // Is still running
   ```

3. **Check console logs** via `mcp_Chrome_DevTools_MCP_list_console_messages`

### Phase 3: Analyze Results

```javascript
const results = MokaTest.results;
const errors = results.filter(r => r.errors.length > 0);
const noResume = results.filter(r => !r.hasResume);

return {
  total: results.length,
  success: results.length - errors.length,
  errors: errors.length,
  noResume: noResume.length,
  noResumeNames: noResume.map(r => r.name)
};
```

### Phase 4: Investigate "No Resume" Cases

When candidates show "no resume" but should have resumes:

1. **Navigate to candidate detail page**
2. **Inspect DOM structure**:
   ```javascript
   // Check all possible resume formats
   const checks = {
     imgPage: document.querySelectorAll('img.img-page').length,
     resumePrefix: /* count img with resume- class */,
     iframe: document.querySelectorAll('#iframeResume').length,
     iframeSvg: /* check iframe content for svg */,
     imgBlob: document.querySelectorAll('img.img-blob').length,
     allImgs: document.querySelectorAll('img').length
   };
   ```

3. **If iframe exists, check its content**:
   ```javascript
   const iframe = document.querySelector('#iframeResume');
   const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
   const svgs = iframeDoc.querySelectorAll('svg');
   const wordPages = iframeDoc.querySelectorAll('.word-page');
   ```

4. **Identify new format** and update detection logic

5. **Update ResumeImageModule.js** to support new format

### Phase 5: Fix and Verify

1. Update `src/modules/ResumeImageModule.js` with new detection logic
2. Re-run test on affected candidates
3. Verify fix works for all previously failed cases

## Resume Format Reference

| Format | Selector | Description |
|--------|----------|-------------|
| imgPage | `img.img-page` | Standard image pages |
| resumePrefix | `img[class*="resume-"]` | Dynamic class names |
| iframeSvg | `#iframeResume svg` | SVG in iframe |
| wordPage | `#iframeResume .word-page` | Word-style container |
| imgBlob | `img.img-blob` | Blob URL images |

## Common Issues

1. **"No resume" false negative**: Usually new format not detected
2. **URL not changing**: Check if left-right panel layout
3. **Navigation fails**: Verify correct clickable element selector

## Output Template

```
## Test Results

| Metric | Value |
|--------|-------|
| Total | X |
| Success | X (X%) |
| No Resume | X |

### Errors
- List of error cases

### No Resume Cases
- List of candidates without detected resume

### Root Cause Analysis
- Description of issues found

### Fix Applied
- Changes made to detection logic
```
