export interface StoredUser {
  login: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

type DynamoModules = {
  DynamoDBClient: new (config?: Record<string, unknown>) => unknown;
  DynamoDBDocumentClient: { from: (client: unknown) => DynamoDocClient };
  GetCommand: new (input: Record<string, unknown>) => unknown;
  PutCommand: new (input: Record<string, unknown>) => unknown;
};

type DynamoDocClient = {
  send: (command: unknown) => Promise<Record<string, unknown>>;
};

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME;

let clientPromise: Promise<{
  docClient: DynamoDocClient;
  modules: DynamoModules;
}> | null = null;

function ensureTableName(): string {
  if (!USERS_TABLE_NAME) {
    throw new Error('USERS_TABLE_NAME is not configured');
  }

  return USERS_TABLE_NAME;
}

async function getDynamoClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const dynamoClientModule = require('@aws-sdk/client-dynamodb');
      const dynamoDocumentModule = require('@aws-sdk/lib-dynamodb');

      const modules: DynamoModules = {
        DynamoDBClient: dynamoClientModule.DynamoDBClient,
        DynamoDBDocumentClient: dynamoDocumentModule.DynamoDBDocumentClient,
        GetCommand: dynamoDocumentModule.GetCommand,
        PutCommand: dynamoDocumentModule.PutCommand,
      };

      const client = new modules.DynamoDBClient({});
      return {
        docClient: modules.DynamoDBDocumentClient.from(client),
        modules,
      };
    })();
  }

  return clientPromise;
}

export async function getUserByLogin(login: string): Promise<StoredUser | null> {
  const tableName = ensureTableName();
  const { docClient, modules } = await getDynamoClient();
  const result = await docClient.send(
    new modules.GetCommand({
      TableName: tableName,
      Key: { login },
    }),
  );

  return (result.Item as StoredUser | undefined) ?? null;
}

export async function createUser(user: StoredUser): Promise<boolean> {
  const tableName = ensureTableName();
  const { docClient, modules } = await getDynamoClient();

  try {
    await docClient.send(
      new modules.PutCommand({
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
