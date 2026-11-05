"use client";
import { useEffect, useState, useCallback } from "react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  Clock,
  Filter,
} from "lucide-react";

function MovementsContent() {
  const [data, setData] = useState({ movements: [], total: 0, summary: { in: 0, out: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState(""); // "" or "in" or "out"

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await api.getMovements({ type, limit: 100 });
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load stock movements");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  const { movements, summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Activity & History</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit log of all inward deliveries, sales, and inventory adjustments
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Units Stocked In</span>
            <div className="text-xl font-bold text-emerald-700">+{summary.in || 0}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Units Stocked Out</span>
            <div className="text-xl font-bold text-rose-700">−{summary.out || 0}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Transactions</span>
            <div className="text-xl font-bold text-slate-800">{data.total || 0}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm text-xs">
        <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1" />
        <span className="text-slate-400 font-medium">Filter by:</span>
        <button
          onClick={() => setType("")}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            type === "" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setType("in")}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            type === "in" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Stock In Only
        </button>
        <button
          onClick={() => setType("out")}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            type === "out" ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Stock Out Only
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading stock activity log...</p>
        </div>
      ) : movements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">No movements recorded</h3>
          <p className="text-slate-500 text-xs mt-1">
            When you add stock or record sales from the products page, changes will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4 text-right">Balance After</th>
                  <th className="py-3.5 px-4">Note / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => {
                  const isIn = m.type === "in";
                  return (
                    <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(m.createdAt)}
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {m.product?.name ?? "Deleted product"}
                        </div>
                        {m.product?.sku && (
                          <span className="font-mono text-[11px] text-slate-400">
                            {m.product.sku}
                          </span>
                        )}
                      </td>

                      {/* Movement Type */}
                      <td className="py-3.5 px-4">
                        {isIn ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                            Stock In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                            Stock Out
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        <span className={isIn ? "text-emerald-700" : "text-rose-700"}>
                          {isIn ? "+" : "−"}
                          {m.quantity}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="py-3.5 px-4 text-right text-xs font-semibold text-slate-700">
                        {m.balanceAfter} units
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {m.note || <span className="text-slate-400 italic">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500">
            Showing {movements.length} of {data.total} movement records
          </div>
        </div>
      )}
    </div>
  );
}

export default function MovementsPage() {
  return (
    <RequireAuth>
      <MovementsContent />
    </RequireAuth>
  );
}
