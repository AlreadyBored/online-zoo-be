import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';
import { signToken } from '../common/auth-utils';
import { MOCK_USERS } from '../common/data/users';
import type { LoginPayload } from '../common/types';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return errorResponse(400, 'Request body is required');
    }

    const payload: LoginPayload = JSON.parse(event.body);
    const { login, password } = payload;

    if (!login || !password) {
      return errorResponse(400, 'Login and password are required');
    }

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
  } catch (error) {
    console.error('Error in auth-login handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
