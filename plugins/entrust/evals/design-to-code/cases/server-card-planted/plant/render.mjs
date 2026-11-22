// Renders each planted line at 1x on white, cropped to the line box; prints the ink top inside the crop.
import { createRequire } from "node:module";
const { chromium } = createRequire("/home/user/agent-skills/plugins/entrust/noop.js")("playwright");
const lines = JSON.parse(process.argv[2]);
const b = await chromium.launch();
const p = await b.newPage({ deviceScaleFactor: 1 });
for (const [name, text, size] of lines) {
  await p.setContent(`<body style="margin:0;background:#fff"><span id=t style="display:inline-block;font:400 ${size}px/${size + 5}px Inter;color:#7f7f7f;padding:4px 2px;-webkit-font-smoothing:antialiased">${text}</span></body>`);
  await p.evaluate(() => document.fonts.ready);
  await p.locator("#t").screenshot({ path: `${name}.png` });
}
await b.close();
