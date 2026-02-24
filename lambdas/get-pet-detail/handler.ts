import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';
import { maybeSimulateError } from '../common/error-simulation';
import { DETAILS } from '../common/data/details';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Error simulation
    const simulatedError = maybeSimulateError();
    if (simulatedError) return simulatedError;

    const petId = event.pathParameters?.id;
    if (!petId) {
      return errorResponse(400, 'Pet ID is required');
    }

    const id = parseInt(petId, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'Invalid pet ID');
    }

    const petDetail = DETAILS.find((detail) => detail.id === id);
    if (!petDetail) {
      return errorResponse(404, `Pet with ID ${id} not found`);
    }

    return successResponse(200, { data: petDetail });
  } catch (error) {
    console.error('Error in get-pet-detail handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
