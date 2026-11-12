"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export default function CartDrawer() {
  const navigate = useNavigate()
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    isCartDrawerOpen,
    closeCart,
  } = useCart()
  const { getLocalizedPath } = useLanguage()

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartDrawerOpen) {
        closeCart()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCartDrawerOpen, closeCart])

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isCartDrawerOpen])

  const handleProceedToCheckout = () => {
    closeCart()
    navigate(getLocalizedPath("/checkout"))
  }

  const handleViewFullCart = () => {
    closeCart()
    navigate(getLocalizedPath("/cart"))
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isCartDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over Panel from Right */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white text-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-100 ${
          isCartDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#0e0e10] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#dfa742]/20 flex items-center justify-center text-[#dfa742]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white flex items-center gap-2">
                <span>Your Cart</span>
                <span className="text-xs bg-[#dfa742] text-black font-sans font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Trend Salon Services & Products</p>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-[#dfa742]">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Looks like you haven't added any salon services or grooming products yet.
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart()
                  const el = document.getElementById("services") || document.getElementById("products")
                  if (el) el.scrollIntoView({ behavior: "smooth" })
                  else navigate(getLocalizedPath("/services"))
                }}
                className="bg-[#dfa742] hover:bg-[#caa638] text-black text-xs font-semibold px-6 py-2.5 rounded-full shadow-md transition-all hover:scale-105"
              >
                Discover Services
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemPrice = Number(item.price || 0)
              const itemTotal = itemPrice * (item.quantity || 1)

              return (
                <div
                  key={item.cartId || item._id}
                  className="flex items-center gap-3 p-3 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-colors group"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-1 border border-gray-100">
                    <img
                      src={item.image || (item.images && item.images[0]?.url) || "/salon/hero-barber.jpg"}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item._id, item.bundleId)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {item.category || "Service"}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Price */}
                      <div className="text-xs sm:text-sm font-black text-gray-900">
                        AED {itemTotal}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1, item.bundleId)}
                          className="text-gray-500 hover:text-black p-0.5 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-800 px-1.5 min-w-[16px] text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1, item.bundleId)}
                          className="text-gray-500 hover:text-black p-0.5 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Drawer Footer - Totals & Checkout Button */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-white space-y-3.5 shadow-lg">
            {/* Price Breakdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>AED {Number(cartTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-base text-[#dfa742]">
                  AED {Number(cartTotal || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>100% Genuine Grooming Products & Services</span>
            </div>

            {/* Primary Action: Proceed to Checkout */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-sm py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#dfa742]/25 transition-all duration-200 hover:scale-[1.02] active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Option: View Cart Page */}
            <div className="text-center pt-1">
              <button
                onClick={handleViewFullCart}
                className="text-xs text-gray-600 hover:text-black underline underline-offset-2 transition-colors font-medium"
              >
                Or View Full Cart Page
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

