import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../common/response';
import { maybeSimulateError } from '../common/error-simulation';
import { PETS } from '../common/data/pets';
import type { DonationPayload } from '../common/types';
import { randomUUID } from 'crypto';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Error simulation
    const simulatedError = maybeSimulateError();
    if (simulatedError) return simulatedError;

    if (!event.body) {
      return errorResponse(400, 'Request body is required');
    }

    const payload: DonationPayload = JSON.parse(event.body);
    const { name, email, amount, petId } = payload;

    // Validation
    if (!name || !email || amount === undefined || petId === undefined) {
      return errorResponse(400, 'All fields are required: name, email, amount, petId');
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return errorResponse(400, 'Amount must be a positive number');
    }

    if (typeof petId !== 'number') {
      return errorResponse(400, 'Invalid petId');
    }

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
