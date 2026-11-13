// A line of code as markup with its comments, strings, numbers and keywords marked, by the file's extension.
// One line at a time and by pattern: enough to read a diff by, not a parser.
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
