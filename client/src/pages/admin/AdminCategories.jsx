"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import SafeDeleteModal from "../../components/admin/SafeDeleteModal"
import MoveProductsModal from "../../components/admin/MoveProductsModal"
import { Edit, Trash2, Plus } from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [productsToMove, setProductsToMove] = useState([])
  const [deletionPending, setDeletionPending] = useState(null)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Try different possible token keys
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        setLoading(false)
        return
      }

      const response = await fetch(`${config.API_URL}/api/categories/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filter to show only parent categories (level 0) and not deleted
        setCategories(data.filter((cat) => !cat.isDeleted && cat.level === 0))
      } else if (response.status === 401) {
        showToast("Authentication failed. Please login again.", "error")
      } else {
        showToast("Error fetching categories", "error")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      showToast("Error fetching categories", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const category = categories.find(c => c._id === id)
    if (category) {
      setCategoryToDelete(category)
      setDeleteModalOpen(true)
    }
  }

  const handleDeleteConfirm = async (categoryId, shouldMoveProducts) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      if (shouldMoveProducts) {
        // Store category ID for later and show move modal
        setDeletionPending(categoryId)
        
        // Fetch all products that need to be moved
        const { data } = await axios.get(`${config.API_URL}/api/products/admin`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            parentCategory: categoryId,
            limit: 1000 // Get all products
          }
        })
        
        setProductsToMove(data.products || [])
        setDeleteModalOpen(false)
        setShowMoveModal(true)
      } else {
        // Proceed with cascading deletion
        const response = await axios.delete(
          `${config.API_URL}/api/categories/${categoryId}/cascade`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { moveProducts: "false" }
          }
        )

        if (response.status === 200) {
          showToast("Category and all related data deleted successfully", "success")
          setDeleteModalOpen(false)
          setCategoryToDelete(null)
          fetchCategories()
        }
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      if (error.response?.status === 401) {
        showToast("Authentication failed. Please login again.", "error")
      } else {
        showToast(error.response?.data?.message || "Error deleting category", "error")
      }
    }
  }

  const handleProductsMove = async (moveData) => {
    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      // Move all products to the new category/subcategory
      const productIds = productsToMove.map(p => p._id)
      
      await axios.put(
        `${config.API_URL}/api/products/bulk-move`,
        {
          productIds,
          ...moveData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Now delete the category with cascading (no products to worry about)
      await axios.delete(
        `${config.API_URL}/api/categories/${deletionPending}/cascade`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { moveProducts: "false" }
        }
      )

      showToast("Products moved and category deleted successfully", "success")
      setShowMoveModal(false)
      setDeletionPending(null)
      setProductsToMove([])
      fetchCategories()
    } catch (error) {
      console.error("Error moving products:", error)
      showToast(error.response?.data?.message || "Error moving products", "error")
    }
  }

  const handleToggleStatus = async (categoryId) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const category = categories.find(c => c._id === categoryId)
      if (!category) return

      const newStatus = !category.isActive

      const response = await fetch(`${config.API_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        // Update the category in the local state
        setCategories(categories.map(c => 
          c._id === categoryId ? { ...c, isActive: newStatus } : c
        ))
        showToast(`Category ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update category status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle category status:", error)
      showToast("Failed to update category status", "error")
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0d0e11] text-gray-100">
      <AdminSidebar />
      
      {/* Safe Delete Modal */}
      <SafeDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setCategoryToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        item={categoryToDelete}
        type="category"
      />

      {/* Move Products Modal */}
      <MoveProductsModal
        isOpen={showMoveModal}
        onClose={() => {
          setShowMoveModal(false)
          setDeletionPending(null)
          setProductsToMove([])
        }}
        selectedCount={productsToMove.length}
        onMove={handleProductsMove}
      />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">Parent Categories</h1>
              <p className="text-gray-400 text-sm mt-1">Manage salon product categories • <span className="font-semibold text-[#dfa742]">{categories.length} Total Categories</span></p>
            </div>
          </div>

          <div className="bg-[#14161d] rounded-2xl border border-[#262933] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181a22]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Parent Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Sort Order
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#14161d] divide-y divide-[#22252d]">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        <div className="inline-block w-8 h-8 border-2 border-[#dfa742] border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-xs tracking-wider uppercase">Loading categories...</p>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category._id} className="hover:bg-[#1a1d26] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-4 flex-shrink-0">
                              {category.image ? (
                                <div className="relative h-10 w-10">
                                  <img
                                    src={getFullImageUrl(category.image)}
                                    alt={category.name}
                                    className="h-10 w-10 rounded-lg object-cover border border-white/10"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.classList.add("hidden")
                                      const fallback = e.currentTarget.parentElement?.querySelector(
                                        "[data-image-error]",
                                      )
                                      if (fallback) fallback.classList.remove("hidden")
                                    }}
                                  />
                                  <div
                                    data-image-error
                                    className="hidden h-10 w-10 rounded-lg border border-[#dfa742]/40 bg-[#dfa742]/10 flex items-center justify-center px-1"
                                    title="Image exists but failed to load"
                                  >
                                    <span className="text-[9px] leading-tight font-semibold text-[#dfa742] text-center line-clamp-2">
                                      {category.name}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="h-10 w-10 rounded-lg border border-[#262933] bg-[#1a1d24] flex items-center justify-center"
                                  title="No image added"
                                >
                                  <span className="text-[10px] font-semibold text-gray-500">N/A</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs truncate">
                            {category.description || "No description"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              category.isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#dfa742] font-semibold">{category.sortOrder || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(category._id)}
                              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                category.isActive 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                              }`}
                              title={category.isActive ? 'Click to deactivate' : 'Click to activate'}
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <Link
                              to={`/admin/categories/edit/${category._id}`}
                              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#1a1d24] transition-colors"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCategories
