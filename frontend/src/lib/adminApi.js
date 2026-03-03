import { apiUrl } from "@/lib/api";

async function requestJson(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    credentials: "include",
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

export async function fetchAdminUsers() {
  const data = await requestJson("/auth/users", {
    method: "GET",
    cache: "no-store",
  });
  return Array.isArray(data.users) ? data.users : [];
}

export async function createAdminUser(payload) {
  const data = await requestJson("/auth/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function updateAdminUserRole(userId, role) {
  const data = await requestJson(`/auth/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  return data.user;
}

export async function fetchAdminProducts() {
  const data = await requestJson("/products", {
    method: "GET",
    cache: "no-store",
  });

  if (!data?.success) {
    throw new Error(data?.message || "Failed to load products.");
  }
  return Array.isArray(data?.data?.items) ? data.data.items : [];
}

export async function createAdminProduct(product) {
  const data = await requestJson("/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product }),
  });

  if (!data?.success) {
    throw new Error(data?.message || "Failed to create product.");
  }
  return data?.data?.item;
}

export async function updateAdminProduct(productId, product) {
  const data = await requestJson(`/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product }),
  });

  if (!data?.success) {
    throw new Error(data?.message || "Failed to update product.");
  }
  return data?.data?.item;
}

export async function deleteAdminProduct(productId) {
  const data = await requestJson(`/products/${productId}`, {
    method: "DELETE",
  });

  if (!data?.success) {
    throw new Error(data?.message || "Failed to delete product.");
  }
  return data;
}

export async function fetchAdminOrders() {
  const data = await requestJson("/admin/orders", {
    method: "GET",
    cache: "no-store",
  });
  return Array.isArray(data.orders) ? data.orders : [];
}

export async function updateAdminOrderStatus(orderId, status) {
  const data = await requestJson(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return data.order;
}
