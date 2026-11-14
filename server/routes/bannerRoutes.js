import express from "express"
import asyncHandler from "express-async-handler"
import Banner from "../models/bannerModel.js"
import Category from "../models/categoryModel.js"
import { protect, admin } from "../middleware/authMiddleware.js"
import { logActivity } from "../middleware/permissionMiddleware.js"
import { uploadBanner, deleteLocalFile, isCloudinaryUrl } from "../config/multer.js"
import { cacheMiddleware, invalidateCache } from "../middleware/cacheMiddleware.js"

const router = express.Router()

const debugBanners = (...args) => {
  if (process.env.DEBUG_BANNERS === "true") {
    console.log("[DEBUG_BANNERS]", ...args)
  }
}

const normalizeBannerLink = (value) => String(value || "").trim()

const resolvePreferredHeroLink = (linkValue, buttonLinkValue) => {
  const link = normalizeBannerLink(linkValue)
  const buttonLink = normalizeBannerLink(buttonLinkValue)

  const isDefaultShopLink = (value) => value === "/shop"
  const linkIsDefault = isDefaultShopLink(link)
  const buttonIsDefault = isDefaultShopLink(buttonLink)

  if (link && buttonLink) {
    if (link !== buttonLink && !buttonIsDefault) return buttonLink
    if (linkIsDefault && !buttonIsDefault) return buttonLink
    if (buttonIsDefault && !linkIsDefault) return link
    return link
  }

  return link || buttonLink || "/shop"
}

const applyHeroLinkPolicy = (bannerLike) => {
  const buttonLink = normalizeBannerLink(bannerLike?.buttonLink)
  const resolved = resolvePreferredHeroLink(bannerLike?.link, buttonLink)

  bannerLike.link = resolved
  bannerLike.buttonLink = buttonLink || resolved
}

const sanitizeTargetCountries = (targetCountries) => {
  if (!targetCountries) return ["ALL"]
  let list = targetCountries
  if (typeof targetCountries === "string") {
    try {
      list = JSON.parse(targetCountries)
    } catch {
      list = targetCountries.split(",").map((s) => s.trim())
    }
  }
  if (!Array.isArray(list) || list.length === 0) return ["ALL"]
  const cleaned = list.map((c) => String(c).trim().toUpperCase()).filter(Boolean)
  if (cleaned.length === 0 || cleaned.includes("ALL")) return ["ALL"]
  return cleaned
}

