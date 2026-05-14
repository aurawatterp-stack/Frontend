"use client";

import { apiDelete, apiGet, apiPost, apiPut } from "./api";

export type ApiPage<T> = { data: T[]; total: number; page: number; limit: number };

export type UserSafe = {
  id: string;
  email: string;
  name: string;
  mobile: string;
  role: string;
  isActive?: boolean;
};

export type Customer = {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  status: string;
};

export type Product = { id: string; series: string; model: string; description?: string };

export type RawMaterial = {
  id: string;
  productSeriesId: string;
  materialName: string;
  dateReceived: string;
  billType: string;
  referenceNo: string;
  quantityReceived: number;
  quantityAvailable: number;
  vendorName: string;
  batch: string;
};

export type Manufactured = {
  id: string;
  productId: string;
  serialNumber: string;
  mfgDate: string;
  status: string;
  invoiceNo?: string;
  paymentStatus: string;
};

export type SerialEntry = { id: string; serialNumber: string; productSeriesId: string; status: string; uploadedAt: string };

export type Sale = {
  id: string;
  serialNumber: string;
  documentType: string;
  referenceNo: string;
  saleDate: string;
  customerId: string;
};

export type Complaint = { id: string; type: string; status: string; issueDescription: string; dateOfComplaint: string };

export type Distributor = { id: string; name: string; email: string; mobile: string; address: string; unitsSold: number };

export type DashboardStats = {
  rawMaterials: { totalAvailable: number };
  manufactured: { total: number; inStock: number; sold: number };
  distributors: { total: number };
  customers: { total: number };
  complaints: { total: number; open: number };
};

export type DashboardTimeline = {
  months: string[];
  raw: number[];
  manufactured: number[];
  sales: number[];
};

export async function getDashboardStats() {
  return apiGet<DashboardStats>("/api/dashboard/stats");
}

export async function getDashboardTimeline(months = 6) {
  return apiGet<DashboardTimeline>("/api/dashboard/timeline", { months });
}

export async function listUsers() {
  return apiGet<UserSafe[]>("/api/users");
}

export async function listCustomers(params: { q?: string; type?: string; page?: number; limit?: number } = {}) {
  return apiGet<ApiPage<Customer>>("/api/customers", { page: 1, limit: 100, ...params });
}

export async function listProducts(params: { q?: string; series?: string } = {}) {
  return apiGet<Product[]>("/api/products", params);
}

export async function createProduct(input: { series: string; model: string; description?: string }) {
  return apiPost<Product>("/api/products", input);
}

export async function updateProduct(id: string, input: { series?: string; model?: string; description?: string }) {
  return apiPut<Product>(`/api/products/${id}`, input);
}

export async function deleteProduct(id: string) {
  return apiDelete<{ message: string }>(`/api/products/${id}`);
}

export async function listRawMaterials(params: { q?: string; series?: string; batch?: string; vendor?: string } = {}) {
  return apiGet<ApiPage<RawMaterial>>("/api/raw-materials", { page: 1, limit: 100, ...params });
}

export async function listManufactured(params: { q?: string; status?: string; model?: string } = {}) {
  return apiGet<ApiPage<Manufactured>>("/api/manufactured", { page: 1, limit: 100, ...params });
}

export async function listSerials(params: { q?: string; series?: string; status?: string } = {}) {
  return apiGet<ApiPage<SerialEntry>>("/api/serials", { page: 1, limit: 200, ...params });
}

export async function listSales(params: { page?: number; limit?: number } = {}) {
  return apiGet<ApiPage<Sale>>("/api/sales", { page: 1, limit: 100, ...params });
}

export async function listComplaints(params: { type?: string; status?: string } = {}) {
  return apiGet<ApiPage<Complaint>>("/api/complaints", { page: 1, limit: 100, ...params });
}

export async function getComplaintStats() {
  return apiGet<Array<{ status: string; count: number }>>("/api/complaints/stats");
}

export async function listDistributors(params: { q?: string } = {}) {
  return apiGet<Distributor[]>("/api/distributors", params);
}

export async function createDistributor(input: { name: string; email: string; mobile: string; address: string }) {
  return apiPost<Distributor>("/api/distributors", input);
}

export async function updateDistributor(
  id: string,
  input: { name?: string; email?: string; mobile?: string; address?: string; unitsSold?: number; isActive?: boolean }
) {
  return apiPut<Distributor>(`/api/distributors/${id}`, input);
}

export async function deleteDistributor(id: string) {
  return apiDelete<{ message: string }>(`/api/distributors/${id}`);
}
