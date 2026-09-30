import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/response/filters/http-exception.filter.js';
import { JwtAuthService } from '../src/module/public-service/auth/guard/jwt.service.js';
import { PERMISSION_CATALOG } from '../src/module/public-service/auth/permission/permission.constants.js';
import { PrismaService } from '../src/module/public-service/prisma/prisma.service.js';

/**
 * Permission 模組 API 自動測試（vitest + supertest）。
 *
 * 為什麼測試要自己準備資料而不是依賴 seed：
 * seed 是為了「可用環境」，內容會隨需求調整；測試需要的是「可重現的最小資料」。
 * 若測試依賴 seed，一旦 seed 內容改變，測試就會以看似無關的方式失敗。
 * 因此這裡自行建立測試帳號與角色，並在結束時清掉，只共用 public-service App
 * 與 ADMIN 這個必要的身分定義。
 *
 * 測試帳號一律使用 @permission-e2e.local 網域，讓清理邏輯可以精準辨識，
 * 不會誤刪真實使用者。
 */

const TEST_EMAIL_DOMAIN = '@permission-e2e.local';

// 測試專用的權限碼前綴：與正式權限碼分開，
// 刪除測試資料時不會誤刪 PERMISSION_CATALOG 中的正式權限。
const TEST_PERMISSION_CODE = 'test-e2e:demo';
const TEST_PERMISSION_CODE_UPDATED =
  'test-e2e:demo-updated';

