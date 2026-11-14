"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useToast } from "../context/ToastContext"
import TrendHeader from "../components/TrendHeader"
import TrendFooter from "../components/TrendFooter"
import { fetchSalonCatalog, getCachedSalonBanners, fetchSalonBanners, DEFAULT_SALON_BANNERS } from "../services/salonService"
import { ArrowRight, Check, ChevronRight, Loader2, Sparkles } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"

const BATCH_SIZE = 20

export default function ServicesProducts() {
  const navigate = useNavigate()
  const { addToCart, openCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  const { showToast } = useToast()

  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedItemIds, setAddedItemIds] = useState({})
  const [servicesBanner, setServicesBanner] = useState(() => getCachedSalonBanners()?.services || DEFAULT_SALON_BANNERS.services)

  // 20 items at a time state for Services & Products
  const [visibleServicesCount, setVisibleServicesCount] = useState(BATCH_SIZE)
  const [visibleProductsCount, setVisibleProductsCount] = useState(BATCH_SIZE)
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false)
  const [isLoadingMoreServices, setIsLoadingMoreServices] = useState(false)

  const productsScrollContainerRef = useRef(null)
  const loadMoreProductsRef = useRef(null)
  const loadMoreServicesRef = useRef(null)

  // Refs and state for synchronizing sidebar height to exactly 2 rows of services cards
  const servicesColumnRef = useRef(null)
  const servicesGridRef = useRef(null)
  const [sidebarHeight, setSidebarHeight] = useState(null)

  // Load catalog dynamically from backend API / MongoDB
  useEffect(() => {
    let isMounted = true
    async function loadCatalog() {
      setLoading(true)
      const data = await fetchSalonCatalog()
      if (isMounted) {
        setServices(data.services || [])
        setProducts(data.products || [])
        setLoading(false)
      }
    }
    loadCatalog()

    async function loadBanner() {
      const data = await fetchSalonBanners()
      if (isMounted && data?.services) {
        setServicesBanner((prev) => ({ ...prev, ...data.services }))
      }
    }
    loadBanner()

    return () => {
      isMounted = false
    }
  }, [])

  // Sliced lists for 20 items at a time
  const displayedServices = useMemo(() => {
    return services.slice(0, visibleServicesCount)
  }, [services, visibleServicesCount])

  const displayedProducts = useMemo(() => {
    return products.slice(0, visibleProductsCount)
  }, [products, visibleProductsCount])

  // Scroll handler for Products internal scroll container
  const handleProductsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 160) {
      if (visibleProductsCount < products.length && !isLoadingMoreProducts && !loading) {
        setIsLoadingMoreProducts(true)
        setTimeout(() => {
          setVisibleProductsCount((prev) => Math.min(prev + BATCH_SIZE, products.length))
          setIsLoadingMoreProducts(false)
        }, 150)
      }
    }
  }

  // Scroll observer for Products column (sentinel trigger)
  useEffect(() => {
    const sentinel = loadMoreProductsRef.current
    const container = productsScrollContainerRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (
          first.isIntersecting &&
          visibleProductsCount < products.length &&
          !isLoadingMoreProducts &&
          !loading
        ) {
          setIsLoadingMoreProducts(true)
          setTimeout(() => {
            setVisibleProductsCount((prev) => Math.min(prev + BATCH_SIZE, products.length))
            setIsLoadingMoreProducts(false)
          }, 150)
        }
      },
      {
        root: container || null,
        rootMargin: "200px 0px",
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleProductsCount, products.length, isLoadingMoreProducts, loading])

  // Scroll observer for Services column (loads 20 more as user scrolls down if many services exist)
  useEffect(() => {
    const sentinel = loadMoreServicesRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (
          first.isIntersecting &&
          visibleServicesCount < services.length &&
          !isLoadingMoreServices &&
          !loading
        ) {
          setIsLoadingMoreServices(true)
          setTimeout(() => {
            setVisibleServicesCount((prev) => Math.min(prev + BATCH_SIZE, services.length))
            setIsLoadingMoreServices(false)
          }, 200)
        }
      },
      { rootMargin: "300px 0px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleServicesCount, services.length, isLoadingMoreServices, loading])

  // Synchronize sidebar height to match exactly 2 rows (lines) of services on desktop
  useEffect(() => {
    const updateSidebarHeight = () => {
      if (typeof window === "undefined" || window.innerWidth < 1024) {
        setSidebarHeight(null)
        return
      }

      const grid = servicesGridRef.current
      const col = servicesColumnRef.current
      if (!grid || !col) return

      const cards = Array.from(grid.children).filter(
        (el) => el.nodeType === 1 && !el.classList.contains("animate-pulse")
      )

      if (cards.length > 0) {
        const colRect = col.getBoundingClientRect()
        const card0Rect = cards[0].getBoundingClientRect()
        let row2Card = null

        // Find the card representing the end of Row 2
        for (let i = 1; i < cards.length; i++) {
          const rect = cards[i].getBoundingClientRect()
          if (rect.top > card0Rect.top + 10) {
            row2Card = cards[i]
            for (let j = i + 1; j < cards.length; j++) {
              const nextRect = cards[j].getBoundingClientRect()
              if (Math.abs(nextRect.top - rect.top) < 10) {
                row2Card = cards[j]
              } else {
                break
              }
            }
            break
          }
        }

        if (row2Card) {
          const row2Rect = row2Card.getBoundingClientRect()
          const exactHeight = Math.round(row2Rect.bottom - colRect.top)
          if (exactHeight > 250) {
            setSidebarHeight(exactHeight)
            return
          }
        }

        // Fallback: estimate 2 rows of service cards + gap + header offset
        const singleCardH = card0Rect.height
        const gridRect = grid.getBoundingClientRect()
        const headerH = Math.max(0, gridRect.top - colRect.top)
        const estimated = Math.round(headerH + singleCardH * 2 + 20)
        if (estimated > 250) {
          setSidebarHeight(estimated)
          return
        }
      }
    }

    updateSidebarHeight()

    let observer = null
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateSidebarHeight()
      })
      if (servicesColumnRef.current) observer.observe(servicesColumnRef.current)
      if (servicesGridRef.current) observer.observe(servicesGridRef.current)
    }

    window.addEventListener("resize", updateSidebarHeight)
    const timer = setTimeout(updateSidebarHeight, 400)

    return () => {
      if (observer) observer.disconnect()
      window.removeEventListener("resize", updateSidebarHeight)
      clearTimeout(timer)
    }
  }, [displayedServices.length, loading])

  // Handle adding service or product to cart
  const handleAddToCart = (item, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const isService = item.category === "Services"
    const fallbackImage = isService ? "/salon/hero-barber.jpg" : "/salon/hair-care.jpg"

    const cartPayload = {
      _id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice || item.price,
      image: item.image || fallbackImage,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [{ url: item.image || fallbackImage }],
      stockStatus: item.stockStatus || "In Stock",
      category: item.category || (isService ? "Services" : "Products"),
    }

    addToCart(cartPayload, 1)

    // Flash added feedback on button
    setAddedItemIds((prev) => ({ ...prev, [item._id]: true }))
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item._id]: false }))
    }, 1500)

    if (typeof openCart === "function") {
      openCart()
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-gray-900 font-sans selection:bg-[#dfa742] selection:text-black">
      {/* 1. Header Navigation */}
      <TrendHeader active="services" />

      {/* 2. Hero Banner */}
      <section className="relative bg-[#0d0e11] text-white overflow-hidden">
        <div className="relative w-full overflow-hidden select-none">
          <picture key={`services-${servicesBanner?.image || ''}-${servicesBanner?.mobileImage || ''}`} className="w-full block">
            {servicesBanner?.mobileImage && (
              <source
                media="(max-width: 767px)"
                srcSet={getFullImageUrl(servicesBanner.mobileImage)}
              />
            )}
            <img
              src={getFullImageUrl(servicesBanner?.image || servicesBanner?.mobileImage || "") || "/salon/services-banner-full.jpg"}
              alt={servicesBanner?.title || "Our Services & Products"}
              fetchpriority="high"
              decoding="async"
              width="1920"
              height="450"
              onError={(e) => {
                e.currentTarget.src = "/salon/services-banner-full.jpg"
              }}
              className="w-full h-auto min-h-[180px] sm:min-h-[260px] md:min-h-[320px] max-h-[460px] object-cover object-center"
            />
          </picture>

          {Boolean(servicesBanner?.title?.trim() || servicesBanner?.subtitle?.trim()) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl text-left space-y-2.5 py-4">
                  {servicesBanner?.title && (
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#dfa742] tracking-tight">
                      {servicesBanner.title}
                    </h1>
                  )}

                  {servicesBanner?.subtitle && (
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
            </div>
          )}
        </div>
      </section>

      {/* 3. Main Content Area (Two Columns Layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* =========================================================
              LEFT COLUMN: Our Services (~65-70% width)
              ========================================================= */}
          <div ref={servicesColumnRef} className="lg:col-span-8 space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-3">
                <span className="w-8 h-[1.5px] bg-[#dfa742]" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Our Services
                </h2>
                <span className="w-8 h-[1.5px] bg-[#dfa742]" />
              </div>

              {services.length > 0 && (
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {displayedServices.length} of {services.length} Services
                </span>
              )}
            </div>

            {/* Services Grid */}
            {loading ? (
              <div ref={servicesGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
                    <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div ref={servicesGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                  {displayedServices.map((service) => {
                    const isAdded = addedItemIds[service._id]

                    return (
                      <div
                        key={service._id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col p-3.5 text-center group"
                      >
                        {/* Service Image Frame */}
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-gray-100">
                          <img
                            src={service.image || "/salon/hero-barber.jpg"}
                            alt={service.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = "/salon/hero-barber.jpg"
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>

                        {/* Golden Scissors Icon */}
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
                        <h3 className="text-sm font-bold text-gray-900 leading-snug min-h-[36px] flex items-center justify-center">
                          {service.name}
                        </h3>

                        {/* Price */}
                        <div className="text-sm font-bold text-gray-900 mt-1 mb-3">
                          AED {service.price}
                        </div>

                        {/* Action Button: Add to Cart */}
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

                {/* Services Scroll Sentinel & Loader */}
                <div ref={loadMoreServicesRef} className="py-4 text-center">
                  {isLoadingMoreServices && (
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#dfa742]" />
                      <span>Loading more services...</span>
                    </div>
                  )}
                  {!isLoadingMoreServices && visibleServicesCount < services.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleServicesCount((prev) => Math.min(prev + BATCH_SIZE, services.length))}
                      className="px-5 py-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                    >
                      Load More Services ({services.length - visibleServicesCount} more)
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* =========================================================
              RIGHT COLUMN: Our Products
              - Top: Sticky Header
              - Middle: Independently Scrollable Products List
              - Bottom: STICKY Black Promo Card (Pinned at bottom!)
              ========================================================= */}
          <div className="lg:col-span-4 w-full self-stretch lg:self-stretch">
            <div
              style={sidebarHeight ? { height: `${sidebarHeight}px` } : undefined}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-24 h-[560px] sm:h-[600px] lg:h-[720px] flex flex-col overflow-hidden"
            >
              {/* 1. Header with Live Counter (Sticky at Top) */}
              <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 flex-shrink-0 bg-white z-10 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Our Products
                </h2>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  Showing {displayedProducts.length} of {products.length}
                </span>
              </div>

              {/* 2. Middle Scrollable Products Area (Scrolls inside!) */}
              <div
                ref={productsScrollContainerRef}
                onScroll={handleProductsScroll}
                className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 pt-3 space-y-3 overscroll-contain"
              >
                {displayedProducts.map((product) => {
                  const isAdded = addedItemIds[product._id]

                  return (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 p-1 border border-gray-100">
                        <img
                          src={product.image || "/salon/hair-care.jpg"}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = "/salon/hair-care.jpg"
                          }}
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
                        className={`py-1.5 px-3.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex-shrink-0 ${
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

                {/* Sentinel & Loader at the bottom of the scrollable list */}
                <div ref={loadMoreProductsRef} className="pt-2 pb-2 text-center">
                  {isLoadingMoreProducts && (
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500 py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#dfa742]" />
                      <span>Loading more products...</span>
                    </div>
                  )}
                  {!isLoadingMoreProducts && visibleProductsCount < products.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleProductsCount((prev) => Math.min(prev + BATCH_SIZE, products.length))}
                      className="w-full py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-all"
                    >
                      Load More Products ({products.length - visibleProductsCount} remaining)
                    </button>
                  )}
                  {visibleProductsCount >= products.length && products.length > BATCH_SIZE && (
                    <p className="text-[11px] text-gray-400 py-1">
                      All {products.length} products loaded
                    </p>
                  )}
                </div>
              </div>

              {/* 3. STICKY BLACK PROMO CARD (Permanently pinned at the bottom!) */}
              <div className="p-3 sm:p-4 bg-white border-t border-gray-100 flex-shrink-0 z-10">
                <div
                  onClick={() => navigate(getLocalizedPath("/products"))}
                  className="bg-[#111113] rounded-2xl p-3.5 sm:p-4 text-white relative overflow-hidden flex items-center justify-between border border-white/10 group cursor-pointer hover:border-[#dfa742]/40 transition-colors shadow-md"
                  title="View all salon products"
                >
                  {/* Left Text & CTA */}
                  <div className="z-10 space-y-1.5 max-w-[62%]">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      Browse All {products.length} Products
                    </h4>
                    <p className="text-gray-300 font-normal text-[11px] leading-tight">
                      Exclusive salon formulas
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(getLocalizedPath("/products"))
                        }}
                        className="bg-[#dfa742] hover:bg-[#caa638] text-black font-semibold text-[10px] sm:text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1 shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <span>Full Catalog</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center flex-shrink-0">
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
        </div>
      </main>

      {/* 4. Footer */}
      <TrendFooter />
    </div>
  )
}
