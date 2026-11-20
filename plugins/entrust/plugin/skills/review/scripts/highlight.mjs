// A line of code as markup with its comments, strings, numbers and keywords marked, by the file's extension.
// One line at a time and by pattern: enough to read a diff by, not a parser. This is the fallback: the report
// renders with the vendored Shiki bundle (createSyntax below) when it is present, and with this highlighter
// when it is not. See vendor/README.md for the bundle's provenance and rebuild.
import { esc } from "./text.mjs";

const SLASH = String.raw`\/\/.*|\/\*.*?(?:\*\/|$)|^\s*\*(?:[ /].*)?$`, HASH = "#.*", DASH = "--.*";
const C_WORDS = "class interface enum struct public private protected static final const void int long double float boolean bool char string var val let fun func "
  + "return if else for while do switch case default break continue new try catch finally throw throws import package namespace using extends implements this super "
  + "null true false override abstract virtual async await";

function family(extensions, comment, quotes, keywords) {
  const string = [...quotes].map((q) => `${q}(?:\\\\.|[^${q}\\\\])*${q}?`).join("|");
  const pattern = new RegExp(`(${comment ?? "$^"})|(${string})|(\\b\\d[\\w.]*)|([A-Za-z_$][\\w$]*)`, "g");
  return extensions.split(" ").map((extension) => [extension, { pattern, keywords: new Set(keywords.split(" ")) }]);
}

const FAMILIES = new Map([
  ...family("js mjs cjs jsx ts tsx", SLASH, "\"'`", "const let var function return if else for while do switch case default break continue new delete typeof instanceof in of "
    + "class extends super this import export from async await try catch finally throw yield static get set null undefined true false void interface type enum implements readonly as"),
  ...family("py", HASH, "\"'", "def return if elif else for while in not and or is None True False class import from as with try except finally raise lambda pass break continue yield global nonlocal assert async await del self"),
  ...family("go", SLASH, "\"'`", "func return if else for range switch case default break continue go defer chan select struct interface map type package import var const nil true false"),
  ...family("rs", SLASH, "\"", "fn let mut return if else for while loop match impl trait struct enum pub use mod crate self Self super as in where async await move ref static const unsafe dyn true false None Some Ok Err"),
  ...family("java kt cs c h cpp hpp cc swift php scala dart", SLASH, "\"'", C_WORDS),
  ...family("rb", HASH, "\"'", "def end return if elsif else unless while until for in do class module require include nil true false self yield begin rescue ensure raise then and or not"),
  ...family("sh bash zsh yml yaml toml", HASH, "\"'", "if then else elif fi for in do done while case esac function return export local echo exit true false null"),
  ...family("sql", DASH, "'", "select from where insert into values update set delete create table alter drop join left right inner outer on group by order having limit and or not null as distinct"),
  ...family("css scss less", String.raw`\/\*.*?(?:\*\/|$)`, "\"'", ""),
  ...family("html xml svg vue svelte", "<!--.*?(?:-->|$)", "\"'", ""),
  ...family("json", null, "\"", "true false null"),
]);

export function highlight(text, path) {
  const known = FAMILIES.get(path.slice(path.lastIndexOf(".") + 1).toLowerCase());
  if (!known) return esc(text);
  let html = "", last = 0;
  for (const match of text.matchAll(known.pattern)) {
    const kind = match[1] ? "c" : match[2] ? "s" : match[3] ? "n" : known.keywords.has(match[4]) ? "k" : "";
    html += esc(text.slice(last, match.index)) + (kind ? `<span class="t-${kind}">${esc(match[0])}</span>` : esc(match[0]));
    last = match.index + match[0].length;
  }
  return html + esc(text.slice(last));
}

// The render-time Shiki syntax: one highlighter per render, each hunk's old and new line sequences tokenized
// whole (a multi-line comment or template keeps its coloring across lines), and each token's pair of colors as a
// class: `line` returns the code with class spans, `css` the rules for both themes. Every color is pre-adjusted to
// >=4.5:1 on the page's three code backgrounds of its theme — the GitHub palettes alone dip below that on the
// tinted added and removed rows. Returns null when the bundle is absent; the caller falls back to the pattern
// highlighter above, whose classes page.css colors. Nothing here reaches the network.
const SH_LANG = { ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx", mjs: "javascript", cjs: "javascript", scss: "scss", css: "css", json: "json", md: "markdown", markdown: "markdown", mdx: "markdown", svg: "xml", xml: "xml", html: "xml", yml: "yaml", yaml: "yaml" };
// Exactly page/page.css's --code-bg, --add-bg and --del-bg, light and dark.
const LIGHT_BGS = ["#ffffff", "#e9f6ed", "#fdeeec"].map((h) => hex2rgb(h));
const DARK_BGS = ["#151920", "#16291e", "#2e1a1d"].map((h) => hex2rgb(h));
// The code's own text colors in GitHub's light and dark themes: a token of them needs no span, page.css draws it.
const PLAIN = "#24292e", PLAIN_DARK = "#e1e4e8";
const TOKEN_TARGET = 4.6; // a margin over the 4.5 requirement
function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
const rgb2hex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const lumOf = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
const ratioOf = (a, b) => { const l1 = lumOf(a), l2 = lumOf(b); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); };

