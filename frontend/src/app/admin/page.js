"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useToast } from "@/components/context/ToastContext";
import {
  createAdminProduct,
  createAdminUser,
  deleteAdminProduct,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminUsers,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminUserRole,
} from "@/lib/adminApi";

const ORDER_STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PERMISSION_KEYS = [
  "product_add",
  "product_edit",
  "product_delete",
  "manage_users",
  "manage_admins",
];
const PERMISSION_LABELS = {
  product_add: "Add Product",
  product_edit: "Edit Product",
  product_delete: "Delete Product",
  manage_users: "Manage Users",
  manage_admins: "Manage Admins",
};

function defaultPermissionsByRole(role) {
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

function emptyProduct() {
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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const router = useRouter();
  const { user, role, isAdmin, loading, canAccess, isSuperAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [savingUserId, setSavingUserId] = useState("");
  const [savingOrderId, setSavingOrderId] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [newProduct, setNewProduct] = useState(emptyProduct());
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: isSuperAdmin ? "admin" : "sub_admin",
    permissions: defaultPermissionsByRole(isSuperAdmin ? "admin" : "sub_admin"),
  });

  const canManageUsers = canAccess("manage_users");
  const canManageAdmins = canAccess("manage_admins");
  const canAddProduct = canAccess("product_add");
  const canEditProduct = canAccess("product_edit");
  const canDeleteProduct = canAccess("product_delete");
  const canManageProducts = canAddProduct || canEditProduct || canDeleteProduct;
  const canManageOrders = canAccess("orders");

  const sidebarItems = useMemo(() => {
    const items = [];
    if (canAccess("dashboard")) items.push({ id: "dashboard", label: "Dashboard" });
    if (canManageUsers) items.push({ id: "users", label: "Users" });
    if (canManageProducts) items.push({ id: "products", label: "Products" });
    if (canManageOrders) items.push({ id: "orders", label: "Order Management" });
    return items;
  }, [canManageUsers, canManageProducts, canManageOrders, canAccess]);

  const roleOptions = canManageAdmins
    ? ["user", "sub_admin", "admin", "super_admin"]
    : ["user", "sub_admin"];

  const dashboardMetrics = useMemo(() => {
    const productById = new Map(
      products.map((p) => [String(p.id), p])
    );
    let revenue = 0;
    let estimatedCost = 0;
    let unitsSold = 0;
    const statusCounts = {};
    const productUnits = new Map();

    for (const order of orders) {
      const orderStatus = String(order?.status || "pending").toLowerCase();
      statusCounts[orderStatus] = (statusCounts[orderStatus] || 0) + 1;

      const orderTotal = Number(order?.totalAmount ?? order?.total ?? 0);
      const items = Array.isArray(order?.items) ? order.items : [];

      if (orderTotal > 0) {
        revenue += orderTotal;
      }

      for (const item of items) {
        const qty = Number(item?.quantity ?? item?.qty ?? 1) || 1;
        const salePrice = Number(item?.price ?? item?.unitPrice ?? 0) || 0;
        const itemRevenue = salePrice * qty;
        if (orderTotal <= 0) {
          revenue += itemRevenue;
        }
        unitsSold += qty;

        const key = String(item?.id ?? item?.productId ?? item?.name ?? "unknown");
        const label = String(item?.name || `Product ${key}`);
        const prev = productUnits.get(key) || { key, name: label, units: 0 };
        prev.units += qty;
        productUnits.set(key, prev);

        const mappedProduct = productById.get(String(item?.id ?? item?.productId ?? ""));
        const costBasis = Number(
          item?.originalPrice ??
          mappedProduct?.originalPrice ??
          mappedProduct?.price ??
          salePrice
        ) || 0;
        estimatedCost += costBasis * qty;
      }
    }

    const profit = revenue - estimatedCost;
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
    const topProducts = Array.from(productUnits.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    const normalizedStatuses = ORDER_STATUS_OPTIONS.map((status) => ({
      status,
      count: statusCounts[status] || 0,
    }));

    return {
      revenue,
      profit,
      estimatedCost,
      orderCount,
      avgOrderValue,
      unitsSold,
      topProducts,
      statusBreakdown: normalizedStatuses,
    };
  }, [orders, products]);

  const notifyError = (message) => {
    const safeMessage = String(message || "Something went wrong.");
    setError(safeMessage);
    addToast(safeMessage, "error");
  };

  const notifySuccess = (message) => {
    addToast(String(message || "Success."), "success");
  };

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && !isAdmin) router.push("/");
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (sidebarItems.length > 0 && !sidebarItems.some((item) => item.id === activeTab)) {
      setActiveTab(sidebarItems[0].id);
    }
  }, [sidebarItems, activeTab]);

  async function loadUsers() {
    if (!canManageUsers) return;
    const usersData = await fetchAdminUsers();
    setUsers(usersData);
  }

  async function loadProducts() {
    if (!canManageProducts) return;
    const productsData = await fetchAdminProducts();
    setProducts(productsData);
  }

  async function loadOrders() {
    if (!canManageOrders) return;
    const ordersData = await fetchAdminOrders();
    setOrders(ordersData);
  }

  useEffect(() => {
    if (loading || !isAdmin) return;
    setError("");

    const loaders = [];
    if (activeTab === "dashboard") {
      if (canManageUsers) loaders.push(loadUsers());
      if (canManageProducts) loaders.push(loadProducts());
      if (canManageOrders) loaders.push(loadOrders());
    } else if (activeTab === "users" && canManageUsers) {
      loaders.push(loadUsers());
    } else if (activeTab === "products" && canManageProducts) {
      loaders.push(loadProducts());
    } else if (activeTab === "orders" && canManageOrders) {
      loaders.push(loadOrders());
    }

    Promise.all(loaders).catch((err) => {
      notifyError(err?.message || "Failed to load admin data.");
    });
  }, [activeTab, loading, isAdmin, canManageUsers, canManageProducts, canManageOrders]);

  function onCreateRoleChange(nextRole) {
    setNewUser((prev) => ({
      ...prev,
      role: nextRole,
      permissions: defaultPermissionsByRole(nextRole),
    }));
  }

  async function handleCreateManagedUser(e) {
    e.preventDefault();
    setCreatingUser(true);
    setError("");
    try {
      const createdUser = await createAdminUser(newUser);
      setUsers((prev) => [createdUser, ...prev]);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: isSuperAdmin ? "admin" : "sub_admin",
        permissions: defaultPermissionsByRole(isSuperAdmin ? "admin" : "sub_admin"),
      });
      notifySuccess("User created successfully.");
    } catch (err) {
      notifyError(err?.message || "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  }

  async function updateRole(targetUserId, nextRole) {
    setSavingUserId(targetUserId);
    setError("");
    try {
      const updatedUser = await updateAdminUserRole(targetUserId, nextRole);
      setUsers((prev) =>
        prev.map((item) =>
          item.userId === targetUserId
            ? { ...item, role: updatedUser.role, permissions: updatedUser.permissions }
            : item
        )
      );
      notifySuccess("User role updated.");
    } catch (err) {
      notifyError(err?.message || "Failed to update role.");
    } finally {
      setSavingUserId("");
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    if ((!editingProductId && !canAddProduct) || (editingProductId && !canEditProduct)) {
      notifyError("You do not have permission for this action.");
      return;
    }
    setCreatingProduct(true);
    setError("");
    try {
      const isEditMode = Boolean(editingProductId);
      const payload = {
        name: String(newProduct.name || "").trim(),
        category: String(newProduct.category || "").trim(),
        subcategory: String(newProduct.subcategory || "").trim(),
        price: Number(newProduct.price || 0),
        originalPrice: Number(newProduct.originalPrice || 0),
        rating: Number(newProduct.rating || 0),
        reviews: Number(newProduct.reviews || 0),
        image: String(newProduct.image || "").trim(),
        description: String(newProduct.description || "").trim(),
        badge: String(newProduct.badge || "").trim(),
        brand: String(newProduct.brand || "").trim(),
        sku: String(newProduct.sku || "").trim(),
        hsnCode: String(newProduct.hsnCode || "").trim(),
        gstPercent: Number(newProduct.gstPercent || 0),
        stock: Number(newProduct.stock || 0),
      };

      if (!isEditMode) {
        payload.id = Number(newProduct.id);
      }
      const item = isEditMode
        ? await updateAdminProduct(editingProductId, payload)
        : await createAdminProduct(payload);

      if (isEditMode) {
        setProducts((prev) =>
          prev.map((product) =>
            Number(product.id) === Number(editingProductId) ? item : product
          )
        );
      } else {
        setProducts((prev) => [item, ...prev]);
      }

      setNewProduct(emptyProduct());
      setEditingProductId("");
      notifySuccess(isEditMode ? "Product updated successfully." : "Product created successfully.");
    } catch (err) {
      notifyError(err?.message || "Failed to save product.");
    } finally {
      setCreatingProduct(false);
    }
  }

  function startEditProduct(item) {
    if (!canEditProduct) return;
    setEditingProductId(String(item.id));
      setNewProduct({
      id: String(item.id ?? ""),
      name: String(item.name ?? ""),
      category: String(item.category ?? ""),
      subcategory: String(item.subcategory ?? ""),
      price: String(item.price ?? ""),
      originalPrice: String(item.originalPrice ?? ""),
      rating: String(item.rating ?? ""),
      reviews: String(item.reviews ?? ""),
      image: String(item.image ?? ""),
      description: String(item.description ?? ""),
      badge: String(item.badge ?? ""),
      brand: String(item.brand ?? ""),
      sku: String(item.sku ?? ""),
      hsnCode: String(item.hsnCode ?? ""),
      gstPercent: String(item.gstPercent ?? ""),
      stock: String(item.stock ?? ""),
    });
  }

  function cancelEditProduct() {
    setEditingProductId("");
    setNewProduct(emptyProduct());
  }

  async function deleteProduct(id) {
    if (!canDeleteProduct) {
      notifyError("You do not have permission for this action.");
      return;
    }
    setDeletingProductId(String(id));
    setError("");
    try {
      await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
      if (Number(editingProductId) === Number(id)) {
        cancelEditProduct();
      }
      notifySuccess("Product deleted successfully.");
    } catch (err) {
      notifyError(err?.message || "Failed to delete product.");
    } finally {
      setDeletingProductId("");
    }
  }

  async function onProductImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notifyError("Please upload a valid image file.");
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      notifyError("Image size must be 2MB or less.");
      return;
    }

    setUploadingImage(true);
    setError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setNewProduct((prev) => ({ ...prev, image: dataUrl }));
      notifySuccess("Image uploaded.");
    } catch (err) {
      notifyError(err?.message || "Failed to process image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function updateOrderStatus(orderId, status) {
    setSavingOrderId(orderId);
    setError("");
    try {
      await updateAdminOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((item) => (String(item._id) === String(orderId) ? { ...item, status } : item))
      );
      notifySuccess("Order status updated.");
    } catch (err) {
      notifyError(err?.message || "Failed to update order.");
    } finally {
      setSavingOrderId("");
    }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-gray-700">Checking access...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto  rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-h-[90vh] flex-col md:flex-row">
          <aside className="w-full border-b border-gray-200 bg-gray-50 p-4 md:w-64 md:border-b-0 md:border-r">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-1 text-xs text-gray-600">{user.name} ({role})</p>
            <nav className="mt-5 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    activeTab === item.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="flex-1 p-4 md:p-6">
            {error && <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            {activeTab === "dashboard" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900">Business Dashboard</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card title="Revenue" value={formatCurrency(dashboardMetrics.revenue)} />
                  <Card title="Estimated Profit" value={formatCurrency(dashboardMetrics.profit)} />
                  <Card title="Orders" value={dashboardMetrics.orderCount} />
                  <Card title="Avg Order Value" value={formatCurrency(dashboardMetrics.avgOrderValue)} />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {canManageProducts && <Card title="Products" value={products.length} />}
                  {canManageUsers && <Card title="Users" value={users.length} />}
                  {canManageOrders && <Card title="Units Sold" value={dashboardMetrics.unitsSold} />}
                  <Card title="Estimated Cost" value={formatCurrency(dashboardMetrics.estimatedCost)} />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-800">Order Status Distribution</h3>
                    <div className="mt-4 space-y-3">
                      {dashboardMetrics.statusBreakdown.map((entry) => {
                        const total = dashboardMetrics.orderCount || 1;
                        const width = Math.round((entry.count / total) * 100);
                        return (
                          <div key={entry.status}>
                            <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                              <span className="capitalize">{entry.status}</span>
                              <span>{entry.count}</span>
                            </div>
                            <div className="h-2 w-full rounded bg-gray-100">
                              <div
                                className="h-2 rounded bg-blue-600"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-800">Top Selling Products</h3>
                    <div className="mt-4 space-y-3">
                      {dashboardMetrics.topProducts.length === 0 && (
                        <p className="text-xs text-gray-500">No order item data found yet.</p>
                      )}
                      {dashboardMetrics.topProducts.map((entry) => {
                        const maxUnits = dashboardMetrics.topProducts[0]?.units || 1;
                        const width = Math.round((entry.units / maxUnits) * 100);
                        return (
                          <div key={entry.key}>
                            <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                              <span className="truncate pr-2">{entry.name}</span>
                              <span>{entry.units} units</span>
                            </div>
                            <div className="h-2 w-full rounded bg-gray-100">
                              <div
                                className="h-2 rounded bg-emerald-500"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && canManageUsers && (
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <form onSubmit={handleCreateManagedUser} className="mt-4 rounded-lg border border-gray-200 p-4 text-black">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                    <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))} required />
                    <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))} required />
                    <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))} required />
                    <select className="rounded border border-gray-300 px-3 py-2 text-sm" value={newUser.role} onChange={(e) => onCreateRoleChange(e.target.value)}>
                      {roleOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    <button type="submit" disabled={creatingUser} className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                      {creatingUser ? "Creating..." : "Create User"}
                    </button>
                  </div>
                </form>

                <div className="mt-4  overflow-x-auto rounded-lg border border-gray-200 text-black">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-black">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item.userId} className="border-t border-gray-100">
                          {(() => {
                            const isAdminRoleTarget =
                              item.role === "admin" || item.role === "super_admin";
                            const rowCanManageAdmin = canManageAdmins || !isAdminRoleTarget;
                            return (
                              <>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.email}</td>
                          <td className="px-4 py-3">
                            <select
                              value={item.role || "user"}
                              onChange={(e) => updateRole(item.userId, e.target.value)}
                              disabled={savingUserId === item.userId || !rowCanManageAdmin}
                              className="rounded border border-gray-300 px-2 py-1"
                            >
                              {roleOptions.map((itemRole) => (
                                <option key={itemRole} value={itemRole}>{itemRole}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {!rowCanManageAdmin
                              ? "Locked"
                              : savingUserId === item.userId
                                ? "Saving..."
                                : "Ready"}
                          </td>
                              </>
                            );
                          })()}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "products" && canManageProducts && (
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Management</h2>
                {(canAddProduct || editingProductId) && (
                <form onSubmit={handleCreateProduct} className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 text-black md:grid-cols-3">
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100" placeholder="ID" value={newProduct.id} onChange={(e) => setNewProduct((prev) => ({ ...prev, id: e.target.value }))} required={!editingProductId} disabled={Boolean(editingProductId)} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))} required />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Brand" value={newProduct.brand} onChange={(e) => setNewProduct((prev) => ({ ...prev, brand: e.target.value }))} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))} required />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Subcategory" value={newProduct.subcategory} onChange={(e) => setNewProduct((prev) => ({ ...prev, subcategory: e.target.value }))} required />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))} required />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Original Price" value={newProduct.originalPrice} onChange={(e) => setNewProduct((prev) => ({ ...prev, originalPrice: e.target.value }))} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="GST % (e.g. 18)" value={newProduct.gstPercent} onChange={(e) => setNewProduct((prev) => ({ ...prev, gstPercent: e.target.value }))} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Stock Qty" value={newProduct.stock} onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="SKU" value={newProduct.sku} onChange={(e) => setNewProduct((prev) => ({ ...prev, sku: e.target.value }))} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="HSN Code" value={newProduct.hsnCode} onChange={(e) => setNewProduct((prev) => ({ ...prev, hsnCode: e.target.value }))} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Rating" value={newProduct.rating} onChange={(e) => setNewProduct((prev) => ({ ...prev, rating: e.target.value }))} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Reviews" value={newProduct.reviews} onChange={(e) => setNewProduct((prev) => ({ ...prev, reviews: e.target.value }))} />
                  <div className="md:col-span-3 rounded border border-dashed border-gray-300 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">Product Image</p>
                    <label
                      htmlFor="product-image-upload"
                      className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg
                        className="h-5 w-5 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                      </svg>
                      <span>Upload product image</span>
                    </label>
                    <input
                      id="product-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={onProductImageUpload}
                      className="sr-only"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Supported: JPG, PNG, WebP. Max size: 2MB.
                    </p>
                    {uploadingImage && (
                      <p className="mt-2 text-xs text-blue-600">Processing image...</p>
                    )}
                    {newProduct.image && (
                      <div className="mt-3">
                        <p className="mb-1 text-xs text-gray-600">Selected image preview:</p>
                        <img
                          src={newProduct.image}
                          alt="Preview"
                          className="h-24 w-24 rounded border border-gray-200 object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2" placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))} />
                  <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Badge (optional)" value={newProduct.badge} onChange={(e) => setNewProduct((prev) => ({ ...prev, badge: e.target.value }))} />
                  <div className="md:col-span-3 flex gap-2">
                    <button type="submit" disabled={creatingProduct} className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                      {creatingProduct ? (editingProductId ? "Updating..." : "Creating...") : (editingProductId ? "Update Product" : "Create Product")}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={cancelEditProduct}
                        className="rounded bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
                )}

                <div className="mt-4 max-h-[500px] overflow-y-auto overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Product ID</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Price</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((item, index) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3">{item.id}</td>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.category} / {item.subcategory}</td>
                          <td className="px-4 py-3">{item.price}</td>
                          <td className="px-4 py-3 flex gap-2">
                            {canEditProduct && (
                              <button
                                onClick={() => startEditProduct(item)}
                                className="rounded bg-blue-50 px-3 py-1 font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                Edit
                              </button>
                            )}
                            {canDeleteProduct && (
                              <button onClick={() => deleteProduct(item.id)} disabled={deletingProductId === String(item.id)} className="rounded bg-red-50 px-3 py-1 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60">
                                {deletingProductId === String(item.id) ? "Deleting..." : "Delete"}
                              </button>
                            )}
                            {!canEditProduct && !canDeleteProduct && (
                              <span className="text-xs text-gray-500">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "orders" && canManageOrders && (
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
                <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left">Order ID</th>
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((item) => (
                        <tr key={String(item._id)} className="border-t border-gray-100">
                          <td className="px-4 py-3">{String(item._id)}</td>
                          <td className="px-4 py-3">{item.userId || item.email || "-"}</td>
                          <td className="px-4 py-3">{item.totalAmount ?? item.total ?? "-"}</td>
                          <td className="px-4 py-3">
                            <select
                              className="rounded border border-gray-300 px-2 py-1"
                              value={item.status || "pending"}
                              disabled={savingOrderId === String(item._id)}
                              onChange={(e) => updateOrderStatus(String(item._id), e.target.value)}
                            >
                              {ORDER_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                            No orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
