import axios from "axios"
import config from "../config/config"
import { getFullImageUrl } from "../utils/imageUtils"

// Initial default services matching the design mockup
export const DEFAULT_SERVICES = [
  {
    _id: "65f1a2b3c4d5e6f7a8b90001",
    name: "Haircut",
    subtitle: "Modern & Classic Styles",
    price: 50,
    image: "/salon/haircut.jpg",
    iconType: "scissors",
    category: "Services",
    stockStatus: "In Stock",
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b90002",
    name: "Beard Trim",
    subtitle: "Sharp & Stylish Look",
    price: 50,
    image: "/salon/beard-trim.jpg",
    iconType: "beard",
    category: "Services",
    stockStatus: "In Stock",
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b90003",
    name: "Moroccan Bath",
    subtitle: "Deep Cleansing & Care",
    price: 69,
    image: "/salon/moroccan-bath.jpg",
    iconType: "bath",
    category: "Services",
    stockStatus: "In Stock",
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b90004",
    name: "Massage",
    subtitle: "Relax & Rejuvenate",
    price: 69,
    image: "/salon/massage.jpg",
    iconType: "massage",
    category: "Services",
    stockStatus: "In Stock",
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b90005",
    name: "Hydra Facial",
    subtitle: "Deep Skin Care",
    price: 50,
    image: "/salon/hydra-facial.jpg",
    iconType: "facial",
    category: "Services",
    stockStatus: "In Stock",
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b90006",
    name: "Manicure & Pedicure",
    subtitle: "Complete Hand & Foot Care",
    price: 69,
    image: "/salon/manicure-pedicure.jpg",
    iconType: "manicure",
    category: "Services",
    stockStatus: "In Stock",
  },
]

// Initial default products matching the design mockup
export const DEFAULT_PRODUCTS = [
  {
    _id: "65f1a2b3c4d5e6f7a8b90007",
    name: "Hair Care Products",
    subtitle: "Shampoo & Conditioning",
    price: 75,
    image: "/salon/hair-care.jpg",
    category: "Products",
    stockStatus: "In Stock",
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b90008",
    name: "Beard Care Kit",
    subtitle: "Oil, Balm & Grooming Tool",
    price: 99,
    image: "/salon/beard-kit.jpg",
    category: "Products",
    stockStatus: "In Stock",
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b90009",
    name: "Skincare Products",
    subtitle: "Daily Hydration & Cleanser",
    price: 89,
    image: "/salon/skincare.jpg",
    category: "Products",
    stockStatus: "In Stock",
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b90010",
    name: "Styling Gel",
    subtitle: "Strong Hold & Natural Finish",
    price: 49,
    image: "/salon/styling-gel.jpg",
    category: "Products",
    stockStatus: "In Stock",
  },
]

// Special Combo Deal
export const SPECIAL_OFFER_COMBO = {
  _id: "65f1a2b3c4d5e6f7a8b90011",
  name: "Haircut + Beard Trim + Manicure",
  subtitle: "Full Royal Grooming Combo",
  price: 50,
  originalPrice: 169,
  image: "/salon/hero-barber.jpg",
  category: "Special Offers",
  stockStatus: "In Stock",
}

/**
 * Helper to determine if a product is a service
 */
export const isServiceItem = (item) => {
  if (!item) return false

  // 1. Check parentCategory and category names
  const parentCatName = String(
    item.parentCategory?.name ||
    item.parentCategoryName ||
    ""
  ).toLowerCase().trim()

  const catName = String(
    item.category?.name ||
    item.category ||
    ""
  ).toLowerCase().trim()

  // Explicit Category assignment takes absolute priority:
  if (parentCatName === "products" || catName === "products") return false
  if (parentCatName === "services" || catName === "services") return true

  if (parentCatName.includes("product") || catName.includes("product")) return false
  if (parentCatName.includes("service") || catName.includes("service")) return true

  // 2. Tags check
  const tags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).toLowerCase()) : []
  if (tags.some((t) => t === "product" || t.includes("product"))) return false
  if (tags.some((t) => t === "service" || t.includes("service"))) return true

  // 3. Title-based product heuristics (items containing product terms are products)
  const name = String(item.name || "").toLowerCase()
  const isProductKeyword = [
    "shampoo",
    "conditioner",
    "cream",
    "wax",
    "kit",
    "gel",
    "mask",
    "protein",
    "brush",
    "razor",
    "nipper",
    "scrub",
    "balm",
    "tonic",
    "spray",
    "powder",
    "pen",
    "salt",
    "bottle",
    "serum",
    "fiber",
    "dryer",
    "oil",
  ].some((k) => name.includes(k))

  if (isProductKeyword) return false

  // 4. Fallback only for direct service names
  const isDirectServiceTitle = [
    "haircut",
    "beard trim",
    "moroccan bath",
    "massage",
    "hydra facial",
    "manicure & pedicure",
  ].some((t) => name.includes(t))

  return isDirectServiceTitle
}

const CATALOG_STORAGE_KEY = "trend_salon_catalog_v1"

