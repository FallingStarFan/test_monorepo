import { RequireRole } from './require-role.decorator.js';

export const RequireStudioAdmin = () =>
  RequireRole(
    { appName: 'xingfan-studio', roleName: 'ADMIN' },
    { appName: 'xingfan-studio', roleName: 'OWNER' },
  );


  export const RequireStudioRole = (...roleNames: string[]) =>
  RequireRole(
    ...roleNames.map((roleName) => ({
      appName: 'xingfan-studio',
      roleName,
    })),
  );

  //範例   @RequireStudioRole('ADMIN', 'OWNER') 