// src/common/utils.ts
// Common utility functions

/**
 * Format a date to ISO string (date only)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Paginate an array
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): { data: T[]; total: number; page: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return { data, total, page, totalPages };
}
