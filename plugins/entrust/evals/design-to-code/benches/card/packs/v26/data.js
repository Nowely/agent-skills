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
};

// Beyond the frames: the longest legal values and every conditional piece (4 badges, 4 disk groups, discount, low stock, configure).
OFFERS.dense = { id: "o-dense", sku: "HA-a701-6N-4H-2X25G-NVME-RAID-PLUS-1234", badges: [{ text: "New", tone: "accent" }, { text: "High performance" }, { text: "Best price" }, { text: "Limited" }], cpu: { model: "EPYC 9374F", vendor: "AMD", frequency: "3.33", cores: 64, count: 2 },
  cores: { total: "128 ядер", threads: "256 потоков" }, ram: { size: "1024 ГБ", type: "DDR5 ECC Registered" },
  disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "NVME" }, { count: 2, size: "838", type: "SSD" }, { count: 12, size: "3840", type: "SSD" }],
  network: { text: "MC-LAG 100/100", private: "100 Гбит/с", public: "100 Гбит/с", reservation: "MC-LAG", link: "#mc-lag" }, power: { text: "2+ PSU", help: "Два блока питания с горячей заменой" },
  price: { amount: "1 125 898,00 ₽", period: "/ месяц", discount: { old: "1 139 900,00 ₽", until: "31.12" } }, stock: { count: 12, low: true }, configurable: true };
// One badge, one disk group, one processor, no discount, not low, configurable.
OFFERS.plain = { id: "o-plain", sku: "BA-i201-B", badges: [], cpu: { ...cpu, count: 1 }, cores: { total: "16 ядер", threads: "32 потока" }, ram: { size: "64 ГБ", type: "DDR4 ECC" },
  disks: [{ count: 1, size: "480", type: "SSD" }], network, power, price: { amount: "35 990,00 ₽", period: "/ месяц" }, stock: { count: 14, low: false }, configurable: true };
OFFERS.many = { ...OFFERS.dense, id: "o-many", sku: "BA-i201-B", price: { amount: "125 898,00 ₽" }, configurable: false };
