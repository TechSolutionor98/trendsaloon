import { findStore } from "../data/stores"

// Who an order belongs to, wherever their details ended up.
//
// A delivery order keeps the customer on `shippingAddress`, but a collection has
// no delivery address -- the server stores `pickupDetails` instead and drops
// shippingAddress entirely. Reading `shippingAddress.name` directly therefore
// shows "N/A" for every pickup order, which is how a real customer went missing
// from the Recent Quotation list.
//
// Every screen that names a customer should go through these, so a new delivery
// type can never quietly blank the column again.

export const orderCustomerName = (order = {}) =>
  order?.shippingAddress?.name || order?.pickupDetails?.name || order?.user?.name || ""

export const orderCustomerEmail = (order = {}) =>
  order?.shippingAddress?.email || order?.pickupDetails?.email || order?.user?.email || ""

export const orderCustomerPhone = (order = {}) =>
  order?.shippingAddress?.phone || order?.pickupDetails?.phone || order?.user?.phone || ""

export const isPickupOrder = (order = {}) => order?.deliveryType === "pickup" || !!order?.pickupDetails

/** The branch an order is collected from, or "" for a delivery. */
export const orderPickupBranch = (order = {}) => {
  if (!isPickupOrder(order)) return ""
  const loc = order?.pickupDetails?.location || ""
  if (!loc || loc.toLowerCase().includes("crown excel") || loc.toLowerCase().includes("grabatoz")) {
    return "Trend Saloon (Al Yasmeen - Ajman)"
  }
  return loc
}

// The branch an order is collected from, with the catalogue filling any gaps.
export const orderPickupStore = (order = {}) => {
  const stored = order?.pickupDetails || {}
  const store = findStore(stored.storeId)

  let name = stored.location || store?.name || "Trend Saloon"
  let address = stored.storeAddress || store?.address || "Al Yasmeen - Ajman, United Arab Emirates"
  let phone = stored.storePhone || store?.phone || "+971 559 740 849"

  if (!name || name.toLowerCase().includes("crown excel") || name.toLowerCase().includes("grabatoz")) {
    name = "Trend Saloon"
    address = "Al Yasmeen - Ajman, United Arab Emirates"
    phone = "+971 559 740 849"
  }

  return {
    name,
    address,
    phone,
  }
}
