#!/usr/bin/env node
// Makes one arm of the listing case: node make-arm.mjs <dir> [--variant a|b]
//
// The arm gets the start project and the design pack in design/; never the reference or the judge. Variant a ships
// the kit's popover (Kit.attachPopover); variant b leaves the kit without one, so the only popover at hand is the
// legacy component's hint, which stays open after the pointer leaves it. Prints the brief to give the implementer.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [target, flag, value] = process.argv.slice(2);
const variant = flag === "--variant" ? value : "a";
if (!target || !["a", "b"].includes(variant)) { console.error("usage: make-arm.mjs <dir> [--variant a|b]"); process.exit(2); }
const dir = path.resolve(target);
if (fs.existsSync(dir) && fs.readdirSync(dir).length) { console.error(`${dir} is not empty`); process.exit(2); }
fs.cpSync(path.join(HERE, "project"), dir, { recursive: true });
fs.cpSync(path.join(HERE, "pack"), path.join(dir, "design"), { recursive: true });
if (variant === "b") {
  fs.rmSync(path.join(dir, "kit/popover.js"));
  const story = path.join(dir, "story.html"), readme = path.join(dir, "README.md");
  fs.writeFileSync(story, fs.readFileSync(story, "utf8").replace(/<script src="kit\/popover\.js"><\/script>\n/, ""));
  fs.writeFileSync(readme, fs.readFileSync(readme, "utf8").replace(/ and\n`popover\.js` \(`Kit\.attachPopover`\)\./, "."));
}
console.log(fs.readFileSync(path.join(HERE, "brief.md"), "utf8").trim());
