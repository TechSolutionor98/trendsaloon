// Central app configuration
const resolveApiUrl = () => {
  const envUrl = (import.meta.env?.VITE_API_URL || "").trim()

  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")

  // Check forced local API env flags
  if (
    import.meta.env?.VITE_FORCE_LOCAL_API === "true" ||
    import.meta.env?.VITE_FORCE_LOCAL_API === true
  ) {
    const localUrl = (import.meta.env?.VITE_LOCAL_API_URL || "http://localhost:5000").trim()
    return localUrl.replace(/\/$/, "")
  }

  // Local fallback for development, or when running on localhost / 127.0.0.1
  if (
    import.meta.env?.DEV ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.startsWith("192.168.")))
  ) {
    return "http://localhost:5000"
  }

  return "https://api.grabatoz.ae"
}

// Resolve Translation API URL
const resolveTranslationApiUrl = () => {
  const envUrl = (import.meta.env?.VITE_TRANSLATION_API_URL || "").trim()

  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")

  // Live fallback.
  return "https://langaimodel.grabatoz.ae" // Production translation API on VPS
}

const config = {
  // API Configuration - Handle both development and production
  API_URL: resolveApiUrl(),

  // Translation Model API
  TRANSLATION_API_URL: resolveTranslationApiUrl(),

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
  
