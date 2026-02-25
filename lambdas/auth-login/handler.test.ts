import { handler } from './handler';
import { createMockEvent } from '../../lib/test-helpers';
import { hashPassword } from '../../lib/password-utils';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('auth-login handler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should login with valid credentials', async () => {
    const passwordHash = await hashPassword('admin!1');
    ddbMock.on(GetCommand, {
      TableName: process.env.USERS_TABLE_NAME,
      Key: { login: 'admin' },
    }).resolves({
      Item: {
        login: 'admin',
        name: 'Admin User',
        email: 'admin@zoo.com',
        passwordHash,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });

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

    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: process.env.USERS_TABLE_NAME,
      Key: { login: 'admin' },
    });
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
    ddbMock.on(GetCommand).resolves({});

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
    const passwordHash = await hashPassword('admin!1');
    ddbMock.on(GetCommand).resolves({
      Item: {
        login: 'admin',
        name: 'Admin User',
        email: 'admin@zoo.com',
        passwordHash,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });

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
    const passwordHash = await hashPassword('admin!1');
    ddbMock.on(GetCommand).resolves({
      Item: {
        login: 'admin',
        name: 'Admin User',
        email: 'admin@zoo.com',
        passwordHash,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });

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
