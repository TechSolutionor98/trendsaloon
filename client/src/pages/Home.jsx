"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useToast } from "../context/ToastContext"
import TrendHeader from "../components/TrendHeader"
import TrendFooter from "../components/TrendFooter"
import { getFullImageUrl } from "../utils/imageUtils"
import {
  fetchSalonCatalog,
  getCachedSalonCatalog,
  DEFAULT_SERVICES,
  DEFAULT_PRODUCTS,
  SPECIAL_OFFER_COMBO,
  getCachedSalonBanners,
  fetchSalonBanners,
  DEFAULT_SALON_BANNERS,
} from "../services/salonService"
import {
  Scissors,
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  Check,
  X,
  ChevronDown,
} from "lucide-react"

// Custom Service Icon Renderer
function ServiceIcon({ type }) {
  if (type === "scissors") {
    return (
      <svg className="w-5 h-5 text-[#dfa742]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    )
  }
  if (type === "beard") {
    return (
      <svg className="w-5 h-5 text-[#dfa742]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 8c0 3 1.5 6 4 7.5 1.5.9 3 1.5 4 1.5s2.5-.6 4-1.5c2.5-1.5 4-4.5 4-7.5 0-1-1-2-2-2h-3c-1 0-1.5.5-2 1-.5-.5-1-1-2-1H6C5 6 4 7 4 8z" />
      </svg>
    )
  }
  if (type === "bath") {
    return (
      <svg className="w-5 h-5 text-[#dfa742]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    )
  }
  if (type === "massage") {
    return (
      <svg className="w-5 h-5 text-[#dfa742]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    )
  }
  if (type === "facial") {
    return (
      <svg className="w-5 h-5 text-[#dfa742]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9z" />
        <path d="M9 10h.01M15 10h.01M8 15s1.5 2 4 2 4-2 4-2" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 text-[#dfa742]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
}

// Barber Pole Graphic Component
function BarberPole() {
  return (
    <div className="relative flex flex-col items-center w-14 sm:w-16 h-48 sm:h-56 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
      {/* Top Chrome Cap with brass finial */}
      <div className="w-12 sm:w-14 h-4 bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 rounded-t-full shadow-md" />
      <div className="w-14 sm:w-16 h-3 bg-gradient-to-r from-gray-500 via-gray-200 to-gray-500 rounded-sm shadow-inner" />

      {/* Cylindrical Glass Pole with Rotating Barber Stripes */}
      <div className="relative w-10 sm:w-12 flex-1 overflow-hidden rounded-md border-2 border-white/40 shadow-inner bg-white">
        <div
          className="absolute inset-0 w-full h-[200%] animate-barber-spin"
          style={{
            background: "repeating-linear-gradient(45deg, #d32f2f, #d32f2f 12px, #ffffff 12px, #ffffff 24px, #1976d2 24px, #1976d2 36px, #ffffff 36px, #ffffff 48px)",
          }}
        />
        {/* Glass Reflection Highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Bottom Chrome Cap */}
      <div className="w-14 sm:w-16 h-3 bg-gradient-to-r from-gray-500 via-gray-200 to-gray-500 rounded-sm shadow-inner" />
      <div className="w-12 sm:w-14 h-5 bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 rounded-b-full shadow-md" />

      {/* Small wall bracket */}
      <div className="w-4 h-2 bg-gray-600 rounded-b-sm" />
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  const { showToast } = useToast()

  const [services, setServices] = useState(() => getCachedSalonCatalog().services)
  const [products, setProducts] = useState(() => getCachedSalonCatalog().products)
  const [loading, setLoading] = useState(false)
  const [addedItemIds, setAddedItemIds] = useState({})
  const [offersModalOpen, setOffersModalOpen] = useState(false)

  // Homepage displays top 6 items; 'See More' navigates to full services/products page
  const visibleServices = services.slice(0, 6)
  const visibleProducts = products.slice(0, 5)
  const [heroBanner, setHeroBanner] = useState(() => getCachedSalonBanners()?.home || DEFAULT_SALON_BANNERS.home)
  const [offersBanner, setOffersBanner] = useState(() => getCachedSalonBanners()?.offers || DEFAULT_SALON_BANNERS.offers)

  // Fetch dynamic products and services from database/Admin
  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      const data = await fetchSalonCatalog()
      if (isMounted) {
        setServices(data.services)
        setProducts(data.products)
        setLoading(false)
      }
    }
    loadData()

    // Fetch dynamic hero & offers banner
    async function loadBanner() {
      const data = await fetchSalonBanners()
      if (isMounted && data) {
        if (data.home) setHeroBanner((prev) => ({ ...(prev || DEFAULT_SALON_BANNERS.home), ...data.home }))
        if (data.offers) setOffersBanner((prev) => ({ ...(prev || DEFAULT_SALON_BANNERS.offers), ...data.offers }))
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

  // Smooth scroll handler
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-gray-900 font-sans selection:bg-[#dfa742] selection:text-black">
      {/* -------------------------------------------------------------
          1. HEADER / NAVIGATION BAR
          ------------------------------------------------------------- */}
      <TrendHeader active="home" />

      {/* -------------------------------------------------------------
          2. HERO SECTION (Full Luxury Banner matching Mockup)
          ------------------------------------------------------------- */}
      <section className="relative bg-[#0d0e11] text-white overflow-hidden">
        <div className="relative w-full overflow-hidden select-none">
          <picture key={`hero-${heroBanner?.image || ''}-${heroBanner?.mobileImage || ''}`} className="w-full block">
            {heroBanner?.mobileImage && (
              <source
                media="(max-width: 767px)"
                srcSet={getFullImageUrl(heroBanner.mobileImage)}
              />
            )}
            <img
              src={getFullImageUrl(heroBanner?.image || heroBanner?.mobileImage || "")}
              alt={heroBanner?.title || "Trend Saloon"}
              fetchpriority="high"
              decoding="async"
              width="1920"
              height="650"
              className="w-full h-auto min-h-[240px] sm:min-h-[380px] md:min-h-[480px] max-h-[650px] object-cover object-center"
            />
          </picture>

          {/* If user provided text, overlay it cleanly; if text was removed, show purely the custom designed banner */}
          {Boolean(heroBanner?.title?.trim() || heroBanner?.tagline?.trim() || heroBanner?.subtitle?.trim()) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl lg:max-w-2xl text-left space-y-4 py-4">
                  {heroBanner?.tagline && (
                    <div className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-300">
                      <span>{heroBanner.tagline}</span>
                    </div>
                  )}
                  {heroBanner?.title && (
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.1]">
                      {heroBanner.title}
                    </h1>
                  )}
                  {heroBanner?.subtitle && (
                    <p className="text-sm sm:text-base text-gray-300 max-w-lg font-light leading-relaxed">
                      {heroBanner.subtitle}
                    </p>
                  )}
                  {heroBanner?.buttonText && (
                    <div className="pt-2">
                      <button
                        onClick={() => scrollToSection("services")}
                        className="bg-[#dfa742] hover:bg-[#caa638] text-black font-semibold text-sm sm:text-base px-7 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#dfa742]/25 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <span>{heroBanner.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------
            Curved Transition Divider to White Section with Gold Ribbon
            ------------------------------------------------------------- */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            className="relative block w-full h-12 sm:h-16 lg:h-20"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            {/* Golden Arc Ribbon */}
            <path
              d="M0,0 C300,90 900,90 1200,0 L1200,120 L0,120 Z"
              fill="none"
              stroke="url(#goldRibbonGradient)"
              strokeWidth="4"
            />
            {/* White Wave Fill */}
            <path
              d="M0,15 C300,105 900,105 1200,15 L1200,120 L0,120 Z"
              fill="#ffffff"
            />
            <defs>
              <linearGradient id="goldRibbonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c59d5f" />
                <stop offset="50%" stopColor="#f7e7a9" />
                <stop offset="100%" stopColor="#dfa742" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. OUR SERVICES SECTION (Dynamic)
          ------------------------------------------------------------- */}
      <section id="services" className="py-12 sm:py-16 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="w-10 sm:w-14 h-[1.5px] bg-[#dfa742]" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Our Services
              </h2>
              <span className="w-10 sm:w-14 h-[1.5px] bg-[#dfa742]" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base font-medium">
              Premium Care for Your Style & Wellbeing
            </p>
          </div>

          {/* Services Cards Grid (Dynamic from Database / Catalog) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {visibleServices.map((service) => {
              const isAdded = addedItemIds[service._id]

              return (
                <div
                  key={service._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center p-3 group"
                >
                  {/* Top Service Image with Rounded Corners */}
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100">
                    <img
                      src={service.image}
                      alt={service.name}
                      width="400"
                      height="300"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Golden Icon */}
                  <div className="mb-1 p-1 text-[#dfa742]">
                    <ServiceIcon type={service.iconType || "scissors"} />
                  </div>

                  {/* Service Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight mb-1 min-h-[32px] flex items-center justify-center">
                    {service.name}
                  </h3>

                  {/* Price */}
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mb-2">
                    AED {service.price}
                  </div>

                  {/* Action Button: Add to Cart (Highlighted Gold Button) */}
                  <button
                    onClick={(e) => handleAddToCart(service, e)}
                    className={`mt-auto w-full py-2 px-3 rounded-full text-xs font-bold shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 ${isAdded
                      ? "bg-emerald-600 text-white shadow-emerald-600/30"
                      : "bg-[#dfa742] hover:bg-[#caa638] text-black shadow-[#dfa742]/20 hover:shadow-lg hover:shadow-[#dfa742]/30"
                      }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <span>Add to Cart</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* User Request: 6 services ke baad See More button -> navigates to next page */}
          {services.length > 6 && (
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => navigate(getLocalizedPath("/services"))}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs sm:text-sm font-semibold border-2 border-[#dfa742] text-gray-900 bg-white hover:bg-[#dfa742] hover:text-black transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
              >
                <span>See More</span>
                <ArrowRight className="w-4 h-4 text-[#dfa742] group-hover:text-black group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. SPECIAL OFFERS SECTION (Square/Rectangular Dynamic Banner)
          ------------------------------------------------------------- */}
      <section id="offers" className="relative bg-[#0c0d10] text-white overflow-hidden my-6">
        {Boolean(offersBanner?.image || offersBanner?.mobileImage) ? (
          /* Custom Full-Width Square/Rectangular Banner Image */
          <div className="relative w-full overflow-hidden select-none">
            <picture key={`offers-${offersBanner?.image || ''}-${offersBanner?.mobileImage || ''}`} className="w-full block">
              {offersBanner?.mobileImage && (
                <source
                  media="(max-width: 767px)"
                  srcSet={getFullImageUrl(offersBanner.mobileImage)}
                />
              )}
              <img
                src={getFullImageUrl(offersBanner?.image || offersBanner?.mobileImage || "")}
                alt={offersBanner?.title || "Special Offers"}
                loading="lazy"
                decoding="async"
                width="1920"
                height="450"
                className="w-full h-auto min-h-[160px] sm:min-h-[240px] md:min-h-[300px] max-h-[500px] object-cover object-center"
              />
            </picture>

            {/* If user provided text, overlay cleanly; if text was left empty, show pure designed banner */}
            {Boolean(offersBanner?.title?.trim() || offersBanner?.subtitle?.trim() || offersBanner?.buttonText?.trim()) && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-xl text-left space-y-3 py-4">
                    {offersBanner?.title && (
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#dfa742] tracking-tight">
                        {offersBanner.title}
                      </h2>
                    )}
                    {offersBanner?.subtitle && (
                      <p className="text-white text-base sm:text-lg font-light tracking-wide">
                        {offersBanner.subtitle}
                      </p>
                    )}
                    {offersBanner?.buttonText && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            if (offersBanner?.link) {
                              navigate(getLocalizedPath(offersBanner.link))
                            } else {
                              setOffersModalOpen(true)
                            }
                          }}
                          className="bg-[#dfa742] hover:bg-[#caa638] text-black font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full inline-flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <span>{offersBanner.buttonText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Default Rectangular/Square Luxury Section (Curves removed so it stays clean & square) */
          <div className="py-14 sm:py-20 relative">
            {/* Faded Barber Watermark in background */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <Scissors className="w-96 h-96 text-white" />
            </div>

            {/* Subtle Golden Swoosh Graphic */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="goldOfferGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c59d5f" />
                  <stop offset="50%" stopColor="#f7e7a9" />
                  <stop offset="100%" stopColor="#dfa742" />
                </linearGradient>
              </defs>
              <path
                d="M-100,160 C320,60 800,300 1540,80"
                fill="none"
                stroke="url(#goldOfferGradient)"
                strokeWidth="1.5"
              />
            </svg>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                {/* Left Content */}
                <div className="text-center lg:text-left space-y-3">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#dfa742] tracking-tight">
                    {offersBanner?.title || "Special Offers"}
                  </h2>
                  <p className="text-white text-base sm:text-lg font-light tracking-wide">
                    {offersBanner?.subtitle || "Look Better. Pay Less."}
                  </p>
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        if (offersBanner?.link) {
                          navigate(getLocalizedPath(offersBanner.link))
                        } else {
                          setOffersModalOpen(true)
                        }
                      }}
                      className="bg-[#dfa742] hover:bg-[#caa638] text-black font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full inline-flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <span>{offersBanner?.buttonText || "View All Offers"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Side: Golden Brush Splash Badge + Classic Barber Pole */}
                <div className="flex items-center gap-6 sm:gap-10">
                  {/* Golden Brush Splatter Offer Badge */}
                  <div
                    onClick={(e) => handleAddToCart(SPECIAL_OFFER_COMBO, e)}
                    className="relative cursor-pointer group transition-transform duration-300 hover:scale-105"
                    title="Click to Add Combo Deal to Cart"
                  >
                    <div className="relative w-64 sm:w-72 h-32 sm:h-36 flex flex-col items-center justify-center p-4">
                      <div className="absolute inset-0 bg-[#dfa742] rounded-3xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-300 shadow-2xl filter drop-shadow-[0_8px_20px_rgba(223,167,66,0.35)]" />
                      <div className="relative z-10 text-center text-black">
                        <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                          AED 50
                        </div>
                        <div className="text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 px-2">
                          Haircut + Beard Trim
                          <br />
                          + Manicure
                        </div>
                        <div className="mt-2 text-[10px] uppercase tracking-widest font-extrabold bg-black text-[#dfa742] py-0.5 px-2.5 rounded-full inline-flex items-center gap-1 group-hover:bg-neutral-900">
                          {addedItemIds[SPECIAL_OFFER_COMBO._id] ? "✓ Added to Cart" : "+ Add to Cart"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Classic Animated Barber Pole */}
                  <div className="flex-shrink-0">
                    <BarberPole />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* -------------------------------------------------------------
          5. OUR PRODUCTS SECTION (Dynamic)
          ------------------------------------------------------------- */}
      <section id="products" className="py-12 sm:py-16 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="w-10 sm:w-14 h-[1.5px] bg-[#dfa742]" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Our Products
              </h2>
              <span className="w-10 sm:w-14 h-[1.5px] bg-[#dfa742]" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base font-medium">
              Premium Grooming Products
            </p>
          </div>

          {/* Products Grid (Dynamic from Database / Catalog) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {/* Products Cards */}
            {visibleProducts.map((product) => {
              const isAdded = addedItemIds[product._id]

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 p-3 flex flex-col items-center text-center group"
                >
                  {/* Product Image Frame */}
                  <div className="w-full aspect-[4/3] flex items-center justify-center mb-3 overflow-hidden rounded-xl bg-gray-50/50 p-2">
                    <img
                      src={product.image || "/salon/hair-care.jpg"}
                      alt={product.name}
                      width="400"
                      height="300"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = "/salon/hair-care.jpg"
                      }}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight mb-1 min-h-[32px] flex items-center justify-center line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mb-2">
                    AED {product.price}
                  </div>

                  {/* Add to Cart Gold Pill Button */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`mt-auto w-full max-w-[120px] py-1.5 px-3 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 ${isAdded
                      ? "bg-green-600 text-white"
                      : "bg-[#dfa742] hover:bg-[#caa638] text-black shadow-[#dfa742]/20"
                      }`}
                  >
                    {isAdded ? "✓ Added" : "Add to Cart"}
                  </button>
                </div>
              )
            })}

            {/* 6th Card: Featured CTA Dark Card (Always displayed matching exact design) */}
            <div
              onClick={() => navigate(getLocalizedPath("/products"))}
              className="bg-[#111113] text-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-white/10 group min-h-[220px] cursor-pointer"
              title="View all products"
            >
              {/* Golden Outline Shopping Bag Icon */}
              <div className="w-12 h-12 rounded-2xl border-2 border-[#dfa742] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#dfa742]/10">
                <ShoppingBag className="w-6 h-6 text-[#dfa742]" />
              </div>

              {/* Headline */}
              <h3 className="text-xs sm:text-sm font-bold text-white mb-3 leading-snug">
                Shop Premium
                <br />
                Salon Products
              </h3>

              {/* Shop All Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(getLocalizedPath("/products"))
                }}
                className="bg-[#dfa742] hover:bg-[#caa638] text-black font-semibold text-xs px-4 py-2 rounded-full inline-flex items-center gap-1 shadow-md shadow-[#dfa742]/20 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>Shop All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User Request: See More button navigates to products page */}
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => navigate(getLocalizedPath("/products"))}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs sm:text-sm font-semibold border-2 border-[#dfa742] text-gray-900 bg-white hover:bg-[#dfa742] hover:text-black transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            >
              <span>See More</span>
              <ArrowRight className="w-4 h-4 text-[#dfa742] group-hover:text-black group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. FOOTER / CONTACT BAR (Bottom Dark Bar)
          ------------------------------------------------------------- */}
      <TrendFooter />

      {/* -------------------------------------------------------------
          SPECIAL OFFERS MODAL DIALOG
          ------------------------------------------------------------- */}
      {offersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-[#121216] border border-[#dfa742]/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setOffersModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Title */}
            <div className="text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-[#dfa742]">
                Limited Time Deals
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Trend Salon Exclusive Offers
              </h3>
            </div>

            {/* Offer Item 1: Combo Deal */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-white">Full Royal Grooming Combo</h4>
                <p className="text-xs text-gray-400">Haircut + Beard Trim + Manicure</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-black text-[#dfa742]">AED 50</span>
                  <span className="text-xs text-gray-500 line-through">AED 169</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  handleAddToCart(SPECIAL_OFFER_COMBO, e)
                  setOffersModalOpen(false)
                }}
                className="bg-[#dfa742] hover:bg-[#caa638] text-black text-xs font-bold px-4 py-2 rounded-full flex-shrink-0"
              >
                Add to Cart
              </button>
            </div>

            {/* Offer Item 2: Spa & Facial Combo */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-white">Spa & Rejuvenation Combo</h4>
                <p className="text-xs text-gray-400">Moroccan Bath + Hydra Facial</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-black text-[#dfa742]">AED 99</span>
                  <span className="text-xs text-gray-500 line-through">AED 119</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  handleAddToCart(
                    {
                      _id: "offer-spa-facial",
                      name: "Moroccan Bath + Hydra Facial",
                      price: 99,
                      image: "/salon/moroccan-bath.jpg",
                      category: "Special Offers",
                    },
                    e,
                  )
                  setOffersModalOpen(false)
                }}
                className="bg-[#dfa742] hover:bg-[#caa638] text-black text-xs font-bold px-4 py-2 rounded-full flex-shrink-0"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
