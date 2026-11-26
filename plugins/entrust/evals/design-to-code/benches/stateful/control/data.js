// The catalogue's data: the frames' (default), the longest values (dense) and more entries than a frame shows (many).
const tee = { id: "tee", title: "Merino crew tee", sku: "MER-TEE-01", tags: ["Merino", "Machine wash"], sizes: ["S", "M", "L"], price: "€49.00", stock: "12 in stock" };
const hoodie = { id: "hoodie", title: "Loopback hoodie", sku: "LBK-HD-07", tags: ["Organic cotton"], sizes: ["S", "M", "L"], price: "€89.00", stock: "4 in stock" };
const shell = { id: "shell", title: "Packable rain shell", sku: "PCK-SH-03", tags: ["Waterproof", "Packable"], sizes: ["S", "M", "L"], price: "€129.00", stock: "Last one" };
const allTags = ["Merino", "Machine wash", "Organic cotton", "Waterproof", "Packable", "Recycled", "Reflective", "Taped seams"];
window.CATALOGUE = {
  default: [tee, hoodie, shell],
  dense: [
    { id: "shell-xl", title: "Packable three-layer waterproof rain shell with taped seams, a stowable hood and two zip pockets",
      sku: "PCK-SH-03-WP-3L-TAPED-HOOD", tags: allTags.slice(0, 6), sizes: ["S", "M", "L"], price: "€1 249.00", stock: "Only 1 left in stock" },
    tee, hoodie,
  ],
  many: [
    { ...tee, tags: allTags },
    ...[hoodie, shell, tee, hoodie, shell, tee, hoodie].map((item, i) => ({ ...item, id: `${item.id}-${i}`, tags: allTags.slice(0, 2 + (i % 5)) })),
  ],
};
