import type { CallHandler, ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { MESSAGES } from './messages.js';
import { ResponseInterceptor } from './response.interceptor.js';

function createContext(statusCode = 200): ExecutionContext {
  return {
    switchToHttp: () => ({
      getResponse: () => ({ statusCode, headersSent: false }),
    }),
    getHandler: () => createContext,
    getClass: () => ResponseInterceptor,
  } as unknown as ExecutionContext;
}

function createHandler(value: unknown): CallHandler {
  return { handle: () => of(value) };
}

describe('ResponseInterceptor', () => {
  it('uses response message metadata in the runtime envelope', async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(MESSAGES.USER_RETRIEVED),
    } as unknown as Reflector;
    const interceptor = new ResponseInterceptor(reflector);

    const result = await firstValueFrom(
      interceptor.intercept(createContext(), createHandler({ id: 'user-1' })),
    );

    expect(result).toEqual({
      statusCode: 200,
      message: MESSAGES.USER_RETRIEVED,
      data: { id: 'user-1' },
    });
  });

  it('uses the generic success message when no metadata is set', async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const interceptor = new ResponseInterceptor(reflector);

    const result = await firstValueFrom(
      interceptor.intercept(createContext(201), createHandler(undefined)),
    );

    expect(result).toEqual({
      statusCode: 201,
      message: MESSAGES.OPERATION_SUCCESS,
      data: null,
    });
  });
});
