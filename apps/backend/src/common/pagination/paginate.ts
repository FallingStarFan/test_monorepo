import type { PageMeta, Paginated } from '@test/shared';

/**
 * 將頁碼與每頁筆數轉成 Prisma 查詢使用的 skip、take。
 *
 * 用於需要分頁的列表查詢，在呼叫 findMany() 時展開回傳值。
 * 例如 page=2、pageSize=20，會略過前 20 筆並取得接下來 20 筆。
 *
 * 呼叫前應先驗證 page >= 1、pageSize >= 1，並限制 pageSize 上限。
 */
export function pageArgs({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

/**
 * 將列表資料與總筆數整理成統一的分頁回應。
 *
 * 用於列表查詢完成後，讓前端取得資料、總頁數及上一頁／下一頁狀態。
 * total 應來自與列表查詢使用相同篩選條件的 count()。
 *
 * @param items 當前頁查出的資料
 * @param total 符合篩選條件的總筆數，不是 items.length
 * @param page 目前頁碼，從 1 開始
 * @param pageSize 每頁筆數
 */
export function toPage<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const meta: PageMeta = {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return { items, meta };
}



/* 範例

  async findAllPageable(
    page: number,
    pageSize: number,
    order: 'asc' | 'desc',
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        ...pageArgs({ page, pageSize }),
        select: this.userSelect,
        orderBy: [{ createdAt: order }, { id: 'asc' }],
      }),
      this.prisma.user.count(),
    ]);

    return toPage(items, total, page, pageSize);
  }


*/