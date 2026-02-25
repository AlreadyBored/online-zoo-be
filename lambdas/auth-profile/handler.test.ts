import { handler } from './handler';
import { createMockEvent } from '../../lib/test-helpers';
import { signToken } from '../../lib/auth-utils';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('auth-profile handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    ddbMock.on(GetCommand).resolves({
      Item: {
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'salt:hash',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });
  });

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

    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: process.env.USERS_TABLE_NAME,
      Key: { login: 'testuser' },
    });
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

  it('should return 401 when user from token does not exist in database', async () => {
    ddbMock.on(GetCommand).resolves({});

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

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Unauthorized: User does not exist');
  });

  it('should return 403 when token user differs from requested user', async () => {
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
      queryStringParameters: {
        login: 'otheruser',
      },
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Forbidden: Token does not belong to requested user');
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
