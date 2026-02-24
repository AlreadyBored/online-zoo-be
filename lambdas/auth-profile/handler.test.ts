import { handler } from './handler';
import { createMockEvent } from '../common/test-helpers';
import { signToken } from '../common/auth-utils';

describe('auth-profile handler', () => {
  it('should return user profile with valid token', async () => {
    const token = signToken({
      login: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
    });
    
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/auth/profile',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.data).toHaveProperty('login', 'testuser');
    expect(body.data).toHaveProperty('name', 'Test User');
    expect(body.data).toHaveProperty('email', 'test@example.com');
  });

  it('should return 401 when Authorization header is missing', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/auth/profile',
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Unauthorized: Missing or invalid token');
  });

  it('should return 401 when token is invalid', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/auth/profile',
      headers: {
        Authorization: 'Bearer invalid.token.here',
      },
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Unauthorized: Invalid or expired token');
  });

  it('should return 401 when Bearer prefix is missing', async () => {
    const token = signToken({
      login: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
    });
    
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/auth/profile',
      headers: {
        Authorization: token,
      },
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Unauthorized: Missing or invalid token');
  });

  it('should handle lowercase authorization header', async () => {
    const token = signToken({
      login: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
    });
    
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/auth/profile',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.data).toHaveProperty('login', 'testuser');
  });

  it('should have CORS headers', async () => {
    const token = signToken({
      login: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
    });
    
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/auth/profile',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
