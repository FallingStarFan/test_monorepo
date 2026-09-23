import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

/**
 * 指派角色權限的請求主體。
 *
 * 為什麼用「整批覆蓋」而不是逐一新增／刪除：
 * 前端管理介面是一張勾選清單，使用者按下儲存時的意圖是
 * 「這個角色最終要有這幾個權限」，而不是「請幫我加減這幾項」。
 * 用整批覆蓋可以把「勾選清單 → 儲存」對應成一次請求，
 * 也避免前端自行計算差異時漏刪或漏加。
 */
export class AssignRolePermissionsDto {
  @ApiProperty({
    example: ['00000000-0000-0000-0000-000000000000'],
    description: '要套用到該角色的權限 ID 清單',
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  // 為什麼擋重複 id：重複的 id 沒有語意，卻會讓「筆數」對不上，
  // 在回報結果與寫測試時容易誤判，因此直接在輸入層拒絕。
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  permissionIds!: string[];
}
