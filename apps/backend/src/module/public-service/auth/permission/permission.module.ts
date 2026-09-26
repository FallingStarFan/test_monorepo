import { Module } from '@nestjs/common';

import { AppService } from '../app/app.service.js';
import { RoleService } from '../role/role.service.js';
import { JwtAuthModule } from '../services/jwt/jwt.module.js';

import { AdminAppController } from './controllers/admin-app.controller.js';
import { AdminDashboardController } from './controllers/admin-dashboard.controller.js';
import { AdminPermissionController } from './controllers/admin-permission.controller.js';
import { AdminRoleController } from './controllers/admin-role.controller.js';
import { AdminRolePermissionController } from './controllers/admin-role-permission.controller.js';
import { MyAppsController } from './controllers/my-apps.controller.js';
import { MyPermissionController } from './controllers/my-permission.controller.js';
import { RegisteredAppController } from './controllers/registered-app.controller.js';
import { DashboardOverviewService } from './dashboard-overview.service.js';
import { MyAppsService } from './my-apps.service.js';
import { AuthenticatedGuard } from './guards/authenticated.guard.js';
import { PermissionGuard } from './guards/permission.guard.js';
import { PermissionService } from './permission.service.js';
import { RolePermissionService } from './role-permission.service.js';

/**
 * 細粒度權限模組。
 *
 * 為什麼 AppService / RoleService 直接在這裡列為 provider，
 * 而不是 imports: [AppModule, RoleModule]：
 *
 * 這兩個模組的 Module 定義中把 Controller 列為 controllers，
 * 一旦被 import，那些「沒有 Guard 保護」的既有端點（/apps、/apps/:appId/roles）
 * 就會在執行期一起被註冊，等於在新增權限功能的同時開放了未受保護的寫入 API。
 * 這裡只把它們的 Service 當成可複用的資料存取層引用，Controller 則完全不啟用，
 * 既有 auth / file / notification 的 API contract 因此維持不變。
 *
 * PrismaModule 是 @Global()，所以這裡不需要再 import 它。
 */
@Module({
  imports: [
    // AuthenticatedGuard / PermissionGuard 需要 JwtAuthService 驗證 Access Token
    JwtAuthModule,
  ],

  controllers: [
    AdminAppController,
    AdminDashboardController,
    AdminRoleController,
    AdminPermissionController,
    AdminRolePermissionController,
    MyPermissionController,
    RegisteredAppController,
    // App 入口清單：只需要登入，任何使用者都能取得自己的 App 清單
    MyAppsController,
  ],

  providers: [
    PermissionService,
    RolePermissionService,
    DashboardOverviewService,
    MyAppsService,
    AppService,
    RoleService,
    // Guard 也可以被其他模組以 DI 方式取用（例如未來的 billing 模組），
    // 因此一併列為 provider 並 export。
    AuthenticatedGuard,
    PermissionGuard,
  ],

  exports: [
    PermissionService,
    RolePermissionService,
    // 一併 re-export JwtAuthModule：其他模組（如 FileModule）在自己的 controller
    // 上掛 @UseGuards(AuthenticatedGuard) 時，Nest 會在該模組的上下文解析 Guard
    // 的建構依賴（JwtAuthService），因此必須讓 JwtAuthModule 的 exports 對
    // import PermissionModule 的模組可見，否則啟動時會出現 UnknownDependenciesException。
    JwtAuthModule,
    AuthenticatedGuard,
    PermissionGuard,
  ],
})
export class PermissionModule {}
