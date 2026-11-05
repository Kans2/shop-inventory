"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import CategoryModal from "@/components/CategoryModal";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Package,
  TrendingUp,
  AlertCircle,
  Tag,
  ArrowRight,
} from "lucide-react";

function CategoriesContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null); // "new" or category object

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await api.getCategoryDetails();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (cat) => {
    if (cat.name === "General") {
      alert("The 'General' default category cannot be deleted.");
      return;
    }
    if (
      !confirm(
        `Delete category "${cat.name}"? All products in this category will be safely reassigned to "General".`
      )
    )
      return;

    try {
      if (cat._id) {
        await api.deleteCategory(cat._id);
      }
      load();
    } catch (err) {
      setError(err.message || "Failed to delete category");
    }
  };

  const totalValue = categories.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  const totalItems = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize products by departments, types, and inventory segments
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span>View All Products</span>
          </Link>
          <button
            onClick={() => setActiveModal("new")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Categories</span>
            <div className="text-xl font-bold text-slate-800">{categories.length}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Categorized Products</span>
            <div className="text-xl font-bold text-slate-800">{totalItems}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Value Across Categories</span>
            <div className="text-xl font-bold text-slate-800">{formatMoney(totalValue)}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">No categories yet</h3>
          <p className="text-slate-500 text-xs mt-1 mb-4">
            Categories help group your inventory items for quick filtering and analytics.
          </p>
          <button
            onClick={() => setActiveModal("new")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const color = cat.color || "#059669";
            const percentOfValue = totalValue > 0 ? Math.round(((cat.totalValue || 0) / totalValue) * 100) : 0;

            return (
              <div
                key={cat._id || cat.name}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Top colored accent stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: color }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <h3 className="font-semibold text-base text-slate-900 tracking-tight">
                        {cat.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {cat._id && (
                        <button
                          onClick={() => setActiveModal(cat)}
                          title="Edit Category"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {cat.name !== "General" && (
                        <button
                          onClick={() => remove(cat)}
                          title="Delete Category"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 min-h-[32px] line-clamp-2">
                    {cat.description || "No description provided."}
                  </p>
                </div>

                {/* Metrics */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Products linked:</span>
                    <span className="font-semibold text-slate-800">{cat.productCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Stock units:</span>
                    <span className="font-semibold text-slate-800">{cat.totalStock || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Total valuation:</span>
                    <span className="font-semibold text-emerald-700">{formatMoney(cat.totalValue || 0)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="pt-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentOfValue}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block text-right mt-0.5">
                      {percentOfValue}% of inventory value
                    </span>
                  </div>
                </div>

                {/* Filter in products button */}
                <div className="mt-4 pt-2">
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <span>View items in {cat.name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {activeModal && (
        <CategoryModal
          category={activeModal === "new" ? null : activeModal}
          onDone={() => {
            setActiveModal(null);
            load();
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <RequireAuth>
      <CategoriesContent />
    </RequireAuth>
  );
}
