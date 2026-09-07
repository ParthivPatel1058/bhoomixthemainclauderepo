import fs from "fs";
import path from "path";

const files = [];
for (const f of fs.readdirSync(".")) if (f.endsWith(".svg")) files.push(path.resolve(f));
function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".svg")) files.push(path.resolve(p));
  }
}
walk("extracted");

let cells = "";
files.forEach((f, i) => {
  let svg = fs.readFileSync(f, "utf8");
  svg = svg.replace(/<\?xml[\s\S]*?\?>/g, "").replace(/<!DOCTYPE[\s\S]*?>/g, "");
  svg = svg.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  svg = svg.replace(/<svg /, '<svg width="56" height="56" ');
  const rel = path.relative(".", f).split(path.sep).join("/");
  cells += `<div class="cell"><div class="ic">${svg}</div><div class="lbl">${i + 1}. ${rel}</div></div>`;
});

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{background:#fff;font-family:monospace;margin:20px}
.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.cell{border:1px solid #ddd;padding:8px;text-align:center}
.ic{height:60px;display:flex;align-items:center;justify-content:center}
.lbl{font-size:9px;margin-top:4px;word-break:break-all;color:#333}
</style></head><body><div class="grid">${cells}</div></body></html>`;
fs.writeFileSync("contact-sheet.html", html);
console.log("Total SVGs:", files.length);
