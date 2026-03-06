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
import { defaultPermissionsByRole, emptyProduct, ORDER_STATUS_OPTIONS } from "@/components/admin/config";
import DashboardSection from "@/components/admin/sections/DashboardSection";
import UsersSection from "@/components/admin/sections/UsersSection";
import ProductsSection from "@/components/admin/sections/ProductsSection";
import OrdersSection from "@/components/admin/sections/OrdersSection";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function AdminPanelContent() {
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
  const [expandedOrderId, setExpandedOrderId] = useState("");
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
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
    const productById = new Map(products.map((p) => [String(p.id), p]));
    let revenue = 0;
    let estimatedCost = 0;
    let unitsSold = 0;
    const statusCounts = {};
    const productUnits = new Map();
    const salesByDateKey = new Map();
    const now = new Date();
    const dateKeys = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dateKeys.push(key);
      salesByDateKey.set(key, 0);
    }

    for (const order of orders) {
      const orderStatus = String(order?.status || "pending").toLowerCase();
      statusCounts[orderStatus] = (statusCounts[orderStatus] || 0) + 1;

      const orderTotal = Number(order?.totalAmount ?? order?.total ?? 0);
      const items = Array.isArray(order?.items) ? order.items : [];
      if (orderTotal > 0) revenue += orderTotal;
      if (orderStatus === "delivered") {
        const trendDate = new Date(
          order?.updatedAt || order?.deliveredAt || order?.createdAt || order?.placedAt || 0
        );
        if (!Number.isNaN(trendDate.getTime())) {
          const key = trendDate.toISOString().slice(0, 10);
          if (salesByDateKey.has(key)) {
            const current = Number(salesByDateKey.get(key) || 0);
            const fallbackTotal = items.reduce((sum, item) => {
              const qty = Number(item?.quantity ?? item?.qty ?? 1) || 1;
              const price = Number(item?.price ?? item?.unitPrice ?? 0) || 0;
              return sum + (qty * price);
            }, 0);
            salesByDateKey.set(key, current + (orderTotal > 0 ? orderTotal : fallbackTotal));
          }
        }
      }

      for (const item of items) {
        const qty = Number(item?.quantity ?? item?.qty ?? 1) || 1;
        const salePrice = Number(item?.price ?? item?.unitPrice ?? 0) || 0;
        if (orderTotal <= 0) revenue += salePrice * qty;
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

    const orderCount = orders.length;
    const lowStockProducts = products
      .filter((item) => Number(item?.stock ?? 0) <= 5)
      .sort((a, b) => Number(a?.stock ?? 0) - Number(b?.stock ?? 0))
      .slice(0, 8);
    const recentOrders = [...orders]
      .sort((a, b) => {
        const aTime = new Date(a?.createdAt || a?.placedAt || 0).getTime();
        const bTime = new Date(b?.createdAt || b?.placedAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 6);

    return {
      revenue,
      profit: revenue - estimatedCost,
      estimatedCost,
      orderCount,
      avgOrderValue: orderCount > 0 ? revenue / orderCount : 0,
      unitsSold,
      salesTrend: dateKeys.map((key) => ({ dateKey: key, amount: Number(salesByDateKey.get(key) || 0) })),
      topProducts: Array.from(productUnits.values())
        .sort((a, b) => b.units - a.units)
        .slice(0, 5),
      statusBreakdown: ORDER_STATUS_OPTIONS.map((status) => ({
        status,
        count: statusCounts[status] || 0,
      })),
      recentOrders,
      lowStockProducts,
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
    setUsers(await fetchAdminUsers());
  }

  async function loadProducts() {
    if (!canManageProducts) return;
    setProducts(await fetchAdminProducts());
  }

  async function loadOrders() {
    if (!canManageOrders) return;
    setOrders(await fetchAdminOrders());
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
    Promise.all(loaders).catch((err) => notifyError(err?.message || "Failed to load admin data."));
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
      if (!isEditMode) payload.id = Number(newProduct.id);

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
      if (Number(editingProductId) === Number(id)) cancelEditProduct();
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
    if (!file.type.startsWith("image/")) return notifyError("Please upload a valid image file.");
    if (file.size > 2 * 1024 * 1024) return notifyError("Image size must be 2MB or less.");

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
      const updatedOrder = await updateAdminOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((item) =>
          String(item._id) === String(orderId)
            ? {
                ...item,
                ...updatedOrder,
                _id: updatedOrder?._id || item._id,
              }
            : item
        )
      );
      notifySuccess("Order status updated.");
    } catch (err) {
      notifyError(err?.message || "Failed to update order.");
    } finally {
      setSavingOrderId("");
    }
  }

  function updateOrderStatusDraft(orderId, status) {
    setOrderStatusDrafts((prev) => ({ ...prev, [orderId]: status }));
  }

  function toggleOrderExpand(orderId) {
    setExpandedOrderId((prev) => (prev === orderId ? "" : orderId));
  }

  async function applyOrderStatus(orderId, currentStatus) {
    const nextStatus = orderStatusDrafts[orderId] || currentStatus || "pending";
    if (nextStatus === currentStatus) return;
    await updateOrderStatus(orderId, nextStatus);
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-700">Checking access...</div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-h-[90vh] flex-col md:flex-row">
          <aside className="w-full border-b border-gray-200 bg-gray-50 p-4 md:w-64 md:border-b-0 md:border-r">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-1 text-xs text-gray-600">{user.name} ({role})</p>
            <nav className="mt-5 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${activeTab === item.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50"}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="flex-1 p-4 md:p-6">
            {error ? (
              <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            ) : null}

            {activeTab === "dashboard" ? (
              <DashboardSection
                dashboardMetrics={dashboardMetrics}
                canManageProducts={canManageProducts}
                canManageUsers={canManageUsers}
                canManageOrders={canManageOrders}
                productsCount={products.length}
                usersCount={users.length}
              />
            ) : null}

            {activeTab === "users" && canManageUsers ? (
              <UsersSection
                users={users}
                newUser={newUser}
                roleOptions={roleOptions}
                creatingUser={creatingUser}
                savingUserId={savingUserId}
                canManageAdmins={canManageAdmins}
                setNewUser={setNewUser}
                onCreateRoleChange={onCreateRoleChange}
                handleCreateManagedUser={handleCreateManagedUser}
                updateRole={updateRole}
              />
            ) : null}

            {activeTab === "products" && canManageProducts ? (
              <ProductsSection
                products={products}
                newProduct={newProduct}
                editingProductId={editingProductId}
                creatingProduct={creatingProduct}
                deletingProductId={deletingProductId}
                uploadingImage={uploadingImage}
                canAddProduct={canAddProduct}
                canEditProduct={canEditProduct}
                canDeleteProduct={canDeleteProduct}
                setNewProduct={setNewProduct}
                handleCreateProduct={handleCreateProduct}
                cancelEditProduct={cancelEditProduct}
                startEditProduct={startEditProduct}
                deleteProduct={deleteProduct}
                onProductImageUpload={onProductImageUpload}
              />
            ) : null}

            {activeTab === "orders" && canManageOrders ? (
              <OrdersSection
                orders={orders}
                orderStatusOptions={ORDER_STATUS_OPTIONS}
                expandedOrderId={expandedOrderId}
                orderStatusDrafts={orderStatusDrafts}
                savingOrderId={savingOrderId}
                notifySuccess={notifySuccess}
                toggleOrderExpand={toggleOrderExpand}
                updateOrderStatusDraft={updateOrderStatusDraft}
                applyOrderStatus={applyOrderStatus}
              />
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
