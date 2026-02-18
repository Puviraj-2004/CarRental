/**
 * Industrial Pagination Utility
 * 
 * Provides offset-based pagination with server-side search for Prisma queries.
 * Designed for admin panels and high-volume list endpoints.
 * 
 * Usage:
 *   const { skip, take, page, pageSize, search } = normalizePagination(args);
 *   const [items, totalCount] = await prisma.$transaction([
 *     prisma.entity.findMany({ where, skip, take }),
 *     prisma.entity.count({ where })
 *   ]);
 *   return buildPaginatedResult(items, totalCount, page, pageSize);
 */

// ─── Types ───────────────────────────────────────────────────────────
export interface PaginationInput {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PageInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

// ─── Constants ───────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE = 1;

// ─── Normalized pagination params (used internally by repositories) ──
export interface NormalizedPagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  search: string;
}

// ─── Core Functions ──────────────────────────────────────────────────

/**
 * Normalizes raw pagination input into safe, bounded values.
 * Enforces min/max constraints and calculates Prisma skip/take.
 */
export function normalizePagination(input?: PaginationInput): NormalizedPagination {
  const page = Math.max(MIN_PAGE, Math.floor(input?.page || MIN_PAGE));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(input?.pageSize || DEFAULT_PAGE_SIZE)));
  const skip = (page - 1) * pageSize;
  const search = input?.search?.trim() || '';

  return { page, pageSize, skip, take: pageSize, search };
}

/**
 * Builds a standardized paginated result from items and total count.
 */
export function buildPaginatedResult<T>(
  items: T[],
  totalCount: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    items,
    pageInfo: {
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Builds a Prisma-compatible case-insensitive search condition.
 * Generates OR conditions for multiple fields.
 */
export function buildSearchFilter(search: string, fields: string[]): any {
  if (!search || fields.length === 0) return undefined;

  return {
    OR: fields.map(field => {
      // Handle nested fields (e.g., 'user.fullName', 'car.plateNumber')
      const parts = field.split('.');
      if (parts.length === 1) {
        return { [field]: { contains: search, mode: 'insensitive' as const } };
      }
      // Build nested object for dot-notation fields
      let condition: any = { contains: search, mode: 'insensitive' as const };
      for (let i = parts.length - 1; i >= 0; i--) {
        condition = { [parts[i]]: i === parts.length - 1 ? condition : { ...condition } };
      }
      return condition;
    }),
  };
}
