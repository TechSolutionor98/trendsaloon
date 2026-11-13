import { lazyWithRetry } from "./utils/lazyWithRetry"
import UnsubscribePage from "./pages/UnsubscribePage"
import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import SetPasswordPrompt from "./components/SetPasswordPrompt"
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { ToastProvider } from "./context/ToastContext"
import { LanguageProvider } from "./context/LanguageContext"
import { CurrencyProvider } from "./context/CurrencyContext"
import { LoyaltyProvider } from "./context/LoyaltyContext"
import { ReferralProvider } from "./context/ReferralContext"
import { ThemeProvider } from "./context/ThemeContext"
import LoyaltyRewardDialog from "./components/LoyaltyRewardDialog"

// Import components
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import EmailPreferences from "./pages/EmailPreferences"
import ScrollToTop from "./components/ScrollToTop"
import DisableNumberInputScroll from "./components/DisableNumberInputScroll"
import RedirectHandler from "./components/RedirectHandler"
import ReturnPathTracker from "./components/ReturnPathTracker"
import ReferralLinkCatcher from "./components/ReferralLinkCatcher"

import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"

// Import pages
import Home from "./pages/Home"
import ServicesProducts from "./pages/ServicesProducts"
import ProductsPage from "./pages/ProductsPage"
import NotFound from "./pages/NotFound"

const Shop = lazyWithRetry(() => import("./pages/Shop"))
const ProductDetails = lazyWithRetry(() => import("./pages/ProductDetails"))
const Cart = lazyWithRetry(() => import("./pages/Cart"))
const Checkout = lazyWithRetry(() => import("./pages/Checkout"))
const Login = lazyWithRetry(() => import("./pages/Login"))
const Register = lazyWithRetry(() => import("./pages/Register"))
const EmailVerification = lazyWithRetry(() => import("./pages/EmailVerification"))
const Profile = lazyWithRetry(() => import("./pages/Profile"))
const UserOrders = lazyWithRetry(() => import("./pages/UserOrders"))
const Wishlist = lazyWithRetry(() => import("./pages/Wishlist"))
const TrackOrder = lazyWithRetry(() => import("./pages/TrackOrder"))
const About = lazyWithRetry(() => import("./pages/About"))
const BlogList = lazyWithRetry(() => import("./pages/BlogList"))
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"))
const PrivacyAndPolicy = lazyWithRetry(() => import("./pages/PrivacyAndPolicy"))
const ArabicContent = lazyWithRetry(() => import("./pages/ArabicContent"))
const DisclaimerPolicy = lazyWithRetry(() => import("./pages/DisclaimerPolicy"))
const TermAndCondition = lazyWithRetry(() => import("./pages/TermAndCondition"))
const RefundAndReturn = lazyWithRetry(() => import("./pages/RefundAndReturn"))
const CookiesAndPolicy = lazyWithRetry(() => import("./pages/CookiesAndPolicy"))
const ReqBulkPurchase = lazyWithRetry(() => import("./pages/ReqBulkPurchase"))
const ContactUs = lazyWithRetry(() => import("./pages/ContactUs"))
const GuestOrder = lazyWithRetry(() => import("./pages/GuestOrder"))
const Guest = lazyWithRetry(() => import("./pages/Guest"))
const PaymentSuccess = lazyWithRetry(() => import("./pages/PaymentSuccess"))
const PaymentCancel = lazyWithRetry(() => import("./pages/PaymentCancel"))
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"))
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"))
const PromotionalPage = lazyWithRetry(() => import("./pages/PromotionalPage"))
const BackToSchoolProfessional = lazyWithRetry(() => import("./pages/BackToSchoolProfessional"))
const VoucherTerms = lazyWithRetry(() => import("./pages/VoucherTerms"))
const ReferralProgramTerms = lazyWithRetry(() => import("./pages/ReferralProgramTerms"))
const GrabianPointsTerms = lazyWithRetry(() => import("./pages/GrabianPointsTerms"))
const DeliveryTerms = lazyWithRetry(() => import("./pages/DeliveryTerms"))
const OfferPage = lazyWithRetry(() => import("./pages/OfferPage"))
const GamingZonePage = lazyWithRetry(() => import("./pages/GamingZonePage"))
const CountrySelector = lazyWithRetry(() => import("./pages/CountrySelector"))

