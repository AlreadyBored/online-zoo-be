import { handler } from './handler';
import { createMockEvent } from '../../lib/test-helpers';
import { getUserByLogin } from '../../lib/user-store';
import { verifyPassword } from '../../lib/password-utils';

jest.mock('../../lib/user-store', () => ({
  getUserByLogin: jest.fn(),
}));

jest.mock('../../lib/password-utils', () => ({
  verifyPassword: jest.fn(),
}));

const mockGetUserByLogin = getUserByLogin as jest.MockedFunction<typeof getUserByLogin>;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;

describe('auth-login handler', () => {
  beforeEach(() => {
    mockGetUserByLogin.mockResolvedValue({
      login: 'admin',
      name: 'Admin User',
      email: 'admin@zoo.com',
      passwordHash: 'salt:hash',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    mockVerifyPassword.mockResolvedValue(true);
  });

  it('should login with valid credentials', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/login',
      body: JSON.stringify({
        login: 'admin',
        password: 'admin!1',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Login successful');
    expect(body.data).toHaveProperty('access_token');
    expect(body.data.access_token).toBeDefined();
    expect(body.data.user).toHaveProperty('login', 'admin');
    expect(body.data.user).toHaveProperty('name');
    expect(body.data.user).toHaveProperty('email');
    expect(mockGetUserByLogin).toHaveBeenCalledWith('admin');
    expect(mockVerifyPassword).toHaveBeenCalledWith('admin!1', 'salt:hash');
  });

  it('should return 400 when request body is missing', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/login',
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Request body is required');
  });

  it('should return 400 when login is missing', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/login',
      body: JSON.stringify({
        password: 'admin!1',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('login');
    expect(body.error).toContain('expected string');
  });

  it('should return 400 when password is missing', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/login',
      body: JSON.stringify({
        login: 'admin',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('password');
    expect(body.error).toContain('expected string');
  });

  it('should return 401 for incorrect login', async () => {
    mockGetUserByLogin.mockResolvedValue(null);

    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/login',
      body: JSON.stringify({
        login: 'wronguser',
        password: 'admin!1',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Incorrect login or password');
  });

  it('should return 401 for incorrect password', async () => {
    mockVerifyPassword.mockResolvedValue(false);

    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/login',
      body: JSON.stringify({
        login: 'admin',
        password: 'wrongpassword',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Incorrect login or password');
  });

  it('should have CORS headers', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/login',
      body: JSON.stringify({
        login: 'admin',
        password: 'admin!1',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
