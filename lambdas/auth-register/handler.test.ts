import { handler } from './handler';
import { createMockEvent } from '../../lib/test-helpers';

describe('auth-register handler', () => {
  it('should register user with valid data', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'johndoe',
        password: 'password!123',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(201);
    
    const body = JSON.parse(response.body);
    expect(body.message).toBe('User registered successfully');
    expect(body.data).toHaveProperty('access_token');
    expect(body.data.access_token).toBeDefined();
    expect(body.data.user).toEqual({
      login: 'johndoe',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should return 400 when request body is missing', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Request body is required');
  });

  it('should return 400 when required fields are missing', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'johndoe',
        password: 'password!123',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('name');
    expect(body.error).toContain('email');
  });

  it('should return 400 for login less than 3 characters', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'ab',
        password: 'password!123',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Login must be at least 3 characters');
  });

  it('should return 400 for login starting with non-letter', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: '123abc',
        password: 'password!123',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('start with a letter');
  });

  it('should return 400 for login with non-English characters', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'john123',
        password: 'password!123',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('only English letters');
  });

  it('should return 400 for password less than 6 characters', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'johndoe',
        password: 'pass!',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Password must be at least 6 characters');
  });

  it('should return 400 for password without special character', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'johndoe',
        password: 'password123',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('contain at least 1 special character');
  });

  it('should return 400 for name less than 3 characters', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'johndoe',
        password: 'password!123',
        name: 'Jo',
        email: 'john@example.com',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Name must be at least 3 characters');
  });

  it('should return 400 for invalid email format', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'johndoe',
        password: 'password!123',
        name: 'John Doe',
        email: 'invalid-email',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Invalid email format');
  });

  it('should have CORS headers', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      body: JSON.stringify({
        login: 'johndoe',
        password: 'password!123',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
