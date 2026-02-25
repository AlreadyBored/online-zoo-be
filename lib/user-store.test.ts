import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createUser, getUserByLogin } from './user-store';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('user-store', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.USERS_TABLE_NAME = 'online-zoo-users-test';
  });

  it('should get user by login', async () => {
    ddbMock.on(GetCommand, {
      TableName: 'online-zoo-users-test',
      Key: { login: 'admin' },
    }).resolves({
      Item: {
        login: 'admin',
        name: 'Admin User',
        email: 'admin@zoo.com',
        passwordHash: 'salt:hash',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });

    const user = await getUserByLogin('admin');

    expect(user).toEqual({
      login: 'admin',
      name: 'Admin User',
      email: 'admin@zoo.com',
      passwordHash: 'salt:hash',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(ddbMock).toHaveReceivedCommandTimes(GetCommand, 1);
  });

  it('should return null when user is not found', async () => {
    ddbMock.on(GetCommand).resolves({});

    const user = await getUserByLogin('missing-user');

    expect(user).toBeNull();
  });

  it('should create user and return true', async () => {
    ddbMock.on(PutCommand).resolves({});

    const created = await createUser({
      login: 'admin',
      name: 'Admin User',
      email: 'admin@zoo.com',
      passwordHash: 'salt:hash',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(created).toBe(true);
    expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
      TableName: 'online-zoo-users-test',
      Item: expect.objectContaining({
        login: 'admin',
        passwordHash: 'salt:hash',
      }),
      ConditionExpression: 'attribute_not_exists(login)',
    });
  });

  it('should return false when user already exists', async () => {
    const conflictError = Object.assign(new Error('User exists'), {
      name: 'ConditionalCheckFailedException',
    });
    ddbMock.on(PutCommand).rejects(conflictError);

    const created = await createUser({
      login: 'admin',
      name: 'Admin User',
      email: 'admin@zoo.com',
      passwordHash: 'salt:hash',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(created).toBe(false);
  });

  it('should throw when USERS_TABLE_NAME is not configured', async () => {
    delete process.env.USERS_TABLE_NAME;

    await expect(getUserByLogin('admin')).rejects.toThrow('USERS_TABLE_NAME is not configured');
  });
});
