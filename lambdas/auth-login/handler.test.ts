import { handler } from './handler';
import { createMockEvent } from '../common/test-helpers';

describe('auth-login handler', () => {
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
    expect(body.error).toBe('Login and password are required');
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
    expect(body.error).toBe('Login and password are required');
  });

  it('should return 401 for incorrect login', async () => {
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
