// node gateload.mjs <markup-round-0 dir>   — measurement (ii) of Appendix A
const fs=require("fs");
const ABS=/\b(every|always|never|cannot|guarantees?|ensures?|nothing|only|by default)\b/i;
const LIFE=/\b(stays?|removed?|removes?|continu\w*|resum\w*|reclaim\w*|ke(ep|pt)s?|prun\w*|until|left|lasts?|clears?|age out|trimmed|deletes?|preserved|goes when|ends|killed|dies|crashed|dead)\b/i;
const RO=/read-only/gi; const D=process.argv[2];
for (const nn of ["04","05","06","07","08","09"]) {
  const e=JSON.parse(fs.readFileSync(`${D}/edits/${nn}.json`,"utf8")); let hit=0,below=0,l3=0,checks=0;
  for (const x of e){const t=(x.new||"").replace(RO,"readonly");const h=ABS.test(t)||LIFE.test(t);if(x.check)checks++;if(x.check&&x.check.level===3)l3++;if(h){hit++;if(!(x.check&&x.check.level===3))below++;}}
  console.log(nn,"edits",e.length,"checks",checks,"L3",l3,"hit",hit,"refused",below);
}
for (const f of ["08-review.md","09-reduction.md"]) {
  const t=fs.readFileSync(`${D}/${f}`,"utf8").replace(RO,"readonly").replace(/\s+/g," ");
  const s=t.split(/(?<=[.!?])\s+(?=[A-Z`*|>])/).filter(x=>x.trim()); let h=0; for(const u of s) if(ABS.test(u)||LIFE.test(u)) h++;
  console.log(f,"units",s.length,"hit",h);
}
