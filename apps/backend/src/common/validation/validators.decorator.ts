// common/validation/validators.ts
import {
  IsArray as ValidateArray,
  IsBoolean as ValidateBoolean,
  IsEmail as ValidateEmail,
  IsEnum as ValidateEnum,
  IsInt as ValidateInt,
  IsNotEmpty as ValidateNotEmpty,
  IsString as ValidateString,
  IsUUID as ValidateUUID,
  MaxLength as ValidateMaxLength,
  Min as ValidateMin,
  MinLength as ValidateMinLength,
  type ValidationOptions,
} from 'class-validator';

export { IsOptional } from 'class-validator';

export function IsEmail(options?: ValidationOptions) {
  return ValidateEmail({}, {
    message: 'Email 格式不正確',
    ...options,
  });
}

export function IsString(options?: ValidationOptions) {
  return ValidateString({
    message: '$property 必須是字串',
    ...options,
  });
}

export function IsNotEmpty(options?: ValidationOptions) {
  return ValidateNotEmpty({
    message: '$property 不可為空',
    ...options,
  });
}

export function IsBoolean(options?: ValidationOptions) {
  return ValidateBoolean({
    message: '$property 必須是布林值',
    ...options,
  });
}

export function IsArray(options?: ValidationOptions) {
  return ValidateArray({
    message: '$property 必須是陣列',
    ...options,
  });
}

export function IsUUID(options?: ValidationOptions) {  //  @IsUUID({ each: true }) 代表驗證陣列中的每個元素是否為有效的 UUID v4
  return ValidateUUID('4', {
    message: '$property 必須是有效的 UUID v4',
    ...options,
    each: true,
  });
}

export function IsEnum(
  values: object,
  options?: ValidationOptions,
) {
  return ValidateEnum(values, {
    message: '$property 不在允許的選項內',
    ...options,
  });
}

export function IsInt(options?: ValidationOptions) {
  return ValidateInt({
    message: '$property 必須是整數',
    ...options,
  });
}

export function Min(
  value: number,
  options?: ValidationOptions,
) {
  return ValidateMin(value, {
    message: `$property 不可小於 ${value}`,
    ...options,
  });
}

export function MinLength(
  length: number,
  options?: ValidationOptions,
) {
  return ValidateMinLength(length, {
    message: `$property 至少需要 ${length} 個字元`,
    ...options,
  });
}

export function MaxLength(
  length: number,
  options?: ValidationOptions,
) {
  return ValidateMaxLength(length, {
    message: `$property 不可超過 ${length} 個字元`,
    ...options,
  });
}