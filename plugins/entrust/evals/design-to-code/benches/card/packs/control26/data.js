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
  // The longest legal values (README: SKU 40 characters, 4 badges, 4 disk groups, a long price), with a discount, a low stock and the configure action.
  "dense": { id: "o-dense", sku: "HA-a701-6N-4H-2X25G-EXTENDED-STORAGE-01", configurable: true,
    badges: [{ text: "New", tone: "accent" }, { text: "High performance" }, { text: "Best price" }, { text: "Limited" }], cpu,
    cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "1024 ГБ", type: "DDR3 ECC" },
    disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "NVME" }, { count: 2, size: "838", type: "SSD" }, { count: 12, size: "15360", type: "HDD" }], network, power,
    price: { amount: "1 125 898 000,00 ₽", period: "/ месяц", discount: { old: "1 139 900 000,00 ₽", until: "31.12" } }, stock: { count: 12, low: true } },
  // The wide frame's offer with every conditional piece: a discount, a low stock and the configure action.
  "wide-full": { id: "o-wide-full", sku: "BA-i201-B", configurable: true, badges: [{ text: "New", tone: "accent" }, { text: "High performance" }], cpu,
    cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" },
    disks: [{ count: 2, size: "838", type: "SSD" }], network, power,
    price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } }, stock: { count: 1, low: true } },
  // The least: no badge, one disk group, no period, no discount, in stock, not configurable.
  "minimal": { id: "o-min", sku: "X1", badges: [], cpu: { model: "Xeon E-2288G", vendor: "Intel", frequency: "3.7", cores: 8, count: 1 },
    cores: { total: "8 ядер", threads: "16 потоков" }, ram: { size: "32 ГБ", type: "DDR4" },
    disks: [{ count: 1, size: "480", type: "SSD" }], network: { ...network, text: "1G" }, power: { text: "1 PSU", help: "Один блок питания" },
    price: { amount: "7 490 ₽" }, stock: { count: 20, low: false }, configurable: false },
  // Four disk groups and four badges on a mid-size offer.
  "many": { id: "o-many", sku: "BA-i201-B", configurable: true, badges: [{ text: "New", tone: "accent" }, { text: "High performance" }, { text: "Sale" }, { text: "Hot" }], cpu,
    cores: { total: "32 ядер", threads: "64 потока" }, ram: { size: "256 ГБ", type: "DDR3 ECC" },
    disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "HDD" }, { count: 2, size: "838", type: "SSD" }, { count: 2, size: "3840", type: "NVME" }], network, power,
    price: { amount: "125 898,00 ₽", period: "/ месяц" }, stock: { count: 3, low: false } },
};
