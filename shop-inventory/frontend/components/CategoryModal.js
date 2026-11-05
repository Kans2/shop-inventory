"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import Modal from "./Modal";
import { AlertCircle, Loader2 } from "lucide-react";

const PALETTE = [
  { label: "Emerald", value: "#059669" },
  { label: "Teal", value: "#0d9488" },
  { label: "Sky", value: "#0284c7" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Rose", value: "#e11d48" },
  { label: "Amber", value: "#d97706" },
  { label: "Slate", value: "#475569" },
];

export default function CategoryModal({ category, onDone, onClose }) {
  const editing = Boolean(category && category._id);
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    color: category?.color ?? "#059669",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please provide a category name");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.updateCategory(category._id, form);
      } else {
        await api.createCategory(form);
      }
      onDone();
    } catch (err) {
      setError(err.message || "Failed to save category");
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? `Edit category: ${category.name}` : "Create category"} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Category Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Dairy & Cold Storage"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoFocus
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Description (optional)</label>
          <textarea
            rows={2}
            placeholder="Brief explanation of items in this category"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Tag Color</label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {PALETTE.map((p) => {
              const selected = form.color === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: p.value })}
                  style={{ backgroundColor: p.value }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selected ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : "hover:scale-105 opacity-80"
                  }`}
                  title={p.label}
                />
              );
            })}
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
            {editing ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
