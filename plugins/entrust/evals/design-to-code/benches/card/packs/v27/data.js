// Offers for story.html: story.html?data=<name> renders one. The frames' own data is under their names.
const network = { text: "MC-LAG 25/25", private: "25 Гбит/с", public: "25 Гбит/с", reservation: "MC-LAG", link: "#mc-lag" };
const power = { text: "2+ PSU", help: "Два блока питания с горячей заменой" };
const cpu = { model: "EPYC 9374F", vendor: "AMD", frequency: "3.33", cores: 16, count: 2 };
window.OFFERS = {
  "card-764": { id: "o-764", sku: "BA-i201-B", badges: [{ text: "High performance" }], cpu,
    cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" },
    disks: [{ count: 2, size: "838", type: "SSD" }], network, power,
    price: { amount: "125 898,00 ₽" }, stock: { count: 1, low: false }, configurable: false },
  "card-601": { id: "o-601", sku: "BA-i201-B", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }], cpu,
    cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" },
    disks: [{ count: 2, size: "18626", type: "NVME" }], network, power,
    price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } }, stock: { count: 1, low: true }, configurable: false },
  "card-486": { id: "o-486", sku: "BA-i201-B", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }], cpu,
    cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" },
    disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "HDD" }, { count: 2, size: "838", type: "SSD" }], network, power,
    price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } }, stock: { count: 1, low: true }, configurable: false },
  "card-280": { id: "o-280", sku: "HA-a701-6N-4H-2X25G", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }], cpu,
    cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" },
    disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "HDD" }, { count: 2, size: "838", type: "SSD" }], network, power,
    price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } }, stock: { count: 1, low: true }, configurable: false },
  // Stress stories: the longest legal values of the contract, every conditional piece, and more than it allows.
  dense: { id: "o-dense", sku: "HA-a701-6N-4H-2X25G-EXTRA-LONG-SKU-0123456", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }, { text: "Best price this month" }, { text: "Limited edition" }],
    cpu: { model: "EPYC 9374F 32-Core Processor", vendor: "AMD", frequency: "3.33", cores: 16, count: 2 },
    cores: { total: "32 ядра", threads: "64 потока" }, ram: { size: "1024 ГБ", type: "DDR5 ECC Registered" },
    disks: [{ count: 12, size: "18626", type: "NVME" }, { count: 24, size: "5587", type: "HDD" }, { count: 2, size: "838", type: "SSD" }, { count: 4, size: "1920", type: "SATA" }],
    network, power, price: { amount: "12 345 678 125,00 ₽", period: "/ месяц", discount: { old: "13 999 900 000,00 ₽", until: "31.12.2026" } },
    stock: { count: 1234, low: true }, configurable: true },
  many: { id: "o-many", sku: "BA-i201-B", badges: ["a", "b", "c", "d", "e", "f"].map((t, i) => ({ text: "Badge " + t, tone: i ? undefined : "accent" })),
    cpu, cores: { total: "32 ядра", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" },
    disks: Array.from({ length: 8 }, (_, i) => ({ count: i + 1, size: String(838 * (i + 1)), type: i % 2 ? "SSD" : "HDD" })),
    network, power, price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } },
    stock: { count: 3, low: false }, configurable: true },
  minimal: { id: "o-min", sku: "A", badges: [], cpu: { ...cpu, count: 1, cores: 1 }, cores: { total: "1 ядро", threads: "2 потока" },
    ram: { size: "8 ГБ", type: "DDR4" }, disks: [{ count: 1, size: "480", type: "SSD" }], network, power,
    price: { amount: "990,00 ₽" }, stock: { count: 12, low: false }, configurable: false },
};
