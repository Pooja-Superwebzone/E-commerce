export function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatOrderDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatOrderDateOnly(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export function formatOrderTimeOnly(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(date);
}

export function summarizeOrderItems(items) {
  const safeItems = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) return [];
  return safeItems.slice(0, 3).map((item) => {
    const name = String(item?.name || "Unnamed product");
    const qty = Number(item?.quantity ?? item?.qty ?? 1) || 1;
    return `${name} x${qty}`;
  });
}

export function formatDeliveryType(value) {
  return String(value || "").toLowerCase() === "pickup_point"
    ? "Pickup Point"
    : "Home Delivery";
}

export function formatPaymentMethod(value) {
  const key = String(value || "").toLowerCase();
  if (key === "credit_card") return "Credit Card";
  if (key === "online") return "Online Payment";
  return "Cash on Delivery";
}

export function formatDeliverySummary(order) {
  const deliveryType = String(
    order?.deliveryType || order?.fulfillment?.type || ""
  ).toLowerCase();
  if (deliveryType === "pickup_point") {
    const pickup = order?.fulfillment?.pickupPoint || {};
    return [pickup.name, pickup.location, pickup.city].filter(Boolean).join(", ") || "-";
  }
  const shipping = order?.fulfillment?.shippingAddress || {};
  return [shipping.city, shipping.state, shipping.postalCode]
    .filter(Boolean)
    .join(", ") || "-";
}

export function formatFullAddress(order) {
  const deliveryType = String(
    order?.deliveryType || order?.fulfillment?.type || ""
  ).toLowerCase();
  if (deliveryType === "pickup_point") {
    const pickup = order?.fulfillment?.pickupPoint || {};
    return [
      pickup.name,
      pickup.location,
      pickup.address,
      pickup.city,
      pickup.state,
      pickup.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  }
  const address = order?.fulfillment?.shippingAddress || {};
  return [
    address.fullName,
    address.phone,
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export function toTitleCase(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getStatusDotClass(status) {
  const key = String(status || "").toLowerCase();
  if (key === "delivered") return "bg-green-500";
  if (key === "cancelled") return "bg-red-500";
  if (key === "shipped") return "bg-blue-500";
  if (key === "processing") return "bg-amber-500";
  return "bg-yellow-400";
}

export function getStatusTextClass(status) {
  const key = String(status || "").toLowerCase();
  if (key === "delivered") return "text-green-700";
  if (key === "cancelled") return "text-red-700";
  if (key === "shipped") return "text-blue-700";
  if (key === "processing") return "text-amber-700";
  return "text-yellow-700";
}

export function getPaymentStatusClass(status) {
  const key = String(status || "").toLowerCase();
  if (key === "paid") return "text-green-600";
  if (key === "failed") return "text-red-600";
  return "text-amber-600";
}
