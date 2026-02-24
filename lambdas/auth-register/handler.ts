import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';
import { signToken } from '../common/auth-utils';
import { registerSchema } from '../common/validation-schemas';
import { ZodError } from 'zod';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return errorResponse(400, 'Request body is required');
    }

    const body = JSON.parse(event.body);

    // Validate with Zod schema
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return errorResponse(400, errors);
    }

    const { login, password, name, email } = validationResult.data;

    // Create JWT (no actual database persistence - user info is self-contained in JWT)
    const token = signToken({ login, name, email });

    return successResponse(201, {
      data: {
        access_token: token,
        user: { login, name, email },
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error in auth-register handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
