import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../lib/response';
import { extractToken, verifyToken } from '../../lib/auth-utils';
import { getUserByLogin } from '../../lib/user-store';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return errorResponse(401, 'Unauthorized: Missing or invalid token');
    }

    const user = verifyToken(token);
    if (!user) {
      return errorResponse(401, 'Unauthorized: Invalid or expired token');
    }

    const requestedLogin = event.queryStringParameters?.login || event.pathParameters?.login;
    if (requestedLogin && requestedLogin !== user.login) {
      return errorResponse(403, 'Forbidden: Token does not belong to requested user');
    }

    const persistedUser = await getUserByLogin(user.login);
    if (!persistedUser) {
      return errorResponse(401, 'Unauthorized: User does not exist');
    }

    return successResponse(200, {
      data: {
        login: persistedUser.login,
        name: persistedUser.name,
        email: persistedUser.email,
      },
    });
  } catch (error) {
    console.error('Error in auth-profile handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