const AdminLogin = lazyWithRetry(() => import("./pages/admin/AdminLogin"))
const SuperAdminLogin = lazyWithRetry(() => import("./pages/superadmin/SuperAdminLogin"))
const AdminPortal = lazyWithRetry(() => import("./routes/AdminPortal"))
const SuperAdminPortal = lazyWithRetry(() => import("./routes/SuperAdminPortal"))

function DefaultCanonical() {
  const location = useLocation()
  if (location.pathname !== "/") {
    return null
  }
  const href = typeof window !== "undefined" ? `${window.location.origin.replace(/\/+$/, "")}/` : "/"
  return (
    <Helmet prioritizeSeoTags>
      <link rel="canonical" href={href} />
    </Helmet>
  )
}

function RouteCanonical() {
  const location = useLocation()
  if (location.pathname === "/") return null
  if (location.pathname.includes("/offers/") || location.pathname.includes("/gaming-zone/")) return null
  const href =
    typeof window !== "undefined"
      ? `${window.location.origin.replace(/\/+$/, "")}${location.pathname}`
      : location.pathname || "/"
  return (
    <Helmet prioritizeSeoTags>
      <link rel="canonical" href={href} />
    </Helmet>
  )
}

function LegacyCountryLangRedirect() {
  const params = useParams()
  const countryLang = params.countryLang || ""
  const rest = params["*"] || ""

  if (countryLang === "admin" || countryLang === "grabiansadmin") {
    return <Navigate to="/admin/login" replace />
  }
  if (countryLang === "superadmin" || countryLang === "grabiansuperadmin") {
    return <Navigate to="/superadmin/login" replace />
  }

  const cleanPath = rest ? `/${rest}` : "/"
  return <Navigate to={cleanPath} replace />
}

