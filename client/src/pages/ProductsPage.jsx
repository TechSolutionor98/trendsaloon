"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useToast } from "../context/ToastContext"
import TrendHeader from "../components/TrendHeader"
import TrendFooter from "../components/TrendFooter"
import { fetchSalonCatalog, getCachedSalonBanners, fetchSalonBanners, DEFAULT_SALON_BANNERS } from "../services/salonService"
import {
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"

const INITIAL_BATCH_SIZE = 20
const PRODUCT_PLACEHOLDER = "/salon/hair-care.jpg"

export default function ProductsPage() {
  const navigate = useNavigate()
  const { addToCart, openCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  const { showToast } = useToast()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedItemIds, setAddedItemIds] = useState({})
  const [productsBanner, setProductsBanner] = useState(() => getCachedSalonBanners()?.products || DEFAULT_SALON_BANNERS.products)

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // Scroll Loading (20 at a time)
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef(null)

  // Load catalog dynamically from backend API / MongoDB
  useEffect(() => {
    let isMounted = true
    async function loadCatalog() {
      setLoading(true)
      const data = await fetchSalonCatalog()
      if (isMounted) {
        setProducts(data.products || [])
        setLoading(false)
      }
    }
    loadCatalog()

    async function loadBanner() {
      const data = await fetchSalonBanners()
      if (isMounted && data?.products) {
        setProductsBanner((prev) => ({ ...prev, ...data.products }))
      }
    }
    loadBanner()

    return () => {
      isMounted = false
    }
  }, [])

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter((item) => {
        const name = String(item.name || "").toLowerCase()
        const subtitle = String(item.subtitle || "").toLowerCase()
        const sku = String(item.sku || "").toLowerCase()
        return name.includes(q) || subtitle.includes(q) || sku.includes(q)
      })
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "price-low") {
        return (a.price || 0) - (b.price || 0)
      }
      if (sortBy === "price-high") {
        return (b.price || 0) - (a.price || 0)
      }
      if (sortBy === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""))
      }
      // "newest" by default
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

    return result
  }, [products, searchTerm, sortBy])

  // Reset visibleCount to 20 on search or sort change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE)
  }, [searchTerm, sortBy])

  // Slice products up to visibleCount (starts at 20, increases by 20 on scroll)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (
          first.isIntersecting &&
          visibleCount < filteredProducts.length &&
          !isLoadingMore &&
          !loading
        ) {
          setIsLoadingMore(true)
          // Short smooth delay to simulate seamless progressive load
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + INITIAL_BATCH_SIZE, filteredProducts.length))
            setIsLoadingMore(false)
          }, 200)
        }
      },
      {
        rootMargin: "350px 0px", // Trigger 350px before reaching the bottom
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount, filteredProducts.length, isLoadingMore, loading])

  // Handle adding product to cart
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
      image: item.image || PRODUCT_PLACEHOLDER,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [{ url: item.image || PRODUCT_PLACEHOLDER }],
      stockStatus: item.stockStatus || "In Stock",
      category: item.category || "Products",
    }

    addToCart(cartPayload, 1)

    // Flash added feedback on button
    setAddedItemIds((prev) => ({ ...prev, [item._id]: true }))
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item._id]: false }))
    }, 1500)

    // Open slide-over cart drawer
    if (typeof openCart === "function") {
      openCart()
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-gray-900 font-sans selection:bg-[#dfa742] selection:text-black">
      {/* 1. Header Navigation */}
      <TrendHeader active="products" />

      {/* 2. Hero Banner */}
      <section className="relative bg-[#0d0e11] text-white overflow-hidden">
        <div className="relative w-full overflow-hidden select-none">
          <picture key={`products-${productsBanner?.image || ''}-${productsBanner?.mobileImage || ''}`} className="w-full block">
            {productsBanner?.mobileImage && (
              <source
                media="(max-width: 767px)"
                srcSet={getFullImageUrl(productsBanner.mobileImage)}
              />
            )}
            <img
              src={getFullImageUrl(productsBanner?.image || productsBanner?.mobileImage || "") || "/salon/promo-products.jpg"}
              alt={productsBanner?.title || "Our Products"}
              fetchpriority="high"
              decoding="async"
              width="1920"
              height="450"
              onError={(e) => {
                e.currentTarget.src = "/salon/promo-products.jpg"
              }}
              className="w-full h-auto min-h-[180px] sm:min-h-[260px] md:min-h-[320px] max-h-[460px] object-cover object-center"
            />
          </picture>

          {Boolean(productsBanner?.title?.trim() || productsBanner?.subtitle?.trim()) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl text-left space-y-2.5 py-4">
                  {productsBanner?.title && (
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#dfa742] tracking-tight">
                      {productsBanner.title}
                    </h1>
                  )}

                  {productsBanner?.subtitle && (
                    <p className="text-gray-200 text-sm sm:text-base font-light tracking-wide">
                      {productsBanner.subtitle}
                    </p>
                  )}

                  {/* Breadcrumbs */}
                  <nav className="flex items-center gap-2 text-xs text-gray-400 pt-1" aria-label="Breadcrumb">
                    <Link to={getLocalizedPath("/")} className="hover:text-[#dfa742] transition-colors">
                      Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-200 font-medium">Our Products</span>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Main Content Area */}
      <main id="catalog-start" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <span className="w-10 h-[1.5px] bg-[#dfa742]" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight font-serif">
              Our Products
            </h2>
            <span className="w-10 h-[1.5px] bg-[#dfa742]" />
          </div>
          <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Discover our exclusive collection of luxury grooming kits, premium hair styling formulas, and revitalizing skincare essentials.
          </p>
        </div>

        {/* Toolbar: Search, Filters, and Product Count */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Live Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, brand, SKU..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#dfa742] focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right controls: Dynamic Counter & Sort Dropdown */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
              {loading ? (
                <span>Loading products...</span>
              ) : (
                <span>
                  Showing <strong className="text-gray-900">{displayedProducts.length}</strong> of{" "}
                  <strong className="text-gray-900">{filteredProducts.length}</strong> products
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400 hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#dfa742] focus:border-transparent cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-4">
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
                <div className="h-9 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <ShoppingBag className="w-12 h-12 text-[#dfa742] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-gray-900">No products found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? `No products match your search "${searchTerm}". Try another keyword or clear the search.`
                : "No products available at the moment. Please check back soon."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-5 py-2 rounded-full bg-[#dfa742] text-black text-xs font-semibold hover:bg-[#caa638] transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Products Grid (Loaded 20 at a time on scroll) */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product) => {
                const isAdded = addedItemIds[product._id]

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col p-3 sm:p-4 text-center group relative overflow-hidden"
                  >
                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {product.stockStatus || "In Stock"}
                      </span>
                    </div>

                    {/* Product Image Frame */}
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-50 flex items-center justify-center p-3">
                      <img
                        src={product.image || PRODUCT_PLACEHOLDER}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = PRODUCT_PLACEHOLDER
                        }}
                        className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Golden Bag Icon */}
                    <div className="my-1 flex justify-center text-[#dfa742]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>

                    {/* Product Title */}
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-snug min-h-[36px] sm:min-h-[40px] flex items-center justify-center line-clamp-2 px-1">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mt-1 mb-3">
                      AED {product.price}
                    </div>

                    {/* Action Button: Add to Cart */}
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`mt-auto w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 ${isAdded
                        ? "bg-green-600 text-white"
                        : "bg-[#dfa742] hover:bg-[#caa638] text-black shadow-[#dfa742]/20"
                        }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <span>Add to Cart</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Scroll Sentinel & Infinite Scroll Loader */}
            <div ref={loadMoreRef} className="py-10 flex flex-col items-center justify-center">
              {isLoadingMore && (
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-600 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                  <Loader2 className="w-4 h-4 animate-spin text-[#dfa742]" />
                  <span>Loading more products...</span>
                </div>
              )}

              {!isLoadingMore && visibleCount < filteredProducts.length && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((prev) => Math.min(prev + INITIAL_BATCH_SIZE, filteredProducts.length))
                  }
                  className="px-6 py-2.5 rounded-full border border-gray-200 bg-white text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-50 shadow-sm hover:shadow transition-all inline-flex items-center gap-2"
                >
                  <span>Load More Products</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">
                    {filteredProducts.length - visibleCount} more
                  </span>
                </button>
              )}

              {/* {visibleCount >= filteredProducts.length && filteredProducts.length > INITIAL_BATCH_SIZE && (
                <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-[#dfa742]" />
                  <span>You have viewed all {filteredProducts.length} products</span>
                </div>
              )} */}
            </div>
          </>
        )}

        {/* 4. Bottom Promotional Card */}
        <div className="mt-8 bg-gradient-to-r from-[#0e0e11] via-[#15161c] to-[#0e0e11] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#dfa742]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#dfa742] font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complete Salon Experience</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-white">
                Looking for Professional Barber Services?
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Experience precision haircuts, royal beard grooming, Moroccan baths, and relaxing massage therapies tailored exclusively for gentlemen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
              <button
                onClick={() => navigate(getLocalizedPath("/services"))}
                className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-[#dfa742]/20 transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-2"
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <TrendFooter />
    </div>
  )
}
