// Central app configuration
const resolveApiUrl = () => {
  // 1. Browser runtime check: if running on a live (non-local) domain,
  // NEVER use localhost under any circumstances!
  if (typeof window !== "undefined") {
    const host = (window.location.hostname || "").toLowerCase()
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".local")

    if (!isLocal) {
      if (host.includes("trendcosmetica")) {
        return "https://api.trendcosmetica.com"
      }
      if (host.includes("grabatoz") || host.includes("graba2z")) {
        return "https://api.grabatoz.ae"
      }

      // Check if env provides a valid remote https URL
      const envUrl = (import.meta.env?.VITE_API_URL || "").trim()
      if (envUrl && /^https:\/\//i.test(envUrl) && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
        return envUrl.replace(/\/$/, "")
      }

      // Default production backend
      return "https://api.trendcosmetica.com"
    }
  }

  // 2. Localhost development:
  if (
    import.meta.env?.VITE_FORCE_LOCAL_API === "true" ||
    import.meta.env?.VITE_FORCE_LOCAL_API === true
  ) {
    const localUrl = (import.meta.env?.VITE_LOCAL_API_URL || "http://localhost:5000").trim()
    return localUrl.replace(/\/$/, "")
  }

  const envUrl = (import.meta.env?.VITE_API_URL || "").trim()
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")

  return "http://localhost:5000"
}

// Resolve Translation API URL
const resolveTranslationApiUrl = () => {
  if (typeof window !== "undefined") {
    const host = (window.location.hostname || "").toLowerCase()
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".local")

    if (!isLocal) {
      const envUrl = (import.meta.env?.VITE_TRANSLATION_API_URL || "").trim()
      if (envUrl && /^https:\/\//i.test(envUrl) && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
        return envUrl.replace(/\/$/, "")
      }
      return "https://langaimodel.grabatoz.ae"
    }
  }

  const envUrl = (import.meta.env?.VITE_TRANSLATION_API_URL || "").trim()
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")

  return "http://localhost:5000"
}

const config = {
  // API Configuration - Dynamic getter so it evaluates at runtime in browser
  get API_URL() {
    return resolveApiUrl()
  },

  // Translation Model API
  get TRANSLATION_API_URL() {
    return resolveTranslationApiUrl()
  },

  // Payment Gateway Configuration
  TAMARA_API_KEY: import.meta.env.VITE_TAMARA_API_KEY,
  TABBY_MERCHANT_CODE: import.meta.env.VITE_TABBY_MERCHANT_CODE,
  TABBY_SECRET_KEY: import.meta.env.VITE_TABBY_SECRET_KEY,
  NGENIUS_API_KEY: import.meta.env.VITE_NGENIUS_API_KEY,

  // App Configuration
  APP_NAME: "GrabAtoZ",
  APP_VERSION: "1.0.0",
  ANDROID_APP_URL: import.meta.env.VITE_ANDROID_APP_URL || "",
  IOS_APP_URL: import.meta.env.VITE_IOS_APP_URL || "",
}

export default config




// const config = {
//     // API Configuration - Handle both development and production
//   API_URL:  'ht tp://localhost:5000', // Make sure to include http:// or https://
// //  API_URL: import.meta.env.VITE_API_URL || 'https://api.grabatoz.ae',
   
     
 


//     // Payment Gateway Configuration
//     TAMARA_API_KEY: import.meta.env.VITE_TAMARA_API_KEY,
//     TABBY_MERCHANT_CODE: import.meta.env.VITE_TABBY_MERCHANT_CODE,
//     TABBY_SECRET_KEY: import.meta.env.VITE_TABBY_SECRET_KEY,
//     NGENIUS_API_KEY: import.meta.env.VITE_NGENIUS_API_KEY,
  
//     // App Configuration
//     APP_NAME: "GrabAtoZ",
//     APP_VERSION: "1.0.0",
//   }
  
//   export default config
  
