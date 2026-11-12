import { lazyWithRetry } from "../utils/lazyWithRetry"
import { Suspense, lazy, useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import BlogNavbar from "./BlogNavbar"
import StaticRouteSEO from "./StaticRouteSEO"
import StaticPageTranslationLoader from "./StaticPageTranslationLoader"
import StaticPageContentTranslator from "./StaticPageContentTranslator"
import CartDrawer from "./CartDrawer"
import TrendHeader from "./TrendHeader"
import TrendFooter from "./TrendFooter"

const Footer = lazyWithRetry(() => import("./Footer"))
const BlogFooter = lazyWithRetry(() => import("./BlogFooter"))

function WhatsAppButton({ raised = false }) {
  return (
    <a
      href="https://wa.me/971505033860"
      target="_blank"
      rel="noopener noreferrer"
      // Raised on pages with a sticky action bar, which occupies the space this
      // normally floats in. Left where it is, it lands on top of Buy Now or
      // Checkout and swallows the tap.
      className={`fixed ${raised ? "bottom-[150px]" : "bottom-24"} md:bottom-20 right-4 z-50`}
      aria-label="Chat on WhatsApp"
      style={{ transition: 'transform 0.2s' }}
    >
      <img
        src="/whatsapp.webp"
        alt="WhatsApp"
        width="56"
        height="56"
        className="w-14 h-14 rounded-full border-2 hover:scale-110"
        style={{ background: '#25D366' }}
      />
    </a>
  )
}

function Layout() {
  const location = useLocation()
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  )
  const [showDeferredChrome, setShowDeferredChrome] = useState(false)
  // Check if current path is a blog page (with or without language prefix)
  // Matches: /blogs, /blogs/slug, /ae-en/blogs, /ae-en/blogs/slug, /ar/blogs, etc.
  const isBlogPage = location.pathname.match(/^\/([a-z]{2}(-[a-z]{2})?\/)?blogs(\/|$)/i)
  
  // Check if current path is a full bleed salon page (home or services)
  const isFullBleedPage =
    location.pathname === "/" ||
    location.pathname === "/select-country" ||
    Boolean(location.pathname.match(/^\/[a-z]{2}(-[a-z]{2})?\/?$/i)) ||
    Boolean(location.pathname.match(/^\/([a-z]{2}(-[a-z]{2})?\/)?(services|services-and-products)(\/|$)/i))
  // The pages that carry a sticky action bar on a phone: the product page's
  // Buy Now / Add to Cart, and the cart's total and Checkout. Both put a button
  // exactly where the WhatsApp bubble floats.
  const hasStickyActionBar = location.pathname.match(
    /^\/([a-z]{2}(-[a-z]{2})?\/)?(product\/|cart$|cart\/)/i,
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!isMobileViewport) {
      setShowDeferredChrome(true)
      return
    }

    setShowDeferredChrome(false)

    const revealChrome = () => setShowDeferredChrome(true)
    const idleId = window.setTimeout(revealChrome, 1400)

    window.addEventListener("scroll", revealChrome, { once: true, passive: true })
    window.addEventListener("pointerdown", revealChrome, { once: true, passive: true })
    window.addEventListener("touchstart", revealChrome, { once: true, passive: true })

    return () => {
      window.clearTimeout(idleId)
      window.removeEventListener("scroll", revealChrome)
      window.removeEventListener("pointerdown", revealChrome)
      window.removeEventListener("touchstart", revealChrome)
    }
  }, [isMobileViewport])

  return (
    <div className="flex flex-col min-h-screen">
      <StaticRouteSEO />
      <StaticPageTranslationLoader />

      {/* Header: On full bleed pages (Home/Services), they render TrendHeader internally. On other storefront pages (Login, Register, Checkout, Cart, Guest), render TrendHeader */}
      {isBlogPage ? <BlogNavbar /> : (isFullBleedPage ? null : <TrendHeader active="other" />)}

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-white text-gray-900">
        <StaticPageContentTranslator>
          {isFullBleedPage ? (
            <Outlet />
          ) : (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[70vh]">
              <Outlet />
            </div>
          )}
        </StaticPageContentTranslator>
      </main>

      {/* Footer: On full bleed pages, they render TrendFooter internally. On other storefront pages, render TrendFooter */}
      {isBlogPage ? (
        showDeferredChrome && (
          <Suspense fallback={null}>
            <BlogFooter />
          </Suspense>
        )
      ) : (
        isFullBleedPage ? null : <TrendFooter />
      )}

      {/* Slide-over Cart Sidebar Drawer */}
      <CartDrawer />
    </div>
  )
}

export default Layout
