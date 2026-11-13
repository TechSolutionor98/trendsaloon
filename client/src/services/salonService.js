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
  const catName = String(
    item.category?.name ||
    item.parentCategory?.name ||
    item.parentCategoryName ||
    item.category ||
    ""
  ).toLowerCase()
  const name = String(item.name || "").toLowerCase()
  const tags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).toLowerCase()) : []

  if (catName.includes("service") || tags.includes("service")) return true
  if (
    name.includes("haircut") ||
    name.includes("beard") ||
    name.includes("massage") ||
    name.includes("bath") ||
    name.includes("facial") ||
    name.includes("manicure") ||
    name.includes("pedicure") ||
    name.includes("grooming") ||
    name.includes("spa")
  ) {
    return true
  }
  return false
}

/**
 * Fetch dynamic products and services from backend API
 */
export const fetchSalonCatalog = async () => {
  try {
    const res = await axios.get(`${config.API_URL}/api/products?limit=100&_t=${Date.now()}`, {
      timeout: 5000,
    })

    const dbProducts = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.products)
      ? res.data.products
      : []

    if (dbProducts.length === 0) {
      return {
        services: DEFAULT_SERVICES,
        products: DEFAULT_PRODUCTS,
        isDynamic: false,
      }
    }

    const dynamicServices = []
    const dynamicProducts = []

    dbProducts.forEach((item) => {
      const formatted = {
        _id: item._id,
        name: item.name,
        slug: item.slug || item._id,
        subtitle: item.shortDescription || item.nameAr || "",
        price: Number(item.offerPrice || item.price || 0),
        originalPrice: item.offerPrice ? Number(item.price) : undefined,
        image: getFullImageUrl(item.image) || "/salon/hero-barber.jpg",
        images: Array.isArray(item.images) ? item.images : [{ url: item.image }],
        category: item.category?.name || item.parentCategory?.name || (isServiceItem(item) ? "Services" : "Products"),
        stockStatus: item.stockStatus || "In Stock",
      }

      if (isServiceItem(item)) {
        dynamicServices.push(formatted)
      } else {
        dynamicProducts.push(formatted)
      }
    })

    // If database has services, use them; otherwise keep default mockup services
    const finalServices = dynamicServices.length > 0 ? dynamicServices : DEFAULT_SERVICES

    // If database has products, use them; otherwise keep default mockup products
    const finalProducts = dynamicProducts.length > 0 ? dynamicProducts : DEFAULT_PRODUCTS

    return {
      services: finalServices,
      products: finalProducts,
      isDynamic: dynamicServices.length > 0 || dynamicProducts.length > 0,
    }
  } catch (err) {
    console.warn("Could not load dynamic products from API, using default catalog:", err.message)
    return {
      services: DEFAULT_SERVICES,
      products: DEFAULT_PRODUCTS,
      isDynamic: false,
    }
  }
}

// Cached banners storage helper for instant 0ms banner loading without any static flash
const BANNER_STORAGE_KEY = "trend_salon_banners_v1"

export const getCachedSalonBanners = () => {
  try {
    const raw = localStorage.getItem(BANNER_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") return parsed
    }
  } catch {}
  return {
    home: {
      image: "/uploads/others/1st__1_-1794578064135-265383882.png",
      title: "",
      subtitle: "",
      tagline: "",
      buttonText: "",
    },
    offers: {
      image: "/uploads/others/3rd_jpg-1794582252013-625192313.jpeg",
      title: "",
      subtitle: "",
      buttonText: "",
      link: "",
    },
    services: {
      image: "/uploads/others/2nd-1794582305379-234332284.png",
      title: "",
      subtitle: "",
    },
    products: {
      image: "/uploads/others/2nd-1794582320874-530457510.png",
      title: "",
      subtitle: "",
    },
    contact: {
      image: "",
    },
  }
}

export const fetchSalonBanners = async () => {
  try {
    const res = await axios.get(`${config.API_URL}/api/banners/salon-banners?_t=${Date.now()}`)
    if (res.data) {
      try {
        localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(res.data))
      } catch {}
      return res.data
    }
  } catch (err) {
    console.warn("Could not fetch salon banners:", err.message)
  }
  return getCachedSalonBanners()
}

