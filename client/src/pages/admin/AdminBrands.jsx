"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaExclamationTriangle, FaTools } from "react-icons/fa"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { getFullImageUrl } from "../../utils/imageUtils"

import config from "../../config/config"
const AdminBrands = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [brandsPerPage] = useState(10)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/brands/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBrands(data.filter((brand) => !brand.isDeleted))
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError("Failed to load brands. Please try again later.")
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching brands:", error)
      setError("Failed to load brands. Please try again later.")
      setLoading(false)
    }
  }

  const deleteBrand = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/brands/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setBrands(brands.filter((brand) => brand._id !== id))
        } else {
          alert("Failed to delete brand")
        }
      } catch (error) {
        console.error("Error deleting brand:", error)
        alert("Error deleting brand")
      }
    }
  }

  const fixBrandName = async (brandId, currentName) => {
    const newName = prompt("Enter the correct brand name:", currentName)
    if (newName && newName.trim() && newName !== currentName) {
      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch(`${config.API_URL}/api/brands/${brandId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newName.trim(),
            slug: newName
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          }),
        })

        if (response.ok) {
          fetchBrands() // Refresh the list
        } else {
          alert("Failed to update brand name")
        }
      } catch (error) {
        console.error("Error updating brand:", error)
        alert("Error updating brand")
      }
    }
  }

  const handleToggleStatus = async (brandId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const brand = brands.find(b => b._id === brandId)
      if (!brand) return

      const newStatus = !brand.isActive

      const response = await fetch(`${config.API_URL}/api/brands/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the brand in the local state
        setBrands(brands.map(b => 
          b._id === brandId ? { ...b, isActive: newStatus } : b
        ))
        showToast(`Brand ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update brand status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle brand status:", error)
      showToast("Failed to update brand status", "error")
    }
  }

  // Helper function to detect if a name looks like an ID
  const isLikelyId = (name) => {
    if (!name) return true
    const str = String(name)
    return (
      str.match(/^[0-9a-fA-F]{24}$/) ||
      str.match(/^[0-9a-fA-F]{12,}$/) ||
      str.length > 20
    )
  }

  // Helper function to get display name
  const getDisplayName = (brand) => {
    if (brand.name && !isLikelyId(brand.name)) {
      return brand.name
    }
    if (brand.slug && !isLikelyId(brand.slug)) {
      return brand.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
    if (brand.description && !isLikelyId(brand.description)) {
      return brand.description
    }
    return "Invalid Brand Data"
  }

  // Helper function to check if brand has data issues
  const hasBrandDataIssues = (brand) => {
    return isLikelyId(brand.name) || !brand.name || brand.name.trim() === ""
  }

  // Filter brands based on search term
  const filteredBrands = brands.filter((brand) => {
    const displayName = getDisplayName(brand).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return (
      displayName.includes(searchLower) ||
      (brand.description && brand.description.toLowerCase().includes(searchLower)) ||
      (brand.slug && brand.slug.toLowerCase().includes(searchLower))
    )
  })

  // Separate brands with issues from valid brands
  const validBrands = filteredBrands.filter((brand) => !hasBrandDataIssues(brand))
  const problematicBrands = filteredBrands.filter((brand) => hasBrandDataIssues(brand))

  // Combine them with problematic brands first for visibility
  const sortedBrands = [...problematicBrands, ...validBrands]

  // Pagination
  const indexOfLastBrand = currentPage * brandsPerPage
  const indexOfFirstBrand = indexOfLastBrand - brandsPerPage
  const currentBrands = sortedBrands.slice(indexOfFirstBrand, indexOfLastBrand)
  const totalPages = Math.ceil(sortedBrands.length / brandsPerPage)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#0d0e11] text-gray-100">
        <div className="inline-block w-8 h-8 border-2 border-[#dfa742] border-t-transparent rounded-full animate-spin mb-2" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#0d0e11] text-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">Manage Brands</h1>
          <Link
            to="/admin/add-brand"
            className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#dfa742]/20"
          >
            Add New Brand
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 bg-[#14161d] border border-[#262933] text-white rounded-xl focus:outline-none focus:border-[#dfa742] text-sm"
          />
        </div>

        {/* Data Issues Warning */}
        {problematicBrands.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center mb-2">
              <span className="text-[#dfa742] mr-2">⚠️</span>
              <h3 className="font-semibold text-[#dfa742]">Data Issues Detected ({problematicBrands.length} brands)</h3>
            </div>
            <p className="text-gray-300 text-xs">
              Some brands are showing IDs instead of proper names. Use the "Fix" button to correct them.
            </p>
          </div>
        )}

        {/* Brands Table */}
        <div className="bg-[#14161d] rounded-2xl border border-[#262933] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#22252d]">
              <thead className="bg-[#181a22]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#14161d] divide-y divide-[#22252d]">
                {currentBrands.map((brand) => {
                  const hasIssues = hasBrandDataIssues(brand)
                  const displayName = getDisplayName(brand)

                  return (
                    <tr
                      key={brand._id}
                      className={hasIssues ? "bg-yellow-500/5 border-l-4 border-l-[#dfa742]" : "hover:bg-[#1a1d26] transition-colors"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {brand.logo ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border border-white/10"
                                src={getFullImageUrl(brand.logo) || "/placeholder.svg"}
                                alt={displayName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#1a1d24] border border-[#262933] flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No Logo</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${hasIssues ? "text-[#dfa742]" : "text-white"}`}>
                              {displayName}
                              {hasIssues && <span className="ml-2 text-[#dfa742]">⚠️</span>}
                            </div>
                            <div className="text-xs text-gray-400">/{brand.slug || generateSlug(displayName)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {brand.description || "No description"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#dfa742] hover:underline"
                          >
                            {brand.website}
                          </a>
                        ) : (
                          "No website"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            brand.isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(brand._id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                              brand.isActive 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            }`}
                            title={brand.isActive ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </button>
                          <Link
                            to={`/admin/edit-brand/${brand._id}`}
                            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#1a1d24] transition-colors"
                          >
                            <FaEdit size={16} />
                          </Link>
                          <button
                            onClick={() => deleteBrand(brand._id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-[#181a22] px-6 py-4 flex items-center justify-between border-t border-[#262933]">
              <div>
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-white">{indexOfFirstBrand + 1}</span> to{" "}
                  <span className="font-semibold text-white">{Math.min(indexOfLastBrand, sortedBrands.length)}</span> of{" "}
                  <span className="font-semibold text-[#dfa742]">{sortedBrands.length}</span> results
                </p>
              </div>
              <div>
                <nav className="inline-flex rounded-xl shadow-sm gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-[#dfa742] text-black font-bold"
                          : "bg-[#14161d] border border-[#262933] text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>

        {sortedBrands.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No brands found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export default AdminBrands
