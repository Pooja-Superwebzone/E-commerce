import StatCard from "@/components/admin/StatCard";
import { formatCurrency, formatOrderDate, toTitleCase } from "@/components/admin/formatters";

export default function DashboardSection({
  dashboardMetrics,
  canManageProducts,
  canManageUsers,
  canManageOrders,
  productsCount,
  usersCount,
}) {
  const salesTrend = dashboardMetrics.salesTrend || [];
  const maxSalesAmount = Math.max(
    1,
    ...(salesTrend.map((entry) => Number(entry.amount || 0)))
  );
  const chartHeight = 220;
  const chartWidth = 760;
  const yAxisWidth = 56;
  const xAxisHeight = 36;
  const plotWidth = chartWidth - yAxisWidth - 12;
  const plotHeight = chartHeight - xAxisHeight - 12;
  const barSlot = salesTrend.length > 0 ? plotWidth / salesTrend.length : plotWidth;
  const barWidth = Math.max(16, Math.min(42, barSlot * 0.58));
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const hasDeliveredSales = salesTrend.some((entry) => Number(entry.amount || 0) > 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Business Dashboard</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value={formatCurrency(dashboardMetrics.revenue)} />
        <StatCard title="Orders" value={dashboardMetrics.orderCount} />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(dashboardMetrics.avgOrderValue)}
        />
        <StatCard title="Units Sold" value={dashboardMetrics.unitsSold} />
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-800">Sales Chart (Last 7 Days)</h3>
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100 bg-white p-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-[240px] w-full min-w-[680px]"
            role="img"
            aria-label="Sales chart for last 7 days"
          >
            {yTicks.map((tick) => {
              const y = 8 + (1 - tick) * plotHeight;
              const value = Math.round(maxSalesAmount * tick);
              return (
                <g key={`tick-${tick}`}>
                  <line
                    x1={yAxisWidth}
                    y1={y}
                    x2={yAxisWidth + plotWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={yAxisWidth - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {value.toLocaleString("en-IN")}
                  </text>
                </g>
              );
            })}

            {salesTrend.map((entry, index) => {
              const amount = Number(entry.amount || 0);
              const barHeight = amount > 0
                ? Math.max(6, Math.round((amount / maxSalesAmount) * (plotHeight - 2)))
                : 0;
              const xCenter = yAxisWidth + index * barSlot + barSlot / 2;
              const x = xCenter - barWidth / 2;
              const y = 8 + plotHeight - barHeight;
              const label = String(entry.dateKey || "").slice(5);
              return (
                <g key={entry.dateKey}>
                  <title>{`${label}: ${formatCurrency(amount)}`}</title>
                  {barHeight > 0 ? (
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="5"
                      fill="#2563eb"
                    />
                  ) : null}
                  <text
                    x={xCenter}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#475569"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
            {!hasDeliveredSales ? (
              <text
                x={yAxisWidth + plotWidth / 2}
                y={chartHeight / 2}
                textAnchor="middle"
                fontSize="12"
                fill="#94a3b8"
              >
                No delivered sales in last 7 days
              </text>
            ) : null}
          </svg>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800">Order Status</h3>
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
                    <div className="h-2 rounded bg-blue-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800">Top Selling Products</h3>
          <div className="mt-4 space-y-3">
            {dashboardMetrics.topProducts.length === 0 ? (
              <p className="text-xs text-gray-500">No order item data found yet.</p>
            ) : null}
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
                    <div className="h-2 rounded bg-emerald-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border max-h-[250px] overflow-y-auto border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-800">Recent Orders</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-600">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {(dashboardMetrics.recentOrders || []).map((order) => (
                <tr key={String(order?._id)} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-mono text-xs">{String(order?._id || "-").slice(-6)}</td>
                  <td className="px-3 py-2">{order?.userName || order?.email || "-"}</td>
                  <td className="px-3 py-2">{toTitleCase(order?.status || "pending")}</td>
                  <td className="px-3 py-2">{formatCurrency(order?.totalAmount || order?.total || 0)}</td>
                  <td className="px-3 py-2">{formatOrderDate(order?.createdAt || order?.placedAt)}</td>
                </tr>
              ))}
              {(dashboardMetrics.recentOrders || []).length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-xs text-gray-500" colSpan={5}>
                    No recent orders.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-800">Low Stock Products</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-600">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Stock</th>
              </tr>
            </thead>
            <tbody>
              {(dashboardMetrics.lowStockProducts || []).map((item) => (
                <tr key={String(item.id)} className="border-t border-gray-100">
                  <td className="px-3 py-2">{item.name || "-"}</td>
                  <td className="px-3 py-2">{item.category || "-"}</td>
                  <td className="px-3 py-2 font-semibold text-red-600">{Number(item.stock || 0)}</td>
                </tr>
              ))}
              {(dashboardMetrics.lowStockProducts || []).length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-xs text-gray-500" colSpan={3}>
                    No low stock products.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canManageProducts ? <StatCard title="Products" value={productsCount} /> : null}
        {canManageUsers ? <StatCard title="Users" value={usersCount} /> : null}
        {canManageOrders ? (
          <StatCard title="Estimated Profit" value={formatCurrency(dashboardMetrics.profit)} />
        ) : null}
        <StatCard title="Estimated Cost" value={formatCurrency(dashboardMetrics.estimatedCost)} />
      </div>
    </div>
  );
}
