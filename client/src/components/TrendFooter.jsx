"use client"

import { MapPin, Phone, ArrowRight } from "lucide-react"

export default function TrendFooter() {
  return (
    <footer id="contact" className="bg-[#0c0d10] text-white py-5 px-4 sm:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Location Info */}
        <a
          href="https://www.google.com/maps/search/?api=1&query=Al+Yasmeen+Ajman"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-[#dfa742] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#dfa742]">
            <MapPin className="w-4 h-4" />
          </div>
          <span>Al Yasmeen - Ajman</span>
        </a>

        {/* WhatsApp / Phone */}
        <a
          href="https://wa.me/971559740849"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-[#dfa742] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <span>+971 559 740 849</span>
        </a>

        {/* Directions Gold Pill Button */}
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Al+Yasmeen+Ajman"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#dfa742] hover:bg-[#caa638] text-black text-xs font-semibold px-5 py-2 rounded-full inline-flex items-center gap-1.5 shadow-md transition-all duration-200 hover:scale-105"
        >
          <span>Get Directions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </footer>
  )
}

