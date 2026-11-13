"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useToast } from "../context/ToastContext"
import TrendHeader from "../components/TrendHeader"
import TrendFooter from "../components/TrendFooter"
import { fetchSalonCatalog } from "../services/salonService"
import { ArrowRight, Check, ChevronRight } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"

export default function ServicesProducts() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  const { showToast } = useToast()

  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedItemIds, setAddedItemIds] = useState({})
  const [servicesBanner, setServicesBanner] = useState({
    title: "Our Services & Products",
    subtitle: "Professional Care. Premium Quality.",
    image: "/salon/services-man.png",
  })

  // Load catalog dynamically from backend API / MongoDB
  useEffect(() => {
    let isMounted = true
    async function loadCatalog() {
      setLoading(true)
      const data = await fetchSalonCatalog()
      if (isMounted) {
        setServices(data.services)
        setProducts(data.products)
        setLoading(false)
      }
    }
    loadCatalog()

    async function loadBanner() {
      try {
        const res = await axios.get(`${config.API_URL}/api/banners/salon-banners?_t=${Date.now()}`)
        if (isMounted && res.data?.services) {
          setServicesBanner((prev) => ({ ...prev, ...res.data.services }))
        }
      } catch (err) {
        // Fallback default
      }
    }
    loadBanner()

    return () => {
      isMounted = false
    }
  }, [])

  // Handle adding service or product to cart
  const handleAddToCart = (item, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const cartPayload = {
      _id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice || item.price,
      image: item.image,
      images: Array.isArray(item.images) ? item.images : [{ url: item.image }],
      stockStatus: item.stockStatus || "In Stock",
      category: item.category || "Services",
    }

    addToCart(cartPayload, 1)

    // Flash added feedback on button
    setAddedItemIds((prev) => ({ ...prev, [item._id]: true }))
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item._id]: false }))
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-gray-900 font-sans selection:bg-[#dfa742] selection:text-black">
      {/* 1. Header Navigation */}
      <TrendHeader active="services" />

      {/* 2. Hero Banner (Matching Exact Mockup with Dynamic Admin Controls) */}
      <section className="relative bg-[#0d0e11] text-white overflow-hidden py-10 sm:py-14">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#dfa742]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Right Hero Image: Gentleman grooming scene seamlessly blended into dark background */}
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-3/5 lg:w-[52%] pointer-events-none overflow-hidden select-none">
          <img
            src={getFullImageUrl(servicesBanner.image) || "/salon/services-man.png"}
            alt="Trend Salon Services & Products"
            className="w-full h-full object-cover object-right sm:object-center filter brightness-100"
          />
          {/* Subtle blend gradient on the left edge */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e11] via-[#0d0e11]/60 to-transparent sm:via-[#0d0e11]/25" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl space-y-2.5">
            {/* Salon Emblem/Logo above title matching exact mockup */}
            <div className="flex items-center gap-2 pb-0.5">
              <div className="w-8 h-8 rounded-full bg-[#dfa742]/15 border border-[#dfa742]/40 flex items-center justify-center shadow-sm">
                <svg
                  className="w-4 h-4 text-[#dfa742]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <line x1="20" y1="4" x2="8.12" y2="15.88" />
                  <line x1="14.47" y1="14.48" x2="20" y2="20" />
                  <line x1="8.12" y1="8.12" x2="12" y2="12" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xs tracking-widest text-[#dfa742] uppercase leading-none drop-shadow-sm">
                  TREND
                </span>
                <span className="text-[7px] tracking-[0.25em] text-[#e0cfab] uppercase font-medium">
                  GENTS SALOON
                </span>
              </div>
            </div>

            {/* Title styled with luxury gold matching mockup */}
            {Boolean(servicesBanner.title?.trim()) && (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#dfa742] tracking-tight">
                {servicesBanner.title}
              </h1>
            )}

            {/* Subtitle */}
            {Boolean(servicesBanner.subtitle?.trim()) && (
              <p className="text-gray-200 text-sm sm:text-base font-light tracking-wide">
                {servicesBanner.subtitle}
              </p>
            )}

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 pt-1" aria-label="Breadcrumb">
              <Link to={getLocalizedPath("/")} className="hover:text-[#dfa742] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-200 font-medium">Services & Products</span>
            </nav>
          </div>
        </div>
      </section>

      {/* 3. Main Content Area (Two Columns Layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* =========================================================
              LEFT COLUMN: Our Services (~65-70% width)
              ========================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section Header */}
            <div className="text-center sm:text-left mb-6">
              <div className="inline-flex items-center gap-3">
                <span className="w-8 h-[1.5px] bg-[#dfa742]" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Our Services
                </h2>
                <span className="w-8 h-[1.5px] bg-[#dfa742]" />
              </div>
            </div>

            {/* Services Grid (3 columns on desktop, 2 on tablet, 1-2 on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {services.map((service) => {
                const isAdded = addedItemIds[service._id]

                return (
                  <div
                    key={service._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col p-3.5 text-center group"
                  >
                    {/* Service Image Frame */}
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-gray-100">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Golden Scissors Icon matching mockup */}
                    <div className="my-1 flex justify-center text-[#dfa742]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="6" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <line x1="20" y1="4" x2="8.12" y2="15.88" />
                        <line x1="14.47" y1="14.48" x2="20" y2="20" />
                        <line x1="8.12" y1="8.12" x2="12" y2="12" />
                      </svg>
                    </div>

                    {/* Service Title */}
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">
                      {service.name}
                    </h3>

                    {/* Price */}
                    <div className="text-sm font-bold text-gray-900 mt-1 mb-3">
                      AED {service.price}
                    </div>

                    {/* Action Button: Replace 'Book Now' with 'Add to Cart ->' */}
                    <button
                      onClick={(e) => handleAddToCart(service, e)}
                      className={`mt-auto w-full py-2 px-3 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 ${
                        isAdded
                          ? "bg-green-600 text-white"
                          : "bg-[#dfa742] hover:bg-[#caa638] text-black shadow-[#dfa742]/20"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <span>Add to Cart</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: Our Products (~30-35% width)
              ========================================================= */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              {/* Products Heading */}
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Our Products
              </h2>

              {/* Vertical Products List */}
              <div className="space-y-4">
                {products.map((product) => {
                  const isAdded = addedItemIds[product._id]

                  return (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 p-1 border border-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Name & Price */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <div className="text-xs font-bold text-gray-700 mt-0.5">
                          AED {product.price}
                        </div>
                      </div>

                      {/* Quick Add Button */}
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`py-1.5 px-4 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex-shrink-0 ${
                          isAdded
                            ? "bg-green-600 text-white"
                            : "bg-[#dfa742] hover:bg-[#caa638] text-black shadow-[#dfa742]/20"
                        }`}
                      >
                        {isAdded ? "Added" : "Add"}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Featured Promo Card inside Right Column */}
              <div className="mt-6 bg-[#111113] rounded-2xl p-4 text-white relative overflow-hidden flex items-center justify-between border border-white/10 group">
                {/* Left Text & CTA */}
                <div className="z-10 space-y-2 max-w-[55%]">
                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                    Premium Products
                    <br />
                    <span className="text-gray-300 font-normal text-xs sm:text-sm">
                      for Your Best Look
                    </span>
                  </h4>
                  <button
                    onClick={() => navigate(getLocalizedPath("/shop"))}
                    className="bg-[#dfa742] hover:bg-[#caa638] text-black font-semibold text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full inline-flex items-center gap-1 shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <span>Shop All Products</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Right Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
                  <img
                    src="/salon/promo-products.jpg"
                    alt="Salon Grooming Products"
                    className="w-full h-full object-contain rounded-xl filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <TrendFooter />
    </div>
  )
}

