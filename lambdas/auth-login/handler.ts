import { APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../lib/response';
import { signToken } from '../../lib/auth-utils';
import { MOCK_USERS } from '../../lib/data/users';
import { loginSchema, LoginInput } from '../../lib/validation-schemas';
import { withValidation, ValidatedEvent } from '../../lib/validation-middleware';

async function loginHandler(event: ValidatedEvent<LoginInput>): Promise<APIGatewayProxyResult> {
  const { login, password } = event.validatedBody!;

  // Find user in mock database
  const user = MOCK_USERS.find((u) => u.login === login && u.password === password);

  if (!user) {
    return errorResponse(401, 'Incorrect login or password');
  }

  // Create JWT
  const token = signToken({ login: user.login, name: user.name, email: user.email });

  return successResponse(200, {
    data: {
      access_token: token,
      user: { login: user.login, name: user.name, email: user.email },
    },
    message: 'Login successful',
  });
}

export const handler = withValidation(
  { bodySchema: loginSchema },
  loginHandler
);
