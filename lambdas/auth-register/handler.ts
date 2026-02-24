import { APIGatewayProxyResult } from 'aws-lambda';
import { successResponse } from '../../lib/response';
import { signToken } from '../../lib/auth-utils';
import { registerSchema, RegisterInput } from '../../lib/validation-schemas';
import { withValidation, ValidatedEvent } from '../../lib/validation-middleware';

async function registerHandler(event: ValidatedEvent<RegisterInput>): Promise<APIGatewayProxyResult> {
  const { login, password, name, email } = event.validatedBody!;

  // Create JWT (no actual database persistence - user info is self-contained in JWT)
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
