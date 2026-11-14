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
import { fetchSalonCatalog, getCachedSalonBanners, fetchSalonBanners } from "../services/salonService"
import { ArrowRight, Check, ChevronRight, ShoppingBag, Sparkles } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"

export default function ProductsPage() {
  const navigate = useNavigate()
  const { addToCart, openCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  const { showToast } = useToast()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedItemIds, setAddedItemIds] = useState({})
  const [productsBanner, setProductsBanner] = useState(() => getCachedSalonBanners()?.products || { image: "" })

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
      image: item.image,
      images: Array.isArray(item.images) ? item.images : [{ url: item.image }],
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
          <img
            src={getFullImageUrl(productsBanner?.image || "")}
            alt={productsBanner?.title || "Our Products"}
            className="w-full h-auto min-h-[180px] sm:min-h-[260px] md:min-h-[320px] max-h-[460px] object-cover object-center"
          />

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

      {/* 3. Main Content Area (Full Catalog Grid of Products) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Section Header */}
        <div className="text-center mb-10">
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

        {/* Loading Skeleton / State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-4">
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
                <div className="h-9 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <ShoppingBag className="w-12 h-12 text-[#dfa742] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-gray-900">No products available at the moment</h3>
            <p className="text-sm text-gray-500 mt-1">Please check back soon for our latest arrivals.</p>
          </div>
        ) : (
          /* Products Grid (All Products Displayed) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isAdded = addedItemIds[product._id]

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col p-4 text-center group relative overflow-hidden"
                >
                  {/* Stock Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {product.stockStatus || "In Stock"}
                    </span>
                  </div>

                  {/* Product Image Frame */}
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-50 flex items-center justify-center p-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Golden Bag / Scissors Icon */}
                  <div className="my-1 flex justify-center text-[#dfa742]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>

                  {/* Product Title */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug min-h-[40px] flex items-center justify-center line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="text-sm sm:text-base font-bold text-gray-900 mt-1 mb-4">
                    AED {product.price}
                  </div>

                  {/* Action Button: Add to Cart */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`mt-auto w-full py-2.5 px-4 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 ${
                      isAdded
                        ? "bg-green-600 text-white"
                        : "bg-[#dfa742] hover:bg-[#caa638] text-black shadow-[#dfa742]/20"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <span>Add to Cart</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* 4. Bottom Promotional Card: Salon Services & VIP Appointment Banner */}
        <div className="mt-14 bg-gradient-to-r from-[#0e0e11] via-[#15161c] to-[#0e0e11] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-white/10 shadow-2xl">
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

