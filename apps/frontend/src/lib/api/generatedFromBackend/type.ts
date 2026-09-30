import type { components } from './schema';

export type GenerateApiTypeFromSwagger =
  components['schemas'];

type LoginBody = GenerateApiTypeFromSwagger['PasswordLoginDto'];
type RegisterBody = GenerateApiTypeFromSwagger['PasswordRegisterDto'];
type RefreshSessionBody = GenerateApiTypeFromSwagger[''];
type AssignRoleBody = GenerateApiTypeFromSwagger['AssignRoleDto'];