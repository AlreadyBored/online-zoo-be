import 'aws-sdk-client-mock-jest';

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRY = '24h';
process.env.TEST_ERROR_PROBABILITY = '0';
process.env.USERS_TABLE_NAME = 'online-zoo-users-test';
