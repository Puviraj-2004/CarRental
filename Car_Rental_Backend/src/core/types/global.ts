export type Maybe<T> = T | null | undefined;
export type ID = string;

export interface PaginationInput {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ServiceResult<T> {
  data: T;
  message?: string;
}
