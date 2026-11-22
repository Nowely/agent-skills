// The judge's offers: the frames' own data, a dense one no frame draws (as the released control's), and plain ones.
const network = { text: "MC-LAG 25/25", private: "25 Гбит/с", public: "25 Гбит/с", reservation: "MC-LAG", link: "#mc-lag" };
const power = { text: "2+ PSU", help: "Два блока питания с горячей заменой" };
const cpu = { model: "EPYC 9374F", vendor: "AMD", frequency: "3.33", cores: 16, count: 2 };
const base = { cpu, cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" }, network, power };
window.OFFERS = {
  "card-764": { ...base, id: "o-764", sku: "BA-i201-B", badges: [{ text: "High performance" }], disks: [{ count: 2, size: "838", type: "SSD" }],
    price: { amount: "125 898,00 ₽" }, stock: { count: 1, low: false }, configurable: false },
  "card-601": { ...base, id: "o-601", sku: "BA-i201-B", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }], disks: [{ count: 2, size: "18626", type: "NVME" }],
    price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } }, stock: { count: 1, low: true }, configurable: false },
  "card-486": { ...base, id: "o-486", sku: "BA-i201-B", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }],
    disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "HDD" }, { count: 2, size: "838", type: "SSD" }],
    price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } }, stock: { count: 1, low: true }, configurable: false },
  "card-280": { ...base, id: "o-280", sku: "HA-a701-6N-4H-2X25G", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }],
    disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "HDD" }, { count: 2, size: "838", type: "SSD" }],
    price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } }, stock: { count: 1, low: true }, configurable: false },
  dense: { ...base, id: "o-dense", sku: "BA-EDGE-2026-TRIPLE-STORAGE", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }],
    cores: { total: "32 ядра", threads: "64 потока" }, network: { ...network, text: "MC-LAG 25/10", public: "10 Гбит/с" },
    disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "HDD" }, { count: 2, size: "838", type: "SSD" }],
    price: { amount: "1 234 567 890,00 ₽", period: "/ месяц", discount: { old: "1 400 000 000,00 ₽", until: "31.12" } }, stock: { count: 6, low: true }, configurable: true },
  // Judge v2: many entries, beyond any frame and the contract's maximum, to see the card grow rather than overlap.
  many: { ...base, id: "o-many", sku: "BA-EDGE-2026-TRIPLE-STORAGE-NVME-RAID10X", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }, { text: "Hot swap" }, { text: "IPMI" }],
    cores: { total: "32 ядра", threads: "64 потока" }, network: { ...network, text: "MC-LAG 25/10", public: "10 Гбит/с" },
    disks: [838, 1920, 3840, 5587, 7680, 9600, 15360, 18626].map((size, i) => ({ count: (i % 4) + 1, size: String(size), type: i % 3 ? "HDD" : "NVME" })),
    price: { amount: "1 234 567 890,00 ₽", period: "/ месяц", discount: { old: "1 400 000 000,00 ₽", until: "31.12" } }, stock: { count: 6, low: true }, configurable: true },
};