describe('Permission API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtAuthService: JwtAuthService;

  let noRoleToken: string;
  let limitedToken: string;
  let adminToken: string;

  let limitedRoleId: string;
  let adminRoleId: string;
  let appReadPermissionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    // 與 main.ts 對齊：沒有這幾行，測試驗證的就不是正式環境的行為
    // （例如少了 globalPrefix，路徑會與正式環境不同；
    //   少了 HttpExceptionFilter，錯誤回應格式會與正式環境不一致）。
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    prisma = app.get(PrismaService);
    jwtAuthService = app.get(JwtAuthService);

    // ----------------------------------------------------------
    // 清理上次可能殘留的測試資料
    // ----------------------------------------------------------

    const staleUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: TEST_EMAIL_DOMAIN,
        },
      },
      select: {
        id: true,
      },
    });

    if (staleUsers.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: staleUsers.map((user) => user.id),
          },
        },
      });
    }

    await prisma.permission.deleteMany({
      where: {
        code: {
          in: [
            TEST_PERMISSION_CODE,
            TEST_PERMISSION_CODE_UPDATED,
          ],
        },
      },
    });

    // ----------------------------------------------------------
    // 準備測試資料
    // ----------------------------------------------------------

    const publicServiceApp = await prisma.app.upsert({
      where: {
        name: 'public-service',
      },
      update: {},
      create: {
        name: 'public-service',
      },
    });

    const adminRole = await prisma.role.upsert({
      where: {
        appId_name: {
          appId: publicServiceApp.id,
          name: 'ADMIN',
        },
      },
      update: {},
      create: {
        appId: publicServiceApp.id,
        name: 'ADMIN',
      },
    });

    // 建立目錄中的全部權限碼（等同 seed 的最小需求：ADMIN 必須先有權限可用）
    for (const entry of PERMISSION_CATALOG) {
      await prisma.permission.upsert({
        where: {
          code: entry.code,
        },
        update: {},
        create: {
          code: entry.code,
          name: entry.name,
          description: entry.description,
        },
      });
    }

    const catalogPermissions =
      await prisma.permission.findMany({
        where: {
          code: {
            in: PERMISSION_CATALOG.map(
              (entry) => entry.code,
            ),
          },
        },
      });

    await prisma.rolePermission.createMany({
      data: catalogPermissions.map((permission) => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    const appReadPermission =
      await prisma.permission.findUniqueOrThrow({
        where: {
          code: 'app:read',
        },
      });

    appReadPermissionId = appReadPermission.id;

    // 有角色但沒有任何權限的角色：用來驗證 PERMISSION_DENIED
    const limitedRole = await prisma.role.upsert({
      where: {
        appId_name: {
          appId: publicServiceApp.id,
          name: 'LIMITED',
        },
      },
      update: {},
      create: {
        appId: publicServiceApp.id,
        name: 'LIMITED',
        description: '測試用：有角色但無權限',
      },
    });

    limitedRoleId = limitedRole.id;
    adminRoleId = adminRole.id;

    // 為什麼每個測試者都要用不同帳號：
    // 三種授權結果（無角色 / 有角色缺權限 / 有角色有權限）各需要一個獨立身分，
    // 用同一個帳號切換角色會讓測試之間互相影響。
    const noRoleUser = await prisma.user.create({
      data: {
        email: `no-role${TEST_EMAIL_DOMAIN}`,
        name: 'E2E No Role',
      },
    });

    const limitedUser = await prisma.user.create({
      data: {
        email: `limited${TEST_EMAIL_DOMAIN}`,
        name: 'E2E Limited',
        role: {
          create: {
            roleId: limitedRole.id,
          },
        },
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: `admin${TEST_EMAIL_DOMAIN}`,
        name: 'E2E Admin',
        role: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });

    noRoleToken = (
      await jwtAuthService.issueAccessToken(noRoleUser.id)
    ).token;

    limitedToken = (
      await jwtAuthService.issueAccessToken(limitedUser.id)
    ).token;

    adminToken = (
      await jwtAuthService.issueAccessToken(adminUser.id)
    ).token;
  }, 30000);

  afterAll(async () => {
    // 只清掉測試自己建立的資料；public-service App 與 ADMIN 角色屬於
    // 正式環境定義，必須保留，否則會破壞後續開發與部署的可用性。
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: TEST_EMAIL_DOMAIN,
        },
      },
      select: {
        id: true,
      },
    });

    if (testUsers.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: testUsers.map((user) => user.id),
          },
        },
      });
    }

    await prisma.permission.deleteMany({
      where: {
        code: {
          in: [
            TEST_PERMISSION_CODE,
            TEST_PERMISSION_CODE_UPDATED,
          ],
        },
      },
    });

    await app.close();
  });

  // ============================================================
  // 401：未登入
  // ============================================================

  describe('Authentication', () => {
    it('未帶 Access Token 呼叫管理 API 時回 401', async () => {
      const response = await request(
        app.getHttpServer(),
      ).get('/api/admin/apps');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.data).toBeNull();
    });

    it('帶無效 Access Token 呼叫管理 API 時回 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/apps')
        .set('Authorization', 'Bearer not-a-real-token');

      expect(response.status).toBe(401);
    });

    it('未登入呼叫 /permissions/me 時回 401', async () => {
      const response = await request(
        app.getHttpServer(),
      ).get('/api/permissions/me');

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // 403：NO_APP_ROLE 與 PERMISSION_DENIED
  // ============================================================

  describe('Authorization', () => {
    it('沒有 public-service 角色時回 403 且 code = NO_APP_ROLE', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/apps')
        .set('Authorization', `Bearer ${noRoleToken}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('NO_APP_ROLE');
      expect(response.body.data).toBeNull();
    });

    it('有角色但缺少權限碼時回 403 且 code = PERMISSION_DENIED', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/apps')
        .set('Authorization', `Bearer ${limitedToken}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('PERMISSION_DENIED');
    });

    it('ADMIN 角色可以呼叫管理 API', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/apps')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('既有未受保護的 /apps 端點不會因為權限模組而被註冊', async () => {
      // 權限模組以 provider 方式重用 AppService / RoleService，
      // 而非 import 既有模組，否則未受保護的 CRUD 端點會一起上線。
      const response = await request(app.getHttpServer()).get(
        '/api/apps',
      );

      expect(response.status).toBe(404);
    });
  });

  // ============================================================
  // /permissions/me
  // ============================================================

  describe('GET /api/permissions/me', () => {
    it('ADMIN 取得自己的角色與權限碼', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/permissions/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.appName).toBe('public-service');
      expect(response.body.roleNames).toContain('ADMIN');
      expect(response.body.permissionCodes).toContain(
        'app:read',
      );
    });

    it('沒有角色的使用者取得空清單而不是 403', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/permissions/me')
        .set('Authorization', `Bearer ${noRoleToken}`);

      expect(response.status).toBe(200);
      expect(response.body.roles).toEqual([]);
      expect(response.body.permissionCodes).toEqual([]);
    });
  });

  // ============================================================
  // Permission CRUD
  // ============================================================

  describe('Permission CRUD', () => {
    it('建立權限碼（POST /api/admin/permissions）', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: TEST_PERMISSION_CODE,
          name: '測試權限',
          description: '自動測試建立',
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(TEST_PERMISSION_CODE);
    });

    it('重複建立相同權限碼時回 409', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: TEST_PERMISSION_CODE,
          name: '測試權限',
        });

      expect(response.status).toBe(409);
    });

    it('權限碼格式不合法時回 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'Invalid Code!',
          name: '格式錯誤',
        });

      expect(response.status).toBe(400);
    });

    it('取得權限碼清單', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(
        response.body.some(
          (permission: { code: string }) =>
            permission.code === TEST_PERMISSION_CODE,
        ),
      ).toBe(true);
    });

    it('修改權限碼', async () => {
      const list = await request(app.getHttpServer())
        .get('/api/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`);

      const target = list.body.find(
        (permission: { code: string }) =>
          permission.code === TEST_PERMISSION_CODE,
      );

      const response = await request(app.getHttpServer())
        .patch(`/api/admin/permissions/${target.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: TEST_PERMISSION_CODE_UPDATED,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(
        TEST_PERMISSION_CODE_UPDATED,
      );
    });

    it('刪除權限碼', async () => {
      const list = await request(app.getHttpServer())
        .get('/api/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`);

      const target = list.body.find(
        (permission: { code: string }) =>
          permission.code === TEST_PERMISSION_CODE_UPDATED,
      );

      const response = await request(app.getHttpServer())
        .delete(`/api/admin/permissions/${target.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(target.id);
    });
  });

  // ============================================================
  // RolePermission 指派
  // ============================================================

  describe('RolePermission assignment', () => {
    // 為什麼針對 ADMIN 角色而不是「一般角色」驗證權限碼生效：
    // 管理 API 的條件是「ADMIN 角色 + 所需權限碼」兩者同時成立，
    // 一般角色就算被指派了 app:read，也過不了角色檢查。
    // 因此唯一能把「權限碼」這個變因單獨拉出來驗證的方式，
    // 就是在 ADMIN 角色上抽掉再補回權限碼，觀察 403 / 200 的變化。
    it('ADMIN 角色缺少權限碼時回 403 PERMISSION_DENIED，補回後恢復 200', async () => {
      const removed = await request(app.getHttpServer())
        .delete(
          `/api/admin/roles/${adminRoleId}/permissions/${appReadPermissionId}`,
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(removed.status).toBe(200);

      const denied = await request(app.getHttpServer())
        .get('/api/admin/apps')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(denied.status).toBe(403);
      expect(denied.body.code).toBe('PERMISSION_DENIED');

      // 把權限碼補回去，同時讓後續測試維持在 ADMIN 擁有完整權限的狀態
      const restored = await request(app.getHttpServer())
        .post(`/api/admin/roles/${adminRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          permissionIds: [appReadPermissionId],
        });

      expect(restored.status).toBe(201);

      const allowed = await request(app.getHttpServer())
        .get('/api/admin/apps')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(allowed.status).toBe(200);
    });

    it('追加指派是冪等的，重複指派不會產生重複資料', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/admin/roles/${limitedRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          permissionIds: [appReadPermissionId],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(1);
    });

    it('指派不存在的權限 ID 時回 400', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/admin/roles/${limitedRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          permissionIds: [
            '00000000-0000-4000-8000-000000000000',
          ],
        });

      expect(response.status).toBe(400);
    });

    it('移除權限後，該角色的使用者回到 403 PERMISSION_DENIED', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/api/admin/roles/${limitedRoleId}/permissions/${appReadPermissionId}`,
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const denied = await request(app.getHttpServer())
        .get('/api/admin/apps')
        .set('Authorization', `Bearer ${limitedToken}`);

      expect(denied.status).toBe(403);
      expect(denied.body.code).toBe('PERMISSION_DENIED');
    });
  });

  // ============================================================
  // Role CRUD（管理 API）
  // ============================================================

  describe('Role CRUD', () => {
    it('在 public-service 下建立角色，並可查詢與刪除', async () => {
      const apps = await request(app.getHttpServer())
        .get('/api/admin/apps')
        .set('Authorization', `Bearer ${adminToken}`);

      const publicServiceApp = apps.body.find(
        (appItem: { name: string }) =>
          appItem.name === 'public-service',
      );

      const created = await request(app.getHttpServer())
        .post(
          `/api/admin/apps/${publicServiceApp.id}/roles`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E_TEMP_ROLE',
          description: '自動測試建立',
        });

      expect(created.status).toBe(201);

      const list = await request(app.getHttpServer())
        .get(
          `/api/admin/apps/${publicServiceApp.id}/roles`,
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(
        list.body.some(
          (role: { name: string }) =>
            role.name === 'E2E_TEMP_ROLE',
        ),
      ).toBe(true);

      const removed = await request(app.getHttpServer())
        .delete(
          `/api/admin/apps/${publicServiceApp.id}/roles/${created.body.id}`,
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(removed.status).toBe(200);
    });
  });
});
