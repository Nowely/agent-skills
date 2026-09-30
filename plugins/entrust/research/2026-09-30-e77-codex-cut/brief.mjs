// Fill the reader brief: scenarios without their keys, the base directory and the page as loaded.
import fs from "node:fs";
const [tpl, scen, base, page, out] = process.argv.slice(2);
const secs = fs.readFileSync(scen, "utf8").split(/^(?=## S\d)/m).slice(1)
  .map((s) => s.slice(0, s.search(/^\*\*Key/m)).trimEnd());
const text = fs.readFileSync(tpl, "utf8").replaceAll("{{BASE}}", base)
  .replace("{{SCENARIOS}}", () => secs.join("\n\n")).replace("{{PAGE}}", () => fs.readFileSync(page, "utf8"));
fs.writeFileSync(out, text);
console.log(out, secs.length, "scenarios", text.length, "chars", /\*\*Key/.test(text) ? "KEY LEAKED" : "no key");