export const getCachedSalonCatalog = () => {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.services) && Array.isArray(parsed.products)) {
        return parsed
      }
    }
  } catch {}
  return {
    services: DEFAULT_SERVICES,
    products: DEFAULT_PRODUCTS,
    isDynamic: false,
  }
}

/**
 * Fetch dynamic products and services from backend API
 */
export const fetchSalonCatalog = async () => {
  try {
    // Fetch products cleanly without cache-busting so backend in-memory cache responds in ~2ms
    const res = await axios.get(`${config.API_URL}/api/products?limit=500`, {
      timeout: 8000,
    })

    const dbProducts = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.products)
      ? res.data.products
      : []

    if (dbProducts.length === 0) {
      return getCachedSalonCatalog()
    }

    const dynamicServices = []
    const dynamicProducts = []

    dbProducts.forEach((item) => {
      const isService = isServiceItem(item)
      const rawImage = item.image || (Array.isArray(item.images) && item.images[0]?.url) || ""
      const defaultPlaceholder = isService ? "/salon/hero-barber.jpg" : "/salon/hair-care.jpg"
      const resolvedImage = getFullImageUrl(rawImage) || defaultPlaceholder

      const formatted = {
        _id: item._id,
        name: item.name,
        slug: item.slug || item._id,
        sku: item.sku || "",
        subtitle: item.shortDescription || item.nameAr || "",
        price: Number(item.offerPrice || item.price || 0),
        originalPrice: item.offerPrice ? Number(item.price) : undefined,
        image: resolvedImage,
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [{ url: resolvedImage }],
        category: item.category?.name || item.parentCategory?.name || (isService ? "Services" : "Products"),
        stockStatus: item.stockStatus || (item.countInStock > 0 ? "In Stock" : "Out of Stock"),
        countInStock: item.countInStock,
        createdAt: item.createdAt,
      }

      if (isService) {
        dynamicServices.push(formatted)
      } else {
        dynamicProducts.push(formatted)
      }
    })

    // If database has services, use them; otherwise keep default mockup services
    const finalServices = dynamicServices.length > 0 ? dynamicServices : DEFAULT_SERVICES

    // If database has products, use them; otherwise keep default mockup products
    const finalProducts = dynamicProducts.length > 0 ? dynamicProducts : DEFAULT_PRODUCTS

    const result = {
      services: finalServices,
      products: finalProducts,
      isDynamic: dynamicServices.length > 0 || dynamicProducts.length > 0,
    }

    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(result))
    } catch {}

    return result
  } catch (err) {
    console.warn("Could not load dynamic products from API, using cached catalog:", err.message)
    return getCachedSalonCatalog()
  }
}

// Cached banners storage helper for instant 0ms banner loading without any static flash
const BANNER_STORAGE_KEY = "trend_salon_banners_v1"

export const DEFAULT_SALON_BANNERS = {
  home: {
    image: "/uploads/others/1st__1_-1794578064135-265383882.png",
    mobileImage: "",
    title: "",
    subtitle: "",
    tagline: "",
    buttonText: "",
  },
  offers: {
    image: "/uploads/others/3rd_jpg-1794582252013-625192313.jpeg",
    mobileImage: "",
    title: "",
    subtitle: "",
    buttonText: "",
    link: "",
  },
  services: {
    image: "/uploads/others/2nd-1794582305379-234332284.png",
    mobileImage: "",
    title: "",
    subtitle: "",
  },
  products: {
    image: "/uploads/others/2nd-1794582320874-530457510.png",
    mobileImage: "",
    title: "",
    subtitle: "",
  },
  contact: {
    image: "",
    mobileImage: "",
  },
}

export const getCachedSalonBanners = () => {
  try {
    const raw = localStorage.getItem(BANNER_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") {
        return {
          home: { ...DEFAULT_SALON_BANNERS.home, ...(parsed.home || {}) },
          offers: { ...DEFAULT_SALON_BANNERS.offers, ...(parsed.offers || {}) },
          services: { ...DEFAULT_SALON_BANNERS.services, ...(parsed.services || {}) },
          products: { ...DEFAULT_SALON_BANNERS.products, ...(parsed.products || {}) },
          contact: { ...DEFAULT_SALON_BANNERS.contact, ...(parsed.contact || {}) },
        }
      }
    }
  } catch {}
  return DEFAULT_SALON_BANNERS
}

export const fetchSalonBanners = async () => {
  try {
    const res = await axios.get(`${config.API_URL}/api/banners/salon-banners`)
    if (res.data && typeof res.data === "object") {
      const merged = {
        home: { ...DEFAULT_SALON_BANNERS.home, ...(res.data.home || {}) },
        offers: { ...DEFAULT_SALON_BANNERS.offers, ...(res.data.offers || {}) },
        services: { ...DEFAULT_SALON_BANNERS.services, ...(res.data.services || {}) },
        products: { ...DEFAULT_SALON_BANNERS.products, ...(res.data.products || {}) },
        contact: { ...DEFAULT_SALON_BANNERS.contact, ...(res.data.contact || {}) },
      }
      try {
        localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(merged))
      } catch {}
      return merged
    }
  } catch (err) {
    console.warn("Could not fetch salon banners:", err.message)
  }
  return getCachedSalonBanners()
}

