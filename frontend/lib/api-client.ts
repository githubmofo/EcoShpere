import { Department, Category, EsgConfig, NotificationSettings } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${res.status}`);
  }
  return res.json();
}

async function apiDelete<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${res.status}`);
  }
  // No Content responses shouldn't be parsed as JSON
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

// -- Departments API --
export function getDepartments() {
  return apiGet<Department[]>('/settings/departments');
}
export function createDepartment(data: Partial<Department>) {
  return apiPost<Department>('/settings/departments', data);
}
export function updateDepartment(id: string, data: Partial<Department>) {
  return apiPatch<Department>(`/settings/departments/${id}`, data);
}
export function deleteDepartment(id: string) {
  return apiDelete<void>(`/settings/departments/${id}`);
}

// -- Categories API --
export function getCategories() {
  return apiGet<Category[]>('/settings/categories');
}
export function createCategory(data: Partial<Category>) {
  return apiPost<Category>('/settings/categories', data);
}
export function updateCategory(id: string, data: Partial<Category>) {
  return apiPatch<Category>(`/settings/categories/${id}`, data);
}

// -- ESG Config API --
export function getEsgConfig() {
  return apiGet<EsgConfig>('/settings/esg-config');
}
export function updateEsgConfig(data: Partial<EsgConfig>) {
  return apiPatch<EsgConfig>('/settings/esg-config', data);
}

// -- Notification Settings API --
export function getNotificationSettings() {
  return apiGet<NotificationSettings>('/settings/notification-settings');
}
export function updateNotificationSettings(data: Partial<NotificationSettings>) {
  return apiPatch<NotificationSettings>('/settings/notification-settings', data);
}
