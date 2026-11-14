"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import {
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Tag,
  FileText,
  Layers,
  Globe,
  Plus,
  Trash2,
  Eye,
  Check,
} from "lucide-react"
import axios from "axios"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

// Fallback IDs from MongoDB in case API lookup takes a moment
const FALLBACK_CATEGORY_SERVICES = "6af44188bd65d79055f298c4"
const FALLBACK_CATEGORY_PRODUCTS = "6af44188bd65d79055f298c8"
const FALLBACK_BRAND_ID = "6af44188bd65d79055f298be"

const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

const AddProduct = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const itemType = queryParams.get("type") // "service" | "product"
  const isService = itemType === "service"

  const { showToast } = useToast()

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)

  // Toggle for Advanced options accordion
  const [showAdvanced, setShowAdvanced] = useState(false)

  // New gallery image input URL state
  const [newGalleryUrl, setNewGalleryUrl] = useState("")

  // Form State: 3 primary fields + advanced fields
  const [formData, setFormData] = useState({
    // Primary fields
    name: "",
    price: "",
    image: "",

    // Advanced fields
    shortDescription: "",
    description: "",
    offerPrice: "",
    buyingPrice: "",
    countInStock: "999",
    stockStatus: "In Stock",
    canPurchase: true,
    sku: "",
    slug: "",
    barcode: "",
    tags: "",
    galleryImages: [],
    isActive: true,
    featured: false,
    refundable: true,
    selectedCategory: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  })

  // Fetch categories & brands for background auto-assignment or manual select
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setFetchingData(true)
        const [catRes, brandRes] = await Promise.all([
          axios.get(`${config.API_URL}/api/categories`).catch(() => ({ data: [] })),
          axios.get(`${config.API_URL}/api/brands`).catch(() => ({ data: [] })),
        ])
        setCategories(Array.isArray(catRes.data) ? catRes.data : [])
        setBrands(Array.isArray(brandRes.data) ? brandRes.data : [])
      } catch (err) {
        console.error("Failed to load metadata:", err)
      } finally {
        setFetchingData(false)
      }
    }
    fetchMetadata()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUploaded = (uploadedUrl) => {
    if (uploadedUrl) {
      let rawUrl = typeof uploadedUrl === "string" ? uploadedUrl : uploadedUrl[0] || ""
      if (rawUrl && !rawUrl.startsWith("http") && !rawUrl.startsWith("/") && !rawUrl.startsWith("uploads/")) {
        rawUrl = `/uploads/${rawUrl}`
      }
      setFormData((prev) => ({
        ...prev,
        image: rawUrl,
      }))
    }
  }

  const handleGalleryImageUploaded = (uploadedUrls) => {
    if (uploadedUrls) {
      const urlsArray = Array.isArray(uploadedUrls) ? uploadedUrls : [uploadedUrls]
      const normalized = urlsArray.map((u) => {
        let raw = typeof u === "string" ? u : u?.url || ""
        if (raw && !raw.startsWith("http") && !raw.startsWith("/") && !raw.startsWith("uploads/")) {
          return `/uploads/${raw}`
        }
        return raw
      }).filter(Boolean)

      setFormData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...normalized],
      }))
    }
  }

  const addGalleryUrl = () => {
    const trimmed = newGalleryUrl.trim()
    if (!trimmed) return
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, trimmed],
    }))
    setNewGalleryUrl("")
  }

  const removeGalleryImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== indexToRemove),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedName = (formData.name || "").trim()
    if (!trimmedName) {
      showToast(isService ? "Please enter a service name" : "Please enter a product name", "error")
      return
    }

    const numericPrice = parseFloat(formData.price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      showToast("Please enter a valid price in AED", "error")
      return
    }

    setLoading(true)

    try {
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")

      if (!token) {
        showToast("Please login as admin first", "error")
        navigate("/grabiansadmin/login")
        return
      }

      // Determine parent category
      let parentCategoryId = isService ? FALLBACK_CATEGORY_SERVICES : FALLBACK_CATEGORY_PRODUCTS
      if (formData.selectedCategory) {
        parentCategoryId = formData.selectedCategory
      } else if (categories.length > 0) {
        const found = categories.find((c) =>
          isService
            ? c.slug === "services" || c.name?.toLowerCase().includes("service")
            : c.slug === "products" || c.name?.toLowerCase().includes("product")
        )
        if (found?._id) parentCategoryId = found._id
      }

      // Auto-assign brand
      let brandId = FALLBACK_BRAND_ID
      if (brands.length > 0) {
        brandId = brands[0]._id
      }

      // Generate or use custom slug & SKU
      const randomSuffix = Date.now().toString().slice(-4)
      const baseSlug = slugify(trimmedName) || (isService ? "service" : "product")
      const finalSlug = (formData.slug || "").trim()
        ? slugify(formData.slug)
        : `${baseSlug}-${randomSuffix}`

      const finalSku = (formData.sku || "").trim()
        ? formData.sku.trim()
        : `${isService ? "SRV" : "PRD"}-${Date.now().toString().slice(-6)}`

      // Normalize main image path
      let finalImage = (formData.image || "").trim()
      if (
        finalImage &&
        !finalImage.startsWith("http") &&
        !finalImage.startsWith("/") &&
        !finalImage.startsWith("uploads/")
      ) {
        finalImage = `/uploads/${finalImage}`
      }

      // Parse tags
      const tagsArray = formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : []

      const numericOfferPrice = formData.offerPrice ? parseFloat(formData.offerPrice) : numericPrice
      const numericBuyingPrice = formData.buyingPrice ? parseFloat(formData.buyingPrice) : 0
      const stockQty = formData.countInStock !== "" ? parseInt(formData.countInStock, 10) : 999

      const payload = {
        name: trimmedName,
        price: numericPrice,
        buyingPrice: isNaN(numericBuyingPrice) ? 0 : numericBuyingPrice,
        offerPrice: isNaN(numericOfferPrice) ? numericPrice : numericOfferPrice,
        discount:
          numericPrice > numericOfferPrice
            ? Math.round(((numericPrice - numericOfferPrice) / numericPrice) * 100)
            : 0,
        image: finalImage || "",
        galleryImages: formData.galleryImages?.length > 0 ? formData.galleryImages : finalImage ? [finalImage] : [],
        parentCategory: parentCategoryId,
        category: null,
        subCategory: null,
        brand: brandId,
        slug: finalSlug,
        sku: finalSku,
        barcode: (formData.barcode || "").trim(),
        description: formData.description?.trim() || `${trimmedName} - Trend Saloon`,
        shortDescription: formData.shortDescription?.trim() || "",
        countInStock: isNaN(stockQty) ? 999 : stockQty,
        stockStatus: formData.stockStatus || "In Stock",
        isActive: formData.isActive,
        featured: formData.featured,
        canPurchase: formData.canPurchase,
        showStockOut: false,
        refundable: formData.refundable,
        tags: tagsArray,
        seoTitle: formData.seoTitle?.trim() || "",
        seoDescription: formData.seoDescription?.trim() || "",
        seoKeywords: formData.seoKeywords?.trim() || "",
        targetCountries: ["ALL"],
        countryStock: [{ country: "AE", countInStock: isNaN(stockQty) ? 999 : stockQty }],
      }

      await axios.post(`${config.API_URL}/api/products`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      showToast(isService ? "Service added successfully!" : "Product added successfully!", "success")
      navigate(isService ? "/admin/products?type=services" : "/admin/products?type=products")
    } catch (error) {
      console.error("Error adding item:", error)
      showToast(error.response?.data?.message || "Failed to add item", "error")
    } finally {
      setLoading(false)
    }
  }

  const redirectBack = () => {
    navigate(isService ? "/admin/products?type=services" : "/admin/products?type=products")
  }

  return (
    <div className="min-h-screen bg-[#0d0e11] text-gray-100 flex">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <div className="p-6 sm:p-10 max-w-4xl mx-auto w-full">
          {/* Header & Back Navigation */}
          <div className="mb-8">
            <button
              onClick={redirectBack}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-gray-400 hover:text-[#dfa742] transition-colors mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to {isService ? "All Services" : "All Products"}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#dfa742]/10 border border-[#dfa742]/30 flex items-center justify-center text-[#dfa742]">
                {isService ? <Sparkles className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                  {isService ? "Add New Salon Service" : "Add New Retail Product"}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Fill in standard details below, or open <strong className="text-[#dfa742]">Advance</strong> to configure full descriptions, discounts, stock, gallery, and SEO.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-[#12141a] border border-[#22252d] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#dfa742]/5 rounded-full blur-3xl pointer-events-none" />

            <form onSubmit={handleSubmit} noValidate className="space-y-6 relative z-10">
              {/* ========================================================
                  PRIMARY STANDARD FIELDS (Always Visible & Fast)
                  ======================================================== */}
              
              {/* 1. NAME FIELD */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-300 mb-2">
                  {isService ? "Service Name" : "Product Name"} <span className="text-[#dfa742]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={
                    isService
                      ? "e.g. Royal Beard Grooming & Hot Towel"
                      : "e.g. Matte Hair Styling Clay 100ml"
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0d0e11] border border-[#2b2f3a] text-white placeholder-gray-500 focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742] text-sm font-medium transition-colors"
                />
              </div>

              {/* 2. PRICE FIELD */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-300 mb-2">
                  Price <span className="text-[#dfa742]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-[#dfa742]/15 border border-[#dfa742]/30 text-[#dfa742] text-xs font-bold tracking-wider">
                      AED
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="w-full pl-20 pr-4 py-3 rounded-xl bg-[#0d0e11] border border-[#2b2f3a] text-white placeholder-gray-500 focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742] text-sm font-semibold transition-colors"
                  />
                </div>
              </div>

              {/* 3. IMAGE FIELD */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-300 mb-2">
                  {isService ? "Service Image" : "Product Main Image"}
                </label>

                {/* Direct Image Upload */}
                <div className="bg-[#0d0e11] border border-[#2b2f3a] rounded-xl p-4">
                  <ImageUpload
                    onImageUpload={handleImageUploaded}
                    currentImage={formData.image}
                    label={`Upload ${isService ? "Service" : "Product"} Image`}
                    multiple={false}
                    isProduct={true}
                  />

                  {/* Or Paste URL Option */}
                  <div className="mt-4 pt-3 border-t border-[#1f222b]">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                        Or enter image URL directly
                      </span>
                    </div>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg or /uploads/..."
                      className="w-full px-3.5 py-2 rounded-lg bg-[#14161d] border border-[#262933] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-[#14161d] border border-[#262933] rounded-lg">
                      <img
                        src={getFullImageUrl(formData.image)}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-md border border-white/10"
                        onError={(e) => {
                          e.target.style.display = "none"
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">Image Selected</p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{formData.image}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================
                  ADVANCE BUTTON TOGGLE ACCORDION
                  ======================================================== */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                    showAdvanced
                      ? "bg-[#dfa742]/10 border-[#dfa742] text-[#dfa742] shadow-lg shadow-[#dfa742]/5"
                      : "bg-[#0d0e11] hover:bg-[#15171e] border-[#2b2f3a] text-gray-300 hover:text-[#dfa742] hover:border-[#dfa742]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${showAdvanced ? "bg-[#dfa742] text-black" : "bg-[#1c1f27] text-gray-400"}`}>
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs sm:text-sm font-bold tracking-wide block">
                        Advance Options
                      </span>
                      <span className="text-[11px] text-gray-400 font-normal hidden sm:block">
                        Description, category, stock, discount, gallery images, SKU & SEO
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1c1f27] text-gray-300 border border-white/5">
                      {showAdvanced ? "Hide Advance" : "Show Advance"}
                    </span>
                    {showAdvanced ? (
                      <ChevronUp className="w-4 h-4 text-[#dfa742]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
              </div>

              {/* ========================================================
                  EXPANDABLE ADVANCE SETTINGS CONTENT
                  ======================================================== */}
              {showAdvanced && (
                <div className="space-y-6 pt-4 border-t border-[#22252d] animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* ADVANCE SECTION 1: Descriptions */}
                  <div className="bg-[#0d0e11] p-5 rounded-xl border border-[#22252d] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa742]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Descriptions & Details</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Short Description / Subtitle
                      </label>
                      <input
                        type="text"
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        placeholder={
                          isService
                            ? "e.g. 45 Mins · Includes hot towel & premium beard oil"
                            : "e.g. Sulfate-free daily repairing formula"
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Full Detailed Description
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide in-depth information, ingredients, usage directions, or appointment details..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                      />
                    </div>
                  </div>

                  {/* ADVANCE SECTION 2: Pricing, Discount & Stock */}
                  <div className="bg-[#0d0e11] p-5 rounded-xl border border-[#22252d] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa742]">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Advanced Pricing & Stock</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Offer / Sale Price (AED)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="offerPrice"
                          value={formData.offerPrice}
                          onChange={handleChange}
                          placeholder="Optional discount price"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Buying Cost / Price (AED)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="buyingPrice"
                          value={formData.buyingPrice}
                          onChange={handleChange}
                          placeholder="Cost for accounting"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          name="countInStock"
                          value={formData.countInStock}
                          onChange={handleChange}
                          placeholder="999"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Stock Status
                        </label>
                        <select
                          name="stockStatus"
                          value={formData.stockStatus}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white focus:outline-none focus:border-[#dfa742] text-xs transition-colors cursor-pointer"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                          <option value="Limited Stock">Limited Stock</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Category Selection
                        </label>
                        <select
                          name="selectedCategory"
                          value={formData.selectedCategory}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white focus:outline-none focus:border-[#dfa742] text-xs transition-colors cursor-pointer"
                        >
                          <option value="">
                            {isService ? "Default Services Category" : "Default Products Category"}
                          </option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ADVANCE SECTION 3: SKU, Slug & Barcode */}
                  <div className="bg-[#0d0e11] p-5 rounded-xl border border-[#22252d] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa742]">
                      <Layers className="w-3.5 h-3.5" />
                      <span>SKU, Slug & Barcode</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Custom SKU (Optional)
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          placeholder={isService ? "e.g. SRV-001" : "e.g. PRD-HAIR-01"}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs font-mono transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Custom URL Slug (Optional)
                        </label>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleChange}
                          placeholder="e.g. royal-beard-trim"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs font-mono transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Barcode / GTIN
                        </label>
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleChange}
                          placeholder="e.g. 6291100234567"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs font-mono transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ADVANCE SECTION 4: Gallery Images */}
                  <div className="bg-[#0d0e11] p-5 rounded-xl border border-[#22252d] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa742]">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Gallery Images (Multiple)</span>
                    </div>

                    <ImageUpload
                      onImageUpload={handleGalleryImageUploaded}
                      label="Upload Additional Gallery Images"
                      multiple={true}
                      isProduct={true}
                    />

                    {/* Add by URL */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        placeholder="Paste image URL to add to gallery..."
                        className="flex-1 px-3 py-2 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#dfa742]"
                      />
                      <button
                        type="button"
                        onClick={addGalleryUrl}
                        className="px-3.5 py-2 rounded-lg bg-[#dfa742] text-black text-xs font-bold hover:bg-[#caa638] transition-colors"
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Gallery Thumbnails List */}
                    {formData.galleryImages?.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                        {formData.galleryImages.map((imgUrl, index) => (
                          <div
                            key={index}
                            className="relative group rounded-lg overflow-hidden border border-[#2b2f3a] aspect-square bg-[#14161d]"
                          >
                            <img
                              src={getFullImageUrl(imgUrl)}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none"
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ADVANCE SECTION 5: Tags & Status Toggles */}
                  <div className="bg-[#0d0e11] p-5 rounded-xl border border-[#22252d] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa742]">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Tags & Status Options</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g. hair, styling, best seller, grooming, royal"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer bg-[#14161d] p-3 rounded-lg border border-[#262933]">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="w-4 h-4 rounded text-[#dfa742] focus:ring-[#dfa742] bg-[#0d0e11] border-gray-600"
                        />
                        <span className="text-xs font-semibold text-gray-200">Active (Visible)</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer bg-[#14161d] p-3 rounded-lg border border-[#262933]">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleChange}
                          className="w-4 h-4 rounded text-[#dfa742] focus:ring-[#dfa742] bg-[#0d0e11] border-gray-600"
                        />
                        <span className="text-xs font-semibold text-gray-200">Featured Item</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer bg-[#14161d] p-3 rounded-lg border border-[#262933]">
                        <input
                          type="checkbox"
                          name="canPurchase"
                          checked={formData.canPurchase}
                          onChange={handleChange}
                          className="w-4 h-4 rounded text-[#dfa742] focus:ring-[#dfa742] bg-[#0d0e11] border-gray-600"
                        />
                        <span className="text-xs font-semibold text-gray-200">Allow Online Order</span>
                      </label>
                    </div>
                  </div>

                  {/* ADVANCE SECTION 6: SEO Settings */}
                  <div className="bg-[#0d0e11] p-5 rounded-xl border border-[#22252d] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa742]">
                      <Globe className="w-3.5 h-3.5" />
                      <span>SEO Metadata Settings</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Meta SEO Title
                      </label>
                      <input
                        type="text"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleChange}
                        placeholder="Meta title for Google search..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Meta Description
                      </label>
                      <textarea
                        name="seoDescription"
                        rows={2}
                        value={formData.seoDescription}
                        onChange={handleChange}
                        placeholder="Concise search summary snippet..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        name="seoKeywords"
                        value={formData.seoKeywords}
                        onChange={handleChange}
                        placeholder="barber, salon, styling, dubai, ajman..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161d] border border-[#2b2f3a] text-white placeholder-gray-600 focus:outline-none focus:border-[#dfa742] text-xs transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#22252d]">
                <button
                  type="button"
                  onClick={redirectBack}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1a1d24] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#dfa742] hover:bg-[#caa638] text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#dfa742]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{isService ? "Create Service" : "Create Product"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProduct
