import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';
import { maybeSimulateError } from '../common/error-simulation';
import { DETAILS } from '../common/data/details';
import { petDetailParamsSchema } from '../common/validation-schemas';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Error simulation
    const simulatedError = maybeSimulateError();
    if (simulatedError) return simulatedError;

    if (!event.pathParameters?.id) {
      return errorResponse(400, 'Pet ID is required');
    }

    // Validate with Zod schema
    const validationResult = petDetailParamsSchema.safeParse({ id: event.pathParameters.id });
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => err.message).join(', ');
      return errorResponse(400, errors);
    }

    const id = validationResult.data.id;

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
