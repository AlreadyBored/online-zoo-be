import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export interface StoredUser {
  login: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

function ensureTableName(): string {
  const tableName = process.env.USERS_TABLE_NAME;
  if (!tableName) {
    throw new Error('USERS_TABLE_NAME is not configured');
  }

  return tableName;
}

let docClient: DynamoDBDocumentClient | null = null;

function getDocClient(): DynamoDBDocumentClient {
  if (!docClient) {
    const dynamoClient = new DynamoDBClient({});
    docClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  return docClient;
}

export async function getUserByLogin(login: string): Promise<StoredUser | null> {
  const tableName = ensureTableName();
  const result = await getDocClient().send(
    new GetCommand({
      TableName: tableName,
      Key: { login },
    }),
  );

  return (result.Item as StoredUser | undefined) ?? null;
}

export async function createUser(user: StoredUser): Promise<boolean> {
  const tableName = ensureTableName();

  try {
    await getDocClient().send(
      new PutCommand({
        TableName: tableName,
        Item: user,
        ConditionExpression: 'attribute_not_exists(login)',
      }),
    );

    return true;
  } catch (error) {
    if (typeof error === 'object' && error && 'name' in error && error.name === 'ConditionalCheckFailedException') {
      return false;
    }

    throw error;
  }
}
