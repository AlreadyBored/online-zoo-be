import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    return successResponse(200, {
      message: 'Online Zoo API is running!',
      data: {
        version: '1.0.0',
        endpoints: {
          pets: {
            'GET /pets': 'Get all pets (id, name, commonName, description)',
            'GET /pets/{id}': 'Get detailed pet information by ID (includes coordinates)',
          },
          feedback: {
            'GET /feedback': 'Get all user feedback',
          },
          cameras: {
            'GET /cameras': 'Get all camera information',
          },
          auth: {
            'POST /auth/register': 'Register a new user (returns JWT)',
            'POST /auth/login': 'Login user (returns JWT)',
            'GET /auth/profile': 'Get current user profile (requires Bearer token)',
          },
          donations: {
            'POST /donations': 'Submit a donation',
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in api-info handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
