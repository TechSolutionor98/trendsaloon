"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { useToast } from "../../context/ToastContext"
import {
  Upload,
  Save,
  ImageIcon,
  Sparkles,
  Scissors,
  Check,
  RefreshCw,
  ArrowRight,
  Eye,
  Layers,
  ShoppingBag,
} from "lucide-react"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

export default function AdminBanners() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState("home") // "home" | "services"
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Banner states
  const [homeBanner, setHomeBanner] = useState({
    title: "Trend Salon",
    tagline: "Look Good • Feel Great",
    subtitle: "Premium Grooming & Wellness Services for the Modern Gentleman",
    image: "/salon/hero-man-transparent.png",
    buttonText: "Book Now",
  })

  const [offersBanner, setOffersBanner] = useState({
    title: "Special Offers",
    subtitle: "Look Better. Pay Less.",
    image: "",
    buttonText: "View All Offers",
    link: "",
  })

  const [servicesBanner, setServicesBanner] = useState({
    title: "Our Services & Products",
    subtitle: "Professional Care. Premium Quality.",
    image: "/salon/services-man.png",
  })

  const [productsBanner, setProductsBanner] = useState({
    title: "Our Products",
    subtitle: "Premium Grooming & Care Products for the Modern Gentleman.",
    image: "/salon/services-man.png",
  })

  // Fetch current salon banners
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.API_URL}/api/banners/salon-banners?_t=${Date.now()}`)
      if (res.data) {
        if (res.data.home) setHomeBanner((prev) => ({ ...prev, ...res.data.home }))
        if (res.data.offers) setOffersBanner((prev) => ({ ...prev, ...res.data.offers }))
        if (res.data.services) setServicesBanner((prev) => ({ ...prev, ...res.data.services }))
        if (res.data.products) setProductsBanner((prev) => ({ ...prev, ...res.data.products }))
      }
    } catch (err) {
      console.warn("Could not fetch banners:", err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle image upload via /api/upload/single
  const handleImageUpload = async (e, bannerType) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("image", file)

      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").token

      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const res = await axios.post(`${config.API_URL}/api/upload/single`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.data && res.data.url) {
        const uploadedUrl = res.data.url
        if (bannerType === "home") {
          setHomeBanner((prev) => ({ ...prev, image: uploadedUrl }))
        } else if (bannerType === "offers") {
          setOffersBanner((prev) => ({ ...prev, image: uploadedUrl }))
        } else if (bannerType === "services") {
          setServicesBanner((prev) => ({ ...prev, image: uploadedUrl }))
        } else {
          setProductsBanner((prev) => ({ ...prev, image: uploadedUrl }))
        }
        showToast("Image uploaded successfully!", "success")
      }
    } catch (err) {
      console.error("Upload error:", err)
      showToast(err.response?.data?.message || "Failed to upload image", "error")
    } finally {
      setUploading(false)
    }
  }

  // Save banners to backend
  const handleSave = async (bannerType) => {
    try {
      setSaving(true)
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").token

      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const payload = {}
      if (bannerType === "home" || bannerType === "all") {
        payload.home = homeBanner
      }
      if (bannerType === "offers" || bannerType === "all") {
        payload.offers = offersBanner
      }
      if (bannerType === "services" || bannerType === "all") {
        payload.services = servicesBanner
      }
      if (bannerType === "products" || bannerType === "all") {
        payload.products = productsBanner
      }

      await axios.put(`${config.API_URL}/api/banners/salon-banners`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      showToast("Banner updated successfully! Changes are live.", "success")
    } catch (err) {
      console.error("Save error:", err)
      showToast(err.response?.data?.message || "Failed to update banner", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-6 sm:p-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="w-7 h-7 text-[#dfa742]" />
              <span>Main Pages Banner Manager</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Easily customize and change the hero banners for both main pages (Homepage & Services Page).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBanners}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 mb-8 space-x-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`py-3 px-5 text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2.5 ${
              activeTab === "home"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#dfa742]" />
            <span>1. Homepage Hero Banner</span>
          </button>

          <button
            onClick={() => setActiveTab("offers")}
            className={`py-3 px-5 text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2.5 ${
              activeTab === "offers"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#dfa742]" />
            <span>2. Homepage 2nd Banner (Offers)</span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`py-3 px-5 text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2.5 ${
              activeTab === "services"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <Scissors className="w-4 h-4 text-[#dfa742]" />
            <span>3. Services Page Banner</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 px-5 text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2.5 ${
              activeTab === "products"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#dfa742]" />
            <span>4. Products Page Banner</span>
          </button>
        </div>

        {/* TAB 1: HOMEPAGE HERO BANNER */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Live Visual Preview */}
            <div className="bg-[#0d0e11] text-white rounded-3xl overflow-hidden border border-[#dfa742]/30 shadow-2xl relative min-h-[220px]">
              <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#dfa742] flex items-center gap-1.5 border border-[#dfa742]/30">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview (Homepage)</span>
              </div>

              {Boolean(homeBanner.image && homeBanner.image !== "/salon/hero-man-transparent.png") ? (
                /* Custom Graphic Banner Preview */
                <div className="relative w-full">
                  <img
                    src={getFullImageUrl(homeBanner.image)}
                    alt="Hero Preview"
                    className="w-full h-auto max-h-[360px] object-cover object-center"
                  />
                  {Boolean(homeBanner.title?.trim() || homeBanner.tagline?.trim() || homeBanner.subtitle?.trim()) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-6 sm:p-10">
                      <div className="max-w-lg space-y-3">
                        {homeBanner.tagline && (
                          <div className="text-xs uppercase font-medium tracking-[0.2em] text-gray-300">
                            {homeBanner.tagline}
                          </div>
                        )}
                        {homeBanner.title && (
                          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                            {homeBanner.title}
                          </h2>
                        )}
                        {homeBanner.subtitle && (
                          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                            {homeBanner.subtitle}
                          </p>
                        )}
                        {homeBanner.buttonText && (
                          <div className="pt-1">
                            <span className="bg-[#dfa742] text-black font-semibold text-xs px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-md">
                              <span>{homeBanner.buttonText}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Default Gentleman Layout Preview */
                <div className="p-6 sm:p-10 relative">
                  <div className="absolute top-0 right-0 bottom-0 w-full sm:w-1/2 pointer-events-none opacity-80 overflow-hidden">
                    <img
                      src={getFullImageUrl(homeBanner.image) || "/salon/hero-man-transparent.png"}
                      alt="Hero Preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e11] via-[#0d0e11]/70 to-transparent" />
                  </div>

                  <div className="relative z-10 max-w-lg space-y-4 py-4">
                    {homeBanner.tagline && (
                      <div className="text-xs uppercase font-medium tracking-[0.2em] text-gray-400">
                        {homeBanner.tagline}
                      </div>
                    )}
                    {homeBanner.title && (
                      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                        {homeBanner.title}
                      </h2>
                    )}
                    {homeBanner.subtitle && (
                      <p className="text-sm text-gray-300 font-light leading-relaxed">
                        {homeBanner.subtitle}
                      </p>
                    )}
                    <div className="pt-2 flex items-center gap-3">
                      <span className="bg-[#dfa742] text-black font-semibold text-xs px-5 py-2.5 rounded-full inline-flex items-center gap-1.5 shadow-md">
                        <span>{homeBanner.buttonText || "Book Now"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="border border-white/30 text-white font-medium text-xs px-4 py-2.5 rounded-full bg-black/40">
                        Shop Products
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Editing Form */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                Edit Homepage Hero Banner
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Main Title
                  </label>
                  <input
                    type="text"
                    value={homeBanner.title}
                    onChange={(e) => setHomeBanner({ ...homeBanner, title: e.target.value })}
                    placeholder="Trend Salon"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Top Tagline
                  </label>
                  <input
                    type="text"
                    value={homeBanner.tagline}
                    onChange={(e) => setHomeBanner({ ...homeBanner, tagline: e.target.value })}
                    placeholder="Look Good • Feel Great"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Subtitle */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={homeBanner.subtitle}
                    onChange={(e) => setHomeBanner({ ...homeBanner, subtitle: e.target.value })}
                    placeholder="Premium Grooming & Wellness Services for the Modern Gentleman"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={homeBanner.buttonText}
                    onChange={(e) => setHomeBanner({ ...homeBanner, buttonText: e.target.value })}
                    placeholder="Book Now"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Banner Image URL / Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Banner Graphic Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={homeBanner.image}
                      onChange={(e) => setHomeBanner({ ...homeBanner, image: e.target.value })}
                      placeholder="/salon/hero-man-transparent.png"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                    />
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-gray-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-gray-600" />
                      <span>{uploading ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "home")}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Recommended: Transparent PNG or dark background photo (min 1200x800).
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave("home")}
                  disabled={saving}
                  className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-sm px-7 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-[#dfa742]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Homepage Banner"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOMEPAGE 2ND BANNER (SPECIAL OFFERS) */}
        {activeTab === "offers" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Live Visual Preview */}
            <div className="bg-[#0c0d10] text-white rounded-3xl overflow-hidden border border-[#dfa742]/30 shadow-2xl relative min-h-[220px]">
              <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#dfa742] flex items-center gap-1.5 border border-[#dfa742]/30">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview (Special Offers Banner)</span>
              </div>

              {Boolean(offersBanner.image) ? (
                /* Custom Graphic Banner Preview (Square / Rectangular) */
                <div className="relative w-full">
                  <img
                    src={getFullImageUrl(offersBanner.image)}
                    alt="Special Offers Preview"
                    className="w-full h-auto max-h-[340px] object-cover object-center"
                  />
                  {Boolean(offersBanner.title?.trim() || offersBanner.subtitle?.trim() || offersBanner.buttonText?.trim()) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-6 sm:p-10">
                      <div className="max-w-lg space-y-3">
                        {offersBanner.title && (
                          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#dfa742] tracking-tight">
                            {offersBanner.title}
                          </h2>
                        )}
                        {offersBanner.subtitle && (
                          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                            {offersBanner.subtitle}
                          </p>
                        )}
                        {offersBanner.buttonText && (
                          <div className="pt-1">
                            <span className="bg-[#dfa742] text-black font-semibold text-xs px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-md">
                              <span>{offersBanner.buttonText}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Default Luxury Rectangular Section Preview */
                <div className="p-6 sm:p-10 relative">
                  <div className="relative z-10 max-w-lg space-y-3 py-4">
                    <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#dfa742] tracking-tight">
                      {offersBanner.title || "Special Offers"}
                    </h2>
                    <p className="text-sm text-gray-300 font-light leading-relaxed">
                      {offersBanner.subtitle || "Look Better. Pay Less."}
                    </p>
                    <div className="pt-2">
                      <span className="bg-[#dfa742] text-black font-semibold text-xs px-5 py-2.5 rounded-full inline-flex items-center gap-1.5 shadow-md">
                        <span>{offersBanner.buttonText || "View All Offers"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Editing Form */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                Edit Homepage 2nd Banner (Special Offers)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Banner Graphic Image URL / Upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Banner Graphic Image (Square / Rectangular)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={offersBanner.image}
                      onChange={(e) => setOffersBanner({ ...offersBanner, image: e.target.value })}
                      placeholder="Upload custom graphical banner or enter URL"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                    />
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-gray-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-gray-600" />
                      <span>{uploading ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "offers")}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Upload any custom designed graphical banner. Top and bottom curves have been removed so your banner renders straight and full-width!
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Banner Title (Optional if text is inside image)
                  </label>
                  <input
                    type="text"
                    value={offersBanner.title}
                    onChange={(e) => setOffersBanner({ ...offersBanner, title: e.target.value })}
                    placeholder="Special Offers"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={offersBanner.subtitle}
                    onChange={(e) => setOffersBanner({ ...offersBanner, subtitle: e.target.value })}
                    placeholder="Look Better. Pay Less."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={offersBanner.buttonText}
                    onChange={(e) => setOffersBanner({ ...offersBanner, buttonText: e.target.value })}
                    placeholder="View All Offers"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Target Link */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Button Target Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={offersBanner.link}
                    onChange={(e) => setOffersBanner({ ...offersBanner, link: e.target.value })}
                    placeholder="/services-products or leave empty for Offers popup"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave("offers")}
                  disabled={saving}
                  className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-sm px-7 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-[#dfa742]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Special Offers Banner"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES & PRODUCTS PAGE BANNER */}
        {activeTab === "services" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Live Visual Preview */}
            <div className="bg-[#0d0e11] text-white rounded-3xl overflow-hidden border border-[#dfa742]/30 shadow-2xl relative min-h-[220px]">
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#dfa742] flex items-center gap-1.5 border border-[#dfa742]/30 z-20">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview (Services Page)</span>
              </div>

              {Boolean(servicesBanner.image && servicesBanner.image !== "/salon/services-man.png") ? (
                /* Full-Width Custom Designed Banner Preview */
                <div className="relative w-full">
                  <img
                    src={getFullImageUrl(servicesBanner.image)}
                    alt="Services Banner Preview"
                    className="w-full h-auto max-h-[340px] object-cover object-center"
                  />
                  {Boolean(servicesBanner.title?.trim() || servicesBanner.subtitle?.trim()) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-6 sm:p-10">
                      <div className="max-w-lg space-y-2">
                        {servicesBanner.title && (
                          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#dfa742] tracking-tight">
                            {servicesBanner.title}
                          </h2>
                        )}
                        {servicesBanner.subtitle && (
                          <p className="text-xs sm:text-sm text-gray-200 font-light tracking-wide">
                            {servicesBanner.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Default Split Preview */
                <div className="p-8 sm:p-12 relative">
                  <div className="absolute top-0 right-0 bottom-0 w-3/5 pointer-events-none overflow-hidden select-none">
                    <img
                      src={getFullImageUrl(servicesBanner.image) || "/salon/services-man.png"}
                      alt="Services Banner Preview"
                      className="w-full h-full object-cover object-right filter brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e11] via-[#0d0e11]/60 to-transparent sm:via-[#0d0e11]/20" />
                  </div>

                  <div className="relative z-10 max-w-lg space-y-2 py-4">
                    {servicesBanner.title && (
                      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#dfa742] tracking-tight">
                        {servicesBanner.title}
                      </h2>
                    )}
                    {servicesBanner.subtitle && (
                      <p className="text-sm sm:text-base text-gray-200 font-light tracking-wide">
                        {servicesBanner.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Editing Form */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                Edit Services &amp; Products Page Banner
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={servicesBanner.title}
                    onChange={(e) => setServicesBanner({ ...servicesBanner, title: e.target.value })}
                    placeholder="Our Services & Products"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={servicesBanner.subtitle}
                    onChange={(e) => setServicesBanner({ ...servicesBanner, subtitle: e.target.value })}
                    placeholder="Professional Care. Premium Quality."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Banner Image URL / Upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Background Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={servicesBanner.image}
                      onChange={(e) => setServicesBanner({ ...servicesBanner, image: e.target.value })}
                      placeholder="/salon/services-man.png"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                    />
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-gray-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-gray-600" />
                      <span>{uploading ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "services")}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Recommended: High-resolution landscape image (1920x600 or 1200x500).
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave("services")}
                  disabled={saving}
                  className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-sm px-7 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-[#dfa742]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Services Banner"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS HERO BANNER */}
        {activeTab === "products" && (
          <div className="space-y-8">
            {/* Live Preview Card */}
            <div className="relative bg-[#0d0e11] rounded-2xl overflow-hidden p-8 sm:p-12 text-white border border-gray-800 shadow-2xl">
              <div className="absolute top-3 left-3 bg-[#dfa742] text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-20 flex items-center gap-1 shadow">
                <Eye className="w-3 h-3" />
                <span>Live Preview</span>
              </div>

              {/* Background ambient glow */}
              <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#dfa742]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Right Hero Image */}
              <div className="absolute top-0 right-0 bottom-0 w-3/5 pointer-events-none overflow-hidden select-none">
                <img
                  src={getFullImageUrl(productsBanner.image) || "/salon/services-man.png"}
                  alt="Products Banner Preview"
                  className="w-full h-full object-cover object-right filter brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e11] via-[#0d0e11]/60 to-transparent sm:via-[#0d0e11]/20" />
              </div>

              {/* Foreground Typography */}
              <div className="relative z-10 max-w-lg space-y-2 py-4">
                {/* Salon Emblem/Logo above title */}
                <div className="flex items-center gap-2 pb-0.5">
                  <div className="w-8 h-8 rounded-full bg-[#dfa742]/15 border border-[#dfa742]/40 flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-4 h-4 text-[#dfa742]" />
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

                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#dfa742] tracking-tight">
                  {productsBanner.title || "Our Products"}
                </h2>
                <p className="text-sm sm:text-base text-gray-200 font-light tracking-wide">
                  {productsBanner.subtitle || "Premium Grooming & Care Products for the Modern Gentleman."}
                </p>
                <div className="text-xs text-gray-400 pt-1">
                  <span>Home</span> &gt; <span className="text-gray-200">Our Products</span>
                </div>
              </div>
            </div>

            {/* Editing Form */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#dfa742]" />
                <span>Edit Products Page Banner</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={productsBanner.title}
                    onChange={(e) => setProductsBanner({ ...productsBanner, title: e.target.value })}
                    placeholder="Our Products"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={productsBanner.subtitle}
                    onChange={(e) => setProductsBanner({ ...productsBanner, subtitle: e.target.value })}
                    placeholder="Premium Grooming & Care Products for the Modern Gentleman."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                  />
                </div>

                {/* Banner Image URL / Upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Background Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productsBanner.image}
                      onChange={(e) => setProductsBanner({ ...productsBanner, image: e.target.value })}
                      placeholder="/salon/services-man.png"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm"
                    />
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-gray-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-gray-600" />
                      <span>{uploading ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "products")}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Recommended: High-resolution landscape image (1920x600 or 1200x500).
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave("products")}
                  disabled={saving}
                  className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-sm px-7 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-[#dfa742]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Products Banner"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
