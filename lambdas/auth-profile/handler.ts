import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../lib/response';
import { extractToken, verifyToken } from '../../lib/auth-utils';

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

    return successResponse(200, { data: user });
  } catch (error) {
    console.error('Error in auth-profile handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