function App() {
  const lazyFallback = (
    <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>
  )

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CurrencyProvider>
              <LoyaltyProvider>
              <ReferralProvider>
              <Router>
                <ThemeProvider>
                <LanguageProvider>
                <DefaultCanonical />
                <ScrollToTop />
                <DisableNumberInputScroll />
                <LoyaltyRewardDialog />
                <ReturnPathTracker />
                <ReferralLinkCatcher />
                <RedirectHandler />
                {/* Renders nothing unless the signed-in account is still on the
                    temporary password an admin set for it. */}
                <SetPasswordPrompt />
                <div className="App">
                  <Suspense fallback={lazyFallback}>
                  <Routes>
                    {/* Super Admin Portal Routes */}
                    <Route
                      path="/superadmin/login"
                      element={
                        <Suspense fallback={lazyFallback}>
                          <SuperAdminLogin />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/grabiansuperadmin/login"
                      element={<Navigate to="/superadmin/login" replace />}
                    />
                    <Route
                      path="/superadmin"
                      element={<Navigate to="/superadmin/dashboard" replace />}
                    />
                    <Route
                      path="/superadmin/*"
                      element={
                        <Suspense fallback={lazyFallback}>
                          <SuperAdminPortal />
                        </Suspense>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/login"
                      element={
                        <Suspense fallback={lazyFallback}>
                          <AdminLogin />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/grabiansadmin/login"
                      element={<Navigate to="/admin/login" replace />}
                    />
                    <Route
                      path="/admin"
                      element={<Navigate to="/admin/dashboard" replace />}
                    />
                    <Route
                      path="/admin/*"
                      element={
                        <Suspense fallback={lazyFallback}>
                          <AdminPortal />
                        </Suspense>
                      }
                    />

                    {/* Clean Storefront Routes without /ae-en prefix */}
                    <Route
                      element={
                        <>
                          <RouteCanonical />
                          <Layout />
                        </>
                      }
                    >
                      <Route index element={<Home />} />
                      <Route path="/" element={<Home />} />
                      <Route path="/select-country" element={<Navigate to="/" replace />} />
                      <Route path="/services" element={<ServicesProducts />} />
                      <Route path="/services-and-products" element={<ServicesProducts />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/shop/:parentCategory" element={<Shop />} />
                      <Route path="/shop/:parentCategory/:subcategory" element={<Shop />} />
                      <Route path="/shop/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                      <Route path="/shop/:parentCategory/:subcategory/:subcategory2/:subcategory3" element={<Shop />} />
                      <Route
                        path="/shop/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                        element={<Shop />}
                      />
                      <Route path="/product-category" element={<Shop />} />
                      <Route path="/product-category/:parentCategory" element={<Shop />} />
                      <Route path="/product-category/:parentCategory/:subcategory" element={<Shop />} />
                      <Route path="/product-category/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                      <Route
                        path="/product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3"
                        element={<Shop />}
                      />
                      <Route
                        path="/product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                        element={<Shop />}
                      />
                      <Route path="/product/:slug" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/verify-email" element={<EmailVerification />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="/unsubscribe/:token" element={<UnsubscribePage mode="unsubscribe" />} />
                      <Route path="/resubscribe/:token" element={<UnsubscribePage mode="resubscribe" />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/blogs" element={<BlogList />} />
                      <Route path="/blogs/:slug" element={<BlogPost />} />
                      <Route path="/privacy-policy" element={<PrivacyAndPolicy />} />
                      <Route path="/privacy-policy-arabic" element={<ArabicContent />} />
                      <Route path="/disclaimer-policy" element={<DisclaimerPolicy />} />
                      <Route path="/terms-conditions" element={<TermAndCondition />} />
                      <Route path="/refund-return" element={<RefundAndReturn />} />
                      <Route path="/cookies-policy" element={<CookiesAndPolicy />} />
                      <Route path="/bulk-purchase" element={<ReqBulkPurchase />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/guest" element={<Guest />} />
                      <Route path="/guest-order" element={<GuestOrder />} />
                      <Route path="/payment/success" element={<PaymentSuccess />} />
                      <Route path="/payment/cancel" element={<PaymentCancel />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/green-friday-promotional" element={<PromotionalPage />} />
                      <Route path="/backtoschool-acer-professional" element={<BackToSchoolProfessional />} />
                      <Route path="/voucher-terms" element={<VoucherTerms />} />
                      <Route path="/referral-program-terms" element={<ReferralProgramTerms />} />
                      <Route path="/grabian-points-terms" element={<GrabianPointsTerms />} />
                      <Route path="/delivery-terms" element={<DeliveryTerms />} />
                      <Route path="/offers/:slug" element={<OfferPage />} />
                      <Route path="/gaming-zone/:slug" element={<GamingZonePage />} />

                      {/* Protected Routes */}
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <UserOrders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/email-preferences"
                        element={
                          <ProtectedRoute>
                            <EmailPreferences />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/wishlist"
                        element={
                          <ProtectedRoute>
                            <Wishlist />
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    {/* Legacy country/language redirects (e.g. /ae-en, /ae-en/services -> /, /services) */}
                    <Route path="/ae-ar/*" element={<LegacyCountryLangRedirect />} />
                    <Route path="/ae-ar" element={<LegacyCountryLangRedirect />} />
                    <Route path="/:countryLang/*" element={<LegacyCountryLangRedirect />} />
                    <Route path="/:countryLang" element={<LegacyCountryLangRedirect />} />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
              </div>
            </LanguageProvider>
                </ThemeProvider>
          </Router>
              </ReferralProvider>
              </LoyaltyProvider>
          </CurrencyProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
