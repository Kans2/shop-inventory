"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Modal from "./Modal";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ProductForm({ product, categories: initialCategories = [], onSaved, onClose }) {
  const editing = Boolean(product);
  const [categories, setCategories] = useState(initialCategories);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? "General",
    price: product?.price ?? "",
    quantity: 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      api.getCategories().then((cats) => {
        if (Array.isArray(cats)) setCategories(cats);
      }).catch(() => {});
    }
  }, [categories.length]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        ...form,
        sku: form.sku.trim().toUpperCase(),
        price: Number(form.price),
        lowStockThreshold: Number(form.lowStockThreshold),
        quantity: Number(form.quantity),
      };
      if (editing) {
        await api.updateProduct(product._id, body);
      } else {
        await api.createProduct(body);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save product");
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? "Edit product" : "Add new product"} onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Product name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Basmati Rice 5kg"
            value={form.name}
            onChange={set("name")}
            required
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. RICE-5KG"
              value={form.sku}
              onChange={set("sku")}
              required
              className="w-full px-3.5 py-2.5 text-sm font-mono uppercase bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">Unique tracking code for this product</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700">Category</label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {isCustomCategory ? "Choose existing" : "+ New category"}
              </button>
            </div>
            {isCustomCategory ? (
              <input
                type="text"
                placeholder="Enter new category name"
                value={form.category}
                onChange={set("category")}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            ) : (
              <select
                value={form.category}
                onChange={set("category")}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="General">General</option>
                {categories.map((c) => {
                  const catName = typeof c === "string" ? c : c.name;
                  if (catName === "General") return null;
                  return (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={set("price")}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {!editing && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Opening stock</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.quantity}
                onChange={set("quantity")}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Low stock alert</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="5"
              value={form.lowStockThreshold}
              onChange={set("lowStockThreshold")}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl shadow-sm transition-all"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
