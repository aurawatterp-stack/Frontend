"use client";

import { useEffect, useMemo, useState } from "react";
import { DonutChart, LineChart } from "./charts";
import { ActionBtns, Badge, PageHeader, PrimaryBtn, roleBadge, SearchBar, Table, TD, TR } from "./ui";
import type { Customer, Manufactured, Product, RawMaterial, UserSafe } from "../../lib/imsApi";
import {
  IconChevronRight,
  IconCog,
  IconEye,
  IconPackage,
  IconPlus,
  IconRotateCcw,
  IconSearch,
  IconShoppingCart,
  IconUsers,
  IconX,
  IconPencil,
} from "../icons/Icons";
import {
  createProduct,
  createDistributor,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  deleteDistributor,
  deleteProduct,
  getComplaintStats,
  getDashboardStats,
  getDashboardTimeline,
  listCustomers,
  listDistributors,
  listManufactured,
  createManufactured,
  updateManufactured,
  markManufacturedReturn,
  listProducts,
  listRawMaterials,
  listSales,
  createSale,
  listSerials,
  listPendingRegistrations,
  approvePendingRegistration,
  updateUser,
  deleteUser,
  listUsers,
  updateDistributor,
  updateProduct,
  createComplaint,
  updateComplaintStatus,
  listComplaints,
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
  const displayName =
    user?.role === "Admin"
      ? (process.env.NEXT_PUBLIC_ADMIN_DISPLAY_NAME || "").trim() || "Admin"
      : (user?.name ?? "");
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
      <PageHeader title="Dashboard" sub={`Welcome back, ${displayName}`} />
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

export function UsersPage({ currentUser }: { currentUser?: { id?: string } | null }) {
  const [q, setQ] = useState("");
  const [authorizeOpen, setAuthorizeOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [authorizeError, setAuthorizeError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserSafe | null>(null);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    mobile: string;
    role: string;
    isActive: boolean;
    password: string;
    confirm: string;
  }>({
    name: "",
    mobile: "",
    role: "",
    isActive: true,
    password: "",
    confirm: "",
  });
  const usersRes = useAsyncData(listUsers, []);
  const pendingRes = useAsyncData(listPendingRegistrations, []);
  const filtered = useMemo(() => {
    const all = usersRes.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter((u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
  }, [usersRes.data, q]);

  const closeAuthorize = () => {
    setAuthorizeOpen(false);
    setAuthorizeError("");
    setApprovingId(null);
  };

  useEffect(() => {
    if (authorizeOpen) pendingRes.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorizeOpen]);

  const handleApprove = async (id: string) => {
    setAuthorizeError("");
    setApprovingId(id);
    try {
      await approvePendingRegistration(id);
      pendingRes.reload();
      usersRes.reload();
    } catch (err) {
      setAuthorizeError(err instanceof Error ? err.message : "Failed to authorize user.");
    } finally {
      setApprovingId(null);
    }
  };

  const roleOptions = ["Admin", "Inventory Manager", "Sales Manager", "Distributor"];

  const openEditUser = (u: UserSafe) => {
    setEditUser(u);
    setEditError("");
    setEditForm({
      name: u.name ?? "",
      mobile: u.mobile ?? "",
      role: u.role ?? "",
      isActive: u.isActive !== false,
      password: "",
      confirm: "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditUser(null);
    setEditError("");
    setSavingEdit(false);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    const name = editForm.name.trim();
    const mobile = editForm.mobile.trim();
    const role = editForm.role.trim();
    const password = editForm.password;
    const confirm = editForm.confirm;

    if (!name || !mobile || !role) {
      setEditError("Name, mobile and role are required.");
      return;
    }
    if (password) {
      if (password.length < 8) {
        setEditError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setEditError("Passwords do not match.");
        return;
      }
    }

    setSavingEdit(true);
    setEditError("");
    try {
      await updateUser(editUser.id, {
        name,
        mobile,
        role,
        isActive: editForm.isActive,
        password: password ? password : undefined,
      });
      usersRes.reload();
      closeEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setSavingEdit(false);
    }
  };

  const removeUser = async (u: UserSafe) => {
    if (currentUser?.id && u.id === currentUser.id) {
      window.alert("You cannot delete your own account while logged in.");
      return;
    }
    const ok = window.confirm(`Delete user “${u.email}”?`);
    if (!ok) return;
    try {
      await deleteUser(u.id);
      usersRes.reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete user.");
    }
  };

  return (
    <div>
      <PageHeader
        title="User Profiles"
        sub="Manage system access and roles"
        action={<PrimaryBtn onClick={() => setAuthorizeOpen(true)}>+ Authorize New User</PrimaryBtn>}
      />

      {authorizeOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close authorize user modal"
            className="absolute inset-0 bg-black/40"
            onClick={closeAuthorize}
          />
          <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-extrabold text-gray-900">Authorize New Users</div>
                <div className="text-xs text-gray-500 mt-0.5">Approve pending registration requests.</div>
              </div>
              <button
                type="button"
                onClick={closeAuthorize}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center"
                aria-label="Close"
              >
                <IconX size={16} />
              </button>
            </div>

            {authorizeError && (
              <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {authorizeError}
              </div>
            )}

            <div className="px-5 py-4">
              <Table headers={["User e-Mail ID", "User Name", "Mobile No", "Requested Role", "Requested On", "Action"]}>
                {pendingRes.loading ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-gray-400 py-10">Loading…</TD>
                  </TR>
                ) : pendingRes.error ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-red-500 py-10">{pendingRes.error}</TD>
                  </TR>
                ) : (pendingRes.data ?? []).length === 0 ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-gray-400 py-10">No pending requests.</TD>
                  </TR>
                ) : (
                  (pendingRes.data ?? []).map((p, i) => (
                    <TR key={p.id} zebra={i % 2 === 1}>
                      <TD className="text-gray-500">{p.email}</TD>
                      <TD className="font-medium text-gray-900">{p.name}</TD>
                      <TD className="text-gray-500 font-mono text-xs">{p.mobile}</TD>
                      <TD>{roleBadge(p.role)}</TD>
                      <TD className="text-gray-500 text-xs whitespace-nowrap">
                        {new Date(p.submittedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" })}
                      </TD>
                      <TD>
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleApprove(p.id)}
                            disabled={approvingId === p.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                              approvingId === p.id
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            }`}
                          >
                            {approvingId === p.id ? "Approving..." : "Approve"}
                          </button>
                        </div>
                      </TD>
                    </TR>
                  ))
                )}
              </Table>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={closeAuthorize}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editOpen && editUser && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold text-gray-900">Edit User</div>
                <div className="text-xs text-gray-500">Update user role and access.</div>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    value={editUser.email}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mobile</label>
                  <input
                    value={editForm.mobile}
                    onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))}
                    placeholder="Mobile number"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">Select role…</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-amber-500"
                    />
                    Active
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reset Password (optional)</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={editForm.confirm}
                    onChange={(e) => setEditForm((f) => ({ ...f, confirm: e.target.value }))}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>
              {editError && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {editError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={saveEdit}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-md shadow-amber-200 ${
                  savingEdit
                    ? "bg-amber-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400"
                }`}
              >
                {savingEdit ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <TD>
                <ActionBtns
                  onEdit={() => openEditUser(u)}
                  onDelete={() => removeUser(u)}
                />
              </TD>
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<{
    name: string;
    type: string;
    email: string;
    phone: string;
    status: string;
    address: string;
  }>({
    name: "",
    type: "",
    email: "",
    phone: "",
    status: "Active",
    address: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const typeOptions = ["Distributor", "Individual"];
  const statusOptions = ["Active", "Inactive"];

  function openCreate() {
    setModalMode("create");
    setActiveCustomer(null);
    setForm({ name: "", type: "", email: "", phone: "", status: "Active", address: "" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(customer: Customer) {
    setModalMode("edit");
    setActiveCustomer(customer);
    setForm({
      name: customer.name ?? "",
      type: customer.type ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      status: customer.status ?? "Active",
      address: customer.address ?? "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function onSave() {
    const name = form.name.trim();
    const type = form.type.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const status = form.status.trim();
    const address = form.address.trim();

    if (!name || !type || !email || !phone) {
      setFormError("Name, type, email and phone are required.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modalMode === "create") {
        await createCustomer({ name, type, email, phone, address: address || undefined });
      } else {
        if (!activeCustomer) throw new Error("No customer selected");
        await updateCustomer(activeCustomer.id, { name, type, email, phone, status, address: address || undefined });
      }
      customersRes.reload();
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(customer: Customer) {
    const ok = window.confirm(`Delete customer “${customer.name}”?`);
    if (!ok) return;
    try {
      await deleteCustomer(customer.id);
      customersRes.reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  }

  const filtered = useMemo(() => {
    const all = customersRes.data?.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter((c) => {
      return (
        c.name.toLowerCase().includes(query) ||
        (c.email ?? "").toLowerCase().includes(query) ||
        (c.phone ?? "").toLowerCase().includes(query)
      );
    });
  }, [customersRes.data, q]);
  return (
    <div>
      <PageHeader
        title="Manage Customers"
        sub="Customer Directory"
        action={<PrimaryBtn onClick={openCreate}>+ Add New Customer</PrimaryBtn>}
      />
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
              <TD>
                <Badge color={c.status === "Active" ? "green" : "gray"}>{c.status}</Badge>
              </TD>
              <TD>
                <ActionBtns onEdit={() => openEdit(c)} onDelete={() => onRemove(c)} />
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
                  {modalMode === "create" ? "Add New Customer" : "Edit Customer"}
                </div>
                <div className="text-xs text-gray-500">
                  {modalMode === "create" ? "Create a new customer record" : `Update ${activeCustomer?.name ?? ""}`}
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
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Customer / Company name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">Select type…</option>
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address (optional)</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    rows={3}
                    placeholder="Address..."
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
  const productsRes = useAsyncData(() => listProducts({}), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeRaw, setActiveRaw] = useState<RawMaterial | null>(null);
  const [form, setForm] = useState<{
    productSeriesId: string;
    materialName: string;
    dateReceived: string;
    billType: string;
    referenceNo: string;
    quantityReceived: string;
    quantityAvailable: string;
    vendorName: string;
    batch: string;
    notes: string;
  }>({
    productSeriesId: "",
    materialName: "",
    dateReceived: "",
    billType: "",
    referenceNo: "",
    quantityReceived: "",
    quantityAvailable: "",
    vendorName: "",
    batch: "",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const seriesOptions = useMemo(() => {
    const products = productsRes.data ?? [];
    return [...new Set(products.map((p) => p.series).filter(Boolean))].sort();
  }, [productsRes.data]);

  function openCreate() {
    setModalMode("create");
    setActiveRaw(null);
    setForm({
      productSeriesId: "",
      materialName: "",
      dateReceived: "",
      billType: "",
      referenceNo: "",
      quantityReceived: "",
      quantityAvailable: "",
      vendorName: "",
      batch: "",
      notes: "",
    });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(entry: RawMaterial) {
    setModalMode("edit");
    setActiveRaw(entry);
    setForm({
      productSeriesId: entry.productSeriesId ?? "",
      materialName: entry.materialName ?? "",
      dateReceived: entry.dateReceived ? String(entry.dateReceived).slice(0, 10) : "",
      billType: entry.billType ?? "",
      referenceNo: entry.referenceNo ?? "",
      quantityReceived: String(entry.quantityReceived ?? ""),
      quantityAvailable: String(entry.quantityAvailable ?? ""),
      vendorName: entry.vendorName ?? "",
      batch: entry.batch ?? "",
      notes: entry.notes ?? "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function onSave() {
    const productSeriesId = form.productSeriesId.trim();
    const materialName = form.materialName.trim();
    const dateReceived = form.dateReceived.trim();
    const billType = form.billType.trim();
    const referenceNo = form.referenceNo.trim();
    const vendorName = form.vendorName.trim();
    const batch = form.batch.trim();
    const notes = form.notes.trim();

    const quantityReceived = Number(form.quantityReceived);
    const quantityAvailable = Number(form.quantityAvailable);

    if (!productSeriesId || !materialName || !dateReceived || !billType || !referenceNo || !vendorName || !batch) {
      setFormError("Please fill all required fields.");
      return;
    }
    if (!Number.isFinite(quantityReceived) || quantityReceived <= 0) {
      setFormError("Quantity received must be a positive number.");
      return;
    }
    if (modalMode === "edit") {
      if (!Number.isFinite(quantityAvailable) || quantityAvailable < 0) {
        setFormError("Quantity available must be 0 or more.");
        return;
      }
    }

    setSaving(true);
    setFormError("");
    try {
      if (modalMode === "create") {
        await createRawMaterial({
          productSeriesId,
          materialName,
          dateReceived,
          billType,
          referenceNo,
          quantityReceived,
          vendorName,
          batch,
          notes: notes || undefined,
        });
      } else {
        if (!activeRaw) throw new Error("No entry selected");
        await updateRawMaterial(activeRaw.id, {
          productSeriesId,
          materialName,
          dateReceived,
          billType,
          referenceNo,
          quantityReceived,
          quantityAvailable,
          vendorName,
          batch,
          notes: notes || undefined,
        });
      }

      rawRes.reload();
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(entry: RawMaterial) {
    const ok = window.confirm(`Delete raw material “${entry.materialName}” (${entry.referenceNo})?`);
    if (!ok) return;
    try {
      await deleteRawMaterial(entry.id);
      rawRes.reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  }

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
          <PageHeader title="Raw Materials Inventory" action={<PrimaryBtn onClick={openCreate}>+ Add Raw Materials</PrimaryBtn>} />
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
                <ActionBtns small onEdit={() => openEdit(r)} onDelete={() => onRemove(r)} />
              </TD>
            </TR>
          ))}
        </Table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {modalMode === "create" ? "Add Raw Material" : "Edit Raw Material"}
                </div>
                <div className="text-xs text-gray-500">
                  {modalMode === "create"
                    ? "Create a new raw material inventory entry"
                    : `Update ${activeRaw?.materialName ?? ""}`}
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
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Product Series <span className="text-red-500">*</span>
                  </label>
                  <input
                    list="raw-series-options"
                    value={form.productSeriesId}
                    onChange={(e) => setForm((f) => ({ ...f, productSeriesId: e.target.value }))}
                    placeholder="Select or type series..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                  <datalist id="raw-series-options">
                    {seriesOptions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  {productsRes.loading ? (
                    <div className="mt-1 text-[11px] text-gray-400">Loading series options…</div>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Material Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.materialName}
                    onChange={(e) => setForm((f) => ({ ...f, materialName: e.target.value }))}
                    placeholder="e.g. PCB / Heat Sink / Wire"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Date Received <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.dateReceived}
                    onChange={(e) => setForm((f) => ({ ...f, dateReceived: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Bill Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.billType}
                    onChange={(e) => setForm((f) => ({ ...f, billType: e.target.value }))}
                    placeholder="e.g. Tax Invoice"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Ref. No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.referenceNo}
                    onChange={(e) => setForm((f) => ({ ...f, referenceNo: e.target.value }))}
                    placeholder="Reference / Invoice no."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Qty Received <span className="text-red-500">*</span>
                  </label>
                  <input
                    inputMode="numeric"
                    value={form.quantityReceived}
                    onChange={(e) => setForm((f) => ({ ...f, quantityReceived: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Qty Available {modalMode === "edit" ? <span className="text-red-500">*</span> : null}
                  </label>
                  <input
                    inputMode="numeric"
                    value={form.quantityAvailable}
                    onChange={(e) => setForm((f) => ({ ...f, quantityAvailable: e.target.value }))}
                    placeholder={modalMode === "create" ? "Auto" : "0"}
                    disabled={modalMode === "create"}
                    className={`w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono ${
                      modalMode === "create" ? "bg-gray-50 text-gray-500" : "bg-white text-gray-800"
                    }`}
                  />
                  {modalMode === "create" ? (
                    <div className="mt-1 text-[11px] text-gray-400">On create, available = received.</div>
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.vendorName}
                    onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))}
                    placeholder="Vendor name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.batch}
                    onChange={(e) => setForm((f) => ({ ...f, batch: e.target.value }))}
                    placeholder="Batch id"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Any extra notes..."
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

export function ManufacturedPage() {
  const [q, setQ] = useState("");
  const manufacturedRes = useAsyncData(() => listManufactured({}), []);
  const productsRes = useAsyncData(() => listProducts({}), []);
  const customersRes = useAsyncData(() => listCustomers({ page: 1, limit: 200 }), []);

  const [filtersDraft, setFiltersDraft] = useState<{
    fromDate: string;
    toDate: string;
    customerId: string;
    series: string;
    model: string;
    returnReason: string;
  }>({ fromDate: "", toDate: "", customerId: "", series: "", model: "", returnReason: "" });
  const [filters, setFilters] = useState(filtersDraft);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [active, setActive] = useState<Manufactured | null>(null);
  const [form, setForm] = useState<{
    productId: string;
    serialNumber: string;
    mfgDate: string;
    status: string;
    invoiceNo: string;
    paymentStatus: string;
  }>({
    productId: "",
    serialNumber: "",
    mfgDate: "",
    status: "In Stock",
    invoiceNo: "",
    paymentStatus: "N/A",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const productByModel = useMemo(() => {
    const products = productsRes.data ?? [];
    return new Map(products.map((p) => [p.model, p]));
  }, [productsRes.data]);

  const seriesOptions = useMemo(() => {
    const products = productsRes.data ?? [];
    return [...new Set(products.map((p) => p.series).filter(Boolean))].sort();
  }, [productsRes.data]);

  const modelOptions = useMemo(() => {
    const products = productsRes.data ?? [];
    if (!filtersDraft.series) return products.map((p) => p.model).filter(Boolean).sort();
    return products.filter((p) => p.series === filtersDraft.series).map((p) => p.model).filter(Boolean).sort();
  }, [productsRes.data, filtersDraft.series]);

  const returnReasonOptions = useMemo(() => {
    const rows = manufacturedRes.data?.data ?? [];
    const reasons = rows.map((m) => (m.returnReason ?? "").trim()).filter(Boolean);
    return [...new Set(reasons)].sort();
  }, [manufacturedRes.data]);

  const filtered = useMemo(() => {
    const rows = manufacturedRes.data?.data ?? [];
    const query = q.trim().toLowerCase();
    const { fromDate, toDate, customerId, series, model, returnReason } = filters;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);

    return rows.filter((m) => {
      if (query) {
        const hay = `${m.serialNumber} ${m.productId} ${m.invoiceNo ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      if (model && m.productId !== model) return false;
      if (series) {
        const s = productByModel.get(m.productId)?.series;
        if (s !== series) return false;
      }
      if (customerId && (m.customerId ?? "") !== customerId) return false;
      if (returnReason && (m.returnReason ?? "") !== returnReason) return false;

      if (from || to) {
        const d = new Date(m.mfgDate);
        if (Number.isNaN(d.getTime())) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
      }

      return true;
    });
  }, [manufacturedRes.data, q, filters, productByModel]);

  function openCreate() {
    setModalMode("create");
    setActive(null);
    setForm({ productId: "", serialNumber: "", mfgDate: "", status: "In Stock", invoiceNo: "", paymentStatus: "N/A" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(m: Manufactured) {
    setModalMode("edit");
    setActive(m);
    setForm({
      productId: m.productId ?? "",
      serialNumber: m.serialNumber ?? "",
      mfgDate: m.mfgDate ? String(m.mfgDate).slice(0, 10) : "",
      status: m.status ?? "In Stock",
      invoiceNo: m.invoiceNo ?? "",
      paymentStatus: m.paymentStatus ?? "N/A",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function onSave() {
    const productId = form.productId.trim();
    const serialNumber = form.serialNumber.trim();
    const mfgDate = form.mfgDate.trim();

    if (!productId || !serialNumber || !mfgDate) {
      setFormError("Product model, serial number and mfg date are required.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modalMode === "create") {
        await createManufactured({
          productId,
          serialNumber,
          mfgDate,
          status: form.status || undefined,
          invoiceNo: form.invoiceNo ? form.invoiceNo : undefined,
          paymentStatus: form.paymentStatus || undefined,
        });
      } else {
        if (!active) throw new Error("No record selected");
        await updateManufactured(active.id, {
          productId,
          serialNumber,
          mfgDate,
          status: form.status,
          invoiceNo: form.invoiceNo ? form.invoiceNo : undefined,
          paymentStatus: form.paymentStatus,
        });
      }
      manufacturedRes.reload();
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function onReturn(m: Manufactured) {
    const reason = window.prompt("Return reason (optional):", m.returnReason ?? "");
    if (reason === null) return;
    try {
      await markManufacturedReturn(m.id, reason);
      manufacturedRes.reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  }

  const statusOptions = ["In Stock", "Sold", "Returned"];
  const paymentOptions = ["N/A", "Pending", "Verified"];

  return (
    <div>
      <PageHeader
        title="Manufacturing Registry"
        sub="Production Ledger"
        action={
          <PrimaryBtn onClick={openCreate}>
            <IconPlus size={16} /> Record New Production
          </PrimaryBtn>
        }
      />
      <div className="rounded-2xl bg-white border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={filtersDraft.fromDate}
              onChange={(e) => setFiltersDraft((f) => ({ ...f, fromDate: e.target.value }))}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-amber-400 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={filtersDraft.toDate}
              onChange={(e) => setFiltersDraft((f) => ({ ...f, toDate: e.target.value }))}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-amber-400 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Customer</label>
            <select
              value={filtersDraft.customerId}
              onChange={(e) => setFiltersDraft((f) => ({ ...f, customerId: e.target.value }))}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-amber-400 shadow-sm"
            >
              <option value="">All Customers</option>
              {(customersRes.data?.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Series</label>
            <select
              value={filtersDraft.series}
              onChange={(e) =>
                setFiltersDraft((f) => ({
                  ...f,
                  series: e.target.value,
                  model: f.model && productByModel.get(f.model)?.series === e.target.value ? f.model : "",
                }))
              }
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-amber-400 shadow-sm"
            >
              <option value="">All Series</option>
              {seriesOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Model</label>
            <select
              value={filtersDraft.model}
              onChange={(e) => setFiltersDraft((f) => ({ ...f, model: e.target.value }))}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-amber-400 shadow-sm"
            >
              <option value="">All Models</option>
              {modelOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Return Reason</label>
            <select
              value={filtersDraft.returnReason}
              onChange={(e) => setFiltersDraft((f) => ({ ...f, returnReason: e.target.value }))}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-amber-400 shadow-sm"
            >
              <option value="">All Return Reasons</option>
              {returnReasonOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => setFilters(filtersDraft)}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition flex items-center gap-1.5"
          >
            <IconSearch size={14} /> Search
          </button>
          <button
            type="button"
            onClick={() => {
              const cleared = { fromDate: "", toDate: "", customerId: "", series: "", model: "", returnReason: "" };
              setFiltersDraft(cleared);
              setFilters(cleared);
            }}
            className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition border border-gray-200 flex items-center gap-1.5"
          >
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
              <TD>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-xs whitespace-nowrap">
                  {productByModel.get(m.productId)?.series ?? "—"}
                </span>
              </TD>
              <TD className="font-mono font-semibold text-amber-700 whitespace-nowrap">{m.productId}</TD>
              <TD className="font-mono text-xs text-gray-700">{m.serialNumber}</TD>
              <TD className="text-gray-500 text-xs whitespace-nowrap">{new Date(m.mfgDate).toLocaleDateString()}</TD>
              <TD>
                {m.status === "Sold" ? (
                  <Badge color="green">Sold</Badge>
                ) : m.status === "Returned" ? (
                  <Badge color="red">Returned</Badge>
                ) : (
                  <Badge color="blue">In Stock</Badge>
                )}
              </TD>
              <TD className="text-xs text-gray-700">{m.invoiceNo || "—"}</TD>
              <TD>{m.paymentStatus === "N/A" ? <span className="text-gray-300">—</span> : m.paymentStatus === "Pending" ? <Badge color="red">Pending</Badge> : <Badge color="green">Verified</Badge>}</TD>
              <TD className="text-xs text-gray-500">{m.returnReason ? m.returnReason : "—"}</TD>
              <TD>
                <div className="flex gap-1 items-center justify-center">
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    className="w-7 h-7 rounded border border-amber-200 bg-amber-100 text-amber-600 hover:bg-amber-200 transition flex items-center justify-center"
                    title="Edit"
                  >
                    <IconPencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReturn(m)}
                    className="w-7 h-7 rounded border border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center"
                    title="Mark Returned"
                    disabled={m.status === "Returned"}
                  >
                    <IconRotateCcw size={14} />
                  </button>
                </div>
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
                  {modalMode === "create" ? "Record New Production" : "Edit Manufactured Record"}
                </div>
                <div className="text-xs text-gray-500">
                  {modalMode === "create" ? "Add a manufactured product to inventory." : `Update ${active?.serialNumber ?? ""}`}
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
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Model *</label>
                  <input
                    list="manufactured-model-options"
                    value={form.productId}
                    onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                    placeholder="Select or type model…"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                  <datalist id="manufactured-model-options">
                    {(productsRes.data ?? []).map((p) => (
                      <option key={p.id} value={p.model} />
                    ))}
                  </datalist>
                  <div className="mt-1 text-[11px] text-gray-400">
                    You can type a new model not in the list.
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Serial Number *</label>
                  <input
                    value={form.serialNumber}
                    onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                    placeholder="e.g. AWSP3000-0001"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mfg Date *</label>
                  <input
                    type="date"
                    value={form.mfgDate}
                    onChange={(e) => setForm((f) => ({ ...f, mfgDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Payment</label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                    {paymentOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Invoice No. (optional)</label>
                  <input
                    value={form.invoiceNo}
                    onChange={(e) => setForm((f) => ({ ...f, invoiceNo: e.target.value }))}
                    placeholder="e.g. INV-2026-0001"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                  />
                  <div className="mt-1 text-[11px] text-gray-400">Tip: Normally invoice/payment are updated when sale is recorded, but you can fill them here too.</div>
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

export function SalesPage() {
  const manufacturedRes = useAsyncData(() => listManufactured({ status: "In Stock" }), []);
  const customersRes = useAsyncData(() => listCustomers({ page: 1, limit: 500 }), []);
  const salesRes = useAsyncData(() => listSales({ page: 1, limit: 50 }), []);

  const manufacturedBySerial = useMemo(() => {
    const rows = manufacturedRes.data?.data ?? [];
    return new Map(rows.map((m) => [m.serialNumber, m]));
  }, [manufacturedRes.data]);

  const [serialNumber, setSerialNumber] = useState("");
  const [docType, setDocType] = useState("Tax Invoice");
  const [referenceNo, setReferenceNo] = useState("INV-2024-XXXX");
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [customerId, setCustomerId] = useState("");
  const [custType, setCustType] = useState<"Individual" | "Distributor" | "">("");
  const [custEmail, setCustEmail] = useState("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formOk, setFormOk] = useState("");
  const [salesModalOpen, setSalesModalOpen] = useState(false);

  const customerById = useMemo(() => {
    const rows = customersRes.data?.data ?? [];
    return new Map(rows.map((c) => [c.id, c]));
  }, [customersRes.data]);

  const clearForm = () => {
    setSerialNumber("");
    setDocType("Tax Invoice");
    setReferenceNo("INV-2024-XXXX");
    setSaleDate(new Date().toISOString().slice(0, 10));
    setCustomerId("");
    setCustType("");
    setCustEmail("");
    setCustName("");
    setCustPhone("");
    setCustAddress("");
    setFormError("");
    setFormOk("");
  };

  const handleSubmit = async () => {
    setFormError("");
    setFormOk("");

    const serial = serialNumber.trim();
    const documentType = docType.trim();
    const reference = referenceNo.trim();
    const date = saleDate.trim();

    if (!serial || !documentType || !reference || !date) {
      setFormError("Serial number, document type, reference no. and sale date are required.");
      return;
    }

    const mfg = manufacturedBySerial.get(serial);
    if (!mfg) {
      setFormError("Serial number not found in manufactured products (In Stock).");
      return;
    }

    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      const email = custEmail.trim().toLowerCase();
      const name = custName.trim();
      const phone = custPhone.trim();
      const type = custType;
      const address = custAddress.trim();

      const existing = (customersRes.data?.data ?? []).find((c) => c.email.toLowerCase() === email);
      if (existing) {
        resolvedCustomerId = existing.id;
      } else {
        if (!email || !name || !phone || !type) {
          setFormError("Select a customer or fill customer type, email, name and phone to create a new customer.");
          return;
        }
        try {
          const created = await createCustomer({ name, type, email, phone, address: address || undefined });
          resolvedCustomerId = created.id;
          customersRes.reload();
        } catch (err) {
          setFormError(err instanceof Error ? err.message : "Failed to create customer.");
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      await createSale({
        serialNumber: serial,
        documentType,
        referenceNo: reference,
        saleDate: date,
        customerId: resolvedCustomerId,
      });
      setFormOk("Sale recorded successfully.");
      manufacturedRes.reload();
      salesRes.reload();
      clearForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to record sale.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Sales Data Entry" sub="Customer and Product Details" />
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <IconShoppingCart size={18} /> New Sales Transaction
          </h3>
          <button
            type="button"
            onClick={() => setSalesModalOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-700 transition font-medium flex items-center gap-1"
          >
            View Sales Data <IconChevronRight size={16} />
          </button>
        </div>
        <div className="mb-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Transaction Details</div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Product Serial No.</label>
              <input
                list="sale-serial-options"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Search or type serial..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
              />
              <datalist id="sale-serial-options">
                {(manufacturedRes.data?.data ?? []).map((m) => (
                  <option key={m.id} value={m.serialNumber} />
                ))}
              </datalist>
              <div className="mt-1 text-[11px] text-gray-400">
                {manufacturedRes.loading ? "Loading serials…" : `${(manufacturedRes.data?.data ?? []).length} in-stock serials`}
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
              <input
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sales Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Information</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer (existing)</label>
              <select
                value={customerId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setCustomerId(nextId);
                  setFormError("");
                  setFormOk("");
                  if (!nextId) return;
                  const c = customerById.get(nextId);
                  if (!c) return;
                  setCustType(c.type === "Distributor" || c.type === "Individual" ? c.type : "");
                  setCustEmail(c.email || "");
                  setCustName(c.name || "");
                  setCustPhone(c.phone || "");
                  setCustAddress(c.address || "");
                }}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">Select customer…</option>
                {(customersRes.data?.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-gray-400">
                Leave empty to create a new customer from the fields below.
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer Email</label>
              <input
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer Name</label>
              <input
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Contact Number</label>
              <input
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Complete Address</label>
            <textarea
              rows={3}
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Customer Type</label>
            <select
              value={custType}
              onChange={(e) => {
                const v = e.target.value;
                setCustType(v === "Individual" || v === "Distributor" ? v : "");
              }}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            >
              <option value="">Select Type...</option>
              <option>Individual</option>
              <option>Distributor</option>
            </select>
            <div className="mt-1 text-[11px] text-gray-400">
              Used only when creating a new customer.
            </div>
          </div>
          <div className="flex items-end">
            {formError ? (
              <div className="w-full text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </div>
            ) : formOk ? (
              <div className="w-full text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {formOk}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
          <button
            type="button"
            onClick={clearForm}
            className="px-5 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition"
          >
            Clear Form
          </button>
          <PrimaryBtn onClick={handleSubmit}>
            {submitting ? "Recording..." : "Confirm & Record Sale"}
          </PrimaryBtn>
        </div>
      </div>

      {salesModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold text-gray-900">Sales Data</div>
                <div className="text-xs text-gray-500">Recent sales entries.</div>
              </div>
              <button
                type="button"
                onClick={() => setSalesModalOpen(false)}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <Table headers={["#", "Serial", "Doc Type", "Ref No.", "Sale Date", "Customer"]}>
                {salesRes.loading ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-gray-400 py-10">Loading…</TD>
                  </TR>
                ) : salesRes.error ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-red-500 py-10">{salesRes.error}</TD>
                  </TR>
                ) : (salesRes.data?.data ?? []).length === 0 ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-gray-400 py-10">No sales found.</TD>
                  </TR>
                ) : (
                  (salesRes.data?.data ?? []).map((s, i) => (
                    <TR key={s.id} zebra={i % 2 === 1}>
                      <TD className="text-gray-400">{i + 1}</TD>
                      <TD className="font-mono text-xs text-gray-800">{s.serialNumber}</TD>
                      <TD><Badge color="blue">{s.documentType}</Badge></TD>
                      <TD className="font-mono text-xs text-gray-700">{s.referenceNo}</TD>
                      <TD className="text-gray-500 text-xs whitespace-nowrap">{new Date(s.saleDate).toLocaleDateString()}</TD>
                      <TD className="text-gray-700 text-sm">
                        {customerById.get(s.customerId)?.name ?? s.customerId}
                      </TD>
                    </TR>
                  ))
                )}
              </Table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  salesRes.reload();
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setSalesModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ComplaintsConsumerPage() {
  const manufacturedRes = useAsyncData(() => listManufactured({}), []);
  const productsRes = useAsyncData(() => listProducts({}), []);
  const complaintsRes = useAsyncData(() => listComplaints({ type: "Consumer" }), []);

  const productByModel = useMemo(() => {
    const products = productsRes.data ?? [];
    return new Map(products.map((p) => [p.model, p]));
  }, [productsRes.data]);

  const [serialNumber, setSerialNumber] = useState("");
  const [dateOfSale, setDateOfSale] = useState("");
  const [dateOfComplaint, setDateOfComplaint] = useState(() => new Date().toISOString().slice(0, 10));
  const [issueDescription, setIssueDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [formOk, setFormOk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const selectedManufactured = useMemo(() => {
    const rows = manufacturedRes.data?.data ?? [];
    return rows.find((m) => m.serialNumber === serialNumber) ?? null;
  }, [manufacturedRes.data, serialNumber]);

  const autoModel = selectedManufactured?.productId ?? "";
  const autoType = productByModel.get(autoModel)?.series ?? "";

  const complaintStatusBadge = (status: string) => {
    if (status === "Open at Aurawatt") return <Badge color="red">{status}</Badge>;
    if (status === "In Progress at Aurawatt") return <Badge color="orange">{status}</Badge>;
    if (status === "Resolved by Aurawatt") return <Badge color="green">{status}</Badge>;
    if (status === "Pending with Suppliers") return <Badge color="yellow">{status}</Badge>;
    if (status === "Resolved by Suppliers") return <Badge color="green">{status}</Badge>;
    return <Badge color="gray">{status}</Badge>;
  };

  const clearForm = () => {
    setSerialNumber("");
    setDateOfSale("");
    setDateOfComplaint(new Date().toISOString().slice(0, 10));
    setIssueDescription("");
    setFormError("");
    setFormOk("");
  };

  const onSelectSerial = (next: string) => {
    setSerialNumber(next);
    setFormError("");
    setFormOk("");
    const rows = manufacturedRes.data?.data ?? [];
    const m = rows.find((r) => r.serialNumber === next);
    if (!m) return;
    // If sold date is available, auto-fill date of sale
    if (m.soldDate) {
      const d = String(m.soldDate).slice(0, 10);
      setDateOfSale(d);
    }
  };

  const submitComplaint = async () => {
    setFormError("");
    setFormOk("");
    const serial = serialNumber.trim();
    const complaintDate = dateOfComplaint.trim();
    const description = issueDescription.trim();
    const saleDate = dateOfSale.trim();

    if (!serial) {
      setFormError("Product serial number is required.");
      return;
    }
    if (!complaintDate || !description) {
      setFormError("Date of complaint and issue description are required.");
      return;
    }

    const m = selectedManufactured;
    if (!m) {
      setFormError("Serial number not found in manufactured products.");
      return;
    }

    setSubmitting(true);
    try {
      await createComplaint({
        type: "Consumer",
        productSerialNo: serial,
        dateOfSale: saleDate || undefined,
        dateOfComplaint: complaintDate,
        issueDescription: description,
      });
      setFormOk("Complaint raised successfully.");
      complaintsRes.reload();
      clearForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to raise complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Complaints: Consumer" sub="Warranty Claims — After Sales Service" />
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">Warranty Claims: After Sales Service</h3>
          <button
            type="button"
            onClick={() => setListOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-700 transition font-medium"
          >
            View Complaints →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Product Serial No.</label>
            <input
              list="consumer-complaint-serials"
              value={serialNumber}
              onChange={(e) => onSelectSerial(e.target.value)}
              placeholder="Search or type serial..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
            />
            <datalist id="consumer-complaint-serials">
              {(manufacturedRes.data?.data ?? []).map((m) => (
                <option key={m.id} value={m.serialNumber} />
              ))}
            </datalist>
            <div className="mt-1 text-[11px] text-gray-400">
              {manufacturedRes.loading ? "Loading serials…" : `${(manufacturedRes.data?.data ?? []).length} manufactured serials`}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Product Type</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 text-sm"
              disabled
              value={autoType || ""}
              placeholder="Auto-filled"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Product Model</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 text-sm font-mono"
              disabled
              value={autoModel || ""}
              placeholder="Auto-filled"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date of Sale</label>
            <input
              type="date"
              value={dateOfSale}
              onChange={(e) => setDateOfSale(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date of Complaint</label>
            <input
              type="date"
              value={dateOfComplaint}
              onChange={(e) => setDateOfComplaint(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Issue Description</label>
            <textarea
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            />
          </div>
        </div>
        {formError ? (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </div>
        ) : formOk ? (
          <div className="mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {formOk}
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2">
          <button
            type="button"
            onClick={clearForm}
            className="px-5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition border border-red-200"
          >
            Reset
          </button>
          <PrimaryBtn onClick={submitComplaint}>
            {submitting ? "Submitting..." : "Raise Complaint"}
          </PrimaryBtn>
        </div>
      </div>

      {listOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold text-gray-900">Consumer Complaints</div>
                <div className="text-xs text-gray-500">Latest complaints raised by users.</div>
              </div>
              <button
                type="button"
                onClick={() => setListOpen(false)}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <Table headers={["#", "Serial", "Date", "Issue", "Status", "Action"]}>
                {complaintsRes.loading ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-gray-400 py-10">Loading…</TD>
                  </TR>
                ) : complaintsRes.error ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-red-500 py-10">{complaintsRes.error}</TD>
                  </TR>
                ) : (complaintsRes.data?.data ?? []).length === 0 ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-gray-400 py-10">No complaints found.</TD>
                  </TR>
                ) : (
                  (complaintsRes.data?.data ?? []).map((c, i) => (
                    <TR key={c.id} zebra={i % 2 === 1}>
                      <TD className="text-gray-400">{i + 1}</TD>
                      <TD className="font-mono text-xs text-gray-800">{c.productSerialNo || "—"}</TD>
                      <TD className="text-gray-500 text-xs whitespace-nowrap">
                        {new Date(c.dateOfComplaint).toLocaleDateString()}
                      </TD>
                      <TD className="text-gray-700 text-sm">{c.issueDescription}</TD>
                      <TD>{complaintStatusBadge(c.status)}</TD>
                      <TD>
                        <button
                          type="button"
                          onClick={async () => {
                            const next = window.prompt("Update status:", c.status);
                            if (!next) return;
                            try {
                              await updateComplaintStatus(c.id, next);
                              complaintsRes.reload();
                            } catch (err) {
                              window.alert(err instanceof Error ? err.message : "Failed to update status.");
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                        >
                          Update
                        </button>
                      </TD>
                    </TR>
                  ))
                )}
              </Table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => complaintsRes.reload()}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setListOpen(false)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ComplaintsSupplierPage() {
  const rawRes = useAsyncData(() => listRawMaterials({}), []);
  const complaintsRes = useAsyncData(() => listComplaints({ type: "Supplier" }), []);
  const materialOptions = useMemo(() => {
    const rows = rawRes.data?.data ?? [];
    return [...new Set(rows.map((r) => r.materialName))].filter(Boolean);
  }, [rawRes.data]);

  const materialEntries = useMemo(() => rawRes.data?.data ?? [], [rawRes.data]);
  const materialByName = useMemo(() => {
    const map = new Map<string, RawMaterial>();
    for (const r of materialEntries) {
      if (!map.has(r.materialName)) map.set(r.materialName, r);
    }
    return map;
  }, [materialEntries]);

  const [materialName, setMaterialName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [datePurchased, setDatePurchased] = useState("");
  const [dateOfComplaint, setDateOfComplaint] = useState(() => new Date().toISOString().slice(0, 10));
  const [issueDescription, setIssueDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [formOk, setFormOk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const clearForm = () => {
    setMaterialName("");
    setVendorName("");
    setSerialNo("");
    setDatePurchased("");
    setDateOfComplaint(new Date().toISOString().slice(0, 10));
    setIssueDescription("");
    setFormError("");
    setFormOk("");
  };

  const onPickMaterial = (next: string) => {
    setMaterialName(next);
    setFormError("");
    setFormOk("");
    const entry = materialByName.get(next);
    if (entry && entry.vendorName) setVendorName(entry.vendorName);
  };

  const submitSupplierComplaint = async () => {
    setFormError("");
    setFormOk("");
    const name = materialName.trim();
    const vendor = vendorName.trim();
    const complaintDate = dateOfComplaint.trim();
    const description = issueDescription.trim();
    const purchased = datePurchased.trim();
    const serial = serialNo.trim();

    if (!name) {
      setFormError("Raw material is required.");
      return;
    }
    if (!vendor) {
      setFormError("Vendor name is required.");
      return;
    }
    if (!complaintDate || !description) {
      setFormError("Date of complaint and issue description are required.");
      return;
    }

    const entry = materialByName.get(name);
    setSubmitting(true);
    try {
      await createComplaint({
        type: "Supplier",
        rawMaterialId: entry?.id,
        rawMaterialName: name,
        vendorName: vendor,
        productSerialNo: serial || undefined,
        dateOfSale: purchased || undefined,
        dateOfComplaint: complaintDate,
        issueDescription: description,
      });
      setFormOk("Warranty claim submitted successfully.");
      complaintsRes.reload();
      clearForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit warranty claim.");
    } finally {
      setSubmitting(false);
    }
  };

  const complaintStatusBadge = (status: string) => {
    if (status === "Open at Aurawatt") return <Badge color="red">{status}</Badge>;
    if (status === "In Progress at Aurawatt") return <Badge color="orange">{status}</Badge>;
    if (status === "Resolved by Aurawatt") return <Badge color="green">{status}</Badge>;
    if (status === "Pending with Suppliers") return <Badge color="yellow">{status}</Badge>;
    if (status === "Resolved by Suppliers") return <Badge color="green">{status}</Badge>;
    return <Badge color="gray">{status}</Badge>;
  };

  return (
    <div>
      <PageHeader title="Complaints: Supplier" sub="Warranty Claims — Raw Materials" />
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">Warranty Claims (Raw Materials) Form</h3>
          <button
            type="button"
            onClick={() => setListOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-700 transition font-medium"
          >
            View Warranty Claims →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Raw Material</label>
            <input
              list="supplier-raw-materials"
              value={materialName}
              onChange={(e) => onPickMaterial(e.target.value)}
              placeholder="Select or type raw material..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            <datalist id="supplier-raw-materials">
              {materialOptions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <div className="mt-1 text-[11px] text-gray-400">
              {rawRes.loading ? "Loading raw materials…" : `${materialOptions.length} materials`}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Vendor Name</label>
            <input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Vendor name"
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Serial No. (if any)</label>
            <input
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date Purchased</label>
            <input
              type="date"
              value={datePurchased}
              onChange={(e) => setDatePurchased(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date of Complaint</label>
            <input
              type="date"
              value={dateOfComplaint}
              onChange={(e) => setDateOfComplaint(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Issue Description</label>
            <textarea
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            />
          </div>
        </div>
        {formError ? (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </div>
        ) : formOk ? (
          <div className="mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {formOk}
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2">
          <button
            type="button"
            onClick={clearForm}
            className="px-5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition border border-red-200"
          >
            Reset
          </button>
          <PrimaryBtn onClick={submitSupplierComplaint}>
            {submitting ? "Submitting..." : "Claim Warranty"}
          </PrimaryBtn>
        </div>
      </div>

      {listOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold text-gray-900">Supplier Warranty Claims</div>
                <div className="text-xs text-gray-500">Claims raised for raw materials.</div>
              </div>
              <button
                type="button"
                onClick={() => setListOpen(false)}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <Table headers={["#", "Material", "Vendor", "Date", "Issue", "Status", "Action"]}>
                {complaintsRes.loading ? (
                  <TR>
                    <TD colSpan={7} className="text-center text-gray-400 py-10">Loading…</TD>
                  </TR>
                ) : complaintsRes.error ? (
                  <TR>
                    <TD colSpan={7} className="text-center text-red-500 py-10">{complaintsRes.error}</TD>
                  </TR>
                ) : (complaintsRes.data?.data ?? []).length === 0 ? (
                  <TR>
                    <TD colSpan={7} className="text-center text-gray-400 py-10">No claims found.</TD>
                  </TR>
                ) : (
                  (complaintsRes.data?.data ?? []).map((c, i) => (
                    <TR key={c.id} zebra={i % 2 === 1}>
                      <TD className="text-gray-400">{i + 1}</TD>
                      <TD className="text-gray-700 text-sm">
                        {c.rawMaterialName ||
                          (c.rawMaterialId ? (materialEntries.find((m) => m.id === c.rawMaterialId)?.materialName ?? c.rawMaterialId) : "—")}
                      </TD>
                      <TD className="text-gray-700 text-sm">{c.vendorName || "—"}</TD>
                      <TD className="text-gray-500 text-xs whitespace-nowrap">
                        {new Date(c.dateOfComplaint).toLocaleDateString()}
                      </TD>
                      <TD className="text-gray-700 text-sm">{c.issueDescription}</TD>
                      <TD>{complaintStatusBadge(c.status)}</TD>
                      <TD>
                        <button
                          type="button"
                          onClick={async () => {
                            const next = window.prompt("Update status:", c.status);
                            if (!next) return;
                            try {
                              await updateComplaintStatus(c.id, next);
                              complaintsRes.reload();
                            } catch (err) {
                              window.alert(err instanceof Error ? err.message : "Failed to update status.");
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                        >
                          Update
                        </button>
                      </TD>
                    </TR>
                  ))
                )}
              </Table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => complaintsRes.reload()}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setListOpen(false)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DistributorsPage() {
  const [q, setQ] = useState("");
  const distRes = useAsyncData(() => listDistributors({}), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDist, setViewDist] = useState<{
    id: string;
    name: string;
    email: string;
    mobile: string;
    address: string;
    unitsSold: number;
    isActive?: boolean;
  } | null>(null);
  const [activeId, setActiveId] = useState<string>("");
  const [form, setForm] = useState<{ name: string; email: string; mobile: string; address: string; unitsSold: string; isActive: boolean }>({
    name: "",
    email: "",
    mobile: "",
    address: "",
    unitsSold: "0",
    isActive: true,
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setModalMode("create");
    setActiveId("");
    setForm({ name: "", email: "", mobile: "", address: "", unitsSold: "0", isActive: true });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(d: { id: string; name: string; email: string; mobile: string; address: string; unitsSold?: number; isActive?: boolean }) {
    setModalMode("edit");
    setActiveId(d.id);
    setForm({
      name: d.name || "",
      email: d.email || "",
      mobile: d.mobile || "",
      address: d.address || "",
      unitsSold: String(d.unitsSold ?? 0),
      isActive: d.isActive !== false,
    });
    setFormError("");
    setModalOpen(true);
  }

  function openView(d: { id: string; name: string; email: string; mobile: string; address: string; unitsSold: number; isActive?: boolean }) {
    setViewDist(d);
    setViewOpen(true);
  }

  async function onSave() {
    const name = form.name.trim();
    const email = form.email.trim();
    const mobile = form.mobile.trim();
    const address = form.address.trim();
    const unitsSold = Number(form.unitsSold);
    if (!name || !email || !mobile || !address) {
      setFormError("All fields are required.");
      return;
    }
    if (!Number.isFinite(unitsSold) || unitsSold < 0) {
      setFormError("Units sold must be 0 or more.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modalMode === "create") {
        await createDistributor({ name, email, mobile, address });
      } else {
        if (!activeId) throw new Error("No distributor selected");
        await updateDistributor(activeId, { name, email, mobile, address, unitsSold, isActive: form.isActive });
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

  const activeCount = useMemo(() => (distRes.data ?? []).filter((d) => d.isActive !== false).length, [distRes.data]);
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
                <button
                  className="w-7 h-7 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center border border-sky-200"
                  type="button"
                  onClick={() => openView(d)}
                  title="View"
                >
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
              {modalMode === "edit" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Units Sold</label>
                    <input
                      inputMode="numeric"
                      value={form.unitsSold}
                      onChange={(e) => setForm((f) => ({ ...f, unitsSold: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                        className="w-4 h-4 accent-amber-500"
                      />
                      Active
                    </label>
                  </div>
                </div>
              )}
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

      {viewOpen && viewDist && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold text-gray-900">Distributor Details</div>
                <div className="text-xs text-gray-500">View and manage distributor info.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewOpen(false);
                  setViewDist(null);
                }}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-bold text-gray-900">{viewDist.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{viewDist.email}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Mobile</div>
                    <div className="text-sm font-mono text-gray-800 mt-1">{viewDist.mobile}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Units Sold</div>
                    <div className="text-sm font-bold text-emerald-700 mt-1">{viewDist.unitsSold ?? 0}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Address</div>
                  <div className="text-sm text-gray-800 mt-1">{viewDist.address}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={viewDist.isActive === false ? "gray" : "green"}>{viewDist.isActive === false ? "Inactive" : "Active"}</Badge>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setViewOpen(false);
                  setViewDist(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewOpen(false);
                  if (viewDist) openEdit(viewDist);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-200"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