// @desc    Get salon main page banners (Home Hero, Services Hero & Products Hero)
// @route   GET /api/banners/salon-banners
// @access  Public
router.get(
  "/salon-banners",
  asyncHandler(async (req, res) => {
    try {
      const homeBanner = await Banner.findOne({ position: "home-hero", isActive: true })
      const offersBanner = await Banner.findOne({ position: "home-offers", isActive: true })
      const servicesBanner = await Banner.findOne({ position: "services-hero", isActive: true })
      const productsBanner = await Banner.findOne({ position: "products-hero", isActive: true })
      const contactBanner = await Banner.findOne({ position: "contact-hero", isActive: true })

      res.json({
        home: homeBanner
          ? {
              _id: homeBanner._id,
              title: homeBanner.title !== undefined ? homeBanner.title : "",
              tagline: homeBanner.description !== undefined ? homeBanner.description : "",
              subtitle: homeBanner.subtitle !== undefined ? homeBanner.subtitle : "",
              image: homeBanner.image || "/salon/hero-man-transparent.png",
              mobileImage: homeBanner.mobileImage || "",
              buttonText: homeBanner.buttonText !== undefined ? homeBanner.buttonText : "",
            }
          : {
              title: "Trend Salon",
              tagline: "Look Good • Feel Great",
              subtitle: "Premium Grooming & Wellness Services for the Modern Gentleman",
              image: "/salon/hero-man-transparent.png",
              mobileImage: "",
              buttonText: "Book Now",
            },
        offers: offersBanner
          ? {
              _id: offersBanner._id,
              title: offersBanner.title !== undefined ? offersBanner.title : "",
              subtitle: offersBanner.subtitle !== undefined ? offersBanner.subtitle : "",
              image: offersBanner.image || "",
              mobileImage: offersBanner.mobileImage || "",
              buttonText: offersBanner.buttonText !== undefined ? offersBanner.buttonText : "",
              link: offersBanner.buttonLink || offersBanner.link || "",
            }
          : {
              title: "Special Offers",
              subtitle: "Look Better. Pay Less.",
              image: "",
              mobileImage: "",
              buttonText: "View All Offers",
              link: "",
            },
        services: servicesBanner
          ? {
              _id: servicesBanner._id,
              title: servicesBanner.title !== undefined ? servicesBanner.title : "",
              subtitle: servicesBanner.subtitle !== undefined ? servicesBanner.subtitle : "",
              image: servicesBanner.image || "/salon/services-man.png",
              mobileImage: servicesBanner.mobileImage || "",
            }
          : {
              title: "Our Services & Products",
              subtitle: "Professional Care. Premium Quality.",
              image: "/salon/services-man.png",
              mobileImage: "",
            },
        products: productsBanner
          ? {
              _id: productsBanner._id,
              title: productsBanner.title !== undefined ? productsBanner.title : "",
              subtitle: productsBanner.subtitle !== undefined ? productsBanner.subtitle : "",
              image: productsBanner.image || "/salon/services-man.png",
              mobileImage: productsBanner.mobileImage || "",
            }
          : {
              title: "Our Products",
              subtitle: "Premium Grooming & Care Products for the Modern Gentleman.",
              image: "/salon/services-man.png",
              mobileImage: "",
            },
        contact: contactBanner
          ? {
              _id: contactBanner._id,
              image: contactBanner.image || "",
              mobileImage: contactBanner.mobileImage || "",
            }
          : {
              image: "",
              mobileImage: "",
            },
      })
    } catch (err) {
      console.error("Error fetching salon banners:", err)
      res.json({
        home: {
          title: "Trend Salon",
          tagline: "Look Good • Feel Great",
          subtitle: "Premium Grooming & Wellness Services for the Modern Gentleman",
          image: "/salon/hero-man-transparent.png",
          mobileImage: "",
          buttonText: "Book Now",
        },
        offers: {
          title: "Special Offers",
          subtitle: "Look Better. Pay Less.",
          image: "",
          mobileImage: "",
          buttonText: "View All Offers",
          link: "",
        },
        services: {
          title: "Our Services & Products",
          subtitle: "Professional Care. Premium Quality.",
          image: "/salon/services-man.png",
          mobileImage: "",
        },
        products: {
          title: "Our Products",
          subtitle: "Premium Grooming & Care Products for the Modern Gentleman.",
          image: "/salon/services-man.png",
          mobileImage: "",
        },
        contact: {
          image: "",
          mobileImage: "",
        },
      })
    }
  }),
)

