import { validate } from 'class-validator';

import { OAuthStartQueryDto } from './oauth-start-query.dto.js';
import { PasswordLoginDto, PasswordRegisterDto } from './password-auth.dto.js';
import { AssignRoleDto } from '../tables/user-role/dto/assign-role.dto.js';
import { UpdateUserDto } from '../tables/users/dto/update-user.dto.js';

describe('Auth DTO validation', () => {
  it('accepts a valid password registration request', async () => {
    const dto = Object.assign(new PasswordRegisterDto(), {
      email: 'user@example.com',
      password: 'StrongPassword123!',
      name: 'Jane Doe',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an invalid email and short password', async () => {
    const dto = Object.assign(new PasswordLoginDto(), {
      email: 'invalid-email',
      password: 'short',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['email', 'password']),
    );
  });

  it('validates roleIds and status on user updates', async () => {
    const dto = Object.assign(new UpdateUserDto(), {
      roleIds: ['not-a-uuid'],
      status: 'UNKNOWN',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['roleIds', 'status']),
    );
  });

  it('validates scalar role IDs', async () => {
    const dto = Object.assign(new AssignRoleDto(), {
      roleId: 'not-a-uuid',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('roleId');
  });

  it('limits OAuth returnTo length', async () => {
    const dto = Object.assign(new OAuthStartQueryDto(), {
      returnTo: `/${'a'.repeat(2048)}`,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('returnTo');
  });
});
