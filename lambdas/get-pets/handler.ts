import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../lib/response';
import { maybeSimulateError } from '../../lib/error-simulation';
import { PETS } from '../../lib/data/pets';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Error simulation
    const simulatedError = maybeSimulateError();
    if (simulatedError) return simulatedError;

    return successResponse(200, { data: PETS });
  } catch (error) {
    console.error('Error in get-pets handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
