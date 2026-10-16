import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/entry.js');
const puppeteer=await import('../../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js').then(m=>m.default);
const browser=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,pipe:true,args:['--disable-gpu'],defaultViewport:{width:1500,height:1040}});
const page=await browser.newPage();
const dir='outputs/evidence-review/screenshots';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const shots=[
 ['01-bank','Ngân hàng câu hỏi gốc','content/math/legacy-bank.json',1,32],
 ['02-schema','Cấu trúc dữ liệu và phân quyền','apps/api/prisma/schema.prisma',1,40],
 ['03-irt','IRT 3PL và ước lượng MAP','apps/api/src/modules/student/math-adaptive.ts',1,35],
 ['04-cat','Bộ chọn câu hỏi bậc thang','apps/api/src/modules/student/math-adaptive.ts',41,67],
 ['05-bkt','Cập nhật xác suất nắm vững kiến thức','apps/api/src/modules/student/math-adaptive.ts',68,82],
 ['06-plan','Sinh lộ trình học theo ngày','apps/api/src/modules/student/math-adaptive.ts',94,121],
 ['07-review','Lịch ôn FSRS trong phiên bản hiện tại','apps/api/src/modules/student/math-review.service.ts',1,20],
];
for(const [id,title,file,start,end] of shots){
 let raw=fs.readFileSync(file,'utf8'); if(file.endsWith('.json')){const j=JSON.parse(raw);raw=JSON.stringify({builtAt:j.builtAt,totalCount:j.totalCount,curriculum:j.curriculum,questions:j.questions.slice(0,1)},null,2);} const lines=raw.split(/\r?\n/).slice(start-1,end);
 const body=lines.map((s,i)=>`<div class="line"><span>${start+i}</span><code>${esc(s)}</code></div>`).join('');
 await page.setContent(`<html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#f3f4f6;color:#17212f;font-family:Arial}h1{font-size:26px;margin:0 0 12px}p{font-size:17px;margin:0 0 20px}.code{background:white;border:1px solid #cbd5e1;padding:16px 8px}.line{display:flex;line-height:23px;font-size:15px}.line span{width:48px;flex-shrink:0;text-align:right;padding-right:14px;color:#64748b}code{white-space:pre-wrap;overflow-wrap:anywhere;font-family:Consolas,monospace;flex:1}.foot{margin-top:16px;font-size:14px;color:#475569}</style><h1>${esc(title)}</h1><p>${esc(file)} · Dòng ${start}–${end}</p><div class="code">${body}</div><div class="foot">Ảnh chụp trích đoạn mã nguồn thực tế trong dự án · 15/10/2026</div></html>`);
 await page.screenshot({path:`${dir}/${id}.png`,fullPage:true});
}
try{await page.goto('https://adaptivemath-blush.vercel.app',{waitUntil:'networkidle0',timeout:60000});await page.screenshot({path:`${dir}/08-live.png`,fullPage:true});console.log((await page.title())+' live captured');}catch(e){console.log('Live screenshot unavailable: '+e.message);}
await browser.close();

