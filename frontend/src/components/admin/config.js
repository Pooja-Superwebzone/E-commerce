export const ORDER_STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function defaultPermissionsByRole(role) {
  if (role === "super_admin") {
    return {
      dashboard: true,
      product_add: true,
      product_edit: true,
      product_delete: true,
      manage_users: true,
      manage_admins: true,
      orders: true,
    };
  }
  if (role === "admin") {
    return {
      dashboard: true,
      product_add: true,
      product_edit: true,
      product_delete: true,
      manage_users: true,
      manage_admins: false,
      orders: true,
    };
  }
  if (role === "sub_admin") {
    return {
      dashboard: true,
      product_add: true,
      product_edit: false,
      product_delete: false,
      manage_users: false,
      manage_admins: false,
      orders: true,
    };
  }
  return {
    dashboard: false,
    product_add: false,
    product_edit: false,
    product_delete: false,
    manage_users: false,
    manage_admins: false,
    orders: false,
  };
}

export function emptyProduct() {
  return {
    id: "",
    name: "",
    category: "",
    subcategory: "",
    price: "",
    originalPrice: "",
    rating: "",
    reviews: "",
    image: "",
    description: "",
    badge: "",
    brand: "",
    sku: "",
    hsnCode: "",
    gstPercent: "",
    stock: "",
  };
}
