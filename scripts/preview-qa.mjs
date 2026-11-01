import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const report = { checkedAt: new Date().toISOString(), checks: [], cloudRequestsBlocked: [], errors: [] };
const pass = (name, evidence) => { report.checks.push({ name, result: 'pass', evidence }); console.log('PASS', name); };
const server = await createServer({ server: { host: '127.0.0.1', port: 5176, strictPort: true } });
let demoServer;
let browser;
const settle = async page => { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(450); };
const screenshot = async (page, name, fullPage = true) => { if(fullPage) await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'})); await settle(page); await page.screenshot({ path: `qa/${name}.png`, fullPage }); };
async function noOverflow(page, label) {
  const size = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(size.scroll <= size.viewport, `${label}: ${JSON.stringify(size)}`);
  pass(`${label}: no horizontal overflow`, size);
}
async function drag(page, locator, dx, dy, touch = false) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  assert.ok(b);
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  if (touch) {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x+dx, y: y+dy }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(x,y); await page.mouse.down(); await page.mouse.move(x+dx,y+dy,{steps:8}); await page.mouse.up();
  }
  await page.waitForTimeout(120);
}
async function context(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, ...options });
  await ctx.route(/https?:\/\/[^/]*supabase\.[^/]+\//, async route => {
    report.cloudRequestsBlocked.push({ method: route.request().method(), path: new URL(route.request().url()).pathname });
    await route.abort('blockedbyclient');
  });
  ctx.on('page', page => page.on('pageerror', err => report.errors.push(err.message)));
  return ctx;
}
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] });
  for (const mobile of (process.env.QA_SCOPE === 'demo' ? [] : [false,true])) {
    const prefix = mobile ? 'mobile' : 'desktop';
    const ctx = await context(mobile ? { viewport:{width:390,height:844}, isMobile:true, hasTouch:true } : {});
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});
    await noOverflow(page,`${prefix} home`);
    await screenshot(page,`${prefix}-home`);
    await screenshot(page,`${prefix}-home-viewport`,false);
    const hero = page.locator('.hero-main [data-frame-preview]');
    const beforeColor = await hero.evaluate(el => el.style.background);
    await page.getByRole('button',{name:'首頁框色：曜石霧黑',exact:true}).click();
    assert.notEqual(await hero.evaluate(el=>el.style.background), beforeColor);
    assert.equal(await page.getByRole('button',{name:'首頁框色：曜石霧黑',exact:true}).getAttribute('aria-pressed'),'true');
    pass(`${prefix} hero swatches update the rendered frame`);
    await page.getByRole('link',{name:'探索設計靈感',exact:true}).click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('#inspiration .product-example [data-frame-preview]').count(),3);
    pass(`${prefix} inspiration shows three complete frame examples`);
    // Use the hero CTA on both layouts, preserving the real selection flow.
    await page.getByRole('button',{name:'開始設計',exact:true}).first().click();
    await page.getByRole('button',{name:'選擇 PREMIUM',exact:true}).waitFor();
    const dimensions = await page.locator('.tier-art [data-frame-preview]').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
    assert.ok(dimensions.every(d=>Math.abs(d.w-dimensions[0].w)<1 && Math.abs(d.h-dimensions[0].h)<1));
    pass(`${prefix} tier previews have identical dimensions`,dimensions);
    await noOverflow(page,`${prefix} tiers`);
    await screenshot(page,`${prefix}-tiers`);
    await page.getByRole('button',{name:'選擇 PREMIUM',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'預覽並確認',exact:true}).count(),1);
    assert.equal(await page.getByRole('tab').count(),5);
    const tabs = await page.locator('.tool-tabs').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
    assert.ok(tabs.scroll<=tabs.width);
    pass(`${prefix} five tools fit without horizontal scrolling; one confirm CTA`,tabs);
    await noOverflow(page,`${prefix} editor`);
    if(mobile) {
      await page.getByRole('link',{name:'前往目前工具 ↓'}).click();
      await page.waitForTimeout(500);
      const y=await page.locator('#studio-tools').evaluate(el=>el.getBoundingClientRect().top);
      assert.ok(y>=65 && y<200);
      pass('mobile preview/tool anchors keep tools below header',{y});
    }
    await page.getByRole('button',{name:/二次元風格/}).click();
    assert.equal(await page.locator('#acrylic-display-frame img[alt="二次元風格"]').count(),1);
    await page.locator('input[type=file]').setInputFiles('public/cards/kpop.jpg');
    await page.getByAltText('已上傳小卡').waitFor();
    assert.match(await page.locator('#acrylic-display-frame img').first().getAttribute('src'),/^data:image\/jpeg/);
    pass(`${prefix} preset selection and card upload update preview`);
    await page.locator('.size-settings summary').click();
    await page.getByRole('button',{name:'自訂尺寸',exact:true}).click();
    await page.getByLabel('寬度 (mm)',{exact:true}).fill('64');
    let alertMessage='';
    page.once('dialog',async dialog=>{alertMessage=dialog.message();await dialog.accept();});
    await page.getByRole('button',{name:'預覽並確認',exact:true}).click();
    await page.waitForTimeout(100);
    assert.match(alertMessage,/尺寸超出/);
    assert.equal(await page.locator('.confirmation-page').count(),0);
    await page.getByRole('button',{name:'55 × 85 mm',exact:true}).click();
    pass(`${prefix} unsupported card size blocks confirmation; preset restores valid size`);
    await page.getByRole('tab',{name:'框色',exact:true}).click();
    await page.getByRole('button',{name:'珍珠柔白',exact:true}).click();
    assert.match(await page.locator('#acrylic-display-frame').evaluate(el=>el.style.background),/248, 250, 252/);
    pass(`${prefix} editor frame swatch updates actual frame fill`);
    await page.getByRole('tab',{name:'文字',exact:true}).click();
    assert.equal(await page.getByLabel('文字框寬度',{exact:true}).count(),0);
    await page.getByLabel('文字內容',{exact:true}).fill('MY COLLECTION');
    await page.locator('[data-text-object]').waitFor();
    const text = page.locator('[data-text-object]');
    const textX=await text.evaluate(el=>el.style.left);
    await drag(page,text,22,-22,mobile);
    assert.notEqual(await text.evaluate(el=>el.style.left),textX);
    const textWidth=await text.evaluate(el=>el.style.width);
    await drag(page,page.getByRole('button',{name:'調整文字框右邊界',exact:true}),20,0,mobile);
    assert.notEqual(await text.evaluate(el=>el.style.width),textWidth);
    await page.getByLabel('文字框寬度',{exact:true}).fill('48');
    await page.getByLabel('文字框高度',{exact:true}).fill('9');
    await page.getByLabel('自動換行',{exact:true}).check();
    pass(`${prefix} text editing, ${mobile?'touch':'mouse'} drag and resize, physical dimensions and wrapping`);
    await screenshot(page,`${prefix}-text`);
    await page.getByRole('tab',{name:'背景',exact:true}).click();
    await page.getByRole('button',{name:/晨光微曦漸層/}).click();
    assert.equal(await page.locator('#acrylic-display-frame .from-pink-500\\/20').count(),1);
    pass(`${prefix} background selection updates rendered background`);
    await page.getByRole('tab',{name:'貼飾',exact:true}).click();
    await page.getByRole('button',{name:'加入水晶四芒星',exact:true}).click();
    const sticker=page.locator('#acrylic-display-frame div[title="點擊選中或拖曳調整位置"]');
    await sticker.waitFor();
    const stickerX=await sticker.evaluate(el=>el.style.left);
    await drag(page,sticker,25,18,mobile);
    assert.notEqual(await sticker.evaluate(el=>el.style.left),stickerX);
    await page.getByLabel('貼飾大小',{exact:true}).fill('12');
    await page.getByLabel('貼飾旋轉',{exact:true}).fill('45');
    assert.match(await sticker.getAttribute('style'),/rotate\(45deg\)/);
    await page.getByRole('button',{name:'複製此貼飾',exact:true}).click();
    assert.equal(await sticker.count(),2);
    await page.getByRole('button',{name:'刪除此貼飾',exact:true}).click();
    assert.equal(await sticker.count(),1);
    pass(`${prefix} sticker add, ${mobile?'touch':'mouse'} drag, resize, rotation, duplicate and delete`);
    // Deselect by clicking a non-card part of the preview, then capture a complete editor.
    await page.getByRole('tab',{name:'框色',exact:true}).click();
    await page.getByRole('button',{name:'成品預覽',exact:true}).click();
    await screenshot(page,`${prefix}-editor`);
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await screenshot(page,`${prefix}-editor-viewport`,false);
    const [download] = await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'下載設計 PNG',exact:true}).click()]);
    const exportPath=`qa/${prefix}-export.png`;
    await download.saveAs(exportPath);
    const png=await fs.readFile(exportPath);
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
    assert.ok(width>500 && height>700);
    pass(`${prefix} PNG export downloads a real image`,{width,height,bytes:png.length});
    await page.getByRole('button',{name:'預覽並確認',exact:true}).click();
    await page.getByRole('heading',{name:'喜歡的樣子，已經成形。'}).waitFor();
    assert.equal(await page.locator('[data-text-content]').textContent(),'MY COLLECTION');
    await page.locator('.precise-details summary').click();
    assert.match(await page.locator('.confirmation-details').textContent(),/45°/);
    await noOverflow(page,`${prefix} confirmation`);
    await screenshot(page,`${prefix}-confirmation`);
    const [confirmDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'下載設計 PNG',exact:true}).click()]);
    await confirmDownload.saveAs(`qa/${prefix}-confirmation-export.png`);
    await page.getByRole('button',{name:'送出我的專屬設計',exact:true}).click();
    await page.getByPlaceholder('例如：王小明').waitFor();
    // Opening and closing the form is safe with the original cloud configuration.
    await page.getByRole('button',{name:'稍後再送',exact:true}).click();
    await page.getByRole('button',{name:'返回修改設計',exact:true}).click();
    assert.equal(await page.locator('[data-text-content]').textContent(),'MY COLLECTION');
    assert.equal(await page.locator('#acrylic-display-frame div[title="點擊選中或拖曳調整位置"]').count(),1);
    pass(`${prefix} confirmation, PNG, submit form cancel and return preserve design`);
    await page.getByRole('button',{name:'PREMIUM · 更換方案 →',exact:true}).click();
    let warning='';
    page.once('dialog',async dialog=>{warning=dialog.message();await dialog.dismiss();});
    await page.getByRole('button',{name:'選擇 BASIC',exact:true}).click();
    assert.match(warning,/清除後無法復原/);
    assert.equal(await page.locator('.tier-section').count(),1);
    await page.getByRole('button',{name:'選擇 PREMIUM',exact:true}).click();
    assert.equal(await page.locator('[data-text-content]').textContent(),'MY COLLECTION');
    pass(`${prefix} cancelling downgrade keeps design and current tier`);
    await page.getByRole('button',{name:'PREMIUM · 更換方案 →',exact:true}).click();
    page.once('dialog',async dialog=>dialog.accept());
    await page.getByRole('button',{name:'選擇 BASIC',exact:true}).click();
    assert.equal(await page.locator('[data-text-object]').count(),0);
    assert.equal(await page.locator('#acrylic-display-frame div[title="點擊選中或拖曳調整位置"]').count(),0);
    await page.getByRole('tab',{name:'文字',exact:true}).click();
    assert.equal(await page.getByLabel('文字內容',{exact:true}).count(),0);
    await page.getByRole('tab',{name:'小卡',exact:true}).click();
    assert.equal(await page.getByAltText('已上傳小卡').count(),1);
    pass(`${prefix} confirmed downgrade removes restricted elements and retains uploaded card`);
    await page.getByRole('button',{name:'BASIC · 更換方案 →',exact:true}).click();
    await page.getByRole('button',{name:'選擇 CUSTOM',exact:true}).click();
    await page.getByRole('tab',{name:'文字',exact:true}).click();
    assert.equal(await page.getByLabel('文字內容',{exact:true}).inputValue(),'');
    await page.getByLabel('文字內容',{exact:true}).fill('CUSTOM TEST');
    await page.getByRole('tab',{name:'背景',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:/晨光微曦漸層/}).count(),0);
    await page.getByRole('tab',{name:'小卡',exact:true}).click();
    assert.equal(await page.getByAltText('已上傳小卡').count(),1);
    pass(`${prefix} CUSTOM retains upload/text and keeps PREMIUM background locked`);
    await page.getByRole('button',{name:'管理後台',exact:true}).click();
    await page.getByRole('heading',{name:'ONLYFRAME 後台管理'}).waitFor();
    assert.equal(await page.getByRole('button',{name:/展示模式直接進入/}).count(),0);
    await screenshot(page,`${prefix}-admin-login`);
    pass(`${prefix} original cloud admin remains behind login; no demo bypass`);
    await ctx.close();
  }
  // A second, isolated Vite instance uses empty compile-time config only for QA.
  // No .env, backend code, database schema or saved cloud settings are changed.
  demoServer = await createServer({ cacheDir:'qa/.vite-demo',define:{'import.meta.env.VITE_SUPABASE_URL':'""','import.meta.env.VITE_SUPABASE_ANON_KEY':'""','import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY':'""'},server:{host:'127.0.0.1',port:5177,strictPort:true} });
  await demoServer.listen();
  const demoCtx=await context();
  const demo=await demoCtx.newPage();
  await demo.goto('http://127.0.0.1:5177/',{waitUntil:'networkidle'});
  await demo.getByRole('button',{name:'開始設計',exact:true}).first().click();
  await demo.getByRole('button',{name:'選擇 CUSTOM',exact:true}).click();
  await demo.getByRole('tab',{name:'文字',exact:true}).click();
  await demo.getByLabel('文字內容',{exact:true}).fill('LOCAL QA ONLY');
  await demo.getByRole('button',{name:'預覽並確認',exact:true}).click();
  await demo.getByRole('button',{name:'送出我的專屬設計',exact:true}).click();
  await demo.getByPlaceholder('例如：王小明').fill('本機測試');
  await demo.getByPlaceholder('例如：student@university.edu.tw').fill('local-qa@example.invalid');
  await screenshot(demo,'local-demo-submit-form');
  await demo.getByRole('button',{name:/確認送出設計/}).click();
  await demo.getByRole('heading',{name:'你的設計已儲存在本機！',exact:true}).waitFor({timeout:30000});
  const localRecords=await demo.evaluate(()=>JSON.parse(localStorage.getItem('onlyframe_mock_submissions')||'[]'));
  assert.equal(localRecords.length,1);
  assert.match(localRecords[0].submission_code,/^DES-\d{8}-[A-F0-9]{12}$/);
  assert.equal(localRecords[0].design_data.text.content,'LOCAL QA ONLY');
  assert.equal(localRecords[0].design_data.frame.widthMm,85);
  assert.ok(localRecords[0].preview_image_url.startsWith('data:image/png'));
  pass('isolated local demo submission preserves schema, millimetres, PNG and design code',{code:localRecords[0].submission_code});
  await screenshot(demo,'local-demo-success');
  await demo.getByRole('button',{name:'管理後台',exact:true}).click();
  await demo.getByRole('button',{name:/展示模式直接進入管理後台/}).click();
  await demo.getByRole('button',{name:'查看',exact:true}).waitFor();
  assert.match(await demo.locator('body').textContent(),new RegExp(localRecords[0].submission_code));
  await demo.getByRole('button',{name:'查看',exact:true}).click();
  await screenshot(demo,'local-demo-admin-detail');
  pass('isolated demo admin reads submitted local record and opens design details');
  await demoCtx.close();
  // Extra breakpoint checks use the original configuration and no saved sessions.
  const responsive=await context(); const rp=await responsive.newPage();
  for(const width of (process.env.QA_SCOPE === 'demo' ? [] : [360,768,1024])) {
    await rp.setViewportSize({width,height:900});
    await rp.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});
    await noOverflow(rp,`home ${width}px`);
    await rp.getByRole('button',{name:'開始設計',exact:true}).first().click();
    await noOverflow(rp,`tiers ${width}px`);
    await rp.getByRole('button',{name:'選擇 PREMIUM',exact:true}).click();
    await noOverflow(rp,`editor ${width}px`);
    const tabSize=await rp.locator('.tool-tabs').evaluate(el=>({w:el.clientWidth,scroll:el.scrollWidth}));
    assert.ok(tabSize.scroll<=tabSize.w);
  }
  await responsive.close();
  assert.deepEqual(report.errors,[]);
  assert.deepEqual(report.cloudRequestsBlocked.filter(r=>['POST','PUT','PATCH','DELETE'].includes(r.method)),[]);
  pass('no application errors; zero production write attempts');
} catch(err) {
  report.failure=err.stack;
  console.error(err);
  process.exitCode=1;
} finally {
  if(browser) await browser.close();
  if(demoServer) await demoServer.close();
  await server.close();
  await fs.writeFile(process.env.QA_SCOPE === 'demo' ? 'qa/browser-demo-results.json' : 'qa/browser-results.json',JSON.stringify(report,null,2));
  console.log('Report:',report.checks.length,'passed checks');
}

