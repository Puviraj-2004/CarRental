import type { Prisma } from '@prisma/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationInput {
  page?:     number;
  pageSize?: number;
  search?:   string;
}

export interface PageInfo {
  totalCount:      number;
  totalPages:      number;
  currentPage:     number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items:    T[];
  pageInfo: PageInfo;
}

export interface NormalizedPagination {
  page:     number;
  pageSize: number;
  skip:     number;
  take:     number;
  search:   string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE     = 100;
export const MIN_PAGE          = 1;

// ─── Core functions ───────────────────────────────────────────────────────────

export function normalizePagination(input?: PaginationInput): NormalizedPagination {
  const page     = Math.max(MIN_PAGE, Math.floor(input?.page     ?? MIN_PAGE));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(input?.pageSize ?? DEFAULT_PAGE_SIZE)));
  return {
    page,
    pageSize,
    skip:   (page - 1) * pageSize,
    take:   pageSize,
    search: input?.search?.trim() ?? '',
  };
}

export function buildPaginatedResult<T>(
  items:      T[],
  totalCount: number,
  page:       number,
  pageSize:   number,
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return {
    items,
    pageInfo: {
      totalCount,
      totalPages,
      currentPage:     page,
      hasNextPage:     page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Builds a Prisma `OR` filter for case-insensitive string search across
 * multiple dot-notation field paths (e.g. `'model.brand.name'`).
 *
 * Returns `undefined` when `search` is empty so callers can spread it
 * directly into a `where` clause:
 *
 *   const where = { ...buildSearchFilter(search, ['email', 'name']) };
 */
export function buildSearchFilter(
  search: string,
  fields: string[],
): { OR: Prisma.StringFilter[] } | undefined {
  if (!search || fields.length === 0) return undefined;

  type NestedFilter = { [key: string]: NestedFilter | Prisma.StringFilter };

  const stringFilter: Prisma.StringFilter = {
    contains: search,
    mode:     'insensitive',
  };

  function buildNested(parts: string[]): NestedFilter {
    if (parts.length === 1) return { [parts[0]]: stringFilter };
    return { [parts[0]]: buildNested(parts.slice(1)) };
  }

  const conditions = fields.map((field) => {
    const parts = field.split('.');
    return parts.length === 1
      ? ({ [parts[0]]: stringFilter } as unknown as Prisma.StringFilter)
      : (buildNested(parts) as unknown as Prisma.StringFilter);
  });

  return { OR: conditions };
}