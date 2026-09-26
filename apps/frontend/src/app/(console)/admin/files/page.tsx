import {
  AUTH_ME_API_PATH,
  HTTP_STATUS,
  LOGIN_PAGE_PATH,
  type StoredFileMeta,
} from '@test/shared';
import { FileText, LogIn, Upload } from 'lucide-react';
import Link from 'next/link';

import { FileUploadPanel } from '@/components/modules/files';
import { Badge } from '@/components/base/badge';
import { Button } from '@/components/base/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/base/table';
import { callBackendApi } from '@/lib/bff';

/**
 * 檔案模組頁面。
 *
 * 上傳改成「登入後才能使用」：
 * 後端的上傳端點（/file/upload-url、POST /file）已加上登入驗證，
 * 前端也必須先確認登入狀態——未登入時不顯示上傳面板，只留登入入口，
 * 避免使用者填完檔案才被後端回 401。
 *
 * 下方的檔案清單目前仍是版面示意資料（後端 file 模組尚未提供列表 API），
 * 因此與上傳功能分開標示，不讓示意資料看起來像真實資料。
 */
export const dynamic = 'force-dynamic';

interface CurrentUserPayload {
  user?: {
    id?: string;
    email?: string;
    name?: string | null;
  };
}

const SAMPLE_FILES: StoredFileMeta[] = [
  {
    id: 'demo-1',
    objectKey: 'uploads/2026/09/contract-sample.pdf',
    bucketId: 'r2-default',
    originalName: '合約範本.pdf',
    mimeType: 'application/pdf',
    bytes: 482_133,
    etag: 'demo-etag-1',
    checksum: null,
    relationType: 'contract',
    relationId: 'contract-1001',
    createdAt: '2026-09-18T02:14:00.000Z',
    updatedAt: '2026-09-18T02:14:00.000Z',
    deletedAt: null,
  },
  {
    id: 'demo-2',
    objectKey: 'uploads/2026/09/board-shot.png',
    bucketId: 'r2-default',
    originalName: '白板截圖.png',
    mimeType: 'image/png',
    bytes: 1_204_512,
    etag: 'demo-etag-2',
    checksum: null,
    relationType: 'canvas',
    relationId: 'canvas-2001',
    createdAt: '2026-09-20T08:41:00.000Z',
    updatedAt: '2026-09-21T03:02:00.000Z',
    deletedAt: null,
  },
];

/**
 * 將位元組轉為可讀大小。
 *
 * 後端的 bytes 欄位為 BigInt，經 JSON 傳輸可能是字串，
 * 因此這裡同時接受字串與數字，避免前端顯示 NaN。
 */
function formatBytes(bytes: StoredFileMeta['bytes']): string {
  const value =
    typeof bytes === 'string' ? Number.parseInt(bytes, 10) : bytes;

  if (value === null || value === undefined || Number.isNaN(value)) {
    return '未知';
  }

  if (value < 1024) {
    return `${value} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let size = value / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/** 依預覽顯示需求縮短 objectKey，避免長路徑撐破表格。 */
function shortenObjectKey(objectKey: string): string {
  const segments = objectKey.split('/');

  if (segments.length <= 3) {
    return objectKey;
  }

  return `${segments[0]}/…/${segments[segments.length - 1]}`;
}

export default async function FilesPage() {
  const me = await callBackendApi<CurrentUserPayload>(
    AUTH_ME_API_PATH,
  );

  const authenticated = Boolean(
    me && me.status !== HTTP_STATUS.UNAUTHORIZED && me.payload?.user,
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-4" />
            上傳檔案
          </CardTitle>
          <CardDescription>
            {authenticated
              ? '後端以 presigned URL 讓瀏覽器直接上傳到物件儲存，避免大檔經過 API 伺服器而佔用記憶體與頻寬。'
              : '上傳需要登入。登入後才會顯示上傳入口。'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authenticated ? (
            <FileUploadPanel />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                未登入時不提供上傳功能（後端的上傳端點也會回 401）。請先登入，
                登入後即可使用上傳。
              </p>
              <Button asChild className="w-fit">
                <Link href={LOGIN_PAGE_PATH}>
                  <LogIn className="size-4" />
                  前往登入
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            檔案清單
          </CardTitle>
          <CardDescription>
            以下為版面示意資料（後端 file 模組尚未提供列表 API）。實際資料將來自
            public-service 的 file 模組，並依目前使用者的 App 角色過濾。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>檔案名稱</TableHead>
                <TableHead className="hidden md:table-cell">
                  Object Key
                </TableHead>
                <TableHead>類型</TableHead>
                <TableHead className="text-right">大小</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_FILES.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    {file.originalName ?? '（未命名）'}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {shortenObjectKey(file.objectKey)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {file.mimeType ?? '未知'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBytes(file.bytes)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
