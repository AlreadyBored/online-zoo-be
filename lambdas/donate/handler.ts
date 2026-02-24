import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';
import { maybeSimulateError } from '../common/error-simulation';
import { PETS } from '../common/data/pets';
import { donationSchema } from '../common/validation-schemas';
import { randomUUID } from 'crypto';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Error simulation
    const simulatedError = maybeSimulateError();
    if (simulatedError) return simulatedError;

    if (!event.body) {
      return errorResponse(400, 'Request body is required');
    }

    const body = JSON.parse(event.body);

    // Validate with Zod schema
    const validationResult = donationSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return errorResponse(400, errors);
    }

    const { name, email, amount, petId } = validationResult.data;

    // Check if pet exists
    const pet = PETS.find((p) => p.id === petId);
    if (!pet) {
      return errorResponse(404, `Pet with ID ${petId} not found`);
    }

    // Generate donation ID
    const donationId = randomUUID();

    console.log(`Donation received: ${donationId}`, {
      name,
      email,
      amount,
      petId,
      petName: pet.name,
    });

    return successResponse(201, {
      data: {
        message: `Thank you for your donation of ${amount} to ${pet.name}!`,
        donationId,
      },
    });
  } catch (error) {
    console.error('Error in donate handler:', error);
    return errorResponse(500, 'Internal server error');
  }
}
