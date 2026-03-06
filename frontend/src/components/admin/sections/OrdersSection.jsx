import {
  formatCurrency,
  formatDeliverySummary,
  formatDeliveryType,
  formatFullAddress,
  formatOrderDate,
  formatOrderDateOnly,
  formatOrderTimeOnly,
  formatPaymentMethod,
  getPaymentStatusClass,
  getStatusDotClass,
  getStatusTextClass,
  summarizeOrderItems,
  toTitleCase,
} from "@/components/admin/formatters";

export default function OrdersSection({
  orders,
  orderStatusOptions,
  expandedOrderId,
  orderStatusDrafts,
  savingOrderId,
  notifySuccess,
  toggleOrderExpand,
  updateOrderStatusDraft,
  applyOrderStatus,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Order ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Items</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Payment</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Delivery</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Placed At</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => {
              const orderId = String(item._id);
              const currentStatus = String(item.status || "pending").toLowerCase();
              const selectedStatus = orderStatusDrafts[orderId] || currentStatus;
              const hasStatusChange = selectedStatus !== currentStatus;
              const isExpanded = expandedOrderId === orderId;

              return [
                <tr key={`row-${orderId}`} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                    #{orderId.slice(-8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.userName || "Customer"}</div>
                    <div className="text-xs text-gray-500">{item.email || item.userId || "-"}</div>
                  </td>
                  <td className="px-4 py-3">
                    {summarizeOrderItems(item.items).length > 0 ? (
                      <div className="space-y-1">
                        {summarizeOrderItems(item.items).map((productLine) => (
                          <div key={productLine} className="text-gray-800">
                            {productLine}
                          </div>
                        ))}
                        {Array.isArray(item.items) && item.items.length > 3 ? (
                          <div className="text-xs text-gray-500">+{item.items.length - 3} more</div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatCurrency(item.totalAmount ?? item.total ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="font-medium">{formatPaymentMethod(item.payment?.method)}</div>
                    <div className={`text-xs ${getPaymentStatusClass(item.payment?.status)}`}>
                      {toTitleCase(item.payment?.status || "pending")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="font-medium">
                      {formatDeliveryType(item.deliveryType || item.fulfillment?.type)}
                    </div>
                    <div className="text-xs text-gray-500">{formatDeliverySummary(item)}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{formatOrderDateOnly(item.placedAt || item.createdAt)}</div>
                    <div className="text-xs text-gray-500">
                      {formatOrderTimeOnly(item.placedAt || item.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-2 text-sm font-medium ${getStatusTextClass(currentStatus)}`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${getStatusDotClass(currentStatus)}`} />
                      {toTitleCase(currentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleOrderExpand(orderId)}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          {isExpanded ? "Hide" : "View"}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => notifySuccess("Invoice preview coming next.")}
                          className="text-xs font-semibold text-gray-700 hover:underline"
                        >
                          Invoice
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                          value={selectedStatus}
                          disabled={savingOrderId === orderId}
                          onChange={(e) => updateOrderStatusDraft(orderId, e.target.value)}
                        >
                          {orderStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {toTitleCase(status)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => applyOrderStatus(orderId, currentStatus)}
                          disabled={!hasStatusChange || savingOrderId === orderId}
                          className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingOrderId === orderId ? "Saving..." : "Update"}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>,
                isExpanded ? (
                  <tr key={`detail-${orderId}`} className="border-t border-gray-100 bg-gray-50">
                    <td className="px-4 py-3" colSpan={9}>
                      <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-3">
                        <div>
                          <p className="font-semibold text-gray-900">Delivery Details</p>
                          <p>{formatDeliveryType(item.deliveryType || item.fulfillment?.type)}</p>
                          <p className="text-xs text-gray-500">{formatDeliverySummary(item)}</p>
                          <p className="text-xs text-gray-500">
                            ETA: {formatOrderDate(item.fulfillment?.estimatedDeliveryAt)}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Address / Pickup</p>
                          <p className="text-xs text-gray-600">{formatFullAddress(item)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Order Notes</p>
                          <p className="text-xs text-gray-600">
                            {String(item.notes || "No notes provided.")}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null,
              ];
            })}
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={9}>
                  No orders found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
