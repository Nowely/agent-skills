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

// Added for the checks. dense: the longest legal values and every conditional piece at once. many: more entries
// than any frame shows. The rest are single cases of the contract.
const dense = {
  id: "o-dense", sku: "HA-a701-6N-4H-2X25G-NVME-PCI4-R750-EXT", // 40 characters
  badges: [{ text: "New", tone: "accent" }, { text: "High performance" }, { text: "Best price" }, { text: "Ready to ship" }],
  cpu: { model: "EPYC 9374F 32-Core Processor", vendor: "AMD", frequency: "3.33", cores: 16, count: 2 },
  cores: { total: "32 ядра", threads: "64 потока" }, ram: { size: "1024 ГБ", type: "DDR5 ECC Registered" },
  disks: [{ count: 4, size: "5587", type: "HDD" }, { count: 4, size: "18626", type: "NVME" }, { count: 2, size: "838", type: "SSD" }, { count: 12, size: "15360", type: "SATA" }],
  network: { text: "MC-LAG 100/100", private: "100 Гбит/с", public: "100 Гбит/с", reservation: "MC-LAG", link: "#mc-lag" },
  power: { text: "2+ PSU", help: "Два блока питания с горячей заменой" },
  price: { amount: "12 345 678,00 ₽", period: "/ месяц", discount: { old: "13 999 900,00 ₽", until: "31.12" } },
  stock: { count: 1234, low: true }, configurable: true,
};
window.OFFERS.dense = dense;
window.OFFERS.many = { ...dense, id: "o-many", sku: "BA-i201-B", badges: dense.badges, cpu: { ...dense.cpu, model: "EPYC 9374F" },
  ram: { size: "256 ГБ", type: "DDR3 ECC" }, price: { amount: "125 898,00 ₽", period: "/ месяц", discount: { old: "139 900,00 ₽", until: "31.12" } },
  stock: { count: 1, low: false }, configurable: false };
window.OFFERS["configurable"] = { ...window.OFFERS["card-601"], id: "o-cfg", configurable: true };
window.OFFERS["intel-single"] = { ...window.OFFERS["card-764"], id: "o-intel", sku: "XE-s100-1P", badges: [],
  cpu: { model: "Xeon Gold 6338", vendor: "Intel", frequency: "2.00", cores: 1, count: 1 }, cores: { total: "1 ядро", threads: "2 потока" },
  price: { amount: "9 990,00 ₽", period: "/ месяц" }, stock: { count: 12, low: false } };