export async function createSyntax(files) {
  let mod;
  try { mod = await import("./vendor/shiki.mjs"); } catch { return null; }
  const hl = await mod.createHighlighterCore({ themes: mod.themes, langs: mod.langs, engine: mod.createJavaScriptRegexEngine() });
  const adjustCache = new Map();
  const adjustToken = (hex, bgs, lighten) => {
    const ck = hex + (lighten ? "d" : "l");
    if (adjustCache.has(ck)) return adjustCache.get(ck);
    const base = hex2rgb(hex);
    const minRatio = (c) => Math.min(...bgs.map((bg) => ratioOf(c, bg)));
    let out = hex;
    if (minRatio(base) < TOKEN_TARGET) {
      let lo = 0, hi = 1; // mix toward white (dark theme) or black (light theme) until every background passes
      for (let i = 0; i < 24; i++) { const t = (lo + hi) / 2; const c = base.map((v) => lighten ? v + (255 - v) * t : v * (1 - t)); if (minRatio(c) >= TOKEN_TARGET) hi = t; else lo = t; }
      out = rgb2hex(base.map((v) => lighten ? v + (255 - v) * hi : v * (1 - hi)));
    }
    adjustCache.set(ck, out);
    return out;
  };
  const fontOf = (style) => !style ? "" : `${style & 1 ? ";font-style:italic" : ""}${style & 2 ? ";font-weight:bold" : ""}${style & 4 ? ";text-decoration:underline" : ""}`;
  // One class per pair of theme colors and font style, numbered in the order met: the same diff draws the same page.
  const classes = new Map();
  const classOf = (light, dark, font) => {
    const key = `${light}|${dark}|${font}`;
    if (!classes.has(key)) classes.set(key, `t${classes.size}`);
    return classes.get(key);
  };
  const byLine = new Map();
  for (const f of files) {
    const lang = SH_LANG[f.path.slice(f.path.lastIndexOf(".") + 1).toLowerCase()];
    if (!lang) continue; // an unsupported language stays escaped plain text
    // The old sequence is what the base file holds (removed + context), the new what the head holds (added +
    // context). Each hunk is tokenized on its own: the diff skips the code between hunks, and a comment or
    // template left open at a hunk's end must not color the next hunk across that gap.
    for (const hunk of f.hunks) {
      for (const [side, keep] of [["old", (l) => l.kind !== "add"], ["new", (l) => l.kind !== "del"]]) {
        const seq = hunk.filter(keep);
        const text = seq.map((l) => l.text).join("\n");
        if (!text.trim()) continue;
        let tokens;
        try { tokens = hl.codeToTokens(text, { lang, themes: { light: "github-light", dark: "github-dark" } }).tokens; } catch { continue; }
        seq.forEach((l, i) => {
          const html = (tokens[i] ?? []).map((tok) => {
            const color = String(tok.htmlStyle?.color ?? tok.color ?? PLAIN).toLowerCase(), font = fontOf(tok.fontStyle);
            const darkColor = String(tok.htmlStyle?.["--shiki-dark"] ?? color).toLowerCase();
            if (color === PLAIN && darkColor === PLAIN_DARK && !font) return esc(tok.content);
            const light = adjustToken(color, LIGHT_BGS, false), dark = adjustToken(darkColor, DARK_BGS, true);
            return `<span class="${classOf(light, dark, font)}">${esc(tok.content)}</span>`;
          }).join("");
          if (html) byLine.set(l, html);
        });
      }
    }
  }
  const css = [...classes].map(([key, name]) => {
    const [light, dark, font] = key.split("|");
    return `.${name}{color:${light}${font}}\n:root[data-theme="dark"] .${name}{color:${dark}}\n`
      + `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .${name}{color:${dark}}}`;
  }).join("\n");
  return { line: (l) => byLine.get(l) ?? esc(l.text), css };
}
