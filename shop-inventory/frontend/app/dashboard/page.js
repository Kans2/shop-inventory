"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Plus,
  TrendingUp,
  XCircle,
} from "lucide-react";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading dashboard…</p>
      </div>
    );
  }

  const { stats, categories, lowStockItems, recentMovements } = data;
  const maxValue = Math.max(...categories.map((c) => c.value), 1);

  if (stats.totalProducts === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-12">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-4">
          <Package className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your inventory is empty</h2>
        <p className="text-sm text-slate-500 mb-6">Add your first product to start tracking stock, categories, and revenue.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add products
        </Link>
      </div>
    );
  }

  const kpis = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "emerald" },
    { label: "Units in Stock", value: stats.totalUnits, icon: Boxes, color: "sky" },
    { label: "Stock Value", value: formatMoney(stats.stockValue), icon: IndianRupee, color: "purple" },
    { label: "Low / Out of Stock", value: stats.lowStock, icon: AlertTriangle, color: stats.lowStock > 0 ? "amber" : "slate", alert: stats.lowStock > 0 },
  ];

  const colorMap = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    sky: { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
    slate: { bg: "bg-slate-50", text: "text-slate-500", ring: "ring-slate-100" },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of your shop&apos;s inventory and recent activity</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>All Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const colors = colorMap[kpi.color];
          return (
            <div
              key={kpi.label}
              className={`p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4 ${kpi.alert ? "ring-1 ring-amber-200" : ""}`}
            >
              <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 block">{kpi.label}</span>
                <strong className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">{kpi.value}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column grid: Low Stock + Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Items */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Needs Restocking
            </h2>
            <Link href="/products" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-5 py-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Everything is above its alert level. 🎉</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {lowStockItems.map((p) => (
                  <li key={p._id} className="flex items-center justify-between py-3 gap-3">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{p.name}</span>
                      <span className="text-xs font-mono text-slate-400 ml-2">{p.sku}</span>
                    </div>
                    {p.quantity === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        Out of stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        {p.quantity} left
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Recent Stock Changes */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Recent Stock Changes
            </h2>
            <Link href="/movements" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-5 py-3">
            {recentMovements.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No stock changes recorded yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentMovements.map((m) => (
                  <li key={m._id} className="flex items-center justify-between py-3 gap-3">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{m.product?.name ?? "Deleted product"}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {formatDate(m.createdAt)}{m.note ? ` · ${m.note}` : ""}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${m.type === "in" ? "text-emerald-600" : "text-rose-600"} flex items-center gap-0.5`}>
                      {m.type === "in" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      {m.type === "in" ? "+" : "−"}{m.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Stock Value by Category */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-purple-500" />
            Stock Value by Category
          </h2>
        </div>
        <div className="px-5 py-4">
          <ul className="space-y-3.5">
            {categories.map((c) => {
              const pct = Math.round((c.value / maxValue) * 100);
              return (
                <li key={c.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">
                      {c.category}
                      <span className="text-xs text-slate-400 ml-1.5">({c.count} items)</span>
                    </span>
                    <span className="font-semibold text-slate-800">{formatMoney(c.value)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return <RequireAuth><Dashboard /></RequireAuth>;
}
