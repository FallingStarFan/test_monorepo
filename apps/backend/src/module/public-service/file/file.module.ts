import { Module } from '@nestjs/common';

// import { PermissionModule } from '../auth/permission/permission.module.js';

import { FileController } from './file.controller.js';
import { R2Service } from './intergration/r2.service.js';
import { StoredFileMetaService } from './store-file-meta/stored-file-meta.service.js';
import { FILE_STORAGE } from './intergration/file-storage.provider.js';

@Module({
  // 上傳相關端點已加上 AuthenticatedGuard（未登入回 401）。
  // Guard 由 PermissionModule 統一提供並 export，這裡只取用、不重新實作一份，
  // 避免同一套登入驗證邏輯出現第二個版本。
  imports: [
    // PermissionModule,
  ],

  controllers: [FileController],
  providers: [
    StoredFileMetaService,
    R2Service,
  
  {
      provide: FILE_STORAGE,
      useClass: R2Service,
    },
  ],
  exports: [
    StoredFileMetaService, 
    FILE_STORAGE
  ],
})
export class FileModule {}

