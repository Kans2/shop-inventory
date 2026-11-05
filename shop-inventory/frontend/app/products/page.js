"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import ProductForm from "@/components/ProductForm";
import StockModal from "@/components/StockModal";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import {
  Search,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  ArrowDownLeft,
  Pencil,
  Trash2,
  AlertTriangle,
  Package,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name_asc");
  const [formFor, setFormFor] = useState(null); // "new" or product object
  const [stockFor, setStockFor] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError("");
      const [p, c] = await Promise.all([
        api.getProducts({ q, category, status: status === "all" ? "" : status, sort }),
        api.getCategories(),
      ]);
      setProducts(p);
      setCategories(c);
    } catch (e) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [q, category, status, sort]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const done = () => {
    setFormFor(null);
    setStockFor(null);
    load();
  };

  const remove = async (p) => {
    if (!confirm(`Are you sure you want to delete "${p.name}" (${p.sku})?`)) return;
    try {
      await api.deleteProduct(p._id);
      load();
    } catch (e) {
      setError(e.message || "Failed to delete product");
    }
  };

  const exportCSV = () => {
    if (products.length === 0) return;
    const headers = ["Product Name", "SKU", "Category", "Price", "Stock Quantity", "Alert Threshold", "Status"];
    const rows = products.map((p) => {
      const st = p.quantity === 0 ? "Out of Stock" : p.quantity <= p.lowStockThreshold ? "Low Stock" : "In Stock";
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.sku}"`,
        `"${p.category}"`,
        p.price,
        p.quantity,
        p.lowStockThreshold,
        `"${st}"`,
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products & Stock</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your catalog, SKUs, pricing and real-time inventory
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportCSV}
            title="Export CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Categories</span>
          </Link>
          <button
            onClick={() => setFormFor("new")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              <option value="name_asc">Sort: Name (A to Z)</option>
              <option value="name_desc">Sort: Name (Z to A)</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
              <option value="stock_asc">Sort: Stock (Lowest First)</option>
              <option value="stock_desc">Sort: Stock (Highest First)</option>
              <option value="newest">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Filter Status:</span>
          {[
            { id: "all", label: "All Items" },
            { id: "in_stock", label: "In Stock" },
            { id: "low_stock", label: "Low Stock" },
            { id: "out_of_stock", label: "Out of Stock" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatus(st.id)}
              className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                status === st.id
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table & List View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading inventory products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">No products found</h3>
          <p className="text-slate-500 text-xs mt-1 mb-4">
            Try adjusting your search query, selecting another category, or add a new product.
          </p>
          <button
            onClick={() => setFormFor("new")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add product now</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-right">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isOut = p.quantity === 0;
                  const isLow = !isOut && p.quantity <= p.lowStockThreshold;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="inline-flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {p.sku}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {p.category || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        {formatMoney(p.price)}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-800 text-sm">{p.quantity}</div>
                        <span className="text-[11px] text-slate-400">units</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Low ({p.quantity} left)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            In stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setStockFor(p)}
                            title="Adjust Stock"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Stock</span>
                          </button>
                          <button
                            onClick={() => setFormFor(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => remove(p)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {products.length} products</span>
            <span className="text-[11px] text-slate-400">Inventory automatically synced</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {formFor && (
        <ProductForm
          product={formFor === "new" ? null : formFor}
          categories={categories}
          onSaved={done}
          onClose={() => setFormFor(null)}
        />
      )}
      {stockFor && (
        <StockModal
          product={stockFor}
          onDone={done}
          onClose={() => setStockFor(null)}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <RequireAuth>
      <Products />
    </RequireAuth>
  );
}
