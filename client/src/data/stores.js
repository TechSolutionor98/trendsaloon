// The physical stores a customer can collect from.
// Primary location: Trend Saloon (Al Yasmeen - Ajman)
export const STORES = [
  {
    storeId: "1",
    name: "Trend Saloon",
    address: "Al Yasmeen - Ajman, United Arab Emirates",
    phone: "+971 559 740 849",
    img: "/white-logo.png",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Al%20Yasmeen,%20Ajman,%20United%20Arab%20Emirates&t=&z=14&ie=UTF8&iwloc=&output=embed",
    coordinates: { lat: 25.3995, lng: 55.4795 },
    visible: true,
  },
  {
    storeId: "trend-saloon",
    name: "Trend Saloon",
    address: "Al Yasmeen - Ajman, United Arab Emirates",
    phone: "+971 559 740 849",
    img: "/white-logo.png",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Al%20Yasmeen,%20Ajman,%20United%20Arab%20Emirates&t=&z=14&ie=UTF8&iwloc=&output=embed",
    coordinates: { lat: 25.3995, lng: 55.4795 },
    visible: false,
  },
  {
    storeId: "2",
    name: "Trend Saloon",
    address: "Al Yasmeen - Ajman, United Arab Emirates",
    phone: "+971 559 740 849",
    img: "/white-logo.png",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Al%20Yasmeen,%20Ajman,%20United%20Arab%20Emirates&t=&z=14&ie=UTF8&iwloc=&output=embed",
    coordinates: { lat: 25.3995, lng: 55.4795 },
    visible: false,
  },
  {
    storeId: "3",
    name: "Trend Saloon",
    address: "Al Yasmeen - Ajman, United Arab Emirates",
    phone: "+971 559 740 849",
    img: "/white-logo.png",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Al%20Yasmeen,%20Ajman,%20United%20Arab%20Emirates&t=&z=14&ie=UTF8&iwloc=&output=embed",
    coordinates: { lat: 25.3995, lng: 55.4795 },
    visible: false,
  },
  {
    storeId: "4",
    name: "Trend Saloon",
    address: "Al Yasmeen - Ajman, United Arab Emirates",
    phone: "+971 559 740 849",
    img: "/white-logo.png",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Al%20Yasmeen,%20Ajman,%20United%20Arab%20Emirates&t=&z=14&ie=UTF8&iwloc=&output=embed",
    coordinates: { lat: 25.3995, lng: 55.4795 },
    visible: false,
  },
]

export const visibleStores = () => STORES.filter((store) => store.visible !== false)

export const findStore = (storeId) => STORES.find((store) => store.storeId === storeId) || STORES[0]

export default STORES
