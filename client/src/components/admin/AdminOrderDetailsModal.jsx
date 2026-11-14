import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import {
  X,
  Package,
  CreditCard,
  MapPin,
  User,
  Printer,
  Save,
  Shield,
  Mail,
  RefreshCw,
} from "lucide-react"

import config from "../../config/config"
import { getInvoiceBreakdown } from "../../utils/invoiceBreakdown"
import { resolveOrderItemBasePrice, computeBaseSubtotal, deriveBaseDiscount } from "../../utils/orderPricing"
import { getPaymentMethodDisplay, getPaymentMethodBadgeColor, getOrderCountryName, formatOrderPrice } from "../../utils/paymentUtils"
import { paymentMethodChargeAPI, adminAPI } from "../../services/api"
import InvoiceComponent from "./InvoiceComponent"
import QuotationInvoiceComponent from "./QuotationInvoiceComponent"
import { askToEmailCustomer } from "../../utils/customerEmail"
import { orderCustomerName, orderCustomerEmail, orderCustomerPhone, orderPickupStore } from "../../utils/orderCustomer"

const orderStatusOptions = [
  "New",
  "Processing",
  "Confirmed",
  "Ready For Shipment",
  "Shipped",
  "On the Way",
  "Out for Delivery",
  "Delivered",
  "On Hold",
  "Cancelled",
  "Deleted",
]