// @desc    Update salon main page banners
// @route   PUT /api/banners/salon-banners
// @access  Private/Admin
router.put(
  "/salon-banners",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { home, offers, services, products, contact } = req.body

    if (home) {
      await Banner.findOneAndUpdate(
        { position: "home-hero" },
        {
          title: typeof home.title === "string" ? home.title : "",
          description: typeof home.tagline === "string" ? home.tagline : "",
          subtitle: typeof home.subtitle === "string" ? home.subtitle : "",
          image: home.image || "/salon/hero-man-transparent.png",
          mobileImage: typeof home.mobileImage === "string" ? home.mobileImage : "",
          buttonText: typeof home.buttonText === "string" ? home.buttonText : "",
          position: "home-hero",
          isActive: true,
          createdBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
    }

    if (offers) {
      await Banner.findOneAndUpdate(
        { position: "home-offers" },
        {
          title: typeof offers.title === "string" ? offers.title : "",
          subtitle: typeof offers.subtitle === "string" ? offers.subtitle : "",
          image: typeof offers.image === "string" ? offers.image : "",
          mobileImage: typeof offers.mobileImage === "string" ? offers.mobileImage : "",
          buttonText: typeof offers.buttonText === "string" ? offers.buttonText : "",
          buttonLink: typeof offers.link === "string" ? offers.link : "",
          position: "home-offers",
          isActive: true,
          createdBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
    }

    if (services) {
      await Banner.findOneAndUpdate(
        { position: "services-hero" },
        {
          title: typeof services.title === "string" ? services.title : "",
          subtitle: typeof services.subtitle === "string" ? services.subtitle : "",
          image: typeof services.image === "string" ? services.image : "/salon/services-man.png",
          mobileImage: typeof services.mobileImage === "string" ? services.mobileImage : "",
          position: "services-hero",
          isActive: true,
          createdBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
    }

    if (products) {
      await Banner.findOneAndUpdate(
        { position: "products-hero" },
        {
          title: typeof products.title === "string" ? products.title : "",
          subtitle: typeof products.subtitle === "string" ? products.subtitle : "",
          image: typeof products.image === "string" ? products.image : "/salon/services-man.png",
          mobileImage: typeof products.mobileImage === "string" ? products.mobileImage : "",
          position: "products-hero",
          isActive: true,
          createdBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
    }

    if (contact) {
      await Banner.findOneAndUpdate(
        { position: "contact-hero" },
        {
          image: typeof contact.image === "string" ? contact.image : "",
          mobileImage: typeof contact.mobileImage === "string" ? contact.mobileImage : "",
          position: "contact-hero",
          isActive: true,
          createdBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
    }

    await invalidateCache("banners")
    res.json({ success: true, message: "Salon banners updated successfully" })
  }),
)

// @desc    Get all banners (public)
// @route   GET /api/banners
// @access  Public
router.get(
  "/",
  cacheMiddleware("banners"),
  asyncHandler(async (req, res) => {
    const { position, category, active, country } = req.query

    const query = {}

    if (position) {
      query.position = position
    }

    if (category) {
      query.category = category
    }

    if (active !== undefined) {
      query.isActive = active === "true"
    }

    if (country) {
      const countryCode = String(country).trim().toUpperCase()
      query.$or = [
        { targetCountries: { $in: ["ALL", countryCode] } },
        { targetCountries: { $exists: false } },
        { targetCountries: { $size: 0 } },
      ]
    }

    const banners = await Banner.find(query).populate("category", "name slug").sort({ sortOrder: 1, createdAt: -1 })

    res.json(banners)
  }),
)

// @desc    Get all banners (admin)
// @route   GET /api/banners/admin
// @access  Private/Admin
router.get(
  "/admin",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const banners = await Banner.find({})
      .populate("category", "name slug")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    res.json(banners)
  }),
)

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id)
      .populate("category", "name slug")
      .populate("createdBy", "name email")

    if (banner) {
      res.json(banner)
    } else {
      res.status(404)
      throw new Error("Banner not found")
    }
  }),
)

// @desc    Create banner
// @route   POST /api/banners
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  uploadBanner.single("image"),
  asyncHandler(async (req, res) => {
    const { category, targetCountries, ...bannerData } = req.body

    debugBanners("POST /api/banners payload", {
      position: bannerData.position,
      section: bannerData.section,
      deviceType: bannerData.deviceType,
      buttonLink: bannerData.buttonLink,
      link: bannerData.link,
      title: bannerData.title,
      targetCountries,
    })

    // Verify category exists if provided and position is category
    if (bannerData.position === "category" && category) {
      const categoryExists = await Category.findById(category)
      if (!categoryExists) {
        res.status(400)
        throw new Error("Invalid category")
      }
    }

    const banner = new Banner({
      ...bannerData,
      targetCountries: sanitizeTargetCountries(targetCountries),
      category: bannerData.position === "category" ? category : null,
      createdBy: req.user._id,
    })

    // Hero banners: prefer explicit link, fallback to buttonLink, then /shop.
    if ((banner.position || "hero") === "hero") {
      applyHeroLinkPolicy(banner)
      debugBanners("Hero create: resolved link fields", {
        bannerId: banner._id?.toString?.(),
        buttonLink: banner.buttonLink,
        link: banner.link,
      })
    }

    const createdBanner = await banner.save()
    debugBanners("POST /api/banners saved", {
      id: createdBanner._id?.toString?.(),
      position: createdBanner.position,
      section: createdBanner.section,
      deviceType: createdBanner.deviceType,
      buttonLink: createdBanner.buttonLink,
      link: createdBanner.link,
    })
    const populatedBanner = await Banner.findById(createdBanner._id)
      .populate("category", "name slug")
      .populate("createdBy", "name email")

    // Log activity
    if (req.user) {
      await logActivity({
        user: req.user,
        action: "CREATE",
        module: "BANNERS",
        description: `Created banner: ${createdBanner.title || 'Untitled'} (${createdBanner.position})`,
        targetId: createdBanner._id.toString(),
        targetName: createdBanner.title || createdBanner.position,
        newData: { title: createdBanner.title, position: createdBanner.position },
        req,
      })
    }

    // Invalidate banner cache
    await invalidateCache(['banners', 'homeSections'])

    res.status(201).json(populatedBanner)
  }),
)

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id)

    if (banner) {
      const { category, targetCountries, ...updateData } = req.body

      debugBanners("PUT /api/banners/:id payload", {
        id: req.params.id,
        position: updateData.position,
        section: updateData.section,
        deviceType: updateData.deviceType,
        buttonLink: updateData.buttonLink,
        link: updateData.link,
        title: updateData.title,
        targetCountries,
      })

      const finalPosition = updateData.position ?? banner.position

      // Verify category exists if provided and position is category
      if (updateData.position === "category" && category) {
        const categoryExists = await Category.findById(category)
        if (!categoryExists) {
          res.status(400)
          throw new Error("Invalid category")
        }
      }

      // Update banner fields
      Object.keys(updateData).forEach((key) => {
        banner[key] = updateData[key]
      })

      if (targetCountries !== undefined) {
        banner.targetCountries = sanitizeTargetCountries(targetCountries)
      }

      if (finalPosition === "hero") {
        applyHeroLinkPolicy(banner)
        debugBanners("Hero update: resolved link fields", {
          id: req.params.id,
          buttonLink: banner.buttonLink,
          link: banner.link,
        })
      }

      banner.category = updateData.position === "category" ? category : null

      const updatedBanner = await banner.save()
      debugBanners("PUT /api/banners/:id saved", {
        id: updatedBanner._id?.toString?.(),
        position: updatedBanner.position,
        section: updatedBanner.section,
        deviceType: updatedBanner.deviceType,
        buttonLink: updatedBanner.buttonLink,
        link: updatedBanner.link,
      })
      const populatedBanner = await Banner.findById(updatedBanner._id)
        .populate("category", "name slug")
        .populate("createdBy", "name email")

      // Log activity
      if (req.user) {
        await logActivity({
          user: req.user,
          action: "UPDATE",
          module: "BANNERS",
          description: `Updated banner: ${updatedBanner.title || 'Untitled'}`,
          targetId: updatedBanner._id.toString(),
          targetName: updatedBanner.title || updatedBanner.position,
          req,
        })
      }

      // Invalidate banner cache
      await invalidateCache(['banners', 'homeSections'])

      res.json(populatedBanner)
    } else {
      res.status(404)
      throw new Error("Banner not found")
    }
  }),
)

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id)

    if (banner) {
      // Delete banner image from server
      if (banner.image && !isCloudinaryUrl(banner.image)) {
        try {
          await deleteLocalFile(banner.image)
        } catch (err) {
          console.error("Error deleting banner image:", err)
        }
      }

      const bannerTitle = banner.title || banner.position
      await banner.deleteOne()

      // Log activity
      if (req.user) {
        await logActivity({
          user: req.user,
          action: "DELETE",
          module: "BANNERS",
          description: `Deleted banner: ${bannerTitle}`,
          targetId: req.params.id,
          targetName: bannerTitle,
          req,
        })
      }

      // Invalidate banner cache
      await invalidateCache(['banners', 'homeSections'])

      res.json({ message: "Banner removed" })
    } else {
      res.status(404)
      throw new Error("Banner not found")
    }
  }),
)

export default router
