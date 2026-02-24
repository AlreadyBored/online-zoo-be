import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';
import { signToken } from '../common/auth-utils';
import type { RegisterPayload } from '../common/types';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return errorResponse(400, 'Request body is required');
    }

    const payload: RegisterPayload = JSON.parse(event.body);

    // Validation
    const { login, password, name, email } = payload;

    if (!login || !password || !name || !email) {
      return errorResponse(400, 'All fields are required: login, password, name, email');
    }

    // Login validation: min 3 chars, starts with letter, only English letters
    if (login.length < 3 || !/^[A-Za-z][A-Za-z]*$/.test(login)) {
      return errorResponse(400, 'Login must be at least 3 characters, start with a letter, and contain only English letters');
    }

    // Password validation: min 6 chars, at least 1 special character
    if (password.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return errorResponse(400, 'Password must be at least 6 characters and contain at least 1 special character');
    }

    // Name validation: min 3 chars, only English letters and spaces
    if (name.length < 3 || !/^[A-Za-z\s]+$/.test(name)) {
      return errorResponse(400, 'Name must be at least 3 characters and contain only English letters and spaces');
    }

    // Email validation: basic format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse(400, 'Invalid email format');
    }

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
