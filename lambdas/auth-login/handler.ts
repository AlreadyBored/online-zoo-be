import { APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../lib/response';
import { signToken } from '../../lib/auth-utils';
import { loginSchema, LoginInput } from '../../lib/validation-schemas';
import { withValidation, ValidatedEvent } from '../../lib/validation-middleware';
import { getUserByLogin } from '../../lib/user-store';
import { verifyPassword } from '../../lib/password-utils';

async function loginHandler(event: ValidatedEvent<LoginInput>): Promise<APIGatewayProxyResult> {
  const { login, password } = event.validatedBody!;
  const user = await getUserByLogin(login);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return errorResponse(401, 'Incorrect login or password');
  }

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
