"use client";

import { useEffect, useMemo, useState } from "react";
import { DonutChart, LineChart } from "./charts";
import { ActionBtns, Badge, PageHeader, PrimaryBtn, roleBadge, SearchBar, Table, TD, TR } from "./ui";
import type { Product } from "../../lib/imsApi";
import {
  IconChevronRight,
  IconCog,
  IconEye,
  IconPackage,
  IconPlus,
  IconRotateCcw,
  IconSearch,
  IconShoppingCart,
  IconTrash,
  IconUsers,
  IconX,
  IconPencil,
} from "../icons/Icons";
import {
  createProduct,
  createDistributor,
  deleteDistributor,
  deleteProduct,
  getComplaintStats,
  getDashboardStats,
  getDashboardTimeline,
  listCustomers,
  listDistributors,
  listManufactured,
  listProducts,
  listRawMaterials,
  listSales,
  listSerials,
  listUsers,
  updateDistributor,
  updateProduct,
} from "../../lib/imsApi";

type User = {
  name?: string;
  email?: string;
  role?: string;
} | null;

function useAsyncData<T>(loader: () => Promise<T>, deps: ReadonlyArray<unknown>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((d) => {
        if (cancelled) return;
        setData(d);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return {
    data,
    loading,
    error,
    reload: () => {
      setLoading(true);
      setError("");
      setNonce((n) => n + 1);
    },
  };
}

function formatNumber(n: number) {
  return n.toLocaleString("en-IN");
}

function daysAgo(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function DashboardPage({ user }: { user: User }) {
  const statsRes = useAsyncData(getDashboardStats, []);
  const timelineRes = useAsyncData(() => getDashboardTimeline(6), []);
  const complaintStatsRes = useAsyncData(getComplaintStats, []);
  const salesRes = useAsyncData(() => listSales({ page: 1, limit: 10 }), []);
  const customersRes = useAsyncData(() => listCustomers({ page: 1, limit: 100 }), []);

  const stats = useMemo(() => {
    const s = statsRes.data;
    return [
      { label: "Raw Materials", value: s ? formatNumber(s.rawMaterials.totalAvailable) : "—", icon: <IconPackage size={20} />, color: "from-blue-50 to-white", border: "border-blue-100", accent: "text-blue-600", iconBg: "bg-blue-100 text-blue-700" },
      { label: "Manufactured", value: s ? formatNumber(s.manufactured.total) : "—", icon: <IconCog size={20} />, color: "from-amber-50 to-white", border: "border-amber-100", accent: "text-amber-600", iconBg: "bg-amber-100 text-amber-700" },
      { label: "Products Sold", value: s ? formatNumber(s.manufactured.sold) : "—", icon: <IconShoppingCart size={20} />, color: "from-emerald-50 to-white", border: "border-emerald-100", accent: "text-emerald-600", iconBg: "bg-emerald-100 text-emerald-700" },
    ];
  }, [statsRes.data]);

  const activity = useMemo(() => {
    const sales = salesRes.data?.data ?? [];
    return sales.slice(0, 7).map((s) => ({ time: daysAgo(s.saleDate), msg: `Product Sold: ${s.serialNumber}` }));
  }, [salesRes.data]);

  const recentSales = useMemo(() => {
    const sales = salesRes.data?.data ?? [];
    const customers = customersRes.data?.data ?? [];
    const map = new Map(customers.map((c) => [c.id, c.name]));
    return sales.slice(0, 5).map((s) => ({ customer: map.get(s.customerId) || s.customerId, serial: s.serialNumber }));
  }, [salesRes.data, customersRes.data]);

  const donutData = useMemo(() => (complaintStatsRes.data ?? []).map((r) => ({ label: r.status, value: r.count })), [complaintStatsRes.data]);
  return (
    <div>
      <PageHeader title="Dashboard" sub={`Welcome back, ${user?.name ?? ""}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} p-4 sm:p-5 shadow-sm`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>{s.icon}</div>
              <span className="text-gray-500 text-sm font-medium">Stocks | {s.label}</span>
            </div>
            <div className={`text-3xl sm:text-4xl font-black ${s.accent} tracking-tight`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Inventory Timeline</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />Sales</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />Raw Materials</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500 inline-block rounded" />Manufactured</span>
            </div>
          </div>
          <LineChart
            months={timelineRes.data?.months ?? ["—", "—", "—", "—", "—", "—"]}
            raw={timelineRes.data?.raw ?? [0, 0, 0, 0, 0, 0]}
            manufactured={timelineRes.data?.manufactured ?? [0, 0, 0, 0, 0, 0]}
            sales={timelineRes.data?.sales ?? [0, 0, 0, 0, 0, 0]}
          />
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-2.5 overflow-y-auto">
            {activity.length === 0 ? (
              <div className="text-xs text-gray-400 py-6 text-center">No recent activity.</div>
            ) : activity.map((a, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-700 leading-snug">{a.msg}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sales | Timeline</h3>
          <Table headers={["#", "Consumer", "Product Type", "Product Serial"]}>
            {recentSales.length === 0 ? (
              <TR>
                <TD colSpan={4} className="text-center text-gray-400 py-8">No sales found.</TD>
              </TR>
            ) : recentSales.map((r, i) => (
              <TR key={i} zebra={i % 2 === 1}>
                <TD><span className="w-6 h-6 rounded bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">{i + 1}</span></TD>
                <TD className="font-medium text-gray-900">{r.customer}</TD>
                <TD><span className="text-blue-600 text-xs">—</span></TD>
                <TD className="font-mono text-xs text-amber-700 font-semibold">{r.serial}</TD>
              </TR>
            ))}
          </Table>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Complaints Status</h3>
          <DonutChart data={donutData} />
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Selling Products | This Month</h3>
        <Table headers={["#", "Product Type", "Product Model", "Qty Sold"]}>
          <TR>
            <TD colSpan={4} className="text-center text-gray-400 py-8">No sales found this month.</TD>
          </TR>
        </Table>
      </div>
    </div>
  );
}

export function UsersPage() {
  const [q, setQ] = useState("");
  const usersRes = useAsyncData(listUsers, []);
  const filtered = useMemo(() => {
    const all = usersRes.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter((u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
  }, [usersRes.data, q]);
  return (
    <div>
      <PageHeader title="User Profiles" sub="Manage system access and roles" action={<PrimaryBtn>+ Authorize New User</PrimaryBtn>} />
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <span className="text-sm text-gray-500">{filtered.length} users</span>
          <SearchBar value={q} onChange={setQ} />
        </div>
        <Table headers={["User e-Mail ID", "User Name", "Mobile No", "User Role", "Action"]}>
          {usersRes.loading ? (
            <TR>
              <TD colSpan={5} className="text-center text-gray-400 py-8">Loading…</TD>
            </TR>
          ) : usersRes.error ? (
            <TR>
              <TD colSpan={5} className="text-center text-red-500 py-8">{usersRes.error}</TD>
            </TR>
          ) : null}
          {filtered.map((u, i) => (
            <TR key={i} zebra={i % 2 === 1}>
              <TD className="text-gray-500">{u.email}</TD>
              <TD className="font-medium text-gray-900">{u.name}</TD>
              <TD className="text-gray-500 font-mono text-xs">{u.mobile}</TD>
              <TD>{roleBadge(u.role)}</TD>
              <TD><ActionBtns /></TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  );
}

export function CustomersPage() {
  const [q, setQ] = useState("");
  const customersRes = useAsyncData(() => listCustomers({ page: 1, limit: 100 }), []);
  const filtered = useMemo(() => {
    const all = customersRes.data?.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter((c) => c.name.toLowerCase().includes(query));
  }, [customersRes.data, q]);
  return (
    <div>
      <PageHeader title="Manage Customers" sub="Customer Directory" action={<PrimaryBtn>+ Add New Customer</PrimaryBtn>} />
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <span className="text-sm text-gray-500">
            {filtered.length} of {customersRes.data?.total ?? 0} entries
          </span>
          <SearchBar value={q} onChange={setQ} />
        </div>
        <Table headers={["#", "Name", "Type", "Email", "Phone", "Status", "Actions"]}>
          {customersRes.loading ? (
            <TR>
              <TD colSpan={7} className="text-center text-gray-400 py-8">Loading…</TD>
            </TR>
          ) : customersRes.error ? (
            <TR>
              <TD colSpan={7} className="text-center text-red-500 py-8">{customersRes.error}</TD>
            </TR>
          ) : null}
          {filtered.map((c, i) => (
            <TR key={i} zebra={i % 2 === 1}>
              <TD className="text-gray-400">{i + 1}</TD>
              <TD><span className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer">{c.name}</span></TD>
              <TD>{c.type === "Distributor" ? <Badge color="orange">Distributor</Badge> : <Badge color="blue">Individual</Badge>}</TD>
              <TD className="text-gray-500 text-xs">{c.email}</TD>
              <TD className="text-gray-500 font-mono text-xs">{c.phone}</TD>
              <TD><Badge color="green">{c.status}</Badge></TD>
              <TD><ActionBtns /></TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  );
}

export function SerialsPage() {
  const [q, setQ] = useState("");
  const [series, setSeries] = useState("");
  const productsRes = useAsyncData(listProducts, []);
  const serialsRes = useAsyncData(() => listSerials({}), []);

  const seriesOptions = useMemo(() => {
    const products = productsRes.data ?? [];
    return [...new Set(products.map((p) => p.series))];
  }, [productsRes.data]);

  const filtered = useMemo(() => {
    const rows = serialsRes.data?.data ?? [];
    const query = q.trim().toLowerCase();
    return rows.filter((s) => {
      if (series && s.productSeriesId !== series) return false;
      if (!query) return true;
      return s.serialNumber.toLowerCase().includes(query);
    });
  }, [serialsRes.data, q, series]);
      return (
        <div>
          <PageHeader title="Serial Management" sub="Serial Pool" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Import Serials to Series</h3>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">1. Select Product Series</label>
              <select value={series} onChange={(e) => setSeries(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 mb-1 transition shadow-sm">
            <option value="">Choose Series...</option>
            {seriesOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <p className="text-xs text-gray-400 mb-4">Serials uploaded here will be available for all models under this series.</p>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">2. Upload CSV</label>
          <div className="flex items-center gap-2 mb-1">
            <label className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-sm cursor-pointer hover:bg-gray-200 transition">
              Choose file
              <input type="file" accept=".csv" className="hidden" />
            </label>
            <span className="text-xs text-gray-400">No file chosen</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">CSV format: One serial per line in the first column.</p>
          <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-sm">⬆ Import Serials</button>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Inventory Pool Status</h3>
            <SearchBar value={q} onChange={setQ} />
          </div>
          <Table headers={["Serial Number", "Product Series", "Status", "Upload Date"]}>
            {serialsRes.loading ? (
              <TR>
                <TD colSpan={4} className="text-center text-gray-400 py-8">Loading…</TD>
              </TR>
            ) : serialsRes.error ? (
              <TR>
                <TD colSpan={4} className="text-center text-red-500 py-8">{serialsRes.error}</TD>
              </TR>
            ) : null}
            {filtered.map((s, i) => (
              <TR key={i} zebra={i % 2 === 1}>
                <TD className="font-mono text-xs text-gray-800">{s.serialNumber}</TD>
                <TD><span className="text-blue-600 text-xs">{s.productSeriesId}</span></TD>
                <TD><Badge color="gray">{s.status}</Badge></TD>
                <TD className="text-gray-400 text-xs">{new Date(s.uploadedAt).toLocaleString()}</TD>
              </TR>
            ))}
          </Table>
          <div className="mt-3 text-xs text-gray-400">
            Showing {filtered.length} of {serialsRes.data?.total ?? 0} entries
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [q, setQ] = useState("");
  const productsRes = useAsyncData(() => listProducts({}), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<{ series: string; model: string; description: string }>({
    series: "",
    model: "",
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setModalMode("create");
    setActiveProduct(null);
    setForm({ series: "", model: "", description: "" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setModalMode("edit");
    setActiveProduct(p);
    setForm({ series: p.series || "", model: p.model || "", description: p.description ?? "" });
    setFormError("");
    setModalOpen(true);
  }

  async function onSave() {
    const series = form.series.trim();
    const model = form.model.trim();
    const description = form.description.trim();
    if (!series || !model) {
      setFormError("Series and model are required.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modalMode === "create") {
        await createProduct({ series, model, description: description || undefined });
      } else {
        if (!activeProduct) throw new Error("No product selected");
        await updateProduct(activeProduct.id, { series, model, description: description || undefined });
      }
      productsRes.reload();
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(p: Product) {
    const ok = window.confirm(`Delete product “${p.model}”?`);
    if (!ok) return;
    try {
      await deleteProduct(p.id);
      productsRes.reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  }

  const filtered = useMemo(() => {
    const all = productsRes.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter((p) => p.model.toLowerCase().includes(query) || p.series.toLowerCase().includes(query));
  }, [productsRes.data, q]);
  const sp = useMemo(() => (productsRes.data ?? []).filter((p) => p.series.startsWith("SP") || p.series.startsWith("AURAWATT")).length, [productsRes.data]);
      const tp = useMemo(() => (productsRes.data ?? []).filter((p) => p.series.startsWith("TP")).length, [productsRes.data]);
      return (
        <div>
          <PageHeader title="Manage Products" action={<PrimaryBtn onClick={openCreate}>+ Add Product</PrimaryBtn>} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-5 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">SP Series | Single Phase</div>
              <div className="text-5xl font-black text-blue-600">{sp}</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-5 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">TP Series | Three Phase</div>
              <div className="text-5xl font-black text-emerald-600">{tp}</div>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <span className="text-sm text-gray-500">Showing {filtered.length} of {productsRes.data?.length ?? 0} products</span>
              <SearchBar value={q} onChange={setQ} />
            </div>
        <Table headers={["Product Series", "Model Name", "Manage"]}>
          {productsRes.loading ? (
            <TR>
              <TD colSpan={3} className="text-center text-gray-400 py-8">Loading…</TD>
            </TR>
          ) : productsRes.error ? (
            <TR>
              <TD colSpan={3} className="text-center text-red-500 py-8">{productsRes.error}</TD>
            </TR>
          ) : null}
          {filtered.map((p, i) => (
            <TR key={i} zebra={i % 2 === 1}>
              <TD className="text-gray-800">{p.series}</TD>
              <TD className="font-mono font-semibold text-amber-700">{p.model}</TD>
              <TD>
                <ActionBtns
                  onEdit={() => openEdit(p)}
                  onDelete={() => onRemove(p)}
                />
              </TD>
            </TR>
          ))}
        </Table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {modalMode === "create" ? "Add Product" : "Edit Product"}
                </div>
                <div className="text-xs text-gray-500">
                  {modalMode === "create" ? "Create a new product model" : `Update ${activeProduct?.model ?? ""}`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Series</label>
                  <input
                    value={form.series}
                    onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
                    placeholder="e.g. SP SERIES (3-6 KW / 48V / IP66)"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Model Name</label>
                  <input
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    placeholder="e.g. AW-SP-3000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Notes about this model..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>
              {formError && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onSave}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-md shadow-amber-200 ${
                  saving
                    ? "bg-amber-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400"
                }`}
              >
                {saving ? "Saving…" : modalMode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RawMaterialsPage() {
  const [q, setQ] = useState("");
  const rawRes = useAsyncData(() => listRawMaterials({}), []);
  const filtered = useMemo(() => {
    const all = rawRes.data?.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter(
      (r) =>
        r.productSeriesId.toLowerCase().includes(query) ||
        r.referenceNo.toLowerCase().includes(query) ||
        r.materialName.toLowerCase().includes(query)
    );
  }, [rawRes.data, q]);
      return (
        <div>
          <PageHeader title="Raw Materials Inventory" action={<PrimaryBtn>+ Add Raw Materials</PrimaryBtn>} />
          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <span className="text-sm text-gray-500">Showing {filtered.length} of {rawRes.data?.total ?? 0} entries</span>
              <SearchBar value={q} onChange={setQ} />
            </div>
        <Table headers={["Product Series", "Material Name", "Date Rcd", "Bill Type", "Ref. No.", "Qty Rcd", "Qty Avl", "Vendor", "Batch", "Manage"]}>
          {rawRes.loading ? (
            <TR>
              <TD colSpan={10} className="text-center text-gray-400 py-8">Loading…</TD>
            </TR>
          ) : rawRes.error ? (
            <TR>
              <TD colSpan={10} className="text-center text-red-500 py-8">{rawRes.error}</TD>
            </TR>
          ) : null}
          {filtered.map((r, i) => (
            <TR key={i} zebra={i % 2 === 1}>
              <TD>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-xs font-medium whitespace-nowrap">{r.productSeriesId}</span>
              </TD>
              <TD className="font-semibold text-gray-900">{r.materialName}</TD>
              <TD className="text-gray-500 text-xs whitespace-nowrap">{new Date(r.dateReceived).toLocaleDateString()}</TD>
              <TD><Badge color="blue">{r.billType || "—"}</Badge></TD>
              <TD className="font-mono text-xs text-gray-700">{r.referenceNo}</TD>
              <TD className="text-center text-gray-700">{r.quantityReceived}</TD>
              <TD className={`text-center font-bold ${r.quantityAvailable === 0 ? "text-red-600" : "text-emerald-600"}`}>{r.quantityAvailable}</TD>
              <TD className="text-xs text-gray-700 whitespace-nowrap">{r.vendorName}</TD>
              <TD className="text-xs text-gray-500">{r.batch}</TD>
              <TD>
                <div className="flex gap-1">
                  <button className="w-6 h-6 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition flex items-center justify-center border border-amber-200" type="button">
                    <IconPencil size={14} />
                  </button>
                  <button className="w-6 h-6 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center border border-sky-200" type="button">
                    <IconRotateCcw size={14} />
                  </button>
                  <button className="w-6 h-6 rounded bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center border border-red-200" type="button">
                    <IconTrash size={14} />
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  );
}

export function ManufacturedPage() {
  const [q, setQ] = useState("");
  const manufacturedRes = useAsyncData(() => listManufactured({}), []);
  const filtered = useMemo(() => {
    const all = manufacturedRes.data?.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter(
      (m) => m.serialNumber.toLowerCase().includes(query) || m.productId.toLowerCase().includes(query)
    );
  }, [manufacturedRes.data, q]);
  return (
    <div>
      <PageHeader
        title="Manufacturing Registry"
        sub="Production Ledger"
        action={
          <PrimaryBtn>
            <IconPlus size={16} /> Record New Production
          </PrimaryBtn>
        }
      />
      <div className="rounded-2xl bg-white border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {["From Date", "To Date"].map((label) => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input type="date" className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-amber-400 shadow-sm" />
            </div>
          ))}
          {["Customer", "Series", "Model", "Return Reason"].map((label) => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <select className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-amber-400 shadow-sm">
                <option>All {label}s</option>
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition flex items-center gap-1.5">
            <IconSearch size={14} /> Search
          </button>
          <button className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition border border-gray-200 flex items-center gap-1.5">
            <IconRotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <span className="text-sm text-gray-500">{filtered.length} records</span>
          <SearchBar value={q} onChange={setQ} />
        </div>
        <Table headers={["Series", "Product Model", "Serial Number", "Mfg. Date", "Sold Status", "Invoice No.", "Payment Status", "Return", "Action"]}>
          {manufacturedRes.loading ? (
            <TR>
              <TD colSpan={9} className="text-center text-gray-400 py-8">Loading…</TD>
            </TR>
          ) : manufacturedRes.error ? (
            <TR>
              <TD colSpan={9} className="text-center text-red-500 py-8">{manufacturedRes.error}</TD>
            </TR>
          ) : null}
          {filtered.map((m, i) => (
            <TR key={i} zebra={i % 2 === 1}>
              <TD><span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-xs whitespace-nowrap">—</span></TD>
              <TD className="font-mono font-semibold text-amber-700 whitespace-nowrap">{m.productId}</TD>
              <TD className="font-mono text-xs text-gray-700">{m.serialNumber}</TD>
              <TD className="text-gray-500 text-xs whitespace-nowrap">{new Date(m.mfgDate).toLocaleDateString()}</TD>
              <TD>{m.status === "Sold" ? <Badge color="green">Sold</Badge> : <Badge color="blue">In Stock</Badge>}</TD>
              <TD className="text-xs text-gray-700">{m.invoiceNo || "—"}</TD>
              <TD>{m.paymentStatus === "N/A" ? <span className="text-gray-300">—</span> : m.paymentStatus === "Pending" ? <Badge color="red">Pending</Badge> : <Badge color="green">Verified</Badge>}</TD>
              <TD className="text-gray-300">—</TD>
              <TD>
                <div className="flex gap-1">
                  <button className="w-6 h-6 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition flex items-center justify-center border border-amber-200" type="button">
                    <IconPencil size={14} />
                  </button>
                  <button className="w-6 h-6 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center border border-sky-200" type="button">
                    <IconEye size={14} />
                  </button>
                  <button className="w-6 h-6 rounded bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center border border-red-200" type="button">
                    <IconRotateCcw size={14} />
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  );
}

export function SalesPage() {
  const [custType, setCustType] = useState("");
  const [docType, setDocType] = useState("Tax Invoice");
  return (
    <div>
      <PageHeader title="Sales Data Entry" sub="Customer and Product Details" />
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <IconShoppingCart size={18} /> New Sales Transaction
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 transition font-medium flex items-center gap-1">
            View Sales Data <IconChevronRight size={16} />
          </button>
        </div>
        <div className="mb-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Transaction Details</div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Product Serial No.</label>
              <div className="flex">
                <input placeholder="Search or Select Serial..." className="flex-1 px-3 py-2 rounded-l-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                <button className="px-2 rounded-r-lg bg-gray-100 border-y border-r border-gray-200 text-gray-500 text-xs hover:bg-gray-200 transition">▼</button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                <option>Tax Invoice</option>
                <option>Delivery Challan</option>
                <option>Proforma Invoice</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Reference No.</label>
              <input defaultValue="INV-2024-XXXX" className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sales Date</label>
              <input type="date" defaultValue="2026-05-11" className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Information</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer Type</label>
              <select value={custType} onChange={(e) => setCustType(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                <option value="">Select Type...</option>
                <option>Individual</option>
                <option>Distributor</option>
                <option>Corporate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer Email</label>
              <input placeholder="Select existing email..." className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer Name</label>
              <input placeholder="Full Name" className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Contact Number</label>
              <input placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Complete Address</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none" />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
          <button className="px-5 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition">Clear Form</button>
          <PrimaryBtn>Confirm & Record Sale</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

export function ComplaintsConsumerPage() {
  const manufacturedRes = useAsyncData(() => listManufactured({}), []);
  return (
    <div>
      <PageHeader title="Complaints: Consumer" sub="Warranty Claims — After Sales Service" />
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">Warranty Claims: After Sales Service</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 transition font-medium">View Complaints →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Product Serial No.</label>
            <select className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
              <option>Select Product</option>
              {(manufacturedRes.data?.data ?? []).map((m) => <option key={m.id} value={m.serialNumber}>{m.serialNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Product Type</label>
            <input className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 text-sm" disabled placeholder="Auto-filled" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Product Model</label>
            <input className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 text-sm" disabled placeholder="Auto-filled" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date of Sale</label>
            <input type="date" className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date of Complaint</label>
            <input type="date" className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Issue Description</label>
            <textarea rows={4} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none" />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2">
          <button className="px-5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition border border-red-200">Reset</button>
          <PrimaryBtn>Raise Complaint</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

export function ComplaintsSupplierPage() {
  const rawRes = useAsyncData(() => listRawMaterials({}), []);
  const materialOptions = useMemo(() => {
    const rows = rawRes.data?.data ?? [];
    return [...new Set(rows.map((r) => r.materialName))].filter(Boolean);
  }, [rawRes.data]);
  return (
    <div>
      <PageHeader title="Complaints: Supplier" sub="Warranty Claims — Raw Materials" />
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">Warranty Claims (Raw Materials) Form</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 transition font-medium">View Warranty Claims →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Raw Material</label>
            <select className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
              <option>Select Raw Material</option>
              {materialOptions.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Vendor Name</label>
            <input className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Serial No. (if any)</label>
            <input className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date Purchased</label>
            <input type="date" className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date of Complaint</label>
            <input type="date" className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Issue Description</label>
            <textarea rows={4} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none" />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2">
          <button className="px-5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition border border-red-200">Reset</button>
          <PrimaryBtn>Claim Warranty</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

export function DistributorsPage() {
  const [q, setQ] = useState("");
  const distRes = useAsyncData(() => listDistributors({}), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeId, setActiveId] = useState<string>("");
  const [form, setForm] = useState<{ name: string; email: string; mobile: string; address: string }>({
    name: "",
    email: "",
    mobile: "",
    address: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setModalMode("create");
    setActiveId("");
    setForm({ name: "", email: "", mobile: "", address: "" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(d: { id: string; name: string; email: string; mobile: string; address: string }) {
    setModalMode("edit");
    setActiveId(d.id);
    setForm({ name: d.name || "", email: d.email || "", mobile: d.mobile || "", address: d.address || "" });
    setFormError("");
    setModalOpen(true);
  }

  async function onSave() {
    const name = form.name.trim();
    const email = form.email.trim();
    const mobile = form.mobile.trim();
    const address = form.address.trim();
    if (!name || !email || !mobile || !address) {
      setFormError("All fields are required.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modalMode === "create") {
        await createDistributor({ name, email, mobile, address });
      } else {
        if (!activeId) throw new Error("No distributor selected");
        await updateDistributor(activeId, { name, email, mobile, address });
      }
      distRes.reload();
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(d: { id: string; name: string }) {
    const ok = window.confirm(`Delete distributor “${d.name}”?`);
    if (!ok) return;
    try {
      await deleteDistributor(d.id);
      distRes.reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  }

  const filtered = useMemo(() => {
    const all = distRes.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter((d) => d.name.toLowerCase().includes(query));
  }, [distRes.data, q]);

  const activeCount = distRes.data?.length ?? 0;
  const unitsSoldTotal = useMemo(() => (distRes.data ?? []).reduce((s, d) => s + (d.unitsSold || 0), 0), [distRes.data]);
  return (
    <div>
      <PageHeader title="Distributors" sub="Aurawatt Distributors" action={<PrimaryBtn onClick={openCreate}>+ Add Distributor</PrimaryBtn>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-5 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
            <IconUsers size={22} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Active Distributors</div>
            <div className="text-4xl font-black text-blue-600">{activeCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">Registered Partners</div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-5 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <IconPackage size={22} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Stocks Sold</div>
            <div className="text-4xl font-black text-emerald-600">{unitsSoldTotal}</div>
            <div className="text-xs text-gray-400 mt-0.5">Total Units Dispatched</div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <span className="text-sm text-gray-500">{filtered.length} distributors</span>
          <SearchBar value={q} onChange={setQ} />
        </div>
        <Table headers={["Distributor Name", "Mobile No", "Registered Address", "Units Sold", "View", "Manage"]}>
          {distRes.loading ? (
            <TR>
              <TD colSpan={6} className="text-center text-gray-400 py-8">Loading…</TD>
            </TR>
          ) : distRes.error ? (
            <TR>
              <TD colSpan={6} className="text-center text-red-500 py-8">{distRes.error}</TD>
            </TR>
          ) : null}
          {filtered.map((d, i) => (
            <TR key={i} zebra={i % 2 === 1}>
              <TD>
                <div className="font-semibold text-gray-900">{d.name}</div>
                <div className="text-xs text-gray-400">{d.email}</div>
              </TD>
              <TD className="font-mono text-xs text-gray-500">{d.mobile}</TD>
              <TD className="text-xs text-gray-500 max-w-xs">{d.address}</TD>
              <TD>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">{d.unitsSold} Units</span>
              </TD>
              <TD>
                <button className="w-7 h-7 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center border border-sky-200" type="button">
                  <IconEye size={14} />
                </button>
              </TD>
              <TD>
                <ActionBtns small onEdit={() => openEdit(d)} onDelete={() => onRemove(d)} />
              </TD>
            </TR>
          ))}
        </Table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {modalMode === "create" ? "Add Distributor" : "Edit Distributor"}
                </div>
                <div className="text-xs text-gray-500">
                  {modalMode === "create" ? "Register a new distributor" : "Update distributor details"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Distributor name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mobile</label>
                  <input
                    value={form.mobile}
                    onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="City, State"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>
              {formError && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onSave}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-md shadow-amber-200 ${
                  saving
                    ? "bg-amber-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400"
                }`}
              >
                {saving ? "Saving…" : modalMode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
