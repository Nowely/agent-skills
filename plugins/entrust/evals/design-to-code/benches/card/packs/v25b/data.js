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

  // Stories beyond the frames. dense: the longest legal values of the contract (40-character SKU, 4 badges, 4 disk
  // groups, a long price with a discount, low stock) and the configure action, together.
  dense: { id: "o-dense", sku: "HA-a701-6N-4H-2X25G-ABCDEFGHIJ-0123456-X",
    badges: [{ text: "New", tone: "accent" }, { text: "High performance" }, { text: "Best price" }, { text: "Limited offer" }],
    cpu: { model: "Xeon Platinum 8480+ Sapphire Rapids", vendor: "Intel", frequency: "3.33", cores: 56, count: 4 },
    cores: { total: "224 ядра", threads: "448 потоков" }, ram: { size: "2048 ГБ", type: "DDR5 ECC Registered" },
    disks: [{ count: 12, size: "18626", type: "NVME" }, { count: 24, size: "5587", type: "HDD" }, { count: 12, size: "18626", type: "HDD" }, { count: 2, size: "838", type: "SSD" }],
    network: { text: "MC-LAG 100/100", private: "100 Гбит/с", public: "100 Гбит/с", reservation: "MC-LAG", link: "#mc-lag" }, power,
    price: { amount: "12 345 678 901,00 ₽", period: "/ месяц", discount: { old: "13 900 000 000,00 ₽", until: "31.12.2026" } },
    stock: { count: 1000, low: true }, configurable: true },
  // many: more entries than any frame shows and than the contract allows (8 disk groups, 6 badges): the card must grow.
  many: { id: "o-many", sku: "BA-i201-B",
    badges: [{ text: "New", tone: "accent" }, { text: "High performance" }, { text: "Best price" }, { text: "Limited offer" }, { text: "Hot" }, { text: "Ready today" }],
    cpu, cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" },
    disks: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ count: i, size: String(838 * i), type: i % 2 ? "SSD" : "HDD" })),
    network, power, price: { amount: "125 898,00 ₽", period: "/ месяц" }, stock: { count: 7, low: false }, configurable: true },
  // short: the least the contract allows: no badges, one disk group, no period, no discount, not low, not configurable.
  short: { id: "o-short", sku: "A1", badges: [], cpu, cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "64 ГБ", type: "DDR4" },
    disks: [{ count: 1, size: "480", type: "SSD" }], network, power, price: { amount: "9 990 ₽" }, stock: { count: 12, low: false }, configurable: false },
  // configure: an offer that allows configuring, a discount and a normal stock.
  configure: { id: "o-cfg", sku: "BA-i201-B", badges: [{ text: "High performance" }], cpu, cores: { total: "32 ядер", threads: "64 потока" },
    ram: { size: "256 ГБ", type: "DDR3 ECC" }, disks: [{ count: 2, size: "838", type: "SSD" }], network, power,
    price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } }, stock: { count: 3, low: false }, configurable: true },
};
