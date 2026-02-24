import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';
import { maybeSimulateError } from '../common/error-simulation';
import { CAMERAS } from '../common/data/cameras';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Error simulation
    const simulatedError = maybeSimulateError();
    if (simulatedError) return simulatedError;

    return successResponse(200, { data: CAMERAS });
  } catch (error) {
    console.error('Error in get-cameras handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
