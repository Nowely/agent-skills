// The judge's listings: the frames' own data, a dense one no frame draws, and a visitor's view.
window.LISTINGS = {
  frame: {
    id: "a-102", title: "2-room apartment, Riverside", address: "12 Harbour Street, Northbank",
    badges: [{ text: "New", tone: "accent" }, { text: "Pets allowed" }],
    specs: [{ value: "2", unit: "rooms" }, { value: "54", unit: "m²" }, { value: "7/12", unit: "floor" }],
    price: { amount: "1 850 €", period: "/ month", old: "2 100 €", discount: "−12%", until: "31 Dec" },
    availability: { text: "Available from 1 Feb", help: "Viewings by appointment. The agent replies within a day." },
    editable: true,
  },
  dense: {
    id: "d-9", title: "Spacious 4-room apartment with a south-facing terrace and a view over the old harbour",
    address: "Apartment 41, 118–120 Long Embankment Road, Northbank Riverside Quarter",
    badges: [{ text: "New", tone: "accent" }, { text: "Pets allowed" }, { text: "Furnished" }, { text: "Parking" },
      { text: "Last one on this floor", tone: "warn" }, { text: "Balcony" }],
    specs: [{ value: "4", unit: "rooms" }, { value: "126.5", unit: "m²" }, { value: "12/12", unit: "floor" },
      { value: "2", unit: "bathrooms" }, { value: "2027", unit: "built" }, { value: "3 m", unit: "ceilings" }],
    price: { amount: "12 345 €", period: "/ month", old: "13 900 €", discount: "−11%", until: "15 January 2027" },
    availability: { text: "Available from 1 February 2027, viewings by appointment only",
      help: "The agent replies within a day. Viewings on weekdays from 9 to 19 and on Saturdays from 10 to 14." },
    editable: true,
  },
  guest: {
    id: "g-7", title: "Studio, Old Town", address: "3 Market Lane", badges: [],
    specs: [{ value: "1", unit: "room" }, { value: "28", unit: "m²" }],
    price: { amount: "950 €", period: "/ month" },
    availability: { text: "Available now", help: "Contact the owner directly." },
    editable: false,
  },
};
