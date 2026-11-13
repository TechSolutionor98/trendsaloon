"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import { ArrowLeft, Sparkles, ShoppingBag, DollarSign, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
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

  // Only 3 user-facing fields: Name, Price, Image!
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
  })

  // Fetch categories & brands for background auto-assignment
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
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUploaded = (uploadedUrl) => {
    if (uploadedUrl) {
      let rawUrl = typeof uploadedUrl === "string" ? uploadedUrl : (uploadedUrl[0] || "")
      if (rawUrl && !rawUrl.startsWith("http") && !rawUrl.startsWith("/") && !rawUrl.startsWith("uploads/")) {
        rawUrl = `/uploads/${rawUrl}`
      }
      setFormData((prev) => ({
        ...prev,
        image: rawUrl,
      }))
    }
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

      // Auto-assign parent category
      let parentCategoryId = isService ? FALLBACK_CATEGORY_SERVICES : FALLBACK_CATEGORY_PRODUCTS
      if (categories.length > 0) {
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

      // Generate unique slug & SKU
      const randomSuffix = Date.now().toString().slice(-4)
      const baseSlug = slugify(trimmedName) || (isService ? "service" : "product")
      const uniqueSlug = `${baseSlug}-${randomSuffix}`
      const uniqueSku = `${isService ? "SRV" : "PRD"}-${Date.now().toString().slice(-6)}`

      // Normalize image path
      let finalImage = (formData.image || "").trim()
      if (finalImage && !finalImage.startsWith("http") && !finalImage.startsWith("/") && !finalImage.startsWith("uploads/")) {
        finalImage = `/uploads/${finalImage}`
      }

      const payload = {
        name: trimmedName,
        price: numericPrice,
        buyingPrice: 0,
        offerPrice: numericPrice,
        discount: 0,
        image: finalImage || "",
        galleryImages: finalImage ? [finalImage] : [],
        parentCategory: parentCategoryId,
        category: null,
        subCategory: null,
        brand: brandId,
        slug: uniqueSlug,
        sku: uniqueSku,
        description: `${trimmedName} - Trend Gents Saloon`,
        countInStock: 999,
        stockStatus: "In Stock",
        isActive: true,
        canPurchase: true,
        showStockOut: false,
        refundable: true,
        targetCountries: ["ALL"],
        countryStock: [{ country: "AE", countInStock: 999 }],
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
                  Enter the name, price and image for your {isService ? "service" : "product"}.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-[#12141a] border border-[#22252d] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#dfa742]/5 rounded-full blur-3xl pointer-events-none" />

            <form onSubmit={handleSubmit} noValidate className="space-y-6 relative z-10">
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
                  {isService ? "Service Image" : "Product Image"}
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
