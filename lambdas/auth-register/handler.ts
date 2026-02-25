import { APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../lib/response';
import { signToken } from '../../lib/auth-utils';
import { registerSchema, RegisterInput } from '../../lib/validation-schemas';
import { withValidation, ValidatedEvent } from '../../lib/validation-middleware';
import { hashPassword } from '../../lib/password-utils';
import { createUser } from '../../lib/user-store';

async function registerHandler(event: ValidatedEvent<RegisterInput>): Promise<APIGatewayProxyResult> {
  const { login, password, name, email } = event.validatedBody!;
  const passwordHash = await hashPassword(password);

  const wasCreated = await createUser({
    login,
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  if (!wasCreated) {
    return errorResponse(409, 'User already exists');
  }

  const token = signToken({ login, name, email });

  return successResponse(201, {
    data: {
      access_token: token,
      user: { login, name, email },
    },
    message: 'User registered successfully',
  });
}

export const handler = withValidation(
  { bodySchema: registerSchema },
  registerHandler
);
