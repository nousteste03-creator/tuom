// _pagination.ts
// Paginação cursor-based estável

export type Cursor = {
  impactScore: number;
  publishedAt: string;
};

export function applyCursorPagination<T extends {
  impactScore: number;
  publishedAt: string;
}>(
  items: T[],
  limit: number
): {
  page: T[];
  nextCursor: Cursor | null;
} {
  const page = items.slice(0, limit);

  if (page.length < limit) {
    return { page, nextCursor: null };
  }

  const last = page[page.length - 1];

  return {
    page,
    nextCursor: {
      impactScore: last.impactScore,
      publishedAt: last.publishedAt,
    },
  };
}
