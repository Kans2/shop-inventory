"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import Modal from "./Modal";
import { ArrowDownLeft, ArrowUpRight, AlertCircle, Loader2 } from "lucide-react";

export default function StockModal({ product, onDone, onClose }) {
  const [type, setType] = useState("in");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const numQty = Number(quantity) || 0;
  const newBalance = type === "in" ? product.quantity + numQty : Math.max(0, product.quantity - numQty);
  const isOutOfStockRemoval = type === "out" && numQty > product.quantity;

  const quickAdds = [1, 5, 10, 25, 50];

  const submit = async (e) => {
    e.preventDefault();
    if (numQty <= 0) {
      setError("Please enter a valid quantity greater than 0");
      return;
    }
    if (isOutOfStockRemoval) {
      setError(`Cannot remove ${numQty} items. Only ${product.quantity} currently in stock.`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.adjustStock(product._id, { type, quantity: numQty, note: note.trim() });
      onDone();
    } catch (err) {
      setError(err.message || "Failed to update stock");
      setSaving(false);
    }
  };

  return (
    <Modal title={`Stock Adjustment`} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        {/* Product preview */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm text-slate-800">{product.name}</h4>
            <span className="text-xs font-mono text-slate-500">{product.sku}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Current stock</span>
            <span className="text-base font-bold text-slate-800">{product.quantity}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Toggle Stock In / Stock Out */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => { setType("in"); setError(""); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === "in"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Stock In (Receive)
          </button>
          <button
            type="button"
            onClick={() => { setType("out"); setError(""); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === "out"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Stock Out (Reduce)
          </button>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Quantity</label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            autoFocus
            className="w-full px-3.5 py-2.5 text-base font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-slate-400">Quick add:</span>
            {quickAdds.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setQuantity(String((Number(quantity) || 0) + n))}
                className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        {/* Projected balance preview */}
        {numQty > 0 && (
          <div className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between ${
            isOutOfStockRemoval ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"
          }`}>
            <span>Estimated balance after change:</span>
            <span className="font-bold text-sm">
              {product.quantity} {type === "in" ? "+" : "-"} {numQty} = {newBalance}
            </span>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder={type === "in" ? "e.g. Supplier delivery, restock" : "e.g. Sold, damaged, return"}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Buttons */}
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
            disabled={saving || isOutOfStockRemoval}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all disabled:opacity-50 ${
              type === "in" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {type === "in" ? "Add Stock" : "Remove Stock"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