const AdminOrderDetailsModal = ({ isOpen, order: initialOrder, onClose, onUpdate, isQuotation }) => {
  const [order, setOrder] = useState(initialOrder)
  const [processingAction, setProcessingAction] = useState(false)
  const [error, setError] = useState(null)

  // Notes and tracking states
  const [trackingId, setTrackingId] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")
  const [sellerComments, setSellerComments] = useState("")

  // Notification modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationOrderId, setNotificationOrderId] = useState(null)
  
  const [fallbackDynamicCharges, setFallbackDynamicCharges] = useState([])

  const printComponentRef = useRef(null)

  const [sendingConvert, setSendingConvert] = useState(false)
  const [sendEmailOnConvert, setSendEmailOnConvert] = useState(false)

  const convertQuotation = async () => {
    if (!order?._id) return
    try {
      setSendingConvert(true)
      const response = await adminAPI.convertQuotation(order._id, {
        sendCustomerEmail: sendEmailOnConvert,
      })
      alert(`Quotation converted to Order #${response?.order?._id?.slice?.(-6) || ""}`)
      const updatedQuotation = {
        ...order,
        quotationStatus: "Converted",
        convertedOrderId: response?.order?._id || response?.order,
      }
      setOrder(updatedQuotation)
      if (onUpdate) onUpdate(updatedQuotation)
    } catch (e) {
      alert(e?.message || "Failed to convert quotation")
    } finally {
      setSendingConvert(false)
    }
  }

  const selectedTotals = order ? getInvoiceBreakdown(order) : {}

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder)
      setTrackingId(initialOrder.trackingId || "")
      setEstimatedDelivery(
        initialOrder.estimatedDelivery
          ? new Date(initialOrder.estimatedDelivery).toISOString().split("T")[0]
          : ""
      )
      setSellerComments(initialOrder.sellerComments || "")
    }
  }, [initialOrder])

  useEffect(() => {
    if (isOpen && order && !selectedTotals.hasPaymentCharges && selectedTotals.isCOD) {
      paymentMethodChargeAPI.getAll().then(res => {
        const codConfig = res.find(c => c.paymentMethod === 'Cash on Delivery' && c.isActive);
        if (codConfig && codConfig.charges) {
          setFallbackDynamicCharges(codConfig.charges);
        }
      }).catch(err => {
        console.error("Error fetching fallback payment charges:", err);
      });
    }
  }, [isOpen, order, selectedTotals.hasPaymentCharges, selectedTotals.isCOD])

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Invoice-${order?._id?.slice(-6) || 'N/A'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  })

  if (!isOpen || !order) return null

  const formatPrice = (price) => {
    return formatOrderPrice(price, order)
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleString()
  }

  const selectedBaseSubtotal = computeBaseSubtotal(order.orderItems || [])
  const selectedBaseDiscount = deriveBaseDiscount(selectedBaseSubtotal, selectedTotals.subtotal)

  // Calculate total discount (manual or coupon)
  const totalDiscountAmount = selectedTotals.couponDiscount + selectedTotals.manualDiscount
  const couponCodeLabel = selectedTotals.couponCode || order.couponCode || ""
  const showCouponDetail = totalDiscountAmount > 0



  const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

  const handleUpdateStatus = async (status) => {
    try {
      setProcessingAction(true)
      const token = getToken()
      // Saving the status is not in question here; the email is.
      const updateData = { status, sendCustomerEmail: await askToEmailCustomer(status, order) }

      if (status === "Delivered") {
        updateData.isPaid = true
        updateData.paidAt = new Date().toISOString()
      }

      const { data } = await axios.put(`${config.API_URL}/api/admin/orders/${order._id}/status`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrder = { ...order, ...updateData }
      setOrder(updatedOrder)
      if (onUpdate) onUpdate(updatedOrder)
      setError(null)
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update order status: " + (error.response?.data?.message || error.message))
    } finally {
      setProcessingAction(false)
    }
  }

  const handleUpdatePaymentStatus = async (isPaid) => {
    try {
      setProcessingAction(true)
      const token = getToken()

      const updateData = {
        isPaid,
        paidAt: isPaid ? new Date().toISOString() : null,
      }

      await axios.put(`${config.API_URL}/api/admin/orders/${order._id}/status`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrder = { ...order, ...updateData }
      setOrder(updatedOrder)
      if (onUpdate) onUpdate(updatedOrder)
      setError(null)
    } catch (error) {
      console.error("Error updating payment status:", error)
      alert("Failed to update payment status: " + (error.response?.data?.message || error.message))
    } finally {
      setProcessingAction(false)
    }
  }

  const handleSaveOrderDetails = async () => {
    try {
      setProcessingAction(true)
      const token = getToken()

      const updateData = {
        trackingId,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
        sellerComments,
      }

      await axios.put(`${config.API_URL}/api/admin/orders/${order._id}/details`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrder = { ...order, ...updateData }
      setOrder(updatedOrder)
      if (onUpdate) onUpdate(updatedOrder)
      alert("Order details updated successfully!")
      setError(null)
    } catch (error) {
      console.error("Error updating order details:", error)
      alert("Failed to update order details: " + (error.response?.data?.message || error.message))
    } finally {
      setProcessingAction(false)
    }
  }

  const handleSendNotification = (orderId) => {
    setNotificationOrderId(orderId)
    setNotificationMessage(order.sellerMessage || "")
    setShowNotificationModal(true)
  }

  const handleConfirmSendNotification = async () => {
    try {
      setProcessingAction(true)
      const token = getToken()

      await axios.post(
        `${config.API_URL}/api/admin/orders/${notificationOrderId}/notify`,
        { sellerMessage: notificationMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (notificationMessage) {
        const updatedOrder = { ...order, sellerMessage: notificationMessage }
        setOrder(updatedOrder)
        if (onUpdate) onUpdate(updatedOrder)
      }

      setShowNotificationModal(false)
      setNotificationMessage("")
      setNotificationOrderId(null)
      alert("Notification email sent successfully!")
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Failed to send notification: " + (error.response?.data?.message || error.message))
    } finally {
      setProcessingAction(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-[#12141a] text-gray-100 rounded-2xl border border-[#262933] shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#14161d] border-b border-[#262933] px-6 py-4 flex justify-between items-center z-10">
            <div>
              <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                <span>Dashboard</span>
                <span>/</span>
                <span>{isQuotation ? "Quotations" : "Orders"}</span>
                <span>/</span>
                <span className="text-[#dfa742] font-semibold">View</span>
              </div>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">{isQuotation ? "Quotation" : "Order"} ID: <span className="text-[#dfa742]">#{order._id.slice(-6)}</span></h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#1a1d24] transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#181a22] border border-[#262933] p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#dfa742]/10 border border-[#dfa742]/20 flex items-center justify-center text-[#dfa742]">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{isQuotation ? "Quotation Status" : "Status"}</p>
                    <p className="font-bold text-white text-sm mt-0.5">
                      {isQuotation ? (order.quotationStatus || "Draft") : (order.status || "New")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#181a22] border border-[#262933] p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payment Method</p>
                    <p className={`font-semibold px-2 py-0.5 rounded-full text-xs inline-block mt-0.5 ${getPaymentMethodBadgeColor(order)}`}>
                      {getPaymentMethodDisplay(order)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#181a22] border border-[#262933] p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payment Status</p>
                    <p className={`font-semibold px-2 py-0.5 rounded-full text-xs inline-block mt-0.5 ${order.isPaid ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#181a22] border border-[#262933] p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Created At</p>
                    <p className="font-semibold text-white text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update / Quotation Actions Section */}
            {isQuotation ? (
              <div className="bg-[#14161d] border border-[#262933] rounded-2xl p-5">
                <h3 className="text-base font-bold font-serif text-white mb-4">Quotation Actions</h3>
                {order.quotationStatus !== "Converted" ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        Draft Quotation
                      </span>
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendEmailOnConvert}
                          onChange={(e) => setSendEmailOnConvert(e.target.checked)}
                          className="rounded border-[#2b2f3a] text-[#dfa742] focus:ring-[#dfa742]"
                        />
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> Send order email on conversion
                        </span>
                      </label>
                    </div>
                    <button
                      onClick={convertQuotation}
                      disabled={sendingConvert}
                      className="inline-flex items-center gap-2 bg-[#dfa742] hover:bg-[#caa638] text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-60 transition-colors"
                    >
                      <RefreshCw size={14} className={sendingConvert ? "animate-spin" : ""} />
                      {sendingConvert ? "Converting..." : "Convert to Order"}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
                    ✓ This quotation has been converted to <strong>Order #{order.convertedOrderId?._id?.slice?.(-6) || order.convertedOrderId?.slice?.(-6) || "-"}</strong>.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#14161d] border border-[#262933] rounded-2xl p-5">
                <h3 className="text-base font-bold font-serif text-white mb-4">Update Order Status</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={order.status || "New"}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="bg-[#1a1d24] border border-[#2b2f3a] text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#dfa742]"
                    disabled={processingAction}
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      order.status === "Processing"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : order.status === "Confirmed"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : order.status === "Shipped"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : order.status === "Out for Delivery"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : order.status === "Delivered"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : order.status === "Cancelled"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    {order.status || "New"}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#22252d]">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Update Payment Status</h4>
                  <div className="flex items-center space-x-4">
                    <select
                      value={order.isPaid ? "Paid" : "Unpaid"}
                      onChange={(e) => handleUpdatePaymentStatus(e.target.value === "Paid")}
                      className="bg-[#1a1d24] border border-[#2b2f3a] text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#dfa742]"
                      disabled={processingAction}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        order.isPaid ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-[#14161d] border border-[#262933] rounded-2xl p-5">
              <h3 className="text-base font-bold font-serif text-white mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.orderItems?.filter(item => !item.isProtection && !item.protectionData && !item.protectionFor).map((item, index) => {
                  const basePrice = resolveOrderItemBasePrice(item)
                  const salePrice = Number(item.price) || basePrice
                  const showDiscount = !isQuotation && basePrice > salePrice
                  const lineTotal = salePrice * (item.quantity || 0)
                  const baseTotal = basePrice * (item.quantity || 0)

                  return (
                    <div
                      key={item._id || index}
                      className="flex items-center justify-between py-3 border-b border-[#22252d] last:border-b-0"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#181a22] border border-[#262933] rounded-xl flex items-center justify-center p-2 text-[#dfa742]">
                          <Package size={22} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                          {item.selectedColorData && (
                            <p className="text-xs text-[#dfa742] font-medium mt-0.5 flex items-center">
                              <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 border border-white/20" style={{backgroundColor: item.selectedColorData.color?.toLowerCase() || '#9333ea'}}></span>
                              Color: {item.selectedColorData.color}
                            </p>
                          )}
                          {item.selectedDosData && (
                            <p className="text-xs text-blue-400 font-medium mt-0.5 flex items-center">
                              💻 OS: {item.selectedDosData.dosType}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {showDiscount && (
                          <p className="text-xs text-gray-500 line-through">{formatPrice(basePrice)}</p>
                        )}
                        <p className="font-bold text-[#dfa742] text-sm">{formatPrice(salePrice)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Total: {formatPrice(lineTotal)}</p>
                      </div>
                    </div>
                  )
                }) || <p className="text-gray-500 text-center py-4">No items found</p>}
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-[#14161d] border border-[#262933] rounded-2xl p-5">
              <h3 className="text-base font-bold font-serif text-white mb-4">Total Amount</h3>
              <div className="space-y-2 text-sm">
                {!isQuotation && selectedBaseSubtotal > selectedTotals.subtotal && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Price:</span>
                    <span className="text-gray-500 line-through">{formatPrice(selectedBaseSubtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white font-medium">{formatPrice(selectedTotals.subtotal)}</span>
                </div>
                {!(selectedTotals.shipping === 0 && (
                  (selectedTotals.hasPaymentCharges && selectedTotals.paymentCharges.some(c => c.name?.toLowerCase().includes('shipping'))) ||
                  (!selectedTotals.hasPaymentCharges && fallbackDynamicCharges.some(c => c.name?.toLowerCase().includes('shipping'))) ||
                  (!selectedTotals.hasPaymentCharges && fallbackDynamicCharges.length === 0 && selectedTotals.isCOD && selectedTotals.codShippingFee > 0)
                )) && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping:</span>
                    <span className="text-white font-medium">{selectedTotals.shipping === 0 ? "Free" : formatPrice(selectedTotals.shipping)}</span>
                  </div>
                )}
                {selectedTotals.hasPaymentCharges ? (
                  selectedTotals.paymentCharges.map((charge, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-400 text-xs">💰 {charge.name}:</span>
                      <span className="text-gray-300 text-xs">{formatPrice(charge.amount)}</span>
                    </div>
                  ))
                ) : fallbackDynamicCharges.length > 0 ? (
                  fallbackDynamicCharges.map((charge, index) => (
                    <div key={`fallback-${index}`} className="flex justify-between">
                      <span className="text-gray-400 text-xs">💰 {charge.name}:</span>
                      <span className="text-gray-300 text-xs">{formatPrice(charge.amount)}</span>
                    </div>
                  ))
                ) : (
                  <>
                    {selectedTotals.isCOD && selectedTotals.codFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#dfa742] text-xs">💰 COD Handling Fee (Non-Refundable):</span>
                        <span className="text-[#dfa742] text-xs font-semibold">{formatPrice(selectedTotals.codFee)}</span>
                      </div>
                    )}
                    {selectedTotals.isCOD && selectedTotals.codShippingFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#dfa742] text-xs">🚚 COD Shipping Fee:</span>
                        <span className="text-[#dfa742] text-xs font-semibold">{formatPrice(selectedTotals.codShippingFee)}</span>
                      </div>
                    )}
                  </>
                )}
                {selectedTotals.referralDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Referral Discount:</span>
                    <span className="text-emerald-400">-{formatPrice(selectedTotals.referralDiscount)}</span>
                  </div>
                )}
                {selectedTotals.loyaltyDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loyalty Discount:</span>
                    <span className="text-emerald-400">-{formatPrice(selectedTotals.loyaltyDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">VAT (Included):</span>
                  <span className="text-white font-medium">{formatPrice(selectedTotals.tax)}</span>
                </div>
                {selectedBaseDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Offer Discount:</span>
                    <span className="text-emerald-400">-{formatPrice(selectedBaseDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-[#262933] pt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-white">Total:</span>
                  <span className="text-xl font-bold text-[#dfa742]">
                    {formatPrice(selectedTotals.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-[#14161d] border border-[#262933] rounded-2xl p-5 text-xs text-gray-300">
                <h3 className="text-base font-bold font-serif text-white mb-4">Shipping / Pickup Details</h3>
                <div className="space-y-2">
                  {order.shippingAddress ? (
                    <>
                      <p><span className="text-gray-400">Name:</span> <span className="text-white font-medium">{order.shippingAddress.name || "N/A"}</span></p>
                      <p><span className="text-gray-400">Email:</span> {order.shippingAddress.email || "N/A"}</p>
                      <p><span className="text-gray-400">Phone:</span> {order.shippingAddress.phone || "N/A"}</p>
                      <p><span className="text-gray-400">Address:</span> {order.shippingAddress.address || "N/A"}</p>
                      <p><span className="text-gray-400">City / State:</span> {order.shippingAddress.city || "N/A"}, {order.shippingAddress.state || "N/A"}</p>
                      <p><span className="text-gray-400">Country:</span> {getOrderCountryName(order)}</p>
                    </>
                  ) : order.pickupDetails ? (
                    <>
                      <p><span className="text-gray-400">Name:</span> <span className="text-white font-medium">{orderCustomerName(order) || "N/A"}</span></p>
                      <p><span className="text-gray-400">Email:</span> {orderCustomerEmail(order) || "N/A"}</p>
                      <p><span className="text-gray-400">Phone:</span> {orderCustomerPhone(order) || "N/A"}</p>
                      <div className="mt-3 rounded-xl bg-[#181a22] p-3 border border-[#262933]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#dfa742]">🏬 Collect From Store</p>
                        <p className="mt-0.5 text-xs text-gray-400">Customer will collect items from this store branch:</p>
                        <p className="mt-1 font-semibold text-white">{orderPickupStore(order).name}</p>
                        {orderPickupStore(order).address && <p className="mt-0.5 text-xs text-gray-400">{orderPickupStore(order).address}</p>}
                        {orderPickupStore(order).phone && <p className="mt-1 text-xs text-[#dfa742] font-semibold">📞 {orderPickupStore(order).phone}</p>}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">N/A</p>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-[#14161d] border border-[#262933] rounded-2xl p-5 text-xs text-gray-300">
                <h3 className="text-base font-bold font-serif text-white mb-4">Billing Information</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Name:</span> <span className="text-white font-medium">{order.billingAddress?.name || order.shippingAddress?.name || "N/A"}</span></p>
                  <p><span className="text-gray-400">Email:</span> {order.billingAddress?.email || order.shippingAddress?.email || "N/A"}</p>
                  <p><span className="text-gray-400">Phone:</span> {order.billingAddress?.phone || order.shippingAddress?.phone || "N/A"}</p>
                  <p><span className="text-gray-400">Address:</span> {order.billingAddress?.address || order.shippingAddress?.address || "N/A"}</p>
                  <p><span className="text-gray-400">Country:</span> {getOrderCountryName(order)}</p>
                </div>
              </div>
            </div>

            {/* Additional Information with Editable Fields */}
            <div className="bg-[#14161d] border border-[#262933] rounded-2xl p-5">
              <h3 className="text-base font-bold font-serif text-white mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs">
                      <span className="text-gray-400">Payment Method:</span>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPaymentMethodBadgeColor(order)}`}>
                        {getPaymentMethodDisplay(order)}
                      </span>
                    </p>
                    <p className="mb-2 text-xs">
                      <span className="text-gray-400">Payment Status:</span>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${order.isPaid ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </p>
                  </div>

                  {!isQuotation && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tracking ID</label>
                      <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="Enter tracking ID"
                        className="w-full px-4 py-2.5 bg-[#1a1d24] border border-[#2b2f3a] rounded-xl text-white text-xs focus:outline-none focus:border-[#dfa742]"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {!isQuotation && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Estimated Delivery</label>
                      <input
                        type="date"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#1a1d24] border border-[#2b2f3a] rounded-xl text-white text-xs focus:outline-none focus:border-[#dfa742]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Customer Notes</label>
                <div className="bg-[#181a22] border border-[#262933] p-4 rounded-xl min-h-[48px] text-xs text-gray-300">
                  <p className="whitespace-pre-wrap">{order.customerNotes || order.notes || "No customer notes recorded."}</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Staff Comments</label>
                <textarea
                  value={sellerComments}
                  onChange={(e) => setSellerComments(e.target.value)}
                  placeholder="Add salon staff notes here..."
                  rows="3"
                  className="w-full px-4 py-2.5 bg-[#1a1d24] border border-[#2b2f3a] rounded-xl text-white text-xs focus:outline-none focus:border-[#dfa742]"
                />
              </div>

              <div className="mt-4">
                <button
                  onClick={handleSaveOrderDetails}
                  disabled={processingAction}
                  className="flex items-center space-x-2 bg-[#dfa742] hover:bg-[#caa638] disabled:bg-gray-700 text-black font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#dfa742]/20"
                >
                  <Save size={16} />
                  <span>{processingAction ? "Saving..." : "Save Details"}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center space-x-3 pt-2">
              <button
                onClick={onClose}
                className="bg-[#181a22] hover:bg-[#222530] text-gray-300 hover:text-white border border-[#262933] font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="bg-transparent hover:bg-white/5 text-white border border-[#262933] hover:border-[#dfa742] font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center transition-colors"
              >
                <Printer size={16} className="mr-2" />
                {isQuotation ? "Print Quotation" : "Print Receipt"}
              </button>
              {!isQuotation && (
                <button
                  onClick={() => handleSendNotification(order._id)}
                  className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center transition-colors shadow-lg shadow-[#dfa742]/20"
                  disabled={processingAction}
                >
                  <Mail size={16} className="mr-2" />
                  Send Notification
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Invoice Component for Printing */}
      <div style={{ display: "none" }}>
        {isQuotation || order.sourceQuotationId ? (
          <QuotationInvoiceComponent
            order={order}
            ref={printComponentRef}
            isQuotation={Boolean(isQuotation)}
          />
        ) : (
          <InvoiceComponent order={order} ref={printComponentRef} />
        )}
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#14161d] border border-[#262933] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-[#262933]">
              <h3 className="text-base font-bold font-serif text-white flex items-center">
                <Mail size={18} className="mr-2 text-[#dfa742]" />
                Send Notification Email
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Seller Message <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter a message to include in the notification email..."
                  rows="4"
                  className="w-full px-4 py-2.5 bg-[#1a1d24] border border-[#2b2f3a] rounded-xl text-white text-xs focus:outline-none focus:border-[#dfa742]"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#262933] flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNotificationModal(false)
                  setNotificationMessage("")
                  setNotificationOrderId(null)
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-[#181a22] hover:bg-[#222530] border border-[#262933] rounded-xl transition-colors"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendNotification}
                disabled={processingAction}
                className="px-5 py-2 bg-[#dfa742] hover:bg-[#caa638] text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center transition-colors disabled:opacity-60 shadow-lg shadow-[#dfa742]/20"
              >
                {processingAction ? (
                  <>
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={14} className="mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminOrderDetailsModal
