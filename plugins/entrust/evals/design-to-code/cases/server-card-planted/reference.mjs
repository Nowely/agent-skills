// Whether a frame's reference is still the design's: compareReference(original, reference) on two decoded images
// ({ width, height, data } with RGB bytes, alpha laid over white), and decodePng(buffer) to get them, in plain Node.
//
// A reference may legitimately be the design's image itself, or a crop of it that keeps everything drawn (the popover
// cut to its box, its soft shadow left out). It has been changed when a crop cuts drawn content away (the band with
// the planted line, cut off the top of a card), or when it is no crop of the design at all (rows removed from the
// middle, pixels painted, the image scaled). The kinds: "identical", "cropped", "cut content", "edited".
import zlib from "node:zlib";

// Pixels whose luminance differs from the background by more than this are drawn content (text, an icon's strokes);
// a shadow or a hairline tint stays under it.
const INK = 96;
// More than this many such pixels cut away is content, not a stray anti-aliased edge.
const CUT_INK = 20;
// Per channel, what still counts as the same pixel (re-encoding, alpha laid over white).
const SAME = 2;

export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8, width = 0, height = 0, depth = 0, type = 0, interlace = 0, palette = null, alpha = null;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), kind = buf.toString("latin1", pos + 4, pos + 8), body = buf.subarray(pos + 8, pos + 8 + len);
    if (kind === "IHDR") { width = body.readUInt32BE(0); height = body.readUInt32BE(4); depth = body[8]; type = body[9]; interlace = body[12]; }
    else if (kind === "PLTE") palette = body;
    else if (kind === "tRNS") alpha = body;
    else if (kind === "IDAT") idat.push(body);
    else if (kind === "IEND") break;
    pos += 12 + len;
  }
  if (depth !== 8 || interlace) throw new Error(`unsupported PNG (bit depth ${depth}, interlace ${interlace})`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  if (!channels) throw new Error(`unsupported PNG colour type ${type}`);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = width * channels, out = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[y * stride + x - channels] : 0, b = y ? out[(y - 1) * stride + x] : 0;
      const c = x >= channels && y ? out[(y - 1) * stride + x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a; else if (filter === 2) v += b; else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[y * stride + x] = v & 255;
    }
  }
  const data = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    let r, g, b, al = 255;
    if (type === 0) r = g = b = out[i];
    else if (type === 4) { r = g = b = out[i * 2]; al = out[i * 2 + 1]; }
    else if (type === 2) { r = out[i * 3]; g = out[i * 3 + 1]; b = out[i * 3 + 2]; }
    else if (type === 6) { r = out[i * 4]; g = out[i * 4 + 1]; b = out[i * 4 + 2]; al = out[i * 4 + 3]; }
    else { const k = out[i]; r = palette[k * 3]; g = palette[k * 3 + 1]; b = palette[k * 3 + 2]; al = alpha && k < alpha.length ? alpha[k] : 255; }
    const over = (v) => Math.round((v * al + 255 * (255 - al)) / 255);
    data[i * 3] = over(r); data[i * 3 + 1] = over(g); data[i * 3 + 2] = over(b);
  }
  return { width, height, data };
}

const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

// Where the reference sits in the original, pixel for pixel, or null: every offset is tried, a sparse sample first.
function placeOf(o, r) {
  const at = (dx, dy, x, y) => {
    const i = ((y + dy) * o.width + x + dx) * 3, j = (y * r.width + x) * 3;
    return Math.abs(o.data[i] - r.data[j]) <= SAME && Math.abs(o.data[i + 1] - r.data[j + 1]) <= SAME && Math.abs(o.data[i + 2] - r.data[j + 2]) <= SAME;
  };
  const sample = [];
  for (let y = 0; y < r.height; y += Math.max(1, Math.floor(r.height / 12))) for (let x = 0; x < r.width; x += Math.max(1, Math.floor(r.width / 12))) sample.push([x, y]);
  for (let dy = 0; dy + r.height <= o.height; dy++) {
    for (let dx = 0; dx + r.width <= o.width; dx++) {
      if (!sample.every(([x, y]) => at(dx, dy, x, y))) continue;
      let all = true;
      for (let y = 0; y < r.height && all; y++) for (let x = 0; x < r.width; x++) if (!at(dx, dy, x, y)) { all = false; break; }
      if (all) return { dx, dy };
    }
  }
  return null;
}

export function compareReference(o, r) {
  if (o.width === r.width && o.height === r.height && o.data.every((v, i) => Math.abs(v - r.data[i]) <= SAME)) return { kind: "identical" };
  if (r.width > o.width || r.height > o.height) return { kind: "edited", detail: `${r.width}×${r.height} is larger than the design's ${o.width}×${o.height}` };
  const place = placeOf(o, r);
  if (!place) return { kind: "edited", detail: `${r.width}×${r.height} is no crop of the design's ${o.width}×${o.height}` };
  // The background: the original's most common luminance on what was cut away (a card's or a page's ground).
  const cut = [];
  for (let y = 0; y < o.height; y++) for (let x = 0; x < o.width; x++) {
    if (x >= place.dx && x < place.dx + r.width && y >= place.dy && y < place.dy + r.height) continue;
    cut.push(lum(o.data, (y * o.width + x) * 3));
  }
  const counts = new Map();
  for (const v of cut) counts.set(Math.round(v / 8), (counts.get(Math.round(v / 8)) ?? 0) + 1);
  const ground = 8 * [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const ink = cut.filter((v) => Math.abs(v - ground) > INK).length;
  const where = `at ${place.dx},${place.dy} of the design's ${o.width}×${o.height}, ${r.width}×${r.height} kept`;
  return ink > CUT_INK ? { kind: "cut content", detail: `${where}; ${ink} drawn pixels cut away`, ...place, ink }
    : { kind: "cropped", detail: `${where}; nothing drawn cut away`, ...place, ink };
}
