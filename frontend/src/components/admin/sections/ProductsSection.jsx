export default function ProductsSection({
  products,
  newProduct,
  editingProductId,
  creatingProduct,
  deletingProductId,
  uploadingImage,
  canAddProduct,
  canEditProduct,
  canDeleteProduct,
  setNewProduct,
  handleCreateProduct,
  cancelEditProduct,
  startEditProduct,
  deleteProduct,
  onProductImageUpload,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Product Management</h2>
      {(canAddProduct || editingProductId) && (
        <form
          onSubmit={handleCreateProduct}
          className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 text-black md:grid-cols-3"
        >
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
            <label htmlFor="product-image-upload" className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              <span>Upload product image</span>
            </label>
            <input id="product-image-upload" type="file" accept="image/*" onChange={onProductImageUpload} className="sr-only" />
            <p className="mt-2 text-xs text-gray-500">Supported: JPG, PNG, WebP. Max size: 2MB.</p>
            {uploadingImage ? <p className="mt-2 text-xs text-blue-600">Processing image...</p> : null}
            {newProduct.image ? (
              <div className="mt-3">
                <p className="mb-1 text-xs text-gray-600">Selected image preview:</p>
                <img src={newProduct.image} alt="Preview" className="h-24 w-24 rounded border border-gray-200 object-cover" />
              </div>
            ) : null}
          </div>
          <input className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2" placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))} />
          <input className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Badge (optional)" value={newProduct.badge} onChange={(e) => setNewProduct((prev) => ({ ...prev, badge: e.target.value }))} />
          <div className="md:col-span-3 flex gap-2">
            <button type="submit" disabled={creatingProduct} className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {creatingProduct ? (editingProductId ? "Updating..." : "Creating...") : (editingProductId ? "Update Product" : "Create Product")}
            </button>
            {editingProductId ? (
              <button type="button" onClick={cancelEditProduct} className="rounded bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300">
                Cancel Edit
              </button>
            ) : null}
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
                  {canEditProduct ? (
                    <button onClick={() => startEditProduct(item)} className="rounded bg-blue-50 px-3 py-1 font-semibold text-blue-700 hover:bg-blue-100">
                      Edit
                    </button>
                  ) : null}
                  {canDeleteProduct ? (
                    <button onClick={() => deleteProduct(item.id)} disabled={deletingProductId === String(item.id)} className="rounded bg-red-50 px-3 py-1 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60">
                      {deletingProductId === String(item.id) ? "Deleting..." : "Delete"}
                    </button>
                  ) : null}
                  {!canEditProduct && !canDeleteProduct ? (
                    <span className="text-xs text-gray-500">No actions</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
