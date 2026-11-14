"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import { useLanguage } from "../context/LanguageContext"
import { useToast } from "../context/ToastContext"
import TrendHeader from "../components/TrendHeader"
import TrendFooter from "../components/TrendFooter"
import { getFullImageUrl } from "../utils/imageUtils"
import { getCachedSalonBanners, fetchSalonBanners } from "../services/salonService"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Calendar,
  Sparkles,
  Scissors,
  ShieldCheck,
  ChevronRight,
  User,
  Coffee,
  Car,
  MessageCircle,
} from "lucide-react"

export default function ContactUs() {
  const { getLocalizedPath } = useLanguage()
  const { showToast } = useToast()

  const [contactBanner, setContactBanner] = useState(() => getCachedSalonBanners()?.contact || { image: "" })

  useEffect(() => {
    fetchSalonBanners().then((banners) => {
      if (banners?.contact) {
        setContactBanner(banners.contact)
      }
    })
  }, [])

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Haircut",
    preferredTime: "",
    customerNote: "",
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        customerNote: [
          form.service ? `Requested Service: ${form.service}` : "",
          form.preferredTime ? `Preferred Timing: ${form.preferredTime}` : "",
          form.customerNote ? `Note: ${form.customerNote}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
        productName: form.service || "Salon Appointment",
      }

      await axios.post(`${config.API_URL}/api/request-callback`, payload)

      setSubmitted(true)
      showToast("Thank you! Your request has been received.", "success")
      setForm({
        name: "",
        email: "",
        phone: "",
        service: "Haircut",
        preferredTime: "",
        customerNote: "",
      })
    } catch (error) {
      console.error("Contact request error:", error)
      showToast("Failed to submit request. Please try calling us directly.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-gray-900 font-sans selection:bg-[#dfa742] selection:text-black">
      {/* 1. Header */}
      <TrendHeader active="contact" />

      {/* 2. Hero Banner */}
      {contactBanner?.image ? (
        <section className="w-full bg-[#0d0e11] overflow-hidden select-none">
          <img
            src={getFullImageUrl(contactBanner.image)}
            alt="Trend Salon Contact"
            className="w-full h-auto min-h-[160px] sm:min-h-[220px] md:min-h-[280px] max-h-[460px] object-cover object-center block"
          />
        </section>
      ) : (
        <section className="relative bg-[#0d0e11] text-white overflow-hidden py-10 sm:py-14">
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#dfa742]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-xl space-y-2.5">
              {/* Salon Emblem/Logo */}
              <div className="flex items-center gap-2 pb-0.5">
                <div className="w-8 h-8 rounded-full bg-[#dfa742]/15 border border-[#dfa742]/40 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-4 h-4 text-[#dfa742]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <line x1="20" y1="4" x2="8.12" y2="15.88" />
                    <line x1="14.47" y1="14.48" x2="20" y2="20" />
                    <line x1="8.12" y1="8.12" x2="12" y2="12" />
                  </svg>
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

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#dfa742] tracking-tight">
                Contact &amp; Visit Us
              </h1>

              {/* Subtitle */}
              <p className="text-gray-200 text-sm sm:text-base font-light tracking-wide">
                Visit our luxury salon in Ajman or book an appointment with our master barbers.
              </p>

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs text-gray-400 pt-1" aria-label="Breadcrumb">
                <Link to={getLocalizedPath("/")} className="hover:text-[#dfa742] transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-200 font-medium">Contact Us</span>
              </nav>
            </div>
          </div>
        </section>
      )}

      {/* 3. Quick Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#dfa742]/15 text-[#dfa742] flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Saloon Location</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Al Yasmeen, Ajman
                <br />
                United Arab Emirates
              </p>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Al+Yasmeen+Ajman"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-xs font-bold text-[#dfa742] hover:text-[#b8832a] inline-flex items-center gap-1 group"
            >
              <span>Get Directions</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Call & WhatsApp */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-500/15 text-green-600 flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Phone &amp; WhatsApp</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                +971 559 740 849
                <br />
                <span className="text-[11px] text-gray-400">Direct booking line</span>
              </p>
            </div>
            <a
              href="https://wa.me/971559740849"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-xs font-bold text-green-600 hover:text-green-700 inline-flex items-center gap-1 group"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#dfa742]/15 text-[#dfa742] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Working Hours</h3>
              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                <p><span className="font-semibold text-gray-800">Sat – Thu:</span> 10:00 AM – 11:00 PM</p>
                <p><span className="font-semibold text-gray-800">Friday:</span> 1:30 PM – 11:30 PM</p>
              </div>
            </div>
            <span className="mt-4 text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Open 7 Days a Week</span>
            </span>
          </div>

          {/* Email / Inquiries */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Email &amp; Inquiries</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                info@trendsalon.ae
                <br />
                <span className="text-[11px] text-gray-400">Quick response guaranteed</span>
              </p>
            </div>
            <a
              href="mailto:info@trendsalon.ae"
              className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
            >
              <span>Send an Email</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. Main Two-Column Layout: Booking Form + Google Map & Experience */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Interactive Booking & Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa742] mb-1">
                <Scissors className="w-4 h-4" />
                <span>Appointments &amp; Inquiries</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
                Send a Message or Book Your Seat
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                Fill out the quick form below. Our reception team will reach out to confirm your slot or answer your questions.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 text-center bg-gradient-to-b from-amber-50/50 to-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Request Sent Successfully!</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto">
                    Thank you for reaching out to Trend Saloon. Our team will contact you shortly on WhatsApp or phone call.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="bg-[#dfa742] hover:bg-[#caa638] text-black text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition-all duration-200"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Tariq Al Nuaimi"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm text-gray-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+971 50 123 4567"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm text-gray-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm text-gray-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Service Requested
                    </label>
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm text-gray-900 transition-all cursor-pointer"
                    >
                      <option value="Haircut">Haircut (AED 50)</option>
                      <option value="Beard Trim">Beard Trim &amp; Styling (AED 50)</option>
                      <option value="Haircut + Beard Combo">Haircut + Beard Trim (AED 50)</option>
                      <option value="Moroccan Bath">Royal Moroccan Bath (AED 69)</option>
                      <option value="Massage">Relaxing Massage (AED 69)</option>
                      <option value="Hydra Facial">Hydra Facial Skin Care (AED 50)</option>
                      <option value="Manicure & Pedicure">Manicure &amp; Pedicure (AED 69)</option>
                      <option value="Retail Products Inquiry">Retail Grooming Products Inquiry</option>
                      <option value="General Inquiry">General Question / Other</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Date / Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Preferred Time &amp; Day <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="preferredTime"
                      value={form.preferredTime}
                      onChange={handleChange}
                      placeholder="e.g. Today around 6:00 PM or Tomorrow Evening"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm text-gray-900 transition-all"
                    />
                  </div>
                </div>

                {/* Message / Special Note */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Special Request or Message <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    name="customerNote"
                    rows="4"
                    value={form.customerNote}
                    onChange={handleChange}
                    placeholder="Tell us about your hairstyle preferences, specific barber request, or any questions..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm text-gray-900 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-sm shadow-lg shadow-[#dfa742]/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Your Request...</span>
                  ) : (
                    <>
                      <span>Submit Request / Book Seat</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 text-center">
                  By submitting, you agree to receive confirmation via WhatsApp or phone.
                </p>
              </form>
            )}
          </div>

          {/* Right Column: Google Map Embed & Salon Highlights (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Google Map Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-lg overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#dfa742]" />
                  <h3 className="text-sm font-bold text-gray-900">Find Us in Ajman</h3>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Al+Yasmeen+Ajman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-[#dfa742] hover:underline"
                >
                  Full Map View
                </a>
              </div>

              {/* Responsive Embedded Map */}
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                <iframe
                  title="Trend Saloon Location"
                  src="https://maps.google.com/maps?q=Al%20Yasmeen,%20Ajman,%20United%20Arab%20Emirates&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="mt-3 text-center">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Al+Yasmeen+Ajman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#dfa742]" />
                  <span>Navigate with Google Maps</span>
                </a>
              </div>
            </div>

            {/* Salon Amenities & VIP Perks */}
            <div className="bg-[#0e0e11] text-white rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-[#dfa742] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>The Trend Salon Experience</span>
              </div>

              <h4 className="text-lg font-serif font-bold text-white">
                Premium Grooming Exclusively for Gentlemen
              </h4>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dfa742]/15 text-[#dfa742] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Master Artisans &amp; Barbers</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Precision fades, razor beards, and modern styling by highly trained master barbers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dfa742]/15 text-[#dfa742] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">100% Hygiene &amp; Sterilization</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Medical-grade sterilization and single-use disposable grooming accessories for every client.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dfa742]/15 text-[#dfa742] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Complimentary VIP Lounge</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Enjoy authentic Arabic coffee, fine tea, high-speed Wi-Fi, and a relaxed ambiance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dfa742]/15 text-[#dfa742] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Hassle-Free Free Parking</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Convenient and ample free parking slots right in front of our saloon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <TrendFooter />
    </div>
  )
}
