export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  skip: number;
};

export const getPagination = (
  params: PaginationParams,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {},
): PaginationMeta => {
  const defaultPage = defaults.page ?? 1;
  const defaultLimit = defaults.limit ?? 10;
  const maxLimit = defaults.maxLimit ?? 100;

  const page = Math.max(1, Number(params.page ?? defaultPage) || defaultPage);
  const rawLimit = Math.max(1, Number(params.limit ?? defaultLimit) || defaultLimit);
  const limit = Math.min(rawLimit, maxLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
